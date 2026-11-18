'use client';

import { AlertTriangle } from 'lucide-react';
import { useI18n } from '../lib/i18n';

/** Shown whenever the prices on screen come from the simulator, not a live API. */
export default function SimulationNotice() {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-3 py-2.5 text-xs text-accent-amber">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-px" />
      <span>{t('flight.simulatedNotice')}</span>
    </div>
  );
}
