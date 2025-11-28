
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary">{title}</h2>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const InputRow = ({ label, name, value, onChange, placeholder, type = "text" }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; }) => (
    <div className="grid md:grid-cols-3 items-center gap-4">
        <Label htmlFor={name} className="md:text-right">{label}</Label>
        <Input id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} className="md:col-span-2" />
    </div>
);

const CheckboxRow = ({ label, name, checked, onCheckedChange }: { label: string; name: string; checked: boolean; onCheckedChange: (checked: boolean) => void; }) => (
  <div className="flex items-center space-x-2">
    <Checkbox id={name} name={name} checked={checked} onCheckedChange={onCheckedChange} />
    <Label htmlFor={name} className="font-normal">{label}</Label>
  </div>
);

const ConsultantRow = ({ type, data, onChange }: { type: string; data: any; onChange: (type: string, field: string, value: string) => void; }) => {
    const slug = type.toLowerCase().replace(/ /g, '_');
    return (
        <TableRow>
            <TableCell className="font-medium">{type}</TableCell>
            <TableCell><Input name={`${slug}_basic`} value={data.basic || ''} onChange={(e) => onChange(slug, 'basic', e.target.value)} className="w-full" /></TableCell>
            <TableCell><Input name={`${slug}_additional`} value={data.additional || ''} onChange={(e) => onChange(slug, 'additional', e.target.value)} className="w-full" /></TableCell>
            <TableCell><Input name={`${slug}_architect`} value={data.architect || ''} onChange={(e) => onChange(slug, 'architect', e.target.value)} className="w-full" /></TableCell>
            <TableCell><Input name={`${slug}_owner`} value={data.owner || ''} onChange={(e) => onChange(slug, 'owner', e.target.value)} className="w-full" /></TableCell>
        </TableRow>
    );
};


