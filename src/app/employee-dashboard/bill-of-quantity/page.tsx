'use client';

import { useState, useMemo } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BillItem {
    id: number;
    srNo: string;
    description: string;
    unit: string;
    qty: number;
    rate: number;
    isHeader: boolean;
}

const initialData: BillItem[] = [
    { id: 1, srNo: '1', description: 'EXCAVATION', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 2, srNo: '', description: 'Excavation for isolated, stripe/combined & Brick foundations in clay and sandy soil including cost of dressing, leveling and compaction in approved manners and disposal of surplus excavated soil away from site, all excavated area will be proof rolled as directed by the Consultant/Engineer incharge.', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 3, srNo: '', description: 'Basement', unit: 'C.FT', qty: 59972, rate: 0, isHeader: false },
    { id: 4, srNo: '', description: 'Ground Floor', unit: 'C.FT', qty: 225, rate: 0, isHeader: false },
    { id: 5, srNo: '2', description: 'BACK FILLING', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 6, srNo: '', description: 'Back Filling including watering and compaction in layers not exceeding 150mm compacted thickness to dry Compaction Test (ASTM D-1557) upto 95% Modified AASHTO by using the borrowed local sand from the local nearby site, as directed by the Consultant/Engineer incharge', unit: 'C.FT', qty: 12000, rate: 0, isHeader: false },
    { id: 7, srNo: '3', description: 'TERMITE PROOFING', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 8, srNo: '', description: 'Providing and applying of Termite Control by spraying FMC Biflex or Mirage 5% SC by Ali Akbar Group in clear water under all floors, excavation including side walls and bottom of all pits & trenches, for footing and under floors.', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 9, srNo: 'a', description: 'Basement', unit: 'S.ft', qty: 5452, rate: 0, isHeader: false },
    { id: 10, srNo: 'b', description: 'Ground Floor', unit: 'S.ft', qty: 6222, rate: 0, isHeader: false },
    { id: 11, srNo: 'c', description: 'First Floor', unit: 'S.ft', qty: 4986, rate: 0, isHeader: false },
    { id: 12, srNo: '4', description: 'PLAIN CEMENT CONCRETE UNDER FOUNDATIONS/FLOOR', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 13, srNo: '', description: "Providing and laying P.C.C plain cement concrete (1:4:8) using ordinary Portland cement chenab sand and Dina stone 1.5'' down as blinding layer under foundations/floor & swimming pool including confining, leveling, compacting and curing etc. complete in all respect finished smooth as directed by the Consultant/Engineer incharge.", unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 14, srNo: 'i', description: 'Basement', unit: 'C.FT', qty: 5452, rate: 0, isHeader: false },
    { id: 15, srNo: 'ii', description: 'Column Foundation', unit: 'C.ft', qty: 125, rate: 0, isHeader: false },
    { id: 16, srNo: '5', description: 'Water Stopper', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 17, srNo: '', description: 'Providing and fixing of water stopper 4mm thick and 229 mm wide poly vinyl chloride ribbed bar by Marflex or approved equivalent installed in the centre of x-section of the concrete structure joint of retaining walls, water tanks and expansion joints complete in all respect as per drawings and as directed by the consultant / Engineer. (9" Decora)', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 18, srNo: 'i', description: 'Basement Wall', unit: 'R.ft', qty: 525, rate: 0, isHeader: false },
    { id: 19, srNo: 'ii', description: 'O.H.W.T', unit: 'R.ft', qty: 60, rate: 0, isHeader: false },
    { id: 20, srNo: '6', description: 'Reinforced Cement Concrete Work (3000 Psi)', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 21, srNo: '', description: "Providing, laying, vibrating, compacting, finishing and curing etc. straight or curved, cast in situ reinforced cement concrete at any floor/height/depth, from ready mix plant, 3000 Psi minimum cylinder compressive strength at 28 days, mix using Ordinary Portland Grey Cement, fine aggregate (100% clean lawrence pur sand ) and sargodah crushed coarse aggregate 3/4'' down graded with approved quality admixture by Sika/Imporient or approved equivalent, including laying through pump, vibrating through electro mechanical vibrators, placing of all pipes and embedded items before concreting curing finishing complete but excluding the cost of steel reinforcement complete in all respect as per drawings and as directed by the Consultant/Engineer incharge", unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 22, srNo: '6.1', description: 'Basement Retaining Walls', unit: 'C.ft', qty: 4050, rate: 0, isHeader: false },
    { id: 23, srNo: '6.2', description: 'Basement Pool Walls', unit: 'C.ft', qty: 1335, rate: 0, isHeader: false },
    { id: 24, srNo: '6.3', description: 'Basement Pool Base', unit: 'C.ft', qty: 473, rate: 0, isHeader: false },
    { id: 25, srNo: '6.4', description: 'Basement water body walls & Base', unit: 'C.ft', qty: 230, rate: 0, isHeader: false },
    { id: 26, srNo: '6.5', description: 'Basement Column Foundations', unit: 'C.ft', qty: 1664, rate: 0, isHeader: false },
    { id: 27, srNo: '6.6', description: 'Basement Column', unit: 'C.ft', qty: 340, rate: 0, isHeader: false },
    { id: 28, srNo: '6.7', description: 'Basement Lintel', unit: 'C.ft', qty: 495, rate: 0, isHeader: false },
    { id: 29, srNo: '6.8', description: 'Basement Slab & Beam', unit: 'C.ft', qty: 4224, rate: 0, isHeader: false },
    { id: 30, srNo: '6.9', description: 'Ground Floor Column Foundations', unit: 'C.ft', qty: 36, rate: 0, isHeader: false },
    { id: 31, srNo: '6.10', description: 'Ground Floor Column', unit: 'C.ft', qty: 425, rate: 0, isHeader: false },
    { id: 32, srNo: '6.11', description: 'Ground Floor Lintel', unit: 'C.ft', qty: 375, rate: 0, isHeader: false },
    { id: 33, srNo: '6.12', description: 'Ground Floor Slab & Beam', unit: 'C.ft', qty: 4800, rate: 0, isHeader: false },
    { id: 34, srNo: '6.13', description: 'First Floor Column', unit: 'C.ft', qty: 375, rate: 0, isHeader: false },
    { id: 35, srNo: '6.14', description: 'First Floor Lintel', unit: 'C.ft', qty: 165, rate: 0, isHeader: false },
    { id: 36, srNo: '6.15', description: 'First Floor Slab & Beam', unit: 'C.ft', qty: 3314, rate: 0, isHeader: false },
    { id: 37, srNo: '6.16', description: 'Basement to first Floor Stair', unit: 'C.ft', qty: 400, rate: 0, isHeader: false },
    { id: 38, srNo: '6.17', description: 'O.H.W.T Base and walls', unit: 'C.ft', qty: 583, rate: 0, isHeader: false },
    { id: 39, srNo: '6.18', description: 'U.G.W.T Base and walls', unit: 'C.ft', qty: 252, rate: 0, isHeader: false },
    { id: 40, srNo: '6.19', description: 'Septic Tank', unit: 'C.ft', qty: 185, rate: 0, isHeader: false },
    { id: 41, srNo: '7', description: 'STEEL REINFORCEMENT', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 42, srNo: '', description: 'Providing fabricating, laying, fixing, Mild Steel deformed bars (non-TMT) grade 60 with minimum yield stress conforming to ASTM specifications A-615. including cost of cutting, bending, placing, binded annealed binding wire 16 guage, removal of rest from bars if any, in specified overlaps, chairs, sports, spacers, wastage, etc. Complete in all respects by an approved source such as Afco steel, Prime steel, Ittefaq steel, Model Steel, City Steel UAE ( if not available, client will specify the alternate brand. Only the lengths shown on Drawings shall be paid for in accordance with the Bar bending schedule prepared the contractors from the drawings and submitted well in advance to the Engineer for the approval, steel lengths from the site multiply by the standard weights will used for the purpose of payment and duly approved by the consultant/Engineer Incharge.', unit: 'Ton', qty: 75, rate: 0, isHeader: false },
    { id: 43, srNo: '8', description: 'Brick Work', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 44, srNo: '8.1', description: 'Providing and laying first class burnt brick work 9"and above thickness to in cement sand mortar (1:5) including all scaffolding, racking out joints and making all flush or groove joints steel dowels at joints to masonry or columns, complete in all respects as per drawing, specifications, and or as directed by the Engineer', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 45, srNo: '8.1.1', description: 'Basement 9" Thick Wall', unit: 'C.ft', qty: 414, rate: 0, isHeader: false },
    { id: 46, srNo: '8.1.2', description: 'Basement 13.50" Thick Wall', unit: 'C.ft', qty: 1384, rate: 0, isHeader: false },
    { id: 47, srNo: '8.1.3', description: 'Ground Floor 15" Thick Wall', unit: 'C.ft', qty: 900, rate: 0, isHeader: false },
    { id: 48, srNo: '8.1.4', description: 'Ground Floor 13.50" Thick Wall', unit: 'C.ft', qty: 1814, rate: 0, isHeader: false },
    { id: 49, srNo: '8.1.5', description: 'Ground Floor 9" Thick Wall', unit: 'C.ft', qty: 1206, rate: 0, isHeader: false },
    { id: 50, srNo: '8.1.6', description: 'First Floor 15" Thick Wall', unit: 'C.ft', qty: 825, rate: 0, isHeader: false },
    { id: 51, srNo: '8.1.7', description: 'First Floor 13.50" Thick Wall', unit: 'C.ft', qty: 354, rate: 0, isHeader: false },
    { id: 52, srNo: '8.1.8', description: 'First Floor 9" Thick Wall', unit: 'C.ft', qty: 2175, rate: 0, isHeader: false },
    { id: 53, srNo: '8.2', description: 'Providing and laying first class burnt brick work 4½" thickness to in cement sand mortar (1:4) including all scaffolding, racking out joints and making all flush or groove joints steel dowels at joints to masonry or columns, complete in all respects as per drawing, specifications, and or as directed by the Engineer.', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 54, srNo: '8.2.1', description: 'Basement Floor', unit: 'S.ft', qty: 3264, rate: 0, isHeader: false },
    { id: 55, srNo: '8.2.2', description: 'Ground Floor', unit: 'S.ft', qty: 960, rate: 0, isHeader: false },
    { id: 56, srNo: '8.2.3', description: 'First Floor', unit: 'S.ft', qty: 528, rate: 0, isHeader: false },
    { id: 57, srNo: '8.2.4', description: 'Boundary Wall', unit: 'S.ft', qty: 3960, rate: 0, isHeader: false },
    { id: 58, srNo: '9', description: 'Plaster Work', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 59, srNo: '', description: 'Supply, mix, apply and cure Cement sand plaster of any height, includes making sharp corners, edges, grooves, all scaffolding. complete in all respects as per drawing, specifications, and or as directed by the Engineer', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 60, srNo: '9.1', description: 'Internal & External Plaster', unit: 'S.ft', qty: 27890, rate: 0, isHeader: false },
    { id: 61, srNo: '10', description: 'Brick Blast', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 62, srNo: '10.1', description: 'Basement Floor', unit: 'C.ft', qty: 1799, rate: 0, isHeader: false },
    { id: 63, srNo: '10.2', description: 'Ground Floor', unit: 'C.ft', qty: 2053, rate: 0, isHeader: false },
    { id: 64, srNo: '10.3', description: 'First Floor', unit: 'C.ft', qty: 1645, rate: 0, isHeader: false },
    { id: 65, srNo: '11', description: 'PCC SUB FLOOR', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 66, srNo: '', description: 'Cement Concrete (1:2:4), including placing, compacting, finishing and curing complete. (Screed Under Floor)', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 67, srNo: '11.1', description: 'Basement Floor', unit: 'C.ft', qty: 1799, rate: 0, isHeader: false },
    { id: 68, srNo: '11.2', description: 'Ground Floor', unit: 'C.ft', qty: 2053, rate: 0, isHeader: false },
    { id: 69, srNo: '11.3', description: 'First Floor', unit: 'C.ft', qty: 1645, rate: 0, isHeader: false },
    { id: 70, srNo: '12', description: 'Roof insulation and water proofing', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 71, srNo: '', description: 'Providing and laying Roof insulation and water proofing to roof consisting of given below of as directed by the Engineer incharge. - Bituminous primer coat.\n- 2-coats of cold applied rubberized bitumen\n- One layer of polythene 500 gauge\n- 1½” thick "extruded polystyrene board" 1½" thick. (density 34 Kg/m³)\n- One layer of polythene 500 gauge\n- 4” thick average mud (compacted thickness).\n- Brick tiles 9”x4-1/2”x1-1/2” laid in cement sand mortar 1:4 and grouted with cement sand mortar 1:3 using 1-part of OPC and 3-parts of clean approved quality sand, complete as per drawings, specifications and instructions of the Consultant.', unit: 'S.ft', qty: 6561, rate: 0, isHeader: false },
    { id: 72, srNo: '13', description: 'D.P.C', unit: '', qty: 0, rate: 0, isHeader: true },
    { id: 73, srNo: '', description: 'Supply, mix, place, cure, compact concrete (1:2:4) 1-1/2" horizontal damp proof course on brick masonry wall includes form work & mixing of rhombic 707 manufactured by MBT in concrete & application of one coat of same chemical on masonry surface before pouring of mixed concrete according to drawings and manufacturers instructions or As directed by the consultant.', unit: '', qty: 0, rate: 0, isHeader: false },
    { id: 74, srNo: 'i', description: 'Ground Floor', unit: 'S.ft', qty: 654, rate: 0, isHeader: false },
];


