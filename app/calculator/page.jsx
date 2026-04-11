'use client';

import { Calculator, AlertTriangle, Check, ArrowDown } from 'lucide-react';
import { costComparisonData } from '../../data/static';
import { formatPrice, cn } from '../../lib/utils';
import { useI18n } from '../../lib/i18n';

export default function TrueCost() {
  const { t } = useI18n();

  return (
    <div className="space-y-4 md:space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent-red/20 flex items-center justify-center flex-shrink-0"><Calculator className="w-4 h-4 md:w-5 md:h-5 text-accent-red" /></div>
          {t('calc.title')}
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1 ms-11 md:ms-[52px]">{t('calc.subtitle')}</p>
      </div>

      <div className="glass rounded-xl p-4 flex items-start gap-3 border border-accent-amber/20">
        <AlertTriangle className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">{t('calc.warning')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('calc.warningDesc')}</p>
        </div>
      </div>

      {costComparisonData.map(route => {
        const cheapest = Math.min(route.direct.total, route.expedia.total, route.skyscanner.total);
        const winner = route.direct.total === cheapest ? t('calc.directAirline') : route.expedia.total === cheapest ? 'Expedia' : 'Skyscanner';
        return (
          <div key={route.route} className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{route.route}</h3>
              <span className="flex items-center gap-1 text-xs text-accent-green font-medium">
                <Check className="w-3.5 h-3.5" /> {t('calc.best')} {winner} ({formatPrice(cheapest)})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-start px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('calc.feeBreakdown')}</th>
                    <th className="text-center px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('calc.directAirline')}</th>
                    <th className="text-center px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Expedia</th>
                    <th className="text-center px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Skyscanner</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'baseFare', labelKey: 'calc.baseFare' },
                    { key: 'baggage', labelKey: 'calc.baggage' },
                    { key: 'seatSelection', labelKey: 'calc.seatSelection' },
                    { key: 'cardSurcharge', labelKey: 'calc.cardSurcharge' },
                  ].map(fee => (
                    <tr key={fee.key} className="border-b border-border-subtle">
                      <td className="px-4 py-2.5 text-xs text-gray-400">{t(fee.labelKey)}</td>
                      <td className="px-4 py-2.5 text-sm text-center text-gray-300">{formatPrice(route.direct[fee.key])}</td>
                      <td className="px-4 py-2.5 text-sm text-center text-gray-300">{formatPrice(route.expedia[fee.key])}</td>
                      <td className="px-4 py-2.5 text-sm text-center text-gray-300">{formatPrice(route.skyscanner[fee.key])}</td>
                    </tr>
                  ))}
                  <tr className="bg-surface-hover">
                    <td className="px-4 py-3 text-xs font-semibold text-white flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-brand-400" /> {t('calc.finalPrice')}
                    </td>
                    {['direct', 'expedia', 'skyscanner'].map(src => (
                      <td key={src} className={cn('px-4 py-3 text-center font-bold', route[src].total === cheapest ? 'text-accent-green' : 'text-white')}>
                        {formatPrice(route[src].total)}
                        {route[src].total === cheapest && <Check className="w-3 h-3 inline ms-1 text-accent-green" />}
                      </td>
                    ))}
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
