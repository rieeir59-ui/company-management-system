'use client';

import { useState, useEffect } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

const SummaryRow = ({ label, id, value, onChange, placeholder, isCalculated = false, unit = '' }: { label: React.ReactNode, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, isCalculated?: boolean, unit?: string }) => (
    <div className="grid grid-cols-3 items-center gap-4 py-2 border-b">
        <Label htmlFor={id} className="font-semibold">{label}</Label>
        <div className="col-span-2 flex items-center gap-2">
            {unit && <span className="text-muted-foreground">{unit}</span>}
            <Input
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={isCalculated}
                className={isCalculated ? "bg-muted/50 font-bold border-0" : ""}
            />
        </div>
    </div>
);

export default function Page() {
    const image = PlaceHolderImages.find(p => p.id === 'project-application-summary');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [formState, setFormState] = useState({
        applicationNumber: '',
        applicationDate: '',
        periodFrom: '',
        periodTo: '',
        architectsProjectNo: '',
        contractorName: '',
        totalsThisPage: '',
        portionOfWork: '',
        originalContractSum: '',
        netChangeOrders: '',
        workInPlace: '',
        storedMaterials: '',
        retainagePercentage: '',
        previousPayments: '',
    });

    const [calculated, setCalculated] = useState({
        contractSumToDate: '',
        totalCompletedAndStored: '',
        retainageAmount: '',
        currentPaymentDue: '',
        balanceToFinish: '',
        percentComplete: '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    useEffect(() => {
        const C = parseFloat(formState.originalContractSum) + parseFloat(formState.netChangeOrders);
        const F = parseFloat(formState.workInPlace) + parseFloat(formState.storedMaterials);
        const H = F * (parseFloat(formState.retainagePercentage) / 100);
        const J = F - H - parseFloat(formState.previousPayments);
        const K = C - F;
        const L = (F / C) * 100;

        setCalculated({
            contractSumToDate: isNaN(C) ? '' : C.toFixed(2),
            totalCompletedAndStored: isNaN(F) ? '' : F.toFixed(2),
            retainageAmount: isNaN(H) ? '' : H.toFixed(2),
            currentPaymentDue: isNaN(J) ? '' : J.toFixed(2),
            balanceToFinish: isNaN(K) ? '' : K.toFixed(2),
            percentComplete: isNaN(L) ? '' : L.toFixed(2),
        });

    }, [formState]);
    
    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            category: 'Project Application Summary',
            items: [
                ...Object.entries(formState).map(([key, value]) => `${key}: ${value}`),
                ...Object.entries(calculated).map(([key, value]) => `${key}: ${value}`),
            ],
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Project Application Summary',
                projectName: formState.contractorName || 'Untitled Summary',
                data: [dataToSave],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The application summary has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT APPLICATION SUMMARY', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        const headerInfo = [
            `Application Number: ${formState.applicationNumber}`, `Application Date: ${formState.applicationDate}`,
            `Period From: ${formState.periodFrom}`, `To: ${formState.periodTo}`,
            `Architect's Project No: ${formState.architectsProjectNo}`
        ];
        doc.text(headerInfo, 14, yPos);
        yPos += headerInfo.length * 5 + 5;
        
        const body = [
            ['Contractor Name', formState.contractorName],
            ['Totals this Page or all Pages', formState.totalsThisPage],
            ['Portion of Work', formState.portionOfWork],
            ['A. Original Contract Sum', calculated.contractSumToDate ? `Rs. ${formState.originalContractSum}` : formState.originalContractSum],
            ['B. Net Change Orders to Date', formState.netChangeOrders],
            ['C. Contract Sum to Date', calculated.contractSumToDate ? `Rs. ${calculated.contractSumToDate}` : ''],
            ['D. Work In Place to Date', formState.workInPlace],
            ['E. Stored Materials (Not in D or I)', formState.storedMaterials],
            ['F. Total Completed & Stored to Date (D+E)', calculated.totalCompletedAndStored ? `Rs. ${calculated.totalCompletedAndStored}` : ''],
            ['G. Retainage Percentage', `${formState.retainagePercentage}%`],
            ['H. Retainage Amount', calculated.retainageAmount ? `Rs. ${calculated.retainageAmount}`: ''],
            ['I. Previous Payments', formState.previousPayments],
            ['J. Current Payment Due (F-H-I)', calculated.currentPaymentDue ? `Rs. ${calculated.currentPaymentDue}`: ''],
            ['K. Balance to Finish (C-F)', calculated.balanceToFinish ? `Rs. ${calculated.balanceToFinish}` : ''],
            ['L. Percent Complete (F÷C)', calculated.percentComplete ? `${calculated.percentComplete}%` : ''],
        ];

        doc.autoTable({
            startY: yPos,
            head: [['Description', 'Amount']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [45, 95, 51] }
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save('project-application-summary.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Project Application Summary"
                description="Review project application summaries."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                 <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">Project Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           <Input placeholder="Application Number" name="applicationNumber" value={formState.applicationNumber} onChange={handleChange} />
                           <Input type="date" name="applicationDate" value={formState.applicationDate} onChange={handleChange} />
                           <Input placeholder="Architect's Project No" name="architectsProjectNo" value={formState.architectsProjectNo} onChange={handleChange} />
                           <Input type="date" name="periodFrom" value={formState.periodFrom} onChange={handleChange} />
                           <Input type="date" name="periodTo" value={formState.periodTo} onChange={handleChange} />
                        </div>
                        <SummaryRow label="Contractor Name" id="contractorName" value={formState.contractorName} onChange={handleChange} />
                        <SummaryRow label="Totals this Page or all Pages" id="totalsThisPage" value={formState.totalsThisPage} onChange={handleChange} />
                        <SummaryRow label="Portion of Work" id="portionOfWork" value={formState.portionOfWork} onChange={handleChange} />
                        
                        <div className="pt-4 mt-4 border-t">
                            <SummaryRow label="A. Original Contract Sum" id="originalContractSum" value={formState.originalContractSum} onChange={handleChange} unit="Rs." />
                            <SummaryRow label="B. Net Change Orders to Date" id="netChangeOrders" value={formState.netChangeOrders} onChange={handleChange} unit="Rs." />
                            <SummaryRow label="C. Contract Sum to Date" id="contractSumToDate" value={calculated.contractSumToDate} onChange={() => {}} isCalculated unit="Rs." />
                            <SummaryRow label="D. Work In Place to Date" id="workInPlace" value={formState.workInPlace} onChange={handleChange} unit="Rs." />
                            <SummaryRow label="E. Stored Materials (Not in D or I)" id="storedMaterials" value={formState.storedMaterials} onChange={handleChange} unit="Rs." />
                            <SummaryRow label="F. Total Completed & Stored to Date (D+E)" id="totalCompletedAndStored" value={calculated.totalCompletedAndStored} onChange={() => {}} isCalculated unit="Rs." />
                            <SummaryRow label="G. Retainage Percentage" id="retainagePercentage" value={formState.retainagePercentage} onChange={handleChange} unit="%" />
                            <SummaryRow label="H. Retainage Amount" id="retainageAmount" value={calculated.retainageAmount} onChange={() => {}} isCalculated unit="Rs." />
                            <SummaryRow label="I. Previous Payments" id="previousPayments" value={formState.previousPayments} onChange={handleChange} unit="Rs." />
                            <SummaryRow label="J. Current Payment Due (F-H-I)" id="currentPaymentDue" value={calculated.currentPaymentDue} onChange={() => {}} isCalculated unit="Rs." />
                            <SummaryRow label="K. Balance to Finish (C-F)" id="balanceToFinish" value={calculated.balanceToFinish} onChange={() => {}} isCalculated unit="Rs." />
                            <SummaryRow label="L. Percent Complete (F÷C)" id="percentComplete" value={calculated.percentComplete} onChange={() => {}} isCalculated unit="%" />
                        </div>
                    </form>
                    <div className="flex justify-end gap-4 mt-8">
                        <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
