
'use client';

import { MoreHorizontal, PlusCircle, Download, FileText as FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Employee } from '@/lib/employees';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/context/EmployeeContext';
import { useCurrentUser } from '@/context/UserContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const departments = [
    { name: 'CEO', slug: 'ceo' },
    { name: 'ADMIN', slug: 'admin' },
    { name: 'HR', slug: 'hr' },
    { name: 'SOFTWARE ENGINEER', slug: 'software-engineer' },
    { name: 'DRAFTMAN', slug: 'draftman' },
    { name: '3D VISULIZER', slug: '3d-visualizer' },
    { name: 'ARCHITECTS', slug: 'architects' },
    { name: 'FINANCE', slug: 'finance' },
    { name: 'QUANTITY MANAGEMENT', slug: 'quantity-management' },
];

function getFirstLetter(name: string) {
    return name ? name.charAt(0).toUpperCase() : '';
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function EmployeePage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { user: currentUser } = useCurrentUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const image = PlaceHolderImages.find(p => p.id === 'employee-record');
  
  const { toast } = useToast();

  const canManageEmployees = currentUser && ['software-engineer', 'admin', 'ceo'].includes(currentUser.department);

  const handleAddEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageEmployees) return;
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const contact = formData.get('contact') as string;
    const department = formData.get('department') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !department || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all required fields.",
      });
      return;
    }

    const newEmployee: Employee = {
      name,
      email,
      contact,
      department,
      password,
      record: `EMP-${String(Date.now()).slice(-4)}`,
      avatarId: 'avatar-3',
    };

    addEmployee(newEmployee);
    setIsAddDialogOpen(false);
    toast({
      title: "Employee Added",
      description: `${name} has been added to the employee list.`,
    });
  };

  const handleEditEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEmployee || !canManageEmployees) return;

    const formData = new FormData(event.currentTarget);
    const updatedData: Partial<Employee> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      contact: formData.get('contact') as string,
      department: formData.get('department') as string,
      password: formData.get('password') as string,
    };

    updateEmployee(selectedEmployee.record, updatedData);
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
    toast({
      title: "Employee Updated",
      description: `${updatedData.name} has been updated.`,
    });
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee || !canManageEmployees) return;

    deleteEmployee(selectedEmployee.record);
    setIsDeleteDialogOpen(false);
    setSelectedEmployee(null);
    toast({
      variant: 'destructive',
      title: "Employee Deleted",
      description: `${selectedEmployee.name} has been removed.`,
    });
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const footerText = "Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522 , info@isbahhassan.com , www.isbahhassan.com";

    doc.autoTable({
      head: [['Name', 'Email', 'Department']],
      body: employees.map(emp => [
        emp.name,
        emp.email,
        departments.find(d => d.slug === emp.department)?.name || emp.department
      ]),
      didDrawPage: function (data) {
        // Add footer to all pages
        doc.setFontSize(8);
        doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
      }
    });

    doc.save('employee-list.pdf');
  }

  const handleDownloadCsv = () => {
    const csvHeader = ['Name', 'Email', 'Department'];
    const csvRows = employees.map(emp => [
      `"${emp.name}"`,
      `"${emp.email}"`,
      `"${departments.find(d => d.slug === emp.department)?.name || emp.department}"`
    ]);

    const csvContent = [
      csvHeader.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee-list.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <DashboardPageHeader
        title="Employees"
        description="Manage your company's employee records."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee List</CardTitle>
              <CardDescription>Manage your company's employee records.</CardDescription>
            </div>
            {canManageEmployees && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Add Employee
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new employee below.
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddEmployee}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" name="email" type="email" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact" className="text-right">Contact</Label>
                        <Input id="contact" name="contact" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">Department</Label>
                        <Select name="department" required>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dept => (
                                <SelectItem key={dept.slug} value={dept.slug}>{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input id="password" name="password" type="password" className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Save Employee</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                {canManageEmployees && (
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                  <TableRow key={employee.record}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary text-secondary-foreground font-bold text-2xl">
                        {getFirstLetter(employee.name)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="font-bold">{employee.name}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{employee.email}</div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{departments.find(d => d.slug === employee.department)?.name || employee.department}</TableCell>
                    {canManageEmployees && (
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(employee)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(employee)} className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    )}
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{employees.length}</strong> of <strong>{employees.length}</strong> employees
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={handleDownloadCsv}>
              <FileDown className="h-4 w-4" />
              Download CSV
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the details for {selectedEmployee?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" name="name" defaultValue={selectedEmployee?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={selectedEmployee?.email} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contact" className="text-right">Contact</Label>
                <Input id="edit-contact" name="contact" defaultValue={selectedEmployee?.contact} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department" className="text-right">Department</Label>
                <Select name="department" defaultValue={selectedEmployee?.department} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.slug} value={dept.slug}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-password" className="text-right">Password</Label>
                  <Input id="edit-password" name="password" type="password" defaultValue={selectedEmployee?.password} className="col-span-3" required />
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record for {selectedEmployee?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
