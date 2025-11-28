'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <section className="mb-6">
    {title && <h2 className="text-lg font-bold text-primary mb-3 pb-1 border-b border-primary section-title">{title}</h2>}
    <div className="space-y-4">
      {children}
    </div>
  </section>
);

const InputRow = ({ label, id, name, value, onChange, placeholder = '', type = 'text' }: { label: string, id: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, placeholder?: string, type?: string }) => (
    <div className="flex items-start gap-4 py-1">
        <Label htmlFor={id} className="w-48 text-right shrink-0 pt-2">{label}</Label>
        {type === 'textarea' ? (
          <Textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} className="flex-1" rows={3}/>
        ) : (
          <Input id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} className="flex-1" />
        )}
    </div>
);


export default function ProjectDataPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-data');
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        project_name: '', project_address: '', project_owner: '', architect_project_no: '',
        project_date: '', project_tel: '', business_address: '', home_address: '',
        business_tel: '', home_tel: '', proposed_improvements: '', building_classification: '',
        setback_n: '', setback_e: '', setback_s: '', setback_w: '', setback_coverage: '',
        project_cost: '', project_stories: '', fire_zone: '', agency_approvals: '',
        site_legal_description: '', deed_vol: '', deed_page: '', deed_at: '', deed_to: '',
        deed_date: '', restrictions: '', easements: '', liens_leases: '', lot_dimensions: '',
        lot_facing: '', lot_value: '', adjacent_property_use: '', owner_name_contact: '',
        rep_name_contact: '', contact_address: '', contact_tel: '', attorney: '',
        insurance_advisor: '', consultant_on: '', survey_property: '', survey_property_date: '',
        survey_topo: '', survey_topo_date: '', soils_tests: '', soils_date: '',
        aerial_photos: '', aerial_date: '', maps_source: '', gas_company: '', gas_rep: '',
        gas_tel: '', electric_company: '', electric_rep: '', electric_tel: '',
        tel_company: '', tel_rep: '', tel_tel: '', sewers: '', water: '',
        loan_amount: '', loan_type: '', loan_rate: '', loan_by: '', loan_rep: '',
        loan_tel: '', bonds_liens: '', grant_amount: '', grant_limitations: '',
        grant_from: '', grant_rep: '', grant_tel: '', contract_type: 'single', negotiated: '',
        bid: '', stipulated_sum: '', cost_plus_fee: '', force_amount: '',
        equipment_fixed: '', equipment_movable: '', equipment_interiors: '',
        landscaping: '', sketch_notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        toast({
            title: "Record Saved",
            description: "The project data has been successfully saved.",
        });
    }

    const handleDownloadPdf = () => {
        toast({
            title: "Preparing PDF",
            description: "Your document will be ready to print or save shortly.",
        });
        setTimeout(() => window.print(), 500);
    }
    
    return (
        <div className="space-y-8 project-data-page">
             <div className='no-print'>
                <DashboardPageHeader
                    title="Project Data"
                    description="A comprehensive data sheet for the project."
                    imageUrl={image?.imageUrl || ''}
                    imageHint={image?.imageHint || ''}
                />
            </div>

            <Card>
                <CardContent className="p-6 md:p-8">
                    <form id="project-data-form">
                        <Section>
                           <InputRow label="Project:" id="project_name" name="project_name" value={formData.project_name} onChange={handleChange}/>
                           <InputRow label="Address:" id="project_address" name="project_address" value={formData.project_address} onChange={handleChange}/>
                           <InputRow label="Owner:" id="project_owner" name="project_owner" value={formData.project_owner} onChange={handleChange}/>
                           <InputRow label="Architect's Project No." id="architect_project_no" name="architect_project_no" value={formData.architect_project_no} onChange={handleChange}/>
                           <InputRow label="Date:" id="project_date" name="project_date" type="date" value={formData.project_date} onChange={handleChange}/>
                           <InputRow label="Tel:" id="project_tel" name="project_tel" value={formData.project_tel} onChange={handleChange}/>
                           <InputRow label="Business Address:" id="business_address" name="business_address" value={formData.business_address} onChange={handleChange}/>
                           <InputRow label="Home Address:" id="home_address" name="home_address" value={formData.home_address} onChange={handleChange}/>
                           <InputRow label="Tel (Business):" id="business_tel" name="business_tel" value={formData.business_tel} onChange={handleChange}/>
                           <InputRow label="Tel (Home):" id="home_tel" name="home_tel" value={formData.home_tel} onChange={handleChange}/>
                        </Section>

                        <Section>
                            <InputRow label="Proposed Improvements:" id="proposed_improvements" name="proposed_improvements" value={formData.proposed_improvements} onChange={handleChange} />
                            <InputRow label="Building Dept. Classification:" id="building_classification" name="building_classification" value={formData.building_classification} onChange={handleChange}/>
                            <div className="flex items-center gap-4 py-1">
                                <Label className="w-48 text-right shrink-0">Set Backs:</Label>
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
                                    <Input name="setback_n" placeholder="N" value={formData.setback_n} onChange={handleChange}/>
                                    <Input name="setback_e" placeholder="E" value={formData.setback_e} onChange={handleChange}/>
                                    <Input name="setback_s" placeholder="S" value={formData.setback_s} onChange={handleChange}/>
                                    <Input name="setback_w" placeholder="W" value={formData.setback_w} onChange={handleChange}/>
                                    <Input name="setback_coverage" placeholder="Coverage" value={formData.setback_coverage} onChange={handleChange}/>
                                </div>
                            </div>
                            <InputRow label="Cost:" id="project_cost" name="project_cost" value={formData.project_cost} onChange={handleChange}/>
                            <InputRow label="Stories:" id="project_stories" name="project_stories" value={formData.project_stories} onChange={handleChange}/>
                            <InputRow label="Fire Zone:" id="fire_zone" name="fire_zone" value={formData.fire_zone} onChange={handleChange}/>
                             <div className="flex items-start gap-4 py-1">
                                <Label htmlFor="agency_approvals" className="w-48 text-right shrink-0 pt-2">Other Agency Standards or Approvals Required:</Label>
                                <Textarea id="agency_approvals" name="agency_approvals" value={formData.agency_approvals} onChange={handleChange} rows={2}/>
                            </div>
                        </Section>
                        
                        <Section title="Site Legal Description">
                             <InputRow label="Description:" id="site_legal_description" name="site_legal_description" type="textarea" value={formData.site_legal_description} onChange={handleChange}/>
                             <InputRow label="Deed recorded in Vol." id="deed_vol" name="deed_vol" value={formData.deed_vol} onChange={handleChange}/>
                             <InputRow label="Page" id="deed_page" name="deed_page" value={formData.deed_page} onChange={handleChange}/>
                             <InputRow label="at" id="deed_at" name="deed_at" value={formData.deed_at} onChange={handleChange}/>
                             <InputRow label="to" id="deed_to" name="deed_to" value={formData.deed_to} onChange={handleChange}/>
                             <InputRow label="Date:" id="deed_date" name="deed_date" type="date" value={formData.deed_date} onChange={handleChange}/>
                             <InputRow label="Restrictions:" id="restrictions" name="restrictions" value={formData.restrictions} onChange={handleChange}/>
                             <InputRow label="Easements:" id="easements" name="easements" value={formData.easements} onChange={handleChange}/>
                             <InputRow label="Liens, Leases:" id="liens_leases" name="liens_leases" value={formData.liens_leases} onChange={handleChange}/>
                             <div className="flex items-center gap-4 py-1">
                                <Label className="w-48 text-right shrink-0">Lot Dimensions:</Label>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Input name="lot_dimensions" placeholder="Dimensions" value={formData.lot_dimensions} onChange={handleChange}/>
                                    <Input name="lot_facing" placeholder="Facing" value={formData.lot_facing} onChange={handleChange}/>
                                    <Input name="lot_value" placeholder="Value" value={formData.lot_value} onChange={handleChange}/>
                                </div>
                            </div>
                            <InputRow label="Adjacent property use:" id="adjacent_property_use" name="adjacent_property_use" value={formData.adjacent_property_use} onChange={handleChange}/>
                        </Section>

                         <Section title="Contacts">
                            <InputRow label="Owners: Name:" id="owner_name_contact" name="owner_name_contact" value={formData.owner_name_contact} onChange={handleChange}/>
                            <InputRow label="Designated Representative:" id="rep_name_contact" name="rep_name_contact" value={formData.rep_name_contact} onChange={handleChange}/>
                            <InputRow label="Address:" id="contact_address" name="contact_address" value={formData.contact_address} onChange={handleChange}/>
                            <InputRow label="Tel:" id="contact_tel" name="contact_tel" value={formData.contact_tel} onChange={handleChange}/>
                            <InputRow label="Attorney at Law:" id="attorney" name="attorney" value={formData.attorney} onChange={handleChange}/>
                            <InputRow label="Insurance Advisor:" id="insurance_advisor" name="insurance_advisor" value={formData.insurance_advisor} onChange={handleChange}/>
                            <InputRow label="Consultant on:" id="consultant_on" name="consultant_on" value={formData.consultant_on} onChange={handleChange}/>
                        </Section>

                        <Section title="Site Information Sources">
                            <InputRow label="Property Survey by:" id="survey_property" name="survey_property" value={formData.survey_property} onChange={handleChange}/>
                            <InputRow label="Date:" id="survey_property_date" name="survey_property_date" type="date" value={formData.survey_property_date} onChange={handleChange}/>
                            <InputRow label="Topographic Survey by:" id="survey_topo" name="survey_topo" value={formData.survey_topo} onChange={handleChange}/>
                             <InputRow label="Date:" id="survey_topo_date" name="survey_topo_date" type="date" value={formData.survey_topo_date} onChange={handleChange}/>
                            <InputRow label="Soils Tests by:" id="soils_tests" name="soils_tests" value={formData.soils_tests} onChange={handleChange}/>
                             <InputRow label="Date:" id="soils_date" name="soils_date" type="date" value={formData.soils_date} onChange={handleChange}/>
                            <InputRow label="Aerial Photos by:" id="aerial_photos" name="aerial_photos" value={formData.aerial_photos} onChange={handleChange}/>
                             <InputRow label="Date:" id="aerial_date" name="aerial_date" type="date" value={formData.aerial_date} onChange={handleChange}/>
                            <InputRow label="Maps:" id="maps_source" name="maps_source" value={formData.maps_source} onChange={handleChange}/>
                        </Section>

                        <Section title="Public Services">
                            <InputRow label="Gas Company (Name, Address):" id="gas_company" name="gas_company" value={formData.gas_company} onChange={handleChange}/>
                             <InputRow label="Representative:" id="gas_rep" name="gas_rep" value={formData.gas_rep} onChange={handleChange}/>
                             <InputRow label="Tel:" id="gas_tel" name="gas_tel" value={formData.gas_tel} onChange={handleChange}/>
                            <InputRow label="Electric Co (Name, Address):" id="electric_company" name="electric_company" value={formData.electric_company} onChange={handleChange}/>
                             <InputRow label="Representative:" id="electric_rep" name="electric_rep" value={formData.electric_rep} onChange={handleChange}/>
                             <InputRow label="Tel:" id="electric_tel" name="electric_tel" value={formData.electric_tel} onChange={handleChange}/>
                            <InputRow label="Telephone Co (Name, Address):" id="tel_company" name="tel_company" value={formData.tel_company} onChange={handleChange}/>
                             <InputRow label="Representative:" id="tel_rep" name="tel_rep" value={formData.tel_rep} onChange={handleChange}/>
                             <InputRow label="Tel:" id="tel_tel" name="tel_tel" value={formData.tel_tel} onChange={handleChange}/>
                            <InputRow label="Sewers:" id="sewers" name="sewers" value={formData.sewers} onChange={handleChange}/>
                            <InputRow label="Water:" id="water" name="water" value={formData.water} onChange={handleChange}/>
                        </Section>

                        <Section title="Financial Data">
                            <div className="flex items-center gap-4 py-1">
                                <Label className="w-48 text-right shrink-0">Loan:</Label>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Input name="loan_amount" placeholder="Amount" value={formData.loan_amount} onChange={handleChange}/>
                                    <Input name="loan_type" placeholder="Type" value={formData.loan_type} onChange={handleChange}/>
                                    <Input name="loan_rate" placeholder="Rate" value={formData.loan_rate} onChange={handleChange}/>
                                </div>
                            </div>
                             <InputRow label="Loan by:" id="loan_by" name="loan_by" value={formData.loan_by} onChange={handleChange}/>
                             <InputRow label="Representative:" id="loan_rep" name="loan_rep" value={formData.loan_rep} onChange={handleChange}/>
                             <InputRow label="Tel:" id="loan_tel" name="loan_tel" value={formData.loan_tel} onChange={handleChange}/>
                            <InputRow label="Bonds or Liens:" id="bonds_liens" name="bonds_liens" value={formData.bonds_liens} onChange={handleChange}/>
                            <div className="flex items-center gap-4 py-1">
                                <Label className="w-48 text-right shrink-0">Grant:</Label>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input name="grant_amount" placeholder="Amount" value={formData.grant_amount} onChange={handleChange}/>
                                    <Input name="grant_limitations" placeholder="Limitations" value={formData.grant_limitations} onChange={handleChange}/>
                                </div>
                            </div>
                             <InputRow label="Grant from:" id="grant_from" name="grant_from" value={formData.grant_from} onChange={handleChange}/>
                             <InputRow label="Representative:" id="grant_rep" name="grant_rep" value={formData.grant_rep} onChange={handleChange}/>
                             <InputRow label="Tel:" id="grant_tel" name="grant_tel" value={formData.grant_tel} onChange={handleChange}/>
                        </Section>
                        
                        <Section title="Method of Handling">
                             <div className="flex items-center gap-4 py-1">
                                <Label className="w-48 text-right shrink-0">Contract Type:</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2"><input type="radio" id="single_contract" name="contract_type" value="single" checked={formData.contract_type === 'single'} onChange={handleChange} /><Label htmlFor="single_contract">Single</Label></div>
                                    <div className="flex items-center gap-2"><input type="radio" id="separate_contract" name="contract_type" value="separate" checked={formData.contract_type === 'separate'} onChange={handleChange} /><Label htmlFor="separate_contract">Separate</Label></div>
                                </div>
                            </div>
                            <InputRow label="Negotiated:" id="negotiated" name="negotiated" value={formData.negotiated} onChange={handleChange}/>
                            <InputRow label="Bid:" id="bid" name="bid" value={formData.bid} onChange={handleChange}/>
                            <InputRow label="Stipulated Sum:" id="stipulated_sum" name="stipulated_sum" value={formData.stipulated_sum} onChange={handleChange}/>
                            <InputRow label="Cost Plus Fee:" id="cost_plus_fee" name="cost_plus_fee" value={formData.cost_plus_fee} onChange={handleChange}/>
                            <InputRow label="Force Amount:" id="force_amount" name="force_amount" value={formData.force_amount} onChange={handleChange}/>
                            <div className="flex items-center gap-4 py-1">
                                <Label className="w-48 text-right shrink-0">Equipment:</Label>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Input name="equipment_fixed" placeholder="Fixed" value={formData.equipment_fixed} onChange={handleChange}/>
                                    <Input name="equipment_movable" placeholder="Movable" value={formData.equipment_movable} onChange={handleChange}/>
                                    <Input name="equipment_interiors" placeholder="Interiors" value={formData.equipment_interiors} onChange={handleChange}/>
                                </div>
                            </div>
                            <InputRow label="Landscaping:" id="landscaping" name="landscaping" value={formData.landscaping} onChange={handleChange}/>
                        </Section>

                        <Section title="Sketch of Property">
                             <InputRow label="Notations:" id="sketch_notes" name="sketch_notes" type="textarea" value={formData.sketch_notes} onChange={handleChange} />
                        </Section>

                        <div className="flex justify-end gap-4 mt-12 no-print">
                            <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button type="button" onClick={handleDownloadPdf} variant="outline"><Printer className="mr-2 h-4 w-4" /> Download/Print PDF</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
