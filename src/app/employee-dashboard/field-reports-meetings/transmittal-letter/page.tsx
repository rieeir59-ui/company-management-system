'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type TransmittalItem = {
    id: number;
    copies: string;
    date: string;
    revNo: string;
    description: string;
    actionCode: string;
};

const initialItem: Omit<TransmittalItem, 'id'> = { copies: '', date: '', revNo: '', description: '', actionCode: '' };

export default function TransmittalLetterPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<TransmittalItem[]>([{ id: 1, ...initialItem }]);
    
    const addItem = () => setItems([...items, { id: Date.now(), ...initialItem }]);
    const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));
    const handleItemChange = (id: number, field: keyof TransmittalItem, value: string) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSave = () => {
        toast({ title: 'Record Saved', description: 'The transmittal letter has been saved.' });
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let yPos = 20;

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
        const getChecked = (id: string) => (document.getElementById(id) as HTMLInputElement)?.checked;
        const getRadio = (name: string) => (document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value || '';
        
        const drawCheckbox = (x: number, y: number, checked: boolean) => {
            doc.setLineWidth(0.2);
            doc.rect(x, y - 3, 3.5, 3.5);
            if (checked) {
                doc.setFont('helvetica', 'bold');
                doc.text('X', x + 0.8, y);
            }
        };

        const drawRadio = (x: number, y: number, checked: boolean) => {
            doc.setLineWidth(0.2);
            doc.circle(x + 1.75, y - 1.75, 1.75);
            if (checked) {
                doc.circle(x + 1.75, y - 1.75, 1, 'F');
            }
        };


        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ISBAH HASSAN & ASSOCIATES', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 5;
        doc.setFontSize(8);
        doc.text('ARCHITECTURAL - ENGINEERING - CONSTRUCTIONS', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("TRANSMITTAL LETTER", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        (doc as any).autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                [`Project: ${getVal('project_name')}\n${getVal('project_address')}`, `Architect Project No: ${getVal('project_no')}`],
                [``, `Date: ${getVal('date')}`]
            ],
        });
        yPos = (doc as any).lastAutoTable.finalY + 5;

        doc.rect(14, yPos, 90, 25);
        doc.text("To:", 16, yPos-2);
        doc.text(getVal('to_attn'), 16, yPos + 5);
        
        doc.rect(110, yPos, 86, 25);
        const ifNotesText = "If Enclosures are not as noted,\nPlease Inform us immediately.";
        doc.text(ifNotesText, 112, yPos + 5);
        drawCheckbox(112, yPos + 15, getChecked('ack_receipt'));
        doc.text("Acknowledge Receipt of Enclosures.", 117, yPos + 15);
        drawCheckbox(112, yPos + 20, getChecked('return_enclosures'));
        doc.text("Return Enclosures to us.", 117, yPos + 20);
        yPos += 30;

        doc.setFont('helvetica', 'normal');
        doc.text("We Transmit: ", 14, yPos);
        drawRadio(35, yPos, getRadio('transmit_type') === 'herewith');
        doc.text("herewith ", 40, yPos);
        yPos += 7;
        drawRadio(35, yPos, getRadio('transmit_type') === 'separate');
        doc.text(`under separate cover via ${getVal('transmit_via')} `, 40, yPos);
        yPos += 7;
        drawRadio(35, yPos, getRadio('transmit_type') === 'request');
        doc.text(`in accordance with your request ${getVal('transmit_request')} `, 40, yPos);
        yPos += 10;
        
        doc.text("For Your:", 14, yPos);
        drawCheckbox(30, yPos, getChecked('foryour_approval'));
        doc.text("approval", 35, yPos);
        drawCheckbox(60, yPos, getChecked('foryour_distribute'));
        doc.text("distribution to parties", 65, yPos);
        drawCheckbox(110, yPos, getChecked('foryour_info'));
        doc.text("information", 115, yPos);
        yPos += 7;
        drawCheckbox(30, yPos, getChecked('foryour_review'));
        doc.text("review & comment", 35, yPos);
        drawCheckbox(75, yPos, getChecked('foryour_record'));
        doc.text("record", 80, yPos);
        drawCheckbox(100, yPos, getChecked('foryour_use'));
        doc.text("use", 105, yPos);
        yPos += 7;
        drawCheckbox(30, yPos, getVal('foryour_other') !== '');
        doc.text(`Other: ${getVal('foryour_other')}`, 35, yPos);
        yPos += 10;

        doc.text("The Following:", 14, yPos);
        const followingOptions = [
          {id: 'following_drawings', label: 'Drawings'}, {id: 'following_shop_prints', label: 'Shop Drawing Prints'},
          {id: 'following_samples', label: 'Samples'}, {id: 'following_specs', label: 'Specifications'},
          {id: 'following_shop_repro', label: 'Shop Drawing Reproducible'}, {id: 'following_prod_lit', label: 'Product Literature'},
          {id: 'following_change_order', label: 'Change Order'}
        ];
        let xOffset = 38;
        for (let i = 0; i < followingOptions.length; i++) {
          if (i > 0 && i % 3 === 0) {
            yPos += 7;
            xOffset = 38;
          }
          drawCheckbox(xOffset, yPos, getChecked(followingOptions[i].id));
          doc.text(followingOptions[i].label, xOffset + 5, yPos);
          xOffset += 55;
        }
        yPos += 7;
        drawCheckbox(38, yPos, getVal('following_other') !== '');
        doc.text(`Other: ${getVal('following_other')}`, 43, yPos);
        yPos += 10;

        const head = [['Copies', 'Date', 'Rev. No.', 'Description', 'Action Code']];
        const body = items.map(item => [item.copies, item.date, item.revNo, item.description, item.actionCode]);
        (doc as any).autoTable({ head, body, startY: yPos, theme: 'striped' });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        doc.text("Action Code:", 14, yPos);
        yPos += 5;
        (doc as any).autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                ['A. Action indicated on item transmitted', 'D. For signature and forwarding as noted'],
                ['B. No action required', 'below under REMARKS'],
                ['C. For signature and return to this office', 'E. See REMARKS below'],
            ],
            styles: { fontSize: 8 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        doc.text("Remarks:", 14, yPos);
        yPos += 5;
        doc.text(getVal('remarks'), 14, yPos);
        yPos += 20;

        doc.text(`Copies To: (With Enclosures) ${getVal('copies_to')}`, 14, yPos);
        yPos += 15;
        doc.text(`Received By: ____________________`, 14, yPos);
        
        doc.save('transmittal-letter.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <Card>
            <CardHeader className="text-center">
                <p className="font-bold">ISBAH HASSAN & ASSOCIATES</p>
                <p className="text-sm text-muted-foreground uppercase">ARCHITECTURAL - ENGINEERING - CONSTRUCTIONS</p>
                <CardTitle className="font-headline text-3xl text-primary pt-4">Transmittal Letter</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="project_name">Project (Name)</Label><Input id="project_name" /></div>
                        <div><Label htmlFor="project_address">Project (Address)</Label><Input id="project_address" /></div>
                        <div><Label htmlFor="project_no">Architect Project No</Label><Input id="project_no" /></div>
                        <div><Label htmlFor="date">Date</Label><Input id="date" type="date"/></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="to_attn">To (Attn)</Label>
                            <Textarea id="to_attn" rows={4} />
                        </div>
                        <div className="border rounded-lg p-4 space-y-2">
                             <p className="text-sm font-medium">If checked below, please:</p>
                             <div className="flex items-center gap-2"><Checkbox id="ack_receipt" /><Label htmlFor="ack_receipt">Acknowledge Receipt of Enclosures.</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="return_enclosures" /><Label htmlFor="return_enclosures">Return Enclosures to us.</Label></div>
                        </div>
                    </div>
                    
                    <fieldset className="space-y-2">
                        <legend className="font-semibold">We Transmit:</legend>
                        <RadioGroup name="transmit_type" className="flex flex-wrap gap-4">
                           <div className="flex items-center gap-2"><RadioGroupItem value="herewith" id="transmit_herewith" /><Label htmlFor="transmit_herewith">herewith</Label></div>
                           <div className="flex items-center gap-2"><RadioGroupItem value="separate" id="transmit_separate" /><Label htmlFor="transmit_separate">under separate cover via</Label><Input id="transmit_via" className="w-auto"/></div>
                           <div className="flex items-center gap-2"><RadioGroupItem value="request" id="transmit_request" /><Label htmlFor="transmit_request">in accordance with your request</Label><Input id="transmit_request" className="w-auto"/></div>
                        </RadioGroup>
                    </fieldset>
                    
                    <fieldset className="space-y-2">
                        <legend className="font-semibold">For Your:</legend>
                         <div className="flex flex-wrap gap-x-4 gap-y-2">
                             <div className="flex items-center gap-2"><Checkbox id="foryour_approval" /><Label htmlFor="foryour_approval">approval</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="foryour_distribute" /><Label htmlFor="foryour_distribute">distribution to parties</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="foryour_info" /><Label htmlFor="foryour_info">information</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="foryour_review" /><Label htmlFor="foryour_review">review & comment</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="foryour_record" /><Label htmlFor="foryour_record">record</Label></div>
                             <div className="flex items-center gap-2"><Checkbox id="foryour_use" /><Label htmlFor="foryour_use">use</Label></div>
                             <div className="flex items-center gap-2"><Input id="foryour_other" placeholder="Other" className="w-auto"/></div>
                         </div>
                    </fieldset>

                     <fieldset className="space-y-2">
                        <legend className="font-semibold">The Following:</legend>
                         <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2"><Checkbox id="following_drawings"/><Label htmlFor="following_drawings">Drawings</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="following_shop_prints"/><Label htmlFor="following_shop_prints">Shop Drawing Prints</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="following_samples"/><Label htmlFor="following_samples">Samples</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="following_specs"/><Label htmlFor="following_specs">Specifications</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="following_shop_repro"/><Label htmlFor="following_shop_repro">Shop Drawing Reproducible</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="following_prod_lit"/><Label htmlFor="following_prod_lit">Product Literature</Label></div>
                            <div className="flex items-center gap-2"><Checkbox id="following_change_order"/><Label htmlFor="following_change_order">Change Order</Label></div>
                            <div className="flex items-center gap-2"><Input id="following_other" placeholder="Other" className="w-auto"/></div>
                         </div>
                    </fieldset>

                    <div className="overflow-x-auto">
                        <Table>
                             <TableHeader><TableRow><TableHead>Copies</TableHead><TableHead>Date</TableHead><TableHead>Rev. No.</TableHead><TableHead>Description</TableHead><TableHead>Action Code</TableHead><TableHead></TableHead></TableRow></TableHeader>
                            <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell><Input value={item.copies} onChange={e => handleItemChange(item.id, 'copies', e.target.value)} /></TableCell>
                                        <TableCell><Input type="date" value={item.date} onChange={e => handleItemChange(item.id, 'date', e.target.value)} /></TableCell>
                                        <TableCell><Input value={item.revNo} onChange={e => handleItemChange(item.id, 'revNo', e.target.value)} /></TableCell>
                                        <TableCell><Input value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} /></TableCell>
                                        <TableCell><Input value={item.actionCode} onChange={e => handleItemChange(item.id, 'actionCode', e.target.value)} /></TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Button type="button" size="sm" onClick={addItem} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/>Add Item</Button>
                    </div>

                    <div>
                        <Label>Action Code</Label>
                        <p className="text-xs text-muted-foreground">A. Action indicated on item transmitted | D. For signature and forwarding as noted below under REMARKS</p>
                        <p className="text-xs text-muted-foreground">B. No action required | E. See REMARKS below</p>
                        <p className="text-xs text-muted-foreground">C. For signature and return to this office</p>
                    </div>
                    
                    <div><Label htmlFor="remarks">Remarks:</Label><Textarea id="remarks"/></div>
                    <div><Label htmlFor="copies_to">Copies To: (With Enclosures)</Label><Input id="copies_to"/></div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
