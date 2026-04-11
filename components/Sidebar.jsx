'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Radar, Search, TrendingDown, MessageSquare, CreditCard,
  Calculator, Zap, ChevronLeft, ChevronRight, Plane, Globe, Languages, Menu, X
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

const navItems = [
  { href: '/', labelKey: 'nav.missionControl', subKey: 'nav.missionControl.sub', icon: Radar },
  { href: '/search', labelKey: 'nav.hackerLab', subKey: 'nav.hackerLab.sub', icon: Search },
  { href: '/arbitrage', labelKey: 'nav.geoPricing', subKey: 'nav.geoPricing.sub', icon: Globe },
  { href: '/tracker', labelKey: 'nav.priceWatchdog', subKey: 'nav.priceWatchdog.sub', icon: TrendingDown },
  { href: '/upgrade', labelKey: 'nav.upgradeSuite', subKey: 'nav.upgradeSuite.sub', icon: MessageSquare },
  { href: '/wallet', labelKey: 'nav.walletStrategy', subKey: 'nav.walletStrategy.sub', icon: CreditCard },
  { href: '/calculator', labelKey: 'nav.trueCost', subKey: 'nav.trueCost.sub', icon: Calculator },
  { href: '/tools', labelKey: 'nav.hackerTools', subKey: 'nav.hackerTools.sub', icon: Zap },
];

// Bottom nav shows the 4 most important items on mobile
const mobileNavItems = navItems.slice(0, 4);

export default function Sidebar() {
  const pathname = usePathname();
  const { t, locale, changeLocale, isRTL } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved) setCollapsed(JSON.parse(saved));
    } catch {}
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(next));
  }

  const basePath = '/Flight-finder-';

  function isActive(href) {
    const fullHref = href === '/' ? basePath + '/' : basePath + href;
    return pathname === fullHref || pathname === fullHref + '/';
  }

  return (
    <>
      {/* ===== DESKTOP SIDEBAR — hidden on mobile ===== */}
      <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} hidden md:flex h-screen bg-surface border-e border-border-subtle flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-brand-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-semibold text-white truncate">{t('nav.brand')}</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t('nav.subtitle')}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-start transition-all duration-200 ${
                  active
                    ? 'bg-brand-500/15 text-brand-400 glow-blue'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
                }`}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-brand-400' : ''}`} />
                {!collapsed && (
                  <div className="overflow-hidden">
                    <span className="text-sm font-medium block truncate">{t(item.labelKey)}</span>
                    <span className="text-[10px] text-gray-500 block">{t(item.subKey)}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language Toggle + Collapse */}
        <div className="p-2 border-t border-border-subtle space-y-1">
          <button
            onClick={() => changeLocale(locale === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-surface-hover transition-colors"
            title={t('general.language')}
          >
            <Languages className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm">{locale === 'en' ? t('general.arabic') : t('general.english')}</span>
            )}
          </button>
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-hover transition-colors"
          >
            {(collapsed ? !isRTL : isRTL)
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAV — visible only on mobile ===== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border-subtle safe-bottom">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  active ? 'text-brand-400' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate max-w-[64px]">{t(item.labelKey)}</span>
              </Link>
            );
          })}
          {/* More menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              mobileMenuOpen ? 'text-brand-400' : 'text-gray-500'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* ===== MOBILE "MORE" SLIDE-UP MENU ===== */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div className="md:hidden fixed bottom-16 inset-x-0 z-40 bg-surface border-t border-border-subtle rounded-t-2xl p-4 space-y-1 animate-slide-up safe-bottom">
            {navItems.slice(4).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-all ${
                    active
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-brand-400' : ''}`} />
                  <div>
                    <span className="text-sm font-medium block">{t(item.labelKey)}</span>
                    <span className="text-[10px] text-gray-500 block">{t(item.subKey)}</span>
                  </div>
                </Link>
              );
            })}
            {/* Language toggle in mobile menu */}
            <button
              onClick={() => changeLocale(locale === 'en' ? 'ar' : 'en')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-surface-hover transition-colors"
            >
              <Languages className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{locale === 'en' ? t('general.arabic') : t('general.english')}</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
