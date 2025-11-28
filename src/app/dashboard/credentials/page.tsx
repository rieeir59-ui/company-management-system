
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employees } from '@/lib/employees';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/context/UserContext';


export default function CredentialsPage() {
  const router = useRouter();
  const { user: currentUser, isUserLoading } = useCurrentUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const image = PlaceHolderImages.find(p => p.id === 'credentials');

  useEffect(() => {
    if (!isUserLoading) {
      if (currentUser && (currentUser.department === 'software-engineer' || currentUser.department === 'admin' || currentUser.department === 'ceo')) {
        setIsAuthorized(true);
      } else {
        router.push('/dashboard');
      }
    }
  }, [currentUser, isUserLoading, router]);

  if (isUserLoading || !isAuthorized) {
    return (
        <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Verifying access...</p>
        </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader
        title="Employee Credentials"
        description="List of all employee emails and passwords."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
          <CardTitle>Credentials</CardTitle>
          <CardDescription>Confidential employee login information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.record}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.password}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
