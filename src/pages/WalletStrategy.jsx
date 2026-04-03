import { useState } from 'react';
import { CreditCard, Check, X, Star, ArrowRight, Wallet } from 'lucide-react';
import { creditCards } from '../data/mockData';
import { formatPrice } from '../utils/valueScore';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function WalletStrategy() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [spendTrackers, setSpendTrackers] = useLocalStorage('spend-trackers', {});

  function updateSpend(cardId, amount) {
    setSpendTrackers({ ...spendTrackers, [cardId]: Number(amount) || 0 });
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-accent-amber" />
          </div>
          Wallet Strategy
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">Credit card comparison with points optimizer</p>
      </div>

      {/* Card Comparison Matrix */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Card</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Annual Fee</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Sign-up Bonus</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Min Spend</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Points/SAR</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Lounge</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Companion</th>
              </tr>
            </thead>
            <tbody>
              {creditCards.map(card => (
                <tr
                  key={card.id}
                  onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                  className={`border-b border-border-subtle cursor-pointer transition-colors ${
                    selectedCard === card.id ? 'bg-brand-500/5' : 'hover:bg-surface-hover'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{card.name}</div>
                    <div className="text-[10px] text-gray-500">{card.bank}</div>
                  </td>
                  <td className="text-center px-4 py-3 text-gray-300">{formatPrice(card.annualFee)}</td>
                  <td className="text-center px-4 py-3">
                    <span className="text-accent-green font-medium">{card.signupBonus.toLocaleString()}</span>
                  </td>
                  <td className="text-center px-4 py-3 text-gray-300">
                    {formatPrice(card.minSpend)}
                    <div className="text-[10px] text-gray-500">{card.minSpendPeriod}</div>
                  </td>
                  <td className="text-center px-4 py-3 text-accent-amber font-medium">{card.pointsPerSar}x</td>
                  <td className="text-center px-4 py-3">
                    {card.loungeAccess ? <Check className="w-4 h-4 text-accent-green mx-auto" /> : <X className="w-4 h-4 text-gray-600 mx-auto" />}
                  </td>
                  <td className="text-center px-4 py-3">
                    {card.companionPass ? <Check className="w-4 h-4 text-accent-green mx-auto" /> : <X className="w-4 h-4 text-gray-600 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Card Detail */}
      {selectedCard && (() => {
        const card = creditCards.find(c => c.id === selectedCard);
        const currentSpend = spendTrackers[card.id] || 0;
        const progress = Math.min((currentSpend / card.minSpend) * 100, 100);
        return (
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{card.name}</h3>
                <p className="text-xs text-gray-500">{card.bestFor}</p>
              </div>
              <div className="flex items-center gap-1 text-accent-amber">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">Recommended</span>
              </div>
            </div>

            {/* Spend Tracker */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Minimum Spend Progress</span>
                <span>{formatPrice(currentSpend)} / {formatPrice(card.minSpend)}</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-accent-green' : 'bg-brand-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={currentSpend || ''}
                  onChange={e => updateSpend(card.id, e.target.value)}
                  placeholder="Enter current spend"
                  className="flex-1 bg-surface border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
                />
              </div>
            </div>

            {/* Transfer Partners */}
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Transfer Partners</h4>
              <div className="flex flex-wrap gap-2">
                {card.transferPartners.map(partner => (
                  <span key={partner} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-hover border border-border-subtle text-xs text-gray-300">
                    <ArrowRight className="w-3 h-3 text-brand-400" />
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
