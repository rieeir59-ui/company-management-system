
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployees } from '@/context/EmployeeContext';
import { Users, User, Crown } from 'lucide-react';
import React from 'react';

const TeamMemberCard = ({ name, role }: { name: string; role: string; }) => {
  const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : '';
  }

  return (
    <Card className="text-center bg-card/80 border-2 border-primary shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center border-2 border-primary shadow-[0_0_8px_hsl(var(--primary))]">
              <span className="text-3xl font-bold text-primary">{getInitials(name)}</span>
            </div>
        </div>
        <p className="mt-2 font-bold text-lg">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </CardContent>
    </Card>
  );
};

const DepartmentSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => {
    if (React.Children.count(children) === 0) return null;
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-full text-primary-foreground">
                    {icon}
                </div>
                <h2 className="text-2xl font-headline font-semibold text-primary">{title}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pl-12">
                {children}
            </div>
        </div>
    );
}

export default function TeamPage() {
    const { employeesByDepartment } = useEmployees();
    
    const ceo = employeesByDepartment['ceo']?.[0];
    const admin = employeesByDepartment['admin'] || [];
    const hr = employeesByDepartment['hr'] || [];
    const architects = {
        lead: (employeesByDepartment['architects'] || []).find(e => e.name.toLowerCase() === 'asad'),
        team: (employeesByDepartment['architects'] || []).filter(e => e.name.toLowerCase() !== 'asad')
    };
    const finance = employeesByDepartment['finance'] || [];
    const softwareEngineers = employeesByDepartment['software-engineer'] || [];
    const quantityManagement = employeesByDepartment['quantity-management'] || [];
    const visualizer = employeesByDepartment['3d-visualizer'] || [];
    const drafting = employeesByDepartment['draftman'] || [];

  return (
    <div className="space-y-12">
        <Card className="bg-card/90">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-center text-primary">Our Team</CardTitle>
            </CardHeader>
        </Card>

        {/* CEO Section */}
        {ceo && (
            <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-3">
                    <Crown className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-headline font-bold text-primary">Chief Executive Officer</h2>
                 </div>
                 <div className="flex justify-center">
                    <div className="w-64"><TeamMemberCard name={ceo.name} role="CEO" /></div>
                 </div>
            </div>
        )}

        <div className="border-t border-dashed border-primary/50 my-8"></div>

        <div className="space-y-10">
             <DepartmentSection title="Admin" icon={<Users className="w-5 h-5" />}>
                {admin.map(e => <TeamMemberCard key={e.record} name={e.name} role="Admin" />)}
            </DepartmentSection>

            <DepartmentSection title="Human Resources" icon={<Users className="w-5 h-5" />}>
                {hr.map(e => <TeamMemberCard key={e.record} name={e.name} role="HR" />)}
            </DepartmentSection>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-full text-primary-foreground">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-headline font-semibold text-primary">Architects</h2>
                </div>
                <div className="pl-12 space-y-6">
                    {architects.lead && <div className="w-48"><TeamMemberCard name={architects.lead.name} role="Lead Architect" /></div>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                        {architects.team.map(e => <TeamMemberCard key={e.record} name={e.name} role="Architect" />)}
                    </div>
                </div>
            </div>

            <DepartmentSection title="Finance" icon={<Users className="w-5 h-5" />}>
                {finance.map(e => <TeamMemberCard key={e.record} name={e.name} role="Finance" />)}
            </DepartmentSection>

             <DepartmentSection title="Software Engineers" icon={<Users className="w-5 h-5" />}>
                {softwareEngineers.map(e => <TeamMemberCard key={e.record} name={e.name} role="Software Engineer" />)}
            </DepartmentSection>

            <DepartmentSection title="Quantity Management" icon={<Users className="w-5 h-5" />}>
                {quantityManagement.map(e => <TeamMemberCard key={e.record} name={e.name} role="Quantity Manager" />)}
            </DepartmentSection>

            <DepartmentSection title="3D Visualizer" icon={<User className="w-5 h-5" />}>
                {visualizer.map(e => <TeamMemberCard key={e.record} name={e.name} role="3D Visualizer" />)}
            </DepartmentSection>

            <DepartmentSection title="Drafting" icon={<Users className="w-5 h-5" />}>
                {drafting.map(e => <TeamMemberCard key={e.record} name={e.name} role="Draftsman" />)}
            </DepartmentSection>
        </div>
    </div>
  );
}
