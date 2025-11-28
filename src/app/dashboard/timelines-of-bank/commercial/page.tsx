'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ProjectRow {
  id: number;
  srNo: string;
  projectName: string;
  area: string;
  projectHolder: string;
  allocationDate: string;
  siteSurveyStart: string;
  siteSurveyEnd: string;
  contactStart: string;
  contactEnd: string;
  headCountStart: string;
  headCountEnd: string;
  proposalStart: string;
  proposalEnd: string;
  exterior3dStart: string;
  exterior3dEnd: string;
  architecturalDrawingsStart: string;
  architecturalDrawingsEnd: string;
  mepDrawingsStart: string;
  mepDrawingsEnd: string;
  boqStart: string;
  boqEnd: string;
  tenderStatus: string;
  comparative: string;
  workingDrawings: string;
  siteVisit: string;
  finalBill: string;
  projectClosure: string;
  remarks: string;
}

interface StatusRow {
  id: number;
  title: string;
  status: string;
}

const initialProjectRows: ProjectRow[] = [
    { id: 1, srNo: '1', projectName: 'Enertech Hydo-China Thar Sindh (Office Building)', area: '5,000.00', projectHolder: 'MOHSIN/NOMAN', allocationDate: '3/28/2025', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 2, srNo: '2', projectName: 'Enertech Hydo-China Thar Sindh (Officer Bungalow)', area: '2,000.00', projectHolder: 'MOHSIN/NOMAN', allocationDate: '3/28/2026', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 3, srNo: '3', projectName: 'Enertech Hydo-China Thar Sindh (Guest House)', area: '6,500.00', projectHolder: 'MOHSIN/NOMAN', allocationDate: '3/28/2027', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 4, srNo: '4', projectName: 'Enertech Hydo-China Thar Sindh (Bachelor Accommodation)', area: '8,850.00', projectHolder: 'MOHSIN/NOMAN', allocationDate: '3/28/2028', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 5, srNo: '5', projectName: 'Bestway Tower', area: '', projectHolder: 'ASAD', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: 'Done', workingDrawings: 'Done', siteVisit: '', finalBill: '', projectClosure: '', remarks: '' },
    { id: 6, srNo: '6', projectName: 'French Club', area: '', projectHolder: 'LUQMAN', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: 'Done', workingDrawings: 'Done', siteVisit: '', finalBill: '', projectClosure: '', remarks: '' },
    { id: 7, srNo: '7', projectName: 'DIN Tower', area: '', projectHolder: 'NOMAN WAQAS', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: 'Done', workingDrawings: 'Done', siteVisit: '', finalBill: '', projectClosure: '', remarks: '' },
    { id: 8, srNo: '8', projectName: 'Mr Nadeem Riaz Office Dolmen Mall', area: '', projectHolder: 'LUQMAN NOMAN', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: '' },
    { id: 9, srNo: '9', projectName: 'Mr Brad Office Dolmen Mall', area: '', projectHolder: 'LUQMAN NOMAN', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: '' },
    { id: 10, srNo: '10', projectName: 'BAMSOL', area: '22,332.00', projectHolder: 'Haseeb ASAD', allocationDate: '18-Aug-25', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '28-Aug-25', proposalEnd: '25-Sep-25', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: 'AS BUILT RECEIVED' },
    { id: 11, srNo: '11', projectName: 'Aghaz Housing', area: '', projectHolder: '', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '', architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: '' },
];

const initialStatusRows: StatusRow[] = [
    { id: 1, title: 'Overall Status for Office Building', status: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 2, title: 'Overall Status for Officer Bungalow', status: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 3, title: 'Overall Status for Guest House', status: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 4, title: 'Overall Status for Bachelor Accommodation', status: 'Furniture BOQ & Lights BOQ in Progress.' },
    { id: 5, title: 'Bestway Tower', status: 'EXTERIOR 3D IN REVISION' },
    { id: 6, title: 'French Club', status: 'All drawings sent' },
    { id: 7, title: 'DIN Tower', status: 'Final payment RECEIVED' },
    { id: 8, title: 'Mr Nadeem Riaz Office Dolmen Mall', status: 'Everything has been sent. QUERIES ONLY' },
    { id: 9, title: 'Mr Brad Office Dolmen Mall', status: 'All drawings sent' },
    { id: 10, title: 'BAMSOL', status: 'Proposal shared and minor revisions in proposal.' },
    { id: 11, title: 'Aghaz Housing', status: 'All drawings sent' },
];


