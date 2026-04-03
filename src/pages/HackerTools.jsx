import { useState } from 'react';
import { Zap, Globe, CheckSquare, Square, RotateCcw, Star, Map } from 'lucide-react';
import { sweetSpots, tripChecklist, airports } from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ratingColors = {
  Excellent: 'text-accent-green bg-accent-green/10',
  Great: 'text-brand-400 bg-brand-400/10',
  Good: 'text-accent-amber bg-accent-amber/10',
};

export default function HackerTools() {
  const [checklist, setChecklist] = useLocalStorage('trip-checklist', tripChecklist);

  function toggleItem(categoryId, itemId) {
    setChecklist(checklist.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) }
        : cat
    ));
  }

  function resetChecklist() {
    setChecklist(tripChecklist);
  }

  const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = checklist.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-purple" />
          </div>
          Hacker Tools
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">Mileage sweet spots, trip checklist, and cheap zone map</p>
      </div>

      {/* Sweet Spots */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-accent-amber" />
          Mileage Redemption Sweet Spots
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Program</th>
                <th className="text-left px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Route</th>
                <th className="text-center px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Miles Needed</th>
                <th className="text-center px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Cash Value</th>
                <th className="text-center px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">¢/Mile</th>
                <th className="text-center px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Rating</th>
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
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ratingColors[spot.rating]}`}>
                      {spot.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive SVG Map */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Map className="w-4 h-4 text-accent-cyan" />
          Cheap Zones from Home Base
        </h3>
        <div className="bg-surface rounded-xl p-4 relative overflow-hidden" style={{ minHeight: 320 }}>
          <svg viewBox="-20 -10 200 130" className="w-full h-full" style={{ minHeight: 300 }}>
            {/* World background simplified */}
            <rect x="-20" y="-10" width="200" height="130" fill="#12131a" rx="8" />

            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100, 120].map(y => (
              <line key={`h${y}`} x1="-20" y1={y} x2="180" y2={y} stroke="#1a1b25" strokeWidth="0.3" />
            ))}
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180].map(x => (
              <line key={`v${x}`} x1={x - 20} y1="-10" x2={x - 20} y2="120" stroke="#1a1b25" strokeWidth="0.3" />
            ))}

            {/* Connections from RUH */}
            {airports.filter(a => a.code !== 'RUH' && a.code !== 'JED').map(a => {
              const ruh = airports.find(ap => ap.code === 'RUH');
              const x1 = ((ruh.lng + 180) / 360) * 180 - 20;
              const y1 = ((90 - ruh.lat) / 180) * 120 - 10;
              const x2 = ((a.lng + 180) / 360) * 180 - 20;
              const y2 = ((90 - a.lat) / 180) * 120 - 10;
              return (
                <line key={a.code} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0ea5e9" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.4" />
              );
            })}

            {/* Airport dots */}
            {airports.map(a => {
              const x = ((a.lng + 180) / 360) * 180 - 20;
              const y = ((90 - a.lat) / 180) * 120 - 10;
              const isHome = a.code === 'RUH' || a.code === 'JED';
              const deal = [
                { code: 'IST', zone: 'green' }, { code: 'BKK', zone: 'green' },
                { code: 'KUL', zone: 'green' }, { code: 'CAI', zone: 'green' },
                { code: 'LHR', zone: 'amber' }, { code: 'CDG', zone: 'amber' },
                { code: 'FCO', zone: 'amber' }, { code: 'DXB', zone: 'green' },
                { code: 'MLE', zone: 'amber' }, { code: 'SIN', zone: 'amber' },
                { code: 'MNL', zone: 'red' }, { code: 'GVA', zone: 'amber' },
              ].find(d => d.code === a.code);
              const color = isHome ? '#0ea5e9' : deal?.zone === 'green' ? '#22c55e' : deal?.zone === 'amber' ? '#f59e0b' : '#ef4444';
              return (
                <g key={a.code}>
                  <circle cx={x} cy={y} r={isHome ? 3 : 2} fill={color} opacity={isHome ? 1 : 0.8} />
                  {isHome && <circle cx={x} cy={y} r={5} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" className="animate-pulse-slow" />}
                  <text x={x} y={y - 4} textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="Inter, sans-serif">
                    {a.code}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-4 right-4 flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green" /> Cheap Zone</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-amber" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-red" /> Premium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-400" /> Home Base</span>
          </div>
        </div>
      </div>

      {/* Trip Checklist */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-accent-green" />
            Trip Checklist 2.0
            <span className="text-[10px] text-gray-500 font-normal ml-2">{checkedItems}/{totalItems} complete</span>
          </h3>
          <button onClick={resetChecklist} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-accent-green rounded-full transition-all duration-500" style={{ width: `${(checkedItems / totalItems) * 100}%` }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {checklist.map(category => (
            <div key={category.id} className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
              <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">{category.category}</h4>
              <div className="space-y-1.5">
                {category.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(category.id, item.id)}
                    className="w-full flex items-center gap-2 text-left text-sm py-1 hover:text-white transition-colors"
                  >
                    {item.checked
                      ? <CheckSquare className="w-4 h-4 text-accent-green flex-shrink-0" />
                      : <Square className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    }
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
