
import React, { useState, useEffect } from 'react';
import { Evidence, EvidenceStatus } from '../types';
import { FACTORS, CHARACTERISTICS, EVIDENCE_TYPES } from '../constants';
import { generateId, cn } from '../utils';
import { Save, X, Info, Sparkles, ExternalLink, FolderOpen } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';

interface EvidenceFormProps {
  onSave: (evidence: Evidence) => void;
  onCancel: () => void;
  initialData?: Evidence;
}

export default function EvidenceForm({ onSave, onCancel, initialData }: EvidenceFormProps) {
  const { settings } = useSettings();
  const [formData, setFormData] = useState<Partial<Evidence>>({
    id: initialData?.id || generateId(),
    date: initialData?.date || new Date().toISOString().split('T')[0],
    name: initialData?.name || '',
    factorId: initialData?.factorId || 1,
    characteristicId: initialData?.characteristicId || 'C1',
    description: initialData?.description || '',
    type: initialData?.type || EVIDENCE_TYPES[0],
    supportLink: initialData?.supportLink || '',
    status: initialData?.status || 'Pendiente',
    observations: initialData?.observations || '',
    responsible: initialData?.responsible || '',
    source: initialData?.source || '',
    tags: initialData?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    // Automatically filter characteristics when factor changes
    const factor = FACTORS.find(f => f.id === Number(formData.factorId));
    if (factor && !factor.characteristics.includes(formData.characteristicId as string)) {
      setFormData(prev => ({ ...prev, characteristicId: factor.characteristics[0] }));
    }
  }, [formData.factorId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;

    onSave({
      ...formData as Evidence,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
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

  // Smart suggestion simulation (could connect to Gemini)
  const handleSmartSuggest = () => {
    setSuggesting(true);
    setTimeout(() => {
      const nameLower = formData.name?.toLowerCase() || '';
      if (nameLower.includes('concierto') || nameLower.includes('recital')) {
        setFormData(prev => ({ ...prev, factorId: 7, characteristicId: 'C28', type: 'Concierto' }));
      } else if (nameLower.includes('investigación') || nameLower.includes('semillero')) {
        setFormData(prev => ({ ...prev, factorId: 8, characteristicId: 'C30', type: 'Investigación' }));
      } else if (nameLower.includes('egresado') || nameLower.includes('graduado')) {
        setFormData(prev => ({ ...prev, factorId: 4, characteristicId: 'C15', type: 'Egreso' }));
      }
      setSuggesting(false);
    }, 800);
  };

  const currentFactor = FACTORS.find(f => f.id === Number(formData.factorId));
  const availableCharacteristics = CHARACTERISTICS.filter(c => c.factorId === Number(formData.factorId));

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-tight">
            {initialData ? 'Editar Registro' : 'Nuevo Registro de Evidencia'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Sistema de Acreditación Instrumental
          </p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto bg-white">
        {/* Acceso Rápido al Drive General */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
              <FolderOpen size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-tight">Carpeta General de Evidencias</h3>
              <p className="text-[10px] text-blue-600 font-medium">Accede al repositorio organizado por factores y características</p>
            </div>
          </div>
          <a 
            href={settings.generalDriveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            Abrir Carpeta General
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre de la actividad / Evento</label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none transition-all pr-12 text-sm font-medium"
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
                <Sparkles size={16} className={suggesting ? "animate-pulse" : ""} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Evidencia</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm font-medium"
              >
                {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Responsable</label>
              <input 
                type="text" 
                value={formData.responsible}
                onChange={e => setFormData({...formData, responsible: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm font-medium"
                placeholder="Nombre o dependencia"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado del Soporte</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as EvidenceStatus})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm font-bold uppercase tracking-tight"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Parcial">Parcial</option>
                <option value="Completo">Completo</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Factor CNA</label>
              <select 
                value={formData.factorId}
                onChange={e => setFormData({...formData, factorId: Number(e.target.value)})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm"
              >
                {FACTORS.map(f => (
                  <option key={f.id} value={f.id}>
                    Factor {f.id}: {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Característica</label>
              <select 
                value={formData.characteristicId}
                onChange={e => setFormData({...formData, characteristicId: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm font-medium"
              >
                {availableCharacteristics.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.name.substring(0, 50)}{c.name.length > 50 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <p className="md:col-span-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight border-t border-slate-200 pt-3 mt-1 px-1">
              {CHARACTERISTICS.find(c => c.id === formData.characteristicId)?.description}
            </p>
          </div>

          <div className="md:col-span-2 space-y-6">
             <div className="space-y-1">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Soporte Externo (Link Drive/URL)</label>
                <a 
                  href={settings.generalDriveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-tight"
                >
                  Ir al Drive General <ExternalLink size={10} />
                </a>
              </div>
              <input 
                type="url" 
                value={formData.supportLink}
                onChange={e => setFormData({...formData, supportLink: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm font-medium"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descripción Corta</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none h-32 resize-none text-sm leading-relaxed"
                  placeholder="Detalles sobre el contenido del soporte..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observaciones / Notas Adicionales</label>
                <textarea 
                  value={formData.observations}
                  onChange={e => setFormData({...formData, observations: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none h-32 resize-none text-sm leading-relaxed italic"
                  placeholder="Anotaciones extra para el proceso de acreditación..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Palabras Clave / Etiquetas</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
                  placeholder="Escribe una etiqueta y presiona Enter..."
                />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase hover:bg-slate-300 transition-colors">
                  Añadir
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-100 flex items-center gap-1.5 uppercase tracking-wider">
                    {tag}
                    <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 text-xs font-bold uppercase text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-8 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Save size={16} />
            {initialData ? 'Guardar Cambios' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}
