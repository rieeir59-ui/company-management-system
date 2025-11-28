
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, PlusCircle, Trash2, ImageUp, FileSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface Personnel {
  id: number;
  name: string;
  designation: string;
}

interface Picture {
  id: number;
  file: File | null;
  previewUrl: string;
  description: string;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function SiteSurveyReportPage() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [bankName, setBankName] = useState('HABIB BANK LIMITED');
    const [branchName, setBranchName] = useState('EXPO CENTER BRANCH, LAHORE');
    const [reportDate, setReportDate] = useState(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [surveyDate, setSurveyDate] = useState(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [personnel, setPersonnel] = useState<Personnel[]>([
        { id: 1, name: 'Mr. Raja Waseem', designation: 'Assistant Architect - KS & Associates' },
        { id: 2, name: 'Mr. Muhammad Awais', designation: 'Engineer – KS & Associates' }
    ]);
    const [observations, setObservations] = useState(
        "1- The said building is located at Abdul-Haq Road at Expo Center, Lahore.\n2- There are buildings on branch’s left & right sides and a house on back side.\n3- Existing HBL branch is present on ground floor with covered area of 3102 sft.\n4- Building construction is a composite structure in RCC columns & beams and load bearing brick walls.\n5- Parking space is available in front of the building.\n6- The branch's plinth level is at +1’-3’’ from the road level.\n7- The said branch is equipped with electricity, water supply and drainage connection.\n8- Emergency exit is not available at present but it can be provided towards branch’s right or back side passage.\n9- Kitchen cabinets are damaged.\n10- Generator is placed on branch’s back side passage.\n11- AC outdoor units are installed on branch rights side external wall and on roof top.\n12- Solar system can be installed on the roof top and its load calculation will be applicable at the time of solar system design.\n13- Water tank is placed on roof top.\n14- There is no staircase available to access the rooftop.\n15- Roof waterproofing is missing, which is causing moisture penetration from the wall and slab joints. Roof waterproofing work needs to be done to avoid seepage into the building.\n16- Most of the walls in the branch are heavily moisturized with the rain water coming from roof top because of missing roof waterproofing. PVC cladding is done on the walls to cover the dampness.\n17- Cracks are visible on the building boundary walls and tuff pavers are damaged in side passages.\n18- Roof parapet wall is showing cracks and needs serious maintenance.\n19- All openings made in slab for piping & cabling work needs to be sealed and waterproofed properly."
    );
    const [recommendations, setRecommendations] = useState(
        "Although, most of the walls inside branch are cladded with PVC panels to avoid dampness which is being caused by rain water ingress from the joints as roof waterproofing is missing. Referring to Site Survey Form Item no. D-7, structural stability evaluation is not done. Apparently, structure seems stable and the site itself is at a good location. We would recommend Bank may purchase the property for its use provided that all of the highlighted above remedial points are taken care of."
    );
    const [pictures, setPictures] = useState<Picture[]>([]);

    const addPersonnel = () => {
        setPersonnel([...personnel, { id: Date.now(), name: '', designation: '' }]);
    };
    const removePersonnel = (id: number) => {
        setPersonnel(personnel.filter(p => p.id !== id));
    };
    const handlePersonnelChange = (id: number, field: 'name' | 'designation', value: string) => {
        setPersonnel(personnel.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    
    const addPicture = () => {
        setPictures([...pictures, { id: Date.now(), file: null, previewUrl: '', description: '' }]);
    };
    const removePicture = (id: number) => {
        setPictures(pictures.filter(p => p.id !== id));
    };
    const handlePictureFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setPictures(pictures.map(p => p.id === id ? { ...p, file, previewUrl } : p));
        }
    };
     const handlePictureDescChange = (id: number, value: string) => {
        setPictures(pictures.map(p => p.id === id ? { ...p, description: value } : p));
    };


    const handleSave = async () => {
        if (!currentUser || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Site Survey Report',
            projectName: branchName || `Survey Report ${reportDate}`,
            data: [
                { category: 'Report Details', items: [`Bank: ${bankName}`, `Branch: ${branchName}`, `Report Date: ${reportDate}`, `Survey Date: ${surveyDate}`] },
                { category: 'Personnel Present', items: personnel.map(p => `${p.name} (${p.designation})`) },
                { category: 'Observations', items: [observations] },
                { category: 'Recommendations', items: [recommendations] },
                { category: 'Pictures', items: pictures.map(p => `Image: ${p.previewUrl}, Description: ${p.description}`) }
            ],
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), dataToSave);
            toast({ title: "Record Saved", description: "The site survey report has been saved." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the record.' });
        }
    };

    const handleDownloadPdf = async () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(bankName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.text(branchName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 12;

        doc.setFontSize(14);
        doc.text('Site Survey Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.setFontSize(12);
        doc.text(reportDate, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFont('helvetica', 'bold');
        doc.text('SITE SURVEY DATE:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${surveyDate}`, margin + 5, yPos);
        yPos += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('PERSONNEL PRESENT DURING SITE VISIT:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        personnel.forEach(p => {
            doc.text(`• ${p.name}`, margin + 5, yPos);
            doc.text(`(${p.designation})`, margin + 80, yPos);
            yPos += 7;
        });
        yPos += 5;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Pictorial Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        
        for (const pic of pictures) {
            if (pic.previewUrl && pic.file) {
                 if (yPos > 180) { // Check if space is enough for image + text
                    doc.addPage();
                    yPos = 20;
                }
                const img = new (window as any).Image();
                img.src = pic.previewUrl;
                await new Promise(resolve => img.onload = resolve);
                
                const imgWidth = 120;
                const imgHeight = (img.height * imgWidth) / img.width;
                const x = (pageWidth - imgWidth) / 2;
                
                const fileType = pic.file.type.split('/')[1]?.toUpperCase();
                if (!fileType || !['JPG', 'JPEG', 'PNG'].includes(fileType)) {
                    console.error('Unsupported image type for PDF:', pic.file.type);
                    continue;
                }
                
                doc.addImage(img, fileType, x, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 5;
                
                doc.setFontSize(10);
                doc.text(pic.description, pageWidth / 2, yPos, { align: 'center', maxWidth: 160 });
                yPos += doc.splitTextToSize(pic.description, 160).length * 5 + 10;
            }
        }
        
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('OBSERVATIONS AND REMARKS BY KS & ASSOCIATES:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        const obsLines = doc.splitTextToSize(observations, pageWidth - (margin * 2));
        doc.text(obsLines, margin, yPos);
        yPos += obsLines.length * 5 + 10;
        
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMENDATION:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        const recLines = doc.splitTextToSize(recommendations, pageWidth - (margin * 2));
        doc.text(recLines, margin, yPos);
        yPos += recLines.length * 5 + 10;

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }


        doc.save('Site_Survey_Report.pdf');
        toast({ title: "Download Started", description: "Your Site Survey Report is being generated." });
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle className="text-center font-headline text-3xl text-primary flex items-center justify-center gap-2"><FileSearch />Site Survey Report</CardTitle>
            </CardHeader>
            <CardContent className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <Input className="text-2xl font-bold text-center border-0 focus-visible:ring-1" value={bankName} onChange={e => setBankName(e.target.value)} />
                    <Input className="text-xl text-center border-0 focus-visible:ring-1" value={branchName} onChange={e => setBranchName(e.target.value)} />
                    <Input className="text-lg text-muted-foreground text-center border-0 focus-visible:ring-1" value={reportDate} onChange={e => setReportDate(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                    <Label className="font-bold text-lg">SITE SURVEY DATE:</Label>
                    <Input value={surveyDate} onChange={e => setSurveyDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-lg">PERSONNEL PRESENT DURING SITE VISIT:</Label>
                    {personnel.map(p => (
                        <div key={p.id} className="flex items-center gap-2">
                            <Input placeholder="Name" value={p.name} onChange={e => handlePersonnelChange(p.id, 'name', e.target.value)} className="flex-1" />
                            <Input placeholder="Designation" value={p.designation} onChange={e => handlePersonnelChange(p.id, 'designation', e.target.value)} className="flex-1" />
                            <Button variant="ghost" size="icon" onClick={() => removePersonnel(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addPersonnel}><PlusCircle className="mr-2 h-4 w-4" />Add Personnel</Button>
                </div>
                
                 <div className="space-y-4">
                    <Label className="font-bold text-lg">Pictorial Report</Label>
                    {pictures.map((pic, index) => (
                        <Card key={pic.id} className="p-4">
                            <div className="flex flex-col gap-4">
                                <Label htmlFor={`pic-upload-${pic.id}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                    {pic.previewUrl ? (
                                        <Image src={pic.previewUrl} alt={`Preview ${index + 1}`} width={100} height={100} className="h-full w-auto object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageUp className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500">JPG, PNG</p>
                                        </div>
                                    )}
                                    <Input id={`pic-upload-${pic.id}`} type="file" accept="image/jpeg, image/png" className="hidden" onChange={e => handlePictureFileChange(pic.id, e)} />
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Textarea placeholder={`Description for picture ${index + 1}...`} value={pic.description} onChange={e => handlePictureDescChange(pic.id, e.target.value)} rows={2} />
                                  <Button variant="destructive" size="icon" onClick={() => removePicture(pic.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    <Button variant="outline" size="sm" onClick={addPicture}><PlusCircle className="mr-2 h-4 w-4" />Add Image</Button>
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-lg">OBSERVATIONS AND REMARKS:</Label>
                    <Textarea value={observations} onChange={e => setObservations(e.target.value)} rows={15} />
                </div>
                
                <div className="space-y-2">
                    <Label className="font-bold text-lg">RECOMMENDATION:</Label>
                    <Textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} rows={5} />
                </div>

                <div className="flex justify-end gap-4 pt-8">
                    <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" />Save</Button>
                    <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
                </div>
            </CardContent>
        </Card>
    );
}
