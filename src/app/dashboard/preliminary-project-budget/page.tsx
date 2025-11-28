
'use client';

import { useState, useMemo } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface BudgetItem {
    id: number;
    description: string;
    rate: number; // Rs per sft
    grossArea?: number;
    isUnusual?: boolean;
    isAdditional?: boolean;
    isOwnerBudget?: boolean;
    fixedAmount?: number;
}

const initialItems: Omit<BudgetItem, 'grossArea'>[] = [
    { id: 1, description: '1. Site Work', rate: 0 },
    { id: 2, description: '2. Structural Frame', rate: 0 },
    { id: 3, description: '3. Exterior Finish', rate: 0 },
    { id: 4, description: '4. Interior Finish', rate: 0 },
    { id: 5, description: '5. Mechanical Vert. Transportation', rate: 0 },
    { id: 6, description: '6. Electrical Work', rate: 0 },
    { id: 7, description: '7. Heating, Ventilating, Air -conditioning', rate: 0 },
    { id: 8, description: '8. Plumbing', rate: 0 },
    { id: 9, description: '9. Fire Protection', rate: 0 },
    { id: 10, description: '10. Unusual Site Conditions', rate: 0, isUnusual: true, fixedAmount: 0 },
    { id: 11, description: '11. Unusual Soil Conditions', rate: 0, isUnusual: true, fixedAmount: 0 },
    { id: 12, description: '12. Off-Site Work', rate: 0, isUnusual: true, fixedAmount: 0 },
    { id: 13, description: '13. Provisions for Future Expansion', rate: 0, isUnusual: true, fixedAmount: 0 },
    { id: 14, description: '14. Special Equipment', rate: 0, isUnusual: true, fixedAmount: 0 },
    { id: 15, description: '15. Construction-Time Schedule', rate: 0, isUnusual: true, fixedAmount: 0 },
    { id: 16, description: '16. Type of Bidding and Contract', rate: 0, isUnusual: true, fixedAmount: 0 },
    { id: 17, description: '17. Landscaping', rate: 0, isAdditional: true, fixedAmount: 0 },
    { id: 18, description: '18. Art and Sign Program', rate: 0, isAdditional: true, fixedAmount: 0 },
    { id: 19, description: '19. Tenant Allowances (standard)', rate: 0, isAdditional: true, fixedAmount: 0 },
    { id: 20, description: '20. Self-liquidation Items', rate: 0, isAdditional: true, fixedAmount: 0 },
    { id: 21, description: '21. Professional Fees @270/Sqr.Ft', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 22, description: '22. Surveys and Insurance Costs', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 23, description: '23. Land Cost', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 24, description: '24. Legal and Accounting Costs', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 25, description: '25. Leasing and Advertising Costs', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 26, description: '26. Financing Costs and Taxes', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 27, description: '27. Promotion', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 28, description: '28. Pre- Opening Expenses', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 29, description: "29. Owner's Administration Costs", rate: 0, isOwnerBudget: true, fixedAmount: 0 },
    { id: 30, description: '30. Concessions to Major Tenants (above standards)', rate: 0, isOwnerBudget: true, fixedAmount: 0 },
];