export default function ProjectInformationPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-information');
    const { toast } = useToast();
    const [formData, setFormData] = useState<Record<string, any>>({
        project: '',
        project_address: '',
        project_no: '',
        prepared_by: '',
        prepared_date: '',
        owner_name: '',
        owner_office_address: '',
        owner_res_address: '',
        owner_office_phone: '',
        owner_res_phone: '',
        rep_name: '',
        rep_office_address: '',
        rep_res_address: '',
        rep_office_phone: '',
        rep_res_phone: '',
        about_project_address: '',
        reqt_arch: false,
        reqt_interior: false,
        reqt_landscaping: false,
        reqt_turnkey: false,
        reqt_other: false,
        reqt_other_text: '',
        type_commercial: false,
        type_residential: false,
        project_status: '',
        project_area: '',
        special_reqs: '',
        cost_arch: false,
        cost_interior: false,
        cost_landscaping: false,
        cost_construction: false,
        cost_turnkey: false,
        cost_other: false,
        cost_other_text: '',
        date_first_info: '',
        date_first_meeting: '',
        date_first_working: '',
        date_proposal1_start: '',
        date_proposal1_completion: '',
        date_proposal2_start: '',
        date_proposal2_completion: '',
        date_final_proposal: '',
        date_revised_presentation: '',
        date_quotation: '',
        date_drawings_start: '',
        date_drawings_completion: '',
        other_dates: '',
        owner_program: false,
        owner_schedule: false,
        owner_legal: false,
        owner_survey: false,
        owner_geo: false,
        owner_existing_drawings: false,
        comp_initial: '',
        comp_basic: '',
        comp_schematic: '',
        comp_dev: '',
        comp_docs: '',
        comp_bidding: '',
        comp_admin: '',
        comp_additional: '',
        comp_reimbursable: '',
        comp_other: '',
        confidential_reqs: '',
        misc_notes: '',
        consultants: {},
        req_residence: '',
        req_nos: '',
        req_plot_size: '',
        req_bedrooms: '',
        req_specifications: '',
        req_dressing_rooms: '',
        req_bathrooms: '',
        req_living_rooms: '',
        req_breakfast: '',
        req_dining: '',
        req_servant_kitchen: '',
        req_self_kitchenette: '',
        req_garage: '',
        req_servant_quarters: '',
        req_guard_room: '',
        req_study_room: '',
        req_stores: '',
        req_entertainment: '',
        req_patio: '',
        req_atrium: '',
        req_remarks: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };
    
    const handleRadioChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConsultantChange = (type: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            consultants: {
                ...prev.consultants,
                [type]: {
                    ...prev.consultants?.[type],
                    [field]: value
                }
            }
        }));
    };

    const handleSave = () => {
        console.log(formData);
        toast({
            title: "Record Saved",
            description: "The project information has been successfully saved.",
        });
    }

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        const lineOffset = 50;
        let yPos = 22;

        const getVal = (id: string) => formData[id] || '';
        const getCheckbox = (id: string) => formData[id] || false;
        
        const addField = (label: string, value: string) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(label, margin, yPos);
            doc.text(value, lineOffset, yPos);
            doc.line(lineOffset, yPos + 1, pageWidth - margin, yPos + 1);
            yPos += 8;
        };
        
        const addSectionTitle = (title: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(title, margin, yPos);
            yPos += 8;
        };

        const addCheckboxLine = (label: string, isChecked: boolean, xOffset = 0) => {
            const boxX = lineOffset + xOffset;
            doc.rect(boxX, yPos - 3.5, 3, 3); // Draw a square
            if (isChecked) {
                doc.text('X', boxX + 0.7, yPos);
            }
            doc.text(label, boxX + 5, yPos);
        };
        
        // --- Main Title ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('PROJECT INFORMATION', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // --- Project Info ---
        addField('Project:', getVal('project'));
        addField('Address:', getVal('project_address'));
        addField('Project No:', getVal('project_no'));
        addField('Prepared By:', getVal('prepared_by'));
        addField('Prepared Date:', getVal('prepared_date'));
        yPos += 5;

        // --- About Owner ---
        addSectionTitle("About Owner");
        addField('Full Name:', getVal('owner_name'));
        addField('Address (Office):', getVal('owner_office_address'));
        addField('Address (Res.):', getVal('owner_res_address'));
        addField('Phone (Office):', getVal('owner_office_phone'));
        addField('Phone (Res.):', getVal('owner_res_phone'));
        yPos += 5;
        addField("Owner's Project Representative Name:", getVal('rep_name'));
        addField('Address (Office):', getVal('rep_office_address'));
        addField('Address (Res.):', getVal('rep_res_address'));
        addField('Phone (Office):', getVal('rep_office_phone'));
        addField('Phone (Res.):', getVal('rep_res_phone'));
        yPos += 5;

        // --- About Project ---
        addSectionTitle("About Project");
        addField('Address:', getVal('about_project_address'));

        doc.text('Project Reqt.', margin, yPos);
        addCheckboxLine('Architectural Designing', getCheckbox('reqt_arch'), 0);
        addCheckboxLine('Interior Decoration', getCheckbox('reqt_interior'), 50);
        yPos += 6;
        addCheckboxLine('Landscaping', getCheckbox('reqt_landscaping'), 0);
        addCheckboxLine('Turnkey', getCheckbox('reqt_turnkey'), 50);
        yPos += 6;
        addCheckboxLine('Other:', getCheckbox('reqt_other'), 0);
        doc.text(getVal('reqt_other_text'), lineOffset + 15, yPos-1);
        doc.line(lineOffset + 15, yPos, pageWidth - margin, yPos);
        yPos += 8;

        doc.text('Project Type:', margin, yPos);
        addCheckboxLine('Commercial', getCheckbox('type_commercial'), 0);
        addCheckboxLine('Residential', getCheckbox('type_residential'), 50);
        yPos += 8;

        const projectStatus = getVal('project_status');
        doc.text('Project Status:', margin, yPos);
        addCheckboxLine('New', projectStatus === 'new', 0);
        addCheckboxLine('Addition', projectStatus === 'addition', 50);
        yPos += 6;
        addCheckboxLine('Rehabilitation/Renovation', projectStatus === 'rehab', 0);
        yPos += 8;
        
        addField('Project Area:', getVal('project_area'));
        addField('Special Requirements of Project:', getVal('special_reqs'));

        doc.text("Project's Cost:", margin, yPos);
        const costs = ['arch', 'interior', 'landscaping', 'construction', 'turnkey'];
        const costLabels = ['Architectural Designing', 'Interior Decoration', 'Landscaping', 'Construction', 'Turnkey'];
        for(let i=0; i<costs.length; i++){
            if(i % 2 === 0 && i > 0) yPos += 6;
            addCheckboxLine(costLabels[i], getCheckbox(`cost_${costs[i]}`), (i%2) * 50);
        }
        yPos += 6;
        addCheckboxLine('Other:', getCheckbox('cost_other'), 0);
        doc.text(getVal('cost_other_text'), lineOffset + 15, yPos - 1);
        doc.line(lineOffset + 15, yPos, pageWidth - margin, yPos);

        doc.save('project-information.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };
    
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Requirement Performa for Residential and Commercial"
                description="View and manage project information."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardContent className="p-6 md:p-8">
                    <form id="project-info-form">
                        <Section title="PROJECT INFORMATION">
                            <InputRow label="Project:" name="project" value={formData['project'] || ''} onChange={handleChange}/>
                            <InputRow label="Address:" name="project_address" value={formData['project_address'] || ''} onChange={handleChange} />
                            <InputRow label="Project No:" name="project_no" value={formData['project_no'] || ''} onChange={handleChange} />
                            <InputRow label="Prepared By:" name="prepared_by" value={formData['prepared_by'] || ''} onChange={handleChange} />
                            <InputRow label="Prepared Date:" name="prepared_date" type="date" value={formData['prepared_date'] || ''} onChange={handleChange} />
                        </Section>

                        <Separator className="my-8" />
                        
                        <Section title="About Owner">
                            <InputRow label="Full Name:" name="owner_name" value={formData['owner_name'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Office):" name="owner_office_address" value={formData['owner_office_address'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Res.):" name="owner_res_address" value={formData['owner_res_address'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Office):" name="owner_office_phone" value={formData['owner_office_phone'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Res.):" name="owner_res_phone" value={formData['owner_res_phone'] || ''} onChange={handleChange} />
                            <InputRow label="Owner's Project Representative Name:" name="rep_name" value={formData['rep_name'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Office):" name="rep_office_address" value={formData['rep_office_address'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Res.):" name="rep_res_address" value={formData['rep_res_address'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Office):" name="rep_office_phone" value={formData['rep_office_phone'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Res.):" name="rep_res_phone" value={formData['rep_res_phone'] || ''} onChange={handleChange} />
                        </Section>

                        <Separator className="my-8" />

                        <Section title="About Project">
                             <InputRow label="Address:" name="about_project_address" value={formData['about_project_address'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Reqt.</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Architectural Designing" name="reqt_arch" checked={formData['reqt_arch'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_arch', c)} />
                                     <CheckboxRow label="Interior Decoration" name="reqt_interior" checked={formData['reqt_interior'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_interior', c)} />
                                     <CheckboxRow label="Landscaping" name="reqt_landscaping" checked={formData['reqt_landscaping'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_landscaping', c)} />
                                     <CheckboxRow label="Turnkey" name="reqt_turnkey" checked={formData['reqt_turnkey'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_turnkey', c)} />
                                     <div className="flex items-center gap-2"><Checkbox name="reqt_other" checked={formData['reqt_other'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_other', c)} /><Label htmlFor="reqt_other">Other</Label><Input name="reqt_other_text" value={formData['reqt_other_text'] || ''} onChange={handleChange} className="h-7"/></div>
                                 </div>
                             </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Type:</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Commercial" name="type_commercial" checked={formData['type_commercial'] || false} onCheckedChange={(c) => handleCheckboxChange('type_commercial', c)} />
                                     <CheckboxRow label="Residential" name="type_residential" checked={formData['type_residential'] || false} onCheckedChange={(c) => handleCheckboxChange('type_residential', c)} />
                                 </div>
                             </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Status</Label>
                                 <RadioGroup name="project_status" value={formData['project_status']} onValueChange={(v) => handleRadioChange('project_status', v)} className="md:col-span-2 space-y-2">
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="new" id="status_new" /><Label htmlFor="status_new" className="font-normal">New</Label></div>
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="addition" id="status_addition" /><Label htmlFor="status_addition" className="font-normal">Addition</Label></div>
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="rehab" id="status_rehab" /><Label htmlFor="status_rehab" className="font-normal">Rehabilitation/Renovation</Label></div>
                                 </RadioGroup>
                             </div>
                             <InputRow label="Project Area:" name="project_area" value={formData['project_area'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="special_reqs" className="md:text-right pt-2">Special Requirments of Project:</Label>
                                <Textarea id="special_reqs" name="special_reqs" value={formData['special_reqs'] || ''} onChange={handleChange} className="md:col-span-2" />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project's Cost</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Architectural Designing" name="cost_arch" checked={formData['cost_arch'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_arch', c)} />
                                     <CheckboxRow label="Interior Decoration" name="cost_interior" checked={formData['cost_interior'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_interior', c)} />
                                     <CheckboxRow label="Landscaping" name="cost_landscaping" checked={formData['cost_landscaping'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_landscaping', c)} />
                                     <CheckboxRow label="Construction" name="cost_construction" checked={formData['cost_construction'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_construction', c)} />
                                     <CheckboxRow label="Turnkey" name="cost_turnkey" checked={formData['cost_turnkey'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_turnkey', c)} />
                                     <div className="flex items-center gap-2"><Checkbox name="cost_other" checked={formData['cost_other'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_other', c)} /><Label htmlFor="cost_other">Other</Label><Input name="cost_other_text" value={formData['cost_other_text'] || ''} onChange={handleChange} className="h-7"/></div>
                                 </div>
                             </div>
                        </Section>

                        <Section title="Dates Concerned with Project">
                            <InputRow label="First Information about Project:" name="date_first_info" type="date" value={formData['date_first_info'] || ''} onChange={handleChange} />
                            <InputRow label="First Meeting:" name="date_first_meeting" type="date" value={formData['date_first_meeting'] || ''} onChange={handleChange} />
                            <InputRow label="First Working on Project:" name="date_first_working" type="date" value={formData['date_first_working'] || ''} onChange={handleChange} />
                            <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">First Proposal:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" name="date_proposal1_start" type="date" value={formData['date_proposal1_start'] || ''} onChange={handleChange} />
                                    <InputRow label="Completion" name="date_proposal1_completion" type="date" value={formData['date_proposal1_completion'] || ''} onChange={handleChange} />
                                </div>
                            </div>
                             <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Second Proposal:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" name="date_proposal2_start" type="date" value={formData['date_proposal2_start'] || ''} onChange={handleChange} />
                                    <InputRow label="Completion" name="date_proposal2_completion" type="date" value={formData['date_proposal2_completion'] || ''} onChange={handleChange} />
                                </div>
                            </div>
                            <InputRow label="Working on Finalized Proposal:" name="date_final_proposal" type="date" value={formData['date_final_proposal'] || ''} onChange={handleChange} />
                            <InputRow label="Revised Presentation:" name="date_revised_presentation" type="date" value={formData['date_revised_presentation'] || ''} onChange={handleChange} />
                            <InputRow label="Quotation:" name="date_quotation" type="date" value={formData['date_quotation'] || ''} onChange={handleChange} />
                            <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Drawings:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" name="date_drawings_start" type="date" value={formData['date_drawings_start'] || ''} onChange={handleChange} />
                                    <InputRow label="Completion" name="date_drawings_completion" type="date" value={formData['date_drawings_completion'] || ''} onChange={handleChange} />
                                </div>
                            </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="other_dates" className="md:text-right pt-2">Other Major Projects Milestone Dates:</Label>
                                <Textarea id="other_dates" name="other_dates" value={formData['other_dates'] || ''} onChange={handleChange} className="md:col-span-2" />
                            </div>
                        </Section>

                        <Section title="Provided by Owner">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 md:col-start-2 space-y-2">
                                     <CheckboxRow label="Program" name="owner_program" checked={formData['owner_program'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_program', c)} />
                                     <CheckboxRow label="Suggested Schedule" name="owner_schedule" checked={formData['owner_schedule'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_schedule', c)} />
                                     <CheckboxRow label="Legal Site Description & Other Concerned Documents" name="owner_legal" checked={formData['owner_legal'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_legal', c)} />
                                     <CheckboxRow label="Land Survey Report" name="owner_survey" checked={formData['owner_survey'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_survey', c)} />
                                     <CheckboxRow label="Geo-Technical, Tests and Other Site Information" name="owner_geo" checked={formData['owner_geo'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_geo', c)} />
                                     <CheckboxRow label="Existing Structure's Drawings" name="owner_existing_drawings" checked={formData['owner_existing_drawings'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_existing_drawings', c)} />
                                 </div>
                             </div>
                        </Section>

                        <Section title="Compensation">
                            <InputRow label="Initial Payment:" name="comp_initial" value={formData['comp_initial'] || ''} onChange={handleChange} />
                            <InputRow label="Basic Services (% of Cost of Construction):" name="comp_basic" value={formData['comp_basic'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Breakdown by Phase:</Label>
                                <div className="md:col-span-2 space-y-2">
                                    <InputRow label="Schematic Design:" name="comp_schematic" value={formData['comp_schematic'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Design Development:" name="comp_dev" value={formData['comp_dev'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Construction Doc's:" name="comp_docs" value={formData['comp_docs'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Bidding / Negotiation:" name="comp_bidding" value={formData['comp_bidding'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Construction Contract Admin:" name="comp_admin" value={formData['comp_admin'] || ''} onChange={handleChange} placeholder="%" />
                                </div>
                            </div>
                             <InputRow label="Additional Services (Multiple of Times Direct Cost to Architect):" name="comp_additional" value={formData['comp_additional'] || ''} onChange={handleChange} />
                             <InputRow label="Reimbursable Expenses:" name="comp_reimbursable" value={formData['comp_reimbursable'] || ''} onChange={handleChange} />
                             <InputRow label="Other:" name="comp_other" value={formData['comp_other'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="confidential_reqs" className="md:text-right pt-2">Special Confindential Requirements:</Label>
                                <Textarea id="confidential_reqs" name="confidential_reqs" value={formData['confidential_reqs'] || ''} onChange={handleChange} className="md:col-span-2" />
                            </div>
                        </Section>

                        <Section title="Miscellaneous Notes">
                            <Textarea id="misc_notes" name="misc_notes" value={formData['misc_notes'] || ''} onChange={handleChange} className="min-h-[100px]" />
                        </Section>
                        
                        <Section title="Consultants">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Within Basic Fee</TableHead>
                                        <TableHead>Additional Fee</TableHead>
                                        <TableHead>Architect</TableHead>
                                        <TableHead>Owner</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"].map((c, index) => <ConsultantRow key={`${c}-${index}`} type={c} data={formData.consultants?.[c.toLowerCase().replace(/ /g, '_')] || {}} onChange={handleConsultantChange}/>)}
                                </TableBody>
                             </Table>
                        </Section>
                        
                        <Section title="Requirements">
                            <InputRow label="Residence:" name="req_residence" value={formData['req_residence'] || ''} onChange={handleChange} />
                            <InputRow label="Nos.:" name="req_nos" value={formData['req_nos'] || ''} onChange={handleChange} />
                            <InputRow label="Size of plot:" name="req_plot_size" value={formData['req_plot_size'] || ''} onChange={handleChange} />
                            <InputRow label="Number of Bedrooms:" name="req_bedrooms" value={formData['req_bedrooms'] || ''} onChange={handleChange} />
                            <InputRow label="Specifications:" name="req_specifications" value={formData['req_specifications'] || ''} onChange={handleChange} />
                            <InputRow label="Number of Dressing Rooms:" name="req_dressing_rooms" value={formData['req_dressing_rooms'] || ''} onChange={handleChange} />
                            <InputRow label="Number of Bath Rooms:" name="req_bathrooms" value={formData['req_bathrooms'] || ''} onChange={handleChange} />
                            <InputRow label="Living Rooms:" name="req_living_rooms" value={formData['req_living_rooms'] || ''} onChange={handleChange} />
                            <InputRow label="Breakfast:" name="req_breakfast" value={formData['req_breakfast'] || ''} onChange={handleChange} />
                            <InputRow label="Dinning:" name="req_dining" value={formData['req_dining'] || ''} onChange={handleChange} />
                            <InputRow label="Servant Kitchen:" name="req_servant_kitchen" value={formData['req_servant_kitchen'] || ''} onChange={handleChange} />
                            <InputRow label="Self Kitchenett:" name="req_self_kitchenette" value={formData['req_self_kitchenette'] || ''} onChange={handleChange} />
                            <InputRow label="Garage:" name="req_garage" value={formData['req_garage'] || ''} onChange={handleChange} />
                            <InputRow label="Servant Quarters:" name="req_servant_quarters" value={formData['req_servant_quarters'] || ''} onChange={handleChange} />
                            <InputRow label="Guard Room:" name="req_guard_room" value={formData['req_guard_room'] || ''} onChange={handleChange} />
                            <InputRow label="Study Room:" name="req_study_room" value={formData['req_study_room'] || ''} onChange={handleChange} />
                            <InputRow label="Stores:" name="req_stores" value={formData['req_stores'] || ''} onChange={handleChange} />
                            <InputRow label="Entertainment Area:" name="req_entertainment" value={formData['req_entertainment'] || ''} onChange={handleChange} />
                            <InputRow label="Partio:" name="req_patio" value={formData['req_patio'] || ''} onChange={handleChange} />
                            <InputRow label="Atrium:" name="req_atrium" value={formData['req_atrium'] || ''} onChange={handleChange} />
                            <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="req_remarks" className="md:text-right pt-2">Remarks:</Label>
                                <Textarea id="req_remarks" name="req_remarks" value={formData['req_remarks'] || ''} onChange={handleChange} className="md:col-span-2" />
                            </div>
                        </Section>
                        
                        <div className="flex justify-end gap-4 mt-12">
                            <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

