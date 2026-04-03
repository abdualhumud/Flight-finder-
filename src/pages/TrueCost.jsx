import { Calculator, AlertTriangle, Check, ArrowDown } from 'lucide-react';
import { costComparisonData } from '../data/mockData';
import { formatPrice } from '../utils/valueScore';

function CostRow({ label, direct, expedia, skyscanner }) {
  return (
    <tr className="border-b border-border-subtle">
      <td className="px-4 py-2.5 text-xs text-gray-400">{label}</td>
      <td className="px-4 py-2.5 text-sm text-center text-gray-300">{formatPrice(direct)}</td>
      <td className="px-4 py-2.5 text-sm text-center text-gray-300">{formatPrice(expedia)}</td>
      <td className="px-4 py-2.5 text-sm text-center text-gray-300">{formatPrice(skyscanner)}</td>
    </tr>
  );
}

export default function TrueCost() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-red/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-accent-red" />
          </div>
          True Cost Calculator
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">OTA vs Direct booking with all hidden fees exposed</p>
      </div>

      <div className="glass rounded-xl p-4 flex items-start gap-3 border border-accent-amber/20">
        <AlertTriangle className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">The "cheap" OTA fare isn't always cheaper</p>
          <p className="text-xs text-gray-400 mt-1">After adding baggage, seat selection, and credit card surcharges, the "Final Landing Price" often favors direct airline booking.</p>
        </div>
      </div>

      {costComparisonData.routes.map(route => {
        const cheapest = Math.min(route.direct.total, route.expedia.total, route.skyscanner.total);
        const winner = route.direct.total === cheapest ? 'Direct' : route.expedia.total === cheapest ? 'Expedia' : 'Skyscanner';
        return (
          <div key={route.route} className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{route.route}</h3>
              <span className="flex items-center gap-1 text-xs text-accent-green font-medium">
                <Check className="w-3.5 h-3.5" />
                Best: {winner} ({formatPrice(cheapest)})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Fee Breakdown</th>
                    <th className="text-center px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Direct Airline</th>
                    <th className="text-center px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Expedia</th>
                    <th className="text-center px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Skyscanner</th>
                  </tr>
                </thead>
                <tbody>
                  <CostRow label="Base Fare" direct={route.direct.baseFare} expedia={route.expedia.baseFare} skyscanner={route.skyscanner.baseFare} />
                  <CostRow label="Baggage (23kg)" direct={route.direct.baggage} expedia={route.expedia.baggage} skyscanner={route.skyscanner.baggage} />
                  <CostRow label="Seat Selection" direct={route.direct.seatSelection} expedia={route.expedia.seatSelection} skyscanner={route.skyscanner.seatSelection} />
                  <CostRow label="Card Surcharge" direct={route.direct.cardSurcharge} expedia={route.expedia.cardSurcharge} skyscanner={route.skyscanner.cardSurcharge} />
                  <tr className="bg-surface-hover">
                    <td className="px-4 py-3 text-xs font-semibold text-white flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-brand-400" />
                      FINAL LANDING PRICE
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${route.direct.total === cheapest ? 'text-accent-green' : 'text-white'}`}>
                      {formatPrice(route.direct.total)}
                      {route.direct.total === cheapest && <Check className="w-3 h-3 inline ml-1 text-accent-green" />}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${route.expedia.total === cheapest ? 'text-accent-green' : 'text-white'}`}>
                      {formatPrice(route.expedia.total)}
                      {route.expedia.total === cheapest && <Check className="w-3 h-3 inline ml-1 text-accent-green" />}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${route.skyscanner.total === cheapest ? 'text-accent-green' : 'text-white'}`}>
                      {formatPrice(route.skyscanner.total)}
                      {route.skyscanner.total === cheapest && <Check className="w-3 h-3 inline ml-1 text-accent-green" />}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
