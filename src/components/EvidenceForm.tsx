
import React, { useState, useEffect } from 'react';
import { Evidence, EvidenceStatus, AcademicProgramId, EvidenceClassification } from '../types';
import { FACTORS, CHARACTERISTICS, EVIDENCE_TYPES, PROGRAMS } from '../constants';
import { generateId, cn } from '../utils';
import { 
  Save, X, Info, Sparkles, ExternalLink, FolderOpen, Check, Plus, Trash2, Layers 
} from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';

interface EvidenceFormProps {
  onSave: (evidence: Evidence) => void;
  onCancel: () => void;
  initialData?: Evidence;
  currentProgram?: AcademicProgramId;
}

export default function EvidenceForm({ onSave, onCancel, initialData, currentProgram }: EvidenceFormProps) {
  const { settings } = useSettings();
  
  // Initialize with at least one classification
  const initialClassifications: EvidenceClassification[] = initialData?.classifications || [
    { factorId: 1, characteristicId: 'C1' }
  ];

  const [formData, setFormData] = useState<Partial<Evidence>>({
    id: initialData?.id || generateId(),
    year: initialData?.year || new Date().getFullYear(),
    date: initialData?.date || '',
    name: initialData?.name || '',
    programs: initialData?.programs || (currentProgram && currentProgram !== 'consolidated' ? [currentProgram] : []),
    description: initialData?.description || '',
    type: initialData?.type || EVIDENCE_TYPES[0],
    supportLink: initialData?.supportLink || '',
    status: initialData?.status || 'Pendiente',
    observations: initialData?.observations || '',
    responsible: initialData?.responsible || '',
    source: initialData?.source || '',
    tags: initialData?.tags || [],
  });

  const [classifications, setClassifications] = useState<EvidenceClassification[]>(initialClassifications);
  const [tagInput, setTagInput] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  // Synchronize characteristic when factor changes in any classification
  const updateClassification = (index: number, field: keyof EvidenceClassification, value: any) => {
    const updated = [...classifications];
    if (field === 'factorId') {
      const factorId = Number(value);
      const factor = FACTORS.find(f => f.id === factorId);
      updated[index] = { 
        factorId, 
        characteristicId: factor ? factor.characteristics[0] : '' 
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setClassifications(updated);
  };

  const addClassification = () => {
    setClassifications([...classifications, { factorId: 1, characteristicId: 'C1' }]);
  };

  const removeClassification = (index: number) => {
    if (classifications.length <= 1) return;
    setClassifications(classifications.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.year || !formData.programs?.length) {
      alert("Por favor complete los campos obligatorios: Nombre, Año y al menos un Programa.");
      return;
    }

    onSave({
      ...formData as Evidence,
      classifications,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
  };

  const toggleProgram = (progId: string) => {
    const currentProgs = formData.programs || [];
    if (currentProgs.includes(progId)) {
      setFormData(prev => ({ ...prev, programs: currentProgs.filter(p => p !== progId) }));
    } else {
      setFormData(prev => ({ ...prev, programs: [...currentProgs, progId] }));
    }
  };

  const addTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }));
  };

  const handleSmartSuggest = () => {
    setSuggesting(true);
    setTimeout(() => {
      const nameLower = formData.name?.toLowerCase() || '';
      if (nameLower.includes('concierto') || nameLower.includes('recital')) {
        setClassifications([{ factorId: 7, characteristicId: 'C28' }]);
        setFormData(prev => ({ ...prev, type: 'Concierto' }));
      } else if (nameLower.includes('investigación') || nameLower.includes('semillero')) {
        setClassifications([{ factorId: 8, characteristicId: 'C30' }]);
        setFormData(prev => ({ ...prev, type: 'Investigación' }));
      } else if (nameLower.includes('egresado') || nameLower.includes('graduado')) {
        setClassifications([{ factorId: 4, characteristicId: 'C15' }]);
        setFormData(prev => ({ ...prev, type: 'Egreso' }));
      }
      setSuggesting(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {initialData ? 'Editar Registro' : 'Nuevo Registro de Evidencia'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Sistema de Acreditación Multiprograma
          </p>
        </div>
        <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-xl transition-colors text-slate-300">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Nombre y Año */}
          <div className="space-y-6 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre de la actividad / Evento*</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12 text-sm font-bold text-slate-900"
                    placeholder="Ej: Concierto de Gala 2024"
                    required
                  />
                  <button 
                    type="button"
                    onClick={handleSmartSuggest}
                    disabled={suggesting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                    title="Sugerencia Inteligente"
                  >
                    <Sparkles size={18} className={suggesting ? "animate-pulse" : ""} />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Año*</label>
                <input 
                  type="number" 
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-900"
                  required
                  min="2000"
                  max="2100"
                />
              </div>
            </div>
          </div>

          {/* Programas (Multi-selección) */}
          <div className="md:col-span-2 space-y-3">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Programas Académicos Asociados*</label>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROGRAMS.map(prog => {
                  const isSelected = formData.programs?.includes(prog.id);
                  return (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => toggleProgram(prog.id)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-bold text-xs text-left",
                        isSelected 
                          ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" 
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                      )}
                    >
                      {prog.name}
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha Exacta (Opcional)</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo de Evidencia</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700"
              >
                {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Responsable</label>
              <input 
                type="text" 
                value={formData.responsible}
                onChange={e => setFormData({...formData, responsible: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                placeholder="Nombre o dependencia"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado del Soporte</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as EvidenceStatus})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-extrabold uppercase"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Parcial">Parcial</option>
                <option value="Completo">Completo</option>
              </select>
            </div>
          </div>

          {/* Clasificaciones Múltiples */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Layers size={14} className="text-blue-600" /> Clasificación de Acreditación (Factores / Características)
              </label>
              <button 
                type="button" 
                onClick={addClassification}
                className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
              >
                <Plus size={14} /> Agregar otra clasificación
              </button>
            </div>

            <div className="space-y-4">
              {classifications.map((item, index) => {
                const availableChars = CHARACTERISTICS.filter(c => c.factorId === item.factorId);
                const currentChar = CHARACTERISTICS.find(c => c.id === item.characteristicId);
                
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group animate-in slide-in-from-top-2 duration-300">
                    {classifications.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeClassification(index)}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        title="Eliminar esta clasificación"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Factor {index + 1}</label>
                      <select 
                        value={item.factorId}
                        onChange={e => updateClassification(index, 'factorId', Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold"
                      >
                        {FACTORS.map(f => (
                          <option key={f.id} value={f.id}>
                            Factor {f.id}: {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Característica {index + 1}</label>
                      <select 
                        value={item.characteristicId}
                        onChange={e => updateClassification(index, 'characteristicId', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium"
                      >
                        {availableChars.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.id}: {c.name.substring(0, 60)}{c.name.length > 60 ? '...' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 bg-blue-50/50 p-3 rounded-lg border border-blue-200/30">
                       <p className="text-[10px] text-blue-900 font-medium leading-relaxed italic line-clamp-1">
                         <span className="font-bold uppercase tracking-wider text-[9px] opacity-70">Descripción: </span>
                         {currentChar?.description}
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
             <div className="space-y-1">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Link de Soporte (Drive / URL)*</label>
                <a 
                  href={settings.generalDriveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-widest"
                >
                  Origen General (Drive) <ExternalLink size={12} />
                </a>
              </div>
              <input 
                type="url" 
                value={formData.supportLink}
                onChange={e => setFormData({...formData, supportLink: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-blue-700"
                placeholder="https://drive.google.com/..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Descripción de la Evidencia</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-40 resize-none text-sm leading-relaxed"
                  placeholder="Detalles sobre lo que contiene el soporte..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Observaciones</label>
                <textarea 
                  value={formData.observations}
                  onChange={e => setFormData({...formData, observations: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-40 resize-none text-sm leading-relaxed italic"
                  placeholder="Anotaciones extra para el proceso de acreditación..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Palabras Clave</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                  placeholder="Escribe una etiqueta y presiona Enter..."
                />
                <button type="button" onClick={addTag} className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase hover:bg-slate-300 transition-colors">
                  Añadir
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100 flex items-center gap-2 uppercase tracking-wide">
                    {tag}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-3.5 text-xs font-bold uppercase text-slate-500 hover:text-slate-900 transition-colors tracking-widest"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-10 py-3.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Save size={18} />
            {initialData ? 'Actualizar Registro' : 'Guardar Evidencia'}
          </button>
        </div>
      </form>
    </div>
  );
}
