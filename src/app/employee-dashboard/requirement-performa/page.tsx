
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'requirement-performa');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Requirement Performa"
        description="This page has been integrated into the Project Information page."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Please use the Project Information page to fill out the requirement performa.</p>
        <Button asChild className="mt-4">
          <Link href="/employee-dashboard/project-information">Go to Project Information</Link>
        </Button>
      </div>
    </div>
  );
}
