'use client';

import { useState, useMemo } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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

export default function Page() {
    const image = PlaceHolderImages.find(p => p.id === 'change-order');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [recordName, setRecordName] = useState('');

    const [formState, setFormState] = useState({
        project: '',
        fieldReportNo: '',
        date: '',
        architectsProjectNo: '',
        contractor: '',
        contractFor: '',
        contractDate: '',
        description: '',
        originalSum: 0,
        netChange: 0,
        changeType: 'increased',
        changeAmount: 0,
        timeChangeType: 'increased',
        timeChangeDays: 0,
        architectBy: '',
        architectDate: '',
        architectAddress: '',
        contractorBy: '',
        contractorDate: '',
        contractorAddress: '',
        ownerBy: '',
        ownerDate: '',
        ownerAddress: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        if (name === 'project') {
            setRecordName(value);
        }
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleRadioChange = (name: string, value: string) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const calculatedSums = useMemo(() => {
        const priorSum = formState.originalSum + formState.netChange;
        let newSum;
        switch (formState.changeType) {
            case 'increased': newSum = priorSum + formState.changeAmount; break;
            case 'decreased': newSum = priorSum - formState.changeAmount; break;
            default: newSum = priorSum; 
        }
        return { priorSum, newSum };
    }, [formState.originalSum, formState.netChange, formState.changeType, formState.changeAmount]);


    const handleSave = () => {
         if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }
        
        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Change Order',
            projectName: recordName || 'Untitled Change Order',
            data: {
                category: 'Change Order',
                items: [
                    ...Object.entries(formState).map(([key, value]) => `${key}: ${value}`),
                    `priorSum: ${calculatedSums.priorSum}`,
                    `newSum: ${calculatedSums.newSum}`,
                ],
            },
            createdAt: serverTimestamp(),
        };

        addDoc(collection(firestore, 'savedRecords'), dataToSave)
            .then(() => {
                toast({ title: 'Record Saved', description: 'The change order has been saved.' });
                setIsSaveOpen(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: 'savedRecords',
                    operation: 'create',
                    requestResourceData: dataToSave,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";

        let y = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CHANGE ORDER', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 15;

        doc.setFontSize(10);
        doc.autoTable({
            startY: y,
            theme: 'plain',
            body: [
                [`Project: ${formState.project}`, `Field Report No. ${formState.fieldReportNo}`],
                [``, `Date: ${formState.date}`],
                [`To: (Contractor) ${formState.contractor}`, `Architect's Project No: ${formState.architectsProjectNo}`],
                [``, `Contract For: ${formState.contractFor}`],
                [``, `Contract Date: ${formState.contractDate}`]
            ],
            styles: {
                headStyles: { fillColor: [45, 95, 51] },
            }
        });
        y = (doc as any).autoTable.previous.finalY + 10;
        
        doc.text('This Contract is changed as follows:', 14, y);
        y += 7;
        const descLines = doc.splitTextToSize(formState.description, doc.internal.pageSize.width - 28);
        doc.text(descLines, 14, y);
        y += descLines.length * 5 + 10;

        doc.text('Not Valid until signed by the Owner, Architect and Contractor.', 14, y);
        y += 10;

        doc.autoTable({
            startY: y,
            theme: 'plain',
            styles: { cellPadding: 2 },
            body: [
                ['The original (Contract Sum) (Guaranteed Maximum Price) was', `Rs. ${formState.originalSum.toFixed(2)}`],
                ['Net change by previously authorized Change Orders', `Rs. ${formState.netChange.toFixed(2)}`],
                ['The (Contract Sum) (Guaranteed Maximum Price) prior to this Change Order was', `Rs. ${calculatedSums.priorSum.toFixed(2)}`],
                [`The (Contract Sum) (Guaranteed Maximum Price) will be (${formState.changeType}) by this Change Order in the amount of`, `Rs. ${formState.changeAmount.toFixed(2)}`],
                ['The new (Contract Sum) (Guaranteed Maximum Price) including this Change Order will be', `Rs. ${calculatedSums.newSum.toFixed(2)}`],
                [`The Contract Time will be (${formState.timeChangeType}) by (${formState.timeChangeDays}) days.`, ''],
                ['The date of Substantial Completion as the date of this Change Order therefore is:', ''],
            ]
        });
        y = (doc as any).autoTable.previous.finalY + 5;

        doc.setFontSize(8);
        const noteText = 'NOTE: This summary does not reflect changes in the Contract Sum, Contract Time or Guaranteed Maximum Price which have been authorized by Construction Change Directive.';
        const splitNote = doc.splitTextToSize(noteText, doc.internal.pageSize.width - 28);
        doc.text(splitNote, 14, y);
        y += (splitNote.length * 4) + 5;
        
        const signatureLine = (label: string, x: number, currentY: number) => {
            doc.line(x, currentY + 12, x + 50, currentY + 12);
            doc.text(label, x, currentY + 18);
        };
        
        signatureLine("Owner", 14, y);
        signatureLine("Architect", 80, y);
        signatureLine("Contractor", 146, y);
        y += 25;
        signatureLine("Field", 14, y);
        signatureLine("Other", 80, y);

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }


        doc.save('change-order.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Change Order"
        description="Create and track change orders."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
            <CardTitle className="text-center font-headline text-3xl text-primary">CHANGE ORDER</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="project">Project (Name, Address)</Label><Input id="project" name="project" value={formState.project} onChange={handleChange} /></div>
                    <div><Label htmlFor="fieldReportNo">Field Report No.</Label><Input id="fieldReportNo" name="fieldReportNo" value={formState.fieldReportNo} onChange={handleChange} /></div>
                    <div><Label htmlFor="date">Date</Label><Input id="date" name="date" type="date" value={formState.date} onChange={handleChange} /></div>
                    <div><Label htmlFor="architectsProjectNo">Architect's Project No</Label><Input id="architectsProjectNo" name="architectsProjectNo" value={formState.architectsProjectNo} onChange={handleChange} /></div>
                    <div><Label htmlFor="contractor">To: (Contractor)</Label><Input id="contractor" name="contractor" value={formState.contractor} onChange={handleChange} /></div>
                    <div><Label htmlFor="contractFor">Contract For:</Label><Input id="contractFor" name="contractFor" value={formState.contractFor} onChange={handleChange} /></div>
                    <div><Label htmlFor="contractDate">Contract Date:</Label><Input id="contractDate" name="contractDate" type="date" value={formState.contractDate} onChange={handleChange} /></div>
                </div>

                <div>
                    <Label htmlFor="description">This Contract is changed as follows:</Label>
                    <Textarea id="description" name="description" value={formState.description} onChange={handleChange} />
                </div>
                
                <p className="text-center font-semibold text-sm">Not Valid until signed by the Owner, Architect and Contractor.</p>

                <div className="space-y-2 border p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <Label htmlFor="originalSum">The original (Contract Sum) was</Label>
                        <div className="col-span-2"><Input id="originalSum" name="originalSum" type="number" value={formState.originalSum} onChange={handleNumberChange} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <Label htmlFor="netChange">Net change by previously authorized Change Orders</Label>
                        <div className="col-span-2"><Input id="netChange" name="netChange" type="number" value={formState.netChange} onChange={handleNumberChange} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <Label>The (Contract Sum) prior to this Change Order was</Label>
                        <div className="col-span-2 font-bold">Rs. {calculatedSums.priorSum.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <Label>The (Contract Sum) will be</Label>
                        <div className="col-span-2 flex items-center gap-4">
                           <RadioGroup name="changeType" value={formState.changeType} onValueChange={(v) => handleRadioChange('changeType', v)} className="flex gap-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="increased" id="ct_inc"/><Label htmlFor="ct_inc">increased</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="decreased" id="ct_dec"/><Label htmlFor="ct_dec">decreased</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="unchanged" id="ct_unc"/><Label htmlFor="ct_unc">unchanged</Label></div>
                           </RadioGroup>
                           <span>by this Change Order in the amount of</span>
                           <Input name="changeAmount" type="number" value={formState.changeAmount} onChange={handleNumberChange} className="w-40" />
                        </div>
                    </div>
                     <div className="grid grid-cols-3 gap-4 items-center">
                        <Label>The new (Contract Sum) including this Change Order will be</Label>
                        <div className="col-span-2 font-bold">Rs. {calculatedSums.newSum.toFixed(2)}</div>
                    </div>
                     <div className="grid grid-cols-3 gap-4 items-center">
                        <Label>The Contract Time will be</Label>
                        <div className="col-span-2 flex items-center gap-4">
                            <RadioGroup name="timeChangeType" value={formState.timeChangeType} onValueChange={(v) => handleRadioChange('timeChangeType', v)} className="flex gap-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="increased" id="tct_inc"/><Label htmlFor="tct_inc">increased</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="decreased" id="tct_dec"/><Label htmlFor="tct_dec">decreased</Label></div>
                            </RadioGroup>
                            <span>by</span>
                            <Input name="timeChangeDays" type="number" value={formState.timeChangeDays} onChange={handleNumberChange} className="w-24" />
                            <span>days.</span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">NOTE: This summary does not reflect changes in the Contract Sum, Contract Time or Guaranteed Maximum Price which have been authorized by Construction Change Directive.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 pt-8">
                    <div className="space-y-2"><div className="h-16 border-b border-foreground"></div><p className="text-center font-semibold">Owner</p></div>
                    <div className="space-y-2"><div className="h-16 border-b border-foreground"></div><p className="text-center font-semibold">Architect</p></div>
                    <div className="space-y-2"><div className="h-16 border-b border-foreground"></div><p className="text-center font-semibold">Contractor</p></div>
                    <div className="space-y-2"><div className="h-16 border-b border-foreground"></div><p className="text-center font-semibold">Field</p></div>
                    <div className="space-y-2"><div className="h-16 border-b border-foreground"></div><p className="text-center font-semibold">Other</p></div>
                </div>


                <div className="flex justify-end gap-4 mt-8">
                    <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
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
                                <Input id="recordName" value={recordName} onChange={(e) => setRecordName(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleSave}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button type="button" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
