'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { useEmployees } from '@/context/EmployeeContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import type jsPDF from 'jspdf';
import 'jspdf-autotable';

function AssignTaskForm() {
    const searchParams = useSearchParams();
    const employeeId = searchParams.get('employeeId');

    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    const { employees } = useEmployees();

    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        if (employeeId) {
            setAssignedTo(employeeId);
        }
    }, [employeeId]);

    const handleSave = () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save a task.' });
            return;
        }

        const dataToSave = {
            taskName,
            taskDescription,
            assignedTo,
            dueDate,
            endDate,
            projectName,
            assignedBy: currentUser.name,
            assignedById: currentUser.record,
            createdAt: serverTimestamp(),
            status: 'not-started',
        };

        const recordToSave = {
            uid: currentUser.uid, 
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: "Task Assignment",
            projectName: projectName || `Task: ${taskName}`,
            data: [{
                category: 'Task Assignment',
                items: Object.entries(dataToSave).map(([key, value]) => {
                    if (key === 'createdAt') return `${key}: ${new Date().toISOString()}`;
                     if (key === 'assignedTo') {
                         const assignedEmployee = employees.find(e => e.record === value);
                         return `${key}: ${assignedEmployee?.name || value}`;
                    }
                    return `${key}: ${value}`;
                })
            }],
            createdAt: serverTimestamp(),
        };

        addDoc(collection(firestore, 'tasks'), dataToSave)
            .then(() => {
                 addDoc(collection(firestore, 'savedRecords'), recordToSave).catch(serverError => {
                    const permissionError = new FirestorePermissionError({
                        path: 'savedRecords',
                        operation: 'create',
                        requestResourceData: recordToSave,
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });

                toast({ title: 'Task Assigned', description: `Task "${taskName}" has been assigned and recorded.` });
                setIsSaveOpen(false);
                setTaskName('');
                setTaskDescription('');
                setAssignedTo(employeeId || '');
                setDueDate('');
                setEndDate('');
                setProjectName('');
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: 'tasks',
                    operation: 'create',
                    requestResourceData: dataToSave,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            });
    };
    
    const handleDownloadPdf = async () => {
        const { default: jsPDF } = await import('jspdf');
        await import('jspdf-autotable');

        const doc = new jsPDF() as any;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";

        let yPos = 20;
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Task Assignment", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;
        
        doc.setFontSize(10);
        const assignedEmployee = employees.find(e => e.record === assignedTo);

        doc.autoTable({
            startY: yPos,
            theme: 'grid',
            head: [['Field', 'Details']],
            body: [
                ['Project Name', projectName],
                ['Task Name', taskName],
                ['Task Description', taskDescription],
                ['Assigned To', assignedEmployee?.name || assignedTo],
                ['Due Date', dueDate],
                ['End Date', endDate],
                ['Assigned By', currentUser?.name || 'N/A'],
            ],
            headStyles: { fillColor: [45, 95, 51] }
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }


        doc.save('task-assignment.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl text-primary">Assign a New Task</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
                    <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Corporate Office Building" />
                    </div>
                        <div className="space-y-2">
                        <Label htmlFor="taskName">Task Name</Label>
                        <Input id="taskName" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="e.g. Finalize floor plan" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taskDescription">Task Description</Label>
                        <Textarea id="taskDescription" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Provide details about the task..." />
                    </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="assignedTo">Assign To</Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(employee => (
                                        <SelectItem key={employee.record} value={employee.record}>
                                            {employee.name} ({employee.department})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                            <DialogTrigger asChild>
                                <Button><Save className="mr-2 h-4 w-4" /> Assign & Save</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm Assignment</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to assign this task?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                    <Button onClick={handleSave}>Confirm</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download as PDF</Button>
                    </div>
                </CardContent>
            </Card>
    );
}

function AssignTaskFormFallback() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center font-headline text-3xl text-primary">Assign a New Task</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto h-96 flex items-center justify-center">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading Form...</span>
                 </div>
            </CardContent>
        </Card>
    )
}

export default function AssignTaskFormPage() {
  const image = PlaceHolderImages.find(p => p.id === 'assign-task');
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Assign Task"
        description="Delegate tasks to your team members."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Suspense fallback={<AssignTaskFormFallback />}>
        <AssignTaskForm />
      </Suspense>
    </div>
  );
}
