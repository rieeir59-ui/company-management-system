
'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

interface Row {
    id: number;
    itemNo: string;
    description: string;
    scheduledValue: number;
    fromPrevious: number;
    thisPeriod: number;
    materialsStored: number;
}

const initialRow: Omit<Row, 'id'> = {
    itemNo: '',
    description: '',
    scheduledValue: 0,
    fromPrevious: 0,
    thisPeriod: 0,
    materialsStored: 0,
};

export default function ContinuationSheetPage() {
    const image = PlaceHolderImages.find(p => p.id === 'continuation-sheet');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    
    const [rows, setRows] = useState<Row[]>([{ id: 1, ...initialRow }]);
    const [applicationNumber, setApplicationNumber] = useState('');
    const [applicationDate, setApplicationDate] = useState('');
    const [periodTo, setPeriodTo] = useState('');
    const [architectsProjectNo, setArchitectsProjectNo] = useState('');
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        setProjectName(`App #${applicationNumber}`);
    }, [applicationNumber]);

    const handleRowChange = (id: number, field: keyof Row, value: string | number) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const addRow = () => {
        setRows([...rows, { id: Date.now(), ...initialRow }]);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const totals = useMemo(() => {
        return rows.reduce((acc, row) => {
            acc.scheduledValue += Number(row.scheduledValue) || 0;
            acc.fromPrevious += Number(row.fromPrevious) || 0;
            acc.thisPeriod += Number(row.thisPeriod) || 0;
            acc.materialsStored += Number(row.materialsStored) || 0;
            const totalCompleted = (Number(row.fromPrevious) || 0) + (Number(row.thisPeriod) || 0) + (Number(row.materialsStored) || 0);
            acc.totalCompleted += totalCompleted;
            return acc;
        }, { scheduledValue: 0, fromPrevious: 0, thisPeriod: 0, materialsStored: 0, totalCompleted: 0 });
    }, [rows]);

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            category: 'Continuation Sheet',
            items: rows.map(row => JSON.stringify(row))
        };
        
        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Continuation Sheet',
                projectName: projectName,
                data: [dataToSave],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The continuation sheet has been saved.' });
            setIsSaveOpen(false);
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
        let yPos = 15;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTINUATION SHEET', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text(`Application Number: ${applicationNumber}`, 14, yPos);
        doc.text(`Application Date: ${applicationDate}`, 150, yPos);
        yPos += 7;
        doc.text(`Period To: ${periodTo}`, 14, yPos);
        doc.text(`Architect's Project No: ${architectsProjectNo}`, 150, yPos);
        yPos += 10;

        const head = [
            ['Item No.', 'Description of Work', 'Scheduled Value', 'From Previous Application', 'This Period', 'Materials Stored', 'Total to Date', '% (G/C)', 'Balance to Finish']
        ];
        
        const body = rows.map(row => {
            const C = Number(row.scheduledValue) || 0;
            const D = Number(row.fromPrevious) || 0;
            const E = Number(row.thisPeriod) || 0;
            const F = Number(row.materialsStored) || 0;
            const G = D + E + F;
            const H = C > 0 ? ((G / C) * 100).toFixed(2) + '%' : '0%';
            const I = C - G;

            return [
                row.itemNo,
                row.description,
                C.toFixed(2),
                D.toFixed(2),
                E.toFixed(2),
                F.toFixed(2),
                G.toFixed(2),
                H,
                I.toFixed(2)
            ];
        });

        doc.autoTable({
            head: head,
            body: body,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [45, 95, 51], fontSize: 8 },
            styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }


        doc.save('continuation-sheet.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Continuation Sheet"
                description="Manage continuation sheets for project documentation."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">Continuation Sheet</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div><Label htmlFor="applicationNumber">Application Number</Label><Input id="applicationNumber" value={applicationNumber} onChange={e => setApplicationNumber(e.target.value)} /></div>
                        <div><Label htmlFor="applicationDate">Application Date</Label><Input id="applicationDate" type="date" value={applicationDate} onChange={e => setApplicationDate(e.target.value)} /></div>
                        <div><Label htmlFor="periodTo">Period To</Label><Input id="periodTo" type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} /></div>
                        <div><Label htmlFor="architectsProjectNo">Architect's Project No</Label><Input id="architectsProjectNo" value={architectsProjectNo} onChange={e => setArchitectsProjectNo(e.target.value)} /></div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item No.</TableHead>
                                    <TableHead>Description of Work</TableHead>
                                    <TableHead>Scheduled Value</TableHead>
                                    <TableHead>From Previous</TableHead>
                                    <TableHead>This Period</TableHead>
                                    <TableHead>Materials Stored</TableHead>
                                    <TableHead>Total to Date</TableHead>
                                    <TableHead>%</TableHead>
                                    <TableHead>Balance to Finish</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map(row => {
                                    const C = Number(row.scheduledValue) || 0;
                                    const D = Number(row.fromPrevious) || 0;
                                    const E = Number(row.thisPeriod) || 0;
                                    const F = Number(row.materialsStored) || 0;
                                    const G = D + E + F;
                                    const H = C > 0 ? ((G / C) * 100).toFixed(2) + '%' : '0%';
                                    const I = C - G;
                                    
                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell><Input value={row.itemNo} onChange={e => handleRowChange(row.id, 'itemNo', e.target.value)} /></TableCell>
                                            <TableCell><Input value={row.description} onChange={e => handleRowChange(row.id, 'description', e.target.value)} /></TableCell>
                                            <TableCell><Input type="number" value={row.scheduledValue} onChange={e => handleRowChange(row.id, 'scheduledValue', e.target.value)} /></TableCell>
                                            <TableCell><Input type="number" value={row.fromPrevious} onChange={e => handleRowChange(row.id, 'fromPrevious', e.target.value)} /></TableCell>
                                            <TableCell><Input type="number" value={row.thisPeriod} onChange={e => handleRowChange(row.id, 'thisPeriod', e.target.value)} /></TableCell>
                                            <TableCell><Input type="number" value={row.materialsStored} onChange={e => handleRowChange(row.id, 'materialsStored', e.target.value)} /></TableCell>
                                            <TableCell>{G.toFixed(2)}</TableCell>
                                            <TableCell>{H}</TableCell>
                                            <TableCell>{I.toFixed(2)}</TableCell>
                                            <TableCell><Button variant="destructive" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={addRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                        <div className="flex gap-4">
                             <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Save Record</DialogTitle>
                                        <DialogDescription>
                                            Please provide a name for this record.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                        <Label htmlFor="recordName">File Name</Label>
                                        <Input id="recordName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                        <Button onClick={handleSave}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="w-full font-bold grid grid-cols-10 gap-4 text-sm">
                        <div className="col-span-2 text-right">Totals:</div>
                        <div>{totals.scheduledValue.toFixed(2)}</div>
                        <div>{totals.fromPrevious.toFixed(2)}</div>
                        <div>{totals.thisPeriod.toFixed(2)}</div>
                        <div>{totals.materialsStored.toFixed(2)}</div>
                        <div>{totals.totalCompleted.toFixed(2)}</div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