export default function Page() {
    const image = PlaceHolderImages.find(p => p.id === 'preliminary-project-budget');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [header, setHeader] = useState({ project: '', projectNo: '', date: '', job: '', revNo: '', jobDate: '', location: '', preparedBy: '', grossArea: 0, rentalArea: 0 });
    const [items, setItems] = useState<BudgetItem[]>(() => initialItems.map(item => ({ ...item, grossArea: header.grossArea })));

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newHeader = { ...header, [name]: value };
        if (name === 'grossArea') {
            const newGrossArea = parseFloat(value) || 0;
            setItems(prevItems => prevItems.map(item => 
                !item.isUnusual && !item.isAdditional && !item.isOwnerBudget 
                ? { ...item, grossArea: newGrossArea } 
                : item
            ));
        }
        setHeader(newHeader);
    }

    const handleItemChange = (id: number, field: keyof BudgetItem, value: number) => {
        setItems(prev => prev.map(item => item.id === id ? {...item, [field]: value} : item));
    }
    
    const totals = useMemo(() => {
        const basicBuildingCosts = items.filter(i => !i.isUnusual && !i.isAdditional && !i.isOwnerBudget).reduce((acc, item) => acc + (item.rate * (item.grossArea || 0)), 0);
        const unusualBuildingCosts = items.filter(i => i.isUnusual).reduce((acc, item) => acc + (item.fixedAmount || 0), 0);
        const additionalBudgetItems = items.filter(i => i.isAdditional).reduce((acc, item) => acc + (item.fixedAmount || 0), 0);
        const subTotal = basicBuildingCosts + unusualBuildingCosts + additionalBudgetItems;
        const ownerBudgetItems = items.filter(i => i.isOwnerBudget).reduce((acc, item) => acc + (item.fixedAmount || 0), 0);
        const totalProjectBudget = subTotal + ownerBudgetItems;
        return { basicBuildingCosts, unusualBuildingCosts, additionalBudgetItems, subTotal, ownerBudgetItems, totalProjectBudget };
    }, [items]);
    
    const efficiency = useMemo(() => {
        if (header.grossArea > 0 && header.rentalArea > 0) {
            return ((header.rentalArea / header.grossArea) * 100).toFixed(2);
        }
        return 0;
    }, [header.grossArea, header.rentalArea]);


    const handleSave = async () => {
         if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            category: 'Preliminary Project Budget',
            items: [
                JSON.stringify(header),
                ...items.map(item => JSON.stringify(item)),
                JSON.stringify(totals)
            ],
        };
        
        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Preliminary Project Budget',
                projectName: header.project || 'Untitled Budget',
                data: [dataToSave],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The project budget has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let y = 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PRELIMINARY PROJECT BUDGET', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 10;
        
        doc.setFontSize(10);
        (doc as any).autoTable({
            startY: y,
            theme: 'plain',
            body: [
                [`Project: ${header.project}`, `Project No: ${header.projectNo}`, `Date: ${header.date}`],
                [`Job: ${header.job}`, `Rev. No: ${header.revNo}`, `Date: ${header.jobDate}`],
                [`Location: ${header.location}`, `Prepared by: ${header.preparedBy}`, ''],
                [`Gross Area: ${header.grossArea}`, `Rental Area: ${header.rentalArea}`, `Efficiency: ${efficiency}%`],
            ]
        });
        y = (doc as any).lastAutoTable.finalY + 10;

        const basicItems = items.filter(i => !i.isUnusual && !i.isAdditional && !i.isOwnerBudget);
        (doc as any).autoTable({
            head: [['Item', 'Rs. per sft.', 'Gross Area', 'Total Rs.']],
            body: basicItems.map(item => [
                item.description, 
                item.rate.toFixed(2), 
                item.grossArea || 0,
                (item.rate * (item.grossArea || 0)).toFixed(2)
            ]),
            startY: y,
            theme: 'grid',
            foot: [['Basic Building Costs', '', '', totals.basicBuildingCosts.toFixed(2)]],
            footStyles: { fontStyle: 'bold' }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
        
        const unusualItems = items.filter(i => i.isUnusual);
        (doc as any).autoTable({
            head: [['Unusual Building Costs', 'Amount (Rs.)']],
            body: unusualItems.map(item => [item.description, (item.fixedAmount || 0).toFixed(2)]),
            startY: y,
            theme: 'grid',
            foot: [['Total Unusual Costs', totals.unusualBuildingCosts.toFixed(2)]],
            footStyles: { fontStyle: 'bold' }
        });
        y = (doc as any).lastAutoTable.finalY + 10;

        const additionalItems = items.filter(i => i.isAdditional);
        (doc as any).autoTable({
            head: [['Additional Budget Items', 'Amount (Rs.)']],
            body: additionalItems.map(item => [item.description, (item.fixedAmount || 0).toFixed(2)]),
            startY: y,
            theme: 'grid',
            foot: [['Total Additional Items', totals.additionalBudgetItems.toFixed(2)]],
            footStyles: { fontStyle: 'bold' }
        });
        y = (doc as any).lastAutoTable.finalY + 10;

        doc.setFont('helvetica', 'bold');
        doc.text(`Sub-Total Rs. ${totals.subTotal.toFixed(2)}`, 14, y);
        y += 10;

        const ownerItems = items.filter(i => i.isOwnerBudget);
        (doc as any).autoTable({
            head: [["Owner's Budget Items", 'Amount (Rs.)']],
            body: ownerItems.map(item => [item.description, (item.fixedAmount || 0).toFixed(2)]),
            startY: y,
            theme: 'grid',
            foot: [["Total Owner's Items", totals.ownerBudgetItems.toFixed(2)]],
            footStyles: { fontStyle: 'bold' }
        });
        y = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL PROJECT BUDGET Rs. ${totals.totalProjectBudget.toFixed(2)}`, 14, y);


        doc.save('preliminary-project-budget.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    const renderTableSection = (title: string, filter: (item: BudgetItem) => boolean, hasRateCol: boolean) => (
        <div>
            <h3 className="text-lg font-semibold my-4">{title}</h3>
            <div className={`grid ${hasRateCol ? 'grid-cols-5' : 'grid-cols-3'} gap-4 font-bold border-b pb-2`}>
                <div className="col-span-2">Item</div>
                {hasRateCol && <div>Rs. per sft.</div>}
                {hasRateCol && <div>Gross Area</div>}
                <div className={!hasRateCol ? "col-start-3" : ""}>Total Rs.</div>
            </div>
            {items.filter(filter).map(item => (
                 <div key={item.id} className={`grid ${hasRateCol ? 'grid-cols-5' : 'grid-cols-3'} items-center gap-4 py-2 border-b`}>
                    <Label className="col-span-2">{item.description}</Label>
                    {hasRateCol ? (
                        <>
                            <Input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                            <Input type="number" value={item.grossArea || 0} onChange={e => handleItemChange(item.id, 'grossArea', parseFloat(e.target.value) || 0)} />
                            <div className="text-right font-medium">
                                {(item.rate * (item.grossArea || 0)).toFixed(2)}
                            </div>
                        </>
                    ) : (
                        <>
                            <Input type="number" value={item.fixedAmount} onChange={e => handleItemChange(item.id, 'fixedAmount', parseFloat(e.target.value) || 0)} className="col-start-3" />
                            <div className="text-right font-medium">{(item.fixedAmount || 0).toFixed(2)}</div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Preliminary Project Budget"
                description="Create and manage the preliminary project budget."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">Preliminary Project Budget</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 border p-4 rounded-lg">
                        <Input name="project" value={header.project} onChange={handleHeaderChange} placeholder="Project" />
                        <Input name="projectNo" value={header.projectNo} onChange={handleHeaderChange} placeholder="Project No" />
                        <Input name="date" value={header.date} onChange={handleHeaderChange} type="date" placeholder="Date" />
                        <Input name="job" value={header.job} onChange={handleHeaderChange} placeholder="Job" />
                        <Input name="revNo" value={header.revNo} onChange={handleHeaderChange} placeholder="Rev. No" />
                        <Input name="jobDate" value={header.jobDate} onChange={handleHeaderChange} type="date" placeholder="Job Date" />
                        <Input name="location" value={header.location} onChange={handleHeaderChange} placeholder="Location" />
                        <Input name="preparedBy" value={header.preparedBy} onChange={handleHeaderChange} placeholder="Prepared by" />
                        <Input name="grossArea" value={header.grossArea} onChange={handleHeaderChange} type="number" placeholder="Gross Area" />
                        <Input name="rentalArea" value={header.rentalArea} onChange={handleHeaderChange} type="number" placeholder="Rental Area" />
                        <div className="flex items-center justify-center p-2 bg-muted rounded-md">Efficiency: {efficiency}%</div>
                    </div>
                    
                    {renderTableSection("Basic Building", i => !i.isUnusual && !i.isAdditional && !i.isOwnerBudget, true)}
                    <div className="text-right font-bold text-lg my-2 pr-4">Basic Building Costs: {totals.basicBuildingCosts.toFixed(2)}</div>
                    
                    {renderTableSection("Unusual Building Costs", i => !!i.isUnusual, false)}
                     <div className="text-right font-bold text-lg my-2 pr-4">Total Unusual Costs: {totals.unusualBuildingCosts.toFixed(2)}</div>
                     
                    {renderTableSection("Additional Budget Items", i => !!i.isAdditional, false)}
                     <div className="text-right font-bold text-lg my-2 pr-4">Total Additional Items: {totals.additionalBudgetItems.toFixed(2)}</div>

                    <div className="text-right font-bold text-xl my-4 p-2 bg-secondary rounded-md">Sub-Total: {totals.subTotal.toFixed(2)}</div>

                    {renderTableSection("Owner's Budget Items", i => !!i.isOwnerBudget, false)}
                    <div className="text-right font-bold text-lg my-2 pr-4">Total Owner's Items: {totals.ownerBudgetItems.toFixed(2)}</div>

                </CardContent>
                 <CardFooter className="flex flex-col items-end gap-4 p-6">
                    <div className="text-2xl font-bold p-4 bg-primary text-primary-foreground rounded-md">
                        TOTAL PROJECT BUDGET: {totals.totalProjectBudget.toFixed(2)}
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
