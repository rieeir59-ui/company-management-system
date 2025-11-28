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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Section = ({ title, children, className }: { title: string; children: React.ReactNode, className?: string }) => (
    <div className={`mb-6 pt-4 border-t border-dashed ${className}`}>
        <h2 className="text-xl font-bold text-primary mb-4">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InputRow = ({ label, id, value, onChange, placeholder = '', type = 'text' }: { label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, type?:string }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
        <Label htmlFor={id} className="md:text-right">{label}</Label>
        <Input id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} type={type} className="md:col-span-2" />
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
        projectType: '',
        projectStatus: '',
        projectArea: '',
        specialRequirements: '',
        costArchitectural: '',
        costInterior: '',
        costLandscaping: '',
        costConstruction: '',
        costTurnkey: '',
        costOther: '',
        dateFirstInfo: '',
        dateFirstMeeting: '',
        dateFirstWorking: '',
        dateFirstProposalStart: '',
        dateFirstProposalEnd: '',
        dateSecondProposalStart: '',
        dateSecondProposalEnd: '',
        dateFirstInfo2: '',
        dateWorkingFinalized: '',
        dateRevisedPresentation: '',
        dateQuotation: '',
        dateDrawingsStart: '',
        dateDrawingsEnd: '',
        dateOtherMilestones: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: keyof typeof formState, checked: boolean) => {
        setFormState(prev => ({ ...prev, [name]: checked }));
    };
    
    const handleRadioChange = (name: keyof typeof formState, value: string) => {
        setFormState(prev => ({ ...prev, [name]: value }));
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
        const doc = new jsPDF() as any;
        let yPos = 20;
        const margin = 14;
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT INFORMATION', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        const addLine = (label: string, value: string) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, margin + 50, yPos);
            doc.line(margin + 50, yPos + 1, pageWidth - margin, yPos + 1);
            yPos += 8;
        };

        const addRadioLine = (label: string, options: string[], selectedValue: string) => {
             if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'normal');
            let xPos = margin + 50;
            options.forEach(opt => {
                const radioChar = opt.toLowerCase() === selectedValue ? '◉' : '○';
                doc.text(`${radioChar} ${opt}`, xPos, yPos);
                xPos += 40;
            })
            yPos += 8;
        }

        const addCheckboxLine = (label: string, isChecked: boolean, text: string) => {
            doc.text(`${isChecked ? '☑' : '☐'} ${text}`, margin + 50, yPos);
            yPos += 7;
        };

        const addCostLine = (label: string, value: string) => {
             if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, margin + 70, yPos);
            doc.line(margin + 70, yPos + 1, pageWidth - margin, yPos + 1);
            yPos += 8;
        }

        addLine('Project:', formState.project);
        addLine('Address:', formState.address);
        addLine('Project No:', formState.projectNo);
        addLine('Prepared By:', formState.preparedBy);
        addLine('Prepared Date:', formState.preparedDate);
        yPos += 5;

        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('About Owner:', margin, yPos); yPos += 8;
        addLine('Full Name:', formState.ownerFullName);
        addLine('Address (Office):', formState.ownerOfficeAddress);
        addLine('Address (Res.):', formState.ownerResAddress);
        addLine('Phone (Office):', formState.ownerOfficePhone);
        addLine('Phone (Res.):', formState.ownerResPhone);
        yPos += 5;
        
        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text("Owner's Project Representative:", margin, yPos); yPos += 8;
        addLine('Name:', formState.repName);
        addLine('Address (Office):', formState.repOfficeAddress);
        addLine('Address (Res.):', formState.repResAddress);
        addLine('Phone (Office):', formState.repOfficePhone);
        addLine('Phone (Res.):', formState.repResPhone);
        yPos += 5;

        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('About Project:', margin, yPos); yPos += 8;
        addLine('Address:', formState.projectAboutAddress);
        doc.setFont('helvetica', 'bold'); doc.text('Project Reqt.', margin, yPos); yPos -= 3;
        addCheckboxLine('', formState.reqArchitectural, 'i. Architectural Designing');
        addCheckboxLine('', formState.reqInterior, 'ii. Interior Decoration');
        addCheckboxLine('', formState.reqLandscaping, 'iii. Landscaping');
        addCheckboxLine('', formState.reqTurnkey, 'iv. Turnkey');
        addCheckboxLine('', formState.reqOther, `v. Other: ${formState.reqOtherText}`);
        yPos += 5;

        addRadioLine('Project Type:', ['Commercial', 'Residential'], formState.projectType);
        addRadioLine('Project Status:', ['New', 'Addition', 'Rehabilitation/Renovation'], formState.projectStatus);
        
        addLine('Project Area:', formState.projectArea);
        addLine('Special Requirements of Project:', formState.specialRequirements);
        
        doc.setFont('helvetica', 'bold'); doc.text("Project's Cost:", margin, yPos); yPos += 8;
        addCostLine('i. Architectural Designing', formState.costArchitectural);
        addCostLine('ii. Interior Decoration', formState.costInterior);
        addCostLine('iii. Landscaping', formState.costLandscaping);
        addCostLine('iv. Construction', formState.costConstruction);
        addCostLine('v. Turnkey', formState.costTurnkey);
        addCostLine('vi. Other', formState.costOther);
        yPos += 5;

        doc.setLineDash([2, 2], 0); doc.line(margin, yPos, pageWidth - margin, yPos); doc.setLineDash([], 0); yPos += 10;
        
        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Dates Concerned with Project:', margin, yPos); yPos += 8;
        addLine('First Information about Project:', formState.dateFirstInfo);
        addLine('First Meeting:', formState.dateFirstMeeting);
        addLine('First Working on Project:', formState.dateFirstWorking);
        addLine('First Proposal:', `Start: ${formState.dateFirstProposalStart}, Completion: ${formState.dateFirstProposalEnd}`);
        addLine('Second Proposal:', `Start: ${formState.dateSecondProposalStart}, Completion: ${formState.dateSecondProposalEnd}`);
        addLine('First Information:', formState.dateFirstInfo2);
        addLine('Working on Finalized Proposal:', formState.dateWorkingFinalized);
        addLine('Revised Presentation:', formState.dateRevisedPresentation);
        addLine('Quotation:', formState.dateQuotation);
        addLine('Drawings:', `Start: ${formState.dateDrawingsStart}, Completion: ${formState.dateDrawingsEnd}`);
        addLine('Other Major Projects Milestone Dates:', formState.dateOtherMilestones);

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
                                    <div className="flex items-center gap-2"><Checkbox id="reqArch" checked={formState.reqArchitectural} onCheckedChange={(c) => handleCheckboxChange('reqArchitectural', !!c)} /><Label htmlFor="reqArch">i. Architectural Designing</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="reqInt" checked={formState.reqInterior} onCheckedChange={(c) => handleCheckboxChange('reqInterior', !!c)} /><Label htmlFor="reqInt">ii. Interior Decoration</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="reqLand" checked={formState.reqLandscaping} onCheckedChange={(c) => handleCheckboxChange('reqLandscaping', !!c)} /><Label htmlFor="reqLand">iii. Landscaping</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="reqTurn" checked={formState.reqTurnkey} onCheckedChange={(c) => handleCheckboxChange('reqTurnkey', !!c)} /><Label htmlFor="reqTurn">iv. Turnkey</Label></div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="reqOther" checked={formState.reqOther} onCheckedChange={(c) => handleCheckboxChange('reqOther', !!c)} />
                                        <Label htmlFor="reqOther">v. Other:</Label>
                                        <Input name="reqOtherText" value={formState.reqOtherText} onChange={handleChange} disabled={!formState.reqOther} className="h-8" />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="Project Details">
                          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                            <Label className="md:text-right">Project Type:</Label>
                            <RadioGroup name="projectType" onValueChange={(v) => handleRadioChange('projectType', v)} value={formState.projectType} className="flex gap-4 md:col-span-2">
                              <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="type_comm" /><Label htmlFor="type_comm">Commercial</Label></div>
                              <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="type_res" /><Label htmlFor="type_res">Residential</Label></div>
                            </RadioGroup>
                          </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                            <Label className="md:text-right">Project Status:</Label>
                            <RadioGroup name="projectStatus" onValueChange={(v) => handleRadioChange('projectStatus', v)} value={formState.projectStatus} className="flex gap-4 md:col-span-2">
                              <div className="flex items-center space-x-2"><RadioGroupItem value="new" id="status_new" /><Label htmlFor="status_new">New</Label></div>
                              <div className="flex items-center space-x-2"><RadioGroupItem value="addition" id="status_add" /><Label htmlFor="status_add">Addition</Label></div>
                              <div className="flex items-center space-x-2"><RadioGroupItem value="renovation" id="status_reno" /><Label htmlFor="status_reno">Rehabilitation/Renovation</Label></div>
                            </RadioGroup>
                          </div>
                          <InputRow label="Project Area:" id="projectArea" value={formState.projectArea} onChange={handleChange} />
                          <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2">
                            <Label htmlFor="specialRequirements" className="md:text-right">Special Requirements of Project:</Label>
                            <Textarea id="specialRequirements" name="specialRequirements" value={formState.specialRequirements} onChange={handleChange} className="md:col-span-2" />
                          </div>
                        </Section>
                        
                        <Section title="Project's Cost">
                          <InputRow label="i. Architectural Designing" id="costArchitectural" value={formState.costArchitectural} onChange={handleChange} />
                          <InputRow label="ii. Interior Decoration" id="costInterior" value={formState.costInterior} onChange={handleChange} />
                          <InputRow label="iii. Landscaping" id="costLandscaping" value={formState.costLandscaping} onChange={handleChange} />
                          <InputRow label="iv. Construction" id="costConstruction" value={formState.costConstruction} onChange={handleChange} />
                          <InputRow label="v. Turnkey" id="costTurnkey" value={formState.costTurnkey} onChange={handleChange} />
                          <InputRow label="vi. Other" id="costOther" value={formState.costOther} onChange={handleChange} />
                        </Section>
                        
                        <Section title="Dates Concerned with Project">
                          <InputRow label="First Information about Project:" id="dateFirstInfo" value={formState.dateFirstInfo} onChange={handleChange} type="date" />
                          <InputRow label="First Meeting:" id="dateFirstMeeting" value={formState.dateFirstMeeting} onChange={handleChange} type="date" />
                          <InputRow label="First Working on Project:" id="dateFirstWorking" value={formState.dateFirstWorking} onChange={handleChange} type="date" />
                          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                             <Label className="md:text-right">First Proposal:</Label>
                            <div className="md:col-span-2 grid grid-cols-2 gap-2">
                              <InputRow label="i. Start" id="dateFirstProposalStart" value={formState.dateFirstProposalStart} onChange={handleChange} type="date" />
                              <InputRow label="ii. Completion" id="dateFirstProposalEnd" value={formState.dateFirstProposalEnd} onChange={handleChange} type="date" />
                            </div>
                          </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                             <Label className="md:text-right">Second Proposal:</Label>
                            <div className="md:col-span-2 grid grid-cols-2 gap-2">
                              <InputRow label="i. Start" id="dateSecondProposalStart" value={formState.dateSecondProposalStart} onChange={handleChange} type="date" />
                              <InputRow label="ii. Completion" id="dateSecondProposalEnd" value={formState.dateSecondProposalEnd} onChange={handleChange} type="date" />
                            </div>
                          </div>
                          <InputRow label="First Information:" id="dateFirstInfo2" value={formState.dateFirstInfo2} onChange={handleChange} type="date" />
                          <InputRow label="Working on Finalized Proposal:" id="dateWorkingFinalized" value={formState.dateWorkingFinalized} onChange={handleChange} type="date" />
                          <InputRow label="Revised Presentation:" id="dateRevisedPresentation" value={formState.dateRevisedPresentation} onChange={handleChange} type="date" />
                          <InputRow label="Quotation:" id="dateQuotation" value={formState.dateQuotation} onChange={handleChange} type="date" />
                           <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                             <Label className="md:text-right">Drawings:</Label>
                            <div className="md:col-span-2 grid grid-cols-2 gap-2">
                              <InputRow label="i. Start" id="dateDrawingsStart" value={formState.dateDrawingsStart} onChange={handleChange} type="date" />
                              <InputRow label="ii. Completion" id="dateDrawingsEnd" value={formState.dateDrawingsEnd} onChange={handleChange} type="date" />
                            </div>
                          </div>
                          <InputRow label="Other Major Projects Milestone Dates:" id="dateOtherMilestones" value={formState.dateOtherMilestones} onChange={handleChange} type="date" />
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
