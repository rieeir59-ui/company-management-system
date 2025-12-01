'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useCurrentUser } from '@/context/UserContext';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { CheckCircle2, Clock, XCircle, Briefcase, PlusCircle, Save, Download, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEmployees } from '@/context/EmployeeContext';
import { type Employee } from '@/lib/employees';
import { onAuthStateChanged } from 'firebase/auth';
import { differenceInDays, parseISO } from 'date-fns';


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

function EmployeeDashboardComponent() {
  const { user: currentUser, isUserLoading } = useCurrentUser();
  const { toast } = useToast();
  const { employees } = useEmployees();
  const searchParams = useSearchParams();
  
  const employeeId = searchParams.get('employeeId');

  const displayUser = useMemo(() => {
    return employeeId ? employees.find(e => e.record === employeeId) : currentUser;
  }, [employeeId, employees, currentUser]);


  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [rows, setRows] = useState<ProjectRow[]>([{ id: 1, projectName: '', detail: '', status: 'not-started', startDate: '', endDate: '' }]);
  const [schedule, setSchedule] = useState({ start: '', end: '' });
  const [remarks, setRemarks] = useState('');
  const [numberOfDays, setNumberOfDays] = useState<number | null>(null);

  const isOwner = currentUser && displayUser && currentUser.record === displayUser.record;

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
    

  const handleRowChange = (id: number, field: keyof ProjectRow, value: any) => {
      setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
      setRows([...rows, { id: Date.now(), projectName: '', detail: '', status: 'not-started', startDate: '', endDate: '' }]);
  };

  const removeRow = (id: number) => {
      setRows(rows.filter(row => row.id !== id));
  };
  
  if (isUserLoading || !displayUser) {
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
      <EmployeeDashboardComponent />
    </Suspense>
  )
}
