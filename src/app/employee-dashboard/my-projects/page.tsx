'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Clock, XCircle, Briefcase, PlusCircle, Save, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/context/UserContext';
import { useFirebase } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, type Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEmployees } from '@/context/EmployeeContext';
import { type Employee } from '@/lib/employees';
import { Suspense } from 'react';
import { differenceInDays, parseISO, isWithinInterval } from 'date-fns';

const departments: Record<string, string> = {
    'ceo': 'CEO',
    'admin': 'Admin',
    'hr': 'HR',
    'software-engineer': 'Software Engineer',
    'draftman': 'Draftsman',
    '3d-visualizer': '3D Visualizer',
    'architects': 'Architects',
    'finance': 'Finance',
    'quantity-management': 'Quantity Management',
};

function formatDepartmentName(slug: string) {
    return departments[slug] || slug;
}

const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : '';
}

interface Project {
  id: string;
  projectName: string;
  taskName: string;
  taskDescription: string;
  status: 'completed' | 'in-progress' | 'not-started';
  dueDate: string;
  assignedBy: string;
}

type ProjectRow = {
  id: number;
  projectName: string;
  detail: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

type ProjectStatus = 'completed' | 'in-progress' | 'not-started';

const StatusIcon = ({ status }: { status: Project['status'] }) => {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'in-progress':
            return <Clock className="h-5 w-5 text-blue-500" />;
        case 'not-started':
            return <XCircle className="h-5 w-5 text-red-500" />;
        default:
            return null;
    }
};

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

