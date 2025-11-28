
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

const drawingSections = {
    architectural: [
        { no: 1, title: "Submission Drawings", id: "arch_submission" },
        { no: 2, title: "Demolition Plan", id: "arch_demolition" },
        { no: 3, title: "Excavation Plan", id: "arch_excavation" },
        { no: 4, title: "Site Plan", id: "arch_site" },
        { no: 5, title: "Basement Plan", id: "arch_basement" },
        { no: 6, title: "Ground Floor Plan", id: "arch_ground_floor" },
        { no: 7, title: "First Floor Plan", id: "arch_first_floor" },
        { no: 8, title: "Second Floor Plan", id: "arch_second_floor" },
        { no: 9, title: "Roof Plan", id: "arch_roof" },
        { no: 10, title: "Section A", id: "arch_section_a" },
        { no: 11, title: "Section B", id: "arch_section_b" },
        { no: 12, title: "Section C", id: "arch_section_c" },
        { no: 13, title: "Elevation 1", id: "arch_elevation_1" },
        { no: 14, title: "Elevation 2", id: "arch_elevation_2" },
        { no: 15, title: "Elevation 3", id: "arch_elevation_3" },
        { no: 16, title: "Elevation 4", id: "arch_elevation_4" },
    ],
    details: [
        { no: 17, title: "Baths Details", id: "detail_baths" },
        { no: 18, title: "Doors Details", id: "detail_doors" },
        { no: 19, title: "Floors Details", id: "detail_floors" },
        { no: 20, title: "Entrance Detail", id: "detail_entrance" },
        { no: 21, title: "Stair Detail", id: "detail_stair" },
    ],
    structure: [
        { no: 22, title: "Foundation Plan", id: "struct_foundation" },
        { no: 23, title: "Floor Farming Plan", id: "struct_floor_farming" },
        { no: 24, title: "Ground Floor Slab", id: "struct_ground_slab" },
        { no: 25, title: "First Floor Slab", id: "struct_first_slab" },
        { no: 26, title: "Second Floor Slab", id: "struct_second_slab" },
        { no: 27, title: "Wall elev & slab sec.", id: "struct_wall_elev" },
        { no: 28, title: "Wall sec & details", id: "struct_wall_sec" },
        { no: 29, title: "Stairs", id: "struct_stairs" },
        { no: 30, title: "Schedules", id: "struct_schedules" },
        { no: 31, title: "Space of Concrete", id: "struct_concrete_space" },
    ],
    plumbing: [
        { no: 32, title: "Sewage Systems", id: "plumb_sewage" },
        { no: 33, title: "Water Supply & Gas Systems", id: "plumb_water_gas" },
        { no: 34, title: "Detail of Sewage Appurtenances", id: "plumb_sewage_app" },
        { no: 35, title: "Detail of Soakage Pit", id: "plumb_soakage" },
        { no: 36, title: "Detail of Septic Tank", id: "plumb_septic" },
        { no: 37, title: "Detail of Overhead Water Tank", id: "plumb_overhead" },
        { no: 38, title: "Detail of Underground Water Tank", id: "plumb_underground" },
        { no: 39, title: "Legend & General Notes", id: "plumb_legend" },
    ],
    electrification: [
        { no: 40, title: "Illumination Layout Plans", id: "elec_illumination" },
        { no: 41, title: "Power Layout Plans", id: "elec_power" },
        { no: 42, title: "Legend & General Notes", id: "elec_legend" },
    ]
};

