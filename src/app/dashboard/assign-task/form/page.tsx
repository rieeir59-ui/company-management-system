import { Suspense } from 'react';
import AssignTaskForm from './AssignTaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Loader2 } from 'lucide-react';

export const dynamic = "force-dynamic";

function AssignTaskFormFallback() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center font-headline text-3xl text-primary">Assign a New Task</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto h-96 flex items-center justify-center">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading Form...</span>
                 </div>
            </CardContent>
        </Card>
    )
}


export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'assign-task');
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Assign Task"
        description="Delegate tasks to your team members."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Suspense fallback={<AssignTaskFormFallback />}>
        <AssignTaskForm />
      </Suspense>
    </div>
  );
}
