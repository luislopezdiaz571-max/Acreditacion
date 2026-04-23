
import React, { useState } from 'react';
import { Evidence, EvidenceStatus, YearFilter } from '../types';
import { FACTORS, CHARACTERISTICS } from '../constants';
import { Search, Info, HelpCircle, CheckCircle, ChevronDown, ChevronUp, ExternalLink, Calendar, User, FileText, Tag, Database, FolderOpen, Layers, Table, Bookmark } from 'lucide-react';
import { formatDate, cn } from '../utils';
import { useSettings } from '../lib/SettingsContext';
import YearSelector from './YearSelector';

interface MatrixViewProps {
  evidences: Evidence[];
  filterYear: YearFilter;
  availableYears: number[];
  onYearChange: (filter: YearFilter) => void;
  isConsolidated?: boolean;
}

export default function MatrixView({ evidences, filterYear, availableYears, onYearChange, isConsolidated }: MatrixViewProps) {
  const { settings } = useSettings();
  const [activeFactor, setActiveFactor] = useState<number | null>(null);
  const [expandedChar, setExpandedChar] = useState<string | null>(null);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Factor Quick Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-flex flex-wrap gap-1">
        {FACTORS.map(f => (
          <button 
            key={f.id}
            onClick={() => setActiveFactor(activeFactor === f.id ? null : f.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all",
              activeFactor === f.id 
                ? "bg-slate-900 text-white shadow-xl" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            Factor {f.id}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {FACTORS.filter(f => !activeFactor || f.id === activeFactor).map(factor => {
          const factorChars = CHARACTERISTICS.filter(c => c.factorId === factor.id);
          const factorEvidenceCount = evidences.filter(e => e.classifications.some(cl => cl.factorId === factor.id)).length;

          return (
            <section key={factor.id} className="scroll-mt-10 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b border-slate-200 pb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-blue-600/30">
                  <span className="text-xs font-bold opacity-70 leading-none mb-1 uppercase">F</span>
                  <span className="text-2xl font-black leading-none">{factor.id}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{factor.name}</h3>
                    {factorEvidenceCount > 0 && (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {factorEvidenceCount} {factorEvidenceCount === 1 ? 'EVIDENCIA' : 'EVIDENCIAS'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Compendio de información normativa y documental</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {factorChars.map(char => {
                  const charEvidences = evidences.filter(e => e.classifications.some(cl => cl.characteristicId === char.id));
                  const isActive = expandedChar === char.id;

                  return (
                    <div 
                      key={char.id} 
                      className={cn(
                        "bg-white rounded-2xl border transition-all duration-500",
                        isActive 
                          ? "border-blue-400 shadow-2xl ring-4 ring-blue-50 z-10" 
                          : "border-slate-100 hover:border-slate-300 shadow-sm"
                      )}
                    >
                      {/* Char Header */}
                      <button 
                        onClick={() => setExpandedChar(isActive ? null : char.id)}
                        className="w-full text-left p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 group"
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5">
                              <Layers size={10} /> Característica {char.id}
                            </span>
                            {charEvidences.length > 0 ? (
                              <span className="text-[10px] font-black text-blue-600 px-2.5 py-1.5 bg-blue-50 rounded-lg border border-blue-100 uppercase tracking-widest">
                                {charEvidences.length} {charEvidences.length === 1 ? 'Evidencia' : 'Evidencias'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100 uppercase tracking-widest">
                                Sin registros
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-xl leading-snug group-hover:text-blue-600 transition-colors">{char.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-4xl line-clamp-2 italic">
                            {char.description}
                          </p>
                        </div>
                        <div className="flex items-center self-end md:self-center">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                            isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                          )}>
                            {isActive ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </div>
                        </div>
                      </button>

                      {/* Char Evidences (Expanded) */}
                      {isActive && (
                        <div className="border-t border-slate-100 bg-slate-50/30 p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
                          {/* Normative Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-3">
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Info size={14} className="text-blue-500" /> Descripción detallada de la característica
                               </h5>
                               <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                  {char.description}
                               </p>
                            </div>
                            <div className="space-y-3">
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <HelpCircle size={14} className="text-amber-500" /> Ejemplos sugeridos
                               </h5>
                               <div className="flex flex-wrap gap-2">
                                 {char.examples.map((ex, i) => (
                                   <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-bold border border-amber-100 uppercase tracking-tight">
                                     {ex}
                                   </span>
                                 ))}
                               </div>
                            </div>
                          </div>

                          {/* Registered Evidences List */}
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                 <Database size={18} className="text-blue-600" />
                                 Acervo Documental Registrado
                              </h5>
                              {charEvidences.length > 0 && (
                                <span className="text-[10px] font-bold text-slate-400">Mostrando {charEvidences.length} de {charEvidences.length}</span>
                              )}
                            </div>

                            {charEvidences.length === 0 ? (
                              <div className="bg-white py-16 text-center rounded-3xl border-2 border-dashed border-slate-200">
                                <FolderOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                <h6 className="text-base font-bold text-slate-800">Sin evidencias aún</h6>
                                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">Esta característica requiere que se registren documentos para demostrar cumplimiento.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {charEvidences.map(evidence => (
                                  <EvidenceCompactCard key={evidence.id} evidence={evidence} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function EvidenceCompactCard({ evidence }: { evidence: Evidence }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between group animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <StatusBadge status={evidence.status} />
            <div className="flex flex-wrap gap-1.5">
              {evidence.classifications.map((cl, idx) => (
                <span key={idx} className="text-[8px] font-black py-0.5 px-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200 uppercase tracking-tight">
                  F{cl.factorId} • {cl.characteristicId}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
               {evidence.programs.map(p => (
                 <span key={p} className="text-[8px] font-black py-0.5 px-1.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-tight">
                   {p}
                 </span>
               ))}
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
            {evidence.years?.length > 1 
              ? (Math.max(...evidence.years) - Math.min(...evidence.years) === evidence.years.length - 1 && evidence.years.length > 2
                 ? `${Math.min(...evidence.years)} - ${Math.max(...evidence.years)}` 
                 : evidence.years.sort((a,b)=>a-b).join(', '))
              : (evidence.years?.[0] || 'N/A')}
          </span>
        </div>
        
        <div>
          <h6 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition-colors uppercase tracking-tight leading-tight">
            {evidence.name}
          </h6>
          
          <div className="mt-3 text-xs text-slate-600 leading-relaxed">
            <p className={cn(
              "transition-all duration-500",
              !isExpanded && "line-clamp-2"
            )}>
              {evidence.description || "Sin descripción."}
            </p>
            
            {isExpanded && evidence.observations && (
              <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Anotaciones adicionales</span>
                <p className="italic text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                  {evidence.observations}
                </p>
              </div>
            )}

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-[10px] font-extrabold text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              {isExpanded ? (
                <>LEER MENOS <ChevronUp size={14} /></>
              ) : (
                <>LEER MÁS <ChevronDown size={14} /></>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
             <Tag size={14} className="text-slate-300" />
             {evidence.type}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-50 flex justify-end">
        {evidence.supportLink ? (
          <a 
            href={evidence.supportLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-black text-white bg-slate-900 px-4 py-2.5 rounded-xl flex items-center gap-2 uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-600/20 transition-all active:scale-95"
          >
            ABRIR SOPORTE <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-4 py-2.5 rounded-xl">Sin Soporte</span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EvidenceStatus }) {
  const styles = {
    'Completo': "bg-emerald-50 text-emerald-700 border-emerald-100",
    'Parcial': "bg-amber-50 text-amber-700 border-amber-100",
    'Pendiente': "bg-rose-50 text-rose-700 border-rose-100"
  };

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-sm",
      styles[status]
    )}>
      {status}
    </span>
  );
}
