
'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const ChangeOrderRow = ({ id, onRemove }: { id: number, onRemove: (id: number) => void }) => (
    <TableRow>
        <TableCell><Input name={`co_number_${id}`} /></TableCell>
        <TableCell><Input type="date" name={`co_date_${id}`} /></TableCell>
        <TableCell><Input type="number" name={`co_additions_${id}`} defaultValue="0" /></TableCell>
        <TableCell><Input type="number" name={`co_deductions_${id}`} defaultValue="0" /></TableCell>
        <TableCell>
            <Button variant="destructive" size="icon" onClick={() => onRemove(id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </TableCell>
    </TableRow>
);


export default function Page() {
    const image = PlaceHolderImages.find(p => p.id === 'payment-certificates');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    // State for Form 1
    const [form1State, setForm1State] = useState({
        toOwner: '',
        attention: '',
        project: '',
        constructionManager: '',
        applicationNumber: '',
        periodFrom: '',
        periodTo: '',
        architectsProjectNo: '',
        distributedTo: [] as string[],
        constructionManagerBy: '',
        constructionManagerDate: '',
        statusOf: '',
        countyOf: '',
        subscribedDay: '',
        notaryPublic: '',
        commissionExpires: '',
        totalContractSum: 0,
        netChanges: 0,
        totalCompleted: 0,
        retainage: 0,
        previousPayments: 0,
        currentPaymentDue: 0,
        totalCertified: 0,
        architectBy: '',
        architectDate: '',
        explanation: '',
    });

    const handleForm1Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm1State(prev => ({ ...prev, [name]: value }));
    };
    
    const handleForm1NumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm1State(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleForm1CheckboxChange = (field: string) => {
        setForm1State(prev => {
            const current = prev.distributedTo;
            if (current.includes(field)) {
                return { ...prev, distributedTo: current.filter(item => item !== field) };
            } else {
                return { ...prev, distributedTo: [...current, field] };
            }
        });
    };

    const contractSumToDate1 = useMemo(() => form1State.totalContractSum + form1State.netChanges, [form1State.totalContractSum, form1State.netChanges]);

    useEffect(() => {
        const paymentDue = form1State.totalCompleted - form1State.retainage - form1State.previousPayments;
        setForm1State(prev => ({...prev, currentPaymentDue: paymentDue}));
    }, [form1State.totalCompleted, form1State.retainage, form1State.previousPayments]);

    const handleSave1 = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }
        
        const dataToSave = {
            category: 'Project Application for Payment (CM)',
            items: Object.entries(form1State).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Project Application for Payment (CM)',
                projectName: form1State.project || 'Untitled Payment Certificate',
                data: [dataToSave],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The payment certificate has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };
    
    const handleDownloadPdf1 = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 15;
        const primaryColor = [45, 95, 51]; 
    
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('PROJECT APPLICATION AND PROJECT CERTIFICATE FOR PAYMENT', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        doc.setTextColor(0, 0, 0); 
    
        doc.setFontSize(10);
        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                [`To (Owner): ${form1State.toOwner}`, `Application Number: ${form1State.applicationNumber}`],
                [`Attention: ${form1State.attention}`, `Period From: ${form1State.periodFrom} To: ${form1State.periodTo}`],
                 [`Project: ${form1State.project}`, `Architect's Project No: ${form1State.architectsProjectNo}`],
                [`Construction Manager: ${form1State.constructionManager}`],
            ],
            styles: { cellPadding: 1, fontSize: 9 },
            columnStyles: { 0: { cellWidth: 100 } }
        });
        yPos = (doc as any).autoTable.previous.finalY + 5;
    
        const appText = "The undersigned Construction Manager certifies that the best of the Construction Manager's knowledge, information and belief Work covered by this Project Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractors for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.";
        const summaryText = "Application is made for Payment, as shown below, in connection with the Project. Project Application Summary, is attached. The present status for the account for all Contractors is for this Project is as follows:";
    
        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                [
                    { content: 'Project Application for Payment:', styles: { fontStyle: 'bold' } },
                    { content: 'Application for Payment:', styles: { fontStyle: 'bold' } }
                ],
                [
                    { content: doc.splitTextToSize(appText, 85), styles: { fontSize: 8, cellPadding: 1 } },
                    { content: doc.splitTextToSize(summaryText, 85), styles: { fontSize: 8, cellPadding: 1 } }
                ]
            ],
        });
        yPos = (doc as any).autoTable.previous.finalY + 5;
    
         doc.autoTable({
            startY: yPos, theme: 'grid',
            head: [['Description', 'Amount']],
            body: [
                ['Total Contract Sum (Item A Totals)', `Rs. ${form1State.totalContractSum.toFixed(2)}`],
                ['Total Net Changes by Change Order (Item B Totals)', `Rs. ${form1State.netChanges.toFixed(2)}`],
                ['Total Contract Sum to Date (Item C Totals)', `Rs. ${contractSumToDate1.toFixed(2)}`],
                 ['Total Completed & Stored to Date (Item F Totals)', `Rs. ${form1State.totalCompleted.toFixed(2)}`],
                ['Retainage (Item H Totals)', `Rs. ${form1State.retainage.toFixed(2)}`],
                ['Less Previous Totals Payments (Item I Total)', `Rs. ${form1State.previousPayments.toFixed(2)}`],
                ['Current Payment Due (Item J Totals)', `Rs. ${form1State.currentPaymentDue.toFixed(2)}`],
            ],
            styles: { cellPadding: 2, fontSize: 9 },
            headStyles: { fillColor: primaryColor, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: { 0: { fontStyle: 'normal' } }
        });
        yPos = (doc as any).autoTable.previous.finalY + 5;
    
        const certText = "In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.";
        
        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                 [
                    { content: `Construction Manager:\nBy: ${form1State.constructionManagerBy}\nDate: ${form1State.constructionManagerDate}`, styles: {fontStyle: 'bold'} },
                    { content: "Architect's Project Certificate for Payment:", styles: { fontStyle: 'bold' } }
                ],
                [
                    { content: `\nState of: ${form1State.statusOf}\nCounty of: ${form1State.countyOf}`, styles: {fontStyle: 'bold'} },
                    { content: doc.splitTextToSize(certText, 80), styles: { fontSize: 8 } }
                ],
                [
                    { content: `Subscribed and sworn to before me this Day of: ${form1State.subscribedDay}\nNotary Public: ${form1State.notaryPublic}\nMy Commission expires: ${form1State.commissionExpires}`},
                    { content: `Total of Amounts Certified: Rs. ${form1State.totalCertified.toFixed(2)}\nArchitect:\nBy: ${form1State.architectBy}\nDate: ${form1State.architectDate}` }
                ],
            ],
            styles: { cellPadding: 1, valign: 'top', fontSize: 9 },
        });
        yPos = (doc as any).autoTable.previous.finalY + 5;
    
        const footerText = "This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named in Contract Document attached. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.";
        doc.setFontSize(8);
        doc.text(doc.splitTextToSize(footerText, 180), 14, yPos);
    
        doc.save('project-payment-certificate.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    // State for Form 2
    const [changeOrders, setChangeOrders] = useState([{ id: 1 }]);
    const [form2State, setForm2State] = useState({
        toOwner: '', fromContractor: '', contractFor: '', project: '', viaArchitect: '',
        applicationNumber: '', periodTo: '', architectsProjectNo: '', contractDate: '',
        distributedTo: [] as string[],
        originalContractSum: 0, netChangeOrders: 0,
        totalCompleted: 0, retainagePercentCompleted: 0, retainageAmountCompleted: 0,
        retainagePercentStored: 0, retainageAmountStored: 0, previousPayments: 0,
        stateOf: '', countyOf: '', subscribedDay: '', subscribedMonth: '', subscribedYear: '',
        notaryPublic: '', commissionExpires: '',
        contractorBy: '', contractorDate: '',
        amountsCertified: 0, explanation: '', architectBy: '', architectDate: ''
    });

    const addChangeOrder = () => setChangeOrders(prev => [...prev, { id: Date.now() }]);
    const removeChangeOrder = (id: number) => setChangeOrders(prev => prev.filter(co => co.id !== id));
    
    const handleForm2Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm2State(prev => ({ ...prev, [name]: value }));
    };

    const handleForm2NumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm2State(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };
    
    const handleForm2CheckboxChange = (field: string) => {
        setForm2State(prev => ({
            ...prev,
            distributedTo: prev.distributedTo.includes(field)
                ? prev.distributedTo.filter(item => item !== field)
                : [...prev.distributedTo, field]
        }));
    };
    
    const calculatedForm2 = useMemo(() => {
        const contractSumToDate = form2State.originalContractSum + form2State.netChangeOrders;
        const totalRetainage = form2State.retainageAmountCompleted + form2State.retainageAmountStored;
        const totalEarnedLessRetainage = form2State.totalCompleted - totalRetainage;
        const currentPaymentDue = totalEarnedLessRetainage - form2State.previousPayments;
        const balanceToFinish = contractSumToDate - totalEarnedLessRetainage;
        return { contractSumToDate, totalRetainage, totalEarnedLessRetainage, currentPaymentDue, balanceToFinish };
    }, [form2State]);

    const handleSave2 = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const form = document.getElementById('payment-cert-form-2');
        if (!form) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not find form to save.' });
            return;
        }

        const changeOrderData = changeOrders.map((co, index) => {
            return {
                number: (form.querySelector(`[name="co_number_${co.id}"]`) as HTMLInputElement)?.value,
                date: (form.querySelector(`[name="co_date_${co.id}"]`) as HTMLInputElement)?.value,
                additions: (form.querySelector(`[name="co_additions_${co.id}"]`) as HTMLInputElement)?.value,
                deductions: (form.querySelector(`[name="co_deductions_${co.id}"]`) as HTMLInputElement)?.value,
            };
        });

        const dataToSave = {
            category: 'Application and Certificate for Payment (Contractor)',
            items: [
                ...Object.entries(form2State).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
                'Change Orders: ' + JSON.stringify(changeOrderData)
            ],
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Application for Payment (Contractor)',
                projectName: form2State.project || 'Untitled Payment Certificate',
                data: [dataToSave],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The payment application has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };
    const handleDownloadPdf2 = () => {
         const doc = new jsPDF() as jsPDFWithAutoTable;
        let y = 15;
        const form = document.getElementById('payment-cert-form-2') as HTMLFormElement;
        if (!form) {
            toast({ variant: 'destructive', title: 'Error', description: 'Form not found for PDF generation.' });
            return;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('APPLICATION AND CERTIFICATE FOR PAYMENT', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 10;

        doc.setFontSize(10);
        doc.autoTable({
            startY: y,
            theme: 'plain',
            body: [
                [`To (Owner): ${form2State.toOwner}`, `Project: ${form2State.project}`],
                [`From (Contractor): ${form2State.fromContractor}`, `VIA (Architect): ${form2State.viaArchitect}`],
                [`Contract For: ${form2State.contractFor}`],
            ],
            styles: { cellPadding: 1 }
        });
        y = (doc as any).autoTable.previous.finalY;

        doc.autoTable({
            startY: y, theme: 'plain',
            body: [[{ content: '', styles: { cellWidth: 100 } }, `Application Number: ${form2State.applicationNumber}`], ['', `Period To: ${form2State.periodTo}`], ['', `Architect's Project No: ${form2State.architectsProjectNo}`], ['', `Contract Date: ${form2State.contractDate}`]],
            styles: { cellPadding: 1 }
        });
        y = (doc as any).autoTable.previous.finalY;
        
        doc.text('Distributed to: ' + form2State.distributedTo.join(', '), 14, y);
        y += 10;
        
        doc.autoTable({
            startY: y, theme: 'grid', head: [['Number', 'Date', 'Additions', 'Deductions']],
            body: changeOrders.map(co => {
                return [
                    (form.elements.namedItem(`co_number_${co.id}`) as HTMLInputElement)?.value,
                    (form.elements.namedItem(`co_date_${co.id}`) as HTMLInputElement)?.value,
                    (form.elements.namedItem(`co_additions_${co.id}`) as HTMLInputElement)?.value,
                    (form.elements.namedItem(`co_deductions_${co.id}`) as HTMLInputElement)?.value
                ];
            }),
            foot: [['Net change by Change Orders', '', '', form2State.netChangeOrders.toFixed(2)]]
        });
        y = (doc as any).autoTable.previous.finalY + 10;
        
        const financialBody = [
            ['1. Original Contract Sum', `Rs. ${form2State.originalContractSum.toFixed(2)}`],
            ['2. Total Net Changes by Change Order', `Rs. ${form2State.netChangeOrders.toFixed(2)}`],
            ['3. Total Contract Sum to Date', `Rs. ${calculatedForm2.contractSumToDate.toFixed(2)}`],
            ['4. Total Completed & Stored to Date', `Rs. ${form2State.totalCompleted.toFixed(2)}`],
            ['5. Retainage:', ''],
            [`   a. ${form2State.retainagePercentCompleted}% of Completed Works`, `Rs. ${form2State.retainageAmountCompleted.toFixed(2)}`],
            [`   b. ${form2State.retainagePercentStored}% of Stored Material`, `Rs. ${form2State.retainageAmountStored.toFixed(2)}`],
            ['   Total Retainage', `Rs. ${calculatedForm2.totalRetainage.toFixed(2)}`],
            ['6. Total Earned Less Retainage', `Rs. ${calculatedForm2.totalEarnedLessRetainage.toFixed(2)}`],
            ['7. Less Previous Certificates for Payments', `Rs. ${form2State.previousPayments.toFixed(2)}`],
            ['8. Current Payment Due', `Rs. ${calculatedForm2.currentPaymentDue.toFixed(2)}`],
            ['9. Balance to Finish, Plus Retainage', `Rs. ${calculatedForm2.balanceToFinish.toFixed(2)}`],
        ];
        doc.autoTable({ startY: y, head: [['Contractor\'s Application for Payment', '']], body: financialBody, theme: 'grid' });
        y = (doc as any).autoTable.previous.finalY + 10;
        
        doc.text(`Contractor: By: ${form2State.contractorBy} Date: ${form2State.contractorDate}`, 14, y);
        y += 15;

        doc.setFont('helvetica', 'bold');
        doc.text("Architect's Project Certificate for Payment", 14, y);
        y += 10;

        doc.autoTable({
            startY: y, theme: 'plain', body: [
                [`State of: ${form2State.stateOf}`, `County of: ${form2State.countyOf}`],
                [`Subscribed and sworn to before me this ${form2State.subscribedDay} day of ${form2State.subscribedMonth}, 20${form2State.subscribedYear}`],
                [`Notary Public: ${form2State.notaryPublic}`],
                [`My Commission expires: ${form2State.commissionExpires}`],
            ]
        });
        y = (doc as any).autoTable.previous.finalY + 5;
        doc.text(`Amounts Certified: Rs. ${form2State.amountsCertified.toFixed(2)}`, 14, y);
        y += 7;
        doc.text(`Architect: By: ${form2State.architectBy} Date: ${form2State.architectDate}`, 14, y);

        doc.save('contractor-payment-certificate.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Application & Certificate for Payment"
                description="Manage payment certificates for your projects."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl text-primary">PROJECT APPLICATION AND PROJECT CERTIFICATE FOR PAYMENT</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* FORM 1: Project Application and Certificate for Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border p-4 rounded-lg">
                        <div>
                            <Label htmlFor="toOwner">To (Owner)</Label><Input id="toOwner" name="toOwner" value={form1State.toOwner} onChange={handleForm1Change} />
                            <Label htmlFor="attention" className="mt-2">Attention</Label><Input id="attention" name="attention" value={form1State.attention} onChange={handleForm1Change} />
                            <Label htmlFor="project" className="mt-2">Project</Label><Input id="project" name="project" value={form1State.project} onChange={handleForm1Change} />
                             <Label htmlFor="constructionManager" className="mt-2">Construction Manager</Label><Input id="constructionManager" name="constructionManager" value={form1State.constructionManager} onChange={handleForm1Change} />
                        </div>
                        <div>
                             <Label htmlFor="applicationNumber">Application Number</Label><Input id="applicationNumber" name="applicationNumber" value={form1State.applicationNumber} onChange={handleForm1Change} />
                            <Label htmlFor="periodFrom" className="mt-2">Period From</Label><Input id="periodFrom" name="periodFrom" type="date" value={form1State.periodFrom} onChange={handleForm1Change} />
                            <Label htmlFor="periodTo" className="mt-2">To</Label><Input id="periodTo" name="periodTo" type="date" value={form1State.periodTo} onChange={handleForm1Change} />
                            <Label htmlFor="architectsProjectNo" className="mt-2">Architect's Project No</Label><Input id="architectsProjectNo" name="architectsProjectNo" value={form1State.architectsProjectNo} onChange={handleForm1Change} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border p-4 rounded-lg">
                        <div>
                            <Label>Distributed to:</Label>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2"><Checkbox id="dist_owner" checked={form1State.distributedTo.includes('Owner')} onCheckedChange={() => handleForm1CheckboxChange('Owner')} /><Label htmlFor="dist_owner">Owner</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="dist_architect" checked={form1State.distributedTo.includes('Architect')} onCheckedChange={() => handleForm1CheckboxChange('Architect')} /><Label htmlFor="dist_architect">Architect</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="dist_cm" checked={form1State.distributedTo.includes('Contractor Manager')} onCheckedChange={() => handleForm1CheckboxChange('Contractor Manager')} /><Label htmlFor="dist_cm">Contractor Manager</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="dist_others" checked={form1State.distributedTo.includes('Others')} onCheckedChange={() => handleForm1CheckboxChange('Others')} /><Label htmlFor="dist_others">Others</Label></div>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold">Application for Payment:</h3>
                            <p className="text-xs text-muted-foreground mt-2">Application is made for Payment, as shown below, in connection with the Project. Project Application Summary, is attached. The present status for the account for all Contractors is for this Project is as follows:</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold">Project Application for Payment</h3>
                            <p className="text-xs text-muted-foreground mt-2">The undersigned Construction Manager certifies that the best of the Construction Manager's knowledge, information and belief Work covered by this Project Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractors for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.</p>
                             <div className="mt-4 space-y-2">
                                <h4 className="font-semibold">Construction Manager:</h4>
                                <div className="flex gap-4">
                                    <Input name="constructionManagerBy" placeholder="By" value={form1State.constructionManagerBy} onChange={handleForm1Change} />
                                    <Input name="constructionManagerDate" type="date" value={form1State.constructionManagerDate} onChange={handleForm1Change} />
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="statusOf" placeholder="State of" value={form1State.statusOf} onChange={handleForm1Change} />
                                    <Input name="countyOf" placeholder="County of" value={form1State.countyOf} onChange={handleForm1Change} />
                                </div>
                                <Input name="subscribedDay" placeholder="Subscribed and sworn to before me this Day of" value={form1State.subscribedDay} onChange={handleForm1Change} />
                                <Input name="notaryPublic" placeholder="Notary Public" value={form1State.notaryPublic} onChange={handleForm1Change} />
                                <Input name="commissionExpires" placeholder="My Commission expires" value={form1State.commissionExpires} onChange={handleForm1Change} />
                            </div>
                        </div>
                        <div className="space-y-2 mt-4 border p-4 rounded-lg">
                            <div className="flex items-center justify-between gap-2"><Label className="flex-1">Total Contract Sum</Label><Input type="number" name="totalContractSum" value={form1State.totalContractSum} onChange={handleForm1NumberChange} className="w-40" /></div>
                            <div className="flex items-center justify-between gap-2"><Label className="flex-1">Total Net Changes by Change Order</Label><Input type="number" name="netChanges" value={form1State.netChanges} onChange={handleForm1NumberChange} className="w-40" /></div>
                            <div className="flex items-center justify-between gap-2 font-bold"><Label className="flex-1">Total Contract Sum to Date</Label><Input readOnly value={contractSumToDate1.toFixed(2)} className="w-40 bg-muted" /></div>
                            <div className="flex items-center justify-between gap-2 pt-4 border-t"><Label className="flex-1">Total Completed & Stored to Date</Label><Input type="number" name="totalCompleted" value={form1State.totalCompleted} onChange={handleForm1NumberChange} className="w-40" /></div>
                            <div className="flex items-center justify-between gap-2"><Label className="flex-1">Retainage</Label><Input type="number" name="retainage" value={form1State.retainage} onChange={handleForm1NumberChange} className="w-40" /></div>
                            <div className="flex items-center justify-between gap-2"><Label className="flex-1">Less Previous Totals Payments</Label><Input type="number" name="previousPayments" value={form1State.previousPayments} onChange={handleForm1NumberChange} className="w-40" /></div>
                            <div className="flex items-center justify-between gap-2 font-bold"><Label className="flex-1">Current Payment Due</Label><Input readOnly value={form1State.currentPaymentDue.toFixed(2)} className="w-40 bg-muted" /></div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                        <div>
                            <h3 className="font-bold">Architect's Project Certificate for Payment:</h3>
                            <p className="text-xs text-muted-foreground mt-2">In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.</p>
                        </div>
                         <div>
                            <div className="flex items-center justify-between gap-2"><Label className="flex-1">Total of Amounts Certified</Label><Input type="number" name="totalCertified" value={form1State.totalCertified} onChange={handleForm1NumberChange} className="w-40" /></div>
                            <Textarea name="explanation" placeholder="Attach explanation if amount certified differs from the amount applies for." className="text-xs mt-2" />
                             <div className="mt-4 space-y-2">
                                <h4 className="font-semibold">Architect:</h4>
                                <div className="flex gap-4">
                                    <Input name="architectBy" placeholder="By" value={form1State.architectBy} onChange={handleForm1Change} />
                                    <Input name="architectDate" type="date" value={form1State.architectDate} onChange={handleForm1Change} />
                                </div>
                            </div>
                         </div>
                     </div>
                     <p className="text-xs text-center text-muted-foreground pt-4 border-t">This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named in Contract Document attached. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.</p>
                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" onClick={handleSave1} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf1}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-12">
              <form id="payment-cert-form-2">
                 <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl text-primary">APPLICATION AND CERTIFICATE FOR PAYMENT (Contractor)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* FORM 2: Application and Certificate for Payment (Contractor version) */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border p-4 rounded-lg">
                        <div>
                            <Label htmlFor="form2_toOwner">To (Owner)</Label><Input id="form2_toOwner" name="toOwner" value={form2State.toOwner} onChange={handleForm2Change} />
                            <Label htmlFor="form2_fromContractor" className="mt-2">From (Contractor)</Label><Input id="form2_fromContractor" name="fromContractor" value={form2State.fromContractor} onChange={handleForm2Change} />
                            <Label htmlFor="form2_contractFor" className="mt-2">Contract For</Label><Input id="form2_contractFor" name="contractFor" value={form2State.contractFor} onChange={handleForm2Change} />
                        </div>
                        <div>
                            <Label htmlFor="form2_project">Project</Label><Input id="form2_project" name="project" value={form2State.project} onChange={handleForm2Change} />
                            <Label htmlFor="form2_viaArchitect" className="mt-2">VIA (Architect)</Label><Input id="form2_viaArchitect" name="viaArchitect" value={form2State.viaArchitect} onChange={handleForm2Change} />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div><Label htmlFor="form2_applicationNumber">Application Number</Label><Input id="form2_applicationNumber" name="applicationNumber" value={form2State.applicationNumber} onChange={handleForm2Change} /></div>
                            <div><Label htmlFor="form2_periodTo">Period To</Label><Input id="form2_periodTo" name="periodTo" type="date" value={form2State.periodTo} onChange={handleForm2Change} /></div>
                            <div><Label htmlFor="form2_architectsProjectNo">Architect's Project No</Label><Input id="form2_architectsProjectNo" name="architectsProjectNo" value={form2State.architectsProjectNo} onChange={handleForm2Change} /></div>
                            <div><Label htmlFor="form2_contractDate">Contract Date</Label><Input id="form2_contractDate" name="contractDate" type="date" value={form2State.contractDate} onChange={handleForm2Change} /></div>
                        </div>
                         <div>
                            <Label>Distributed to:</Label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <div className="flex items-center gap-2"><Checkbox id="form2_dist_owner" checked={form2State.distributedTo.includes('Owner')} onCheckedChange={() => handleForm2CheckboxChange('Owner')} /><Label htmlFor="form2_dist_owner">Owner</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="form2_dist_architect" checked={form2State.distributedTo.includes('Architect')} onCheckedChange={() => handleForm2CheckboxChange('Architect')} /><Label htmlFor="form2_dist_architect">Architect</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="form2_dist_contractor" checked={form2State.distributedTo.includes('Contractor')} onCheckedChange={() => handleForm2CheckboxChange('Contractor')} /><Label htmlFor="form2_dist_contractor">Contractor</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="form2_dist_others" checked={form2State.distributedTo.includes('Others')} onCheckedChange={() => handleForm2CheckboxChange('Others')} /><Label htmlFor="form2_dist_others">Others</Label></div>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold">Contractor's Application for Payment</h3>
                            <Card>
                                <CardHeader><CardTitle className="text-base">Change Order Summary</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Additions</TableHead><TableHead>Deductions</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {changeOrders.map(co => <ChangeOrderRow key={co.id} id={co.id} onRemove={removeChangeOrder} />)}
                                        </TableBody>
                                    </Table>
                                    <Button size="sm" onClick={addChangeOrder} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                                    <div className="flex justify-between mt-2 pt-2 border-t">
                                        <Label>Net change by Change Orders</Label>
                                        <Input name="netChangeOrders" type="number" value={form2State.netChangeOrders} onChange={handleForm2NumberChange} className="w-40" />
                                    </div>
                                </CardContent>
                            </Card>
                            <p className="text-xs text-muted-foreground">The undersigned Contractor certifies that to the best of the Contractor's knowledge, information and belief the Work covered by this Application for Payment has been completed in accordance with the Contract Documents...</p>
                            <div className="flex items-center gap-4">
                                <Label>Contractor:</Label>
                                <Input name="contractorBy" placeholder="By" value={form2State.contractorBy} onChange={handleForm2Change} />
                                <Input name="contractorDate" type="date" value={form2State.contractorDate} onChange={handleForm2Change} />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <p className="text-xs text-muted-foreground">Application is made for Payment, as shown below, in connection with the Contract. Continuation Sheet, is attached.</p>
                             <div className="flex justify-between items-center"><Label>1. Original Contract Sum</Label><span>Rs. <Input type="number" name="originalContractSum" value={form2State.originalContractSum} onChange={handleForm2NumberChange} className="inline-w-32" /></span></div>
                             <div className="flex justify-between items-center"><Label>2. Total Net Changes by Change Order</Label><span>Rs. {form2State.netChangeOrders.toFixed(2)}</span></div>
                             <div className="flex justify-between items-center font-bold"><Label>3. Total Contract Sum to Date (Line 1 ± 2)</Label><span>Rs. {calculatedForm2.contractSumToDate.toFixed(2)}</span></div>
                             <div className="flex justify-between items-center"><Label>4. Total Completed & Stored to Date</Label><span>Rs. <Input type="number" name="totalCompleted" value={form2State.totalCompleted} onChange={handleForm2NumberChange} className="inline-w-32" /></span></div>
                             <div>
                                <Label>5. Retainage:</Label>
                                <div className="pl-4">
                                     <div className="flex items-center gap-2"><Input type="number" name="retainagePercentCompleted" value={form2State.retainagePercentCompleted} onChange={handleForm2NumberChange} className="w-16" />% of Completed Works <span>Rs. <Input type="number" name="retainageAmountCompleted" value={form2State.retainageAmountCompleted} onChange={handleForm2NumberChange} className="inline-w-24" /></span></div>
                                     <div className="flex items-center gap-2"><Input type="number" name="retainagePercentStored" value={form2State.retainagePercentStored} onChange={handleForm2NumberChange} className="w-16" />% of Stored Material <span>Rs. <Input type="number" name="retainageAmountStored" value={form2State.retainageAmountStored} onChange={handleForm2NumberChange} className="inline-w-24" /></span></div>
                                     <div className="flex justify-between items-center font-bold"><Label>Total Retainage</Label><span>Rs. {calculatedForm2.totalRetainage.toFixed(2)}</span></div>
                                </div>
                             </div>
                              <div className="flex justify-between items-center font-bold"><Label>6. Total Earned Less Retainage (Line 4 Less 5 Total)</Label><span>Rs. {calculatedForm2.totalEarnedLessRetainage.toFixed(2)}</span></div>
                              <div className="flex justify-between items-center"><Label>7. Less Previous Certificates for Payments</Label><span>Rs. <Input type="number" name="previousPayments" value={form2State.previousPayments} onChange={handleForm2NumberChange} className="inline-w-32" /></span></div>
                              <div className="flex justify-between items-center font-bold"><Label>8. Current Payment Due</Label><span>Rs. {calculatedForm2.currentPaymentDue.toFixed(2)}</span></div>
                              <div className="flex justify-between items-center font-bold"><Label>9. Balance to Finish, Plus Retainage</Label><span>Rs. {calculatedForm2.balanceToFinish.toFixed(2)}</span></div>
                        </div>
                    </div>
                     <div className="border-t pt-6 space-y-4">
                        <h3 className="font-bold">Architect's Project Certificate for Payment:</h3>
                         <p className="text-xs text-muted-foreground">In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated...</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">State of: <Input name="stateOf" value={form2State.stateOf} onChange={handleForm2Change} /> County of: <Input name="countyOf" value={form2State.countyOf} onChange={handleForm2Change} /></div>
                                <div>Subscribed and sworn to before me this <Input name="subscribedDay" className="inline-w-16" value={form2State.subscribedDay} onChange={handleForm2Change} /> day of <Input name="subscribedMonth" className="inline-w-24" value={form2State.subscribedMonth} onChange={handleForm2Change} />, 20<Input name="subscribedYear" className="inline-w-16" value={form2State.subscribedYear} onChange={handleForm2Change} /></div>
                                <Label htmlFor="form2_notaryPublic">Notary Public:</Label><Input id="form2_notaryPublic" name="notaryPublic" value={form2State.notaryPublic} onChange={handleForm2Change} />
                                <Label htmlFor="form2_commissionExpires">My Commission expires:</Label><Input id="form2_commissionExpires" name="commissionExpires" value={form2State.commissionExpires} onChange={handleForm2Change} />
                            </div>
                            <div className="space-y-2">
                                 <div className="flex justify-between items-center"><Label>Amounts Certified</Label><span>Rs. <Input type="number" name="amountsCertified" value={form2State.amountsCertified} onChange={handleForm2NumberChange} className="inline-w-32" /></span></div>
                                <Textarea name="explanation" placeholder="Attach explanation if amount certified differs from the amount applies for." className="text-xs" value={form2State.explanation} onChange={handleForm2Change} />
                                <div className="flex items-center gap-4 pt-4">
                                    <Label>Architect:</Label>
                                    <Input name="architectBy" placeholder="By" value={form2State.architectBy} onChange={handleForm2Change} />
                                    <Input name="architectDate" type="date" value={form2State.architectDate} onChange={handleForm2Change} />
                                </div>
                            </div>
                         </div>
                         <p className="text-xs text-center text-muted-foreground pt-4">This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named herein. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.</p>
                     </div>
                </CardContent>
                 <CardFooter className="flex justify-end gap-4">
                    <Button type="button" onClick={handleSave2} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                    <Button type="button" onClick={handleDownloadPdf2}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </CardFooter>
              </form>
            </Card>
        </div>
    );
}

