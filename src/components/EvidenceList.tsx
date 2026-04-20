
import React, { useState } from 'react';
import { Evidence, EvidenceStatus } from '../types';
import { FACTORS, CHARACTERISTICS, EVIDENCE_TYPES } from '../constants';
import { formatDate, cn } from '../utils';
import { 
  Search, ExternalLink, Edit2, Trash2, Calendar, 
  Tag, FileX, ChevronDown, ChevronUp
} from 'lucide-react';

interface EvidenceListProps {
  evidences: Evidence[];
  onEdit: (evidence: Evidence) => void;
  onDelete: (id: string) => void;
}

export default function EvidenceList({ evidences, onEdit, onDelete }: EvidenceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFactor, setFilterFactor] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EvidenceStatus | 'all'>('all');

  const filtered = evidences.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFactor = filterFactor === 'all' || e.factorId === filterFactor;
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;

    return matchesSearch && matchesFactor && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar evidencias por nombre, descripción..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={filterFactor}
            onChange={e => setFilterFactor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="flex-1 md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            <option value="all">Factores</option>
            {FACTORS.map(f => <option key={f.id} value={f.id}>Factor {f.id}</option>)}
          </select>

          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="flex-1 md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            <option value="all">Estados</option>
            <option value="Completo">Completos</option>
            <option value="Parcial">Parciales</option>
            <option value="Pendiente">Pendientes</option>
          </select>
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
        <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <FileX size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No se encontraron evidencias</h3>
          <p className="text-gray-500 mt-1">Prueba ajustando los filtros o registra una nueva.</p>
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ evidence, onEdit, onDelete }: { 
  evidence: Evidence;
  onEdit: (e: Evidence) => void;
  onDelete: (id: string) => void;
  key?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const factor = FACTORS.find(f => f.id === evidence.factorId);
  const char = CHARACTERISTICS.find(c => c.id === evidence.characteristicId);

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
      <div className="p-5 flex-1 space-y-4">
        {/* Top line: Factor & Status */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Factor {evidence.factorId} • {char?.id}
          </span>
          <StatusBadge status={evidence.status} />
        </div>

        {/* Content */}
        <div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {evidence.name}
          </h4>
          
          <div className="mt-2 relative">
            <p className={cn(
              "text-xs text-slate-500 leading-relaxed transition-all duration-300",
              !isExpanded && "line-clamp-2 min-h-[2.5rem]"
            )}>
              {evidence.description || "Sin descripción proporcionada."}
            </p>
            
            {isExpanded && evidence.observations && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Observaciones</span>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  {evidence.observations}
                </p>
              </div>
            )}

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1"
            >
              {isExpanded ? (
                <>Ver menos <ChevronUp size={12} /></>
              ) : (
                <>Ver descripción completa <ChevronDown size={12} /></>
              )}
            </button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-300" />
            {formatDate(evidence.date)}
          </div>
          <div className="flex items-center gap-1.5 line-clamp-1">
            <Tag size={12} className="text-slate-300" />
            {evidence.type}
          </div>
        </div>
        
        {/* Tags */}
        {evidence.tags && evidence.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {evidence.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-medium border border-slate-100">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-t border-slate-100">
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(evidence)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-slate-200"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => confirm('¿Eliminar esta evidencia?') && onDelete(evidence.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-slate-200"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        {evidence.supportLink ? (
          <a 
            href={evidence.supportLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
          >
            Soporte Drive
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wider">
            Sin soporte
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EvidenceStatus }) {
  const styles = {
    'Completo': "bg-green-100 text-green-700 border-green-200",
    'Parcial': "bg-amber-100 text-amber-700 border-amber-200",
    'Pendiente': "bg-rose-100 text-rose-700 border-rose-200"
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-tight",
      styles[status]
    )}>
      {status}
    </span>
  );
}