export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'bill-of-quantity');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();

  const [items, setItems] = useState<BillItem[]>(initialData);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [projectName, setProjectName] = useState('Project BOQ');

  const handleItemChange = (id: number, field: keyof BillItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId, srNo: '', description: '', unit: '', qty: 0, rate: 0, isHeader: false }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  }, [items]);

  const handleSave = () => {
    if (!firestore || !currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
      return;
    }

    const dataToSave = {
        employeeId: currentUser.record,
        employeeName: currentUser.name,
        fileName: 'Bill of Quantity',
        projectName: projectName,
        data: {
            category: 'Bill of Quantity',
            items: items.map(item => JSON.stringify(item)),
        },
        createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'savedRecords'), dataToSave)
        .then(() => {
            toast({ title: 'Record Saved', description: 'The Bill of Quantity has been saved.' });
            setIsSaveOpen(false);
        })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: 'savedRecords',
                operation: 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";

    let yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ISBAH HASSAN & ASSOCIATES', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 7;
    doc.setFontSize(12);
    doc.text('BILL OF QUANTITY', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;
    
    const head = [['Sr. No', 'Description', 'Unit', 'Qty', 'Rate', 'Amount (Rs)']];
    const body = items.map(item => {
        if (item.isHeader) {
            return [{ content: `${item.srNo} ${item.description}`, colSpan: 6, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }];
        }
        return [
            item.srNo,
            item.description,
            item.unit,
            item.qty.toString(),
            item.rate.toFixed(2),
            (item.qty * item.rate).toFixed(2)
        ];
    });

    (doc as any).autoTable({
        head: head,
        body: body,
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [45, 95, 51] },
        didParseCell: (data: any) => {
            const row = items[data.row.index];
            if (row?.isHeader) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = '#f0f0f0';
            }
        }
    });
    
    yPos = (doc as any).autoTable.previous.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL AMOUNT RS: ${totalAmount.toFixed(2)}`, 14, yPos);

    // Add footer to all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save('bill-of-quantity.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Bill Of Quantity"
        description="Manage the bill of quantity for your projects."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-headline text-2xl text-primary">BILL OF QUANTITY</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Sr. No</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24">Unit</TableHead>
                            <TableHead className="w-32">Qty</TableHead>
                            <TableHead className="w-32">Rate</TableHead>
                            <TableHead className="w-40">Amount (Rs)</TableHead>
                            <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id} className={item.isHeader ? 'bg-muted' : ''}>
                                <TableCell>
                                    <Input value={item.srNo} onChange={e => handleItemChange(item.id, 'srNo', e.target.value)} className={item.isHeader ? 'font-bold' : ''} />
                                </TableCell>
                                <TableCell>
                                    <Textarea value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} rows={item.isHeader ? 1 : 4} className={item.isHeader ? 'font-bold' : ''}/>
                                </TableCell>
                                <TableCell><Input value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} /></TableCell>
                                <TableCell><Input type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)} /></TableCell>
                                <TableCell><Input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} /></TableCell>
                                <TableCell>{(item.qty * item.rate).toFixed(2)}</TableCell>
                                <TableCell><Button variant="destructive" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <Button onClick={addItem}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                <div className="text-lg font-bold">TOTAL AMOUNT RS: ${totalAmount.toFixed(2)}</div>
                <div className="flex gap-4">
                     <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Save Record</DialogTitle>
                                <DialogDescription>
                                    Please provide a name for this record.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="recordName">File Name</Label>
                                <Input id="recordName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleSave}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
