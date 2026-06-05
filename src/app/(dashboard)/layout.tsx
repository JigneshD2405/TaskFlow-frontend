'use client';
import { Sidebar } from '@/components/Sidebar';
import { selectors } from '@/redux';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const user = useSelector(selectors.selectUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace(ROUTES.auth.signIn);
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="container flex-1 overflow-auto bg-slate-50 p-6">{children}</main>
    </div>
  );
}
