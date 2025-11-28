
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type AgendaItem = {
    id: number;
    timeAllotted: string;
    topic: string;
    presenter: string;
    discussion: string;
    conclusions: string;
    actionItems: { id: number; task: string; person: string; deadline: string }[];
};

const initialAgendaItem: Omit<AgendaItem, 'id'> = {
    timeAllotted: '', topic: '', presenter: '', discussion: '', conclusions: '', actionItems: [{ id: 1, task: '', person: '', deadline: '' }]
};

export default function MinutesOfMeetingsPage() {
    const { toast } = useToast();
    const [agenda, setAgenda] = useState<AgendaItem[]>([{ id: 1, ...initialAgendaItem }]);

    const addAgendaItem = () => setAgenda([...agenda, { id: Date.now(), ...initialAgendaItem }]);
    const removeAgendaItem = (id: number) => setAgenda(agenda.filter(item => item.id !== id));
    
    const handleAgendaChange = (id: number, field: keyof AgendaItem, value: string) => {
        setAgenda(agenda.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addActionItem = (agendaId: number) => {
        setAgenda(agenda.map(item => 
            item.id === agendaId 
            ? { ...item, actionItems: [...item.actionItems, { id: Date.now(), task: '', person: '', deadline: '' }] }
            : item
        ));
    };
    
    const removeActionItem = (agendaId: number, actionId: number) => {
        setAgenda(agenda.map(item => 
            item.id === agendaId 
            ? { ...item, actionItems: item.actionItems.filter(ai => ai.id !== actionId) }
            : item
        ));
    };

    const handleActionItemChange = (agendaId: number, actionId: number, field: 'task' | 'person' | 'deadline', value: string) => {
        setAgenda(agenda.map(item => 
            item.id === agendaId 
            ? { ...item, actionItems: item.actionItems.map(ai => ai.id === actionId ? { ...ai, [field]: value } : ai) }
            : item
        ));
    };

    const handleSave = () => {
        toast({ title: 'Record Saved', description: 'The minutes of meeting have been saved.' });
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let yPos = 20;

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("MINUTES OF MEETING", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;
        
        doc.setFontSize(10);
        doc.autoTable({
            startY: yPos,
            theme: 'plain',
            body: [
                [`Project: ${getVal('project')}`],
                [`Meeting Date: ${getVal('meeting_date')}`, `Meeting Time: ${getVal('meeting_time')}`, `Meeting Location: ${getVal('meeting_location')}`],
                [`Meeting Called By: ${getVal('called_by')}`, `Type of Meeting: ${getVal('type_of_meeting')}`],
                [`Facilitator: ${getVal('facilitator')}`, `Note Taker: ${getVal('note_taker')}`, `Timekeeper: ${getVal('timekeeper')}`]
            ]
        });
        yPos = (doc as any).lastAutoTable.finalY + 5;
        
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

        addTextAreaContent('Attendees:', 'attendees');
        
        agenda.forEach((item, index) => {
             if (yPos > 240) { doc.addPage(); yPos = 20; }
             doc.setLineWidth(0.5);
             doc.line(14, yPos, doc.internal.pageSize.width - 14, yPos);
             yPos += 8;

             doc.setFont('helvetica', 'bold');
             doc.text(`Agenda Topic ${index + 1}: ${item.topic}`, 14, yPos);
             doc.text(`Presenter: ${item.presenter}`, 100, yPos);
             doc.text(`Time: ${item.timeAllotted}`, 160, yPos);
             yPos += 8;

             doc.setFont('helvetica', 'bold'); doc.text('Discussion:', 14, yPos);
             doc.setFont('helvetica', 'normal'); doc.text(item.discussion, 40, yPos);
             yPos += 10;
             
             doc.setFont('helvetica', 'bold'); doc.text('Conclusions:', 14, yPos);
             doc.setFont('helvetica', 'normal'); doc.text(item.conclusions, 40, yPos);
             yPos += 10;
            
             doc.setFont('helvetica', 'bold'); doc.text('Action Items:', 14, yPos);
             yPos += 5;
             doc.autoTable({
                 head: [['Action Item', 'Person Responsible', 'Deadline']],
                 body: item.actionItems.map(ai => [ai.task, ai.person, ai.deadline]),
                 startY: yPos,
                 theme: 'grid',
                 headStyles: { fillColor: [220, 220, 220], textColor: 20 },
                 margin: { left: 14 }
             });
             yPos = (doc as any).lastAutoTable.finalY + 10;
        });

        if (yPos > 240) { doc.addPage(); yPos = 20; }
        addTextAreaContent('Observers:', 'observers');
        addTextAreaContent('Resource Persons:', 'resource_persons');
        addTextAreaContent('Special Notes:', 'special_notes');

        doc.save('minutes-of-meeting.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <Card>
            <CardHeader><CardTitle className="font-headline text-3xl text-primary text-center">Minutes of Meeting</CardTitle></CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg">
                        <div className="lg:col-span-3"><Label htmlFor="project">Project</Label><Input id="project" /></div>
                        <div><Label htmlFor="meeting_date">Meeting Date</Label><Input type="date" id="meeting_date"/></div>
                        <div><Label htmlFor="meeting_time">Meeting Time</Label><Input type="time" id="meeting_time"/></div>
                        <div><Label htmlFor="meeting_location">Meeting Location</Label><Input id="meeting_location"/></div>
                        <div><Label htmlFor="called_by">Meeting Called By</Label><Input id="called_by"/></div>
                        <div><Label htmlFor="type_of_meeting">Type of Meeting</Label><Input id="type_of_meeting"/></div>
                        <div><Label htmlFor="facilitator">Facilitator</Label><Input id="facilitator"/></div>
                        <div><Label htmlFor="note_taker">Note Taker</Label><Input id="note_taker"/></div>
                        <div><Label htmlFor="timekeeper">Timekeeper</Label><Input id="timekeeper"/></div>
                    </div>
                    
                    <div><Label htmlFor="attendees">Attendees</Label><Textarea id="attendees" /></div>
                    
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-primary border-b pb-2">Agenda Topics</h3>
                        {agenda.map((item, index) => (
                             <Card key={item.id} className="p-4 relative bg-muted/50">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeAgendaItem(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><Label htmlFor={`topic-${item.id}`}>Agenda Topic</Label><Input id={`topic-${item.id}`} value={item.topic} onChange={e => handleAgendaChange(item.id, 'topic', e.target.value)} /></div>
                                        <div><Label htmlFor={`presenter-${item.id}`}>Presenter</Label><Input id={`presenter-${item.id}`} value={item.presenter} onChange={e => handleAgendaChange(item.id, 'presenter', e.target.value)} /></div>
                                        <div><Label htmlFor={`time-${item.id}`}>Time Allotted</Label><Input id={`time-${item.id}`} value={item.timeAllotted} onChange={e => handleAgendaChange(item.id, 'timeAllotted', e.target.value)} /></div>
                                    </div>
                                    <div><Label htmlFor={`discussion-${item.id}`}>Discussion</Label><Textarea id={`discussion-${item.id}`} value={item.discussion} onChange={e => handleAgendaChange(item.id, 'discussion', e.target.value)} /></div>
                                    <div><Label htmlFor={`conclusions-${item.id}`}>Conclusions</Label><Textarea id={`conclusions-${item.id}`} value={item.conclusions} onChange={e => handleAgendaChange(item.id, 'conclusions', e.target.value)} /></div>
                                    
                                    <div>
                                         <h4 className="font-semibold mb-2">Action Items</h4>
                                         <div className="space-y-2">
                                             {item.actionItems.map(ai => (
                                                 <div key={ai.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                                     <Input placeholder="Action Item" value={ai.task} onChange={e => handleActionItemChange(item.id, ai.id, 'task', e.target.value)} className="md:col-span-2"/>
                                                     <Input placeholder="Person Responsible" value={ai.person} onChange={e => handleActionItemChange(item.id, ai.id, 'person', e.target.value)} />
                                                     <div className="flex items-center gap-2">
                                                        <Input type="date" value={ai.deadline} onChange={e => handleActionItemChange(item.id, ai.id, 'deadline', e.target.value)} />
                                                        <Button variant="ghost" size="icon" onClick={() => removeActionItem(item.id, ai.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                         <Button type="button" size="sm" onClick={() => addActionItem(item.id)} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/>Add Action Item</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                         <Button type="button" onClick={addAgendaItem}><PlusCircle className="mr-2 h-4 w-4"/>Add Agenda Topic</Button>
                    </div>

                     <div className="space-y-4">
                        <div><Label htmlFor="observers">Observers</Label><Textarea id="observers" /></div>
                        <div><Label htmlFor="resource_persons">Resource Persons</Label><Textarea id="resource_persons" /></div>
                        <div><Label htmlFor="special_notes">Special Notes</Label><Textarea id="special_notes" /></div>
                    </div>

                    <div className="flex justify-end gap-4 pt-8">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
