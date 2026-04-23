
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Evidence, EvidenceStatus, YearFilter } from '../types';
import { FACTORS, CHARACTERISTICS, PROGRAMS } from '../constants';
import { 
  AlertCircle, CheckCircle2, Clock, FileText, 
  LayoutDashboard, TrendingUp, Filter, Settings, 
  Link, Save, Globe, Target, Layers, ArrowUpRight, ArrowDownRight, Calendar, Bookmark, Database
} from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import { cn } from '../utils';
import YearSelector from './YearSelector';

interface DashboardProps {
  evidences: Evidence[];
  filterYear: YearFilter;
  availableYears: number[];
  onYearChange: (filter: YearFilter) => void;
  isConsolidated?: boolean;
}

export default function Dashboard({ evidences, filterYear, availableYears, onYearChange, isConsolidated }: DashboardProps) {
  const { settings, updateSettings } = useSettings();
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [driveLinkInput, setDriveLinkInput] = useState(settings.generalDriveLink);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateLink = async () => {
    if (!driveLinkInput) return;
    setIsSaving(true);
    await updateSettings({ generalDriveLink: driveLinkInput }, 'sistema');
    setIsSaving(false);
    setIsEditingSettings(false);
  };

  const dashboardStats = useMemo(() => {
    const totalEvidences = evidences.length;
    const completedEvidences = evidences.filter(e => e.status === "Completo").length;
    
    // Characteristics logic
    const charIdsWithEvidence = new Set(evidences.flatMap(e => e.classifications.map(c => c.characteristicId)));
    const charsWithEvidence = charIdsWithEvidence.size;
    const totalChars = CHARACTERISTICS.length;
    const charsWithoutEvidence = totalChars - charsWithEvidence;

    // Factor logic
    const factorStats = FACTORS.map(f => {
      const charIdsInFactor = CHARACTERISTICS.filter(c => c.factorId === f.id).map(c => c.id);
      const evidencesInFactor = evidences.filter(e => e.classifications.some(c => c.factorId === f.id));
      const charsCovered = charIdsInFactor.filter(id => charIdsWithEvidence.has(id)).length;
      const coveragePercent = charIdsInFactor.length > 0 ? (charsCovered / charIdsInFactor.length) * 100 : 0;
      
      return {
        id: f.id,
        name: `Factor ${f.id}`,
        shortName: `F${f.id}`,
        fullName: f.name,
        evidenceCount: evidencesInFactor.length,
        charsCovered,
        totalChars: charIdsInFactor.length,
        coveragePercent
      };
    }).sort((a, b) => b.coveragePercent - a.coveragePercent);

    const mostCompleteFactor = factorStats.length > 0 ? factorStats[0] : null;
    const leastCompleteFactor = factorStats.length > 0 ? factorStats[factorStats.length - 1] : null;

    // Yearly evolution
    const yearMap: Record<number, number> = {};
    evidences.forEach(e => {
       (e.years || []).forEach(y => {
         if (y && !isNaN(Number(y))) {
           yearMap[y] = (yearMap[y] || 0) + 1;
         }
       });
    });
    const yearlyData = Object.keys(yearMap)
      .map(y => ({ year: y, count: yearMap[Number(y)] }))
      .sort((a, b) => Number(a.year) - Number(b.year));

    // Program distribution
    const programStats = PROGRAMS.map(p => {
      const count = evidences.filter(e => Array.isArray(e.programs) && e.programs.includes(p.id)).length;
      return { 
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name, 
        count,
        fullName: p.name
      };
    });

    return {
      totalEvidences,
      completedEvidences,
      charsWithEvidence,
      charsWithoutEvidence,
      totalChars,
      factorStats,
      mostCompleteFactor,
      leastCompleteFactor,
      yearlyData,
      programStats
    };
  }, [evidences]);

  const pieData = [
    { name: 'Con Evidencia', value: dashboardStats.charsWithEvidence, color: '#2563eb' },
    { name: 'Sin Evidencia', value: dashboardStats.charsWithoutEvidence, color: '#f1f5f9' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Drive Link & Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 text-center lg:text-left">
            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-900/40 text-white shrink-0">
              <Globe size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Repositorio General</h2>
              <p className="text-slate-400 text-sm font-medium">Fuente documental centralizada en Google Drive para procesos de acreditación.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <a 
              href={settings.generalDriveLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-blue-900/40 active:scale-95"
            >
              ACCEDER AL DRIVE <Link size={18} />
            </a>
            
            <button 
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className={cn(
                "px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border flex items-center gap-3",
                isEditingSettings ? "bg-white text-slate-900 border-white" : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              )}
            >
              <Settings size={18} />
              {isEditingSettings ? 'CERRAR' : 'CONFIGURAR'}
            </button>
          </div>
        </div>

        {isEditingSettings && (
          <div className="mt-10 pt-10 border-t border-slate-800 animate-in slide-in-from-top-4 duration-500">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enlace Drive Institucional</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="url" 
                    value={driveLinkInput}
                    onChange={(e) => setDriveLinkInput(e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-slate-600"
                    placeholder="https://drive.google.com/..."
                  />
                  <button 
                    onClick={handleUpdateLink}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
                  >
                    {isSaving ? <span className="animate-pulse">GUARDANDO...</span> : <><Save size={18} /> GUARDAR</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatCard 
          title="Evidencias Totales" 
          value={dashboardStats.totalEvidences} 
          icon={<FileText size={24} />}
          description="registros únicos"
          color="slate"
        />
        <ModernStatCard 
          title="Avance de Cobertura" 
          value={`${((dashboardStats.charsWithEvidence / dashboardStats.totalChars) * 100).toFixed(1)}%`} 
          icon={<Target size={24} />}
          description="características cubiertas"
          color="blue"
        />
        <ModernStatCard 
          title="Características Pendientes" 
          value={dashboardStats.charsWithoutEvidence} 
          icon={<AlertCircle size={24} />}
          description="sin evidencias registradas"
          color="rose"
        />
        <ModernStatCard 
          title="Factor más Completo" 
          value={dashboardStats.mostCompleteFactor?.shortName || '-'} 
          icon={<TrendingUp size={24} />}
          description={dashboardStats.mostCompleteFactor?.fullName 
            ? dashboardStats.mostCompleteFactor.fullName.substring(0, 20) + "..." 
            : "No hay datos disponibles"}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coverage Chart */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-1">Avance Detallado por Factor</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cumplimiento basado en cobertura de características</p>
            </div>
            <div className="hidden sm:flex gap-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600"></span> COBERTURA (%)</div>
            </div>
          </div>
          <div className="h-[400px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardStats.factorStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shortName" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                />
                <Bar dataKey="coveragePercent" name="Cobertura (%)" fill="#2563eb" radius={[10, 10, 10, 10]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Distribution */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-10 text-center w-full">Estado Operativo</h3>
          <div className="h-[300px] w-full relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
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
              <span className="text-4xl font-black text-slate-900 leading-none">{dashboardStats.totalChars}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Características</span>
            </div>
          </div>
          
          <div className="w-full space-y-4">
             <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">CUMPLIDAS</p>
                   <p className="text-2xl font-black text-blue-700">{dashboardStats.charsWithEvidence}</p>
                </div>
                <CheckCircle2 className="text-blue-500" size={32} />
             </div>
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">POR GESTIONAR</p>
                   <p className="text-2xl font-black text-slate-700">{dashboardStats.charsWithoutEvidence}</p>
                </div>
                <Clock className="text-slate-300" size={32} />
             </div>
          </div>
        </div>

        {/* Program Distribution (Only for Consolidated) */}
        {isConsolidated && (
          <div className="lg:col-span-12 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-1">Distribución Docuemental por Programa</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Comparativa de evidencias registradas por cada programa académico</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardStats.programStats} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" name="Evidencias" fill="#0f172a" radius={[0, 10, 10, 0]} barSize={40}>
                    {dashboardStats.programStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : index === 1 ? '#6366f1' : '#4f46e5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Yearly Evolution */}
        {dashboardStats.yearlyData.length > 1 && (
          <div className="lg:col-span-12 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-10 text-center w-full">Evolución Histórica de Gestión</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={dashboardStats.yearlyData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModernStatCard({ title, value, icon, description, color }: any) {
  const colorStyles: Record<string, string> = {
    slate: "bg-slate-50 text-slate-900 border-slate-100",
    blue: "bg-blue-50 text-blue-900 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-900 border-emerald-100",
    rose: "bg-rose-50 text-rose-900 border-rose-100",
  };

  const iconStyles: Record<string, string> = {
    slate: "bg-slate-900 text-white shadow-slate-900/20",
    blue: "bg-blue-600 text-white shadow-blue-600/20",
    emerald: "bg-emerald-600 text-white shadow-emerald-600/20",
    rose: "bg-rose-600 text-white shadow-rose-600/20",
  };

  return (
    <div className={cn("p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative group", colorStyles[color])}>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform group-hover:scale-110 duration-500", iconStyles[color])}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
        <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{description}</p>
      </div>
    </div>
  );
}
