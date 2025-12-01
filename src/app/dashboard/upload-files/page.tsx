
'use client';

import { useState, useEffect, useCallback } from "react";
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileUp, PlusCircle, Trash2, Building, Home, Hotel, Landmark } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";
import { Label } from "@/components/ui/label";
import { CreatableSelect } from '@/components/ui/creatable-select';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useFileRecords } from "@/context/FileContext";

type FileUpload = {
  id: number;
  file: File | null;
  customName: string;
  bankName?: string;
  isUploading?: boolean;
  progress?: number;
  isUploaded?: boolean;
};

const categories = [
    { name: "Banks", icon: Landmark },
    { name: "Residential", icon: Home },
    { name: "Commercial", icon: Building },
    { name: "Hotels", icon: Hotel }
];
const initialBanks = ["MCB", "DIB", "FAYSAL", "UBL", "HBL", "Askari Bank", "Bank Alfalah", "Bank Al Habib", "CBD"];

const UploadForm = ({ category }: { category: string }) => {
    const [uploads, setUploads] = useState<FileUpload[]>([{ id: 1, file: null, customName: '', bankName: '', isUploading: false, progress: 0, isUploaded: false }]);
    const [banks, setBanks] = useState<string[]>(initialBanks);
    const { toast } = useToast();
    const { user: currentUser } = useCurrentUser();
    const { addFileRecord } = useFileRecords();

    const handleSingleFileUpload = useCallback((upload: FileUpload) => {
        if (!upload.file || !currentUser || upload.isUploaded) return;

        const newRecord = {
            id: String(Date.now()), // Ensure unique ID
            category: category,
            bankName: upload.bankName,
            customName: upload.customName,
            originalName: upload.file!.name,
            fileType: upload.file!.type,
            size: upload.file!.size,
            createdAt: new Date(),
            employeeName: currentUser.name,
            employeeId: currentUser.record,
            fileUrl: URL.createObjectURL(upload.file!)
        };
        addFileRecord(newRecord);
        
        // Mark as uploaded immediately to prevent re-adding
        setUploads(prev => prev.map(up => up.id === upload.id ? { ...up, isUploaded: true } : up));

        toast({ title: 'File Uploaded', description: `"${upload.customName}" has been successfully uploaded.` });

        // Set a timeout to remove the completed upload from the UI
        setTimeout(() => {
            setUploads(prev => {
                const remaining = prev.filter(up => up.id !== upload.id);
                return remaining.length > 0 ? remaining : [{ id: Date.now(), file: null, customName: '', bankName: '', isUploading: false, progress: 0, isUploaded: false }];
            });
        }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, currentUser, toast]);

    useEffect(() => {
        uploads.forEach(upload => {
            if (upload.progress === 100 && !upload.isUploaded) {
                handleSingleFileUpload(upload);
            }
        });
    }, [uploads, handleSingleFileUpload]);

    const handleFileChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            setUploads(prev => prev.map(up => up.id === id ? { ...up, file, customName: up.customName || file.name } : up));
        }
    };

    const handleFieldChange = (id: number, field: keyof FileUpload, value: string) => {
        setUploads(prev => prev.map(up => (up.id === id ? { ...up, [field]: value } : up)));
    };

    const addFileUpload = () => {
        setUploads(prev => [...prev, { id: Date.now(), file: null, customName: '', bankName: '', isUploading: false, progress: 0, isUploaded: false }]);
    };

    const removeFileUpload = (id: number) => {
        setUploads(prev => prev.filter(up => up.id !== id));
    };

    const handleCreateBank = (newBank: string) => {
        if (!banks.find(b => b.toLowerCase() === newBank.toLowerCase())) {
            setBanks(prev => [...prev, newBank]);
        }
    };

    const handleUpload = (upload: FileUpload) => {
        if (!upload.file || !upload.customName) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a custom name and choose a file.' });
            return;
        }
        if (category === 'Banks' && !upload.bankName) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a bank name for the Banks category.' });
            return;
        }
        if (!currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }
        
        setUploads(prev => prev.map(up => up.id === upload.id ? { ...up, isUploading: true, progress: 0 } : up));
        
        const interval = setInterval(() => {
            setUploads(prev => prev.map(up => {
                if (up.id === upload.id && up.isUploading) {
                    const newProgress = (up.progress || 0) + 10;
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        return { ...up, isUploading: false, progress: 100 };
                    }
                    return { ...up, progress: newProgress };
                }
                return up;
            }));
        }, 200);
    };

    return (
        <div className="space-y-4 mt-4">
            {uploads.map((upload) => (
                <div key={upload.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-end gap-4 p-4 border rounded-lg relative bg-muted/50">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeFileUpload(upload.id)} disabled={upload.isUploading}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                    {category === 'Banks' && (
                        <div className="space-y-2">
                            <Label htmlFor={`bank-${upload.id}`}>Bank Name</Label>
                             <CreatableSelect
                                options={banks}
                                value={upload.bankName}
                                onChange={(value) => handleFieldChange(upload.id, 'bankName', value)}
                                onCreate={handleCreateBank}
                                placeholder="Select or create a bank"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor={`name-${upload.id}`}>File Name</Label>
                        <Input id={`name-${upload.id}`} placeholder="Enter a custom name" value={upload.customName} onChange={e => handleFieldChange(upload.id, 'customName', e.target.value)} disabled={upload.isUploading} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`file-${upload.id}`}>Select File</Label>
                        <Input id={`file-${upload.id}`} type="file" onChange={(e) => handleFileChange(upload.id, e)} disabled={upload.isUploading} />
                    </div>
                    
                    <div className="lg:col-span-3">
                        {upload.isUploading && <Progress value={upload.progress} className="w-full h-2 mb-2" />}
                        <Button onClick={() => handleUpload(upload)} className="w-full" disabled={!upload.file || upload.isUploading}>
                            <FileUp className="mr-2 h-4 w-4" />
                            {upload.isUploading ? `Uploading... ${upload.progress?.toFixed(0)}%` : 'Upload'}
                        </Button>
                    </div>

                </div>
            ))}
            <Button variant="outline" onClick={addFileUpload}>
                <PlusCircle className="mr-2 h-4 w-4" />Add Another File
            </Button>
        </div>
    );
};

export default function UploadFilesPage() {
    const image = PlaceHolderImages.find(p => p.id === 'upload-files');
    const [selectedCategory, setSelectedCategory] = useState<string>('Banks');

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Upload Files"
                description="Upload project documents, images, or other files."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Select a Category</CardTitle>
                    <CardDescription>Choose a category to upload files to.</CardDescription>
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

                    {selectedCategory && (
                        <div className="mt-8">
                             <h2 className="text-2xl font-bold mb-4">Upload to {selectedCategory}</h2>
                             <UploadForm category={selectedCategory} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
