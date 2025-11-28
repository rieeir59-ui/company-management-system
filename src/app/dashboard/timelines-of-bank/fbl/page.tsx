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
  threedStart: string;
  threedEnd: string;
  tenderArchStart: string;
  tenderArchEnd: string;
  tenderMepStart: string;
  tenderMepEnd: string;
  boqStart: string;
  boqEnd: string;
  tenderStatus: string;
  comparative: string;
  workingDrawings: string;
  siteVisit: string;
  finalBill: string;
  projectClosure: string;
}

interface StatusRow {
  id: number;
  title: string;
  status: string;
}

const initialProjectRows: ProjectRow[] = [
    { id: 1, srNo: '1', projectName: 'FBL-Finance Center-Gulberg LHR', area: '16500', projectHolder: 'Luqman', allocationDate: '23-Oct-25', siteSurveyStart: '24-Oct-25', siteSurveyEnd: '24-Oct-25', contactStart: '', contactEnd: 'Received', headCountStart: '24-Oct-25', headCountEnd: '5-Nov-25', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 2, srNo: '2', projectName: 'FBL-Finance Center-F10 Islamabad', area: '10100', projectHolder: 'Luqman', allocationDate: '18-Oct-25', siteSurveyStart: '20-Oct-25', siteSurveyEnd: '20-Oct-25', contactStart: '', contactEnd: 'Received', headCountStart: '27-Oct-25', headCountEnd: '8-Nov-25', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 3, srNo: '3', projectName: 'FBL JEHANGIRA NOWSHERA KPK', area: '2740', projectHolder: 'Luqman', allocationDate: '16-Oct-25', siteSurveyStart: '5-Oct-25', siteSurveyEnd: '6-Oct-25', contactStart: '', contactEnd: 'Received', headCountStart: '16-Oct-25', headCountEnd: '18-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '20-Oct-25', threedEnd: '25-Oct-25', tenderArchStart: '26-Oct-25', tenderArchEnd: '4-Nov-25', tenderMepStart: '27-Oct-25', tenderMepEnd: '27-Oct-25', boqStart: '', boqEnd: 'Sent', tenderStatus: '', comparative: '4-Nov-25', workingDrawings: '8-Nov-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 4, srNo: '4', projectName: 'FBL IBB Chinar Road Mansehra KPK', area: '2612', projectHolder: 'Luqman', allocationDate: '24-Sep-25', siteSurveyStart: '30-Sep-25', siteSurveyEnd: '1-Oct-25', contactStart: 'Done', contactEnd: 'Received', headCountStart: '2-Oct-25', headCountEnd: '3-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '20-Oct-25', threedEnd: '25-Oct-25', tenderArchStart: '30-Oct-25', tenderArchEnd: '4-Nov-25', tenderMepStart: '27-Oct-25', tenderMepEnd: '27-Oct-25', boqStart: '', boqEnd: 'Sent', tenderStatus: '', comparative: '8-Nov-25', workingDrawings: '12-Nov-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 5, srNo: '5', projectName: 'FBL Jameel Chowk Peshawar', area: '2259', projectHolder: 'Luqman', allocationDate: '22-Sep-25', siteSurveyStart: '1-Oct-25', siteSurveyEnd: '2-Oct-25', contactStart: 'Done', contactEnd: 'Received', headCountStart: '2-Oct-25', headCountEnd: '4-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '20-Oct-25', threedEnd: '25-Oct-25', tenderArchStart: '30-Oct-25', tenderArchEnd: '4-Nov-25', tenderMepStart: '27-Oct-25', tenderMepEnd: '27-Oct-25', boqStart: '', boqEnd: 'Sent', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 6, srNo: '6', projectName: 'FBL Jhangi Branch Gujranwala', area: '2270', projectHolder: 'Luqman Mujahid', allocationDate: '8-Sep-25', siteSurveyStart: '4-Sep-25', siteSurveyEnd: '5-Sep-25', contactStart: 'Done', contactEnd: 'Received', headCountStart: '8-Sep-25', headCountEnd: '11-Sep-25', proposalStart: '', proposalEnd: '', threedStart: '15-Sep-25', threedEnd: '24-Sep-25', tenderArchStart: '10-Oct-25', tenderArchEnd: '12-Oct-25', tenderMepStart: '2-Oct-25', tenderMepEnd: '4-Oct-25', boqStart: '', boqEnd: 'Sent', tenderStatus: 'Done', comparative: '21-Oct-25', workingDrawings: '25-Oct-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 7, srNo: '7', projectName: 'FBL Ferozpur Road Lahore', area: '2492', projectHolder: 'Luqman Mujahid', allocationDate: '8-Sep-25', siteSurveyStart: '5-Sep-25', siteSurveyEnd: '6-Sep-25', contactStart: 'Done', contactEnd: 'Received', headCountStart: '8-Sep-25', headCountEnd: '12-Sep-25', proposalStart: '', proposalEnd: '', threedStart: '13-Sep-25', threedEnd: '24-Sep-25', tenderArchStart: '10-Oct-25', tenderArchEnd: '14-Oct-25', tenderMepStart: '2-Oct-25', tenderMepEnd: '4-Oct-25', boqStart: '', boqEnd: 'Sent', tenderStatus: '', comparative: '2-Nov-25', workingDrawings: '5-Nov-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 8, srNo: '8', projectName: 'FBL Park View City Lahore', area: '2,900.00', projectHolder: 'Luqman Mujahid', allocationDate: '5-Sep-25', siteSurveyStart: '3-Sep-25', siteSurveyEnd: '4-Sep-25', contactStart: 'Done', contactEnd: 'Received', headCountStart: '5-Sep-25', headCountEnd: '12-Sep-25', proposalStart: '', proposalEnd: '', threedStart: '15-Sep-25', threedEnd: '24-Sep-25', tenderArchStart: '2-Oct-25', tenderArchEnd: '4-Oct-25', tenderMepStart: '25-Sep-25', tenderMepEnd: '27-Sep-25', boqStart: '', boqEnd: 'Sent', tenderStatus: '', comparative: '6-Nov-25', workingDrawings: '9-Nov-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 9, srNo: '9', projectName: 'FBL CPC-KHARIAN-BRANCH', area: '1,635.00', projectHolder: 'Luqman Mujahid', allocationDate: '20-Aug-25', siteSurveyStart: '21-Aug-25', siteSurveyEnd: '22-Aug-25', contactStart: '', contactEnd: 'Received', headCountStart: '5-Sep-25', headCountEnd: '11-Sep-25', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 10, srNo: '10', projectName: 'FBL Bhowana.', area: '2,183.00', projectHolder: 'Luqman Mujahid', allocationDate: '', siteSurveyStart: '16-Jul-25', siteSurveyEnd: '17-Jul-25', contactStart: '', contactEnd: 'Received', headCountStart: '9-Aug-25', headCountEnd: '', proposalStart: '', proposalEnd: '25-Aug-25', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: 'sent', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 11, srNo: '11', projectName: 'FBL Peer-Wadahi Road Branch Rawalpindi', area: '2,098.00', projectHolder: 'Noman', allocationDate: '23-Apr-25', siteSurveyStart: '24-Apr-25', siteSurveyEnd: '25-Apr-25', contactStart: 'N/A', contactEnd: 'N/A', headCountStart: 'N/A', headCountEnd: 'N/A', proposalStart: 'N/A', proposalEnd: 'N/A', threedStart: 'N/A', threedEnd: 'N/A', tenderArchStart: 'N/A', tenderArchEnd: 'N/A', tenderMepStart: 'N/A', tenderMepEnd: 'N/A', boqStart: '', boqEnd: 'sent', tenderStatus: '', comparative: 'DONE', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 12, srNo: '12', projectName: 'FBL Gulbahar, Peshawer', area: '2,000.00', projectHolder: 'Noman', allocationDate: '24-Oct-24', siteSurveyStart: '4-Nov-24', siteSurveyEnd: '5-Nov-24', contactStart: 'Done', contactEnd: 'Received', headCountStart: '8-Nov-24', headCountEnd: '12-Nov-24', proposalStart: '13-Nov-24', proposalEnd: '15-Nov-24', threedStart: '16-Nov-24', threedEnd: '24-Nov-24', tenderArchStart: '15-Nov-24', tenderArchEnd: '22-Nov-24', tenderMepStart: '23-Nov-24', tenderMepEnd: '26-Nov-24', boqStart: '', boqEnd: 'sent', tenderStatus: 'Done', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 13, srNo: '13', projectName: 'FBL Guest House DHA Phase-4 Lahore', area: '4,500.00', projectHolder: 'Noman', allocationDate: '1-Aug-24', siteSurveyStart: '6-Aug-24', siteSurveyEnd: '7-Aug-24', contactStart: 'Done', contactEnd: 'N/A', headCountStart: '22-Aug-24', headCountEnd: '16-Sep-24', proposalStart: 'N/A', proposalEnd: 'N/A', threedStart: '1-Oct-24', threedEnd: '26-Oct-24', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '28-Feb-25', tenderMepEnd: '1-Mar-25', boqStart: '', boqEnd: 'sent', tenderStatus: 'Done', comparative: '', workingDrawings: '', siteVisit: 'PENDING', finalBill: '', projectClosure: '' },
    { id: 14, srNo: '14', projectName: 'FBL Shahdara', area: '2,678.00', projectHolder: 'Adnan', allocationDate: '11-Jun-25', siteSurveyStart: '11-Jun-25', siteSurveyEnd: '13-Jun-25', contactStart: 'Done', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '16-Jun-25', proposalEnd: '21-Jun-25', threedStart: '22-Jun-25', threedEnd: '26-Jun-25', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: 'sent', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 15, srNo: '15', projectName: 'FBL RHQ (LG + GF)', area: '33,102.00', projectHolder: 'Luqman Haseeb', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: 'Done', contactEnd: '', headCountStart: '28-Aug-25', headCountEnd: '', proposalStart: '', proposalEnd: '28-Aug-25', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: 'sent', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 16, srNo: '16', projectName: 'FBL RHQ (Basment)', area: '33,102.00', projectHolder: 'Luqman Haseeb', allocationDate: '', siteSurveyStart: '', siteSurveyEnd: '', contactStart: 'WAITING', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
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

export default function FBLTimelinePage() {
    const { toast } = useToast();
    const [projectRows, setProjectRows] = useState<ProjectRow[]>(initialProjectRows);
    const [statusRows, setStatusRows] = useState<StatusRow[]>(initialStatusRows);
    const [remarks, setRemarks] = useState('');
    const [remarksDate, setRemarksDate] = useState('');

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
            proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '',
            tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '',
            workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: ''
        }]);
    };
    
    const removeProjectRow = (id: number) => {
        setProjectRows(projectRows.filter(row => row.id !== id));
    };
    
    const handleSave = () => {
        console.log({ projectRows, statusRows, remarks, remarksDate });
        toast({ title: 'Saved', description: 'FBL timeline data has been saved.' });
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(10);
        doc.text("Faysal Bank Timeline", 14, 15);
        
        const head = [
            ['Sr.No', 'Project Name', 'Area in Sft', 'Project Holder', 'Allocation Date / RFP', 
             'Site Survey\nStart', 'Site Survey\nEnd', 'Contact\nStart', 'Contact\nEnd', 'Head Count / Requirment\nStart', 'Head Count / Requirment\nEnd',
             'Proposal / Design Development\nStart', 'Proposal / Design Development\nEnd', '3D\'s\nStart', '3D\'s\nEnd',
             'Tender Package Architectural\nStart', 'Tender Package Architectural\nEnd', 'Tender Package MEP\nStart', 'Tender Package MEP\nEnd',
             'BOQ\nStart', 'BOQ\nEnd', 'Tender Status', 'Comparative', 'Working Drawings', 'Site Visit', 'Final Bill', 'Project Closure']
        ];
        
        const body = projectRows.map(p => [
            p.srNo, p.projectName, p.area, p.projectHolder, p.allocationDate,
            p.siteSurveyStart, p.siteSurveyEnd, p.contactStart, p.contactEnd, p.headCountStart, p.headCountEnd,
            p.proposalStart, p.proposalEnd, p.threedStart, p.threedEnd,
            p.tenderArchStart, p.tenderArchEnd, p.tenderMepStart, p.tenderMepEnd,
            p.boqStart, p.boqEnd, p.tenderStatus, p.comparative, p.workingDrawings, p.siteVisit, p.finalBill, p.projectClosure
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
            head: [['Overall Status']],
            body: statusRows.map(s => [`${s.title} - ${s.status}`]),
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

        doc.save('fbl_timeline.pdf');
        toast({ title: 'Downloaded', description: 'Timeline has been downloaded as PDF.' });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-center font-headline text-3xl text-primary">Faysal Bank Timeline</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save</Button>
                    <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
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
                                <th colSpan={2} className="border p-1">3D's</th>
                                <th colSpan={2} className="border p-1">Tender Package Architectural</th>
                                <th colSpan={2} className="border p-1">Tender Package MEP</th>
                                <th colSpan={2} className="border p-1">BOQ</th>
                                <th rowSpan={2} className="border p-1">Tender Status</th>
                                <th rowSpan={2} className="border p-1">Comparative</th>
                                <th rowSpan={2} className="border p-1">Working Drawings</th>
                                <th rowSpan={2} className="border p-1">Site Visit</th>
                                <th rowSpan={2} className="border p-1">Final Bill</th>
                                <th rowSpan={2} className="border p-1">Project Closure</th>
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
                                    <td className="border"><Input type="date" value={row.threedStart} onChange={e => handleProjectChange(row.id, 'threedStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.threedEnd} onChange={e => handleProjectChange(row.id, 'threedEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.tenderArchStart} onChange={e => handleProjectChange(row.id, 'tenderArchStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.tenderArchEnd} onChange={e => handleProjectChange(row.id, 'tenderArchEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.tenderMepStart} onChange={e => handleProjectChange(row.id, 'tenderMepStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.tenderMepEnd} onChange={e => handleProjectChange(row.id, 'tenderMepEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.boqStart} onChange={e => handleProjectChange(row.id, 'boqStart', e.target.value)} /></td>
                                    <td className="border"><Input type="date" value={row.boqEnd} onChange={e => handleProjectChange(row.id, 'boqEnd', e.target.value)} /></td>
                                    <td className="border"><Input type="text" value={row.tenderStatus} onChange={e => handleProjectChange(row.id, 'tenderStatus', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.comparative} onChange={e => handleProjectChange(row.id, 'comparative', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.workingDrawings} onChange={e => handleProjectChange(row.id, 'workingDrawings', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.siteVisit} onChange={e => handleProjectChange(row.id, 'siteVisit', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.finalBill} onChange={e => handleProjectChange(row.id, 'finalBill', e.target.value)} className="w-24" /></td>
                                    <td className="border"><Input type="text" value={row.projectClosure} onChange={e => handleProjectChange(row.id, 'projectClosure', e.target.value)} className="w-24" /></td>
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
                         <tbody>
                            {statusRows.map(row => (
                                <tr key={row.id}>
                                    <td className="border p-2 font-semibold w-1/3">{row.title}</td>
                                    <td className="border p-2"><Input type="text" value={row.status} onChange={e => handleStatusChange(row.id, e.target.value)} /></td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                </div>
                
                <div className="mt-8">
                    <h3 className="font-bold text-lg mb-2">Maam Isbah Remarks & Order</h3>
                    <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={4} />
                    <Input type="date" value={remarksDate} onChange={e => setRemarksDate(e.target.value)} className="mt-2 w-fit" />
                </div>
            </CardContent>
        </Card>
    );
}
