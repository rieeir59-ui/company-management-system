'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Download, Loader2, Edit, Trash2, ArrowLeft, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";
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
import { useCurrentUser } from '@/context/UserContext';
import Link from 'next/link';
import { getFormUrlFromFileName, allFileNames } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cn } from '@/lib/utils';
import { getIconForFile } from '@/lib/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/context/EmployeeContext';


type SavedRecordData = {
    category: string;
    items: (string | Record<string, any>)[];
    [key: string]: any;
};

type SavedRecord = {
    id: string;
    employeeId: string;
    employeeName: string;
    fileName: string;
    projectName: string;
    createdAt: Date;
    data: SavedRecordData[] | Record<string, any>;
};

type TaskRecord = {
    id: string;
    taskName: string;
    projectName: string;
    assignedTo: string;
    assignedBy: string;
    dueDate: string;
    endDate: string;
    status: 'not-started' | 'in-progress' | 'completed';
};

// Dummy Data
const dummyRecords: SavedRecord[] = [
    {id: '1', employeeId: 'EMP-004', employeeName: 'Rabiya Eman', fileName: 'Project Checklist', projectName: 'Alpha Tower', createdAt: new Date(), data: [{category: 'Checklist', items: ['Item 1', 'Item 2']}]},
    {id: '2', employeeId: 'EMP-005', employeeName: 'Imran Abbas', fileName: 'Bill of Quantity', projectName: 'Beta Complex', createdAt: new Date(), data: [{category: 'BOQ', items: ['Cement: 100 bags']}]},
    {id: '3', employeeId: 'EMP-004', employeeName: 'Rabiya Eman', fileName: 'Task Assignment', projectName: 'Alpha Tower - Foundation', createdAt: new Date(), data: [{category: 'Task Assignment', items: ['taskName: Foundation Work', 'assignedTo: Imran Abbas', 'status: in-progress']}]},
];


const StatusIcon = ({ status }: { status: TaskRecord['status'] }) => {
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

const generateDefaultPdf = (doc: jsPDF, record: SavedRecord) => {
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(record.projectName, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    
    const headerData = [
        [`File: ${record.fileName}`],
        [`Saved by: ${record.employeeName}`],
        [`Date: ${record.createdAt.toLocaleDateString()}`],
    ];

    (doc as any).autoTable({
        startY: yPos,
        theme: 'plain',
        body: headerData,
        styles: { fontSize: 10 },
    });

    yPos = (doc as any).autoTable.previous.finalY + 10;
    
    const dataArray = Array.isArray(record.data) ? record.data : [record.data];

    dataArray.forEach((section: any) => {
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }

        const body: (string | number)[][] = [];

        if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item: any) => {
                let parsedItem = {};
                let isParsed = false;
                try {
                    if (typeof item === 'string') {
                        parsedItem = JSON.parse(item);
                        isParsed = true;
                    } else if (typeof item === 'object' && item !== null) {
                        parsedItem = item;
                        isParsed = true;
                    }
                } catch {}

                if (isParsed) {
                     Object.entries(parsedItem).forEach(([key, value]) => {
                        if (typeof value !== 'object' && value !== null && key !== 'id' && key !== 'isHeader') {
                            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            body.push([formattedKey, String(value)]);
                        }
                    });
                } else {
                     const parts = String(item).split(':');
                    if (parts.length > 1) {
                        body.push([parts[0], parts.slice(1).join(':').trim()]);
                    } else {
                        body.push([item, '']);
                    }
                }
            });
        }
        
        if (body.length > 0) {
            (doc as any).autoTable({
                head: [[section.category || 'Details']],
                body: body,
                startY: yPos,
                theme: 'grid',
                headStyles: { fontStyle: 'bold', fillColor: [45, 95, 51], textColor: 255 },
                styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' }
            });
            yPos = (doc as any).autoTable.previous.finalY + 10;
        }
    });
}


const handleDownload = (record: SavedRecord) => {
    const doc = new jsPDF() as any;
    generateDefaultPdf(doc, record);
    doc.output('dataurlnewwindow');
};

