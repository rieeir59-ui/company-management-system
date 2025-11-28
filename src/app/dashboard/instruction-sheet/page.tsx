
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface InstructionRow {
  id: number;
  what: string;
  how: string;
  why: string;
}

export default function InstructionSheetPage() {
  const image = PlaceHolderImages.find(p => p.id === 'instruction-sheet');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();
  
  const [rows, setRows] = useState<InstructionRow[]>(
    Array.from({ length: 23 }, (_, i) => ({ id: i + 1, what: '', how: '', why: '' }))
  );
  const [header, setHeader] = useState({
    project: '',
    fieldReportNo: '',
    contract: '',
    architectsProjectNo: '',
    to: [] as string[]
  });

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeader(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (field: string) => {
    setHeader(prev => {
        const currentTo = prev.to;
        if (currentTo.includes(field)) {
            return { ...prev, to: currentTo.filter(item => item !== field) };
        }
        return { ...prev, to: [...currentTo, field] };
    });
  };

  const handleRowChange = (id: number, field: keyof Omit<InstructionRow, 'id'>, value: string) => {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleSave = async () => {
    if (!firestore || !currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
        return;
    }

    const dataToSave = {
        category: 'Instruction Sheet',
        items: [
            `Project: ${header.project}`,
            `Field Report No: ${header.fieldReportNo}`,
            `Contract: ${header.contract}`,
            `Architects Project No: ${header.architectsProjectNo}`,
            `To: ${header.to.join(', ')}`,
            ...rows.map(r => `Row ${r.id}: What - ${r.what}, How - ${r.how}, Why - ${r.why}`)
        ],
    };

    try {
        await addDoc(collection(firestore, 'savedRecords'), {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Instruction Sheet',
            projectName: header.project || 'Untitled Instruction Sheet',
            data: [dataToSave],
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Record Saved', description: 'The instruction sheet has been saved.' });
    } catch (error) {
        console.error("Error saving document: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTRUCTION SHEET', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    (doc as any).autoTable({
        startY: yPos,
        theme: 'plain',
        body: [
            [`Project: ${header.project}`, `Field Report No: ${header.fieldReportNo}`],
            [`Contract: ${header.contract}`, `Architects Project No: ${header.architectsProjectNo}`]
        ]
    });
    yPos = (doc as any).autoTable.previous.finalY + 10;
    
    (doc as any).autoTable({
        head: [['What?', 'How?', 'Why?']],
        body: rows.map(row => [row.what, row.how, row.why]),
        startY: yPos,
        theme: 'grid'
    });
    yPos = (doc as any).autoTable.previous.finalY + 10;

    doc.text('TO:', 14, yPos);
    const recipients = ['Owner', 'Architect', 'Contractor', 'Field', 'Other'];
    recipients.forEach((recipient) => {
        const isChecked = header.to.includes(recipient);
        doc.text(`${isChecked ? '[X]' : '[ ]'} ${recipient}`, 25, yPos);
        yPos += 6;
    });

    yPos += 10; // Adjust spacing after recipient list

    const signatures = ['Owner', 'Architect', 'Contractor', 'Field', 'Other'];
    signatures.forEach((sig, i) => {
        const x = 14 + (i * 38);
        doc.line(x, yPos, x + 30, yPos);
        doc.text(sig, x + 10, yPos + 5);
    });

    doc.save('instruction-sheet.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Instruction Sheet"
        description="Provide clear instructions and reasoning."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
            <CardTitle className="text-center font-headline text-3xl text-primary">INSTRUCTION SHEET</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><Label>Project</Label><Input name="project" value={header.project} onChange={handleHeaderChange}/></div>
                <div><Label>Field Report No.</Label><Input name="fieldReportNo" value={header.fieldReportNo} onChange={handleHeaderChange}/></div>
                <div><Label>Contract</Label><Input name="contract" value={header.contract} onChange={handleHeaderChange}/></div>
                <div><Label>Architects Project No.</Label><Input name="architectsProjectNo" value={header.architectsProjectNo} onChange={handleHeaderChange}/></div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>What? (Important Steps)</TableHead>
                        <TableHead>How? (Key Points)</TableHead>
                        <TableHead>Why? (Reasons)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.id}>
                            <TableCell><Textarea value={row.what} onChange={e => handleRowChange(row.id, 'what', e.target.value)} rows={2} /></TableCell>
                            <TableCell><Textarea value={row.how} onChange={e => handleRowChange(row.id, 'how', e.target.value)} rows={2} /></TableCell>
                            <TableCell><Textarea value={row.why} onChange={e => handleRowChange(row.id, 'why', e.target.value)} rows={2} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div>
                    <Label className="font-bold">TO:</Label>
                    <div className="space-y-2 mt-2">
                        {['Owner', 'Architect', 'Contractor', 'Field', 'Other'].map(item => (
                            <div key={item} className="flex items-center gap-2">
                                <Checkbox id={`to_${item}`} checked={header.to.includes(item)} onCheckedChange={() => handleCheckboxChange(item)} />
                                <Label htmlFor={`to_${item}`}>{item}</Label>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <Label className="font-bold">Signatures:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                        {['Owner', 'Architect', 'Contractor', 'Field', 'Other'].map(item => (
                             <div key={item} className="space-y-2">
                                <div className="h-12 border-b border-foreground"></div>
                                <p className="text-center font-semibold">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-12">
                <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
