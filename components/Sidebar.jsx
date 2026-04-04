'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Radar, Search, TrendingDown, MessageSquare, CreditCard,
  Calculator, Zap, ChevronLeft, ChevronRight, Plane, Globe
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Mission Control', icon: Radar, subtitle: 'Live Deals' },
  { href: '/search', label: 'Hacker Lab', icon: Search, subtitle: 'Smart Search' },
  { href: '/arbitrage', label: 'Geo-Pricing', icon: Globe, subtitle: 'Arbitrage' },
  { href: '/tracker', label: 'Price Watchdog', icon: TrendingDown, subtitle: 'Tracker' },
  { href: '/upgrade', label: 'Upgrade Suite', icon: MessageSquare, subtitle: 'Negotiate' },
  { href: '/wallet', label: 'Wallet Strategy', icon: CreditCard, subtitle: 'Points & Cards' },
  { href: '/calculator', label: 'True Cost', icon: Calculator, subtitle: 'Calculator' },
  { href: '/tools', label: 'Hacker Tools', icon: Zap, subtitle: 'Sweet Spots' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved) setCollapsed(JSON.parse(saved));
    } catch {}
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(next));
  }

  const basePath = '/Flight-finder-';

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} h-screen bg-surface border-r border-border-subtle flex flex-col transition-all duration-300 flex-shrink-0`}>
      <div className="p-4 border-b border-border-subtle flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
          <Plane className="w-5 h-5 text-brand-400" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-white truncate">Flight Finder</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Arbitrage Engine</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const fullHref = item.href === '/' ? basePath + '/' : basePath + item.href;
          const isActive = pathname === fullHref || pathname === fullHref + '/';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 glow-blue'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-brand-400' : ''}`} />
              {!collapsed && (
                <div className="overflow-hidden">
                  <span className="text-sm font-medium block truncate">{item.label}</span>
                  <span className="text-[10px] text-gray-500 block">{item.subtitle}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border-subtle">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-hover transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
