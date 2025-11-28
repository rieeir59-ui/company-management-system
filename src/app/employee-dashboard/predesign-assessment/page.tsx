
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const factorsData = {
  humanFactors: {
    title: 'Human Factors',
    items: [
      { label: 'Activities', level: 0 },
      { label: 'Behavior', level: 0 },
      { label: 'Objectives / Goals', level: 0 },
      { label: 'Organization', level: 0 },
      { label: '---Hierarchy', level: 1 },
      { label: '---Groups', level: 2 },
      { label: '---Positions', level: 2 },
      { label: '---Classifications', level: 2 },
      { label: '---Leadership', level: 3 },
      { label: 'Characteristics', level: 0 },
      { label: '(Demographics)', level: 1 },
      { label: 'Social Forces', level: 0 },
      { label: 'Political Forces', level: 0 },
      { label: 'Interactions', level: 0 },
      { label: '---Communication', level: 1 },
      { label: '---Relationships', level: 1 },
      { label: '---Transfer of materials', level: 2 },
      { label: 'Policies / Codes', level: 0 },
      { label: 'Attitudes / Values', level: 0 },
      { label: 'Customs / Beliefs', level: 0 },
      { label: 'Perceptions', level: 0 },
      { label: 'Preferences', level: 0 },
      { label: 'Qualities', level: 0 },
      { label: '---Comfort', level: 1 },
      { label: '---Productivity', level: 2 },
      { label: '---Efficiency', level: 2 },
      { label: '---Security', level: 1 },
      { label: '---Safety', level: 2 },
      { label: '---Access', level: 2 },
      { label: '---Privacy', level: 2 },
      { label: '---Territory', level: 2 },
      { label: '---Control', level: 2 },
      { label: '---Convenience', level: 2 },
    ],
  },
  physicalFactors: {
    title: 'Physical Factors',
    items: [
      { label: 'Location', level: 0 },
      { label: '---Region', level: 1 },
      { label: '---Locality', level: 1 },
      { label: '---Community', level: 1 },
      { label: '---Vicinity', level: 1 },
      { label: 'Site Conditions', level: 0 },
      { label: 'Building / Facility', level: 0 },
      { label: 'Envelope', level: 0 },
      { label: 'Structure', level: 0 },
      { label: 'Systems', level: 0 },
      { label: '---Engineering', level: 1 },
      { label: '---Communications', level: 2 },
      { label: '---Lighting', level: 2 },
      { label: '---Security', level: 2 },
      { label: 'Space', level: 0 },
      { label: '---Types', level: 1 },
      { label: '---Dimensions', level: 1 },
      { label: '---Relationship', level: 1 },
      { label: 'Equipment / Furnishings', level: 0 },
      { label: 'Materials / Finishes', level: 0 },
      { label: 'Support Services', level: 0 },
      { label: '---Storage', level: 1 },
      { label: '---Parking', level: 1 },
      { label: '---Access', level: 1 },
      { label: '---Waste removal', level: 1 },
      { label: '---Utilities (water, sewage, telephone)', level: 1 },
      { label: 'Uses', level: 0 },
      { label: 'Functions', level: 0 },
      { label: 'Behavior / Activity Settings', level: 0 },
      { label: 'Operations', level: 0 },
      { label: 'Circulation', level: 0 },
      { label: 'Environment', level: 0 },
      { label: '---Comfort', level: 1 },
      { label: '---Visual', level: 1 },
      { label: '---Acoustical', level: 1 },
      { label: 'Energy Use / Conservation', level: 0 },
      { label: 'Durability / Flexibility', level: 0 },
    ],
  },
  externalFactors: {
    title: 'External Factors',
    items: [
      { label: 'Legal Restrictions', level: 0 },
      { label: '(Codes / Standards / Regulations)', level: 1 },
      { label: '---Building', level: 2 },
      { label: '---Land use', level: 2 },
      { label: '---Systems', level: 2 },
      { label: '---Energy', level: 2 },
      { label: '---Environment', level: 2 },
      { label: '---Materials', level: 2 },
      { label: '---Safety', level: 2 },
      { label: '---Solar access', level: 1 },
      { label: 'Topography', level: 0 },
      { label: 'Climate', level: 0 },
      { label: 'Ecology', level: 0 },
      { label: 'Resource Availability', level: 0 },
      { label: 'Energy Supplies / Prices', level: 0 },
      { label: '---Conventional', level: 1 },
      { label: '---Solar', level: 1 },
      { label: '---Alternatives', level: 1 },
      { label: 'Economy', level: 0 },
      { label: 'Financing', level: 0 },
      { label: 'Time', level: 0 },
      { label: '---Schedule', level: 1 },
      { label: '---Deadlines', level: 2 },
      { label: '---Operations', level: 2 },
      { label: 'Costs / Budget', level: 0 },
      { label: '---Construction', level: 1 },
      { label: '---Material', level: 2 },
      { label: '---Services', level: 2 },
      { label: '---Operations', level: 2 },
      { label: 'Cost / Benefits', level: 0 },
    ],
  },
};

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const ChecklistItem = ({ item, value, onChange }: { item: { label: string; level: number }, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const inputId = item.label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return (
    <div className="grid grid-cols-2 items-center gap-4 py-2 border-b">
      <Label htmlFor={inputId} className="text-sm" style={{ paddingLeft: `${item.level * 1}rem` }}>{item.label}</Label>
      <Input id={inputId} name={inputId} value={value} onChange={onChange} className="w-full h-8" />
    </div>
  );
};


export default function PredesignAssessmentPage() {
  const { toast } = useToast();
  const [headerInfo, setHeaderInfo] = useState({
    projectName: '',
    architect: '',
    projectNo: '',
    projectDate: ''
  });
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderInfo({ ...headerInfo, [e.target.name]: e.target.value });
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };


  const handleSave = () => {
    toast({
      title: "Record Saved",
      description: "The predesign assessment has been saved.",
    });
  };

  const handleDownload = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PREDESIGN ASSESSMENT', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    doc.autoTable({
        startY: yPos,
        theme: 'plain',
        body: [
            [`Project: ${headerInfo.projectName}`, `Architect: ${headerInfo.architect}`],
            [`Architects Project No: ${headerInfo.projectNo}`, `Project Date: ${headerInfo.projectDate}`],
        ]
    });
    yPos = (doc as any).autoTable.previous.finalY + 10;
    
    Object.values(factorsData).forEach(factor => {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(factor.title, 14, yPos);
        yPos += 8;

        const body = factor.items.map(item => {
            const inputId = item.label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            const value = formValues[inputId] || '';
            return [item.label, value];
        });

        doc.autoTable({
            startY: yPos,
            head: [['Factor', 'Value']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: 0 },
            styles: { fontSize: 9 },
            columnStyles: { 0: { cellWidth: 80 } }
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;
    });


    doc.save('predesign-assessment.pdf');
    toast({
      title: "Download Started",
      description: "Your predesign assessment PDF is being generated.",
    });
  };

  return (
    <Card className="bg-card/90">
      <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl text-primary">PREDESIGN ASSESSMENT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="printable-area p-4 md:p-6 lg:p-8">
            <div className="space-y-4 mb-8 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="project-name" className="font-semibold">Project:</Label>
                        <Input id="project-name" name="projectName" placeholder="(Name, Address)" value={headerInfo.projectName} onChange={handleHeaderChange} />
                    </div>
                     <div>
                        <Label htmlFor="architect" className="font-semibold">Architect:</Label>
                        <Input id="architect" name="architect" value={headerInfo.architect} onChange={handleHeaderChange} />
                    </div>
                    <div>
                        <Label htmlFor="project-no" className="font-semibold">Architects Project No:</Label>
                        <Input id="project-no" name="projectNo" value={headerInfo.projectNo} onChange={handleHeaderChange} />
                    </div>
                    <div>
                        <Label htmlFor="project-date" className="font-semibold">Project Date:</Label>
                        <Input id="project-date" name="projectDate" type="date" value={headerInfo.projectDate} onChange={handleHeaderChange} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.values(factorsData).map((factor) => (
                <div key={factor.title} className="border rounded-lg p-4">
                  <h2 className="font-bold text-center text-xl text-primary border-b pb-2 mb-4">{factor.title}</h2>
                  <div className="space-y-2">
                    {factor.items.map((item, index) => (
                      <ChecklistItem key={index} item={item} value={formValues[item.label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()] || ''} onChange={handleItemChange} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 px-8 pb-8">
          <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
          <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
        </div>
      </CardContent>
    </Card>
  );
}
