
'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';
import { collection, query, orderBy, type Timestamp, FirestoreError, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Edit, Trash2 } from 'lucide-react';
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { getFormUrlFromFileName } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    createdAt: Timestamp;
    data: SavedRecordData[] | Record<string, any>; // Support both old and new formats
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
        [`Date: ${record.createdAt.toDate().toLocaleDateString()}`],
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
                    // Handle cases where item is a JSON string
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
    doc.save(`${record.projectName.replace(/\s+/g, '_')}_${record.fileName.replace(/\s+/g, '_')}.pdf`);
};

export default function SavedRecordsPage() {
    const image = PlaceHolderImages.find(p => p.id === 'saved-records');
    const { firestore, auth } = useFirebase();
    const { user: currentUser, isUserLoading } = useCurrentUser();

    const [records, setRecords] = useState<SavedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<SavedRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!firestore || !auth) return;
        
        const authUnsubscribe = onAuthStateChanged(auth, user => {
            if (user && currentUser) {
                const isAuthorized = ['admin', 'software-engineer', 'ceo'].includes(currentUser.department);
                if (!isAuthorized) {
                    setIsLoading(false);
                    setError("You do not have permission to view this page.");
                    setRecords([]);
                    return;
                }

                const recordsCollection = collection(firestore, 'savedRecords');
                const q = query(recordsCollection, orderBy('createdAt', 'desc'));

                const firestoreUnsubscribe = onSnapshot(q,
                    (querySnapshot) => {
                        const fetchedRecords = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        } as SavedRecord));
                        setRecords(fetchedRecords);
                        setError(null);
                        setIsLoading(false);
                    },
                    (serverError: FirestoreError) => {
                        const permissionError = new FirestorePermissionError({
                            path: `savedRecords`,
                            operation: 'list',
                        });
                        errorEmitter.emit('permission-error', permissionError);
                        setError("Could not fetch records. You might not have the required permissions.");
                        setIsLoading(false);
                    }
                );
                return () => firestoreUnsubscribe();

            } else if (!isUserLoading) {
                 setIsLoading(false);
                 setError("You must be logged in to view records.");
            }
        });
        
        return () => authUnsubscribe();
            
    }, [firestore, auth, currentUser, isUserLoading]);

    const openDeleteDialog = (record: SavedRecord) => {
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!recordToDelete || !firestore) return;

        const docRef = doc(firestore, 'savedRecords', recordToDelete.id);
        try {
            await deleteDoc(docRef);
        } catch (serverError) {
            console.error("Error deleting document:", serverError);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsDeleteDialogOpen(false);
            setRecordToDelete(null);
        }
    };


    if (isLoading || isUserLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4">Verifying access and loading records...</span>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                <DashboardPageHeader
                    title="All Saved Records"
                    description="Access all saved project checklists and documents from all employees."
                    imageUrl={image?.imageUrl || ''}
                    imageHint={image?.imageHint || ''}
                />
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Saved Records</CardTitle>
                        <CardDescription>A list of all documents saved by employees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {error ? (
                             <div className="text-center py-12 text-destructive">
                                <p>{error}</p>
                            </div>
                        ) : records.length === 0 ? (
                           <div className="text-center py-12 text-muted-foreground">
                                <p>No employees have saved any records yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sr.No</TableHead>
                                        <TableHead>Employee Name</TableHead>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((record, index) => {
                                        const formUrl = getFormUrlFromFileName(record.fileName, 'dashboard');
                                        return (
                                            <TableRow key={record.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{record.employeeName}</TableCell>
                                                <TableCell>{record.projectName}</TableCell>
                                                <TableCell>{record.fileName}</TableCell>
                                                <TableCell>{record.createdAt.toDate().toLocaleDateString()}</TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownload(record)}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    {formUrl && (
                                                        <Button asChild variant="ghost" size="icon">
                                                            <Link href={`${formUrl}?id=${record.id}`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(record)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                 </Card>
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

