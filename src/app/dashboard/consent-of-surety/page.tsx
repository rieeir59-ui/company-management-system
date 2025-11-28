'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download } from 'lucide-react';
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


const Section = ({ title, children, className }: { title?: string; children: React.ReactNode, className?: string }) => (
  <div className={`mb-6 ${className}`}>
    {title && <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const FormCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-center font-headline text-2xl text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const RetainageForm = () => {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    
    const handleSave = () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Consent of Surety (Retainage)',
            projectName: getVal('retain_project_name') || 'Untitled Retainage Consent',
            data: [{
                category: 'Consent of Surety to Reduction in or Partial Release of Retainage',
                items: [
                    `Project Name: ${getVal('retain_project_name')}`,
                    `Architects Project No: ${getVal('retain_architect_no')}`,
                    `Contract For: ${getVal('retain_contract_for')}`,
                    `Contract Date: ${getVal('retain_contract_date')}`,
                    `To (Owner): ${getVal('retain_owner_to')}`,
                    `Surety Name: ${getVal('retain_surety_name')}`,
                    `Contractor Name: ${getVal('retain_contractor_name')}`,
                    `Approval Details: ${getVal('retain_approval_details')}`,
                    `Owner Name (in agreement): ${getVal('retain_owner_name')}`,
                    `Witness Day: ${getVal('retain_day')}`,
                    `Witness Year: ${getVal('retain_year')}`,
                ],
            }],
            createdAt: serverTimestamp(),
        };

        addDoc(collection(firestore, 'savedRecords'), dataToSave)
            .then(() => {
                toast({ title: 'Record Saved', description: 'The retainage consent has been saved.' });
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
    const handleDownload = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 20;

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '________________';
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(45, 95, 51); // Primary color
        doc.text('CONSENT OF SURETY TO REDUCTION IN OR PARTIAL RELEASE OF RETAINAGE', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;
        doc.setTextColor(0,0,0);

        doc.setFontSize(10);
        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                [`Project: ${getVal('retain_project_name')}`, `Architects Project No: ${getVal('retain_architect_no')}`],
                [`(Name, Address): ${getVal('retain_project_address')}`, `Contract For: ${getVal('retain_contract_for')}`],
                ['', `Contract Date: ${getVal('retain_contract_date')}`],
            ],
        });
        yPos = doc.autoTable.previous.finalY + 5;
        
        doc.text('To (Owner):', 14, yPos);
        yPos += 5;
        doc.rect(14, yPos, 90, 25);
        doc.text(doc.splitTextToSize(getVal('retain_owner_to'), 85), 16, yPos + 5);
        yPos += 35;
        
        const bodyText1 = `In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the (here insert named and address of Surety as it appears in the bond).`;
        const bodyText2 = `On bond of (here insert named and address of Contractor as it appears in the bond).`;
        const bodyText3 = `Hereby approves the reduction in or partial release of retainage to the Contractor as follows:`;
        const bodyText4 = `The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to (here insert named and address of Owner).`;
        const bodyText5 = `As set forth in the said Surety's bond.`;

        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1 },
            body: [
                [bodyText1],
                [{ content: getVal('retain_surety_name'), styles: { fontStyle: 'bold' } }],
                [', SURETY,'],
                [bodyText2],
                [{ content: getVal('retain_contractor_name'), styles: { fontStyle: 'bold' } }],
                [', CONTRACTOR,'],
                [bodyText3],
                [{ content: getVal('retain_approval_details'), styles: { fontStyle: 'italic' } }],
                [bodyText4],
                [{ content: getVal('retain_owner_name'), styles: { fontStyle: 'bold' } }],
                [', OWNER,'],
                [bodyText5],
            ],
        });
        yPos = doc.autoTable.previous.finalY + 10;
        
        doc.text(`In Witness Whereof, The Surety has hereunto set its hand this day of ${getVal('retain_day')} , 20 ${getVal('retain_year')}`, 14, yPos);
        yPos += 20;

        doc.text(`Surety: ____________________`, 14, yPos);
        yPos += 10;
        doc.text(`Signature of Authorized Representative: ____________________`, 14, yPos);
        yPos += 10;
        doc.text(`Title: ____________________`, 14, yPos);

        doc.save('Consent-Retainage.pdf');
        toast({ title: 'Download Started', description: 'Consent for Retainage PDF is being generated.' });
    };

    return (
        <FormCard title="Consent of Surety to Reduction in or Partial Release of Retainage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input id="retain_project_name" placeholder="Project Name" />
                <Input id="retain_project_address" placeholder="Project Address" />
                <Input id="retain_architect_no" placeholder="Architects Project No" />
                <Input id="retain_contract_for" placeholder="Contract For" />
                <Input id="retain_contract_date" type="date" />
            </div>
            <Label htmlFor="retain_owner_to">To: (Owner)</Label>
            <Textarea id="retain_owner_to" placeholder="Owner's Name and Address" />
            <p className="text-sm mt-4">In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the</p>
            <Input id="retain_surety_name" placeholder="(here insert named and address of Surety as it appears in the bond)" className="my-2" />
            <p>, SURETY,</p>
            <p className="text-sm mt-2">On bond of</p>
            <Input id="retain_contractor_name" placeholder="(here insert named and address of Contractor as it appears in the bond)" className="my-2" />
            <p>, CONTRACTOR,</p>
            <p className="text-sm mt-2">Hereby approves the reduction in or partial release of retainage to the Contractor as follows:</p>
            <Textarea id="retain_approval_details" className="my-2" />
             <p className="text-sm mt-2">The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to</p>
             <Input id="retain_owner_name" placeholder="(here insert named and address of Owner)" className="my-2" />
            <p>, OWNER,</p>
            <p className="text-sm mt-2">As set forth in the said Surety's bond.</p>
            <div className="flex items-center gap-2 mt-4">In Witness Whereof, The Surety has hereunto set its hand this day of <Input id="retain_day" className="w-24" />, 20 <Input id="retain_year" className="w-20" /></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Input id="retain_surety_final" placeholder="Surety" />
                <Input id="retain_title" placeholder="Title" />
            </div>
            <div className="mt-4">Signature of Authorized Representative: ____________________</div>
            <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            </div>
        </FormCard>
    );
};

