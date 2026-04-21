
import React, { useState } from 'react';
import { Evidence, EvidenceStatus, YearFilter } from '../types';
import { FACTORS, CHARACTERISTICS, EVIDENCE_TYPES, PROGRAMS } from '../constants';
import { formatDate, cn } from '../utils';
import { 
  Search, ExternalLink, Edit2, Trash2, Calendar, 
  Tag, FileX, ChevronDown, ChevronUp, Filter, Music, History, CalendarRange, Plus
} from 'lucide-react';
import YearSelector from './YearSelector';

interface EvidenceListProps {
  evidences: Evidence[];
  filterYear: YearFilter;
  availableYears: number[];
  onYearChange: (filter: YearFilter) => void;
  onEdit: (evidence: Evidence) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  showProgramCol?: boolean;
}

export default function EvidenceList({ 
  evidences, 
  onEdit, 
  onDelete, 
  onAdd,
  showProgramCol,
  filterYear,
  availableYears,
  onYearChange
}: EvidenceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFactor, setFilterFactor] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<string | 'all'>('all');
  const [filterProgram, setFilterProgram] = useState<string | 'all'>('all');

  const filtered = evidences.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFactor = filterFactor === 'all' || e.classifications.some(c => c.factorId === filterFactor);
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesProgram = filterProgram === 'all' || e.programs.includes(filterProgram);

    return matchesSearch && matchesFactor && matchesType && matchesProgram;
  });

  return (
    <div className="space-y-6">
      {/* Header Contextual */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Historial Documental</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Registros de evidencias del programa</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <YearSelector years={availableYears} filterYear={filterYear} onYearChange={onYearChange} />
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus size={16} /> NUEVA EVIDENCIA
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, descripción o etiquetas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl border border-slate-200">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={filterFactor}
              onChange={e => setFilterFactor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="flex-1 py-2.5 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer"
            >
              <option value="all">TODOS LOS FACTORES</option>
              {FACTORS.map(f => <option key={f.id} value={f.id}>FACTOR {f.id}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl border border-slate-200">
            <Tag size={14} className="text-slate-400" />
            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="flex-1 py-2.5 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer"
            >
              <option value="all">TODOS LOS TIPOS</option>
              {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl border border-slate-200">
            <Music size={14} className="text-slate-400" />
            <select 
              value={filterProgram}
              onChange={e => setFilterProgram(e.target.value)}
              className="flex-1 py-2.5 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer"
            >
              <option value="all">TODOS LOS PROGRAMAS</option>
              {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in slide-in-from-bottom-5 duration-500">
          {filtered.map(evidence => (
            <EvidenceCard 
              key={evidence.id} 
              evidence={evidence} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <FileX size={56} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-bold text-slate-900">No se encontraron evidencias</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Prueba ajustando los filtros de año o búsqueda para encontrar lo que necesitas.</p>
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ evidence, onEdit, onDelete }: { 
  evidence: Evidence;
  onEdit: (e: Evidence) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all overflow-hidden flex flex-col h-full animate-in zoom-in-95 duration-300">
      <div className="p-6 flex-1 space-y-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-1.5">
              {evidence.classifications.map((cl, idx) => (
                <span key={idx} className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                  F{cl.factorId} • {cl.characteristicId}
                </span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
               {evidence.programs.map(p => (
                 <span key={p} className="text-[9px] font-bold py-0.5 px-2 bg-slate-900 text-slate-200 rounded-md uppercase tracking-tight">
                   {p}
                 </span>
               ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={evidence.status} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{evidence.year}</span>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
            {evidence.name}
          </h4>
          
          <div className="mt-3 relative">
            <p className={cn(
              "text-xs text-slate-600 leading-relaxed transition-all duration-500",
              !isExpanded && "line-clamp-2"
            )}>
              {evidence.description || "Sin descripción proporcionada."}
            </p>
            
            {isExpanded && evidence.observations && (
              <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Observaciones del Registro</span>
                <p className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 leading-relaxed">
                  {evidence.observations}
                </p>
              </div>
            )}

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              {isExpanded ? (
                <>MOSTRAR MENOS <ChevronUp size={14} /></>
              ) : (
                <>EXPANDIR INFORMACIÓN <ChevronDown size={14} /></>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-300" />
            {evidence.date ? formatDate(evidence.date) : evidence.year}
          </div>
          <div className="flex items-center gap-2 truncate">
            <Tag size={14} className="text-slate-300" />
            {evidence.type}
          </div>
        </div>
        
        {evidence.tags && evidence.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {evidence.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-bold border border-slate-200/50 tracking-tight">
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50/80 px-6 py-4 flex justify-between items-center border-t border-slate-100">
        <div className="flex gap-4">
          <button 
            onClick={() => onEdit(evidence)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-95"
            title="Editar evidencia"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => confirm('¿Eliminar esta evidencia de todos los programas?') && onDelete(evidence.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-95"
            title="Eliminar evidencia"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {evidence.supportLink ? (
          <a 
            href={evidence.supportLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 uppercase tracking-widest"
          >
            VER SOPORTE
            <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-4 py-2 rounded-xl uppercase tracking-widest">
            SIN SOPORTE
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EvidenceStatus }) {
  const styles = {
    'Completo': "bg-emerald-50 text-emerald-700 border-emerald-200",
    'Parcial': "bg-amber-50 text-amber-700 border-amber-200",
    'Pendiente': "bg-rose-50 text-rose-700 border-rose-200"
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-lg text-[9px] font-bold border-2 uppercase tracking-widest",
      styles[status]
    )}>
      {status}
    </span>
  );
}
