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

export default function ProposalRequestPage() {
    const image = PlaceHolderImages.find(p => p.id === 'proposal-request');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [formState, setFormState] = useState({
        projectName: '',
        projectAddress: '',
        proposalNo: '',
        date: '',
        architectsProjectNo: '',
        contractFor: '',
        owner: '',
        contractDate: '',
        contractor: '',
        description: '',
        attachments: '',
        architectBy: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to save a record.',
            });
            return;
        }

        const recordData = Object.entries(formState).map(([key, value]) => ({
            field: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: value || 'N/A'
        }));

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Proposal Request',
                projectName: formState.projectName || `Proposal #${formState.proposalNo}`,
                data: [{ category: "Proposal Request Details", items: recordData.map(d => `${d.field}: ${d.value}`) }],
                createdAt: serverTimestamp(),
            });
            toast({
                title: "Record Saved",
                description: "The proposal request has been saved.",
            });
        } catch (error) {
            console.error("Error saving record:", error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save the proposal request.',
            });
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";

        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROPOSAL REQUEST', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const addLine = (label: string, value: string, y: number, x: number) => {
            doc.text(`${label}: ${value}`, x, y);
        };

        const col1X = 14;
        const col2X = 120;

        addLine('Project', `${formState.projectName}, ${formState.projectAddress}`, yPos, col1X);
        addLine('Proposal Request No.', formState.proposalNo, yPos, col2X);
        yPos += 7;

        addLine("Architect's Project No.", formState.architectsProjectNo, yPos, col1X);
        addLine('Date', formState.date, yPos, col2X);
        yPos += 7;

        addLine('Contract For', formState.contractFor, yPos, col1X);
        addLine('Contract Date', formState.contractDate, yPos, col2X);
        yPos += 7;
        
        addLine('Owner', formState.owner, yPos, col1X);
        yPos += 10;

        doc.text('To: (Contractor)', col1X, yPos);
        yPos += 5;
        doc.rect(col1X, yPos, 90, 25);
        const contractorLines = doc.splitTextToSize(formState.contractor, 85);
        doc.text(contractorLines, col1X + 2, yPos + 5);
        yPos += 35;

        doc.setFont('helvetica', 'bold');
        doc.text('Description:', col1X, yPos);
        yPos += 5;
        const descriptionLines = doc.splitTextToSize(formState.description, doc.internal.pageSize.width - (col1X * 2));
        doc.text(descriptionLines, col1X, yPos);
        yPos += descriptionLines.length * 5 + 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Attachments:', col1X, yPos);
        yPos += 5;
        const attachmentLines = doc.splitTextToSize(formState.attachments, doc.internal.pageSize.width - (col1X * 2));
        doc.text(attachmentLines, col1X, yPos);
        yPos += attachmentLines.length * 5 + 15;

        doc.setFont('helvetica', 'normal');
        const note1 = "Please submit an itemized quotation for changes in the Contract Sum and/or Time incidental to proposed modifications to the Contract Documents described herein.";
        const splitNote1 = doc.splitTextToSize(note1, doc.internal.pageSize.width - (col1X * 2));
        doc.text(splitNote1, col1X, yPos);
        yPos += splitNote1.length * 5 + 5;

        doc.setFont('helvetica', 'bold');
        const note2 = "THIS IS NOT A CHANGE ORDER NOT A DIRECTION TO PROCEED WITH THE WORK DESCRIBED HEREIN.";
        doc.text(note2, col1X, yPos);
        yPos += 15;

        doc.setFont('helvetica', 'normal');
        doc.text(`Architect:`, col1X, yPos);
        doc.text(`By: ${formState.architectBy}`, col1X + 50, yPos);
        yPos += 20;

        const addSignatureLine = (label: string) => {
            doc.line(col1X, yPos, col1X + 60, yPos);
            yPos += 5;
            doc.text(label, col1X, yPos);
            yPos += 10;
        };

        addSignatureLine('Owner');
        addSignatureLine('Architect');
        addSignatureLine('Contractor');
        addSignatureLine('Field');
        addSignatureLine('Other');

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }


        doc.save('proposal-request.pdf');
        toast({
            title: "Download Started",
            description: "Your proposal request PDF is being generated.",
        });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Proposal Request"
                description="Create and manage proposal requests."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">Proposal Request</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="projectName">Project (Name)</Label>
                                <Input id="projectName" name="projectName" value={formState.projectName} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="projectAddress">Project (Address)</Label>
                                <Input id="projectAddress" name="projectAddress" value={formState.projectAddress} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="proposalNo">Proposal Request No.</Label>
                                <Input id="proposalNo" name="proposalNo" value={formState.proposalNo} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" name="date" type="date" value={formState.date} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="architectsProjectNo">Architect's Project No.</Label>
                                <Input id="architectsProjectNo" name="architectsProjectNo" value={formState.architectsProjectNo} onChange={handleChange} />
                            </div>
                             <div>
                                <Label htmlFor="contractFor">Contract For</Label>
                                <Input id="contractFor" name="contractFor" value={formState.contractFor} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="owner">Owner</Label>
                                <Input id="owner" name="owner" value={formState.owner} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="contractDate">Contract Date</Label>
                                <Input id="contractDate" name="contractDate" type="date" value={formState.contractDate} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="contractor">To: (Contractor)</Label>
                            <Textarea id="contractor" name="contractor" rows={4} placeholder="Enter contractor's name and address" value={formState.contractor} onChange={handleChange} />
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Written description of the Work)</Label>
                            <Textarea id="description" name="description" rows={5} value={formState.description} onChange={handleChange} />
                        </div>

                        <div>
                            <Label htmlFor="attachments">Attachments (List attached documents that support description)</Label>
                            <Textarea id="attachments" name="attachments" rows={3} value={formState.attachments} onChange={handleChange} />
                        </div>
                        
                        <div className="text-center space-y-4 py-4 border-y-2 border-dashed border-primary/50">
                            <p className="font-semibold">Please submit an itemized quotation for changes in the Contract Sum and/or Time incidental to proposed modifications to the Contract Documents described herein.</p>
                            <p className="font-bold text-lg text-destructive">THIS IS NOT A CHANGE ORDER NOT A DIRECTION TO PROCEED WITH THE WORK DESCRIBED HEREIN.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="architectBy">Architect By:</Label>
                                <Input id="architectBy" name="architectBy" value={formState.architectBy} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 pt-8">
                            <div className="space-y-2">
                                <div className="h-16 border-b border-foreground"></div>
                                <p className="text-center font-semibold">Owner</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 border-b border-foreground"></div>
                                <p className="text-center font-semibold">Architect</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 border-b border-foreground"></div>
                                <p className="text-center font-semibold">Contractor</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 border-b border-foreground"></div>
                                <p className="text-center font-semibold">Field</p>
                            </div>
                             <div className="space-y-2">
                                <div className="h-16 border-b border-foreground"></div>
                                <p className="text-center font-semibold">Other</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-8">
                            <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
