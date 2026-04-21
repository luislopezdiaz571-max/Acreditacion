import React from 'react';
import { Filter, CalendarRange, CalendarDays, Hash } from 'lucide-react';
import { cn } from '../utils';
import { YearFilter } from '../types';

interface YearSelectorProps {
  years: number[];
  filterYear: YearFilter;
  onYearChange: (filter: YearFilter) => void;
  className?: string;
}

export default function YearSelector({ years, filterYear, onYearChange, className }: YearSelectorProps) {
  const sortedYears = [...years].sort((a, b) => b - a);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return (
    <div className={cn("flex flex-wrap items-center gap-4 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm", className)}>
      <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
        <Filter size={14} className="text-blue-600" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Modo filtro</span>
        <select 
          value={filterYear.type}
          onChange={(e) => {
            const type = e.target.value as YearFilter['type'];
            if (type === 'all') onYearChange({ type: 'all' });
            else if (type === 'single') onYearChange({ type: 'single', year: sortedYears[0] });
            else if (type === 'range') onYearChange({ type: 'range', startYear: minYear, endYear: maxYear });
          }}
          className="bg-transparent border-none text-xs font-black text-slate-900 focus:ring-0 cursor-pointer p-0 pl-2 h-auto uppercase"
        >
          <option value="all">Todo el historial</option>
          <option value="single">Año específico</option>
          <option value="range">Rango de años</option>
        </select>
      </div>

      {filterYear.type === 'single' && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <CalendarDays size={14} className="text-blue-600" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Año</span>
          <select 
            value={filterYear.year || sortedYears[0]}
            onChange={(e) => onYearChange({ ...filterYear, year: Number(e.target.value) })}
            className="bg-transparent border-none text-xs font-black text-slate-900 focus:ring-0 cursor-pointer p-0 pl-2 h-auto"
          >
            {sortedYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {filterYear.type === 'range' && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
          <CalendarRange size={14} className="text-blue-600" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Desde</span>
            <select 
              value={filterYear.startYear || minYear}
              onChange={(e) => onYearChange({ ...filterYear, startYear: Number(e.target.value) })}
              className="bg-transparent border-none text-xs font-black text-slate-900 focus:ring-0 cursor-pointer p-0 pl-1 h-auto"
            >
              {[...sortedYears].reverse().map(y => (
                <option key={y} value={y} disabled={filterYear.endYear ? y > filterYear.endYear : false}>{y}</option>
              ))}
            </select>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Hasta</span>
            <select 
              value={filterYear.endYear || maxYear}
              onChange={(e) => onYearChange({ ...filterYear, endYear: Number(e.target.value) })}
              className="bg-transparent border-none text-xs font-black text-slate-900 focus:ring-0 cursor-pointer p-0 pl-1 h-auto"
            >
              {sortedYears.map(y => (
                <option key={y} value={y} disabled={filterYear.startYear ? y < filterYear.startYear : false}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filterYear.type === 'all' && (
        <div className="flex items-center gap-2 text-slate-400 italic animate-in fade-in duration-300">
          <Hash size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sin restricciones temporales</span>
        </div>
      )}
    </div>
  );
}
