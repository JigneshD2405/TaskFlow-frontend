'use client';
import { Sidebar } from '@/components/Sidebar';
import { PropsWithChildren } from 'react';


export default function DashboardLayout({ children }: PropsWithChildren) {

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="container flex-1 overflow-auto bg-slate-50 p-6">{children}</main>
    </div>
  );
}
