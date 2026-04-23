import React from 'react';
import { Filter, CalendarRange, CalendarDays, Hash, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { YearFilter } from '../types';

interface YearSelectorProps {
  years: number[];
  filterYear: YearFilter;
  onYearChange: (filter: YearFilter) => void;
  className?: string;
}

interface ScrollPickerProps {
  value: number;
  options: number[];
  onChange: (val: number) => void;
  label?: string;
  disabledOptions?: (val: number) => boolean;
}

function ScrollPicker({ value, options, onChange, label, disabledOptions }: ScrollPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 min-w-[70px] px-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center gap-2 hover:border-blue-400 transition-all text-[10px] font-black text-blue-600 shadow-sm"
      >
        {value}
        <ChevronRight size={10} className={cn("transition-transform", isOpen ? "rotate-90" : "")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl p-1 w-24">
              <div className="h-40 overflow-y-auto scrollbar-hide snap-y snap-mandatory flex flex-col pt-2 pb-2">
                {options.map(y => {
                  const isDisabled = disabledOptions?.(y);
                  return (
                    <button
                      key={y}
                      disabled={isDisabled}
                      onClick={() => {
                        onChange(y);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full h-8 flex-shrink-0 flex items-center justify-center text-[10px] font-black transition-all snap-center",
                        value === y 
                          ? "text-blue-600 bg-blue-50" 
                          : isDisabled 
                            ? "text-slate-200 cursor-not-allowed"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
              <div className="absolute inset-x-0 top-1 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none rounded-t-xl" />
              <div className="absolute inset-x-0 bottom-1 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-xl" />
            </div>
          </div>
        </>
      )}
    </div>
  );
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
          <ScrollPicker 
            value={filterYear.year || sortedYears[0]} 
            options={sortedYears} 
            onChange={(y) => onYearChange({ ...filterYear, year: y })} 
          />
        </div>
      )}

      {filterYear.type === 'range' && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
          <CalendarRange size={14} className="text-blue-600" />
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Desde</span>
            <ScrollPicker 
              value={filterYear.startYear || minYear} 
              options={[...sortedYears].reverse()} 
              onChange={(y) => onYearChange({ ...filterYear, startYear: y })} 
              disabledOptions={(y) => !!filterYear.endYear && y > filterYear.endYear}
            />
          </div>

          <div className="w-1 h-1 rounded-full bg-slate-300" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Hasta</span>
            <ScrollPicker 
              value={filterYear.endYear || maxYear} 
              options={sortedYears} 
              onChange={(y) => onYearChange({ ...filterYear, endYear: y })} 
              disabledOptions={(y) => !!filterYear.startYear && y < filterYear.startYear}
            />
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
