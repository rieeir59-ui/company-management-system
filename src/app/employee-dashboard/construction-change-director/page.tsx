
'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'construction-change-director');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();

  const [formState, setFormState] = useState({
    project: '',
    projectAddress: '',
    directiveNo: '',
    date: '',
    architectsProjectNo: '',
    toContractor: '',
    contractorAddress: '',
    contractFor: '',
    contractDate: '',
    description: '',
    adjustmentType: 'lumpSum' as 'lumpSum' | 'unitPrice' | 'asFollows',
    lumpSumType: 'increase' as 'increase' | 'decrease',
    lumpSumAmount: 0,
    unitPrice: 0,
    unitPricePer: '',
    asFollows: '',
    timeChangeType: 'adjusted' as 'adjusted' | 'unchanged',
    timeAdjustmentType: 'increase' as 'increase' | 'decrease',
    timeAdjustmentDays: 0,
    architectBy: '',
    architectAddress: '',
    architectDate: '',
    contractorBy: '',
    contractorDate: '',
    ownerBy: '',
    ownerAddress: '',
    ownerDate: '',
    distributeTo: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const handleRadioChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormState(prev => {
      const current = prev.distributeTo;
      if (checked) {
        return { ...prev, distributeTo: [...current, field] };
      } else {
        return { ...prev, distributeTo: current.filter(item => item !== field) };
      }
    });
  };

  const handleSave = () => {
    if (!firestore || !currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
        return;
    }

    const dataToSave = {
        employeeId: currentUser.record,
        employeeName: currentUser.name,
        fileName: 'Construction Change Directive',
        projectName: formState.project || 'Untitled Directive',
        data: [{
            category: 'Construction Change Directive',
            items: Object.entries(formState).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
        }],
        createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'savedRecords'), dataToSave)
        .then(() => {
            toast({ title: 'Record Saved', description: 'The directive has been saved.' });
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
    let y = 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSTRUCTION\nCHANGE DIRECTIVE', 14, y);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const checkboxYStart = y - 4;
    const distributionOptions = [
        { label: 'Owner', x: 140 },
        { label: 'Architect', x: 140 },
        { label: 'Contractor', x: 140 },
        { label: 'Field', x: 170 },
        { label: 'Other', x: 170 },
    ];

    let yOffset = 0;
    distributionOptions.forEach((opt, index) => {
        if (opt.x === 140) {
            doc.rect(opt.x, checkboxYStart + yOffset, 4, 4);
            if (formState.distributeTo.includes(opt.label)) doc.text('✓', opt.x + 0.5, checkboxYStart + 3 + yOffset);
            doc.text(opt.label, opt.x + 6, checkboxYStart + 3 + yOffset);
            yOffset += 6;
        }
    });
    
    yOffset = 6; // Reset for second column
    distributionOptions.forEach((opt, index) => {
         if (opt.x === 170) {
            doc.rect(opt.x, checkboxYStart + yOffset, 4, 4);
            if (formState.distributeTo.includes(opt.label)) doc.text('✓', opt.x + 0.5, checkboxYStart + 3 + yOffset);
            doc.text(opt.label, opt.x + 6, checkboxYStart + 3 + yOffset);
            yOffset += 6;
        }
    });

    y = 40;
    doc.autoTable({
        startY: y,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 0.5 },
        body: [
            [`Project: ${formState.project}\n(Name, Address) ${formState.projectAddress}`, `Directive No. ${formState.directiveNo}`],
            ['', `Date: ${formState.date}`],
            [`To Contractor: ${formState.toContractor}\n(Name, Address) ${formState.contractorAddress}`, `Architects Project No: ${formState.architectsProjectNo}`],
            ['', `Contract For: ${formState.contractFor}`],
            ['', `Contract Date: ${formState.contractDate}`]
        ],
        columnStyles: { 0: { cellWidth: 100 } }
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text('You are hereby directed to make the following change(s) in this Contract:', 14, y);
    y += 7;
    const descLines = doc.splitTextToSize(formState.description, doc.internal.pageSize.width - 28);
    doc.text(descLines, 14, y);
    y += descLines.length * 5 + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Proposed Adjustments', doc.internal.pageSize.width / 2, y, { align: 'center'});
    y += 5;
    doc.line(14, y, doc.internal.pageSize.width - 14, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.text('1. The proposed basis of adjustment to the Contract Sum or Guaranteed Maximum Price is:', 14, y);
    y += 8;
    
    doc.rect(18, y-3, 4, 4);
    if(formState.adjustmentType === 'lumpSum') doc.text('✓', 18.5, y);
    doc.text(`Lump Sum (${formState.lumpSumType}) of Rs. ${formState.lumpSumAmount.toFixed(2)}`, 24, y);
    y += 8;

    doc.rect(18, y-3, 4, 4);
    if(formState.adjustmentType === 'unitPrice') doc.text('✓', 18.5, y);
    doc.text(`Unit Price of Rs. ${formState.unitPrice.toFixed(2)} per ${formState.unitPricePer}`, 24, y);
    y += 8;
    
    doc.rect(18, y-3, 4, 4);
    if(formState.adjustmentType === 'asFollows') doc.text('✓', 18.5, y);
    doc.text(`as follows: ${formState.asFollows}`, 24, y);
    y += 15;

    doc.text(`2. The Contract Time is proposed to (${formState.timeChangeType === 'adjusted' ? 'be adjusted' : ''}) [${formState.timeChangeType === 'unchanged' ? 'remain unchanged' : ''}]. The proposed adjustment, if any, is (an increase of ${formState.timeAdjustmentType === 'increase' ? formState.timeAdjustmentDays : '___'} days) (a decrease of ${formState.timeAdjustmentType === 'decrease' ? formState.timeAdjustmentDays : '___'} days).`, 14, y, { maxWidth: doc.internal.pageSize.width - 28 });
    y += 20;

    const leftNote = "When signed by the Owner and Architect and received by the Contractor, this document becomes effective IMMEDIATELY as a Construction Change Directive (CCD), and the Contractor shall proceed with the change(s) described above.";
    const rightNote = "Signature by the Contractor indicates the Contractor's agreement with the proposed adjustments in Contract Sum and Contract Time set forth in this Construction Change Directive.";
    
    doc.autoTable({
        startY: y,
        theme: 'plain',
        body: [
            [doc.splitTextToSize(leftNote, 90), doc.splitTextToSize(rightNote, 90)]
        ],
        styles: { fontSize: 8 }
    });
    y = (doc as any).lastAutoTable.finalY + 10;


    doc.autoTable({
        startY: y,
        theme: 'grid',
        body: [
            ['Architect', 'Contractor', 'Owner'],
            [{content: formState.architectAddress, styles: {minCellHeight: 20}}, {content: formState.contractorAddress, styles: {minCellHeight: 20}}, {content: formState.ownerAddress, styles: {minCellHeight: 20}}],
            [`By: ${formState.architectBy}`, `By: ${formState.contractorBy}`, `By: ${formState.ownerBy}`],
            [`Date: ${formState.architectDate}`, `Date: ${formState.contractorDate}`, `Date: ${formState.ownerDate}`],
        ],
        styles: {cellPadding: 2, fontSize: 9}
    })
    y = (doc as any).lastAutoTable.finalY + 5;


    doc.save('construction-change-directive.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  };
  

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Construction Change Directive"
        description="Oversee and direct construction changes."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
            <CardTitle className="text-center font-headline text-3xl text-primary">Construction Change Directive</CardTitle>
        </CardHeader>
        <CardContent>
            <form className="space-y-6">
                 <div className="flex justify-end">
                    <div className="space-y-2">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><Checkbox id="dist_owner" checked={formState.distributeTo.includes('Owner')} onCheckedChange={(c) => handleCheckboxChange('Owner', !!c)} /><Label htmlFor="dist_owner">Owner</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="dist_field" checked={formState.distributeTo.includes('Field')} onCheckedChange={(c) => handleCheckboxChange('Field', !!c)} /><Label htmlFor="dist_field">Field</Label></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><Checkbox id="dist_architect" checked={formState.distributeTo.includes('Architect')} onCheckedChange={(c) => handleCheckboxChange('Architect', !!c)} /><Label htmlFor="dist_architect">Architect</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="dist_other" checked={formState.distributeTo.includes('Other')} onCheckedChange={(c) => handleCheckboxChange('Other', !!c)} /><Label htmlFor="dist_other">Other</Label></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><Checkbox id="dist_contractor" checked={formState.distributeTo.includes('Contractor')} onCheckedChange={(c) => handleCheckboxChange('Contractor', !!c)} /><Label htmlFor="dist_contractor">Contractor</Label></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div><Label htmlFor="project">Project (Name, Address)</Label><Input id="project" name="project" value={formState.project} onChange={handleChange} /></div>
                        <div className="mt-2"><Label htmlFor="toContractor">To Contractor (Name, Address)</Label><Textarea id="toContractor" name="toContractor" value={formState.toContractor} onChange={handleChange} /></div>
                    </div>
                    <div>
                        <div><Label htmlFor="directiveNo">Directive No.</Label><Input id="directiveNo" name="directiveNo" value={formState.directiveNo} onChange={handleChange} /></div>
                        <div className="mt-2"><Label htmlFor="date">Date</Label><Input id="date" name="date" type="date" value={formState.date} onChange={handleChange} /></div>
                        <div className="mt-2"><Label htmlFor="architectsProjectNo">Architect's Project No</Label><Input id="architectsProjectNo" name="architectsProjectNo" value={formState.architectsProjectNo} onChange={handleChange} /></div>
                        <div className="mt-2"><Label htmlFor="contractFor">Contract For:</Label><Input id="contractFor" name="contractFor" value={formState.contractFor} onChange={handleChange} /></div>
                        <div className="mt-2"><Label htmlFor="contractDate">Contract Date:</Label><Input id="contractDate" name="contractDate" type="date" value={formState.contractDate} onChange={handleChange} /></div>
                    </div>
                </div>

                <div>
                    <Label>You are hereby directed to make the following change(s) in this Contract:</Label>
                    <Textarea name="description" value={formState.description} onChange={handleChange} rows={4} />
                </div>
                
                 <div className="border-t-2 border-b-2 py-4 space-y-4">
                    <h3 className="text-center font-bold">Proposed Adjustments</h3>
                    <div>1. The proposed basis of adjustment to the Contract Sum or Guaranteed Maximum Price is:</div>
                    <RadioGroup value={formState.adjustmentType} onValueChange={(v) => handleRadioChange('adjustmentType', v)} className="pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="lumpSum" id="adj_lump" />
                            <Label htmlFor="adj_lump" className="flex items-center gap-2">Lump Sum 
                            <RadioGroup value={formState.lumpSumType} onValueChange={(v) => handleRadioChange('lumpSumType', v)} className="flex"><div className="flex items-center gap-1"><RadioGroupItem value="increase" id="lump_inc"/><Label htmlFor="lump_inc">(increase)</Label></div><div className="flex items-center gap-1"><RadioGroupItem value="decrease" id="lump_dec"/><Label htmlFor="lump_dec">[decrease]</Label></div></RadioGroup>
                             of Rs.
                            </Label>
                            <Input type="number" name="lumpSumAmount" value={formState.lumpSumAmount} onChange={handleNumberChange} className="w-40" />
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="unitPrice" id="adj_unit" />
                            <Label htmlFor="adj_unit">Unit Price of Rs.</Label>
                            <Input type="number" name="unitPrice" value={formState.unitPrice} onChange={handleNumberChange} className="w-32" />
                            <Label>per</Label>
                            <Input name="unitPricePer" value={formState.unitPricePer} onChange={handleChange} className="w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="asFollows" id="adj_as_follows" />
                            <Label htmlFor="adj_as_follows">as follows:</Label>
                            <Input name="asFollows" value={formState.asFollows} onChange={handleChange} className="flex-1" />
                        </div>
                    </RadioGroup>
                    <div>2. The Contract Time is proposed to <RadioGroup value={formState.timeChangeType} onValueChange={(v) => handleRadioChange('timeChangeType', v)} className="inline-flex gap-2"><div className="flex items-center gap-1"><RadioGroupItem value="adjusted" id="time_adj"/><Label htmlFor="time_adj">(be adjusted)</Label></div><div className="flex items-center gap-1"><RadioGroupItem value="unchanged" id="time_unc"/><Label htmlFor="time_unc">[remain unchanged]</Label></div></RadioGroup>. The proposed adjustment, if any, is (an increase of <Input type="number" name="timeAdjustmentDays" value={formState.timeAdjustmentDays} onChange={handleNumberChange} className="w-20 inline-block mx-1" /> days) (a decrease of <Input type="number" name="timeAdjustmentDays" value={formState.timeAdjustmentDays} onChange={handleNumberChange} className="w-20 inline-block mx-1" /> days).</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <p>When signed by the Owner and Architect and received by the Contractor, this document becomes effective IMMEDIATELY as a Construction Change Directive (CCD), and the Contractor shall proceed with the change(s) described above.</p>
                    <p>Signature by the Contractor indicates the Contractor's agreement with the proposed adjustments in Contract Sum and Contract Time set forth in this Construction Change Directive.</p>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <div className="space-y-2">
                        <h4 className="font-bold text-center">Architect</h4>
                        <Input name="architectAddress" placeholder="Address" value={formState.architectAddress} onChange={handleChange} />
                        <Input name="architectBy" placeholder="By" value={formState.architectBy} onChange={handleChange} />
                        <Input name="architectDate" type="date" value={formState.architectDate} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-center">Contractor</h4>
                        <Input name="contractorAddress" placeholder="Address" value={formState.contractorAddress} onChange={handleChange} />
                        <Input name="contractorBy" placeholder="By" value={formState.contractorBy} onChange={handleChange} />
                        <Input name="contractorDate" type="date" value={formState.contractorDate} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-center">Owner</h4>
                        <Input name="ownerAddress" placeholder="Address" value={formState.ownerAddress} onChange={handleChange} />
                        <Input name="ownerBy" placeholder="By" value={formState.ownerBy} onChange={handleChange} />
                        <Input name="ownerDate" type="date" value={formState.ownerDate} onChange={handleChange} />
                    </div>
                </div>

                 <div className="flex justify-end gap-4 mt-8">
                    <Button type="button" onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                    <Button type="button" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}



