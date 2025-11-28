
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
    { id: 1, srNo: '1', projectName: 'HBL PRESTIGE JOHER TOWN', area: '10,000', projectHolder: 'Luqman', allocationDate: '19-Sep-25', siteSurveyStart: '4-Aug-25', siteSurveyEnd: '5-Aug-25', contactStart: '', contactEnd: 'Received', headCountStart: '22-Sep-25', headCountEnd: '8-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '21-Oct-25', threedEnd: '25-Oct-25', tenderArchStart: '25-Oct-25', tenderArchEnd: '3-Nov-25', tenderMepStart: '3-Nov-25', tenderMepEnd: '4-Nov-25', boqStart: '', boqEnd: '4-Nov-25', tenderStatus: '', comparative: '30-Oct-25', workingDrawings: '16-Nov-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 2, srNo: '2', projectName: '68-A HBL Prestige & RBC CITY HOUSING SIALKOT -II', area: '9,880', projectHolder: 'Jabar Luqman', allocationDate: '28-Sep-25', siteSurveyStart: '2-Oct-25', siteSurveyEnd: '3-Oct-25', contactStart: '', contactEnd: 'Received', headCountStart: '6-Oct-25', headCountEnd: '15-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: 'Send', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 3, srNo: '3', projectName: 'HBL DHA GUJRANWALA', area: '4,028', projectHolder: 'Luqman', allocationDate: '6-Sep-25', siteSurveyStart: '4-Sep-25', siteSurveyEnd: '5-Sep-25', contactStart: '', contactEnd: 'Received', headCountStart: '8-Sep-25', headCountEnd: '12-Sep-25', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: 'Hold', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 4, srNo: '4', projectName: 'HBL CITY HOUSING SIALKOT', area: '10,135', projectHolder: 'Luqman', allocationDate: '11-Sep-25', siteSurveyStart: '26-Aug-25', siteSurveyEnd: '27-Aug-25', contactStart: '', contactEnd: 'Received', headCountStart: '12-Sep-25', headCountEnd: '18-Sep-25', proposalStart: '', proposalEnd: '', threedStart: '', threedEnd: '', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: 'Hold', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 5, srNo: '5', projectName: 'HBL ASLAM MOR LAYYAH', area: '2,022', projectHolder: 'MUJAHID Luqman', allocationDate: '11-Sep-25', siteSurveyStart: '21-Sep-25', siteSurveyEnd: '22-Sep-25', contactStart: '', contactEnd: 'Received', headCountStart: '5-Oct-25', headCountEnd: '6-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '5-Oct-25', threedEnd: '9-Oct-25', tenderArchStart: '9-Oct-25', tenderArchEnd: '12-Oct-25', tenderMepStart: '12-Oct-25', tenderMepEnd: '12-Oct-25', boqStart: '', boqEnd: 'Send', tenderStatus: '', comparative: '28-Oct-25', workingDrawings: '4-Nov-25', siteVisit: '1st visit', finalBill: '', projectClosure: '' },
    { id: 6, srNo: '6', projectName: 'HBL Hellan Branch 1375 Gujranwala', area: '2,260', projectHolder: 'MUJAHID Luqman', allocationDate: '19-Sep-25', siteSurveyStart: '7-Sep-25', siteSurveyEnd: '8-Sep-25', contactStart: '', contactEnd: 'Received', headCountStart: '5-Oct-25', headCountEnd: '27-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '28-Oct-25', threedEnd: '3-Nov-25', tenderArchStart: '30-Oct-25', tenderArchEnd: '4-Nov-25', tenderMepStart: '4-Nov-25', tenderMepEnd: '5-Nov-25', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 7, srNo: '7', projectName: 'HBL Jaranwala Road', area: '2,725.00', projectHolder: 'Luqman Mujahid', allocationDate: '23-Aug-25', siteSurveyStart: '21-Aug-25', siteSurveyEnd: '21-Aug-25', contactStart: '', contactEnd: 'Received', headCountStart: '21-Oct-25', headCountEnd: '25-Oct-25', proposalStart: '', proposalEnd: '', threedStart: '25-Oct-25', threedEnd: '26-Oct-25', tenderArchStart: '27-Oct-25', tenderArchEnd: '1-Nov-25', tenderMepStart: '26-Oct-25', tenderMepEnd: '26-Oct-25', boqStart: '', boqEnd: 'Send', tenderStatus: '', comparative: '14-Nov-25', workingDrawings: '18-Nov-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 8, srNo: '8', projectName: 'HBL Poona branch', area: '1,422.00', projectHolder: 'Mujahid', allocationDate: 'N/A', siteSurveyStart: 'N/A', siteSurveyEnd: 'N/A', contactStart: 'Done', contactEnd: '', headCountStart: '27-May-25', headCountEnd: '', proposalStart: '', proposalEnd: '', threedStart: '4-Aug-25', threedEnd: '8-Aug-25', tenderArchStart: '8-Aug-25', tenderArchEnd: '9-Aug-25', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: 'Sent', tenderStatus: '', comparative: '', workingDrawings: '9-Aug-25', siteVisit: '', finalBill: '', projectClosure: '' },
    { id: 9, srNo: '9', projectName: 'HBL Raya Branch Lahore', area: '11,720.00', projectHolder: 'Luqman Adnan', allocationDate: '13-Dec-23', siteSurveyStart: '14-Dec-23', siteSurveyEnd: '15-Dec-23', contactStart: 'Done', contactEnd: 'Received', headCountStart: '13-Feb-24', headCountEnd: '27-Feb-24', proposalStart: '28-Feb-24', proposalEnd: '9-Mar-24', threedStart: '11-Mar-24', threedEnd: '25-Mar-24', tenderArchStart: '12-Mar-24', tenderArchEnd: '20-Mar-24', tenderMepStart: '22-Mar-24', tenderMepEnd: '30-Mar-24', boqStart: 'Send', boqEnd: 'Send', tenderStatus: '', comparative: '12-Mar-25', workingDrawings: '20-Mar-25', siteVisit: 'VISITS DONE', finalBill: '', projectClosure: '' },
    { id: 10, srNo: '10', projectName: 'HBL Chowk Azam Branch 0847 Multan', area: '2,510.00', projectHolder: 'Luqman Mujahid', allocationDate: '9-Apr-25', siteSurveyStart: '17-Apr-25', siteSurveyEnd: '18-Apr-25', contactStart: '', contactEnd: '', headCountStart: '', headCountEnd: '', proposalStart: '10-Jun-25', proposalEnd: '11-Jul-25', threedStart: '23-Jun-25', threedEnd: '30-Jun-25', tenderArchStart: '11-Jul-25', tenderArchEnd: '14-Jul-25', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: 'Sent', tenderStatus: '', comparative: '16-Jul-25', workingDrawings: '19-Jul-25', siteVisit: '1s visit', finalBill: '', projectClosure: '' },
    { id: 11, srNo: '11', projectName: 'HBL Islamic prestige', area: '1,778.00', projectHolder: 'Mohsin Ali', allocationDate: '25-Jul-25', siteSurveyStart: '', siteSurveyEnd: '', contactStart: '', contactEnd: '', headCountStart: '28-Aug-25', headCountEnd: '', proposalStart: '', proposalEnd: '', threedStart: '1-Sep-25', threedEnd: '2-Sep-25', tenderArchStart: '', tenderArchEnd: '', tenderMepStart: '', tenderMepEnd: '', boqStart: '', boqEnd: '', tenderStatus: '', comparative: '', workingDrawings: '', siteVisit: '', finalBill: '', projectClosure: '' },
];


const initialStatusRows: StatusRow[] = [];


export default function HBLTimelinePage() {
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
        toast({ title: 'Saved', description: 'HBL timeline data has been saved.' });
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(10);
        doc.text("HBL Timeline", 14, 15);
        
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
        
        if (statusRows.length > 0) {
            doc.autoTable({
                head: [['Overall Status']],
                body: statusRows.map(s => [`${s.title} ${s.status}`]),
                startY: lastY,
                theme: 'grid',
                styles: { fontSize: 8 },
            });
            lastY = (doc as any).autoTable.previous.finalY + 10;
        }
        
        doc.text("Maam Isbah Remarks & Order", 14, lastY);
        lastY += 7;
        doc.text(remarks, 14, lastY);
        lastY += 10;

        doc.text(`Date: ${remarksDate}`, 14, lastY);

        doc.save('hbl_timeline.pdf');
        toast({ title: 'Downloaded', description: 'Timeline has been downloaded as PDF.' });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-center font-headline text-3xl text-primary">HBL Timeline</CardTitle>
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

    