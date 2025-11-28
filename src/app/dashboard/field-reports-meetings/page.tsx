
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Send, Users } from "lucide-react";

const reportTypes = [
    {
        title: "Architect's Field Report",
        description: "Document site observations and progress.",
        href: "/dashboard/field-reports-meetings/architects-field-report",
        icon: FileText
    },
    {
        title: "Transmittal Letter",
        description: "Create and send formal transmittal letters.",
        href: "/dashboard/field-reports-meetings/transmittal-letter",
        icon: Send
    },
    {
        title: "Minutes of Meetings",
        description: "Record decisions and action items from meetings.",
        href: "/dashboard/field-reports-meetings/minutes-of-meetings",
        icon: Users
    }
];

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'field-reports-meetings');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Field Reports & Meetings"
        description="Select a report type to create, view, or manage."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
            <Card key={report.title} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-4">
                    <report.icon className="w-8 h-8 text-primary" />
                    <CardTitle>{report.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{report.description}</p>
                </CardContent>
                <CardContent>
                     <Button asChild className="w-full">
                        <Link href={report.href}>Go to {report.title}</Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
