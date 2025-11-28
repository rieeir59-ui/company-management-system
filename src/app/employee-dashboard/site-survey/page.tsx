
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

const SectionTable = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
        <h2 className="text-xl font-bold text-primary mb-3 pb-2 border-b-2 border-primary">{title}</h2>
        <Table>
            <TableBody>
                {children}
            </TableBody>
        </Table>
    </section>
);

const FormRow = ({ label, children }: { label: string; children: React.ReactNode; }) => (
    <TableRow>
        <TableCell className="font-semibold w-1/3">{label}</TableCell>
        <TableCell>{children}</TableCell>
    </TableRow>
);


const checklistItems = [
    { no: 1, title: 'Existing Plan' },
    { no: 2, title: 'Site Plan' },
    { no: 3, title: 'Basement Plan' },
    { no: 4, title: 'Ground Floor Plan' },
    { no: 5, title: 'First Floor Plan' },
    { no: 6, title: 'Second Floor Plan' },
    { no: 7, title: 'Elevation 1 - Material Structure' },
    { no: 8, title: 'Elevation 2 - Material Structure' },
    { no: 9, title: 'Elevation 3 - Material Structure' },
    { no: 10, title: 'Elevation 4 - Material Structure' },
    { no: 11, title: 'Window Details Existing' },
    { no: 12, title: 'Door Heights Existing' },
    { no: 13, title: 'Interior Finishes' },
    { no: 14, title: 'HVAC' },
];

const structureDrawingItems = [
    { no: 1, title: 'Ground Floor Slab' },
    { no: 2, title: 'First Floor Plan' },
    { no: 3, title: 'Second floor Plan' },
    { no: 4, title: 'Wall Elevation & Slab Sec' },
    { no: 5, title: 'Wall Sections & Details' },
    { no: 6, title: 'Staircase' },
    { no: 7, title: 'Column Sizes / Locations' },
    { no: 8, title: 'Beams sizes / Locations' },
];

const plumbingDrawingItems = [
    { no: 1, title: 'Sewage System' },
    { no: 2, title: 'Water Supply & Gas Systems' },
    { no: 3, title: 'Location of underground water tank' },
    { no: 4, title: 'Location of underground septic tank' },
    { no: 5, title: 'Main Water Supply Source' },
];

const electrificationDrawingItems = [
    { no: 1, title: 'Illumination Layout Plan' },
    { no: 2, title: 'Power Layout Plan' },
    { no: 3, title: 'Legend & General Notes' },
    { no: 4, title: 'Camera Dvr' },
    { no: 5, title: 'Smoke Detector / fire fighting' },
    { no: 6, title: 'PTCL Junction Box' },
    { no: 7, title: 'Main DB Location' },
    { no: 8, title: 'Sub DBs Location' },
];