function MyProjectsComponent() {
  const { user: currentUser } = useCurrentUser();
  const { employees } = useEmployees();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const employeeId = searchParams.get('employeeId');
  const displayUser = useMemo(() => {
    return employeeId ? employees.find(e => e.record === employeeId) : currentUser;
  }, [employeeId, employees, currentUser]);
    
  const isOwner = currentUser && displayUser && currentUser.record === displayUser.record;

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [rows, setRows] = useState<ProjectRow[]>([{ id: 1, projectName: '', detail: '', status: 'not-started', startDate: '', endDate: '' }]);
  const [schedule, setSchedule] = useState({ start: '', end: '' });
  const [remarks, setRemarks] = useState('');
  const [numberOfDays, setNumberOfDays] = useState<number | null>(null);

  useEffect(() => {
    if (schedule.start && schedule.end) {
      const start = parseISO(schedule.start);
      const end = parseISO(schedule.end);
      const diff = differenceInDays(end, start);
      setNumberOfDays(diff >= 0 ? diff + 1 : 0);
    } else {
      setNumberOfDays(null);
    }
  }, [schedule.start, schedule.end]);
  
  const filteredRows = useMemo(() => {
    if (!schedule.start || !schedule.end) {
        return rows;
    }

    const scheduleStart = parseISO(schedule.start);
    const scheduleEnd = parseISO(schedule.end);

    return rows.filter(row => {
        if (!row.startDate || !row.endDate) return false;
        const projectStart = parseISO(row.startDate);
        const projectEnd = parseISO(row.endDate);
        
        // Check for overlap
        return projectStart <= scheduleEnd && projectEnd >= scheduleStart;
    });
}, [rows, schedule.start, schedule.end]);


    const projectStats = useMemo(() => {
        const source = filteredRows;
        const total = source.length;
        const completed = source.filter(p => p.status === 'completed').length;
        const inProgress = source.filter(p => p.status === 'in-progress').length;
        const notStarted = source.filter(p => p.status === 'not-started').length;
        return { total, completed, inProgress, notStarted };
    }, [filteredRows]);
    
  useEffect(() => {
    if (!displayUser || !firestore) {
        setIsLoadingTasks(false);
        return;
    }

    setIsLoadingTasks(true);
    const tasksCollection = collection(firestore, 'tasks');
    const q = query(
        tasksCollection, 
        where('assignedTo', '==', displayUser.record)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTasks: Project[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.status !== 'completed') {
                fetchedTasks.push({
                    id: doc.id,
                    projectName: data.projectName || '',
                    taskName: data.taskName || '',
                    taskDescription: data.taskDescription || '',
                    status: data.status || 'not-started',
                    dueDate: data.dueDate || '',
                    assignedBy: data.assignedBy || 'N/A'
                });
            }
        });
        setProjects(fetchedTasks);
        setIsLoadingTasks(false);
    }, (error) => {
        console.error("Error fetching tasks: ", error);
        const permissionError = new FirestorePermissionError({
            path: `tasks`,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch assigned tasks.",
        });
        setIsLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [firestore, displayUser, toast]);

  const handleStatusChange = async (taskId: string, newStatus: Project['status']) => {
    if (!firestore) return;
    if (!isOwner) {
        toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "You can only change the status of your own tasks.",
        });
        return;
    }

    const taskRef = doc(firestore, 'tasks', taskId);
    try {
      await updateDoc(taskRef, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Task status changed to ${newStatus.replace('-', ' ')}.`,
      });
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: `tasks/${taskId}`,
        operation: 'update',
        requestResourceData: { status: newStatus }
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleRowChange = (id: number, field: keyof ProjectRow, value: any) => {
      setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
      setRows([...rows, { id: Date.now(), projectName: '', detail: '', status: 'not-started', startDate: '', endDate: '' }]);
  };

  const handleSave = () => {
      if (!firestore || !currentUser) {
          toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
          return;
      }

      const dataToSave = {
          employeeId: currentUser.record,
          employeeName: currentUser.name,
          fileName: "My Projects",
          projectName: `Projects for ${currentUser.name}`,
          data: {
              category: 'My Projects',
              schedule,
              projects: rows,
              remarks,
          },
          createdAt: serverTimestamp(),
      };

      addDoc(collection(firestore, 'savedRecords'), dataToSave)
          .then(() => toast({ title: 'Record Saved', description: "Your project records have been saved." }))
          .catch(serverError => {
              const permissionError = new FirestorePermissionError({
                  path: `savedRecords`,
                  operation: 'create',
                  requestResourceData: dataToSave,
              });
              errorEmitter.emit('permission-error', permissionError);
          });
  };

  const handleDownload = () => {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
      let yPos = 20;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Project Overview for ${displayUser?.name || 'Employee'}`, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 15;

      doc.setFontSize(10);
      (doc as any).autoTable({
          startY: yPos, theme: 'plain', body: [
              [`Work Schedule Start: ${schedule.start || 'N/A'}`, `Work Schedule End: ${schedule.end || 'N/A'}`]
          ]
      });
      yPos = (doc as any).autoTable.previous.finalY + 10;
      
      (doc as any).autoTable({
          head: [['Project Name', 'Detail', 'Status', 'Start Date', 'End Date']],
          body: filteredRows.map(row => [row.projectName, row.detail, row.status, row.startDate, row.endDate]),
          startY: yPos, theme: 'grid'
      });
      yPos = (doc as any).autoTable.previous.finalY + 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Remarks:', 14, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(remarks, doc.internal.pageSize.width - 28), 14, yPos);
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
      }


      doc.save(`${displayUser?.name}_projects.pdf`);
      toast({ title: 'Download Started', description: 'Your project PDF is being generated.' });
  };
  
  if (!displayUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-4">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="bg-card/90 border-primary/30 shadow-lg">
        <CardHeader className="text-center">
            <>
              <CardTitle className="text-4xl font-headline text-primary font-bold">{displayUser.name}</CardTitle>
              <CardDescription className="text-xl text-primary/90 font-semibold pt-1">Welcome to {formatDepartmentName(displayUser.department)} Panel</CardDescription>
            </>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Use the sidebar to navigate to different sections of the dashboard.</p>
        </CardContent>
      </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>{isOwner ? "My" : `${displayUser.name}'s`} Assigned Tasks</CardTitle>
                <CardDescription>A list of tasks assigned to this employee that are not yet completed.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingTasks ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="ml-4">Loading tasks...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project</TableHead>
                                <TableHead>Task</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Assigned By</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.length === 0 ? (
                            <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No pending tasks assigned.</TableCell>
                            </TableRow>
                            ) : projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>{project.projectName}</TableCell>
                                    <TableCell>{project.taskName}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{project.taskDescription}</TableCell>
                                    <TableCell>{project.dueDate}</TableCell>
                                    <TableCell>{project.assignedBy}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={project.status}
                                            onValueChange={(newStatus: Project['status']) => handleStatusChange(project.id, newStatus)}
                                            disabled={!isOwner}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon status={project.status} />
                                                <SelectValue placeholder="Set status" />
                                            </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                            <SelectItem value="not-started">
                                                <div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" />Not Started</div>
                                            </SelectItem>
                                            <SelectItem value="in-progress">
                                                <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" />In Progress</div>
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />Completed</div>
                                            </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
        
        <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Projects" value={projectStats.total} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Completed" value={projectStats.completed} icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} />
                    <StatCard title="In Progress" value={projectStats.inProgress} icon={<Clock className="h-4 w-4 text-blue-500" />} />
                    <StatCard title="Not Started" value={projectStats.notStarted} icon={<XCircle className="h-4 w-4 text-red-500" />} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isOwner ? "My" : `${displayUser.name}'s`} Project Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="font-semibold">Work Schedule</Label>
                            <div className="flex flex-wrap items-center gap-4">
                                <Input type="date" value={schedule.start} onChange={e => setSchedule({ ...schedule, start: e.target.value })} disabled={!isOwner} className="w-auto"/>
                                <span>to</span>
                                <Input type="date" value={schedule.end} onChange={e => setSchedule({ ...schedule, end: e.target.value })} disabled={!isOwner} className="w-auto"/>
                                {numberOfDays !== null && (
                                    <div className="font-medium text-primary rounded-md px-3 py-2 bg-primary/10">
                                        {numberOfDays} days
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>Detail</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        {isOwner && <TableHead>Action</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRows.map(row => (
                                        <TableRow key={row.id}>
                                            <TableCell><Input value={row.projectName} onChange={e => handleRowChange(row.id, 'projectName', e.target.value)} disabled={!isOwner} /></TableCell>
                                            <TableCell><Textarea value={row.detail} onChange={e => handleRowChange(row.id, 'detail', e.target.value)} rows={1} disabled={!isOwner} /></TableCell>
                                            <TableCell>
                                                <Select value={row.status} onValueChange={(val: ProjectStatus) => handleRowChange(row.id, 'status', val)} disabled={!isOwner}>
                                                    <SelectTrigger className="w-[180px]">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon status={row.status} />
                                                        <SelectValue placeholder="Set status" />
                                                    </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                    <SelectItem value="not-started"><div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" />Not Started</div></SelectItem>
                                                    <SelectItem value="in-progress"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" />In Progress</div></SelectItem>
                                                    <SelectItem value="completed"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />Completed</div></SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell><Input type="date" value={row.startDate} onChange={e => handleRowChange(row.id, 'startDate', e.target.value)} disabled={!isOwner} /></TableCell>
                                            <TableCell><Input type="date" value={row.endDate} onChange={e => handleRowChange(row.id, 'endDate', e.target.value)} disabled={!isOwner} /></TableCell>
                                             {isOwner && <TableCell><div/></TableCell>}
                                        </TableRow>
                                    ))}
                                     {filteredRows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={isOwner ? 6 : 5} className="text-center h-24">
                                                No projects match the current date range.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {isOwner && <Button onClick={addRow} size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Project</Button>}

                        <div className="space-y-2 pt-4">
                            <Label htmlFor="remarks" className="font-semibold">Remarks</Label>
                            <Textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} disabled={!isOwner} />
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-8">
                            {isOwner && <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4"/>Save Record</Button>}
                            <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4"/>Download PDF</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
    </div>
  );
}

export default function EmployeeDashboardPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-4">Loading Page...</span>
      </div>}>
      <MyProjectsComponent />
    </Suspense>
  )
}
