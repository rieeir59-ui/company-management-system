'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

type ConsultantRow = {
  id: number;
  work: string;
  firm: string;
  address: string;
  phone: string;
  representative: string;
};

const initialRow: Omit<ConsultantRow, 'id'> = {
  work: '', firm: '', address: '', phone: '', representative: ''
};

export default function ListOfSubConsultantsPage() {
    const image = PlaceHolderImages.find(p => p.id === 'list-of-sub-consultants');
    const { toast } = useToast();
    
    const [projectName, setProjectName] = useState('');
    const [projectAddress, setProjectAddress] = useState('');
    const [architect, setArchitect] = useState('');
    const [architectsProjectNo, setArchitectsProjectNo] = useState('');
    const [date, setDate] = useState('');
    const [toConsultant, setToConsultant] = useState('');
    const [rows, setRows] = useState<ConsultantRow[]>([{ id: 1, ...initialRow }]);

    const addRow = () => {
        setRows([...rows, { id: Date.now(), ...initialRow }]);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter(row => row.id !== id));
    };
    
    const handleRowChange = (id: number, field: keyof ConsultantRow, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleSave = () => {
        toast({ title: 'Record Saved', description: 'The list of sub-consultants has been saved.' });
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('LIST OF SUB-CONSULTANTS', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`Project: ${projectName}, ${projectAddress}`, 14, yPos);
        doc.text(`Architect: ${architect}`, 120, yPos);
        yPos += 7;
        doc.text(`Architects Project No: ${architectsProjectNo}`, 14, yPos);
        doc.text(`Date: ${date}`, 120, yPos);
        yPos += 10;

        doc.text('To: (Consultant)', 14, yPos);
        yPos += 5;
        doc.rect(14, yPos, 90, 25);
        const toLines = doc.splitTextToSize(toConsultant, 85);
        doc.text(toLines, 16, yPos + 5);
        yPos += 35;
        
        const note = "List Sub-Consultants and others proposed to be employed on the above Project as required by the bidding documents.\n(To be filled out by the Contractor and returned to the Architect.)";
        const splitNote = doc.splitTextToSize(note, doc.internal.pageSize.width - 28);
        doc.text(splitNote, 14, yPos);
        yPos += splitNote.length * 5 + 10;
        
        const head = [['Work', 'Firm', 'Address', 'Phone', 'Representative']];
        const body = rows.map(row => [row.work, row.firm, row.address, row.phone, row.representative]);

        doc.autoTable({
            head: head,
            body: body,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [45, 95, 51] },
        });

        doc.save('list-of-sub-consultants.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="List Of Sub-consultants"
                description="Manage the list of sub-consultants."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">List of Sub-Consultants</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <form className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                                <Label htmlFor="project_name">Project (Name)</Label>
                                <Input id="project_name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                           </div>
                           <div>
                                <Label htmlFor="project_address">Project (Address)</Label>
                                <Input id="project_address" value={projectAddress} onChange={e => setProjectAddress(e.target.value)} />
                           </div>
                           <div>
                                <Label htmlFor="architect">Architect</Label>
                                <Input id="architect" value={architect} onChange={e => setArchitect(e.target.value)} />
                           </div>
                           <div>
                                <Label htmlFor="architects_no">Architect's Project No</Label>
                                <Input id="architects_no" value={architectsProjectNo} onChange={e => setArchitectsProjectNo(e.target.value)} />
                           </div>
                           <div>
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                           </div>
                           <div>
                                <Label htmlFor="to_consultant">To: (Consultant)</Label>
                                <Textarea id="to_consultant" rows={3} value={toConsultant} onChange={e => setToConsultant(e.target.value)} />
                           </div>
                        </div>
                    </form>
                    
                    <p className="text-sm text-muted-foreground my-4">List Sub-Consultants and others proposed to be employed on the above Project as required by the bidding documents. (To be filled out by the Contractor and returned to the Architect.)</p>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Work</TableHead>
                                    <TableHead>Firm</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Representative</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell><Input value={row.work} onChange={e => handleRowChange(row.id, 'work', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.firm} onChange={e => handleRowChange(row.id, 'firm', e.target.value)} /></TableCell>
                                        <TableCell><Textarea value={row.address} onChange={e => handleRowChange(row.id, 'address', e.target.value)} rows={1} /></TableCell>
                                        <TableCell><Input value={row.phone} onChange={e => handleRowChange(row.id, 'phone', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.representative} onChange={e => handleRowChange(row.id, 'representative', e.target.value)} /></TableCell>
                                        <TableCell><Button variant="destructive" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={addRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                        <div className="flex gap-4">
                            <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}