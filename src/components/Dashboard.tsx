
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Evidence, EvidenceStatus } from '../types';
import { FACTORS } from '../constants';
import { AlertCircle, CheckCircle2, Clock, FileText, LayoutDashboard, TrendingUp, Filter, Settings, Link, Save, Globe } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';

interface DashboardProps {
  evidences: Evidence[];
}

export default function Dashboard({ evidences }: DashboardProps) {
  const { settings, updateSettings } = useSettings();
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [driveLinkInput, setDriveLinkInput] = useState(settings.generalDriveLink);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = true; // Everyone can edit settings now

  const handleUpdateLink = async () => {
    if (!driveLinkInput) return;
    setIsSaving(true);
    await updateSettings({ generalDriveLink: driveLinkInput }, 'sistema');
    setIsSaving(false);
    setIsEditingSettings(false);
  };
  const [stats, setStats] = useState({
    total: 0,
    completo: 0,
    parcial: 0,
    pendiente: 0,
    factorData: [] as any[],
  });

  useEffect(() => {
    const total = evidences.length;
    const completo = evidences.filter(e => e.status === "Completo").length;
    const parcial = evidences.filter(e => e.status === "Parcial").length;
    const pendiente = evidences.filter(e => e.status === "Pendiente").length;

    const factorData = FACTORS.map(f => {
      const fEvidences = evidences.filter(e => e.factorId === f.id);
      const compl = fEvidences.filter(e => e.status === "Completo").length;
      return {
        name: `F${f.id}`,
        fullName: f.name,
        total: fEvidences.length,
        completo: compl,
        porcentaje: fEvidences.length > 0 ? (compl / fEvidences.length) * 100 : 0
      };
    });

    setStats({ total, completo, parcial, pendiente, factorData });
  }, [evidences]);

  const pieData = [
    { name: 'Completo', value: stats.completo, color: '#2563eb' },
    { name: 'Parcial', value: stats.parcial, color: '#f59e0b' },
    { name: 'Pendiente', value: stats.pendiente, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Zona de Acceso Rápido y Configuración */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 text-white">
              <Globe size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Repositorio General de Evidencias</h2>
              <p className="text-slate-400 text-xs mt-1">Acceso directo a la estructura organizada en Google Drive.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a 
              href={settings.generalDriveLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              Abrir Google Drive <Link size={14} />
            </a>
            
            {isAdmin && (
              <button 
                onClick={() => setIsEditingSettings(!isEditingSettings)}
                className={cn(
                  "px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border flex items-center gap-2",
                  isEditingSettings ? "bg-slate-800 text-white border-slate-700" : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                )}
              >
                <Settings size={14} />
                {isEditingSettings ? 'Cerrar' : 'Configurar Link'}
              </button>
            )}
          </div>
        </div>

        {isEditingSettings && isAdmin && (
          <div className="px-6 pb-8 border-t border-slate-800 pt-6 animate-in slide-in-from-top-4">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link de la Carpeta General (Drive)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="url" 
                    value={driveLinkInput}
                    onChange={(e) => setDriveLinkInput(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="https://drive.google.com/..."
                  />
                  <button 
                    onClick={handleUpdateLink}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <span className="animate-pulse">Guardando...</span> : <><Save size={14} /> Guardar Cambios</>}
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 italic">
                Última actualización: {new Date(settings.updatedAt).toLocaleString()} por {settings.updatedBy}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Evidencias Totales" 
          value={stats.total} 
          icon={<FileText className="text-slate-400" size={18} />}
          description="+12 este mes"
          trend="up"
        />
        <StatCard 
          title="Estado Completo" 
          value={stats.completo} 
          icon={<CheckCircle2 className="text-blue-600" size={18} />}
          description={`${stats.total > 0 ? ((stats.completo/stats.total)*100).toFixed(1) : 0}% del total`}
          highlight="blue"
        />
        <StatCard 
          title="Alertas de Vacíos" 
          value={FACTORS.filter(f => evidences.filter(e => e.factorId === f.id).length === 0).length} 
          icon={<AlertCircle className="text-red-500" size={18} />}
          description="Factores sin registro"
          highlight="red"
        />
        <StatCard 
          title="Factor Crítico" 
          value="F8" 
          icon={<TrendingUp className="text-slate-400" size={18} />}
          description="Investigación"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Avance por Factor
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Completas</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Totales</div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.factorData} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" name="Totales" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="completo" name="Completas" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-8 items-center gap-2 flex">
            Distribución de Estados
          </h3>
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-xs font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description, highlight, trend }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="p-1">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <h4 className={cn(
          "text-3xl font-bold tracking-tight",
          highlight === 'blue' ? "text-blue-600" : highlight === 'red' ? "text-red-500" : "text-slate-900"
        )}>
          {value}
        </h4>
        <span className={cn(
          "text-[10px] font-medium pb-1.5",
          trend === 'up' ? "text-green-600" : "text-slate-400"
        )}>
          {description}
        </span>
      </div>
    </div>
  );
}

import { cn } from '../utils';
