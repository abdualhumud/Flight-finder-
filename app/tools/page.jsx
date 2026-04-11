'use client';

import { useState, useEffect } from 'react';
import { Zap, CheckSquare, Square, RotateCcw, Star, Map } from 'lucide-react';
import { sweetSpots, tripChecklist } from '../../data/static';
import { airports } from '../../data/airports';
import { cn } from '../../lib/utils';
import { useI18n } from '../../lib/i18n';

const ratingColors = {
  Excellent: 'text-accent-green bg-accent-green/10',
  Great: 'text-brand-400 bg-brand-400/10',
  Good: 'text-accent-amber bg-accent-amber/10',
};

export default function HackerTools() {
  const { t } = useI18n();
  const [checklist, setChecklist] = useState(tripChecklist);

  useEffect(() => { try { const s = localStorage.getItem('trip-checklist-v2'); if (s) setChecklist(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { localStorage.setItem('trip-checklist-v2', JSON.stringify(checklist)); }, [checklist]);

  function toggleItem(categoryId, itemId) {
    setChecklist(checklist.map(cat =>
      cat.id === categoryId ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) } : cat
    ));
  }

  const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = checklist.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0);

  return (
    <div className="space-y-4 md:space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center flex-shrink-0"><Zap className="w-4 h-4 md:w-5 md:h-5 text-accent-purple" /></div>
          {t('tools.title')}
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1 ms-11 md:ms-[52px]">{t('tools.subtitle')}</p>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-accent-amber" /> {t('tools.sweetSpots')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {['Program', 'Route', 'Miles Needed', 'Cash Value', 'Cents/Mile', 'Rating'].map(h => (
                  <th key={h} className={`${h === 'Program' || h === 'Route' ? 'text-start' : 'text-center'} px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sweetSpots.map((spot, i) => (
                <tr key={i} className="border-b border-border-subtle hover:bg-surface-hover transition-colors">
                  <td className="px-3 py-2.5 font-medium text-white">{spot.program}</td>
                  <td className="px-3 py-2.5 text-gray-300">{spot.route}</td>
                  <td className="px-3 py-2.5 text-center text-accent-amber">{spot.milesRequired.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center text-gray-300">SAR {spot.cashValue.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-white">{spot.centsPerMile}</td>
                  <td className="px-3 py-2.5 text-center"><span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', ratingColors[spot.rating])}>{spot.rating}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Map className="w-4 h-4 text-accent-cyan" /> {t('tools.cheapZones')}</h3>
        <div className="bg-surface rounded-xl p-4 relative overflow-hidden" style={{ minHeight: 320 }}>
          <svg viewBox="-20 -10 200 130" className="w-full h-full" style={{ minHeight: 300 }}>
            <rect x="-20" y="-10" width="200" height="130" fill="#12131a" rx="8" />
            {[0, 20, 40, 60, 80, 100, 120].map(y => <line key={`h${y}`} x1="-20" y1={y} x2="180" y2={y} stroke="#1a1b25" strokeWidth="0.3" />)}
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180].map(x => <line key={`v${x}`} x1={x-20} y1="-10" x2={x-20} y2="120" stroke="#1a1b25" strokeWidth="0.3" />)}
            {airports.filter(a => !['RUH','JED'].includes(a.code)).map(a => {
              const ruh = airports.find(ap => ap.code === 'RUH');
              const x1 = ((ruh.lng+180)/360)*180-20, y1 = ((90-ruh.lat)/180)*120-10;
              const x2 = ((a.lng+180)/360)*180-20, y2 = ((90-a.lat)/180)*120-10;
              return <line key={a.code} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0ea5e9" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.4" />;
            })}
            {airports.map(a => {
              const x = ((a.lng+180)/360)*180-20, y = ((90-a.lat)/180)*120-10;
              const isHome = ['RUH','JED'].includes(a.code);
              const zones = { IST:'green',BKK:'green',KUL:'green',CAI:'green',DXB:'green',BOM:'green',LHR:'amber',CDG:'amber',FCO:'amber',MLE:'amber',SIN:'amber',GVA:'amber',AMS:'amber',BCN:'amber',FRA:'amber',MNL:'red',NRT:'red',JFK:'red' };
              const color = isHome ? '#0ea5e9' : zones[a.code]==='green' ? '#22c55e' : zones[a.code]==='amber' ? '#f59e0b' : '#ef4444';
              return (
                <g key={a.code}>
                  <circle cx={x} cy={y} r={isHome?3:2} fill={color} opacity={isHome?1:0.8} />
                  {isHome && <circle cx={x} cy={y} r={5} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />}
                  <text x={x} y={y-4} textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="Inter, sans-serif">{a.code}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-accent-green" /> {t('tools.tripChecklist')}
            <span className="text-[10px] text-gray-500 font-normal ms-2">{checkedItems}/{totalItems} {t('tools.complete')}</span>
          </h3>
          <button onClick={() => setChecklist(tripChecklist)} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
            <RotateCcw className="w-3 h-3" /> {t('tools.reset')}
          </button>
        </div>
        <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-accent-green rounded-full transition-all duration-500" style={{ width: `${(checkedItems/totalItems)*100}%` }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {checklist.map(category => (
            <div key={category.id} className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
              <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">{category.category}</h4>
              <div className="space-y-1.5">
                {category.items.map(item => (
                  <button key={item.id} onClick={() => toggleItem(category.id, item.id)}
                    className="w-full flex items-center gap-2 text-start text-sm py-1 hover:text-white transition-colors">
                    {item.checked ? <CheckSquare className="w-4 h-4 text-accent-green flex-shrink-0" /> : <Square className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                    <span className={item.checked ? 'text-gray-500 line-through' : 'text-gray-300'}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
