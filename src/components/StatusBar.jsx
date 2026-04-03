import { Wifi, Shield, Clock, Activity } from 'lucide-react';

export default function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="h-8 bg-surface border-b border-border-subtle flex items-center justify-between px-4 text-[11px] text-gray-500 flex-shrink-0">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-accent-green" />
          <span className="text-accent-green">SYSTEMS ONLINE</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          VPN Active
        </span>
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3" />
          Incognito Mode
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>6 routes tracked</span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {time} UTC+3
        </span>
      </div>
    </div>
  );
}
