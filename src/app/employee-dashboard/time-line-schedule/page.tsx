'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { addDays, subDays, differenceInDays, format, parseISO } from 'date-fns';


interface Task {
  id: number;
  taskId: string;
  taskName: string;
  duration: string;
  start: string;
  finish: string;
  predecessor: string;
  isHeader: boolean;
}

const initialTasks: Task[] = [
    { id: 1, taskId: '1', taskName: 'Project Initiation & Site Studies', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 2, taskId: '1.1', taskName: 'Client Brief', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 3, taskId: '1.2', taskName: 'Project Scope and Area Statements', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 4, taskId: '1.3', taskName: 'Topographic / Preliminary Survey', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 5, taskId: '1.4', taskName: 'Geotechnical Investigation and Report', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 6, taskId: '2', taskName: 'Concept Design Stage', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 7, taskId: '2.1', taskName: 'Concept Design Development', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 8, taskId: '2.2', taskName: 'Concept Plans and Supporting Drawings', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 9, taskId: '2.3', taskName: 'Interior Design Concept Development', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 10, taskId: '2.4', taskName: 'Finalization of Concept Design Report', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 11, taskId: '2.5', taskName: 'Client Approval on Concept Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 12, taskId: '3', taskName: 'Preliminary Design Stage', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 13, taskId: '3.1', taskName: 'Preliminary Design and Layout Plan – Cycle 1', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 14, taskId: '3.2', taskName: 'Initial Engineering Coordination (Structural / MEP)', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 15, taskId: '3.3', taskName: 'Layout Plan – Cycle 2 (Refined Based on Feedback)', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 16, taskId: '3.4', taskName: 'Environmental Study (if applicable)', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 17, taskId: '3.5', taskName: 'Authority Pre-Consultation / Coordination (LDA, CDA, etc.)', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 18, taskId: '3.6', taskName: '3D Model Development', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 19, taskId: '3.7', taskName: 'Elevations and Sections', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 20, taskId: '3.8', taskName: 'Preliminary Interior Layout', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 21, taskId: '3.9', taskName: 'Preliminary Engineering Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 22, taskId: '3.10', taskName: 'Finalization of Preliminary Design Report', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 23, taskId: '3.11', taskName: 'Client Comments / Approval on Preliminary Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 24, taskId: '4', taskName: 'Authority Submission Stage', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 25, taskId: '4.1', taskName: 'Preparation of Submission Drawings', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 26, taskId: '4.2', taskName: 'Submission to LDA / CDA / Other Relevant Authority', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 27, taskId: '4.3', taskName: 'Application for Stage-1 Approval', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 28, taskId: '4.4', taskName: 'Authority Approval Process (Review, Comments, Compliance)', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 29, taskId: '4.5', taskName: 'Receipt of Authority Approval (Stage-1)', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 30, taskId: '5', taskName: 'Detailed Design and Tender Preparation Stage', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 31, taskId: '5.1', taskName: 'Detailed Architectural Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 32, taskId: '5.2', taskName: 'Detailed Interior Layout', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 33, taskId: '5.3', taskName: 'Detailed Engineering Designs (Structural / MEP)', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 34, taskId: '5.4', taskName: 'Draft Conditions of Contract', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 35, taskId: '5.5', taskName: 'Draft BOQs and Technical Specifications', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 36, taskId: '5.6', taskName: 'Client Comments and Approvals on Detailed Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 37, taskId: '5.7', taskName: 'Finalization of Detailed Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 38, taskId: '6', taskName: 'Construction Design and Tender Finalization Stage', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 39, taskId: '6.1', taskName: 'Construction Design and Final Tender Preparation', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 40, taskId: '6.2', taskName: 'Architectural Construction Drawings', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 41, taskId: '6.3', taskName: 'Engineering Construction Drawings', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 42, taskId: '6.4', taskName: 'Final Tender Documents', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 43, taskId: '6.5', taskName: 'Client Comments / Approval on Final Tender Documents', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 44, taskId: '6.6', taskName: 'Tender Documents Ready for Issue', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 45, taskId: '7', taskName: 'Interior Design Development Stage', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 46, taskId: '7.1', taskName: 'Final Interior Design Development', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 47, taskId: '7.2', taskName: 'Interior Layout Working Details', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 48, taskId: '7.3', taskName: 'Interior Thematic Mood Board and Color Scheme', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 49, taskId: '7.4', taskName: 'Ceiling Detail Design Drawings', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 50, taskId: '7.5', taskName: 'Built-in Feature Details', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 51, taskId: '7.6', taskName: 'Partition and Pattern Detail Drawings', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 52, taskId: '7.7', taskName: 'Draft Interior Design Tender', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 53, taskId: '7.8', taskName: 'Client Comments / Approval on Interior Design Development', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 54, taskId: '7.9', taskName: 'Client Comments / Approval on Interior Design Tender', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 55, taskId: '7.10', taskName: 'Finalization of Interior Design Tender', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 56, taskId: '8', taskName: 'Procurement & Appointment Stage', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 57, taskId: '8.1', taskName: 'Procurement of Main Contractor', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 58, taskId: '8.2', taskName: 'Contract Award / Mobilization', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
];

export default function TimelinePage() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [project, setProject] = useState('');
    const [architect, setArchitect] = useState('IH&SA');
    const [projectNo, setProjectNo] = useState('');
    const [projectDate, setProjectDate] = useState('');

    const handleTaskChange = (id: number, field: keyof Task, value: string) => {
        setTasks(currentTasks => {
            const newTasks = [...currentTasks];
            const taskIndex = newTasks.findIndex(t => t.id === id);
            if (taskIndex === -1) return currentTasks;

            const updatedTask = { ...newTasks[taskIndex], [field]: value };

            const duration = parseInt(updatedTask.duration, 10);
            const start = updatedTask.start ? parseISO(updatedTask.start) : null;
            const finish = updatedTask.finish ? parseISO(updatedTask.finish) : null;
            
            if (field === 'duration' || field === 'start') {
                if (!isNaN(duration) && start) {
                    updatedTask.finish = format(addDays(start, duration), 'yyyy-MM-dd');
                }
            } else if (field === 'finish') {
                if (start && finish) {
                     const diff = differenceInDays(finish, start);
                     updatedTask.duration = diff >= 0 ? String(diff) : '0';
                } else if (!isNaN(duration) && finish) {
                    updatedTask.start = format(subDays(finish, duration), 'yyyy-MM-dd');
                }
            }

            newTasks[taskIndex] = updatedTask;
            return newTasks;
        });
    };

    const addTask = () => {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        const newTaskId = tasks.length > 0 ? String(parseFloat(tasks[tasks.length - 1].taskId) + 0.1) : '1';
        const newTask: Task = { id: newId, taskId: newTaskId, taskName: '', duration: '', start: '', finish: '', predecessor: '', isHeader: false };
        setTasks([...tasks, newTask]);
    };

    const removeTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            category: 'Timeline Schedule',
            items: tasks.map(task =>
                `ID: ${task.taskId}, Task: ${task.taskName}, Duration: ${task.duration}, Start: ${task.start}, Finish: ${task.finish}, Predecessor: ${task.predecessor}`
            ),
        };
        
        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Timeline Schedule',
                projectName: project || 'Untitled Timeline',
                data: [dataToSave],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The timeline schedule has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";

        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TIME LINE SCHEDULE', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;
        
        doc.setFontSize(10);
        doc.text(`Project: ${project}`, 14, yPos);
        doc.text(`Architect: ${architect}`, 120, yPos);
        yPos += 7;
        doc.text(`(Name, Address)`, 14, yPos);
        doc.text(`Architects Project No: ${projectNo}`, 120, yPos);
        yPos += 7;
        doc.text(`Project Date: ${projectDate}`, 120, yPos);
        yPos += 10;
        
        (doc as any).autoTable({
            head: [['ID', 'Task Name', 'Duration', 'Start', 'Finish', 'Predecessor']],
            body: tasks.map(t => [t.taskId, t.taskName, t.duration, t.start, t.finish, t.predecessor]),
            startY: yPos,
            theme: 'grid',
            didParseCell: function(data: any) {
                if (tasks[data.row.index]?.isHeader) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = '#f0f0f0';
                }
            }
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save('timeline-schedule.pdf');
        toast({ title: 'Download Started', description: 'Your timeline PDF is being generated.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-primary">TIME LINE SCHEDULE</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <Label htmlFor="project">Project (Name, Address)</Label>
                        <Input id="project" value={project} onChange={e => setProject(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="architect">Architect</Label>
                        <Input id="architect" value={architect} onChange={e => setArchitect(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="projectNo">Architects Project No</Label>
                        <Input id="projectNo" value={projectNo} onChange={e => setProjectNo(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="projectDate">Project Date</Label>
                        <Input id="projectDate" type="date" value={projectDate} onChange={e => setProjectDate(e.target.value)} />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">ID</TableHead>
                            <TableHead>Task Name</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Finish</TableHead>
                            <TableHead>Predecessor</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map(task => (
                            <TableRow key={task.id} className={task.isHeader ? 'bg-muted' : ''}>
                                <TableCell>
                                    <Input value={task.taskId} onChange={e => handleTaskChange(task.id, 'taskId', e.target.value)} className="font-bold" />
                                </TableCell>
                                <TableCell>
                                    <Input value={task.taskName} onChange={e => handleTaskChange(task.id, 'taskName', e.target.value)} className={task.isHeader ? 'font-bold' : ''} />
                                </TableCell>
                                <TableCell><Input type="number" value={task.duration} onChange={e => handleTaskChange(task.id, 'duration', e.target.value)} /></TableCell>
                                <TableCell><Input type="date" value={task.start} onChange={e => handleTaskChange(task.id, 'start', e.target.value)} /></TableCell>
                                <TableCell><Input type="date" value={task.finish} onChange={e => handleTaskChange(task.id, 'finish', e.target.value)} /></TableCell>
                                <TableCell><Input value={task.predecessor} onChange={e => handleTaskChange(task.id, 'predecessor', e.target.value)} /></TableCell>
                                <TableCell>
                                    <Button variant="destructive" size="icon" onClick={() => removeTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-4">
                     <Button onClick={addTask}><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                    <div className="flex gap-4">
                        <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
