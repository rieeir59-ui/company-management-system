
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
    { id: 1, srNo: '1', projectName: 'UBL Bhowana, Chiniot', area: '7,600.00', projectHolder: 'Adnan Luqman', allocationDate: '6-May-25', siteSurveyStart: '20-May-25', siteSurveyEnd: '21-May-25', contactStart: 'Done', contactEnd: '', headCountStart: '6-May-25', headCountEnd: '6-Jul-25', proposalStart: 'Done', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 2, srNo: '2', projectName: 'UBL QASIMABAD, HYDERABAD', area: '13,600.00', projectHolder: '', allocationDate: 'Done', siteSurveyStart: 'Done', siteSurveyEnd: 'Done', contactStart: 'Done', contactEnd: 'Done', headCountStart: 'Done', headCountEnd: 'Done', proposalStart: 'Done', proposalEnd: 'Done', threedStart: 'Done', threedEnd: 'Done', tenderArchStart: 'Done', tenderArchEnd: 'Done', tenderMepStart: 'Done', tenderMepEnd: 'Done', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 3, srNo: '3', projectName: 'UBL NELA-GUMBAD LHR', area: '', projectHolder: '', allocationDate: 'Done', siteSurveyStart: 'Done', siteSurveyEnd: '', contactStart: 'Done', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: 'Hold', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 4, srNo: '4', projectName: 'UBL PHASE 6', area: '13,085.00', projectHolder: 'Adnan Haseeb', allocationDate: '6-Apr-24', siteSurveyStart: '', siteSurveyEnd: '', contactStart: 'Done', contactEnd: '', headCountStart: 'Done', headCountEnd: '', proposalStart: 'Sent', proposalEnd: '', threedStart: 'Pending', threedEnd: '', tenderArchStart: 'Pending', tenderArchEnd: '', tenderMepStart: 'Done', tenderMepEnd: '', boqStart: 'In Revision', boqEnd: '', tenderStatus: '', comparative: 'In Revision', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 5, srNo: '5', projectName: 'State Life Society', area: '6,691.00', projectHolder: 'Adnan Haseeb', allocationDate: '6-Mar-24', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: 'Done', headCountEnd: '', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '23-Oct-24', tenderArchEnd: '2024-10-28', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
];


const initialStatusRows: StatusRow[] = [
    { id: 1, title: '1', status: 'Proposal sent and waiting for approval.' },
    { id: 2, title: '2', status: 'Visit required' },
    { id: 3, title: '3', status: 'on Hold' },
    { id: 4, title: '4', status: 'Construction in Progress.' },
    { id: 5, title: '5', status: 'Tender Working as per new theme.' },
];

export default function UBLTimelinePage() {
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
        toast({ title: 'Saved', description: 'UBL timeline data has been saved.' });
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(10);
        doc.text("UBL Timeline", 14, 15);
        
        const head = [
            ['Sr.No', 'Project Name', 'Area In Sft', 'Project Holder', 'Allocation Date / RFP', 
             'Site Survey\nStart', 'Site Survey\nEnd', 'Contact\nStart', 'Contact\nEnd', 'Head Count\nStart', 'Head Count\nEnd',
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
            body: statusRows.map(s => [`${s.title} ${s.status}`]),
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

        doc.save('ubl_timeline.pdf');
        toast({ title: 'Downloaded', description: 'Timeline has been downloaded as PDF.' });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-center font-headline text-3xl text-primary">UBL Timeline</CardTitle>
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
                                <th rowSpan={2} className="border p-1">Area In Sft</th>
                                <th rowSpan={2} className="border p-1">Project Holder</th>
                                <th rowSpan={2} className="border p-1">Allocation Date / RFP</th>
                                <th colSpan={2} className="border p-1">Site Survey</th>
                                <th colSpan={2} className="border p-1">Contact</th>
                                <th colSpan={2} className="border p-1">Head Count</th>
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

