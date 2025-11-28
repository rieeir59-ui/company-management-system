
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
    const image = PlaceHolderImages.find(p => p.id === 'architects-instructions');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [projectName, setProjectName] = useState('');

    const [formState, setFormState] = useState({
        projectName: '',
        projectAddress: '',
        instructionNo: '',
        dateOfIssuance: '',
        architects: '',
        architectsProjectNo: '',
        contractFor: '',
        contractDate: '',
        owner: '',
        toContractor: '',
        description: '',
        attachments: '',
        issuedBy: '',
        issuedDate: '',
        acceptedBy: '',
        acceptedDate: '',
        copiesTo: [] as string[],
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [e.target.name]: value }));
        if (name === 'projectName') {
            setProjectName(value);
        }
    };

    const handleCheckboxChange = (field: string) => {
        setFormState(prev => {
            const currentTo = prev.copiesTo;
            if (currentTo.includes(field)) {
                return { ...prev, copiesTo: currentTo.filter(item => item !== field) };
            }
            return { ...prev, copiesTo: [...currentTo, field] };
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
            fileName: "Architect's Supplemental Instructions",
            projectName: projectName || 'Untitled Instruction',
            data: {
                category: "Architect's Supplemental Instructions",
                items: Object.entries(formState).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            },
            createdAt: serverTimestamp(),
        };
        
        addDoc(collection(firestore, 'savedRecords'), dataToSave)
            .then(() => {
                toast({ title: 'Record Saved', description: "The supplemental instruction has been saved." });
                setIsSaveOpen(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: `savedRecords`,
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

        let yPos = 20;
        const primaryColor = [45, 95, 51]; 

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("ARCHITECT'S SUPPLEMENTAL INSTRUCTIONS", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;
        doc.setTextColor(0,0,0);
        
        doc.setFontSize(10);
        doc.autoTable({
            startY: yPos, theme: 'plain',
            body: [
                [`Project: ${formState.projectName}, ${formState.projectAddress}`, `Architect's Supplemental Instruction No. ${formState.instructionNo}`],
                [`Architects: ${formState.architects}`, `Date of Issuance: ${formState.dateOfIssuance}`],
                [`Architects Project No: ${formState.architectsProjectNo}`, ''],
                [`Contract For: ${formState.contractFor}`, `Contract Date: ${formState.contractDate}`],
                [`Owner: ${formState.owner}`, ''],
            ]
        });
        yPos = (doc as any).autoTable.previous.finalY + 5;

        doc.text('To: (Contractor)', 14, yPos);
        yPos += 5;
        doc.rect(14, yPos, 90, 25);
        doc.text(doc.splitTextToSize(formState.toContractor, 85), 16, yPos + 5);
        yPos += 30;

        const instructionText = "The Work shall be carried out in accordance with the following supplemental instructions issued in accordance with the contract Documents without change in Contract Sum or Contract Time. Prior to proceeding in accordance with these instructions, indicate you acceptance of these instructions for minor change to the Work as consistent with the Contract Documents and return a copy to the Architect.";
        doc.text(doc.splitTextToSize(instructionText, 180), 14, yPos);
        yPos += 20;

        doc.setFont('helvetica', 'bold');
        doc.text("Description:", 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(doc.splitTextToSize(formState.description, 180), 14, yPos);
        yPos += 15;

        doc.setFont('helvetica', 'bold');
        doc.text("Attachments:", 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(doc.splitTextToSize(formState.attachments, 180), 14, yPos);
        yPos += 20;

        doc.autoTable({
            startY: yPos, theme: 'plain', body: [
                [`Issued By: ${formState.issuedBy}`, `Accepted By: ${formState.acceptedBy}`],
                [`Architect: _________________`, `Contractor: _________________`],
                [`Date: ${formState.issuedDate}`, `Date: ${formState.acceptedDate}`],
            ]
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text("Copies To:", 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        
        const copiesOptions = ['Owner', 'Architect', 'Contractor', 'Field', 'Other'];
        let xPos = 20;
        copiesOptions.forEach(item => {
            doc.rect(xPos, yPos - 3, 4, 4); // Draw checkbox
            if (formState.copiesTo.includes(item)) {
                doc.setFont('helvetica', 'bold');
                doc.text('✓', xPos + 0.5, yPos); // Draw checkmark
                doc.setFont('helvetica', 'normal');
            }
            doc.text(item, xPos + 6, yPos);
            xPos += 30; // Adjust spacing between checkboxes
        });

        // Add footer to all pages
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save('architects-supplemental-instructions.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Architect's Supplemental Instructions"
                description="Issue supplemental instructions for project execution."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">Architect's Supplemental Instructions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Project (Name, Address)</Label><Input name="projectName" value={formState.projectName} onChange={handleChange} /></div>
                        <div><Label>Architect's Supplemental Instruction No.</Label><Input name="instructionNo" value={formState.instructionNo} onChange={handleChange} /></div>
                        <div><Label>Architects</Label><Input name="architects" value={formState.architects} onChange={handleChange} /></div>
                        <div><Label>Date of Issuance</Label><Input name="dateOfIssuance" type="date" value={formState.dateOfIssuance} onChange={handleChange} /></div>
                        <div><Label>Architects Project No</Label><Input name="architectsProjectNo" value={formState.architectsProjectNo} onChange={handleChange} /></div>
                        <div><Label>Contract For</Label><Input name="contractFor" value={formState.contractFor} onChange={handleChange} /></div>
                        <div><Label>Contract Date</Label><Input name="contractDate" type="date" value={formState.contractDate} onChange={handleChange} /></div>
                        <div><Label>Owner</Label><Input name="owner" value={formState.owner} onChange={handleChange} /></div>
                    </div>
                     <div>
                        <Label>To: (Contractor)</Label>
                        <Textarea name="toContractor" rows={4} value={formState.toContractor} onChange={handleChange} />
                    </div>

                    <p className="text-sm text-muted-foreground italic">The Work shall be carried out in accordance with the following supplemental instructions issued in accordance with the contract Documents without change in Contract Sum or Contract Time. Prior to proceeding in accordance with these instructions, indicate you acceptance of these instructions for minor change to the Work as consistent with the Contract Documents and return a copy to the Architect.</p>
                    
                    <div><Label>Description:</Label><Textarea name="description" rows={5} value={formState.description} onChange={handleChange} /></div>
                    <div><Label>Attachments:</Label><Textarea name="attachments" rows={3} value={formState.attachments} onChange={handleChange} /></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                        <div>
                             <h4 className="font-semibold mb-2">Issued</h4>
                             <div className="space-y-2">
                                <Input name="issuedBy" placeholder="Architect By" value={formState.issuedBy} onChange={handleChange} />
                                <Input name="issuedDate" type="date" value={formState.issuedDate} onChange={handleChange} />
                             </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Accepted</h4>
                             <div className="space-y-2">
                                <Input name="acceptedBy" placeholder="Contractor By" value={formState.acceptedBy} onChange={handleChange} />
                                <Input name="acceptedDate" type="date" value={formState.acceptedDate} onChange={handleChange} />
                             </div>
                        </div>
                    </div>

                     <div>
                        <Label className="font-bold">Copies To:</Label>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                            {['Owner', 'Architect', 'Contractor', 'Field', 'Other'].map(item => (
                                <div key={item} className="flex items-center gap-2">
                                    <Checkbox id={`copy_to_${item}`} checked={formState.copiesTo.includes(item)} onCheckedChange={() => handleCheckboxChange(item)} />
                                    <Label htmlFor={`copy_to_${item}`}>{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
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
                </CardContent>
            </Card>
        </div>
    );
}
