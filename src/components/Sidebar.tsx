'use client';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const navItems = [
  { label: 'Boards', href: ROUTES.board.list, icon: '📋' },
];

export const Sidebar = () => {
  const pathname = usePathname();


  return (
    <aside className="flex h-screen w-60 flex-col bg-[#1e293b] text-slate-400">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <span className="text-2xl">🗂️</span>
        <span className="text-lg font-bold text-white">TaskBoard</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${pathname.startsWith(item.href)
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-700 px-4 py-4">
        <div className="mb-3">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{"Jignesh"}</p>
          <p className="text-xs text-slate-400 truncate">{"EMAIL"}</p>
        </div>
        <button
          className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};
