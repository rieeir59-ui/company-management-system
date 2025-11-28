
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6 pt-4 border-t border-dashed">
        <h2 className="text-xl font-bold text-primary mb-4">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InputRow = ({ label, id, value, onChange, placeholder = '' }: { label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
        <Label htmlFor={id} className="md:text-right">{label}</Label>
        <Input id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} className="md:col-span-2" />
    </div>
);


export default function ProjectInformationPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-information');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [formState, setFormState] = useState({
        project: '',
        address: '',
        projectNo: '',
        preparedBy: '',
        preparedDate: '',
        ownerFullName: '',
        ownerOfficeAddress: '',
        ownerResAddress: '',
        ownerOfficePhone: '',
        ownerResPhone: '',
        repName: '',
        repOfficeAddress: '',
        repResAddress: '',
        repOfficePhone: '',
        repResPhone: '',
        projectAboutAddress: '',
        reqArchitectural: false,
        reqInterior: false,
        reqLandscaping: false,
        reqTurnkey: false,
        reqOther: false,
        reqOtherText: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: keyof typeof formState) => {
        setFormState(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSave = async () => {
         if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: "Project Information",
            projectName: formState.project || 'Untitled Project Information',
            data: [{
                category: 'Project Information',
                items: Object.entries(formState).map(([key, value]) => `${key}: ${value}`)
            }],
            createdAt: serverTimestamp(),
        };

        addDoc(collection(firestore, 'savedRecords'), dataToSave)
            .then(() => {
                toast({ title: 'Record Saved', description: "The project information has been saved." });
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
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT INFORMATION', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        const addLine = (label: string, value: string) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(label, 14, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 60, yPos);
            doc.line(60, yPos + 1, 196, yPos + 1);
            yPos += 10;
        }

        addLine('Project:', formState.project);
        addLine('Address:', formState.address);
        addLine('Project No:', formState.projectNo);
        addLine('Prepared By:', formState.preparedBy);
        addLine('Prepared Date:', formState.preparedDate);
        yPos += 5;
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('About Owner:', 14, yPos);
        yPos += 10;
        
        addLine('Full Name:', formState.ownerFullName);
        addLine('Address (Office):', formState.ownerOfficeAddress);
        addLine('Address (Res.):', formState.ownerResAddress);
        addLine('Phone (Office):', formState.ownerOfficePhone);
        addLine('Phone (Res.):', formState.ownerResPhone);
        yPos += 5;

        addLine("Owner's Project Representative Name:", formState.repName);
        addLine('Address (Office):', formState.repOfficeAddress);
        addLine('Address (Res.):', formState.repResAddress);
        addLine('Phone (Office):', formState.repOfficePhone);
        addLine('Phone (Res.):', formState.repResPhone);
        yPos += 5;
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('About Project:', 14, yPos);
        yPos += 10;
        
        addLine('Address:', formState.projectAboutAddress);

        doc.setFont('helvetica', 'bold');
        doc.text('Project Reqt.', 14, yPos);
        doc.setFont('helvetica', 'normal');
        
        const reqs = [
            { label: 'Architectural Designing', checked: formState.reqArchitectural },
            { label: 'Interior Decoration', checked: formState.reqInterior },
            { label: 'Landscaping', checked: formState.reqLandscaping },
            { label: 'Turnkey', checked: formState.reqTurnkey },
            { label: `Other: ${formState.reqOtherText}`, checked: formState.reqOther },
        ];
        
        reqs.forEach((req, index) => {
            doc.text(`${req.checked ? '[X]' : '[ ]'} ${index + 1}. ${req.label}`, 60, yPos);
            yPos += 7;
        });

        doc.save('project-information.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Project Information"
                description="Enter all the necessary details for your project."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">PROJECT INFORMATION</CardTitle>
                </CardHeader>
                <CardContent className="max-w-3xl mx-auto">
                    <form className="space-y-8">
                        <div className="space-y-4">
                            <InputRow label="Project:" id="project" value={formState.project} onChange={handleChange} />
                            <InputRow label="Address:" id="address" value={formState.address} onChange={handleChange} />
                            <InputRow label="Project No:" id="projectNo" value={formState.projectNo} onChange={handleChange} />
                            <InputRow label="Prepared By:" id="preparedBy" value={formState.preparedBy} onChange={handleChange} />
                            <InputRow label="Prepared Date:" id="preparedDate" value={formState.preparedDate} onChange={handleChange} type="date" />
                        </div>
                        
                        <Section title="About Owner">
                            <InputRow label="Full Name:" id="ownerFullName" value={formState.ownerFullName} onChange={handleChange} />
                            <InputRow label="Address (Office):" id="ownerOfficeAddress" value={formState.ownerOfficeAddress} onChange={handleChange} />
                            <InputRow label="Address (Res.):" id="ownerResAddress" value={formState.ownerResAddress} onChange={handleChange} />
                            <InputRow label="Phone (Office):" id="ownerOfficePhone" value={formState.ownerOfficePhone} onChange={handleChange} />
                            <InputRow label="Phone (Res.):" id="ownerResPhone" value={formState.ownerResPhone} onChange={handleChange} />
                        </Section>

                        <Section title="Owner's Project Representative">
                             <InputRow label="Name:" id="repName" value={formState.repName} onChange={handleChange} />
                            <InputRow label="Address (Office):" id="repOfficeAddress" value={formState.repOfficeAddress} onChange={handleChange} />
                            <InputRow label="Address (Res.):" id="repResAddress" value={formState.repResAddress} onChange={handleChange} />
                            <InputRow label="Phone (Office):" id="repOfficePhone" value={formState.repOfficePhone} onChange={handleChange} />
                            <InputRow label="Phone (Res.):" id="repResPhone" value={formState.repResPhone} onChange={handleChange} />
                        </Section>

                        <Section title="About Project">
                            <InputRow label="Address:" id="projectAboutAddress" value={formState.projectAboutAddress} onChange={handleChange} />
                             <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2">
                                <Label className="md:text-right font-bold mt-2">Project Reqt.</Label>
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center gap-2"><Checkbox id="reqArch" checked={formState.reqArchitectural} onCheckedChange={() => handleCheckboxChange('reqArchitectural')} /><Label htmlFor="reqArch">i. Architectural Designing</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="reqInt" checked={formState.reqInterior} onCheckedChange={() => handleCheckboxChange('reqInterior')} /><Label htmlFor="reqInt">ii. Interior Decoration</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="reqLand" checked={formState.reqLandscaping} onCheckedChange={() => handleCheckboxChange('reqLandscaping')} /><Label htmlFor="reqLand">iii. Landscaping</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="reqTurn" checked={formState.reqTurnkey} onCheckedChange={() => handleCheckboxChange('reqTurnkey')} /><Label htmlFor="reqTurn">iv. Turnkey</Label></div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="reqOther" checked={formState.reqOther} onCheckedChange={() => handleCheckboxChange('reqOther')} />
                                        <Label htmlFor="reqOther">v. Other:</Label>
                                        <Input name="reqOtherText" value={formState.reqOtherText} onChange={handleChange} disabled={!formState.reqOther} className="h-8" />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <div className="flex justify-end gap-4 mt-12">
                            <Button type="button" onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button type="button" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

    