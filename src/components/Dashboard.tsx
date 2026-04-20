
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Evidence, EvidenceStatus } from '../types';
import { FACTORS } from '../constants';
import { AlertCircle, CheckCircle2, Clock, FileText, LayoutDashboard, TrendingUp, Filter } from 'lucide-react';

interface DashboardProps {
  evidences: Evidence[];
}

export default function Dashboard({ evidences }: DashboardProps) {
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