export default function SavedRecordsPage() {
    const image = PlaceHolderImages.find(p => p.id === 'saved-records');
    const { user: currentUser, isUserLoading } = useCurrentUser();
    const { toast } = useToast();
    const { employees } = useEmployees();

    const [records, setRecords] = useState<SavedRecord[]>(dummyRecords);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<SavedRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    const openDeleteDialog = (e: React.MouseEvent, record: SavedRecord) => {
        e.stopPropagation();
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!recordToDelete) return;
        setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
        toast({ title: 'Record Deleted', description: 'The record has been deleted (simulation).' });
        setIsDeleteDialogOpen(false);
        setRecordToDelete(null);
    };
    
    const handleStatusChange = async (taskId: string, newStatus: TaskRecord['status']) => {
        setRecords(prevRecords => prevRecords.map(rec => {
            if(rec.id === taskId) {
                const newData = rec.data.map((d: any) => {
                    if (d.category === 'Task Assignment') {
                        return {
                            ...d,
                            items: d.items.map((item: string) => item.startsWith('status:') ? `status: ${newStatus}` : item)
                        }
                    }
                    return d;
                });
                return {...rec, data: newData};
            }
            return rec;
        }));

        toast({
            title: 'Status Updated',
            description: `Task status changed to ${newStatus.replace('-', ' ')}.`,
        });
      };


    const groupedRecords = useMemo(() => {
        const grouped = records.reduce((acc, record) => {
            const fileName = record.fileName;
            if (!acc[fileName]) {
                acc[fileName] = [];
            }
            acc[fileName].push(record);
            return acc;
        }, {} as Record<string, SavedRecord[]>);

        allFileNames.forEach(name => {
            if (!grouped[name]) {
                grouped[name] = [];
            }
        });
        
        return grouped;
    }, [records]);


    if (isLoading || isUserLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4">Verifying access and loading records...</span>
            </div>
        )
    }

    const parseTaskData = (record: SavedRecord): TaskRecord => {
        const items: string[] = Array.isArray(record.data) && record.data[0]?.items ? record.data[0].items : [];
        const findValue = (key: string) => (items.find(item => item.startsWith(key))?.split(':')[1] || '').trim();
        
        return {
            id: record.id,
            taskName: findValue('taskName'),
            projectName: record.projectName,
            assignedTo: findValue('assignedTo'),
            assignedBy: findValue('assignedBy'),
            dueDate: findValue('dueDate'),
            endDate: findValue('endDate'),
            status: (findValue('status') as TaskRecord['status']) || 'not-started',
        };
    };

    return (
        <>
            <div className="space-y-8">
                <DashboardPageHeader
                    title="Saved Records"
                    description="Access all saved project checklists and documents from all employees."
                    imageUrl={image?.imageUrl || ''}
                    imageHint={image?.imageHint || ''}
                />
                
                {error ? (
                    <Card className="text-center py-12 bg-destructive/10 border-destructive">
                        <CardHeader><CardTitle className="text-destructive">Access Denied</CardTitle></CardHeader>
                        <CardContent><p className="text-destructive/90">{error}</p></CardContent>
                    </Card>
                ) : selectedCategory ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => setSelectedCategory(null)}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>{selectedCategory}</CardTitle>
                                    <CardDescription>All records saved as "{selectedCategory}".</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-lg">
                                {selectedCategory === 'Task Assignment' ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Task Name</TableHead>
                                                <TableHead>Project</TableHead>
                                                <TableHead>Assigned To</TableHead>
                                                <TableHead>Assigned By</TableHead>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead>End Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedRecords[selectedCategory].length > 0 ? (
                                                groupedRecords[selectedCategory].map(record => {
                                                    const task = parseTaskData(record);
                                                    return (
                                                        <TableRow key={record.id}>
                                                            <TableCell>{task.taskName}</TableCell>
                                                            <TableCell>{task.projectName}</TableCell>
                                                            <TableCell>{task.assignedTo}</TableCell>
                                                            <TableCell>{task.assignedBy}</TableCell>
                                                            <TableCell>{task.dueDate}</TableCell>
                                                            <TableCell>{task.endDate}</TableCell>
                                                            <TableCell>
                                                                 <Select
                                                                    value={task.status}
                                                                    onValueChange={(newStatus: TaskRecord['status']) => handleStatusChange(task.id, newStatus)}
                                                                >
                                                                    <SelectTrigger className="w-[180px]">
                                                                        <div className="flex items-center gap-2">
                                                                            <StatusIcon status={task.status} />
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
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" onClick={(e) => openDeleteDialog(e, record)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow><TableCell colSpan={8} className="text-center h-24">No records found.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee Name</TableHead>
                                                <TableHead>Project Name</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedRecords[selectedCategory].length > 0 ? (
                                                groupedRecords[selectedCategory].map(record => {
                                                    const formUrl = getFormUrlFromFileName(record.fileName, 'dashboard');
                                                    return (
                                                        <TableRow key={record.id} onClick={() => handleDownload(record)} className="cursor-pointer">
                                                            <TableCell>{record.employeeName}</TableCell>
                                                            <TableCell className="font-medium">{record.projectName}</TableCell>
                                                            <TableCell>{record.createdAt.toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                                    {formUrl && (
                                                                        <Button asChild variant="ghost" size="icon">
                                                                            <Link href={`${formUrl}?id=${record.id}`}>
                                                                                <Edit className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    )}
                                                                    <Button variant="ghost" size="icon" onClick={(e) => openDeleteDialog(e, record)}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                        No records found for this category.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(groupedRecords).map(([fileName, fileRecords]) => {
                           const Icon = getIconForFile(fileName);
                           return (
                            <Card 
                                key={fileName} 
                                className="flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                                onClick={() => setSelectedCategory(fileName)}
                            >
                                <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
                                   <div className="bg-primary/10 p-3 rounded-full">
                                        <Icon className="h-6 w-6 text-primary" />
                                   </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-lg font-semibold">{fileName}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{fileRecords.length} record(s)</p>
                                </CardContent>
                            </Card>
                           )
                        })}
                    </div>
                )}
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the record for "{recordToDelete?.projectName}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
