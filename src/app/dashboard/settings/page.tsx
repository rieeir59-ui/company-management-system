
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function SettingsPage() {
  const image = PlaceHolderImages.find(p => p.id === 'settings');

  return (
    <div>
      <DashboardPageHeader
        title="Settings"
        description="Configure your application settings."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