export default function ProjectDataPage() {
    const image = PlaceHolderImages.find(p => p.id === 'site-survey');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const handleSave = async () => {
        if (!currentUser || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const form = document.getElementById('site-survey-form') as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            'location_purpose_house': formData.get('purpose_house'),
            'location_purpose_other': formData.get('purpose_other_text'),
            'location_date': formData.get('location_date'),
            'location_city': formData.get('location_city'),
            //... and so on for all form fields
        };

        const record = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Site Survey',
            projectName: (formData.get('location_address') as string) || `Survey on ${new Date().toLocaleDateString()}`,
            data: [{ category: 'Site Survey Data', items: Object.entries(data).map(([key, value]) => `${key}: ${value}`) }],
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), record);
            toast({
                title: "Record Saved",
                description: "The site survey has been successfully saved.",
            });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    }

    const handleDownloadPdf = () => {
        const form = document.getElementById('site-survey-form') as HTMLFormElement;
        if (!form) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find form data.' });
            return;
        }

        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 15;
        
        const primaryColor = [45, 95, 51];
        const headingFillColor = [240, 240, 240];


        const getInputValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value || '';
        const getRadioValue = (name: string) => (form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value || 'N/A';
        const getCheckboxValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.checked;
        
        const addSectionTitle = (title: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setLineWidth(0.5);
            doc.setFillColor(headingFillColor[0], headingFillColor[1], headingFillColor[2]);
            doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(title, margin + 2, yPos + 5.5);
            yPos += 8;
        };

        const drawField = (label: string, value: string) => {
          if (yPos > 275) { doc.addPage(); yPos = 20; }
          doc.setLineWidth(0.2);
          doc.rect(margin, yPos, pageWidth - margin * 2, 10);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(label, margin + 2, yPos + 6);
          doc.text(value, margin + 60, yPos + 6);
          yPos += 10;
        };
        
        const drawCheckboxField = (label: string, options: {id: string, label: string}[]) => {
            if (yPos > 275) { doc.addPage(); yPos = 20; }
            doc.setLineWidth(0.2);
            doc.rect(margin, yPos, pageWidth - margin * 2, 10);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(label, margin + 2, yPos + 6);
            let xOffset = 60;
            options.forEach(opt => {
                doc.rect(margin + xOffset, yPos + 2.5, 5, 5);
                if(getCheckboxValue(opt.id)) doc.text('X', margin + xOffset + 1, yPos + 6);
                doc.text(opt.label, margin + xOffset + 7, yPos + 6);
                xOffset += 40;
            });
            yPos += 10;
        };
        
        const drawRadioField = (label: string, name: string, options: string[]) => {
            if (yPos > 275) { doc.addPage(); yPos = 20; }
            doc.setLineWidth(0.2);
            doc.rect(margin, yPos, pageWidth - margin * 2, 10);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(label, margin + 2, yPos + 6);
            let xOffset = 60;
            const selectedValue = getRadioValue(name);
            options.forEach(opt => {
                doc.circle(margin + xOffset + 2.5, yPos + 5, 2.5);
                if (selectedValue === opt.toLowerCase()) doc.circle(margin + xOffset + 2.5, yPos + 5, 1.5, 'F');
                doc.text(opt, margin + xOffset + 7, yPos + 6);
                xOffset += 40;
            });
             yPos += 10;
        }

        // --- HEADER ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('IHA PROJECT MANAGEMENT', margin, yPos);
        doc.text('Premises Review', pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.text('For Residential Project', pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('This questionnaire form provides preliminary information for determining the suitability of premises or property to be acquired', margin, yPos);
        yPos += 10;

        // --- SECTIONS ---
        addSectionTitle('Location');
        drawField('Purpose', `House: ${getCheckboxValue('purpose_house') ? 'Yes' : 'No'}, Other: ${getInputValue('purpose_other_text')}`);
        drawField('Date', getInputValue('location_date'));
        drawField('City', getInputValue('location_city'));
        drawField('Region', getInputValue('location_region'));
        drawField('Address', getInputValue('location_address'));
        yPos += 5;

        addSectionTitle('Legal File');
        drawField('Name of Owner', getInputValue('legal_owner_name'));
        drawRadioField('Is Completion Certificate available', 'completion_cert', ['Yes', 'No']);
        drawRadioField('Is the property leased', 'is_leased', ['Yes', 'No']);
        yPos += 5;

        addSectionTitle('Area');
        drawField('Maximum frontage:', getInputValue('area_frontage'));
        drawField('Maximum Depth:', getInputValue('area_depth'));
        drawField('Total Area in Sqft', getInputValue('area_total'));
        drawField('Minimum clear height (ft)', getInputValue('area_height'));
        drawField('Building plot size', getInputValue('area_plot_size'));
        drawField('Covered Area', getInputValue('area_covered'));
        drawField('No. of Stories / floors', getInputValue('area_stories'));
        yPos += 5;
        
        addSectionTitle('Bounded As');
        drawField('Front', getInputValue('bounded_front'));
        drawField('Back', getInputValue('bounded_back'));
        drawField('Right', getInputValue('bounded_right'));
        drawField('Left', getInputValue('bounded_left'));
        yPos += 5;

        addSectionTitle('Utilities');
        drawField('Sanctioned electrical load', getInputValue('sanctioned_load_text'));
        drawRadioField('Type of electrical load', 'electrical_load_type', ['Commercial', 'Industrial', 'Residential']);
        drawField('Electrical Meter', getInputValue('electrical_meter'));
        drawRadioField('Piped water available', 'piped_water', ['Yes', 'No']);
        drawRadioField('Underground tank', 'underground_tank', ['Yes', 'No']);
        drawRadioField('Overhead tank', 'overhead_tank', ['Yes', 'No']);
        drawField('Type of Overhead tank', getInputValue('overhead_tank_type'));
        drawField('Type of water', getInputValue('water_type'));
        drawRadioField('Gas Connection', 'gas_connection', ['Yes', 'No']);
        drawRadioField('Connected to Sewerage line', 'sewerage_connection', ['Yes', 'No']);
        yPos += 5;
        
        doc.addPage();
        yPos = 20;

        addSectionTitle('Building overview');
        drawRadioField('Independent premises', 'independent_premises', ['Yes', 'No']);
        drawRadioField('Status', 'property_status', ['Commercial', 'Residential', 'Industrial']);
        drawField('Other Status', getInputValue('status_other_text'));
        drawRadioField('Type of Premises', 'premises_type', ['Residence', 'Offices', 'Godowns']);
        drawField('Other Premises Type', getInputValue('prem_other_text'));
        drawRadioField('Age of Premises', 'building_age', ['0-5', '5-10', '>10 years']);
        drawRadioField('Interior of Premises', 'interior_type', ['Single Hall', 'Rooms']);
        drawRadioField('Type of construction', 'construction_type', ['Beam-Column in RCC', 'Composite', 'Load Bearing']);
        yPos += 5;

        addSectionTitle('Building Details');
        drawRadioField('Seepage', 'seepage', ['Yes', 'No']);
        drawField('Area of seepage', getInputValue('seepage_area'));
        drawField('Cause of Seepage', getInputValue('seepage_cause'));
        drawCheckboxField('Property Utilization', [
            { id: 'util_residential', label: 'Residential' },
            { id: 'util_commercial', label: 'Commercial' },
            { id: 'util_dual', label: 'Dual use' },
            { id: 'util_industrial', label: 'Industrial' },
        ]);
        drawField('Condition of roof waterproofing', getInputValue('roof_waterproofing'));
        drawCheckboxField('Parking available', [
            { id: 'parking_yes', label: 'Yes' },
            { id: 'parking_main_road', label: 'On Main Road' },
            { id: 'parking_no', label: 'No' },
        ]);
        drawRadioField('Approachable through Road', 'approachable', ['Yes', 'No']);
        drawField('Wall masonary material', getInputValue('wall_material'));
        drawCheckboxField('Major retainable elements', [
            { id: 'retainable_water_tank', label: 'Water tank' },
            { id: 'retainable_subflooring', label: 'Subflooring' },
            { id: 'retainable_staircase', label: 'Staircase' },
        ]);
        drawField('Other retainable', getInputValue('retainable_other_text'));
        drawField('Plot level from road', getInputValue('plot_level'));
        drawRadioField('Building Control Violations', 'violations', ['Major', 'Minor', 'None']);
        yPos += 5;

        addSectionTitle('Rental Detail');
        drawField('Acquisition', getInputValue('rental_acquisition'));
        drawField('Expected Rental /month', getInputValue('rental_expected_rent'));
        drawField('Expected Advance', getInputValue('rental_expected_advance'));
        drawField('Expected period of lease', getInputValue('rental_lease_period'));
        drawField('Annual increase in rental', getInputValue('rental_annual_increase'));
        yPos += 5;
        
        doc.addPage();
        yPos = 20;

        addSectionTitle('Survey Checklist');
        drawField('Project', getInputValue('survey_project'));
        drawField('Location', getInputValue('survey_location'));
        drawField('Contract Date', getInputValue('survey_contract_date'));
        drawField('Project Number', getInputValue('survey_project_number'));
        drawField('Start Date', getInputValue('survey_start_date'));
        drawField('Project Incharge', getInputValue('survey_project_incharge'));
        yPos += 5;

        const generateChecklistTable = (title: string, items: {no: number, title: string}[], prefix: string) => {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(title, margin, yPos);
            yPos += 8;
            doc.setTextColor(0, 0, 0);
            doc.autoTable({
                startY: yPos,
                head: [['Sr.No', 'Drawing Title', 'Remarks']],
                body: items.map(item => [item.no.toString(), item.title, getInputValue(`${prefix}_remarks_${item.no}`)]),
                theme: 'grid',
                headStyles: { fillColor: headingFillColor, textColor: 0 }
            });
            yPos = (doc as any).autoTable.previous.finalY + 10;
        }

        generateChecklistTable('Architectural Drawings', checklistItems, 'checklist');
        generateChecklistTable('Structure Drawings', structureDrawingItems, 'structure');
        generateChecklistTable('Plumbing Drawings', plumbingDrawingItems, 'plumbing');
        generateChecklistTable('Electrification Drawings', electrificationDrawingItems, 'electrification');
        
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }


        doc.save('site-survey.pdf');
        
        toast({
            title: "Download Started",
            description: "The project data PDF is being generated.",
        });
    }
    
    return (
        <Card>
            <CardHeader>
                <div className="text-center">
                    <p className="text-sm font-bold text-muted-foreground">ISBAH HASSAN & ASSOCIATES</p>
                    <CardTitle className="text-3xl font-headline text-primary">IHA PROJECT MANAGEMENT</CardTitle>
                    <p className="font-semibold mt-2">Premises Review</p>
                    <p className="text-sm text-muted-foreground">For Residential Project</p>
                    <p className="text-xs mt-2 max-w-2xl mx-auto">This questionnaire form provides preliminary information for determining the suitability of premises or property to be acquired</p>
                </div>
            </CardHeader>
            <CardContent>
                <form id="site-survey-form" className="space-y-8">
                     <SectionTable title="Location">
                        <FormRow label="Purpose">
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2"><Checkbox id="purpose_house" name="purpose_house" /> <Label htmlFor="purpose_house">House</Label></div>
                              <div className="flex items-center gap-2"><Checkbox id="purpose_other_check" name="purpose_other_check" /> <Label htmlFor="purpose_other_check">Other:</Label> <Input id="purpose_other_text" name="purpose_other_text" /></div>
                           </div>
                        </FormRow>
                        <FormRow label="Date"><Input type="date" id="location_date" name="location_date" className="w-fit" /></FormRow>
                        <FormRow label="City"><Input id="location_city" name="location_city" /></FormRow>
                        <FormRow label="Region"><Input id="location_region" name="location_region" /></FormRow>
                        <FormRow label="Address"><Input id="location_address" name="location_address" /></FormRow>
                    </SectionTable>

                    <SectionTable title="Legal File">
                        <FormRow label="Name of Owner"><Input id="legal_owner_name" name="legal_owner_name" /></FormRow>
                        <FormRow label="Is Completion Certificate available">
                            <RadioGroup name="completion_cert" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cc_yes" /><Label htmlFor="cc_yes">Yes</Label></div>
                                <Label>As informed by Owner Representative</Label>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cc_no" /><Label htmlFor="cc_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Is the property leased">
                            <RadioGroup name="is_leased" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="leased_yes" /><Label htmlFor="leased_yes">Yes</Label></div>
                                <Label>As informed by Owner Representative</Label>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="leased_no" /><Label htmlFor="leased_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Area">
                         <FormRow label="Dimension">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Input placeholder="Maximum frontage:" id="area_frontage" name="area_frontage" />
                               <Input placeholder="Maximum Depth:" id="area_depth" name="area_depth" />
                            </div>
                         </FormRow>
                         <FormRow label="Total Area in Sqft"><Input placeholder="Total Area in Sqft" id="area_total" name="area_total" /></FormRow>
                         <FormRow label="Minimum clear height (Floor to Roof) in ft"><Input placeholder="Minimum clear height (Floor to Roof) in ft" id="area_height" name="area_height" /></FormRow>
                         <FormRow label="Building plot size of which premises is a part"><Input placeholder="Building plot size of which premises is a part" id="area_plot_size" name="area_plot_size" /></FormRow>
                         <FormRow label="Covered Area"><Input placeholder="Covered Area" id="area_covered" name="area_covered" /></FormRow>
                         <FormRow label="No. of Stories / floors"><Input placeholder="(mention mezzanine, basement, roof parapet wall etc.) If any." id="area_stories" name="area_stories" /></FormRow>
                    </SectionTable>

                    <SectionTable title="Bounded As">
                        <FormRow label="Front"><Input id="bounded_front" name="bounded_front"/></FormRow>
                        <FormRow label="Back"><Input id="bounded_back" name="bounded_back"/></FormRow>
                        <FormRow label="Right"><Input id="bounded_right" name="bounded_right" /></FormRow>
                        <FormRow label="Left"><Input id="bounded_left" name="bounded_left" /></FormRow>
                    </SectionTable>
                    
                    <SectionTable title="Utilities">
                        <FormRow label="Sanctioned electrical load">
                            <div className="flex items-center justify-between">
                                <Input id="sanctioned_load_text" name="sanctioned_load_text" />
                                <div className="flex items-center space-x-2"><Checkbox id="sanctioned_load_na" name="sanctioned_load_na" /><Label htmlFor="sanctioned_load_na">N/A</Label></div>
                            </div>
                        </FormRow>
                        <FormRow label="Type of electrical load">
                             <RadioGroup name="electrical_load_type" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="elec_commercial" /><Label htmlFor="elec_commercial">Commercial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="industrial" id="elec_industrial" /><Label htmlFor="elec_industrial">Industrial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="elec_residential" /><Label htmlFor="elec_residential">Residential</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Electrical Meter (single phase / 3 phase)"><Input id="electrical_meter" name="electrical_meter" /></FormRow>
                        <FormRow label="Piped water available">
                            <RadioGroup name="piped_water" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="water_yes" /><Label htmlFor="water_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="water_no" /><Label htmlFor="water_no">No</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Underground tank">
                            <RadioGroup name="underground_tank" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ug_tank_yes" /><Label htmlFor="ug_tank_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ug_tank_no" /><Label htmlFor="ug_tank_no">No</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Overhead tank">
                            <RadioGroup name="overhead_tank" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="oh_tank_yes" /><Label htmlFor="oh_tank_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="oh_tank_no" /><Label htmlFor="oh_tank_no">No</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Type of Overhead tank (RCC, Fiber etc.)"><Input id="overhead_tank_type" name="overhead_tank_type"/></FormRow>
                        <FormRow label="Type of water (boring or Line water)"><Input id="water_type" name="water_type" /></FormRow>
                        <FormRow label="Gas Connection">
                            <RadioGroup name="gas_connection" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="gas_yes" /><Label htmlFor="gas_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="gas_no" /><Label htmlFor="gas_no">No</Label></div></RadioGroup>
                        </FormRow>
                         <FormRow label="Connected to Sewerage line">
                            <RadioGroup name="sewerage_connection" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="sewer_yes" /><Label htmlFor="sewer_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="sewer_no" /><Label htmlFor="sewer_no">No</Label></div></RadioGroup>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Building overview">
                        <FormRow label="Independent premises">
                             <RadioGroup name="independent_premises" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ind_yes" /><Label htmlFor="ind_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ind_no" /><Label htmlFor="ind_no">No. a part of building</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Status">
                             <RadioGroup name="property_status" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="status_comm" /><Label htmlFor="status_comm">Commercial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="status_res" /><Label htmlFor="status_res">Residential</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="industrial" id="status_ind" /><Label htmlFor="status_ind">Industrial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="status_other" /><Label htmlFor="status_other">Other:</Label> <Input name="status_other_text" className="h-7" /></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Type of Premises">
                             <RadioGroup name="premises_type" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residence" id="prem_res" /><Label htmlFor="prem_res">Residence</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="offices" id="prem_off" /><Label htmlFor="prem_off">Offices</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="godowns" id="prem_god" /><Label htmlFor="prem_god">Godowns</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="prem_other" /><Label htmlFor="prem_other">Other:</Label> <Input name="prem_other_text" className="h-7" /></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Age of Premises if any">
                            <RadioGroup name="building_age" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="0-5" id="age_0_5" /><Label htmlFor="age_0_5">0-5</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="5-10" id="age_5_10" /><Label htmlFor="age_5_10">5-10</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value=">10" id="age_gt_10" /><Label htmlFor="age_gt_10">More than 10 years</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Interior of Premises if any">
                            <RadioGroup name="interior_type" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="single_hall" id="it_single_hall" /><Label htmlFor="it_single_hall">Single Hall</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="rooms" id="it_rooms" /><Label htmlFor="it_rooms">Rooms</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Type of construction">
                            <RadioGroup name="construction_type" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="rcc" id="ct_rcc" /><Label htmlFor="ct_rcc">Beam-Column in RCC</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="composite" id="ct_composite" /><Label htmlFor="ct_composite">Composit Structure</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="load_bearing" id="ct_load_bearing" /><Label htmlFor="ct_load_bearing">Load Bearing in walls</Label></div></RadioGroup>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Building Details">
                        <FormRow label="Seepage">
                             <RadioGroup name="seepage" className="flex items-center space-x-8">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="seepage_yes" /><Label htmlFor="seepage_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="seepage_no" /><Label htmlFor="seepage_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Area of seepage (Walls, slab etc.)"><Input id="seepage_area" name="seepage_area"/></FormRow>
                        <FormRow label="Cause of Seepage"><Input id="seepage_cause" name="seepage_cause" /></FormRow>
                        <FormRow label="Property Utilization">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="util_residential" name="util_residential" /><Label htmlFor="util_residential">Fully residential</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_commercial" name="util_commercial"/><Label htmlFor="util_commercial">Fully Commercial</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_dual" name="util_dual" /><Label htmlFor="util_dual">Dual use residential & commercial</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_industrial" name="util_industrial" /><Label htmlFor="util_industrial">Industrial</Label></div>
                            </div>
                        </FormRow>
                         <FormRow label="Condition of roof waterproofing (if applicable)"><Input id="roof_waterproofing" name="roof_waterproofing" /></FormRow>
                        <FormRow label="Parking available">
                             <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="parking_yes" name="parking_yes" /><Label htmlFor="parking_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="parking_main_road" name="parking_main_road" /><Label htmlFor="parking_main_road">On Main Road</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="parking_no" name="parking_no" /><Label htmlFor="parking_no">No</Label></div>
                            </div>
                        </FormRow>
                        <FormRow label="Approachable through Road">
                             <RadioGroup name="approachable" className="flex items-center space-x-8">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="approachable_yes" /><Label htmlFor="approachable_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="approachable_no" /><Label htmlFor="approachable_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                         <FormRow label="Wall masonary material as per region"><Input id="wall_material" name="wall_material" /></FormRow>
                        <FormRow label="Major retainable building elements">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_water_tank" name="retainable_water_tank" /><Label htmlFor="retainable_water_tank">Water tank</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_subflooring" name="retainable_subflooring" /><Label htmlFor="retainable_subflooring">Subflooring</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_staircase" name="retainable_staircase" /><Label htmlFor="retainable_staircase">staircase</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_other_check" name="retainable_other_check" /><Label htmlFor="retainable_other_check">Others</Label><Input id="retainable_other_text" name="retainable_other_text" className="h-7" /></div>
                            </div>
                        </FormRow>
                        <FormRow label="Incase of Plot provide existing level from road & surrounding buildings"><Input id="plot_level" name="plot_level" /></FormRow>
                        <FormRow label="Building Control Violations">
                             <div className="flex flex-wrap items-center gap-4">
                                 <RadioGroup name="violations" className="flex flex-wrap gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="major" id="violation_major" /><Label htmlFor="violation_major">Major</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="minor" id="violation_minor" /><Label htmlFor="violation_minor">Minor</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="violation_none" /><Label htmlFor="violation_none">No Deviation</Label></div>
                                </RadioGroup>
                                 <div className="flex items-center space-x-2"><Checkbox id="violation_informed" name="violation_informed" /><Label htmlFor="violation_informed">As Informed by Owner Representative</Label></div>
                            </div>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Rental Detail">
                        <FormRow label="Acquisition"><Input id="rental_acquisition" name="rental_acquisition" /></FormRow>
                        <FormRow label="Expected Rental /month"><Input id="rental_expected_rent" name="rental_expected_rent" /></FormRow>
                        <FormRow label="Expected Advance (# of months)"><Input id="rental_expected_advance" name="rental_expected_advance"/></FormRow>
                        <FormRow label="Expected period of lease"><Input id="rental_lease_period" name="rental_lease_period"/></FormRow>
                        <FormRow label="Annual increase in rental"><Input id="rental_annual_increase" name="rental_annual_increase"/></FormRow>
                    </SectionTable>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-primary mb-3 pb-2 border-b-2 border-primary">Survey Checklist</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4 p-4 border rounded-lg">
                           <Input id="survey_project" name="survey_project" placeholder="Project" />
                           <Input id="survey_location" name="survey_location" placeholder="Location" />
                           <Input id="survey_contract_date" name="survey_contract_date" type="date" placeholder="Contract Date" />
                           <Input id="survey_project_number" name="survey_project_number" placeholder="Project Number" />
                           <Input id="survey_start_date" name="survey_start_date" type="date" placeholder="Start Date" />
                           <Input id="survey_project_incharge" name="survey_project_incharge" placeholder="Project Incharge" />
                        </div>
                        <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Architectural Drawings</h3>
                         <Table>
                            <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {checklistItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`checklist_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                         <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Structure Drawings</h3>
                         <Table>
                            <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {structureDrawingItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`structure_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                         <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Plumbing Drawings</h3>
                         <Table>
                            <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {plumbingDrawingItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`plumbing_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                         <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Electrification Drawings</h3>
                         <Table>
                             <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {electrificationDrawingItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`electrification_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                    </section>


                    <div className="flex justify-end gap-4 mt-12">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

    

    


