
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, ImagePlus, Trash2, ImageUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

const ChecklistSection = ({ title, items, onCheckboxChange }: { title: string, items: string[], onCheckboxChange: (item: string, checked: boolean) => void }) => (
    <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                    <Checkbox id={item.replace(/\s+/g, '-')} onCheckedChange={(checked) => onCheckboxChange(item, !!checked)} />
                    <Label htmlFor={item.replace(/\s+/g, '-')} className="font-normal">{item}</Label>
                </div>
            ))}
        </div>
    </div>
);

type PictureRow = { 
  id: number; 
  file: File | null;
  previewUrl: string; 
  comment: string; 
};

export default function SiteVisitPage() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [basicInfo, setBasicInfo] = useState({
        siteName: '', city: '', date: '', visitNumber: '', architectName: ''
    });

    const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

    const [observations, setObservations] = useState('');
    const [issues, setIssues] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [pictures, setPictures] = useState<PictureRow[]>([{ id: 1, file: null, previewUrl: '', comment: '' }]);

    const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (item: string, checked: boolean) => {
        setChecklistState(prev => ({...prev, [item]: checked }));
    };

    const addPictureRow = () => setPictures([...pictures, { id: Date.now(), file: null, previewUrl: '', comment: '' }]);
    const removePictureRow = (id: number) => setPictures(pictures.filter(p => p.id !== id));
    
    const handlePictureFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setPictures(pictures.map(p => p.id === id ? { ...p, file, previewUrl } : p));
        }
    };
    
    const handlePictureCommentChange = (id: number, value: string) => {
        setPictures(pictures.map(p => p.id === id ? { ...p, comment: value } : p));
    };

    const checklistSections = {
        'Exterior Works': ['Facade condition', 'External signage installed', 'Outdoor lighting functional', 'Entrance door alignment & quality', 'Branding elements (panels/vinyls) installed'],
        'Flooring': ['Tiles installed as per approved design', 'Tile alignment and leveling', 'Skirting installation', 'Grouting quality', 'Any cracks or damages observed'],
        'Ceiling': ['Gypsum ceiling installed', 'Ceiling paint finish', 'Ceiling height as per plan', 'Access panels installed', 'No moisture / cracks visible'],
        'Lighting': ['All lights installed (LED panels, spotlights, etc.)', 'Emergency lights operational', 'ATM room lighting', 'Customer hall lighting uniformity', 'DB (Distribution Board) labeling'],
        'Furniture & Fixtures': ['Teller counters installed', 'Customer waiting area seating', 'Branch Manager table and chair', 'Cash cabin partitions', 'ATM Lobby furniture', 'Storage cabinetry & drawers', 'File shelving'],
        'Washrooms': ['Floor & wall tiles installed', 'WC & washbasin installed', 'Water pressure & drainage', 'Exhaust fan functional', 'Accessories (soap, tissue, mirrors)'],
        'MEP (Mechanical, Electrical, Plumbing)': ['Electrical wiring completed', 'AC indoor/outdoor units installed & operational', 'Air diffusers installed', 'Fire alarm system installed and tested', 'CCTV cameras installed & positioned properly', 'Plumbing leak test'],
    };

    const handleSave = async () => {
        if (!currentUser || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const checkedItems = Object.entries(checklistState).filter(([, checked]) => checked).map(([item]) => item);

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Site Visit Proforma',
            projectName: basicInfo.siteName || `Site Visit ${basicInfo.date}`,
            data: [
                { category: 'Basic Information', items: Object.entries(basicInfo).map(([k,v]) => `${k}: ${v}`) },
                { category: 'Checklist Items', items: checkedItems },
                { category: 'Observations', items: [observations] },
                { category: 'Issues Identified', items: [issues] },
                { category: 'Actions & Recommendations', items: [recommendations] },
                { category: 'Pictures', items: pictures.map(p => `Comment: ${p.comment}`) }
            ],
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), dataToSave);
            toast({ title: 'Record Saved', description: 'The site visit proforma has been saved.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the record.' });
        }
    };
    
    const handleDownload = async () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Site Visit Proforma – Architect Visit', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        (doc as any).autoTable({
            startY: yPos,
            theme: 'plain',
            head: [['Basic Information']],
            body: Object.entries(basicInfo).map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), value]),
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;
        
        Object.entries(checklistSections).forEach(([title, items]) => {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, yPos);
            yPos += 8;

            const body = items.map(item => [checklistState[item] ? '☑' : '☐', item]);
            (doc as any).autoTable({ startY: yPos, body, theme: 'plain', columnStyles: { 0: { cellWidth: 10 } } });
            yPos = (doc as any).autoTable.previous.finalY + 5;
        });

        const addTextAreaSection = (title: string, content: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, yPos);
            yPos += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(doc.splitTextToSize(content, pageWidth - margin * 2), margin, yPos);
            yPos += doc.splitTextToSize(content, pageWidth - margin * 2).length * 5 + 10;
        };

        addTextAreaSection('8. Observations', observations);
        addTextAreaSection('9. Issues Identified', issues);
        addTextAreaSection('10. Actions & Recommendations', recommendations);
        
        doc.addPage();
        yPos = 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('11. Pictures with Comments', margin, yPos);
        yPos += 8;

        for (const pic of pictures) {
            if (pic.previewUrl) {
                 if (yPos > 180) {
                    doc.addPage();
                    yPos = 20;
                }
                const img = new (window as any).Image();
                img.src = pic.previewUrl;
                await new Promise(resolve => img.onload = resolve);
                
                const imgWidth = 120;
                const imgHeight = (img.height * imgWidth) / img.width;
                const x = (pageWidth - imgWidth) / 2;
                doc.addImage(img, 'JPEG', x, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 5;
                
                doc.setFontSize(10);
                doc.text(pic.comment, pageWidth / 2, yPos, { align: 'center', maxWidth: 160 });
                yPos += doc.splitTextToSize(pic.comment, 160).length * 5 + 10;
            }
        }
        
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }


        doc.save('site-visit-proforma.pdf');
        toast({ title: 'Download Complete', description: 'Site visit proforma has been downloaded.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center font-headline text-2xl text-primary">Detailed Site Visit Proforma – Architect Visit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="p-6 border rounded-lg space-y-4">
                    <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Site / Branch Name" name="siteName" value={basicInfo.siteName} onChange={handleBasicInfoChange} />
                        <Input placeholder="City" name="city" value={basicInfo.city} onChange={handleBasicInfoChange} />
                        <Input type="date" name="date" value={basicInfo.date} onChange={handleBasicInfoChange} />
                        <Input placeholder="Visit Number (e.g., 1, 2, 3)" name="visitNumber" value={basicInfo.visitNumber} onChange={handleBasicInfoChange} />
                        <Input placeholder="Architect Name" name="architectName" value={basicInfo.architectName} onChange={handleBasicInfoChange} />
                    </div>
                </div>

                {Object.entries(checklistSections).map(([title, items]) => (
                    <ChecklistSection key={title} title={title} items={items} onCheckboxChange={handleCheckboxChange} />
                ))}

                <div className="space-y-4">
                    <div><Label className="font-semibold text-lg">8. Observations</Label><Textarea value={observations} onChange={(e) => setObservations(e.target.value)} /></div>
                    <div><Label className="font-semibold text-lg">9. Issues Identified</Label><Textarea value={issues} onChange={(e) => setIssues(e.target.value)} /></div>
                    <div><Label className="font-semibold text-lg">10. Actions & Recommendations</Label><Textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} /></div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-2">11. Pictures with Comments</h3>
                    <div className="space-y-4">
                        {pictures.map((pic, index) => (
                            <div key={pic.id} className="flex flex-col gap-2 p-4 border rounded-lg">
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
                                    <Textarea placeholder="Comment" value={pic.comment} onChange={e => handlePictureCommentChange(pic.id, e.target.value)} rows={1}/>
                                    <Button variant="destructive" size="icon" onClick={() => removePictureRow(pic.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button onClick={addPictureRow} className="mt-2" size="sm" variant="outline"><ImagePlus className="mr-2 h-4 w-4" />Add Picture</Button>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                    <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </CardContent>
        </Card>
    );
}
