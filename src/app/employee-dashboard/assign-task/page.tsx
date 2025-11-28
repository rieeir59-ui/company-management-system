
'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Users, Briefcase, XCircle, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEmployees } from '@/context/EmployeeContext';
import { type Employee } from '@/lib/employees';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

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
    const { employeesByDepartment } = useEmployees();
    const image = PlaceHolderImages.find(p => p.id === 'assign-task');
    
    return (
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
        </div>
    );
}
