'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Download, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useCurrentUser } from '@/context/UserContext';
import { useSearchParams } from 'next/navigation';

const checklistData = {
  predesign: {
    title: '1: - Predesign',
    sections: {
      predesignServices: {
        title: 'Predesign Services:',
        items: [
          'Project Administration',
          'Disciplines Coordination Document Checking',
          'Agency Consulting Review/ Approval',
          'Coordination Of Owner Supplied Data',
          'Programming',
          'Space Schematics/ Flow Diagrams',
          'Existing Facilities Surveys',
          'Presentations',
        ],
      },
      siteAnalysis: {
        title: 'Site Analysis Services',
        items: [
          'Project Administration',
          'Disciplines Coordination Document Checking',
          'Agency Consulting Review/ Approval',
          'Coordination Of Owner Supplied Data',
          'Site Analysis and Selection',
          'Site Development and Planning',
          'Detailed Site Utilization Studies',
          'Onsite Utility Studies',
          'Offsite Utility Studies',
          'Zoning Processing Assistance',
          'Project Development Scheduling',
          'Project Budgeting',
          'Presentations',
        ],
      },
    },
  },
  design: {
    title: '2: - Design',
    sections: {
      schematicDesign: {
        title: 'Schematic Design Services:',
        items: [
            'Project Administration',
            'Disciplines Coordination Document Checking',
            'Agency Consulting Review/ Approval',
            'Coordination Of Owner Supplied Data',
            'Architectural Design/ Documentation',
            'Structural Design/ Documentation',
            'Mechanical Design/ Documentation',
            'Electrical Design/ Documentation',
            'Civil Design/ Documentation',
            'Landscape Design/ Documentation',
            'Interior Design/ Documentation',
            'Materials Research/ Specifications',
            'Project Development Scheduling',
            'Statement Of Probable Construction Cost',
            'Presentations',
        ],
      },
      designDevelopment: {
        title: 'Design Development Services:',
        items: [
            'Project Administration',
            'Disciplines Coordination Document Checking',
            'Agency Consulting Review/ Approval',
            'Coordination Of Owner Supplied Data',
            'Architectural Design/ Documentation',
            'Structural Design/ Documentation',
            'Mechanical Design / Documentation',
            'Electrical Design / Documentation',
            'Civil Design / Documentation',
            'Landscape Design / Documentation',
            'Interior Design / Documentation',
            'Materials Research / Specifications',
            'Project Development Scheduling',
            'Statement Of Probable Construction Cost',
            'Presentations',
        ],
      },
      constructionDocuments: {
        title: 'Construction Documents Services:',
        items: [
            'Project Administration',
            'Disciplines Coordination Document Checking',
            'Agency Consulting Review/ Approval',
            'Coordination Of Owner Supplied Data',
            'Architectural Design/ Documentation',
            'Structural Design/ Documentation',
            'Mechanical Design/ Documentation',
            'Electrical Design / Documentation',
            'Civil Design/ Documentation',
            'Landscape Design/ Documentation',
            'Interior Design/ Documentation',
            'Materials Research / Specifications',
            'Project Development Scheduling',
            'Statement Of Probable Construction Cost',
            'Presentations',
        ],
      },
    },
  },
  construction: {
    title: '3: - Construction',
    sections: {
        bidding: {
            title: 'Bidding Or Negotiation Services:',
            items: [
                'Project Administration',
                'Disciplines Coordination Document Checking',
                'Agency Consulting Review/ Approval',
                'Coordination Of Owner Supplied Data',
                'Bidding Materials',
                'Addenda',
                'Bidding Negotiations',
                'Analysis Of Alternates/ Substitutions',
                'Special Bidding Services',
                'Bid Evaluation',
                'Construction Contract Agreements',
            ],
        },
        contractAdmin: {
            title: 'Construction Contract Administration Services:',
            items: [
                'Project Administration',
                'Disciplines Coordination Document Checking',
                'Agency Consulting Review/ Approval',
                'Coordination Of Owner Supplied Data',
                'Office Construction Administration',
                'Construction Field Observation',
                'Project Representation',
                'Inspection Coordination',
                'Supplemental Documents',
                'Quotation Requests/ Change Orders',
                'Project Schedule Monitoring',
                'Construction Cost Accounting',
                'Project Closeout',
            ],
        },
    },
  },
  postConstruction: {
      title: '4: - Post Construction',
      sections: {
          postConstruction: {
              title: 'Post Construction Services:',
              items: [
                'Project Administration',
                'Disciplines Coordination Document Checking',
                'Agency Consulting Review/ Approval',
                'Coordination Of Owner Supplied Data',
                'Maintenance And Operational Programming',
                'Start Up Assistance',
                'Record Drawings',
                'Warranty Review',
                'Post Construction Evaluation',
              ],
          },
      },
  },
  supplemental: {
      title: '5: - Supplemental',
      sections: {
          supplemental: {
              title: 'Supplemental Services:',
              items: [
                'Graphics Design',
                'Fine Arts and Crafts Services',
                'Special Furnishing Design',
                'Non-Building Equipment Selection',
              ],
          },
          materials: {
              title: 'List Of Materials:',
              items: [
                'Conceptual Site and Building Plans/ Basic Layout',
                'Preliminary Sections and Elevations',
                'Air Conditioning/ H.V.A.C Design',
                'Plumbing',
                'Fire Protection',
                'Special Mechanical Systems',
                'General Space Requirements',
                'Power Services and Distribution',
                'Telephones',
                'Security Systems',
                'Special Electrical Systems',
                'Landscaping',
                'Materials',
                'Partition Sections',
                'Furniture Design',
                'Identification Of Potential Architectural Materials',
                'Specification Of a. Wall Finishes',
                'b. Floor Finishes',
                'c. Windows Coverings',
                'd. Carpeting',
                'Specialized Features Construction Details',
                'Project Administration',
                'Space Schematic Flow',
                'Existing Facilities Services',
                'Project Budgeting',
                'Presentation',
              ],
          },
      },
  },
};

