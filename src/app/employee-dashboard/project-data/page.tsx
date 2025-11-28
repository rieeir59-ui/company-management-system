
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="mb-6">
    {title && <h2 className="text-lg font-bold text-primary mb-3 pb-1 border-b border-primary">{title}</h2>}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InputRow = ({ label, id, placeholder, type = 'text' }: { label: string; id: string; placeholder?: string; type?: string; }) => (
    <div className="flex items-center gap-4">
        <Label htmlFor={id} className="w-48 text-right">{label}</Label>
        <Input id={id} name={id} placeholder={placeholder} type={type} className="flex-1" />
    </div>
);


export default function ProjectDataPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-data');
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Record Saved",
            description: "The project data has been successfully saved.",
        });
    }

    const handleDownloadPdf = () => {
        const form = document.getElementById('project-data-form') as HTMLFormElement;
        if (!form) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find form data.' });
            return;
        }

        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 22;

        const getInputValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value || '';
        const getRadioValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || '';
        
        const addSectionTitle = (title: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(40, 58, 90); // A professional blue color
            doc.text(title, margin, yPos);
            doc.setTextColor(0, 0, 0); // Reset to black
            yPos += 8;
        };

        const addKeyValuePair = (label: string, value: string) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'normal');
            const splitValue = doc.splitTextToSize(value, pageWidth - margin * 2 - 50);
            doc.text(splitValue, margin + 60, yPos);
            yPos += (splitValue.length * 5) + 2;
        };
        
        const addTextArea = (label: string, value: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
             doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            const splitText = doc.splitTextToSize(value, pageWidth - margin * 2 - 5);
            doc.text(splitText, margin + 5, yPos);
            yPos += (splitText.length * 5) + 5;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(45, 95, 51); // Primary color for main heading
        doc.text('PROJECT DATA', pageWidth / 2, 15, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // --- General Info ---
        addSectionTitle("Project Information");
        addKeyValuePair('Project:', getInputValue('project_name'));
        addKeyValuePair('Address:', getInputValue('project_address'));
        addKeyValuePair('Owner:', getInputValue('project_owner'));
        addKeyValuePair("Architect's Project No.:", getInputValue('architect_project_no'));
        addKeyValuePair('Date:', getInputValue('project_date'));
        addKeyValuePair('Tel:', getInputValue('project_tel'));
        addKeyValuePair('Business Address:', getInputValue('business_address'));
        addKeyValuePair('Home Address:', getInputValue('home_address'));
        addKeyValuePair('Tel (Business):', getInputValue('business_tel'));
        addKeyValuePair('Tel (Home):', getInputValue('home_tel'));

        // --- Project Details ---
        addSectionTitle("Project Details");
        addKeyValuePair('Proposed Improvements:', getInputValue('proposed_improvements'));
        addKeyValuePair('Building Dept. Classification:', getInputValue('building_classification'));
        addKeyValuePair('Set Backs:', `N: ${getInputValue('setback_n')}, E: ${getInputValue('setback_e')}, S: ${getInputValue('setback_s')}, W: ${getInputValue('setback_w')}, Coverage: ${getInputValue('setback_coverage')}`);
        addKeyValuePair('Cost:', getInputValue('project_cost'));
        addKeyValuePair('Stories:', getInputValue('project_stories'));
        addKeyValuePair('Fire Zone:', getInputValue('fire_zone'));
        addTextArea('Other Agency Standards or Approvals Required:', getInputValue('agency_approvals'));

        // --- Site Legal Description ---
        addSectionTitle("Site Legal Description");
        addTextArea('Description:', getInputValue('site_legal_description'));
        addKeyValuePair('Deed recorded in Vol.:', getInputValue('deed_vol'));
        addKeyValuePair('Page:', getInputValue('deed_page'));
        addKeyValuePair('at:', getInputValue('deed_at'));
        addKeyValuePair('to:', getInputValue('deed_to'));
        addKeyValuePair('Date:', getInputValue('deed_date'));
        addKeyValuePair('Restrictions:', getInputValue('restrictions'));
        addKeyValuePair('Easements:', getInputValue('easements'));
        addKeyValuePair('Liens, Leases:', getInputValue('liens_leases'));
        addKeyValuePair('Lot Dimensions:', `Dimensions: ${getInputValue('lot_dimensions')}, Facing: ${getInputValue('lot_facing')}, Value: ${getInputValue('lot_value')}`);
        addKeyValuePair('Adjacent property use:', getInputValue('adjacent_property_use'));

        // --- Contacts ---
        addSectionTitle("Contacts");
        addKeyValuePair('Owners: Name:', getInputValue('owner_name_contact'));
        addKeyValuePair('Designated Representative:', getInputValue('rep_name_contact'));
        addKeyValuePair('Address:', getInputValue('contact_address'));
        addKeyValuePair('Tel:', getInputValue('contact_tel'));
        addKeyValuePair('Attorney at Law:', getInputValue('attorney'));
        addKeyValuePair('Insurance Advisor:', getInputValue('insurance_advisor'));
        addKeyValuePair('Consultant on:', getInputValue('consultant_on'));

        // --- Site Information Sources ---
        addSectionTitle("Site Information Sources");
        addKeyValuePair('Property Survey by:', getInputValue('survey_property'));
        addKeyValuePair('Date:', getInputValue('survey_property_date'));
        addKeyValuePair('Topographic Survey by:', getInputValue('survey_topo'));
        addKeyValuePair('Date:', getInputValue('survey_topo_date'));
        addKeyValuePair('Soils Tests by:', getInputValue('soils_tests'));
        addKeyValuePair('Date:', getInputValue('soils_date'));
        addKeyValuePair('Aerial Photos by:', getInputValue('aerial_photos'));
        addKeyValuePair('Date:', getInputValue('aerial_date'));
        addKeyValuePair('Maps:', getInputValue('maps_source'));

        // --- Public Services ---
        addSectionTitle("Public Services");
        addKeyValuePair('Gas Company (Name, Address):', getInputValue('gas_company'));
        addKeyValuePair('Representative:', getInputValue('gas_rep'));
        addKeyValuePair('Tel:', getInputValue('gas_tel'));
        addKeyValuePair('Electric Co (Name, Address):', getInputValue('electric_company'));
        addKeyValuePair('Representative:', getInputValue('electric_rep'));
        addKeyValuePair('Tel:', getInputValue('electric_tel'));
        addKeyValuePair('Telephone Co (Name, Address):', getInputValue('tel_company'));
        addKeyValuePair('Representative:', getInputValue('tel_rep'));
        addKeyValuePair('Tel:', getInputValue('tel_tel'));
        addKeyValuePair('Sewers:', getInputValue('sewers'));
        addKeyValuePair('Water:', getInputValue('water'));

        // --- Financial Data ---
        addSectionTitle("Financial Data");
        addKeyValuePair('Loan:', `Amount: ${getInputValue('loan_amount')}, Type: ${getInputValue('loan_type')}, Rate: ${getInputValue('loan_rate')}`);
        addKeyValuePair('Loan by:', getInputValue('loan_by'));
        addKeyValuePair('Representative:', getInputValue('loan_rep'));
        addKeyValuePair('Tel:', getInputValue('loan_tel'));
        addKeyValuePair('Bonds or Liens:', getInputValue('bonds_liens'));
        addKeyValuePair('Grant:', `Amount: ${getInputValue('grant_amount')}, Limitations: ${getInputValue('grant_limitations')}`);
        addKeyValuePair('Grant from:', getInputValue('grant_from'));
        addKeyValuePair('Representative:', getInputValue('grant_rep'));
        addKeyValuePair('Tel:', getInputValue('grant_tel'));

        // --- Method of Handling ---
        addSectionTitle("Method of Handling");
        addKeyValuePair('Contract Type:', getRadioValue('contract_type'));
        addKeyValuePair('Negotiated:', getInputValue('negotiated'));
        addKeyValuePair('Bid:', getInputValue('bid'));
        addKeyValuePair('Stipulated Sum:', getInputValue('stipulated_sum'));
        addKeyValuePair('Cost Plus Fee:', getInputValue('cost_plus_fee'));
        addKeyValuePair('Force Amount:', getInputValue('force_amount'));
        addKeyValuePair('Equipment:', `Fixed: ${getInputValue('equipment_fixed')}, Movable: ${getInputValue('equipment_movable')}, Interiors: ${getInputValue('equipment_interiors')}`);
        addKeyValuePair('Landscaping:', getInputValue('landscaping'));

        // --- Sketch of Property ---
        addSectionTitle("Sketch of Property");
        addTextArea('Notations:', getInputValue('sketch_notes'));

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save('project-data.pdf');
        
        toast({
            title: "Download Started",
            description: "The project data PDF is being generated.",
        });
    }
    
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Project Data"
                description="A comprehensive data sheet for the project."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardContent className="p-6 md:p-8">
                    <form id="project-data-form">
                        <Section>
                           <InputRow label="Project:" id="project_name" />
                           <InputRow label="Address:" id="project_address" />
                           <InputRow label="Owner:" id="project_owner" />
                           <InputRow label="Architect's Project No." id="architect_project_no" />
                           <InputRow label="Date:" id="project_date" type="date" />
                           <InputRow label="Tel:" id="project_tel" />
                           <InputRow label="Business Address:" id="business_address" />
                           <InputRow label="Home Address:" id="home_address" />
                           <InputRow label="Tel (Business):" id="business_tel" />
                           <InputRow label="Tel (Home):" id="home_tel" />
                        </Section>

                        <Section>
                            <InputRow label="Proposed Improvements:" id="proposed_improvements" />
                            <InputRow label="Building Dept. Classification:" id="building_classification" />
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Set Backs:</Label>
                                <div className="flex-1 grid grid-cols-5 gap-2">
                                    <Input name="setback_n" placeholder="N" />
                                    <Input name="setback_e" placeholder="E" />
                                    <Input name="setback_s" placeholder="S" />
                                    <Input name="setback_w" placeholder="W" />
                                    <Input name="setback_coverage" placeholder="Coverage" />
                                </div>
                            </div>
                            <InputRow label="Cost:" id="project_cost" />
                            <InputRow label="Stories:" id="project_stories" />
                            <InputRow label="Fire Zone:" id="fire_zone" />
                             <div className="flex flex-col gap-2">
                                <Label htmlFor="agency_approvals">Other Agency Standards or Approvals Required:</Label>
                                <Textarea id="agency_approvals" name="agency_approvals" />
                            </div>
                        </Section>
                        
                        <Section title="Site Legal Description">
                             <Textarea id="site_legal_description" name="site_legal_description" />
                             <InputRow label="Deed recorded in Vol." id="deed_vol" />
                             <InputRow label="Page" id="deed_page" />
                             <InputRow label="at" id="deed_at" />
                             <InputRow label="to" id="deed_to" />
                             <InputRow label="Date:" id="deed_date" type="date" />
                             <InputRow label="Restrictions:" id="restrictions" />
                             <InputRow label="Easements:" id="easements" />
                             <InputRow label="Liens, Leases:" id="liens_leases" />
                             <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Lot Dimensions:</Label>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <Input name="lot_dimensions" placeholder="Dimensions" />
                                    <Input name="lot_facing" placeholder="Facing" />
                                    <Input name="lot_value" placeholder="Value" />
                                </div>
                            </div>
                            <InputRow label="Adjacent property use:" id="adjacent_property_use" />
                        </Section>

                         <Section title="Contacts">
                            <InputRow label="Owners: Name:" id="owner_name_contact" />
                            <InputRow label="Designated Representative:" id="rep_name_contact" />
                            <InputRow label="Address:" id="contact_address" />
                            <InputRow label="Tel:" id="contact_tel" />
                            <InputRow label="Attorney at Law:" id="attorney" />
                            <InputRow label="Insurance Advisor:" id="insurance_advisor" />
                            <InputRow label="Consultant on:" id="consultant_on" />
                        </Section>

                        <Section title="Site Information Sources">
                            <InputRow label="Property Survey by:" id="survey_property" />
                            <InputRow label="Date:" id="survey_property_date" type="date" />
                            <InputRow label="Topographic Survey by:" id="survey_topo" />
                             <InputRow label="Date:" id="survey_topo_date" type="date" />
                            <InputRow label="Soils Tests by:" id="soils_tests" />
                             <InputRow label="Date:" id="soils_date" type="date" />
                            <InputRow label="Aerial Photos by:" id="aerial_photos" />
                             <InputRow label="Date:" id="aerial_date" type="date" />
                            <InputRow label="Maps:" id="maps_source" />
                        </Section>

                        <Section title="Public Services">
                            <InputRow label="Gas Company (Name, Address):" id="gas_company" />
                             <InputRow label="Representative:" id="gas_rep" />
                             <InputRow label="Tel:" id="gas_tel" />
                            <InputRow label="Electric Co (Name, Address):" id="electric_company" />
                             <InputRow label="Representative:" id="electric_rep" />
                             <InputRow label="Tel:" id="electric_tel" />
                            <InputRow label="Telephone Co (Name, Address):" id="tel_company" />
                             <InputRow label="Representative:" id="tel_rep" />
                             <InputRow label="Tel:" id="tel_tel" />
                            <InputRow label="Sewers:" id="sewers" />
                            <InputRow label="Water:" id="water" />
                        </Section>

                        <Section title="Financial Data">
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Loan:</Label>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <Input name="loan_amount" placeholder="Amount" />
                                    <Input name="loan_type" placeholder="Type" />
                                    <Input name="loan_rate" placeholder="Rate" />
                                </div>
                            </div>
                             <InputRow label="Loan by:" id="loan_by" />
                             <InputRow label="Representative:" id="loan_rep" />
                             <InputRow label="Tel:" id="loan_tel" />
                            <InputRow label="Bonds or Liens:" id="bonds_liens" />
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Grant:</Label>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <Input name="grant_amount" placeholder="Amount" />
                                    <Input name="grant_limitations" placeholder="Limitations" />
                                </div>
                            </div>
                             <InputRow label="Grant from:" id="grant_from" />
                             <InputRow label="Representative:" id="grant_rep" />
                             <InputRow label="Tel:" id="grant_tel" />
                        </Section>
                        
                        <Section title="Method of Handling">
                             <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Contract Type:</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2"><input type="radio" id="single_contract" name="contract_type" value="single" /><Label htmlFor="single_contract">Single</Label></div>
                                    <div className="flex items-center gap-2"><input type="radio" id="separate_contract" name="contract_type" value="separate" /><Label htmlFor="separate_contract">Separate</Label></div>
                                </div>
                            </div>
                            <InputRow label="Negotiated:" id="negotiated" />
                            <InputRow label="Bid:" id="bid" />
                            <InputRow label="Stipulated Sum:" id="stipulated_sum" />
                            <InputRow label="Cost Plus Fee:" id="cost_plus_fee" />
                            <InputRow label="Force Amount:" id="force_amount" />
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Equipment:</Label>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <Input name="equipment_fixed" placeholder="Fixed" />
                                    <Input name="equipment_movable" placeholder="Movable" />
                                    <Input name="equipment_interiors" placeholder="Interiors" />
                                </div>
                            </div>
                            <InputRow label="Landscaping:" id="landscaping" />
                        </Section>

                        <Section title="Sketch of Property">
                             <div className="flex flex-col gap-2">
                                <Label htmlFor="sketch_notes">Notations on existing improvements, disposal thereof, utilities, tree, etc.; indicated North; notations on other Project provision:</Label>
                                <Textarea id="sketch_notes" name="sketch_notes" rows={5} />
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
