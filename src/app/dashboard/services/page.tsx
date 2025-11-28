
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckSquare,
  ClipboardList,
  DraftingCompass,
  Hammer,
  Sparkles,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const ServiceList = ({ items }: { items: string[] }) => (
  <ul className="space-y-3 pl-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-start">
        <CheckSquare className="h-4 w-4 text-primary mr-3 mt-1 shrink-0" />
        <span className="text-sm">{item}</span>
      </li>
    ))}
  </ul>
);

const predesignServices = {
  'Predesign Services': [
    'Project Administration',
    'Disciplines Coordination Document Checking',
    'Agency Consulting Review/ Approval',
    'Coordination Of Owner Supplied Data',
    'Programming',
    'Space Schematics/ Flow Diagrams',
    'Existing Facilities Surveys',
    'Presentations',
  ],
  'Site Analysis Services': [
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
};

const designServices = {
  'Schematic Design Services': [
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
  'Design Development Services': [
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
  'Construction Documents Services': [
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
};

const constructionServices = {
  'Bidding Or Negotiation Services': [
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
  'Construction Contract Administration Services': [
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
};

const postConstructionServices = {
  'Post Construction Services': [
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
};

const supplementalServices = {
  'Supplemental Services': [
    'Graphics Design',
    'Fine Arts and Crafts Services',
    'Special Furnishing Design',
    'Non-Building Equipment Selection',
  ],
  'List Of Materials': [
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
};

const serviceCategories = [
  {
    number: 1,
    title: 'Predesign',
    icon: Search,
    color: 'bg-emerald-600',
    services: predesignServices,
  },
  {
    number: 2,
    title: 'Design',
    icon: DraftingCompass,
    color: 'bg-sky-600',
    services: designServices,
  },
  {
    number: 3,
    title: 'Construction',
    icon: Hammer,
    color: 'bg-rose-600',
    services: constructionServices,
  },
  {
    number: 4,
    title: 'Post-Construction',
    icon: ClipboardList,
    color: 'bg-violet-600',
    services: postConstructionServices,
  },
  {
    number: 5,
    title: 'Supplemental',
    icon: Sparkles,
    color: 'bg-amber-500',
    services: supplementalServices,
  },
];

const ServiceCard = ({
  number,
  title,
  icon: Icon,
  color,
  services,
}: {
  number: number;
  title: string;
  icon: React.ElementType;
  color: string;
  services: Record<string, string[]>;
}) => {
  return (
    <Card className="flex flex-col h-full bg-card overflow-hidden shadow-2xl border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-primary/20">
      <div className="relative p-6">
        <div
          className={cn(
            'absolute top-0 left-0 h-full w-full opacity-10',
            color
          )}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0% 100%)' }}
        ></div>
        <div className="relative flex items-center justify-between">
          <div
            className={cn(
              'flex items-center justify-center h-12 w-12 rounded-full text-white font-bold text-xl shadow-lg',
              color
            )}
          >
            {number}
          </div>
          <Icon className={cn('h-10 w-10', color.replace('bg-', 'text-'))} />
        </div>
        <h3 className="mt-4 text-3xl font-headline font-bold text-primary">
          {title}
        </h3>
      </div>
      <CardContent className="flex-grow pt-4">
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(services).map(([subtitle, items]) => (
            <AccordionItem value={subtitle} key={subtitle}>
              <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:text-primary text-left">
                {subtitle}
              </AccordionTrigger>
              <AccordionContent className="bg-muted/30 p-4 rounded-md">
                <ServiceList items={items} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};


export default function DashboardServicesPage() {
  return (
    <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-headline text-primary mb-2">
            Our Services
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We offer a comprehensive range of architectural and design services
            to bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {serviceCategories.map((cat) => (
            <ServiceCard key={cat.number} {...cat} />
          ))}
        </div>
    </div>
  );
}
