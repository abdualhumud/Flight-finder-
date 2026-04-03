import { useState } from 'react';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import MissionControl from './pages/MissionControl';
import HackerLab from './pages/HackerLab';
import PriceWatchdog from './pages/PriceWatchdog';
import UpgradeSuite from './pages/UpgradeSuite';
import WalletStrategy from './pages/WalletStrategy';
import TrueCost from './pages/TrueCost';
import HackerTools from './pages/HackerTools';
import { useLocalStorage } from './hooks/useLocalStorage';

const pages = {
  'mission-control': MissionControl,
  'hacker-lab': HackerLab,
  'price-watchdog': PriceWatchdog,
  'upgrade-suite': UpgradeSuite,
  'wallet-strategy': WalletStrategy,
  'true-cost': TrueCost,
  'hacker-tools': HackerTools,
};

export default function App() {
  const [activeTab, setActiveTab] = useLocalStorage('active-tab', 'mission-control');
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);

  const ActivePage = pages[activeTab] || MissionControl;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0f]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatusBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <ActivePage />
          </div>
        </main>
      </div>
    </div>
  );
}
