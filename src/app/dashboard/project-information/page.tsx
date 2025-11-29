
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Download, Loader2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

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

function ProjectInformationComponent() {
    const image = PlaceHolderImages.find(p => p.id === 'project-information');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    const searchParams = useSearchParams();
    const recordId = searchParams.get('id');

    const [isLoading, setIsLoading] = useState(!!recordId);

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
        acc[type] = { withinFee: '', additionalFee: '', architect: '', owner: '' };
        return acc;
      }, {} as Record<string, { withinFee: string, additionalFee: string, architect: string, owner: string }>)
    );

    const [requirements, setRequirements] = useState<Record<string, { nos: string, remarks: string }>>(
      residenceRequirements.reduce((acc, req) => {
        acc[req] = { nos: '', remarks: '' };
        return acc;
      }, {} as Record<string, { nos: string, remarks: '' }>)
    );

     useEffect(() => {
        if (recordId && firestore) {
            const fetchRecord = async () => {
                setIsLoading(true);
                try {
                    const docRef = doc(firestore, 'savedRecords', recordId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const record = docSnap.data();
                        
                        const mainData = record.data.find((d: any) => d.category === 'Project Information')?.items.reduce((acc: any, item: string) => {
                            const [key, ...value] = item.split(':');
                            acc[key.trim()] = value.join(':').trim();
                            return acc;
                        }, {}) || {};

                        const loadedFormState: any = {};
                        for (const key in formState) {
                          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          if (mainData[formattedKey] !== undefined) {
                            if (typeof formState[key as keyof typeof formState] === 'boolean') {
                                loadedFormState[key] = mainData[formattedKey] === 'true';
                            } else {
                                loadedFormState[key] = mainData[formattedKey];
                            }
                          }
                        }
                        setFormState(s => ({...s, ...loadedFormState}));
                        
                        const loadedConsultants = JSON.parse(JSON.stringify(consultants));
                        const consultantData = record.data.find((d: any) => d.category === 'Consultants')?.items || [];
                        consultantData.forEach((item: string) => {
                            const [key, ...value] = item.split(':');
                            try {
                                loadedConsultants[key.trim()] = JSON.parse(value.join(':').trim());
                            } catch {}
                        });
                        setConsultants(loadedConsultants);

                        const loadedRequirements = JSON.parse(JSON.stringify(requirements));
                        const requirementsData = record.data.find((d: any) => d.category === 'Requirements')?.items || [];
                        requirementsData.forEach((item: string) => {
                            const [key, ...value] = item.split(':');
                            try {
                                loadedRequirements[key.trim()] = JSON.parse(value.join(':').trim());
                            } catch {}
                        });
                        setRequirements(loadedRequirements);
                        

                    } else {
                        toast({ variant: "destructive", title: "Error", description: "Record not found."});
                    }
                } catch (e) {
                     toast({ variant: "destructive", title: "Error", description: "Failed to load record."});
                     console.error("Error fetching document:", e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRecord();
        } else {
          setIsLoading(false);
        }
    }, [recordId, firestore, toast]);

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
            fileName: "Project Information",
            projectName: formState.project || 'Untitled Project Information',
            data: [{
                category: 'Project Information',
                items: Object.entries(formState).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
            }, {
                category: 'Consultants',
                items: Object.entries(consultants).map(([type, values]) => `${type}: ${JSON.stringify(values)}`)
            },
            {
                category: 'Requirements',
                items: Object.entries(requirements).map(([req, values]) => `${req}: ${JSON.stringify(values)}`)
            }],
        };

        try {
            if (recordId) {
                const docRef = doc(firestore, 'savedRecords', recordId);
                await updateDoc(docRef, {
                    projectName: dataToSave.projectName,
                    data: dataToSave.data,
                });
                toast({ title: 'Record Updated', description: "The project information has been updated." });
            } else {
                await addDoc(collection(firestore, 'savedRecords'), {
                    employeeId: currentUser.record,
                    employeeName: currentUser.name,
                    ...dataToSave,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Record Saved', description: "The project information has been saved." });
            }
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({
                path: 'savedRecords',
                operation: recordId ? 'update' : 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    };
    
    const handleDownloadPdf = () => {
      const doc = new jsPDF() as jsPDFWithAutoTable;
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
      let yPos = 15;
      const primaryColor = [45, 95, 51];
      const headingFillColor = [240, 240, 240];
      const margin = 14;

      const addSectionTitle = (title: string) => {
          if (yPos > pageHeight - 30) { doc.addPage(); yPos = 20; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(title, margin, yPos);
          yPos += 8;
          doc.setTextColor(0, 0, 0);
      };
      
      const addTable = (body: (string | null)[][]) => {
          doc.autoTable({
              startY: yPos,
              body: body,
              theme: 'grid',
              styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
              columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
          });
          yPos = doc.autoTable.previous.finalY + 10;
      };

      const drawCheckbox = (x: number, y: number, checked: boolean) => {
          doc.setLineWidth(0.2);
          doc.rect(x, y - 3.5, 4, 4); // Draw the box outline
          if (checked) {
              doc.setFillColor(0, 0, 0); // Set fill color to black
              doc.rect(x, y - 3.5, 4, 4, 'F'); // Draw a filled rectangle
          }
      };

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('PROJECT INFORMATION', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      doc.setTextColor(0, 0, 0);

      addSectionTitle("Project Information");
      addTable([
          ['Project:', formState.project],
          ['Address:', formState.address],
          ['Project No:', formState.projectNo],
          ['Prepared By:', formState.preparedBy],
          ['Prepared Date:', formState.preparedDate],
      ]);
      
      addSectionTitle("About Owner");
      addTable([
          ['Full Name:', formState.ownerFullName],
          ['Address (Office):', formState.ownerOfficeAddress],
          ['Address (Res.):', formState.ownerResAddress],
          ['Phone (Office):', formState.ownerOfficePhone],
          ['Phone (Res.):', formState.ownerResPhone],
      ]);

      addSectionTitle("Owner's Project Representative");
      addTable([
          ['Name:', formState.repName],
          ['Address (Office):', formState.repOfficeAddress],
          ['Address (Res.):', formState.repResAddress],
          ['Phone (Office):', formState.repOfficePhone],
          ['Phone (Res.):', formState.repResPhone],
      ]);
      
      addSectionTitle("About Project");
      
      const projectReqOptions = [
        { label: 'i. Architectural Designing', checked: formState.reqArchitectural },
        { label: 'ii. Interior Decoration', checked: formState.reqInterior },
        { label: 'iii. Landscaping', checked: formState.reqLandscaping },
        { label: 'iv. Turnkey', checked: formState.reqTurnkey },
        { label: `v. Other: ${formState.reqOtherText}`, checked: formState.reqOther },
      ];

      doc.autoTable({
          startY: yPos,
          theme: 'grid',
          body: [
            ['Address:', formState.projectAboutAddress],
            ['Project Type:', formState.projectType],
            ['Project Status:', formState.projectStatus],
            ['Project Area:', formState.projectArea],
            ['Special Requirements:', formState.specialRequirements],
          ],
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
      });
      yPos = doc.autoTable.previous.finalY;

      doc.autoTable({
          startY: yPos,
          body: [['Project Reqt.:', '']],
          theme: 'grid',
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
          didDrawCell: (data) => {
              if (data.column.index === 1 && data.row.index === 0) {
                  let checkboxY = data.cell.y + 5;
                  projectReqOptions.forEach(opt => {
                      drawCheckbox(data.cell.x + 2, checkboxY, opt.checked);
                      doc.text(opt.label, data.cell.x + 8, checkboxY);
                      checkboxY += 6;
                  });
              }
          },
          minCellHeight: projectReqOptions.length * 7 + 2,
      });
      yPos = doc.autoTable.previous.finalY + 10;
      
      if (yPos > pageHeight - 80) { // Check for space before adding the cost section
          doc.addPage();
          yPos = 20;
      }
      
      addSectionTitle("Project's Cost");
      addTable([
        ['Architectural Designing:', formState.costArchitectural],
        ['Interior Decoration:', formState.costInterior],
        ['Landscaping:', formState.costLandscaping],
        ['Construction:', formState.costConstruction],
        ['Turnkey:', formState.costTurnkey],
        ['Other:', formState.costOther],
      ]);
      
      doc.addPage();
      yPos = 20;
      
      addSectionTitle("Dates Concerned with Project");
      addTable([
          ['First Information about Project:', formState.dateFirstInfo],
          ['First Meeting:', formState.dateFirstMeeting],
          ['First Working on Project:', formState.dateFirstWorking],
          ['First Proposal Start:', formState.dateFirstProposalStart],
          ['First Proposal Completion:', formState.dateFirstProposalEnd],
          ['Second Proposal Start:', formState.dateSecondProposalStart],
          ['Second Proposal Completion:', formState.dateSecondProposalEnd],
          ['First Information:', formState.dateFirstInfo2],
          ['Working on Finalized Proposal:', formState.dateWorkingFinalized],
          ['Revised Presentation:', formState.dateRevisedPresentation],
          ['Quotation:', formState.dateQuotation],
          ['Drawings Start:', formState.dateDrawingsStart],
          ['Drawings Completion:', formState.dateDrawingsEnd],
          ['Other Major Projects Milestone Dates:', formState.dateOtherMilestones],
      ]);

      addSectionTitle("Provided by Owner");
      addTable([
          ['Program:', formState.ownerProgram],
          ['Suggested Schedule:', formState.ownerSchedule],
          ['Legal Site Description & Other Concerned Documents:', formState.ownerLegal],
          ['Land Survey Report:', formState.ownerLandSurvey],
          ['Geo-Technical, Tests and Other Site Information:', formState.ownerGeoTech],
          ["Existing Structure's Drawings:", formState.ownerExistingDrawings],
      ]);

      doc.addPage();
      yPos = 20;

      addSectionTitle("Compensation");
      addTable([
        ['Initial Payment:', formState.compInitialPayment],
        ['Basic Services (% of Cost of Construction):', formState.compBasicServices],
        ['Breakdown - Schematic Design (%):', formState.compSchematic],
        ['Breakdown - Design Development (%):', formState.compDesignDev],
        ["Breakdown - Construction Doc's (%):", formState.compConstructionDocs],
        ['Breakdown - Bidding / Negotiation (%):', formState.compBidding],
        ['Breakdown - Construction Contract Admin (%):', formState.compConstructionAdmin],
        ['Additional Services (Multiple of):', formState.compAdditionalServices],
        ['Reimbursable Expenses:', formState.compReimbursable],
        ['Other:', formState.compOther],
      ]);

      addSectionTitle("Consultants");
      const consultantBody = consultantTypes.map(type => [
          type,
          consultants[type]?.withinFee || '',
          consultants[type]?.additionalFee || '',
          consultants[type]?.architect || '',
          consultants[type]?.owner || '',
      ]).filter(row => row[0] || row[1] || row[2] || row[3] || row[4]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Type', 'Within Basic Fee', 'Additional Fee', 'By Architect', 'By Owner']],
        body: consultantBody,
        theme: 'grid'
      });
      yPos = doc.autoTable.previous.finalY + 10;
      
      doc.addPage();
      yPos = 20;

      addSectionTitle("Requirements");
      const reqsBody = residenceRequirements.map(req => [
          req,
          requirements[req]?.nos || '',
          requirements[req]?.remarks || '',
      ]);
      doc.autoTable({
        startY: yPos,
        head: [['Description', 'Nos.', 'Remarks']],
        body: reqsBody,
        theme: 'grid'
      });
      yPos = doc.autoTable.previous.finalY + 10;

      addSectionTitle("Special Confidential Requirements");
      doc.text(doc.splitTextToSize(formState.specialConfidential, pageWidth - margin * 2), margin, yPos);
      yPos += doc.splitTextToSize(formState.specialConfidential, pageWidth - margin * 2).length * 5 + 10;
      
      addSectionTitle("Miscellaneous Notes");
      doc.text(doc.splitTextToSize(formState.miscNotes, pageWidth - margin * 2), margin, yPos);
      
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`${formState.project || 'project'}_information.pdf`);
  };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4">Loading record...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="no-print">
              <DashboardPageHeader
                  title="Project Information"
                  description="Enter all the necessary details for your project."
                  imageUrl={image?.imageUrl || ''}
                  imageHint={image?.imageHint || ''}
              />
            </div>
            <Card className="printable-area">
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

                        <div className="flex justify-end gap-4 mt-12 no-print">
                            <Button type="button" onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button type="button" onClick={handleDownloadPdf}><Printer className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ProjectInformationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
            <ProjectInformationComponent />
        </Suspense>
    )
}
