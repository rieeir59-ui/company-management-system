'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Download, Loader2, Edit, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
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
import { useToast } from '@/hooks/use-toast';
import { useRecords, type SavedRecord } from '@/context/RecordContext';
import { useSearchParams } from 'next/navigation';

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
        [`Date: ${new Date(record.createdAt).toLocaleDateString()}`],
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
                        // Check if it's a JSON string before parsing
                        if (item.trim().startsWith('{') && item.trim().endsWith('}')) {
                            parsedItem = JSON.parse(item);
                            isParsed = true;
                        }
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
    const { records, isLoading, error, deleteRecord } = useRecords();
    const [recordToDelete, setRecordToDelete] = useState<SavedRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const filterParam = searchParams.get('filter');

    useEffect(() => {
        if(filterParam) {
            setSelectedCategory(filterParam);
        } else {
            setSelectedCategory(null);
        }
    }, [filterParam]);

    const openDeleteDialog = (e: React.MouseEvent, record: SavedRecord) => {
        e.stopPropagation();
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!recordToDelete) return;
        deleteRecord(recordToDelete.id);
        setIsDeleteDialogOpen(false);
        setRecordToDelete(null);
    };
    
    const myRecords = useMemo(() => {
      if (!currentUser) return [];
      return records.filter(rec => rec.employeeId === currentUser.record);
    }, [records, currentUser]);


    const groupedRecords = useMemo(() => {
        const source = myRecords;
        const grouped = source.reduce((acc, record) => {
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
    }, [myRecords]);


    if (isLoading || isUserLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4">Loading your records...</span>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                <DashboardPageHeader
                    title="Your Saved Records"
                    description="Access your saved checklists, documents, and forms."
                    imageUrl={image?.imageUrl || ''}
                    imageHint={image?.imageHint || ''}
                />
                
                {error && (
                     <Card className="text-center py-12 bg-destructive/10 border-destructive">
                        <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
                        <CardContent><p className="text-destructive/90">{error}</p></CardContent>
                    </Card>
                )}

                {!isLoading && !error && selectedCategory ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => setSelectedCategory(null)}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>{selectedCategory}</CardTitle>
                                    <CardDescription>Your saved "{selectedCategory}" records.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Name</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedRecords[selectedCategory] && groupedRecords[selectedCategory].length > 0 ? (
                                            groupedRecords[selectedCategory].map(record => {
                                                const formUrl = getFormUrlFromFileName(record.fileName, 'employee-dashboard');
                                                return (
                                                    <TableRow key={record.id} onClick={() => handleDownload(record)} className="cursor-pointer">
                                                        <TableCell className="font-medium">{record.projectName}</TableCell>
                                                        <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
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
                                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                    You have no saved records for this category.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(groupedRecords).map(([fileName, fileRecords]) => {
                           if(fileRecords.length === 0) return null;
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
                 {myRecords.length === 0 && !isLoading && !error && !selectedCategory && (
                    <Card className="text-center py-12">
                        <CardHeader><CardTitle>No Records Found</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">You haven't saved any records yet.</p></CardContent>
                    </Card>
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
