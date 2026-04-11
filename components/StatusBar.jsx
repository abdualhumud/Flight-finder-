'use client';

import { Wifi, Shield, Clock, Activity, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n';

export default function StatusBar() {
  const { t } = useI18n();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-8 bg-surface border-b border-border-subtle hidden md:flex items-center justify-between px-4 text-[11px] text-gray-500 flex-shrink-0">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-accent-green" />
          <span className="text-accent-green">{t('status.online')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Database className="w-3 h-3" />
          {t('status.multiSource')}
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          {t('status.vpn')}
        </span>
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3" />
          {t('status.incognito')}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>{t('status.sources')}</span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {time} UTC+3
        </span>
      </div>
    </div>
  );
}