type ChecklistState = {
    [mainKey: string]: {
        [subKey: string]: boolean[]
    }
};

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}


const initializeState = (): ChecklistState => {
    const initialState: ChecklistState = {};
    for (const mainKey in checklistData) {
        initialState[mainKey] = {};
        const mainSection = checklistData[mainKey as keyof typeof checklistData];
        for (const subKey in mainSection.sections) {
            const subSection = mainSection.sections[subKey as keyof typeof mainSection.sections];
            initialState[mainKey][subKey] = Array(subSection.items.length).fill(false);
        }
    }
    return initialState;
};


const ChecklistItem = ({ item, checked, onCheckedChange }: { item: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) => {
    return (
        <div className={`flex items-start space-x-3 py-1 item-container`}>
            <Checkbox checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
            <div className="flex-grow">{item}</div>
        </div>
    );
};

export default function ProjectChecklist() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const recordId = searchParams.get('id');

    const [checkedItems, setCheckedItems] = useState<ChecklistState>(initializeState());
    const [projectName, setProjectName] = useState('');
    const [architectName, setArchitectName] = useState('');
    const [projectNo, setProjectNo] = useState('');
    const [projectDate, setProjectDate] = useState('');
    const [isLoading, setIsLoading] = useState(!!recordId);

    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    useEffect(() => {
        if (recordId && firestore) {
            const fetchRecord = async () => {
                setIsLoading(true);
                try {
                    const docRef = doc(firestore, 'savedRecords', recordId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const record = docSnap.data();
                        
                        // Basic project info
                        setProjectName(record.projectName || '');
                        
                        // Find header info from saved data
                        const headerInfo = record.data?.find((d: any) => d.category === 'Project Header');
                        if (headerInfo) {
                            setArchitectName(headerInfo.architectName || '');
                            setProjectNo(headerInfo.projectNo || '');
                            setProjectDate(headerInfo.projectDate || '');
                        }

                        // Reconstruct checked state
                        const newCheckedState = initializeState();
                        record.data?.forEach((section: any) => {
                             for (const mainKey in checklistData) {
                                const mainSection = checklistData[mainKey as keyof typeof checklistData];
                                for (const subKey in mainSection.sections) {
                                    const subSection = mainSection.sections[subKey as keyof typeof mainSection.sections];
                                    if (`${mainSection.title} - ${subSection.title}` === section.category) {
                                        section.items.forEach((savedItem: string) => {
                                            const itemIndex = subSection.items.indexOf(savedItem);
                                            if (itemIndex > -1) {
                                                newCheckedState[mainKey][subKey][itemIndex] = true;
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        setCheckedItems(newCheckedState);
                    } else {
                        toast({ variant: "destructive", title: "Error", description: "Record not found."});
                    }
                } catch (e) {
                     toast({ variant: "destructive", title: "Error", description: "Failed to load record."});
                     console.error("Error fetching document:", e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRecord();
        } else {
          setIsLoading(false);
        }
    }, [recordId, firestore, toast]);

    const handleCheckboxChange = (mainKey: string, subKey: string, itemIndex: number, checked: boolean) => {
        setCheckedItems(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState)); // Deep copy
            newState[mainKey][subKey][itemIndex] = checked;
            return newState;
        });
    };
    
    const getSelectedItems = () => {
        const selected: { mainTitle: string, subTitle: string, items: string[] }[] = [];
        for (const mainKey in checklistData) {
            const mainSection = checklistData[mainKey as keyof typeof checklistData];
            for (const subKey in mainSection.sections) {
                const subSection = mainSection.sections[subKey as keyof typeof mainSection.sections];
                const items = subSection.items.filter((_, index) => checkedItems[mainKey][subKey][index]);
                if (items.length > 0) {
                    selected.push({ mainTitle: mainSection.title, subTitle: subSection.title, items: items });
                }
            }
        }
        return selected;
    };

    const handleSave = async () => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Error", description: "Database not available."});
            return;
        }
        if (!currentUser) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to save."});
            return;
        }

        const selectedDataForSave = getSelectedItems().map(s => ({
            category: `${s.mainTitle} - ${s.subTitle}`,
            items: s.items
        }));
        
        const headerData = {
            category: "Project Header",
            architectName: architectName,
            projectNo: projectNo,
            projectDate: projectDate,
            items: [],
        }
        selectedDataForSave.unshift(headerData);

        if (selectedDataForSave.length <= 1) { // Only header data
            toast({ variant: "destructive", title: "Nothing to save", description: "Please select at least one item."});
            return;
        }

        const recordToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Project Checklist',
            projectName: projectName || 'Untitled Project',
            data: selectedDataForSave,
            createdAt: serverTimestamp(),
        };

        try {
            if (recordId) {
                // Update existing record
                const docRef = doc(firestore, 'savedRecords', recordId);
                await updateDoc(docRef, {
                    projectName: projectName || 'Untitled Project',
                    data: selectedDataForSave,
                });
                 toast({
                    title: "Record Updated",
                    description: "Your project checklist has been updated.",
                });
            } else {
                // Create new record
                await addDoc(collection(firestore, 'savedRecords'), recordToSave);
                toast({
                    title: "Record Saved",
                    description: "Your project checklist has been saved to the central database.",
                });
            }
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save the record. Please try again.",
            });
        }
    };
    
    const handleDownload = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const selectedData = getSelectedItems();
    
        if (selectedData.length === 0) {
            toast({
                variant: "destructive",
                title: "Nothing to download",
                description: "Please select at least one item to include in the PDF."
            });
            return;
        }
    
        // Main Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('PROJECT CHECKLIST', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    
        // Project Info
        let yPos = 40;
        const addHeaderLine = (label: string, value: string) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(label, 14, yPos);
            doc.setFont('helvetica', 'normal');
            // Calculate position for the value to avoid overlap
            const labelWidth = doc.getTextWidth(label);
            doc.text(value, 14 + labelWidth + 5, yPos); // 5 is for a small gap
            yPos += 10;
        }

        addHeaderLine('Project:', projectName || '');
        addHeaderLine('Name, Address: Architect:', architectName || '');
        addHeaderLine('Architect Project No:', projectNo || '');
        addHeaderLine('Project Date:', projectDate || '');

        yPos += 5; // Extra space after header
    
        let lastMainTitle = '';
    
        selectedData.forEach(section => {
            if (section.mainTitle !== lastMainTitle) {
                if (lastMainTitle !== '') yPos += 7; // Add space between main sections
                if (yPos > 260) { doc.addPage(); yPos = 20; }
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(section.mainTitle, 14, yPos);
                yPos += 7;
                lastMainTitle = section.mainTitle;
            }
    
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(section.subTitle, 20, yPos, { 'decoration': 'underline' });
            yPos += 7;
    
            const body = section.items.map((item, index) => [`${index + 1}.`, item]);
    
            doc.autoTable({
                startY: yPos,
                body: body,
                theme: 'plain',
                showHead: 'never',
                columnStyles: {
                    0: { cellWidth: 8, fontStyle: 'normal' },
                    1: { cellWidth: 'auto', fontStyle: 'normal' },
                },
                styles: { fontSize: 11, cellPadding: {top: 0.5, right: 1, bottom: 0.5, left: 1} },
                margin: { left: 20 }
            });
    
            yPos = (doc as any).lastAutoTable.finalY + 7;
        });
    
        doc.save(`${projectName || 'project'}_checklist.pdf`);
    
        toast({
            title: "Download Started",
            description: "Your checklist PDF is being generated.",
        });
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4">Loading record...</span>
            </div>
        )
    }

    return (
        <div className="bg-white p-8 md:p-12 lg:p-16 text-black rounded-lg shadow-lg">
            <div className="printable-area">
                <h1 className="text-2xl font-bold text-center mb-10">PROJECT CHECKLIST</h1>

                <div className="space-y-4 mb-10">
                    <div className="flex items-center">
                        <Label htmlFor="project-name" className="w-48 font-semibold">Project:</Label>
                        <Input 
                            id="project-name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" 
                        />
                    </div>
                    <div className="flex items-center">
                        <Label htmlFor="architect" className="w-48 font-semibold">Name, Address: Architect:</Label>
                        <Input id="architect" value={architectName} onChange={(e) => setArchitectName(e.target.value)} className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
                    </div>
                    <div className="flex items-center">
                        <Label htmlFor="project-no" className="w-48 font-semibold">Architect Project No:</Label>
                        <Input id="project-no" value={projectNo} onChange={(e) => setProjectNo(e.target.value)} className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
                    </div>
                    <div className="flex items-center">
                        <Label htmlFor="project-date" className="w-48 font-semibold">Project Date:</Label>
                        <Input id="project-date" type="date" value={projectDate} onChange={(e) => setProjectDate(e.target.value)} className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
                    </div>
                </div>

                <div className="space-y-8">
                    {Object.entries(checklistData).map(([mainKey, mainSection]) => (
                        <div key={mainSection.title}>
                            <h2 className="text-xl font-bold mb-4">{mainSection.title}</h2>
                            <div className="space-y-6">
                                {Object.entries(mainSection.sections).map(([subKey, subSection]) => (
                                    <div key={subSection.title} className="pl-4">
                                        <h3 className="font-semibold underline mb-2">{subSection.title}</h3>
                                        <div className="space-y-1">
                                            {subSection.items.map((item, index) => (
                                                <ChecklistItem 
                                                    key={index} 
                                                    item={item}
                                                    checked={checkedItems[mainKey]?.[subKey]?.[index] ?? false}
                                                    onCheckedChange={(checked) => handleCheckboxChange(mainKey, subKey, index, !!checked)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-12 no-print">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                <Button onClick={handleDownload} variant="outline" className="text-black border-black hover:bg-gray-200"><Download className="mr-2 h-4 w-4" /> Download/Print PDF</Button>
            </div>
        </div>
    );
}
