'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface TaskRow {
  id: number;
  code: string;
  task: string;
  duration: string;
  planStart: string;
  planFinish: string;
  actualStart: string;
  actualFinish: string;
  progressPlan: string;
  progressActual: string;
  progressVariance: string;
  remarks: string;
}

const initialRow: Omit<TaskRow, 'id'> = {
  code: '',
  task: '',
  duration: '',
  planStart: '',
  planFinish: '',
  actualStart: '',
  actualFinish: '',
  progressPlan: '',
  progressActual: '',
  progressVariance: '',
  remarks: '',
};

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'construction-schedule');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();
  
  const [headerState, setHeaderState] = useState({
    client: '',
    title: 'Construction Time Line',
    projectType: '',
    coveredArea: '',
    location: '',
    projectNumber: '',
    date: '',
  });

  const [rows, setRows] = useState<TaskRow[]>([{ id: 1, ...initialRow }]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeaderState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRowChange = (id: number, field: keyof TaskRow, value: string) => {
    setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), ...initialRow }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleSave = async () => {
    if (!firestore || !currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
      return;
    }
    
    const dataToSave = {
      category: 'Construction Activity Schedule',
      items: [
        JSON.stringify(headerState),
        ...rows.map(row => JSON.stringify(row))
      ]
    };

    try {
      await addDoc(collection(firestore, 'savedRecords'), {
        employeeId: currentUser.record,
        employeeName: currentUser.name,
        fileName: 'Construction Activity Schedule',
        projectName: headerState.title || 'Untitled Schedule',
        data: [dataToSave],
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Record Saved', description: 'The construction schedule has been saved.' });
    } catch (error) {
      console.error("Error saving document: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
    let yPos = 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Construction Activity Schedule', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    const headerDetails = [
      [`Client: ${headerState.client}`, `Title: ${headerState.title}`, `Project Type: ${headerState.projectType}`],
      [`Covered Area: ${headerState.coveredArea}`, `Location: ${headerState.location}`, `Project Number: ${headerState.projectNumber}`, `Date: ${headerState.date}`]
    ];
    (doc as any).autoTable({
        body: headerDetails,
        startY: yPos,
        theme: 'plain',
    });
    yPos = (doc as any).autoTable.previous.finalY + 10;

    const head = [[
      { content: 'Sr.No/ Code', rowSpan: 2 },
      { content: 'Task', rowSpan: 2 },
      { content: 'Duration Given By the Contract', rowSpan: 2 },
      { content: 'Plan', colSpan: 2 },
      { content: 'Actual', colSpan: 2 },
      { content: 'Progress', colSpan: 3 },
      { content: 'Remarks', rowSpan: 2 },
    ],
    ['Start', 'Finish', 'Start', 'Finish', 'Plan', 'Actual', 'Variance']
    ];
    
    const body = rows.map(row => [
        row.code, row.task, row.duration, row.planStart, row.planFinish, 
        row.actualStart, row.actualFinish, row.progressPlan, row.progressActual,
        row.progressVariance, row.remarks
    ]);

    (doc as any).autoTable({
        head: head,
        body: body,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [45, 95, 51], halign: 'center' },
        styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save('construction-activity-schedule.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Construction Activity Schedule"
        description="View and manage the construction schedule."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-headline text-3xl text-primary">Construction Activity Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div><Label htmlFor="client">Client</Label><Input id="client" name="client" value={headerState.client} onChange={handleHeaderChange} /></div>
            <div><Label htmlFor="title">Title</Label><Input id="title" name="title" value={headerState.title} onChange={handleHeaderChange} /></div>
            <div><Label htmlFor="projectType">Project Type</Label><Input id="projectType" name="projectType" value={headerState.projectType} onChange={handleHeaderChange} /></div>
            <div><Label htmlFor="coveredArea">Covered Area</Label><Input id="coveredArea" name="coveredArea" value={headerState.coveredArea} onChange={handleHeaderChange} /></div>
            <div><Label htmlFor="location">Location</Label><Input id="location" name="location" value={headerState.location} onChange={handleHeaderChange} /></div>
            <div><Label htmlFor="projectNumber">Project Number</Label><Input id="projectNumber" name="projectNumber" value={headerState.projectNumber} onChange={handleHeaderChange} /></div>
            <div><Label htmlFor="date">Date</Label><Input id="date" name="date" type="date" value={headerState.date} onChange={handleHeaderChange} /></div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2}>Sr.No/Code</TableHead>
                  <TableHead rowSpan={2}>Task</TableHead>
                  <TableHead rowSpan={2}>Duration Given By Contract</TableHead>
                  <TableHead colSpan={2} className="text-center">Plan</TableHead>
                  <TableHead colSpan={2} className="text-center">Actual</TableHead>
                  <TableHead colSpan={3} className="text-center">Progress</TableHead>
                  <TableHead rowSpan={2}>Remarks</TableHead>
                  <TableHead rowSpan={2}>Action</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell><Input value={row.code} onChange={e => handleRowChange(row.id, 'code', e.target.value)} /></TableCell>
                    <TableCell><Textarea value={row.task} onChange={e => handleRowChange(row.id, 'task', e.target.value)} rows={1}/></TableCell>
                    <TableCell><Input value={row.duration} onChange={e => handleRowChange(row.id, 'duration', e.target.value)} /></TableCell>
                    <TableCell><Input type="date" value={row.planStart} onChange={e => handleRowChange(row.id, 'planStart', e.target.value)} /></TableCell>
                    <TableCell><Input type="date" value={row.planFinish} onChange={e => handleRowChange(row.id, 'planFinish', e.target.value)} /></TableCell>
                    <TableCell><Input type="date" value={row.actualStart} onChange={e => handleRowChange(row.id, 'actualStart', e.target.value)} /></TableCell>
                    <TableCell><Input type="date" value={row.actualFinish} onChange={e => handleRowChange(row.id, 'actualFinish', e.target.value)} /></TableCell>
                    <TableCell><Input value={row.progressPlan} onChange={e => handleRowChange(row.id, 'progressPlan', e.target.value)} /></TableCell>
                    <TableCell><Input value={row.progressActual} onChange={e => handleRowChange(row.id, 'progressActual', e.target.value)} /></TableCell>
                    <TableCell><Input value={row.progressVariance} onChange={e => handleRowChange(row.id, 'progressVariance', e.target.value)} /></TableCell>
                    <TableCell><Textarea value={row.remarks} onChange={e => handleRowChange(row.id, 'remarks', e.target.value)} rows={1} /></TableCell>
                    <TableCell><Button variant="destructive" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button onClick={addRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
            <div className="flex gap-4">
              <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
              <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
