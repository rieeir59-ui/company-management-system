
'use client';

import { useState, useMemo } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface MaterialRow {
    id: number;
    description: string;
    amount: number;
}

interface LabourRow {
    id: number;
    description: string;
    amount: number;
}

export default function RateAnalysisPage() {
    const image = PlaceHolderImages.find(p => p.id === 'rate-analysis');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [description, setDescription] = useState('');
    const [itemNo, setItemNo] = useState('');
    const [specification, setSpecification] = useState('');

    const [materials, setMaterials] = useState<MaterialRow[]>([
        { id: 1, description: '', amount: 0 },
        { id: 2, description: '', amount: 0 },
        { id: 3, description: '', amount: 0 },
        { id: 4, description: '', amount: 0 },
        { id: 5, description: '', amount: 0 },
    ]);
    const [materialProfitPercent, setMaterialProfitPercent] = useState(0);
    const [materialTaxPercent, setMaterialTaxPercent] = useState(0);
    
    const [labours, setLabours] = useState<LabourRow[]>([
        { id: 1, description: '', amount: 0 },
        { id: 2, description: '', amount: 0 },
        { id: 3, description: '', amount: 0 },
        { id: 4, description: '', amount: 0 },
    ]);
    const [labourProfitPercent, setLabourProfitPercent] = useState(0);
    const [labourTaxPercent, setLabourTaxPercent] = useState(7.5);

    const [qty, setQty] = useState(100);


    const handleMaterialChange = (id: number, field: 'description' | 'amount', value: string | number) => {
        setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleLabourChange = (id: number, field: 'description' | 'amount', value: string | number) => {
        setLabours(labours.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const materialSubtotal = useMemo(() => materials.reduce((sum, m) => sum + Number(m.amount), 0), [materials]);
    const materialProfit = useMemo(() => materialSubtotal * (materialProfitPercent / 100), [materialSubtotal, materialProfitPercent]);
    const materialTax = useMemo(() => (materialSubtotal + materialProfit) * (materialTaxPercent / 100), [materialSubtotal, materialProfit, materialTaxPercent]);
    const materialTotal = useMemo(() => materialSubtotal + materialProfit + materialTax, [materialSubtotal, materialProfit, materialTax]);

    const labourSubtotal = useMemo(() => labours.reduce((sum, l) => sum + Number(l.amount), 0), [labours]);
    const labourProfit = useMemo(() => labourSubtotal * (labourProfitPercent / 100), [labourSubtotal, labourProfitPercent]);
    const labourTax = useMemo(() => (labourSubtotal + labourProfit) * (labourTaxPercent / 100), [labourSubtotal, labourProfit, labourTaxPercent]);
    const labourTotal = useMemo(() => labourSubtotal + labourProfit + labourTax, [labourSubtotal, labourProfit, labourTax]);

    const labourRatePerQty = useMemo(() => qty > 0 ? labourTotal / qty : 0, [labourTotal, qty]);
    const compositeRatePerQty = useMemo(() => qty > 0 ? (materialTotal + labourTotal) / qty : 0, [materialTotal, labourTotal, qty]);
    
    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const data = {
            category: 'Rate Analysis',
            items: [
                `Description: ${description}`,
                `Item No: ${itemNo}`,
                `Specification: ${specification}`,
                '--- Materials ---',
                ...materials.map(m => `${m.description}: ${m.amount}`),
                `Material Subtotal: ${materialSubtotal}`,
                `Material Profit %: ${materialProfitPercent}`,
                `Material Tax %: ${materialTaxPercent}`,
                `Material Total: ${materialTotal}`,
                '--- Labour ---',
                ...labours.map(l => `${l.description}: ${l.amount}`),
                 `Labour Subtotal: ${labourSubtotal}`,
                `Labour Profit %: ${labourProfitPercent}`,
                `Labour Tax %: ${labourTaxPercent}`,
                `Labour Total: ${labourTotal}`,
                '--- Rates ---',
                `Qty: ${qty}`,
                `Labour Rate per ${qty}: ${labourRatePerQty}`,
                `Composite Rate per ${qty}: ${compositeRatePerQty}`,
            ],
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Rate Analysis',
                projectName: description || 'Untitled Analysis',
                data: [data],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The rate analysis has been saved.' });
        } catch(e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save record.' });
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let y = 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RATE ANALYSIS', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 10;
        
        doc.setFontSize(10);
        doc.autoTable({
            startY: y,
            theme: 'plain',
            body: [
                [{content: `DESCRIPTION OF ITEM: ${description}`, colSpan: 2}],
                [`Item No. ${itemNo}`, `Qty: ${qty}`]
            ]
        });
        y = (doc as any).autoTable.previous.finalY + 5;

        const materialBody = materials.map(m => [m.description, m.amount.toFixed(2)]);
        materialBody.push(['Total', materialSubtotal.toFixed(2)]);
        materialBody.push([`Contractor's Profit, & Overheads @ ${materialProfitPercent}%`, materialProfit.toFixed(2)]);
        materialBody.push([`Tax @ ${materialTaxPercent}%`, materialTax.toFixed(2)]);

        doc.autoTable({
            head: [['MATERIAL', 'Amount (Rs.)']],
            body: materialBody,
            foot: [['Total', materialTotal.toFixed(2)]],
            startY: y,
            theme: 'grid',
        });
        y = (doc as any).autoTable.previous.finalY + 10;

        const labourBody = labours.map(l => [l.description, l.amount.toFixed(2)]);
        labourBody.push([`Contractor's Profit' & Overheads @ ${labourProfitPercent}%`, labourProfit.toFixed(2)]);
        labourBody.push([`Income Tax @ ${labourTaxPercent}%`, labourTax.toFixed(2)]);

        doc.autoTable({
            head: [['LABOUR', 'Amount (Rs.)']],
            body: labourBody,
            foot: [['Total', labourTotal.toFixed(2)]],
            startY: y,
            theme: 'grid',
        });
        y = (doc as any).autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [['ITEM RATES', '']],
            body: [
                [`Labour rate per ${qty} Cft / Sft`, `Rs. ${labourTotal.toFixed(2)} Say ${Math.round(labourTotal)}`],
                [`Composite rate per ${qty} Cft / Sft`, `Rs. ${compositeRatePerQty.toFixed(2)} Say ${Math.round(compositeRatePerQty)}`],
                [`Rate Per Unit`, `Rs. ${(compositeRatePerQty).toFixed(2)}`],
                [`Rate Per Sft/Cft`, `Rs. ${(compositeRatePerQty).toFixed(2)}`],
            ],
            startY: y,
            theme: 'grid',
        });
        y = (doc as any).autoTable.previous.finalY + 10;

        doc.setFontSize(12);
        doc.text('Specification of Item', 14, y);
        y += 7;
        doc.setFontSize(10);
        const splitSpec = doc.splitTextToSize(specification, doc.internal.pageSize.width - 28);
        doc.text(splitSpec, 14, y);


        doc.save('rate-analysis.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Rate Analysis"
                description="Analyze and manage project rates."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">Rate Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <Label htmlFor="description">DESCRIPTION OF ITEM:</Label>
                            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="itemNo">Item No.</Label>
                            <Input id="itemNo" value={itemNo} onChange={e => setItemNo(e.target.value)} />
                             <Label htmlFor="qty" className="mt-2">Quantity for Rate (e.g. 100)</Label>
                            <Input id="qty" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Material Section */}
                        <div className="space-y-2">
                             <h3 className="font-bold text-lg text-center">MATERIAL</h3>
                             {materials.map((m, i) => (
                                <div key={m.id} className="flex gap-2">
                                     <Input placeholder={`Material ${i+1}`} value={m.description} onChange={e => handleMaterialChange(m.id, 'description', e.target.value)} />
                                     <Input type="number" value={m.amount} onChange={e => handleMaterialChange(m.id, 'amount', Number(e.target.value))} className="w-32" />
                                </div>
                             ))}
                             <div className="flex justify-end gap-2 font-bold pt-2 border-t">
                                 <span>Total</span>
                                 <span>{materialSubtotal.toFixed(2)}</span>
                             </div>
                             <div className="flex items-center justify-end gap-2">
                                 <span>Contractor's Profit, & Overheads</span>
                                 <Input type="number" value={materialProfitPercent} onChange={e => setMaterialProfitPercent(Number(e.target.value))} className="w-20" /> %
                                 <span>{materialProfit.toFixed(2)}</span>
                             </div>
                             <div className="flex items-center justify-end gap-2">
                                 <span>Tax</span>
                                  <Input type="number" value={materialTaxPercent} onChange={e => setMaterialTaxPercent(Number(e.target.value))} className="w-20" /> %
                                  <span>{materialTax.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-end gap-2 font-bold pt-2 border-t">
                                 <span>Total</span>
                                 <span>{materialTotal.toFixed(2)}</span>
                             </div>
                        </div>

                        {/* Labour Section */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-center">LABOUR</h3>
                            {labours.map((l, i) => (
                                <div key={l.id} className="flex gap-2">
                                     <Input placeholder={`Labour ${i+1}`} value={l.description} onChange={e => handleLabourChange(l.id, 'description', e.target.value)} />
                                     <Input type="number" value={l.amount} onChange={e => handleLabourChange(l.id, 'amount', Number(e.target.value))} className="w-32" />
                                </div>
                             ))}
                             <div className="flex justify-end gap-2 font-bold pt-2 border-t">
                                 <span>Total</span>
                                 <span>{labourSubtotal.toFixed(2)}</span>
                             </div>
                            <div className="flex items-center justify-end gap-2">
                                 <span>Contractor's Profit, & Overheads</span>
                                 <Input type="number" value={labourProfitPercent} onChange={e => setLabourProfitPercent(Number(e.target.value))} className="w-20" /> %
                                 <span>{labourProfit.toFixed(2)}</span>
                             </div>
                              <div className="flex items-center justify-end gap-2">
                                 <span>Income Tax</span>
                                  <Input type="number" value={labourTaxPercent} onChange={e => setLabourTaxPercent(Number(e.target.value))} className="w-20" /> %
                                  <span>{labourTax.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-end gap-2 font-bold pt-2 border-t">
                                 <span>Total</span>
                                 <span>{labourTotal.toFixed(2)}</span>
                             </div>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <Label>Specification of Item</Label>
                        <Textarea value={specification} onChange={e => setSpecification(e.target.value)} />
                    </div>
                    
                    {/* Item Rates */}
                    <Card className="mt-8">
                         <CardHeader><CardTitle className="text-center">ITEM RATES</CardTitle></CardHeader>
                         <CardContent className="space-y-2">
                            <div className="grid grid-cols-2">
                                <span className="font-semibold">Labour rate per {qty} Cft / Sft</span>
                                <span className="text-right">Rs. {labourTotal.toFixed(2)} Say {Math.round(labourTotal)}</span>
                            </div>
                            <div className="grid grid-cols-2">
                                <span className="font-semibold">Composite rate per {qty} Cft / Sft</span>
                                <span className="text-right">Rs. {(materialTotal + labourTotal).toFixed(2)} Say {Math.round(materialTotal + labourTotal)}</span>
                            </div>
                            <div className="grid grid-cols-2">
                                <span className="font-semibold">Composite rate per Cum / Sq.m</span>
                                <span className="text-right">Rs. - Say 0.00</span>
                            </div>
                             <div className="grid grid-cols-2">
                                <span className="font-semibold">Rate Per Unit</span>
                                <span className="text-right">Rs. {compositeRatePerQty.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2">
                                <span className="font-semibold">Rate Per Sft/Cft</span>
                                <span className="text-right">Rs. {compositeRatePerQty.toFixed(2)}</span>
                            </div>
                         </CardContent>
                    </Card>

                </CardContent>
                 <CardFooter className="flex justify-end gap-4">
                    <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                    <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

