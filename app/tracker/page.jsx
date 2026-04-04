'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Bell, Plus, Target, Trash2, Eye, Loader2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '../../lib/utils';
import { useFlightSearch } from '../../lib/hooks/useFlightSearch';

const notifications = [
  { id: 1, type: 'error_fare', message: 'RUH → CDG Business at SAR 2,400 — possible error fare!', time: '45m ago', urgent: true },
  { id: 2, type: 'price_drop', message: 'RUH → LHR dropped 42% — SAR 1,850 (was SAR 3,200)', time: '2h ago', urgent: true },
  { id: 3, type: 'price_drop', message: 'JED → IST dropped 39% — SAR 980 (was SAR 1,600)', time: '5h ago', urgent: true },
  { id: 4, type: 'info', message: 'RUH → BKK price trending downward — 5.1% decrease this week', time: '1d ago', urgent: false },
];

const defaultTracked = [
  { id: 1, route: 'RUH → LHR', origin: 'RUH', dest: 'LHR', targetPrice: 1500, currentPrice: 1850, trend: 'down', change: -8.2 },
  { id: 2, route: 'JED → IST', origin: 'JED', dest: 'IST', targetPrice: 800, currentPrice: 980, trend: 'down', change: -12.5 },
  { id: 3, route: 'RUH → BKK', origin: 'RUH', dest: 'BKK', targetPrice: 1200, currentPrice: 1650, trend: 'down', change: -5.1 },
  { id: 4, route: 'RUH → CDG', origin: 'RUH', dest: 'CDG', targetPrice: 2000, currentPrice: 2400, trend: 'up', change: 3.2 },
];

const priceHistory = [
  { date: 'Mar 1', 'RUH→LHR': 3200, 'RUH→IST': 1500, 'RUH→BKK': 2800 },
  { date: 'Mar 5', 'RUH→LHR': 3100, 'RUH→IST': 1450, 'RUH→BKK': 2750 },
  { date: 'Mar 10', 'RUH→LHR': 2900, 'RUH→IST': 1400, 'RUH→BKK': 2600 },
  { date: 'Mar 15', 'RUH→LHR': 2800, 'RUH→IST': 1350, 'RUH→BKK': 2500 },
  { date: 'Mar 20', 'RUH→LHR': 2500, 'RUH→IST': 1200, 'RUH→BKK': 2400 },
  { date: 'Mar 25', 'RUH→LHR': 2200, 'RUH→IST': 1100, 'RUH→BKK': 2200 },
  { date: 'Mar 30', 'RUH→LHR': 1950, 'RUH→IST': 980, 'RUH→BKK': 1900 },
  { date: 'Apr 1', 'RUH→LHR': 1850, 'RUH→IST': 950, 'RUH→BKK': 1650 },
];

export default function PriceWatchdog() {
  const [tracked, setTracked] = useState(defaultTracked);
  const [newRoute, setNewRoute] = useState('');
  const [newTarget, setNewTarget] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tracked-flights-v2');
      if (saved) setTracked(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('tracked-flights-v2', JSON.stringify(tracked));
  }, [tracked]);

  function addRoute() {
    if (!newRoute || !newTarget) return;
    setTracked([...tracked, {
      id: Date.now(), route: newRoute, targetPrice: Number(newTarget),
      currentPrice: Math.round(Number(newTarget) * 1.3), trend: 'flat', change: 0,
    }]);
    setNewRoute('');
    setNewTarget('');
  }

  function removeRoute(id) {
    setTracked(tracked.filter(t => t.id !== id));
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-accent-green" />
          </div>
          Price Watchdog
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">Automated price tracking with TanStack Query polling</p>
      </div>

      {/* Alerts */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent-amber" />
          Alert Center
          <span className="px-1.5 py-0.5 rounded-full bg-accent-red/20 text-accent-red text-[10px] font-bold">
            {notifications.filter(n => n.urgent).length}
          </span>
        </h3>
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-center justify-between p-3 rounded-lg ${
              n.urgent ? 'bg-accent-red/5 border border-accent-red/20' : 'bg-surface-hover border border-border-subtle'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${n.type === 'error_fare' ? 'bg-accent-red animate-pulse' : n.type === 'price_drop' ? 'bg-accent-green' : 'bg-gray-500'}`} />
                <span className="text-sm text-gray-300">{n.message}</span>
              </div>
              <span className="text-[10px] text-gray-500 flex-shrink-0 ml-3">{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Price History (30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2b3a" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1b25', border: '1px solid #2a2b3a', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="RUH→LHR" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="RUH→IST" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="RUH→BKK" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tracked Routes */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-400" /> Tracked Routes
        </h3>
        <div className="space-y-2 mb-4">
          {tracked.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg border border-border-subtle">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-white">{t.route}</span>
                <span className="text-[11px] text-gray-500">Target: {formatPrice(t.targetPrice)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-white">{formatPrice(t.currentPrice)}</span>
                <span className={`flex items-center gap-1 text-xs font-medium ${t.change < 0 ? 'text-accent-green' : t.change > 0 ? 'text-accent-red' : 'text-gray-500'}`}>
                  {t.change < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {Math.abs(t.change)}%
                </span>
                <button onClick={() => removeRoute(t.id)} className="text-gray-500 hover:text-accent-red transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input value={newRoute} onChange={e => setNewRoute(e.target.value)} placeholder="Route (e.g. RUH → SIN)"
            className="flex-1 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50" />
          <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="Target price" type="number"
            className="w-32 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50" />
          <button onClick={addRoute} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Track
          </button>
        </div>
      </div>
    </div>
  );
}
