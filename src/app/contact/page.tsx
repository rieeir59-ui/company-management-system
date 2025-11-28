
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const contactDetails = {
  address: 'Sector Y DHA Phase 3, 101 Lahore',
  phone: '(042) 35692522',
  email: 'info@isbahhassan.com',
};

const hours = [
    { day: 'Monday', time: '9:30 am–6 pm' },
    { day: 'Tuesday', time: '9 am–6 pm' },
    { day: 'Wednesday', time: '9 am–6 pm' },
    { day: 'Thursday', time: '9 am–6 pm' },
    { day: 'Friday', time: '9 am–6 pm' },
    { day: 'Saturday', time: '9 am–2 pm' },
    { day: 'Sunday', time: 'Closed' },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="text-center mb-12">
             <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-primary">
              Contact Us
            </h1>
          </div>
           <Card className="w-full max-w-4xl mx-auto shadow-xl bg-accent/20">
             <CardContent className="p-6 md:p-8">
                <div className="flex flex-col gap-8 md:gap-12">
                  <div className="space-y-6">
                     <h3 className="font-headline text-3xl text-primary border-b-2 border-primary pb-2">Our Office</h3>
                     <div className="space-y-4 text-lg">
                      <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-primary mt-1" />
                        <span>{contactDetails.address}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Phone className="h-6 w-6 text-primary" />
                        <span>{contactDetails.phone}</span>
                      </div>
                       <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-primary" />
                        <span>{contactDetails.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="font-headline text-3xl text-primary border-b-2 border-primary pb-2">Working Hours</h3>
                    <ul className="space-y-2 text-lg">
                      {hours.map(item => (
                         <li key={item.day} className="flex justify-between">
                           <span className="font-semibold">{item.day}</span>
                           <span>{item.time}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