const sampleList = [
    { no: 'AR-01', desc: 'General Notes and Conditions', group: 'Introduction (AR-01-AR-10)' },
    { no: 'AR-02', desc: 'Survey Plan', group: 'Introduction (AR-01-AR-10)' },
    { no: 'AR-03', desc: 'Site Setting Drawings', group: 'Introduction (AR-01-AR-10)' },
    ...Array.from({ length: 7 }, (_, i) => ({ no: `AR-${String(i + 4).padStart(2, '0')}`, desc: '', group: 'Introduction (AR-01-AR-10)' })),
    { no: 'AR-11', desc: 'Master Working Layout Plan', group: 'Working Layout Drawings (AR-11-AR-20)' },
    { no: 'AR-12', desc: 'Working Layout Plan(Basement Floor)', group: 'Working Layout Drawings (AR-11-AR-20)' },
    { no: 'AR-13', desc: 'Working Layout Plan(Ground Floor)', group: 'Working Layout Drawings (AR-11-AR-20)' },
    { no: 'AR-14', desc: 'Working Layout Plan(First Floor)', group: 'Working Layout Drawings (AR-11-AR-20)' },
    { no: 'AR-15', desc: 'Working Layout Plan(MezzanineFloor)', group: 'Working Layout Drawings (AR-11-AR-20)' },
    { no: 'AR-16', desc: 'Working Layout Plan(Roof Top)', group: 'Working Layout Drawings (AR-11-AR-20)' },
    ...Array.from({ length: 4 }, (_, i) => ({ no: `AR-${String(i + 17).padStart(2, '0')}`, desc: '', group: 'Working Layout Drawings (AR-11-AR-20)' })),
    { no: 'AR-21', desc: 'Front elevation', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-22', desc: 'Right Side Elevation', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-23', desc: 'Rear Side Elevation', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-24', desc: 'Left Side Elevation', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-25', desc: 'Section A-A', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-26', desc: 'Section B-B', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-27', desc: 'Section C-C', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-28', desc: 'Section D-D', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-29', desc: 'Parapet & Slab Sectional Details', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-30', desc: 'Lift Section', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-31', desc: 'Elevation Blow up Detail', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    { no: 'AR-32', desc: 'Exterior Wall Cladding Detail', group: 'Elevation & Section Drawings (AR-21-AR-40)' },
    ...Array.from({ length: 8 }, (_, i) => ({ no: `AR-${String(i + 33).padStart(2, '0')}`, desc: '', group: 'Elevation & Section Drawings (AR-21-AR-40)' })),
    { no: 'AR-41', desc: 'Door & Window Schedule Plan (ground Floor)', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-42', desc: 'Door & Window Schedule Plan (First Floor)', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-43', desc: 'Door & Window Schedule Plan (Basement Floor)', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-44', desc: 'Door & Window Schedule Plan (Roof Top)', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-45', desc: 'Door Elevation Schedule', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-46', desc: 'Windows Elevation Schedule', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-47', desc: 'Door & Frame Details', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-48', desc: 'Window Sill and Header Details', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-49', desc: 'Window Blow up Detail', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    { no: 'AR-50', desc: 'Door Blow Up Detail', group: 'Doors & Windows Drawings (AR-41-AR-80)' },
    ...Array.from({ length: 30 }, (_, i) => ({ no: `AR-${String(i + 51).padStart(2, '0')}`, desc: '', group: 'Doors & Windows Drawings (AR-41-AR-80)' })),
    { no: 'AR-81', desc: 'Main Stair Case Detail', group: 'Stair, Step & Ramp Drawings (AR-81-AR-100)' },
    { no: 'AR-82', desc: 'Main Stair Case Detail Section', group: 'Stair, Step & Ramp Drawings (AR-81-AR-100)' },
    { no: 'AR-83', desc: 'Main Entrance Steps Detail', group: 'Stair, Step & Ramp Drawings (AR-81-AR-100)' },
    { no: 'AR-84', desc: 'Back Entrance step Detail', group: 'Stair, Step & Ramp Drawings (AR-81-AR-100)' },
    ...Array.from({ length: 16 }, (_, i) => ({ no: `AR-${String(i + 85).padStart(2, '0')}`, desc: '', group: 'Stair, Step & Ramp Drawings (AR-81-AR-100)' })),
    { no: 'AR-101', desc: 'Toilet Layout (Ground floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-102', desc: 'Toilet Layout (First floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-103', desc: 'Toilet Layout (Mezzanine floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-104', desc: 'Toilet Layout (Basement floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-105', desc: 'Toilet Layout (Roof Top)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-106', desc: 'Toilet Detail (Ground floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-107', desc: 'Toilet Detail (First floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-108', desc: 'Toilet Detail (Mezzanine floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-109', desc: 'Toilet Detail (Basement floor)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-110', desc: 'Toilet Detail (Roof Top)', group: 'Bathroom Drawings (AR-101-AR-140)' },
    { no: 'AR-111', desc: 'Blow Up Detail', group: 'Bathroom Drawings (AR-101-AR-140)' },
    ...Array.from({ length: 18 }, (_, i) => ({ no: `AR-${String(i + 112).padStart(2, '0')}`, desc: '', group: 'Bathroom Drawings (AR-101-AR-140)' })),
    { no: 'AR-141', desc: 'Kitchen Layout (Ground floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    { no: 'AR-142', desc: 'Kitchen Layout (First floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    { no: 'AR-143', desc: 'Kitchen Layout (Mezzanine floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    { no: 'AR-144', desc: 'Kitchen Layout (Basement floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    { no: 'AR-145', desc: 'Kitchen Detail (Ground floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    { no: 'AR-146', desc: 'Kitchen Detail (First floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    { no: 'AR-147', desc: 'Kitchen Detail (Mezzanine floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    { no: 'AR-148', desc: 'Kitchen Detail (Basement floor)', group: 'Kitchen Drawings (AR-141-AR-160)' },
    ...Array.from({ length: 12 }, (_, i) => ({ no: `AR-${String(i + 149).padStart(2, '0')}`, desc: '', group: 'Kitchen Drawings (AR-141-AR-160)' })),
    { no: 'AR-161', desc: 'Exterior Paving Pattern', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    { no: 'AR-162', desc: 'Floor Pattern (Ground Floor)', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    { no: 'AR-163', desc: 'Floor Pattern (First Floor)', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    { no: 'AR-164', desc: 'Floor Pattern (Mazzenine Floor)', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    { no: 'AR-165', desc: 'Floor Pattern (Basement Floor)', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    { no: 'AR-166', desc: 'Floor Pattern (Roof Top)', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    { no: 'AR-167', desc: 'Floor Pattern Blow up Details', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    { no: 'AR-168', desc: 'Floor Floor Finishes and Transition Details', group: 'Floor Pattern Drawings (AR-161-AR-180)' },
    ...Array.from({ length: 12 }, (_, i) => ({ no: `AR-${String(i + 169).padStart(2, '0')}`, desc: '', group: 'Floor Pattern Drawings (AR-161-AR-180)' })),
    { no: 'AR-181', desc: 'Front Boundary Wall Layout', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-182', desc: 'Front Boundary Wall Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-183', desc: 'Rear Side Boundary Wall Layout', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-184', desc: 'Rear Side Boundary Wall Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-185', desc: 'Overhead Watertank Layout & detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-186', desc: 'Underground Watertank Layout & detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-187', desc: 'Plinth Details', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-188', desc: 'Water proofing Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-189', desc: 'Insulation Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-190', desc: 'Planter Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-191', desc: 'Fire Place Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-192', desc: 'Patio Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-193', desc: 'Skylight Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-194', desc: 'Water Body Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-195', desc: 'Niche Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-196', desc: 'Side Passages Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-197', desc: 'Threshold Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-198', desc: 'Floor Levels Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-199', desc: 'Drive way Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    { no: 'AR-200', desc: 'Curb Detail', group: 'Other Item Drawings (AR-181-AR-250)' },
    ...Array.from({ length: 55 }, (_, i) => ({ no: `AR-${String(i + 201).padStart(2, '0')}`, desc: '', group: 'Other Item Drawings (AR-181-AR-250)' })),
];

const groupedSampleList = sampleList.reduce((acc, item) => {
    const group = item.group;
    if (!acc[group]) {
        acc[group] = [];
    }
    acc[group].push(item);
    return acc;
}, {} as Record<string, typeof sampleList>);


const DrawingSection = ({ title, items, idPrefix }: { title: string, items: { no: number, title: string, id: string }[], idPrefix: string }) => (
    <div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">Serial No.</TableHead>
                    <TableHead>Drawings Title</TableHead>
                    <TableHead className="w-40">Starting Date</TableHead>
                    <TableHead className="w-40">Completion Date</TableHead>
                    <TableHead>Remarks</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.id}>
                        <TableCell>{item.no}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell><Input type="date" name={`${idPrefix}_${item.id}_start`} /></TableCell>
                        <TableCell><Input type="date" name={`${idPrefix}_${item.id}_complete`} /></TableCell>
                        <TableCell><Textarea name={`${idPrefix}_${item.id}_remarks`} rows={1} /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

const SampleListSection = ({ groupTitle, items }: { groupTitle: string, items: typeof sampleList }) => (
     <div>
        <h3 className="text-lg font-bold mb-2">{groupTitle}</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-24">Sr. no.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-40">Start Date</TableHead>
                    <TableHead className="w-40">End Date</TableHead>
                    <TableHead>Remarks</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.no}>
                        <TableCell>{item.no}</TableCell>
                        <TableCell>{item.desc || <span className="text-muted-foreground">N/A</span>}</TableCell>
                        <TableCell><Input type="date" name={`${item.no}_start`} /></TableCell>
                        <TableCell><Input type="date" name={`${item.no}_end`} /></TableCell>
                        <TableCell><Textarea name={`${item.no}_remarks`} rows={1} /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
)


export default function DrawingsPage() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [projectName, setProjectName] = useState('');
    const [projectDate, setProjectDate] = useState('');
    const [projectNo, setProjectNo] = useState('');
    const [contractDate, setContractDate] = useState('');
    const [projectIncharge, setProjectIncharge] = useState('');
    const [draftsman, setDraftsman] = useState('Mr. Adeel');

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const form = document.getElementById('drawings-form') as HTMLFormElement;
        const formData = new FormData(form);
        const data: { category: string, items: string[] }[] = [];

        const headerData = {
            category: 'Project Details',
            items: [
                `Project Name: ${projectName}`,
                `Project Date: ${projectDate}`,
                `Architects Project No: ${projectNo}`,
                `Contract Date: ${contractDate}`,
                `Project Incharge: ${projectIncharge}`,
                `Draftsman: ${draftsman}`
            ]
        };
        data.push(headerData);

        for (const sectionKey in drawingSections) {
            const section = drawingSections[sectionKey as keyof typeof drawingSections];
            const sectionData = { category: sectionKey, items: [] as string[] };
            section.forEach(item => {
                const start = formData.get(`main_${item.id}_start`);
                const complete = formData.get(`main_${item.id}_complete`);
                const remarks = formData.get(`main_${item.id}_remarks`);
                if (start || complete || remarks) {
                    sectionData.items.push(`${item.title} (Start: ${start}, Complete: ${complete}, Remarks: ${remarks})`);
                }
            });
            if (sectionData.items.length > 0) data.push(sectionData);
        }

        for (const groupTitle in groupedSampleList) {
            const groupData = { category: groupTitle, items: [] as string[] };
            groupedSampleList[groupTitle].forEach(item => {
                 const start = formData.get(`${item.no}_start`);
                const complete = formData.get(`${item.no}_end`);
                const remarks = formData.get(`${item.no}_remarks`);
                 if (start || complete || remarks) {
                    groupData.items.push(`${item.no} ${item.desc} (Start: ${start}, End: ${complete}, Remarks: ${remarks})`);
                }
            });
             if (groupData.items.length > 0) data.push(groupData);
        }

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Drawings List',
                projectName: projectName || 'Untitled Drawings List',
                data: data,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The drawings list has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('LIST OF DRAWINGS (Architectural / Interiors / submission)', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        
        doc.text(`Project: ${projectName}`, 14, yPos);
        doc.text(`Date: ${projectDate}`, 130, yPos);
        yPos += 7;
        doc.text(`(Name, Address): `, 14, yPos);
        doc.text(`Architects Project No: ${projectNo}`, 130, yPos);
        yPos += 7;
        doc.text(`Project Incharge: ${projectIncharge}`, 14, yPos);
        doc.text(`Contract Date: ${contractDate}`, 130, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('List of Working Drawings', 14, yPos);
        yPos += 7;

        const form = document.getElementById('drawings-form') as HTMLFormElement;

        const addTable = (title, items, idPrefix) => {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, yPos);
            yPos += 7;
            
            const body = items.map(item => [
                item.no,
                item.title,
                form.elements[`${idPrefix}_${item.id}_start`]?.value || '',
                form.elements[`${idPrefix}_${item.id}_complete`]?.value || '',
                form.elements[`${idPrefix}_${item.id}_remarks`]?.value || ''
            ]);

            doc.autoTable({
                head: [['Serial No.', 'Drawings Title', 'Starting Date', 'Completion Date', 'Remarks']],
                body: body,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [45, 55, 72] }
            });
            yPos = doc.autoTable.previous.finalY + 10;
        }

        addTable('Architectural Drawings', drawingSections.architectural, 'main');
        addTable('Details', drawingSections.details, 'main');
        addTable('Structure Drawings', drawingSections.structure, 'main');
        addTable('Plumbing Drawings', drawingSections.plumbing, 'main');
        addTable('Electrification Drawings', drawingSections.electrification, 'main');

        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SAMPLE LIST - Working Drawings', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Draftsman Name: ${draftsman}`, 14, yPos);
        yPos += 10;
        
        for (const groupTitle in groupedSampleList) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(groupTitle, 14, yPos);
            yPos += 7;
            
            const body = groupedSampleList[groupTitle].map(item => [
                item.no,
                item.desc,
                form.elements[`${item.no}_start`]?.value || '',
                form.elements[`${item.no}_end`]?.value || '',
                form.elements[`${item.no}_remarks`]?.value || '',
            ]);

             doc.autoTable({
                head: [['Sr. no.', 'Description', 'Start Date', 'End Date', 'Remarks']],
                body: body,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [45, 55, 72] }
            });
            yPos = doc.autoTable.previous.finalY + 10;
        }

        doc.save('drawings-list.pdf');
        toast({ title: 'Download Started', description: 'Your drawings list PDF is being generated.' });
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl text-center font-headline text-primary">LIST OF DRAWINGS (Architectural / Interiors / submission)</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="drawings-form" className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="project_name">Project (Name, Address)</Label>
                            <Input id="project_name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="project_date">Date</Label>
                            <Input id="project_date" type="date" value={projectDate} onChange={e => setProjectDate(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="project_no">Architects Project No:</Label>
                            <Input id="project_no" value={projectNo} onChange={e => setProjectNo(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="contract_date">Contract Date:</Label>
                            <Input id="contract_date" type="date" value={contractDate} onChange={e => setContractDate(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="project_incharge">Project Incharge:</Label>
                            <Input id="project_incharge" value={projectIncharge} onChange={e => setProjectIncharge(e.target.value)} />
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-bold">List of Working Drawings</h2>
                    <DrawingSection title="Architectural Drawings" items={drawingSections.architectural} idPrefix="main" />
                    <DrawingSection title="Details" items={drawingSections.details} idPrefix="main" />
                    <DrawingSection title="Structure Drawings" items={drawingSections.structure} idPrefix="main" />
                    <DrawingSection title="Plumbing Drawings" items={drawingSections.plumbing} idPrefix="main" />
                    <DrawingSection title="Electrification Drawings" items={drawingSections.electrification} idPrefix="main" />

                    <div className="mt-12 pt-8 border-t-2 border-dashed">
                        <h2 className="text-xl font-bold text-center">SAMPLE LIST - Working Drawings</h2>
                         <div className="my-4">
                            <Label htmlFor="draftsman_name">Draftsman Name:</Label>
                            <Input id="draftsman_name" value={draftsman} onChange={e => setDraftsman(e.target.value)} className="max-w-xs" />
                        </div>
                        <div className="space-y-8">
                           {Object.entries(groupedSampleList).map(([groupTitle, items]) => (
                               <SampleListSection key={groupTitle} groupTitle={groupTitle} items={items} />
                           ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-12">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

    