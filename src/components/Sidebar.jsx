import {
  Radar, Search, TrendingDown, MessageSquare, CreditCard,
  Calculator, Zap, ChevronLeft, ChevronRight, Plane
} from 'lucide-react';

const navItems = [
  { id: 'mission-control', label: 'Mission Control', icon: Radar, subtitle: 'Live Deals' },
  { id: 'hacker-lab', label: 'Hacker Lab', icon: Search, subtitle: 'Smart Search' },
  { id: 'price-watchdog', label: 'Price Watchdog', icon: TrendingDown, subtitle: 'Tracker' },
  { id: 'upgrade-suite', label: 'Upgrade Suite', icon: MessageSquare, subtitle: 'Negotiate' },
  { id: 'wallet-strategy', label: 'Wallet Strategy', icon: CreditCard, subtitle: 'Points & Cards' },
  { id: 'true-cost', label: 'True Cost', icon: Calculator, subtitle: 'Calculator' },
  { id: 'hacker-tools', label: 'Hacker Tools', icon: Zap, subtitle: 'Sweet Spots' },
];

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} h-screen bg-surface border-r border-border-subtle flex flex-col transition-all duration-300 flex-shrink-0`}>
      <div className="p-4 border-b border-border-subtle flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
          <Plane className="w-5 h-5 text-brand-400" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-white truncate">Flight Finder</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Intelligence</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border-subtle">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-hover transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
