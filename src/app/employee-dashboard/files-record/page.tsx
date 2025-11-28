
'use client';

import { useEffect, useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Loader2, Landmark, Home, Building, Hotel } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc, updateDoc, type Timestamp, FirestoreError } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { useCurrentUser } from '@/context/UserContext';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type UploadedFile = {
    id: string;
    category: string;
    bankName?: string;
    customName: string;
    originalName: string;
    fileType: string;
    size: number;
    createdAt: Timestamp;
    employeeName: string;
    fileUrl?: string;
};

const categories = [
    { name: "Banks", icon: Landmark },
    { name: "Residential", icon: Home },
    { name: "Commercial", icon: Building },
    { name: "Hotels", icon: Hotel }
];

export default function FilesRecordPage() {
  const image = PlaceHolderImages.find(p => p.id === 'files-record');
  const { toast } = useToast();
  const { firestore, firebaseApp, auth } = useFirebase();
  const { user: currentUser, isUserLoading } = useCurrentUser();
  const storage = getStorage(firebaseApp);

  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [fileToEdit, setFileToEdit] = useState<UploadedFile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !firestore) {
      setIsLoading(false);
      setError("Firebase services are not available.");
      return;
    }

    setIsLoading(true);

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && currentUser) {
        const q = query(
          collection(firestore, "uploadedFiles"),
          where("employeeId", "==", currentUser.record),
          orderBy("createdAt", "desc")
        );

        const firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
          const allFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UploadedFile));
          
          const groupedFiles: Record<string, UploadedFile[]> = {};
          categories.forEach(category => {
              groupedFiles[category.name] = allFiles.filter(file => file.category === category.name);
          });

          setFiles(groupedFiles);
          setError(null);
          setIsLoading(false);
        }, (err: FirestoreError) => {
          setError("Failed to fetch your files. You may not have permission.");
          console.error(err);
          setIsLoading(false);
        });

        return () => firestoreUnsubscribe();
      } else {
        setFiles({});
        setError("You must be logged in to view your records.");
        setIsLoading(false);
      }
    });

    return () => authUnsubscribe();
  }, [firestore, auth, currentUser]);
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const openDeleteDialog = (file: UploadedFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!fileToDelete || !firestore || !storage) return;

    if (fileToDelete.fileUrl) {
        try {
            const fileRef = ref(storage, fileToDelete.fileUrl);
            await deleteObject(fileRef);
        } catch (storageError: any) {
            if (storageError.code !== 'storage/object-not-found') {
                console.error("Error deleting file from Storage:", storageError);
                toast({ variant: 'destructive', title: 'Storage Error', description: 'Could not delete the file from storage.' });
            }
        }
    }
    
    try {
        await deleteDoc(doc(firestore, 'uploadedFiles', fileToDelete.id));
        toast({ title: 'Success', description: `File record for "${fileToDelete.customName}" deleted.` });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete file record from database.' });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };
  
  const openEditDialog = (file: UploadedFile) => {
    setFileToEdit(file);
    setNewFileName(file.customName);
    setIsEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!fileToEdit || !newFileName || !firestore) return;
    try {
      await updateDoc(doc(firestore, 'uploadedFiles', fileToEdit.id), {
        customName: newFileName
      });
      toast({ title: 'Success', description: 'File name updated.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update file name.' });
    } finally {
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Your Files Record"
        description="View and manage your uploaded project files."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      {isLoading || isUserLoading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : error ? (
        <Card className="text-center py-8"><CardContent><p className="text-destructive">{error}</p></CardContent></Card>
      ) : (
        <Card>
           <CardHeader>
              <CardTitle>Select a Category</CardTitle>
              <CardDescription>Choose a category to view its files.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(({ name, icon: Icon }) => (
                    <Card
                        key={name}
                        className={cn(
                            "p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent hover:border-primary transition-all",
                            selectedCategory === name ? "bg-accent border-primary ring-2 ring-primary" : ""
                        )}
                        onClick={() => setSelectedCategory(name)}
                    >
                        <Icon className="w-12 h-12 text-primary" />
                        <p className="font-semibold text-lg">{name}</p>
                    </Card>
                ))}
            </div>

            {selectedCategory && (files[selectedCategory]?.length > 0 ? (
                <div className="mt-8">
                     <CardHeader>
                        <CardTitle>{selectedCategory} Files</CardTitle>
                        <CardDescription>Documents you uploaded under the {selectedCategory.toLowerCase()} category.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left">
                                    <tr className="border-b">
                                        <th className="p-2">File Name</th>
                                        {selectedCategory === 'Banks' && <th className="p-2">Bank</th>}
                                        <th className="p-2">Original Name</th>
                                        <th className="p-2">Size</th>
                                        <th className="p-2">Date</th>
                                        <th className="p-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files[selectedCategory].map(file => (
                                        <tr key={file.id} className="border-b">
                                            <td className="p-2 font-medium">
                                                <Link href={file.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                                    {file.customName}
                                                </Link>
                                            </td>
                                            {selectedCategory === 'Banks' && <td className="p-2">{file.bankName || 'N/A'}</td>}
                                            <td className="p-2 text-muted-foreground">{file.originalName}</td>
                                            <td className="p-2">{formatBytes(file.size)}</td>
                                            <td className="p-2">{file.createdAt.toDate().toLocaleDateString()}</td>
                                            <td className="p-2 flex gap-1 justify-end">
                                                <Button asChild variant="ghost" size="icon">
                                                    <a href={file.fileUrl || '#'} target="_blank" rel="noopener noreferrer" download={file.originalName}>
                                                        <Download className="h-4 w-4"/>
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(file)}><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(file)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </div>
            ) : selectedCategory && (
                 <Card className="text-center py-12 mt-8">
                    <CardHeader>
                        <CardTitle>No Files Found</CardTitle>
                        <CardDescription>You have not uploaded any files to the "{selectedCategory}" category yet.</CardDescription>
                    </CardHeader>
                </Card>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the file "{fileToDelete?.customName}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit File Name</DialogTitle>
                <DialogDescription>
                    Change the custom name for "{fileToEdit?.originalName}".
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
                <Label htmlFor="edit-name">Custom File Name</Label>
                <Input id="edit-name" value={newFileName} onChange={e => setNewFileName(e.target.value)} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={confirmEdit}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
