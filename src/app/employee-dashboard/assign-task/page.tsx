
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Briefcase, XCircle, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEmployees } from '@/context/EmployeeContext';
import { type Employee } from '@/lib/employees';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';
import { collection, onSnapshot, query, where, doc, deleteDoc, type Timestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const departments = [
    { name: 'ADMIN', slug: 'admin' },
    { name: 'HR', slug: 'hr' },
    { name: 'SOFTWARE ENGINEER', slug: 'software-engineer' },
    { name: 'DRAFTMAN', slug: 'draftman' },
    { name: '3D VISULIZER', slug: '3d-visualizer' },
    { name: 'ARCHITECTS', slug: 'architects' },
    { name: 'FINANCE', slug: 'finance' },
    { name: 'QUANTITY MANAGEMENT', slug: 'quantity-management' },
];

interface Task {
  id: string;
  taskName: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: Timestamp;
  dueDate?: string;
  endDate?: string;
}

function EmployeeCard({ employee }: { employee: Employee }) {
    const { firestore } = useFirebase();
    const [taskStats, setTaskStats] = useState({ total: 0, overdue: 0, inProgress: 0, completed: 0 });

    useEffect(() => {
        if (!firestore) return;

        const tasksCollection = collection(firestore, 'tasks');
        const q = query(tasksCollection, where('assignedTo', '==', employee.record));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let total = 0;
            let overdue = 0;
            let inProgress = 0;
            let completed = 0;
            
            snapshot.forEach(doc => {
                const task = doc.data();
                total++;
                if (task.status === 'completed') {
                    completed++;
                } else if (task.status === 'in-progress') {
                    inProgress++;
                } else if (task.dueDate && new Date(task.dueDate) < new Date()) {
                    overdue++;
                }
            });
            setTaskStats({ total, overdue, inProgress, completed });
        });

        return () => unsubscribe();
    }, [firestore, employee.record]);

    return (
        <div className="flex flex-col">
            <Link href={`/employee-dashboard/assign-task/form?employeeId=${employee.record}`} className="flex-grow">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                        <p className="font-bold text-center">{employee.name.toUpperCase()}</p>
                        <div className="mt-2 text-sm text-muted-foreground space-y-1">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1"><Briefcase size={14} /><span>Tasks</span></div>
                                <span>{taskStats.total}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-1"><XCircle size={14} className="text-red-500" /><span>Overdue</span></div>
                                <span className="text-red-500">{taskStats.overdue}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1"><Clock size={14} className="text-blue-500" /><span>In Progress</span></div>
                                <span className="text-blue-500">{taskStats.inProgress}</span>
                            </div>
                             <div className="flex justify-between items-center">
                               <div className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /><span>Completed</span></div>
                                <span className="text-green-500">{taskStats.completed}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
             <Link href={`/employee-dashboard/my-projects?employeeId=${employee.record}`} className="mt-2 text-center text-sm text-primary hover:underline">
                View Projects
            </Link>
        </div>
    );
}

export default function AssignTaskPage() {
    const { employees, employeesByDepartment } = useEmployees();
    const image = PlaceHolderImages.find(p => p.id === 'assign-task');
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    useEffect(() => {
        if (!firestore) return;

        const q = query(collection(firestore, 'tasks'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(fetchedTasks);
        });

        return () => unsubscribe();
    }, [firestore]);

    const getEmployeeName = (recordId: string) => {
        const employee = employees.find(e => e.record === recordId);
        return employee?.name || recordId;
    };

    const openDeleteDialog = (task: Task) => {
        setTaskToDelete(task);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!taskToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, 'tasks', taskToDelete.id));
            toast({ title: 'Task Deleted', description: `Task "${taskToDelete.taskName}" has been removed.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the task.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setTaskToDelete(null);
        }
    };
    
    return (
        <>
        <div className="space-y-8">
            <DashboardPageHeader
                title="Assign Task"
                description="Select an employee to assign a new task or view their projects."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />
            {departments.map(dept => {
                const deptEmployees = employeesByDepartment[dept.slug] || [];
                if(deptEmployees.length === 0) return null;
                
                return (
                    <div key={dept.slug}>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-headline font-bold text-primary">{dept.name}</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                           {deptEmployees.map(emp => <EmployeeCard key={emp.record} employee={emp} />)}
                        </div>
                    </div>
                )
            })}
             <Card>
                <CardHeader>
                    <CardTitle>All Assigned Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task Name</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Assigned By</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.taskName}</TableCell>
                                    <TableCell>{getEmployeeName(task.assignedTo)}</TableCell>
                                    <TableCell>{task.assignedBy}</TableCell>
                                    <TableCell>{task.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell>{task.dueDate || 'N/A'}</TableCell>
                                    <TableCell>{task.endDate || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(task)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the task "{taskToDelete?.taskName}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
