
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function DataEntryPage() {
  const image = PlaceHolderImages.find(p => p.id === 'data-entry');

  return (
    <div>
      <DashboardPageHeader
        title="Data Entry"
        description="Enter new data into the system."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
