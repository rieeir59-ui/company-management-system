
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-primary mb-3 pb-1 border-b border-primary">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export default function ArchitectsFieldReportPage() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({ title: 'Record Saved', description: 'The field report has been saved.' });
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let yPos = 20;

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ISBAH HASSAN & ASSOCIATES', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 5;
        doc.setFontSize(8);
        doc.text('ARCHITECTURAL - ENGINEERING - CONSTRUCTIONS', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("ARCHITECT'S FIELD REPORT", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                [`Project: ${getVal('project')}`, `Field Report No. ${getVal('report_no')}`],
                [`Contract: ${getVal('contract')}`, `Architects Project No: ${getVal('architect_project_no')}`],
                [`Date: ${getVal('date')}`, `Time: ${getVal('time')}`],
                [`Weather: ${getVal('weather')}`, `Tem. Range: ${getVal('temp_range')}`],
                [`Est. % of Completion: ${getVal('completion_pct')}`, `Conformance with Schedule: ${getVal('conformance')}`],
            ],
            styles: { cellPadding: 1 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        const addTextAreaContent = (label: string, id: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.text(label, 14, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            const text = getVal(id);
            const splitText = doc.splitTextToSize(text, doc.internal.pageSize.width - 28);
            doc.text(splitText, 14, yPos);
            yPos += splitText.length * 5 + 5;
        };

        addTextAreaContent('Work in Progress:', 'work_in_progress');
        addTextAreaContent('Present at Site:', 'present_at_site');
        addTextAreaContent('Observations:', 'observations');
        addTextAreaContent('Items to Verify:', 'items_to_verify');
        addTextAreaContent('Information or Action Required:', 'action_required');
        addTextAreaContent('Attachments:', 'attachments');

        yPos += 10;
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.text(`Report By: ${getVal('report_by')}`, 14, yPos);
        yPos += 20;

        const signatureLine = (label: string, x: number) => {
            doc.line(x, yPos, x + 40, yPos);
            yPos += 5;
            doc.text(label, x + 15, yPos);
            yPos -= 5;
        }

        const signatures = ['Owner', 'Architect', 'Contractor', 'Field', 'Other'];
        signatures.forEach((label, index) => {
            if (index > 0 && index % 3 === 0) {
                yPos += 20;
            }
            signatureLine(label, 14 + (index % 3) * 60);
        })


        doc.save('architects-field-report.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <Card>
            <CardHeader className="text-center">
                <p className="font-bold text-primary">ISBAH HASSAN & ASSOCIATES</p>
                <p className="text-sm text-muted-foreground">ARCHITECTURAL - ENGINEERING - CONSTRUCTIONS</p>
                <CardTitle className="font-headline text-3xl text-primary pt-4">Architect's Field Report</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg">
                        <div><Label htmlFor="project">Project</Label><Input id="project" /></div>
                        <div><Label htmlFor="report_no">Field Report No.</Label><Input id="report_no" /></div>
                        <div><Label htmlFor="contract">Contract</Label><Input id="contract" /></div>
                        <div><Label htmlFor="architect_project_no">Architects Project No</Label><Input id="architect_project_no" /></div>
                        <div><Label htmlFor="date">Date</Label><Input id="date" type="date" /></div>
                        <div><Label htmlFor="time">Time</Label><Input id="time" type="time" /></div>
                        <div><Label htmlFor="weather">Weather</Label><Input id="weather" /></div>
                        <div><Label htmlFor="temp_range">Tem. Range</Label><Input id="temp_range" /></div>
                        <div><Label htmlFor="completion_pct">Est. % of Completion</Label><Input id="completion_pct" /></div>
                        <div><Label htmlFor="conformance">Conformance with Schedule</Label><Input id="conformance" /></div>
                    </div>

                    <div className="space-y-6">
                        <div><Label htmlFor="work_in_progress">Work in Progress:</Label><Textarea id="work_in_progress" rows={3} /></div>
                        <div><Label htmlFor="present_at_site">Present at Site:</Label><Textarea id="present_at_site" rows={2} /></div>
                        <div><Label htmlFor="observations">Observations:</Label><Textarea id="observations" rows={4} /></div>
                        <div><Label htmlFor="items_to_verify">Items to Verify:</Label><Textarea id="items_to_verify" rows={3} /></div>
                        <div><Label htmlFor="action_required">Information or Action Required:</Label><Textarea id="action_required" rows={3} /></div>
                        <div><Label htmlFor="attachments">Attachments:</Label><Textarea id="attachments" rows={2} /></div>
                        <div><Label htmlFor="report_by">Report By:</Label><Input id="report_by" /></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-16 pt-8 border-t">
                         <p className="text-muted-foreground">Signatures:</p>
                        <div className="flex justify-end gap-4">
                            <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
