'use client';

import { useState } from 'react';
import { MessageSquare, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { upgradeTemplates } from '../../data/static';
import { useI18n } from '../../lib/i18n';

export default function UpgradeSuite() {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(null);
  const [formData, setFormData] = useState({
    airline: '', flightNumber: '', date: '', origin: '', destination: '',
    name: '', loyaltyNumber: '', status: '',
  });

  function fillTemplate(template) {
    let filled = template;
    const replacements = {
      '[Airline]': formData.airline, '[Flight Number]': formData.flightNumber,
      '[Date]': formData.date, '[Origin]': formData.origin, '[Destination]': formData.destination,
      '[Your Name]': formData.name, '[Number]': formData.loyaltyNumber,
      '[Loyalty Program]': formData.airline ? `${formData.airline} Loyalty` : '[Loyalty Program]',
      '[Status Level]': formData.status, '[Home Airport]': formData.origin,
    };
    for (const [key, value] of Object.entries(replacements)) {
      if (value) filled = filled.replaceAll(key, value);
    }
    return filled;
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent-cyan/20 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-accent-cyan" /></div>
          {t('upgrade.title')}
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1 ms-11 md:ms-[52px]">{t('upgrade.subtitle')}</p>
      </div>

      <div className="glass rounded-xl p-4 md:p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-amber" /> {t('upgrade.flightDetails')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: 'name', placeholder: 'Your Name' }, { key: 'airline', placeholder: 'Airline' },
            { key: 'flightNumber', placeholder: 'Flight Number' }, { key: 'date', placeholder: 'Travel Date', type: 'date' },
            { key: 'origin', placeholder: 'Origin (e.g. RUH)' }, { key: 'destination', placeholder: 'Destination (e.g. LHR)' },
            { key: 'loyaltyNumber', placeholder: 'Loyalty Member #' }, { key: 'status', placeholder: 'Status Level' },
          ].map(field => (
            <input key={field.key} type={field.type || 'text'} value={formData[field.key]}
              onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="bg-surface-hover border border-border-subtle rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {upgradeTemplates.map(tmpl => {
          const isExpanded = expandedId === tmpl.id;
          const filledText = fillTemplate(tmpl.template);
          return (
            <div key={tmpl.id} className="glass rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : tmpl.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors text-start">
                <div><h3 className="text-sm font-semibold text-white">{tmpl.name}</h3><p className="text-xs text-gray-500 mt-0.5">Trigger: {tmpl.trigger}</p></div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border-subtle pt-4">
                  <pre className="bg-surface rounded-lg p-4 text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-80" dir="ltr">{filledText}</pre>
                  <button onClick={() => copyToClipboard(filledText, tmpl.id)}
                    className="mt-3 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2">
                    {copied === tmpl.id ? <><Check className="w-3.5 h-3.5" /> {t('upgrade.copied')}</> : <><Copy className="w-3.5 h-3.5" /> {t('upgrade.copyToClipboard')}</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
