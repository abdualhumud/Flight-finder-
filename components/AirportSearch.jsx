'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Plane, Loader2 } from 'lucide-react';
import { useAirportSearch } from '../lib/hooks/useFlightSearch';
import { cn } from '../lib/utils';

export default function AirportSearch({ label, value, onChange, icon: Icon = MapPin, placeholder, className }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value?.name || value?.iata || '');
  const ref = useRef(null);

  const { data: results = [], isLoading } = useAirportSearch(query);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value?.name) setDisplayValue(value.name);
    else if (value?.iata) setDisplayValue(value.iata);
  }, [value]);

  function handleSelect(airport) {
    setDisplayValue(airport.name || airport.iata);
    setQuery('');
    setIsOpen(false);
    onChange(airport);
  }

  return (
    <div className={cn('relative', className)} ref={ref}>
      {label && <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>}
      <div className="relative">
        <Icon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={isOpen ? query : displayValue}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery('');
          }}
          placeholder={placeholder}
          className="w-full bg-surface-hover border border-border-subtle rounded-lg ps-9 pe-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
        />
        {isLoading && <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-surface-elevated border border-border-subtle rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {results.length === 0 && !isLoading && query.length >= 2 && (
            <div className="px-3 py-2 text-xs text-gray-500">No airports found</div>
          )}
          {results.map((airport, i) => (
            <button
              key={`${airport.iata}-${i}`}
              onClick={() => handleSelect(airport)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-start hover:bg-surface-hover transition-colors"
            >
              <Plane className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <div className="text-sm text-white">{airport.name}</div>
                <div className="text-[10px] text-gray-500">{airport.subtitle}</div>
              </div>
              <span className="ms-auto text-xs font-mono text-brand-400">{airport.iata}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
