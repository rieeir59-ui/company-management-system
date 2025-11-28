
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const Section = ({ title, children, className }: { title?: string; children: React.ReactNode, className?: string }) => (
  <div className={`mb-6 ${className}`}>
    {title && <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>}
    <div className="space-y-3 text-sm">
      {children}
    </div>
  </div>
);

const SubSection = ({ title, children, className }: { title: string; children: React.ReactNode, className?: string }) => (
    <div className={`mt-4 ${className}`}>
        <h3 className="font-semibold text-md mb-2">{title}</h3>
        <ul className="list-disc list-inside space-y-1 text-sm pl-2">
         {children}
        </ul>
    </div>
);

export default function ProjectAgreementPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-agreement');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [day, setDay] = useState('');
    const [owner, setOwner] = useState('');
    const [designOf, setDesignOf] = useState('');
    const [address, setAddress] = useState('');
    const [coveredArea, setCoveredArea] = useState('');
    const [consultancyCharges, setConsultancyCharges] = useState('');
    const [salesTax, setSalesTax] = useState('');
    const [withholdingTax, setWithholdingTax] = useState('');
    const [finalCharges, setFinalCharges] = useState('');

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to save a record.',
            });
            return;
        }

        const recordData = [
            {
                category: "Agreement Details",
                items: [
                    `Made as of the day: ${day}`,
                    `Between the Owner: ${owner}`,
                    `For the Design of: ${designOf}`,
                    `Address: ${address}`
                ]
            },
            {
                category: "Cost Breakdown",
                items: [
                    `Covered Area of Project: ${coveredArea}`,
                    `Consultancy Charges: ${consultancyCharges}`,
                    `Sales Tax @ 16%: ${salesTax}`,
                    `Withholding Tax @ 10%: ${withholdingTax}`,
                    `Final Consultancy Charges: ${finalCharges}`
                ]
            }
        ];

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Project Agreement',
                projectName: designOf || 'Untitled Project',
                data: recordData,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Record Saved",
                description: "The project agreement has been successfully saved.",
            });
        } catch (error) {
            console.error("Error saving record:", error);
            toast({
                variant: 'destructive',
                title: "Save Failed",
                description: "There was an error saving the project agreement.",
            });
        }
    }

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const margin = 14;
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";

        let yPos = 20;

        const addText = (text: string, isBold = false, indent = 0, size = 10, spaceAfter = 7) => {
            if (yPos > pageHeight - margin - 20) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            doc.setFontSize(size);
            const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2) - indent);
            doc.text(splitText, margin + indent, yPos);
            yPos += (splitText.length * (size / 2.5)) + spaceAfter;
        };

        const addList = (items: string[], indent = 5) => {
            items.forEach(item => {
                addText(`• ${item}`, false, indent, 10, 4);
            });
        }

        const addSignatureLines = () => {
            if (yPos > pageHeight - margin - 40) {
                doc.addPage();
                yPos = 20;
            }
            doc.line(margin, yPos, margin + 60, yPos);
            doc.text('Architect', margin, yPos + 5);

            doc.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);
            doc.text('Client', pageWidth - margin - 60, yPos + 5);
        }

        addText('COMMERCIAL AGREEMENT', true, 0, 14, 10);
        
        addText(`Made as of the day ${day || '________________'}`);
        addText(`Between the Owner: ${owner || '________________'}`);
        addText(`And the Firm: Isbah Hassan & Associates`);
        addText(`For the Design of: ${designOf || '________________'}`);
        addText(`Address: ${address || '________________'}`);
        yPos += 5;

        (doc as any).autoTable({
            startY: yPos,
            body: [
                ['Covered Area of Project:', coveredArea],
                ['Consultancy Charges @ Rs ___/Sft:', consultancyCharges],
                ['Sales Tax @ 16%:', salesTax],
                ['Withholding Tax @ 10%:', withholdingTax],
                ['Final Consultancy Charges:', finalCharges],
            ],
            theme: 'plain',
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;
        
        addText('PAYMENT SCHEDULE:', true);
        (doc as any).autoTable({
            startY: yPos,
            body: [
                ['On mobilization (advance payment)', '20 %'],
                ['On approval of schematic designs & 3D’s', '15%'],
                ['On completion of submission drawings', '15%'],
                ['On start of construction drawings', '15%'],
                ['On completion of construction drawings', '10%'],
                ['On completion of interior drawings', '10%'],
                ['On preparation of detailed BOQ', '10%'],
            ],
            theme: 'plain',
            styles: { fontSize: 10 }
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;

        addText('Project Management:', true);
        addText('Top Supervision:', true, 5);
        addList([
            'Please find attached the site visit schedule for the project please intimate the office one week in advance before the required visit for timely surveillance. Any Unscheduled visits would be charged as under.',
            'For out of station visits, the travelling by air and lodging in a five-star hotel will be paid by the client.',
            "Rs. 50,000 for Principal Architect's site visit per day.",
            "Rs. 30,000 for Associate Architect's site visit per day.",
            'For International visits, the travelling by air and lodging in a five-star hotel will be paid by the client.',
            "Rs. 150,000 for Principal Architect' s fee per day.",
            "Rs. 30,000 for Associate Architect' s fee per day."
        ], 10);
        addText('Detailed Supervision:', true, 5);
        addText('The fee for detailed supervision will be Rs. 300,000 /- per month, which will ensure daily progress at the site.', false, 10);
        
        addText('Please Note:', true);
        addList([
            'The above quoted rates do not include any kind of tax.',
            'The contract value is lumpsum for the area between 90,000 to 120,000 Sft, if however, the area increases the above amount only the sub-consultants fee @ Rs. 70/Sft will be charged.',
            'The above consultancy charges quoted are valid for only two months.'
        ]);

        addText('Architectural Design Services:', true);
        addList(['Space Planning', 'Design Concept', 'Design Development & 3Ds (Facade)', 'Budgeting Bil of Quantity’s.', 'Work Drawings', 'Structure Drawing', 'Electrification Drawings', 'Plumbing Drawings', 'Miscelaneous Services', 'Extra Services']);
        
        addText('Interior Design Services:', true);
        addList(['Flooring', 'Wood Work', 'Doors', 'Windows', 'False Ceiling', 'Lighting', 'Bath Details', 'Kitchen Details', 'Wall Textures.', 'Stairways', 'Built-in Features Fire Places', 'Patios', 'Water bodies', 'Trellis', 'Skylights', 'Furniture', 'Partitioning']);

        addText('Note:', true);
        addText('The item number 9 & 10 is under the head of extra services if the client requests these services, the extra charges will be as mentioned above.');

        addText("Architect's Responsibilities.", true);
        addList([
            "The architect will produce a maximum of two proposals are revisions for the client for the said amount of consultancy every proposal or revision after this will be charged @ Rs. 500,000 /- per Proposal.",
            "The architect will require a minimum period of one month for the design development. 2 months will be required for work drawings.",
            "The architect will represent the owner and will advise and consult with the owner regarding construction.",
            "The architect will be responsible for checking the contractor's progress and giving the approval for payments due to the contractor.",
            "The architect is to prepare a maximum of 2 design proposals for the proposal stage for the client. If one proposal is developed, it can be revised two times, free of cost to the client. If, however, 2 design proposals are made, the second proposal can be revised three times, free of cost to the client. If the client wishes for another revision of the proposal, the architect will be paid Rs. 300,000 in advance for each drawing. If the client wishes to develop a third proposal, the architect will be paid Rs. 500,000 as advance payment for the task and Rs. 300,000 per revision of the third proposal.",
            "No revision will be made after the Issuance of Construction Drawings. If client wants the revision, he will have to pay for the amount ascertained in the contract.",
            "No revision will be made for working drawings. If client wants the revision, he will be required to pay the amount.",
            "Project supervision will include visits as mentioned in Construction Activity Schedule.",
            "The Architect will provide 3 Sets of working drawings to the client. For additional sets of working drawings Rs. 50,000 per set will be charged.",
            "The Architect will provide only two options/revisions of 3Ds for the Facade after which any option/revision wil be charged based on normal market rates. For Interior renderings Rs. 500,000/- will be charged."
        ]);

        addText("The Architect will not be responsible for the following things:", true);
        addList([
            "Continuous site supervision.",
            "Technical sequences and procedures of the contractors.",
            "Change of acts and omissions of the contractor. These are the contractor's responsibilities.",
            "Changes and omissions made on the owner's directions."
        ]);

        addText("ARTICLE-1: Termination of the Agreement", true);
        addList([
            "The agreement may be terminated by any of the parties on 7 days written notice. The other party will substantially perform in accordance with its items though no fault of the party initiating the termination.",
            "The owner at least on 7 days’ notice to the designer may terminate the agreement in the event that the project is permanently abandoned.",
            "In the event of termination not the fault of the design builder, the design builder will be compensated for services performed till termination date.",
            "No reimbursable then due and termination expenses. The termination expenses are the expenses directly attributable to the termination including a reasonable amount of overhead and profit for which the design/builder is not otherwise compensated under this agreement."
        ]);

        addText("ARTICLE-2: Bases of Compensation", true);
        addText("The owner will compensate the design/builder in accordance with this agreement, payments, and the other provisions of this agreement as described below.");
        addList([
            "Compensation for basic services",
            "Basic services will be as mentioned",
            "Subsequent payments will be as mentioned",
            "Compensation for additional services",
            "For additional services compensation will be as mentioned",
            "Travel expenses of Architect, Engineer, Sub-Engineer and Sub Consultant will be separately billed",
            "Computer Animation will be charged at the normal market rates",
            "The rate of interest past due payments will be 15 % per month"
        ]);
        yPos += 10;
        addSignatureLines();

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save('Project-Agreement.pdf');

        toast({
            title: "Download Started",
            description: "The project agreement PDF is being generated.",
        });
    }
    
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Project Agreement"
                description="Manage project agreements."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                 <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">COMMERCIAL AGREEMENT</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <div id="agreement-content">
                        <Section>
                            <div className="flex items-center gap-2">Made as of the day <Input value={day} onChange={e => setDay(e.target.value)} className="w-48" /></div>
                            <div className="flex items-center gap-2">Between the Owner: <Input value={owner} onChange={e => setOwner(e.target.value)} className="flex-1" /></div>
                            <p>And the Firm: Isbah Hassan & Associates</p>
                            <div className="flex items-center gap-2">For the Design of: <Input value={designOf} onChange={e => setDesignOf(e.target.value)} className="flex-1" /></div>
                            <div className="flex items-center gap-2">Address: <Input value={address} onChange={e => setAddress(e.target.value)} className="flex-1" /></div>
                        </Section>

                        <Section>
                             <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <p>Covered Area of Project:</p> <Input value={coveredArea} onChange={e => setCoveredArea(e.target.value)} />
                                <p>Consultancy Charges @ Rs ___/Sft:</p> <Input value={consultancyCharges} onChange={e => setConsultancyCharges(e.target.value)} />
                                <p>Sales Tax @ 16%:</p> <Input value={salesTax} onChange={e => setSalesTax(e.target.value)} />
                                <p>Withholding Tax @ 10%:</p> <Input value={withholdingTax} onChange={e => setWithholdingTax(e.target.value)} />
                                <p className="font-bold">Final Consultancy Charges:</p> <Input className="font-bold" value={finalCharges} onChange={e => setFinalCharges(e.target.value)} />
                             </div>
                        </Section>

                        <Section title="PAYMENT SCHEDULE:">
                             <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                <div>On mobilization (advance payment)</div><div>20 %</div>
                                <div>On approval of schematic designs & 3D’s</div><div>15%</div>
                                <div>On completion of submission drawings</div><div>15%</div>
                                <div>On start of construction drawings</div><div>15%</div>
                                <div>On completion of construction drawings</div><div>10%</div>
                                <div>On completion of interior drawings</div><div>10%</div>
                                <div>On preparation of detailed BOQ</div><div>10%</div>
                            </div>
                        </Section>

                        <Section title="Project Management:">
                            <h3 className="font-semibold text-md mb-2">Top Supervision:</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
                                <li>Please find attached the site visit schedule for the project please intimate the office one week in advance before the required visit for timely surveillance. Any Unscheduled visits would be charged as under.</li>
                                <li>For out of station visits, the travelling by air and lodging in a five-star hotel will be paid by the client.</li>
                                <li>Rs. 50,000 for Principal Architect's site visit per day.</li>
                                <li>Rs. 30,000 for Associate Architect's site visit per day.</li>
                                <li>For International visits, the travelling by air and lodging in a five-star hotel will be paid by the client.</li>
                                <li>Rs. 150,000 for Principal Architect' s fee per day.</li>
                                <li>Rs. 30,000 for Associate Architect' s fee per day.</li>
                            </ul>
                             <h3 className="font-semibold text-md mt-4 mb-2">Detailed Supervision:</h3>
                             <p className="text-sm pl-2">The fee for detailed supervision will be Rs. 300,000 /- per month, which will ensure daily progress at the site.</p>
                        </Section>
                        
                        <Section title="Please Note:">
                            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
                                <li>The above quoted rates do not include any kind of tax.</li>
                                <li>The contract value is lumpsum for the area between 90,000 to 120,000 Sft, if however, the area increases the above amount only the sub-consultants fee @ Rs. 70/Sft will be charged.</li>
                                <li>The above consultancy charges quoted are valid for only two months.</li>
                            </ul>
                        </Section>

                        <div className="grid md:grid-cols-2 gap-8">
                             <Section title="Architectural Design Services:">
                                <SubSection title="1. Space Planning" />
                                <SubSection title="2. Design Concept" />
                                <SubSection title="3. Design Development & 3Ds (Facade)" />
                                <SubSection title="4. Budgeting Bil of Quantity’s." />
                                <SubSection title="5. Work Drawings">
                                    <li>Site Plan</li>
                                    <li>Ground Floor Plan</li>
                                    <li>Mezzanine Floor Plan</li>
                                    <li>Elevation NE</li>
                                    <li>Elevation NW</li>
                                    <li>Elevation SW</li>
                                    <li>Sections</li>
                                    <li>Stair Details</li>
                                    <li>Kitchen Details</li>
                                    <li>Bath Details</li>
                                    <li>Schedules</li>
                                </SubSection>
                                <SubSection title="6. Structure Drawing">
                                    <li>Foundation Plan</li>
                                    <li>Floor Framing Plan</li>
                                    <li>Wall Elev. & Slab Section</li>
                                    <li>Wall section & Details</li>
                                    <li>Stair Details</li>
                                    <li>Schedules</li>
                                    <li>Specs of Concrete</li>
                                </SubSection>
                                <SubSection title="7. Electrification Drawings">
                                    <li>Power Plan</li>
                                    <li>Lighting Plans</li>
                                    <li>Section & Details</li>
                                    <li>Communication Plan</li>
                                </SubSection>
                                <SubSection title="8. Plumbing Drawings">
                                    <li>Water Protect System</li>
                                    <li>Soil Protect System</li>
                                    <li>Ventilation System</li>
                                    <li>Fire Protection System</li>
                                </SubSection>
                                <SubSection title="9. Miscelaneous Services">
                                    <li>Roof air Conditioning</li>
                                    <li>H.V.A.C</li>
                                    <li>Material Specifications</li>
                                </SubSection>
                                <SubSection title="10. Extra Services">
                                    <li>Landscaping</li>
                                    <li>Acoustical</li>
                                    <li>Land Survey</li>
                                    <li>Geo-Technical Survey</li>
                                    <li>Graphic design</li>
                                </SubSection>
                            </Section>

                            <Section title="Interior Design Services:">
                                <SubSection title="Design Details:">
                                    <li>Flooring</li>
                                    <li>Wood Work</li>
                                    <li>Doors</li>
                                    <li>Windows</li>
                                    <li>False Ceiling</li>
                                    <li>Lighting</li>
                                    <li>Bath Details</li>
                                    <li>Kitchen Details</li>
                                    <li>Wall Textures.</li>
                                    <li>Stairways</li>
                                    <li>Built-in Features Fire Places</li>
                                    <li>Patios</li>
                                    <li>Water bodies</li>
                                    <li>Trellis</li>
                                    <li>Skylights</li>
                                    <li>Furniture</li>
                                    <li>Partitioning</li>
                                </SubSection>
                            </Section>
                        </div>
                        
                         <Section title="Note:">
                            <p>The item number 9 & 10 is under the head of extra services if the client requests these services, the extra charges will be as mentioned above.</p>
                        </Section>

                        <Section title="Architect's Responsibilities.">
                             <ol className="list-decimal list-inside space-y-2">
                                <li>The architect will produce a maximum of two proposals are revisions for the client for the said amount of consultancy every proposal or revision after this will be charged @ Rs. 500,000 /- per Proposal.</li>
                                <li>The architect will require a minimum period of one month for the design development. 2 months will be required for work drawings.</li>
                                <li>The architect will represent the owner and will advise and consult with the owner regarding construction.</li>
                                <li>The architect will be responsible for checking the contractor's progress and giving the approval for payments due to the contractor.</li>
                                <li>The architect is to prepare a maximum of 2 design proposals for the proposal stage for the client. If one proposal is developed, it can be revised two times, free of cost to the client. If, however, 2 design proposals are made, the second proposal can be revised three times, free of cost to the client. If the client wishes for another revision of the proposal, the architect will be paid Rs. 300,000 in advance for each drawing. If the client wishes to develop a third proposal, the architect will be paid Rs. 500,000 as advance payment for the task and Rs. 300,000 per revision of the third proposal.</li>
                                <li>No revision will be made after the Issuance of Construction Drawings. If client wants the revision, he will have to pay for the amount ascertained in the contract.</li>
                                <li>No revision will be made for working drawings. If client wants the revision, he will be required to pay the amount.</li>
                                <li>Project supervision will include visits as mentioned in Construction Activity Schedule.</li>
                                <li>The Architect will provide 3 Sets of working drawings to the client. For additional sets of working drawings Rs. 50,000 per set will be charged.</li>
                                <li>The Architect will provide only two options/revisions of 3Ds for the Facade after which any option/revision wil be charged based on normal market rates. For Interior renderings Rs. 500,000/- will be charged.</li>
                            </ol>
                        </Section>

                        <Section title="The Architect will not be responsible for the following things:">
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Continuous site supervision.</li>
                                <li>Technical sequences and procedures of the contractors.</li>
                                <li>Change of acts and omissions of the contractor. These are the contractor's responsibilities.</li>
                                <li>Changes and omissions made on the owner's directions.</li>
                            </ol>
                        </Section>

                        <Section title="ARTICLE-1: Termination of the Agreement">
                            <ol className="list-decimal list-inside space-y-2">
                                <li>The agreement may be terminated by any of the parties on 7 days written notice. The other party will substantially perform in accordance with its items though no fault of the party initiating the termination.</li>
                                <li>The owner at least on 7 days’ notice to the designer may terminate the agreement in the event that the project is permanently abandoned.</li>
                                <li>In the event of termination not the fault of the design builder, the design builder will be compensated for services performed till termination date.</li>
                                <li>No reimbursable then due and termination expenses. The termination expenses are the expenses directly attributable to the termination including a reasonable amount of overhead and profit for which the design/builder is not otherwise compensated under this agreement.</li>
                            </ol>
                        </Section>

                        <Section title="ARTICLE-2: Bases of Compensation">
                            <p>The owner will compensate the design/builder in accordance with this agreement, payments, and the other provisions of this agreement as described below.</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Compensation for basic services</li>
                                <li>Basic services will be as mentioned</li>
                                <li>Subsequent payments will be as mentioned</li>
                                <li>Compensation for additional services</li>
                                <li>For additional services compensation will be as mentioned</li>
                                <li>Travel expenses of Architect, Engineer, Sub-Engineer and Sub Consultant will be separately billed</li>
                                <li>Computer Animation will be charged at the normal market rates</li>
                                <li>The rate of interest past due payments will be 15 % per month</li>
                            </ul>
                        </Section>

                        <div className="flex justify-between mt-16">
                            <div>
                                <p className="border-b-2 border-foreground w-48 mb-2"></p>
                                <p>Architect</p>
                            </div>
                             <div>
                                <p className="border-b-2 border-foreground w-48 mb-2"></p>
                                <p>Client</p>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-end gap-4 mt-12">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    

