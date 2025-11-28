
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'employee-record');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Employee Record"
        description="View and manage employee records."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Your saved checklists and documents can be found on the Saved Records page.</p>
        <Button asChild className="mt-4">
          <Link href="/employee-dashboard/saved-records">Go to Saved Records</Link>
        </Button>
      </div>
    </div>
  );
}