const FinalPaymentForm = () => {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    
    const handleSave = () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Consent of Surety (Final Payment)',
            projectName: getVal('final_project_name') || 'Untitled Final Payment Consent',
            data: [{
                category: 'Consent of Surety Company to Final Payment',
                items: [
                    `Project Name: ${getVal('final_project_name')}`,
                    `Architects Project No: ${getVal('final_architect_no')}`,
                    `Contract For: ${getVal('final_contract_for')}`,
                    `Contract Date: ${getVal('final_contract_date')}`,
                    `To (Owner): ${getVal('final_owner_to')}`,
                    `Surety Name: ${getVal('final_surety_name')}`,
                    `Contractor Name: ${getVal('final_contractor_name')}`,
                    `Owner Name (in agreement): ${getVal('final_owner_name')}`,
                    `Witness Day: ${getVal('final_day')}`,
                    `Witness Year: ${getVal('final_year')}`,
                ],
            }],
            createdAt: serverTimestamp(),
        };

        addDoc(collection(firestore, 'savedRecords'), dataToSave)
            .then(() => {
                toast({ title: 'Record Saved', description: 'The final payment consent has been saved.' });
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

    const handleDownload = () => {
         const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 20;

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '________________';
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(45, 95, 51); // Primary color
        doc.text('CONSENT OF SURETY COMPANY TO FINAL PAYMENT', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;
        doc.setTextColor(0,0,0);

        doc.setFontSize(10);
        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                [`Project: ${getVal('final_project_name')}`, `Architects Project No: ${getVal('final_architect_no')}`],
                [`(Name, Address): ${getVal('final_project_address')}`, `Contract For: ${getVal('final_contract_for')}`],
                ['', `Contract Date: ${getVal('final_contract_date')}`],
            ]
        });
        yPos = doc.autoTable.previous.finalY + 5;
        
        doc.text('To (Owner):', 14, yPos);
        yPos += 5;
        doc.rect(14, yPos, 90, 25);
        doc.text(doc.splitTextToSize(getVal('final_owner_to'), 85), 16, yPos + 5);
        yPos += 35;
        
        const bodyText1 = `In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the`;
        const bodyText2 = `On bond of`;
        const bodyText3 = `Hereby approves the final payment to the Contractor, and agrees that final payment to the Contractor shall not relieve the Surety Company of any of its obligations to`;
        const bodyText4 = `As set forth in the said Surety's bond.`;

        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1 },
            body: [
                [bodyText1],
                [{ content: getVal('final_surety_name'), styles: { fontStyle: 'bold' } }],
                [', SURETY COMPANY,'],
                [bodyText2],
                [{ content: getVal('final_contractor_name'), styles: { fontStyle: 'bold' } }],
                [', CONTRACTOR,'],
                [bodyText3],
                [{ content: getVal('final_owner_name'), styles: { fontStyle: 'bold' } }],
                [', OWNER,'],
                [bodyText4],
            ]
        });
        yPos = doc.autoTable.previous.finalY + 10;
        
        doc.text(`In Witness Whereof, The Surety has hereunto set its hand this day of ${getVal('final_day')} , 20 ${getVal('final_year')}`, 14, yPos);
        yPos += 20;

        doc.text(`Surety Company: ____________________`, 14, yPos);
        yPos += 10;
        doc.text(`Signature of Authorized Representative: ____________________`, 14, yPos);
        yPos += 10;
        doc.text(`Title: ____________________`, 14, yPos);

        doc.save('Consent-FinalPayment.pdf');
        toast({ title: 'Download Started', description: 'Consent for Final Payment PDF is being generated.' });
    };

    return (
         <FormCard title="Consent of Surety Company to Final Payment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input id="final_project_name" placeholder="Project Name" />
                <Input id="final_project_address" placeholder="Project Address" />
                <Input id="final_architect_no" placeholder="Architects Project No" />
                <Input id="final_contract_for" placeholder="Contract For" />
                <Input id="final_contract_date" type="date" />
            </div>
            <Label htmlFor="final_owner_to">To: (Owner)</Label>
            <Textarea id="final_owner_to" placeholder="Owner's Name and Address" />
            <p className="text-sm mt-4">In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the</p>
            <Input id="final_surety_name" placeholder="(here insert named and address of Surety Company)" className="my-2" />
            <p>, SURETY COMPANY,</p>
            <p className="text-sm mt-2">On bond of</p>
            <Input id="final_contractor_name" placeholder="(here insert named and address of Contractor)" className="my-2" />
            <p>, CONTRACTOR,</p>
            <p className="text-sm mt-2">Hereby approves the final payment to the Contractor, and agrees that final payment to the Contractor shall not relieve the Surety Company of any of its obligations to</p>
             <Input id="final_owner_name" placeholder="(here insert named and address of Owner)" className="my-2" />
            <p>, OWNER,</p>
            <p className="text-sm mt-2">As set forth in the said Surety's bond.</p>
            <div className="flex items-center gap-2 mt-4">In Witness Whereof, The Surety has hereunto set its hand this day of <Input id="final_day" className="w-24" />, 20 <Input id="final_year" className="w-20" /></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Input id="final_surety_final" placeholder="Surety Company" />
                <Input id="final_title" placeholder="Title" />
            </div>
            <div className="mt-4">Signature of Authorized Representative: ____________________</div>
             <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            </div>
        </FormCard>
    );
};

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'consent-of-surety');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Consent of Surety"
        description="Manage consent of surety for retainage and final payment."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <div className="space-y-8">
        <RetainageForm />
        <FinalPaymentForm />
      </div>
    </div>
  );
}
