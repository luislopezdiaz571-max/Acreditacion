
import React, { useState } from 'react';
import { Evidence, EvidenceStatus } from '../types';
import { FACTORS, CHARACTERISTICS } from '../constants';
import { Search, Info, HelpCircle, CheckCircle, ChevronDown, ChevronUp, ExternalLink, Calendar, User, FileText, Tag, Database } from 'lucide-react';
import { formatDate, cn } from '../utils';

interface MatrixViewProps {
  evidences: Evidence[];
}

export default function MatrixView({ evidences }: MatrixViewProps) {
  const [activeFactor, setActiveFactor] = useState<number | null>(null);
  const [expandedChar, setExpandedChar] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-slate-900 p-10 rounded-2xl text-white shadow-xl shadow-slate-200 mb-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Explorador de Acreditación CNA</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Navegue por factores y características para consultar las evidencias registradas. Todo el sistema se alimenta automáticamente de sus registros.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </header>

      {/* Factor Quick Navigation */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FACTORS.map(f => (
          <button 
            key={f.id}
            onClick={() => setActiveFactor(activeFactor === f.id ? null : f.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
              activeFactor === f.id 
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"
            )}
          >
            Factor {f.id}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {FACTORS.filter(f => !activeFactor || f.id === activeFactor).map(factor => (
          <section key={factor.id} className="scroll-mt-6 animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg">
                {factor.id}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{factor.name}</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Factor de Acreditación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {CHARACTERISTICS.filter(c => c.factorId === factor.id).map(char => {
                const charEvidences = evidences.filter(e => e.characteristicId === char.id);
                const isActive = expandedChar === char.id;

                return (
                  <div 
                    key={char.id} 
                    className={cn(
                      "bg-white rounded-xl border transition-all duration-300",
                      isActive ? "border-blue-500 shadow-xl ring-1 ring-blue-50" : "border-slate-200 shadow-sm hover:border-slate-300"
                    )}
                  >
                    {/* Char Header */}
                    <button 
                      onClick={() => setExpandedChar(isActive ? null : char.id)}
                      className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded uppercase tracking-widest">Característica {char.id}</span>
                          {charEvidences.length > 0 && (
                            <span className="text-[10px] font-bold text-green-600 px-2 py-1 bg-green-50 rounded uppercase tracking-widest">
                              {charEvidences.length} {charEvidences.length === 1 ? 'Evidencia' : 'Evidencias'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{char.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                          {char.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}>
                          {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </button>

                    {/* Char Evidences (Expanded) */}
                    {isActive && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        {/* Examples Section */}
                        <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                           <div className="flex items-center gap-2 mb-3">
                             <HelpCircle size={14} className="text-blue-500" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ejemplos sugeridos por el CNA:</span>
                           </div>
                           <div className="flex flex-wrap gap-1.5">
                             {char.examples.map((ex, i) => (
                               <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[9px] font-medium border border-slate-100 uppercase tracking-tighter">
                                 {ex}
                               </span>
                             ))}
                           </div>
                        </div>

                        {/* Registered Evidences List */}
                        <div className="space-y-4">
                          <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                             <Database size={14} className="text-blue-600" />
                             Evidencias Registradas en el Programa
                          </h5>

                          {charEvidences.length === 0 ? (
                            <div className="bg-white py-12 text-center rounded-xl border border-slate-200 border-dashed">
                              <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                              <p className="text-sm text-slate-500">No hay evidencias registradas para esta característica aún.</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Se requiere gestión documental</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
        ))}
      </div>
    </div>
  );
}

function EvidenceCompactCard({ evidence }: { evidence: Evidence, key?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group transition-all duration-200">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <StatusBadge status={evidence.status} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(evidence.date)}</span>
        </div>
        
        <div>
          <h6 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">
            {evidence.name}
          </h6>
          
          <div className="mt-2 text-xs text-slate-500 leading-relaxed">
            <p className={cn(
              "transition-all duration-300",
              !isExpanded && "line-clamp-2"
            )}>
              {evidence.description}
            </p>
            
            {isExpanded && evidence.observations && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Observaciones</span>
                <p className="italic text-slate-600">
                  {evidence.observations}
                </p>
              </div>
            )}

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-[9px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1"
            >
              {isExpanded ? (
                <>Contraer <ChevronUp size={10} /></>
              ) : (
                <>Mostrar completo <ChevronDown size={10} /></>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
             <User size={12} className="text-slate-300" />
             {evidence.responsible || "Sin asignar"}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
             <Tag size={12} className="text-slate-300" />
             {evidence.type}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
        {evidence.supportLink ? (
          <a 
            href={evidence.supportLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-widest hover:text-blue-800 transition-colors"
          >
            Soporte <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sin Soporte</span>
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
      "px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-tight",
      styles[status]
    )}>
      {status}
    </span>
  );
}
