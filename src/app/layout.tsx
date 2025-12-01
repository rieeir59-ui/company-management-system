'use client'
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/context/UserContext';
import { EmployeeProvider } from '@/context/EmployeeContext';
import { FileProvider } from '@/context/FileContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <EmployeeProvider>
          <UserProvider>
            <FileProvider>
              {children}
            </FileProvider>
          </UserProvider>
        </EmployeeProvider>
        <Toaster />
      </body>
    </html>
  );
}