export default function CommercialTimelinePage() {
    const { toast } = useToast();
    const [projectRows, setProjectRows] = useState<ProjectRow[]>(initialProjectRows);
    const [statusRows, setStatusRows] = useState<StatusRow[]>(initialStatusRows);
    const [remarks, setRemarks] = useState('');
    const [remarksDate, setRemarksDate] = useState('');
    const [queries, setQueries] = useState('');

    const handleProjectChange = (id: number, field: keyof ProjectRow, value: string) => {
        setProjectRows(projectRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleStatusChange = (id: number, value: string) => {
        setStatusRows(statusRows.map(row => row.id === id ? { ...row, status: value } : row));
    };

    const addProjectRow = () => {
        const newId = projectRows.length > 0 ? Math.max(...projectRows.map(r => r.id)) + 1 : 1;
        setProjectRows([...projectRows, {
            id: newId, srNo: String(newId), projectName: '', area: '', projectHolder: '', allocationDate: '',
            siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '',
            proposalStart: '', proposalEnd: '', exterior3dStart: '', exterior3dEnd: '', architecturalDrawingsStart: '',
            architecturalDrawingsEnd: '', mepDrawingsStart: '', mepDrawingsEnd: '', boqStart: '', boqEnd: '',
            tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '', remarks: ''
        }]);
    };
    
    const removeProjectRow = (id: number) => {
        setProjectRows(projectRows.filter(row => row.id !== id));
    };
    
    const handleSave = () => {
        console.log({ projectRows, statusRows, remarks, remarksDate, queries });
        toast({ title: 'Saved', description: 'Commercial timeline data has been saved.' });
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(10);
        doc.text("COMMERCIAL", 14, 15);
        
        const head = [
            ['Sr.No', 'Project Name', 'Area in Sft', 'Project Holder', 'Allocation Date / RFP', 
             'Site Survey\nStart', 'Site Survey\nEnd', 'Contact\nStart', 'Contact\nEnd', 'Head Count / Requirment\nStart', 'Head Count / Requirment\nEnd',
             'Proposal / Design Development\nStart', 'Proposal / Design Development\nEnd', 'Exterior 3D\'s\nStart', 'Exterior 3D\'s\nEnd',
             'Architectural / Interior Drawings\nStart', 'Architectural / Interior Drawings\nEnd', 'MEP Drawings\nStart', 'MEP Drawings\nEnd',
             'BOQ\nStart', 'BOQ\nEnd', 'Tender Status', 'Comparative', 'Working Drawings', 'Site Visit', 'Final Bill', 'Project Closure', 'Remarks']
        ];
        
        const body = projectRows.map(p => [
            p.srNo, p.projectName, p.area, p.projectHolder, p.allocationDate,
            p.siteSurveyStart, p.siteSurveyEnd, p.contactStart, p.contactEnd, p.headCountStart, p.headCountEnd,
            p.proposalStart, p.proposalEnd, p.exterior3dStart, p.exterior3dEnd,
            p.architecturalDrawingsStart, p.architecturalDrawingsEnd, p.mepDrawingsStart, p.mepDrawingsEnd,
            p.boqStart, p.boqEnd, p.tenderStatus, p.comparative, p.workingDrawings, p.siteVisit, p.finalBill, p.projectClosure, p.remarks
        ]);

        (doc as any).autoTable({
            head: head,
            body: body,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 5, cellPadding: 1 },
            headStyles: { fillColor: [45, 95, 51], fontStyle: 'bold' },
        });
        let lastY = (doc as any).autoTable.previous.finalY + 10;
        
        doc.autoTable({
            body: statusRows.map(s => [s.title, s.status]),
            startY: lastY,
            theme: 'grid',
            styles: { fontSize: 8 },
        });
        lastY = (doc as any).autoTable.previous.finalY + 10;
        
        doc.text("Maam Isbah Remarks & Order", 14, lastY);
        lastY += 7;
        doc.text(remarks, 14, lastY);
        lastY += 10;

        doc.text(`Date: ${remarksDate}`, 14, lastY);
        lastY += 10;
        
        doc.text("Queries received", 14, lastY);
        lastY += 7;
        doc.text(queries, 14, lastY);


        doc.save('commercial_timeline.pdf');
        toast({ title: 'Downloaded', description: 'Timeline has been downloaded as PDF.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center font-headline text-3xl text-primary">COMMERCIAL</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-primary/20">
                                <th rowSpan={2} className="border p-1">Sr.No</th>
                                <th rowSpan={2} className="border p-1">Project Name</th>
                                <th rowSpan={2} className="border p-1">Area in Sft</th>
                                <th rowSpan={2} className="border p-1">Project Holder</th>
                                <th rowSpan={2} className="border p-1">Allocation Date / RFP</th>
                                <th colSpan={2} className="border p-1">Site Survey</th>
                                <th colSpan={2} className="border p-1">Contact</th>
                                <th colSpan={2} className="border p-1">Head Count / Requirment</th>
                                <th colSpan={2} className="border p-1">Proposal / Design Development</th>
                                <th colSpan={2} className="border p-1">Exterior 3D's</th>
                                <th colSpan={2} className="border p-1">Architectural / Interior Drawings</th>
                                <th colSpan={2} className="border p-1">MEP Drawings</th>
                                <th colSpan={2} className="border p-1">BOQ</th>
                                <th rowSpan={2} className="border p-1">Tender Status</th>
                                <th rowSpan={2} className="border p-1">Comparative</th>
                                <th rowSpan={2} className="border p-1">Working Drawings</th>
                                <th rowSpan={2} className="border p-1">Site Visit</th>
                                <th rowSpan={2} className="border p-1">Final Bill</th>
                                <th rowSpan={2} className="border p-1">Project Closure</th>
                                <th rowSpan={2} className="border p-1">Remarks</th>
                                <th rowSpan={2} className="border p-1">Action</th>
                            </tr>
                            <tr className="bg-primary/10">
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                                <th className="border p-1">Start Date</th><th className="border p-1">End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectRows.map(row => (
                                <tr key={row.id}>
                                    <td className="border"><Input type="text" value={row.srNo} onChange={e => handleProjectChange(row.id, 'srNo', e.target.value)} className="w-12 text-center" /></td>
                                    <td className="border"><Input type="text" value={row.projectName} onChange={e => handleProjectChange(row.id, 'projectName', e.target.value)} className="min-w-[200px]" /></td>
                                    <td className="border"><Input type="text" value={row.area} onChange={e => handleProjectChange(row.id, 'area', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.projectHolder} onChange={e => handleProjectChange(row.id, 'projectHolder', e.target.value)} className="w-32" /></td>
                                    <td className="border"><Input type="text" value={row.allocationDate} onChange={e => handleProjectChange(row.id, 'allocationDate', e.target.value)} className="w-28" /></td>
                                    <td className="border"><Input type="date" value={row.siteSurveyStart} onChange={e => handleProjectChange(row.id, 'siteSurveyStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.siteSurveyEnd} onChange={e => handleProjectChange(row.id, 'siteSurveyEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.contactStart} onChange={e => handleProjectChange(row.id, 'contactStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.contactEnd} onChange={e => handleProjectChange(row.id, 'contactEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.headCountStart} onChange={e => handleProjectChange(row.id, 'headCountStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.headCountEnd} onChange={e => handleProjectChange(row.id, 'headCountEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.proposalStart} onChange={e => handleProjectChange(row.id, 'proposalStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.proposalEnd} onChange={e => handleProjectChange(row.id, 'proposalEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.exterior3dStart} onChange={e => handleProjectChange(row.id, 'exterior3dStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.exterior3dEnd} onChange={e => handleProjectChange(row.id, 'exterior3dEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.architecturalDrawingsStart} onChange={e => handleProjectChange(row.id, 'architecturalDrawingsStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.architecturalDrawingsEnd} onChange={e => handleProjectChange(row.id, 'architecturalDrawingsEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.mepDrawingsStart} onChange={e => handleProjectChange(row.id, 'mepDrawingsStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.mepDrawingsEnd} onChange={e => handleProjectChange(row.id, 'mepDrawingsEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.boqStart} onChange={e => handleProjectChange(row.id, 'boqStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.boqEnd} onChange={e => handleProjectChange(row.id, 'boqEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="text" value={row.tenderStatus} onChange={e => handleProjectChange(row.id, 'tenderStatus', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.comparative} onChange={e => handleProjectChange(row.id, 'comparative', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.workingDrawings} onChange={e => handleProjectChange(row.id, 'workingDrawings', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.siteVisit} onChange={e => handleProjectChange(row.id, 'siteVisit', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.finalBill} onChange={e => handleProjectChange(row.id, 'finalBill', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.projectClosure} onChange={e => handleProjectChange(row.id, 'projectClosure', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Textarea value={row.remarks} onChange={e => handleProjectChange(row.id, 'remarks', e.target.value)} className="min-w-[250px]" rows={1} /></td>
                                    <td className="border p-1"><Button variant="destructive" size="icon" onClick={() => removeProjectRow(row.id)}><Trash2 className="h-4 w-4" /></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <Button onClick={addProjectRow} size="sm" className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/>Add Row</Button>

                <div className="mt-8">
                    <h3 className="font-bold text-lg mb-2">Overall Status</h3>
                     <table className="w-full border-collapse text-sm">
                         <thead>
                             <tr className="bg-muted">
                                 <th className="border p-2 text-left w-1/3">Project</th>
                                 <th className="border p-2 text-left">Status</th>
                             </tr>
                         </thead>
                         <tbody>
                            {statusRows.map(row => (
                                <tr key={row.id}>
                                    <td className="border p-2 font-semibold">{row.title}</td>
                                    <td className="border p-2"><Input type="text" value={row.status} onChange={e => handleStatusChange(row.id, e.target.value)} /></td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Maam Isbah Remarks & Order</h3>
                        <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={4} />
                        <Input type="date" value={remarksDate} onChange={e => setRemarksDate(e.target.value)} className="mt-2 w-fit" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Queries received</h3>
                        <Textarea value={queries} onChange={e => setQueries(e.target.value)} rows={4} />
                    </div>
                </div>
                
                 <div className="flex justify-end gap-4 mt-8">
                    <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save</Button>
                    <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </CardContent>
        </Card>
    );
}
