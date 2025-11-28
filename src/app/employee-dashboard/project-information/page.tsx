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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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

const consultantTypes = [
    'Structural', 'HVAC', 'Plumbing', 'Electrical', 'Civil', 'Landscape', 'Interior', 'Graphics',
    'Lighting', 'Acoustical', 'Fire Protection', 'Food Service', 'Vertical transport',
    'Display/Exhibit', 'Master planning', 'Solar', 'Construction Cost', 'Other', '',
    'Land Surveying', 'Geotechnical', 'Asbestos', 'Hazardous waste'
];

const residenceRequirements = [
  'Size of plot', 'Number of Bedrooms', 'Specifications', 'Number of Dressing Rooms', 
  'Number of Bath Rooms', 'Living Rooms', 'Breakfast', 'Dinning', 'Servant Kitchen', 
  'Self Kitchenett', 'Garage', 'Servant Quarters', 'Guard Room', 'Study Room', 'Stores', 
  'Entertainment Area', 'Partio', 'Atrium'
];

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
        ownerProgram: '',
        ownerSchedule: '',
        ownerLegal: '',
        ownerLandSurvey: '',
        ownerGeoTech: '',
        ownerExistingDrawings: '',
        compInitialPayment: '',
        compBasicServices: '',
        compSchematic: '',
        compDesignDev: '',
        compConstructionDocs: '',
        compBidding: '',
        compConstructionAdmin: '',
        compAdditionalServices: '',
        compReimbursable: '',
        compOther: '',
        specialConfidential: '',
        miscNotes: '',
    });
    
    const [consultants, setConsultants] = useState<Record<string, { withinFee: string, additionalFee: string, architect: string, owner: string }>>(
      consultantTypes.reduce((acc, type) => {
        acc[type] = { withinFee: '...', additionalFee: '...', architect: '...', owner: '...' };
        return acc;
      }, {} as Record<string, { withinFee: string, additionalFee: string, architect: string, owner: string }>)
    );

    const [requirements, setRequirements] = useState<Record<string, { nos: string, remarks: string }>>(
      residenceRequirements.reduce((acc, req) => {
        acc[req] = { nos: '', remarks: '' };
        return acc;
      }, {} as Record<string, { nos: string, remarks: string }>)
    );

    const handleRequirementChange = (item: string, field: 'nos' | 'remarks', value: string) => {
        setRequirements(prev => ({
            ...prev,
            [item]: { ...prev[item], [field]: value }
        }));
    };

    const handleConsultantChange = (type: string, field: string, value: string) => {
        setConsultants(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

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
            }, {
                category: 'Consultants',
                items: Object.entries(consultants).map(([type, values]) => `${type}: ${JSON.stringify(values)}`)
            },
            {
                category: 'Requirements',
                items: Object.entries(requirements).map(([req, values]) => `${req}: ${JSON.stringify(values)}`)
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
            const splitValue = doc.splitTextToSize(value, pageWidth - margin * 2 - 50);
            doc.text(splitValue, margin + 60, yPos, { maxWidth: pageWidth - margin * 2 - 60 });
            yPos += (splitValue.length * 5) + 3;
        };
        
        const addTextArea = (label: string, value: string) => {
             if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(label, margin, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            const splitText = doc.splitTextToSize(value, pageWidth - margin * 2 - 5);
            doc.text(splitText, margin + 5, yPos);
            yPos += (splitText.length * 5) + 5;
        }

        const addRadioLine = (label: string, options: string[], selectedValue: string) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'normal');
            let xPos = margin + 60;
            options.forEach(opt => {
                const radioChar = opt.toLowerCase() === selectedValue ? '◉' : '○';
                doc.text(`${radioChar} ${opt}`, xPos, yPos);
                xPos += 40;
            })
            yPos += 8;
        }

        const addCheckboxLine = (label: string, isChecked: boolean, text: string) => {
             if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.text(`${isChecked ? '☑' : '☐'} ${text}`, margin + 60, yPos);
            yPos += 7;
        };

        const addCostLine = (label: string, value: string) => {
             if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(label, margin + 10, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, margin + 80, yPos);
            yPos += 8;
        }
        
        const addSectionTitle = (title: string) => {
          if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, yPos);
            yPos += 8;
        }

        addLine('Project:', formState.project);
        addLine('Address:', formState.address);
        addLine('Project No:', formState.projectNo);
        addLine('Prepared By:', formState.preparedBy);
        addLine('Prepared Date:', formState.preparedDate);
        yPos += 5;

        addSectionTitle('About Owner:');
        addLine('Full Name:', formState.ownerFullName);
        addLine('Address (Office):', formState.ownerOfficeAddress);
        addLine('Address (Res.):', formState.ownerResAddress);
        addLine('Phone (Office):', formState.ownerOfficePhone);
        addLine('Phone (Res.):', formState.ownerResPhone);
        yPos += 5;
        
        addSectionTitle("Owner's Project Representative:");
        addLine('Name:', formState.repName);
        addLine('Address (Office):', formState.repOfficeAddress);
        addLine('Address (Res.):', formState.repResAddress);
        addLine('Phone (Office):', formState.repOfficePhone);
        addLine('Phone (Res.):', formState.repResPhone);
        yPos += 5;

        addSectionTitle('About Project:');
        addLine('Address:', formState.projectAboutAddress);
        doc.setFont('helvetica', 'bold'); doc.text('Project Reqt.', margin, yPos);
        addCheckboxLine('', formState.reqArchitectural, 'i. Architectural Designing');
        addCheckboxLine('', formState.reqInterior, 'ii. Interior Decoration');
        addCheckboxLine('', formState.reqLandscaping, 'iii. Landscaping');
        addCheckboxLine('', formState.reqTurnkey, 'iv. Turnkey');
        addCheckboxLine('', formState.reqOther, `v. Other: ${formState.reqOtherText}`);
        yPos += 5;

        addRadioLine('Project Type:', ['Commercial', 'Residential'], formState.projectType);
        addRadioLine('Project Status:', ['New', 'Addition', 'Rehabilitation/Renovation'], formState.projectStatus);
        
        addLine('Project Area:', formState.projectArea);
        addTextArea('Special Requirements of Project:', formState.specialRequirements);
        
        doc.setFont('helvetica', 'bold'); doc.text("Project's Cost:", margin, yPos); yPos += 8;
        addCostLine('i. Architectural Designing', formState.costArchitectural);
        addCostLine('ii. Interior Decoration', formState.costInterior);
        addCostLine('iii. Landscaping', formState.costLandscaping);
        addCostLine('iv. Construction', formState.costConstruction);
        addCostLine('v. Turnkey', formState.costTurnkey);
        addCostLine('vi. Other', formState.costOther);
        yPos += 5;
        
        doc.addPage();
        yPos = 20;
        
        addSectionTitle('Dates Concerned with Project:');
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
        addTextArea('Other Major Projects Milestone Dates:', formState.dateOtherMilestones);
        yPos += 5;

        addSectionTitle('Provided by Owner:');
        addTextArea('Program:', formState.ownerProgram);
        addTextArea('Suggested Schedule:', formState.ownerSchedule);
        addTextArea('Legal Site Description & Other Concerned Documents:', formState.ownerLegal);
        addTextArea('Land Survey Report:', formState.ownerLandSurvey);
        addTextArea('Geo-Technical, Tests and Other Site Information:', formState.ownerGeoTech);
        addTextArea("Existing Structure's Drawings:", formState.ownerExistingDrawings);
        yPos += 5;

        doc.addPage();
        yPos = 20;

        addSectionTitle('Compensation:');
        addLine('Initial Payment:', formState.compInitialPayment);
        addLine('Basic Services:', `${formState.compBasicServices} % of Cost of Construction`);
        doc.setFont('helvetica', 'bold'); doc.text('Breakdown by Phase:', margin, yPos); yPos+=8;
        addLine('Schematic Design:', `${formState.compSchematic} %`);
        addLine('Design Development:', `${formState.compDesignDev} %`);
        addLine("Construction Doc's:", `${formState.compConstructionDocs} %`);
        addLine('Bidding / Negotiation:', `${formState.compBidding} %`);
        addLine('Construction Contract Admin:', `${formState.compConstructionAdmin} %`);
        addLine('Additional Services:', `Multiple of ${formState.compAdditionalServices} Times Direct Cost to Architect`);
        addLine('Reimbursable Expenses:', formState.compReimbursable);
        addLine('Other:', formState.compOther);
        yPos += 5;
        
        doc.addPage();
        yPos = 20;
        
        addSectionTitle('Consultants:');
        const consultantHead = [['Type', 'Within Basic Fee', 'Additional Fee', 'Architect', 'Owner']];
        const consultantBody = Object.entries(consultants).map(([type, values]) => [type, values.withinFee, values.additionalFee, values.architect, values.owner]);
        doc.autoTable({
          head: consultantHead,
          body: consultantBody,
          startY: yPos,
          theme: 'grid',
        });
        yPos = doc.autoTable.previous.finalY + 10;
        
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        addSectionTitle('Requirements');
        const reqHead = [['Residence', 'Nos.', 'Remarks']];
        const reqBody = residenceRequirements.map((req, index) => [
          `${index + 1}. ${req}`,
          requirements[req].nos,
          requirements[req].remarks
        ]);
        doc.autoTable({
            head: reqHead,
            body: reqBody,
            startY: yPos,
            theme: 'grid',
        });
        yPos = doc.autoTable.previous.finalY + 10;

        doc.addPage();
        yPos = 20;

        addSectionTitle('Special Confidential Requirements:');
        addTextArea('', formState.specialConfidential);
        yPos+= 5;
        
        addSectionTitle('Miscellaneous Notes:');
        addTextArea('', formState.miscNotes);

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
                        
                        <Section title="Provided by Owner">
                           <div className="space-y-2"><Label htmlFor="ownerProgram">Program:</Label><Textarea id="ownerProgram" name="ownerProgram" value={formState.ownerProgram} onChange={handleChange} /></div>
                           <div className="space-y-2"><Label htmlFor="ownerSchedule">Suggested Schedule:</Label><Textarea id="ownerSchedule" name="ownerSchedule" value={formState.ownerSchedule} onChange={handleChange} /></div>
                           <div className="space-y-2"><Label htmlFor="ownerLegal">Legal Site Description & Other Concerned Documents:</Label><Textarea id="ownerLegal" name="ownerLegal" value={formState.ownerLegal} onChange={handleChange} /></div>
                           <div className="space-y-2"><Label htmlFor="ownerLandSurvey">Land Survey Report:</Label><Textarea id="ownerLandSurvey" name="ownerLandSurvey" value={formState.ownerLandSurvey} onChange={handleChange} /></div>
                           <div className="space-y-2"><Label htmlFor="ownerGeoTech">Geo-Technical, Tests and Other Site Information:</Label><Textarea id="ownerGeoTech" name="ownerGeoTech" value={formState.ownerGeoTech} onChange={handleChange} /></div>
                           <div className="space-y-2"><Label htmlFor="ownerExistingDrawings">Existing Structure's Drawings:</Label><Textarea id="ownerExistingDrawings" name="ownerExistingDrawings" value={formState.ownerExistingDrawings} onChange={handleChange} /></div>
                        </Section>

                        <Section title="Compensation">
                           <InputRow label="Initial Payment:" id="compInitialPayment" value={formState.compInitialPayment} onChange={handleChange} />
                           <InputRow label="Basic Services (% of Cost of Construction):" id="compBasicServices" value={formState.compBasicServices} onChange={handleChange} />
                           <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                            <Label className="md:text-right font-bold">Breakdown by Phase:</Label>
                            <div className="md:col-span-2 space-y-2">
                              <InputRow label="Schematic Design (%):" id="compSchematic" value={formState.compSchematic} onChange={handleChange} />
                              <InputRow label="Design Development (%):" id="compDesignDev" value={formState.compDesignDev} onChange={handleChange} />
                              <InputRow label="Construction Doc's (%):" id="compConstructionDocs" value={formState.compConstructionDocs} onChange={handleChange} />
                              <InputRow label="Bidding / Negotiation (%):" id="compBidding" value={formState.compBidding} onChange={handleChange} />
                              <InputRow label="Construction Contract Admin (%):" id="compConstructionAdmin" value={formState.compConstructionAdmin} onChange={handleChange} />
                            </div>
                           </div>
                           <InputRow label="Additional Services (Multiple of):" id="compAdditionalServices" value={formState.compAdditionalServices} onChange={handleChange} />
                           <InputRow label="Reimbursable Expenses:" id="compReimbursable" value={formState.compReimbursable} onChange={handleChange} />
                           <InputRow label="Other:" id="compOther" value={formState.compOther} onChange={handleChange} />
                        </Section>
                        
                        <Section title="Consultants:">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead rowSpan={2} className="align-bottom">Type</TableHead>
                                        <TableHead colSpan={2} className="text-center border-l">Retained by Architect</TableHead>
                                        <TableHead colSpan={2} className="text-center border-l">Retained and Paid by Owner, Co-ordination By</TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead className="border-l">Within Basic Fee</TableHead>
                                        <TableHead>Additional Fee</TableHead>
                                        <TableHead className="border-l">Architect</TableHead>
                                        <TableHead>Owner</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consultantTypes.map((type, index) => (
                                        <TableRow key={index}>
                                            <TableCell className={!type ? 'bg-muted' : ''}>{type}</TableCell>
                                            <TableCell className="border-l"><Input value={consultants[type]?.withinFee || ''} onChange={(e) => handleConsultantChange(type, 'withinFee', e.target.value)} className="border-0 bg-transparent h-8 p-1" /></TableCell>
                                            <TableCell><Input value={consultants[type]?.additionalFee || ''} onChange={(e) => handleConsultantChange(type, 'additionalFee', e.target.value)} className="border-0 bg-transparent h-8 p-1" /></TableCell>
                                            <TableCell className="border-l"><Input value={consultants[type]?.architect || ''} onChange={(e) => handleConsultantChange(type, 'architect', e.target.value)} className="border-0 bg-transparent h-8 p-1" /></TableCell>
                                            <TableCell><Input value={consultants[type]?.owner || ''} onChange={(e) => handleConsultantChange(type, 'owner', e.target.value)} className="border-0 bg-transparent h-8 p-1" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Section>

                        <Section title="Requirements">
                            <h3 className="font-semibold text-md mb-2">Residence:</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Description</TableHead>
                                        <TableHead className="w-[20%]">Nos.</TableHead>
                                        <TableHead className="w-[40%]">Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {residenceRequirements.map((req, index) => (
                                        <TableRow key={req}>
                                            <TableCell><Label>{`${index + 1}. ${req}`}</Label></TableCell>
                                            <TableCell><Input value={requirements[req].nos} onChange={(e) => handleRequirementChange(req, 'nos', e.target.value)} /></TableCell>
                                            <TableCell><Input value={requirements[req].remarks} onChange={(e) => handleRequirementChange(req, 'remarks', e.target.value)} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Section>

                        <Section title="Special Confidential Requirements">
                          <Textarea name="specialConfidential" value={formState.specialConfidential} onChange={handleChange} rows={4} />
                        </Section>

                         <Section title="Miscellaneous Notes">
                          <Textarea name="miscNotes" value={formState.miscNotes} onChange={handleChange} rows={4} />
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
