import { Suspense } from 'react';
import ProjectChecklist from './Checklist';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
      <ProjectChecklist />
    </Suspense>
  );
}
