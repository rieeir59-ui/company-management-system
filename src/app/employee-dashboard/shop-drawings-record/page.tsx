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
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

type RecordRow = {
  id: number;
  date: string;
  recordNo: string;
  specSectionNo: string;
  drawingNo: string;
  contractorSubcontractorTrade: string;
  title: string;
  referredTo: string;
  dateSent: string;
  numCopies: string;
  dateRetdReferred: string;
  action: string[];
  dateRetdAction: string;
  copiesTo: string[];
};

const initialRow: Omit<RecordRow, 'id'> = {
  date: '', recordNo: '', specSectionNo: '', drawingNo: '', contractorSubcontractorTrade: '', 
  title: '', referredTo: '', dateSent: '', numCopies: '',
  dateRetdReferred: '', action: [], dateRetdAction: '', copiesTo: []
};


export default function ShopDrawingsRecordPage() {
    const image = PlaceHolderImages.find(p => p.id === 'shop-drawings-record');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    const [projectName, setProjectName] = useState('');
    const [architectsProjectNo, setArchitectsProjectNo] = useState('');
    const [contractor, setContractor] = useState('');
    const [rows, setRows] = useState<RecordRow[]>([]);

    const addRow = () => {
        setRows([...rows, { id: Date.now(), ...initialRow }]);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const handleRowChange = (id: number, field: keyof RecordRow, value: string | string[]) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    
    const handleActionCheckboxChange = (id: number, value: string, checked: boolean) => {
        const currentActions = rows.find(row => row.id === id)?.action || [];
        const newActions = checked 
            ? [...currentActions, value] 
            : currentActions.filter(v => v !== value);
        handleRowChange(id, 'action', newActions);
    };

    const handleCopiesCheckboxChange = (id: number, value: string, checked: boolean) => {
        const currentValues = rows.find(row => row.id === id)?.copiesTo || [];
        const newValues = checked
            ? [...currentValues, value]
            : currentValues.filter(v => v !== value);
        handleRowChange(id, 'copiesTo', newValues);
    };

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Shop Drawing and Sample Record',
            projectName: projectName || 'Untitled Record',
            data: {
                category: 'Shop Drawing and Sample Record',
                header: { projectName, architectsProjectNo, contractor },
                items: rows.map(row => JSON.stringify(row)),
            },
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), dataToSave);
            toast({ title: 'Record Saved', description: 'The shop drawing record has been saved.' });
        } catch (serverError) {
            const permissionError = new FirestorePermissionError({
                path: 'savedRecords',
                operation: 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SHOP DRAWING AND SAMPLE RECORD', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Project: ${projectName}`, 14, yPos);
        doc.text(`Architect's Project No: ${architectsProjectNo}`, 150, yPos);
        yPos += 7;
        doc.text(`Contractor: ${contractor}`, 14, yPos);
        yPos += 10;
        
        const head = [
            [
                { content: 'Date Record', rowSpan: 2 },
                { content: 'Spec. Section No. / Shop Drawing or Sample Drawing No. / Title', rowSpan: 2 },
                { content: 'Contractor\nSubcontractor\nTrade', rowSpan: 2 },
                { content: '# Record', rowSpan: 2 },
                { content: 'Referred', colSpan: 4 },
                { content: 'Action', colSpan: 4 },
                { content: 'Date Ret\'d.', rowSpan: 2 },
                { content: 'Copies To', colSpan: 4 },
            ],
            ['To', 'Date Sent', '# Copies', "Date Ret'd.", 'Approved', 'App\'d as Noted', 'Revise & Resubmit', 'Not Approved', 'Contractor', 'Owner', 'Field', 'File']
        ];
        
        const body = rows.map(row => [
            row.date,
            `${row.specSectionNo}\n${row.drawingNo}\n\n${row.title}`,
            row.contractorSubcontractorTrade,
            row.recordNo,
            row.referredTo,
            row.dateSent,
            row.numCopies,
            row.dateRetdReferred,
            row.action.includes('approved') ? '✓' : '',
            row.action.includes('approved_as_noted') ? '✓' : '',
            row.action.includes('revise_resubmit') ? '✓' : '',
            row.action.includes('not_approved') ? '✓' : '',
            row.dateRetdAction,
            row.copiesTo.includes('Contractor') ? '✓' : '',
            row.copiesTo.includes('Owner') ? '✓' : '',
            row.copiesTo.includes('Field') ? '✓' : '',
            row.copiesTo.includes('File') ? '✓' : '',
        ]);

        doc.autoTable({
            head: head,
            body: body,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold', halign: 'center', valign: 'middle' },
            styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' },
            didParseCell: function (data) {
                // Center align the '✓' marks
                const checkboxColumns = [8, 9, 10, 11, 13, 14, 15, 16];
                if (data.body && checkboxColumns.includes(data.column.index)) {
                    data.cell.styles.halign = 'center';
                }
            }
        });
        
        doc.save('shop-drawing-record.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Shop Drawings Record"
                description="Maintain a record of all shop drawings."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                 <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl text-primary">Shop Drawing and Sample Record</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <form className="space-y-4 mb-6 p-4 border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="project">Project</Label><Input id="project" value={projectName} onChange={e => setProjectName(e.target.value)} /></div>
                            <div><Label htmlFor="architects_no">Architect's Project No</Label><Input id="architects_no" value={architectsProjectNo} onChange={e => setArchitectsProjectNo(e.target.value)} /></div>
                            <div className="md:col-span-2"><Label htmlFor="contractor_main">Contractor</Label><Input id="contractor_main" value={contractor} onChange={e => setContractor(e.target.value)} /></div>
                        </div>
                    </form>

                    <div className="space-y-6">
                        {rows.map((row, index) => (
                           <Card key={row.id} className="p-4 relative">
                             <CardHeader className="p-2">
                               <CardTitle className="text-lg">Record #{index + 1}</CardTitle>
                             </CardHeader>
                             <CardContent className="p-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Date Record</Label><Input type="date" value={row.date} onChange={e => handleRowChange(row.id, 'date', e.target.value)} /></div>
                                    <div className="space-y-2"><Label># Record</Label><Input value={row.recordNo} onChange={e => handleRowChange(row.id, 'recordNo', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Trade</Label><Input placeholder="Contractor/Sub/Trade" value={row.contractorSubcontractorTrade} onChange={e => handleRowChange(row.id, 'contractorSubcontractorTrade', e.target.value)} /></div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Spec. / Drawing / Title</Label>
                                  <Input placeholder="Spec. Section No." value={row.specSectionNo} onChange={e => handleRowChange(row.id, 'specSectionNo', e.target.value)} />
                                  <Input placeholder="Shop/Sample Drawing No." value={row.drawingNo} onChange={e => handleRowChange(row.id, 'drawingNo', e.target.value)} />
                                  <Textarea placeholder="Title" value={row.title} onChange={e => handleRowChange(row.id, 'title', e.target.value)} rows={2} />
                                </div>
                                <div className="p-4 border rounded-md">
                                    <h4 className="font-semibold mb-2">Referred</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2"><Label>To</Label><Input value={row.referredTo} onChange={e => handleRowChange(row.id, 'referredTo', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Date Sent</Label><Input type="date" value={row.dateSent} onChange={e => handleRowChange(row.id, 'dateSent', e.target.value)} /></div>
                                        <div className="space-y-2"><Label># Copies</Label><Input type="number" value={row.numCopies} onChange={e => handleRowChange(row.id, 'numCopies', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Date Ret'd.</Label><Input type="date" value={row.dateRetdReferred} onChange={e => handleRowChange(row.id, 'dateRetdReferred', e.target.value)} /></div>
                                    </div>
                                </div>
                                 <div className="p-4 border rounded-md">
                                    <h4 className="font-semibold mb-2">Action</h4>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex items-center gap-2"><Checkbox checked={row.action.includes('approved')} onCheckedChange={(c) => handleActionCheckboxChange(row.id, 'approved', !!c)} /><Label>Approved</Label></div>
                                        <div className="flex items-center gap-2"><Checkbox checked={row.action.includes('approved_as_noted')} onCheckedChange={(c) => handleActionCheckboxChange(row.id, 'approved_as_noted', !!c)} /><Label>App'd as Noted</Label></div>
                                        <div className="flex items-center gap-2"><Checkbox checked={row.action.includes('revise_resubmit')} onCheckedChange={(c) => handleActionCheckboxChange(row.id, 'revise_resubmit', !!c)} /><Label>Revise & Resubmit</Label></div>
                                        <div className="flex items-center gap-2"><Checkbox checked={row.action.includes('not_approved')} onCheckedChange={(c) => handleActionCheckboxChange(row.id, 'not_approved', !!c)} /><Label>Not Approved</Label></div>
                                        <div className="space-y-2 flex-1 min-w-[150px]"><Label className="sr-only">Date Ret'd Action</Label><Input type="date" value={row.dateRetdAction} onChange={e => handleRowChange(row.id, 'dateRetdAction', e.target.value)} /></div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-md">
                                    <h4 className="font-semibold mb-2">Copies To</h4>
                                     <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('Contractor')} onCheckedChange={(c) => handleCopiesCheckboxChange(row.id, 'Contractor', !!c)} /><Label>Contractor</Label></div>
                                        <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('Owner')} onCheckedChange={(c) => handleCopiesCheckboxChange(row.id, 'Owner', !!c)} /><Label>Owner</Label></div>
                                        <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('Field')} onCheckedChange={(c) => handleCopiesCheckboxChange(row.id, 'Field', !!c)} /><Label>Field</Label></div>
                                        <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('File')} onCheckedChange={(c) => handleCopiesCheckboxChange(row.id, 'File', !!c)} /><Label>File</Label></div>
                                     </div>
                                </div>

                             </CardContent>
                              <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4" /></Button>
                           </Card>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <Button onClick={addRow} variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button>
                        <div className="flex gap-4">
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save All Records</Button>
                            <Button onClick={handleDownloadPdf} variant="secondary"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
