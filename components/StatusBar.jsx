'use client';

import { Wifi, Shield, Clock, Activity, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-8 bg-surface border-b border-border-subtle flex items-center justify-between px-4 text-[11px] text-gray-500 flex-shrink-0">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-accent-green" />
          <span className="text-accent-green">ENGINE ONLINE</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Database className="w-3 h-3" />
          Multi-Source
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          VPN Ready
        </span>
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3" />
          Incognito Mode
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Amadeus + Deep-Links</span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {time} UTC+3
        </span>
      </div>
    </div>
  );
}
