
import React, { useState, useEffect } from 'react';
import { Evidence, AcademicProgramId, YearFilter } from './types';
import Dashboard from './components/Dashboard';
import EvidenceForm from './components/EvidenceForm';
import EvidenceList from './components/EvidenceList';
import MatrixView from './components/MatrixView';
import { cn } from './utils';
import { db, handleFirestoreError } from './lib/firebase';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { 
  Plus, LayoutDashboard, Database, Table, Menu, Search, Loader2, Music, GraduationCap, Users, History, Filter, ChevronRight, Home, CalendarDays
} from 'lucide-react';
import { PROGRAMS } from './constants';

import Logo from './components/Logo';
import YearSelectorComponent from './components/YearSelector';

import { SettingsProvider } from './lib/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  );
}

function MainApp() {
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgramId | null>(null);
  const [view, setView] = useState<'dashboard' | 'registrar' | 'historial' | 'vista-general' | 'seguimiento'>('dashboard');
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<YearFilter>({ type: 'all' });

  // Firestore Sync for Evidences
  useEffect(() => {
    // Eliminamos el orderBy del servidor para evitar que Firestore ignore documentos
    // que no poseen un campo específico (era lo que causaba que desaparecieran).
    const q = query(collection(db, 'evidences'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eList = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Normalización de clasificaciones
        const classifications = data.classifications || (
          (data.factorId && data.characteristicId) 
            ? [{ factorId: Number(data.factorId), characteristicId: String(data.characteristicId) }] 
            : []
        );

        // Normalización de años: Garantizar que siempre sea un array de números
        let yearsField: number[] = [];
        if (Array.isArray(data.years) && data.years.length > 0) {
          yearsField = data.years.map(Number);
        } else if (data.year) {
          yearsField = [Number(data.year)];
        } else {
          yearsField = [new Date().getFullYear()];
        }

        return {
          ...data,
          id: doc.id,
          classifications,
          years: yearsField,
          // Asegurar que createdAt exista para el sorteo en memoria
          createdAt: data.createdAt || new Date(0).toISOString()
        } as Evidence;
      });

      // Ordenar en memoria: por el año más reciente (el mayor del array de años)
      const sortedList = [...eList].sort((a, b) => {
        const yearA = a.years?.length ? Math.max(...a.years) : 0;
        const yearB = b.years?.length ? Math.max(...b.years) : 0;
        if (yearA !== yearB) return yearB - yearA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setEvidences(sortedList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveEvidence = async (data: Evidence) => {
    try {
      await setDoc(doc(db, 'evidences', data.id), data);
      setEditingEvidence(undefined);
      setView('historial');
    } catch (e) {
      handleFirestoreError(e, editingEvidence ? 'update' : 'create', `evidences/${data.id}`);
    }
  };

  const handleEdit = (evidence: Evidence) => {
    setEditingEvidence(evidence);
    setView('registrar');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este registro?')) return;
    try {
      await deleteDoc(doc(db, 'evidences', id));
    } catch (e) {
      handleFirestoreError(e, 'delete', `evidences/${id}`);
    }
  };

  const years = React.useMemo(() => {
    const dataYears = evidences.flatMap(e => e.years || []);
    const currentYear = new Date().getFullYear();
    // Rango dinámico: desde 2010 hasta 10 años adelante del actual
    const startYear = 2010;
    const endYear = currentYear + 10;
    const baseRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
    return Array.from(new Set([...baseRange, ...dataYears])).sort((a, b) => b - a);
  }, [evidences]);

  // Filtered evidences based on selected program and year
  const filteredEvidences = React.useMemo(() => {
    let base = selectedProgram === 'consolidated'
      ? evidences
      : selectedProgram 
        ? evidences.filter(e => e.programs.includes(selectedProgram))
        : [];

    return base.filter(e => {
      if (filterYear.type === 'all') return true;
      if (filterYear.type === 'single' && filterYear.year) {
        return e.years.includes(filterYear.year);
      }
      if (filterYear.type === 'range' && filterYear.startYear && filterYear.endYear) {
        return e.years.some(y => y >= (filterYear.startYear ?? 0) && y <= (filterYear.endYear ?? 0));
      }
      return true;
    });
  }, [evidences, selectedProgram, filterYear]);

  if (!selectedProgram) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <Logo variant="light" className="justify-center mb-6" />
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">Sistema de Gestión de Evidencias</h1>
            <p className="mt-4 text-lg text-slate-600 font-medium">Seleccione un programa académico o consulte la vista global consolidada</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {PROGRAMS.map((prog, idx) => (
              <button
                key={prog.id}
                onClick={() => setSelectedProgram(prog.id)}
                className="group relative bg-white p-6 rounded-2xl shadow-xl border border-slate-200 hover:border-blue-500 hover:shadow-blue-200/50 transition-all text-left flex flex-col items-start gap-4 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="p-3 rounded-xl bg-slate-900 text-white group-hover:bg-blue-600 transition-colors">
                  {idx === 0 && <Music size={24} />}
                  {idx === 1 && <GraduationCap size={24} />}
                  {idx === 2 && <Users size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors leading-tight">{prog.name}</h3>
                  <p className="text-slate-500 text-xs mt-2 font-medium leading-relaxed">Gestión individual del programa y repositorio.</p>
                </div>
                <div className="mt-auto w-full flex justify-end pt-4">
                  <span className="p-1.5 bg-slate-50 rounded-full text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </button>
            ))}

            {/* Vista Consolidada Card */}
            <button
              onClick={() => setSelectedProgram('consolidated')}
              className="group relative bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-800 hover:border-blue-500 hover:shadow-blue-500/20 transition-all text-left flex flex-col items-start gap-4 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="p-3 rounded-xl bg-blue-600 text-white group-hover:bg-blue-500 transition-colors">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors leading-tight uppercase">Vista Consolidada General</h3>
                <p className="text-slate-400 text-xs mt-2 font-medium leading-relaxed">Consulta global de los tres programas para informes y presentaciones.</p>
              </div>
              <div className="mt-auto w-full flex justify-end pt-4">
                <span className="p-1.5 bg-slate-800 rounded-full text-slate-500 group-hover:text-white group-hover:bg-slate-700 transition-all">
                  <ChevronRight size={16} />
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 z-50 flex flex-col",
        sidebarOpen ? "w-64 md:w-72" : "w-0 md:w-20"
      )}>
        <div className="p-5 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <Logo variant="dark" showText={sidebarOpen} className={cn("transition-all duration-300", !sidebarOpen && "justify-center")} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarOpen && (
            <div className="px-2 mb-4 pb-4 border-b border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                {selectedProgram === 'consolidated' ? 'Modo de consulta' : 'Programa seleccionado'}
              </p>
              <p className="text-sm font-bold text-blue-400 leading-tight">
                {selectedProgram === 'consolidated' ? 'VISTA CONSOLIDADA GENERAL' : selectedProgram}
              </p>
              <button 
                onClick={() => setSelectedProgram(null)}
                className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                title="Cambiar programa"
              >
                <Home size={12} /> CAMBIAR SELECCIÓN
              </button>
            </div>
          )}
          
          {sidebarOpen && <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-2 mt-4 tracking-widest">Navegación principal</div>}
          <NavItem active={view === 'dashboard' || view === 'seguimiento'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18} />} label="Seguimiento General" collapsed={!sidebarOpen} />
          {selectedProgram !== 'consolidated' && (
            <NavItem active={view === 'registrar'} onClick={() => { setEditingEvidence(undefined); setView('registrar'); }} icon={<Plus size={18} />} label="Registro de Evidencias" collapsed={!sidebarOpen} />
          )}
          <NavItem active={view === 'historial'} onClick={() => setView('historial')} icon={<History size={18} />} label="Historial" collapsed={!sidebarOpen} />
          <NavItem active={view === 'vista-general'} onClick={() => setView('vista-general')} icon={<Table size={18} />} label="Vista General" collapsed={!sidebarOpen} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "md:ml-72" : "md:ml-20")}>
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm bg-white/90">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Menu size={20} />
            </button>
            {view !== 'registrar' && (
              <YearSelectorComponent 
                years={years} 
                filterYear={filterYear} 
                onYearChange={setFilterYear} 
              />
            )}
          </div>
          
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
               {selectedProgram === 'consolidated' ? 'Vista Activa' : 'Programa seleccionado'}
             </p>
             <p className="text-base font-black text-slate-900 leading-tight">
               {selectedProgram === 'consolidated' ? 'Consolidado General' : selectedProgram}
             </p>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto w-full">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando datos del programa...</p>
            </div>
          )}

          {!loading && (
            <>
              {view === 'dashboard' && (
                <Dashboard 
                  evidences={filteredEvidences} 
                  filterYear={filterYear} 
                  availableYears={years} 
                  onYearChange={setFilterYear} 
                  isConsolidated={selectedProgram === 'consolidated'}
                />
              )}
              {view === 'historial' && (
                <EvidenceList 
                  evidences={filteredEvidences} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                  onAdd={() => setView('registrar')}
                  showProgramCol={true}
                  filterYear={filterYear}
                  availableYears={years}
                  onYearChange={setFilterYear}
                />
              )}
              {view === 'registrar' && (
                <div className="max-w-4xl mx-auto">
                   <EvidenceForm onSave={handleSaveEvidence} onCancel={() => setView('historial')} initialData={editingEvidence} currentProgram={selectedProgram} />
                </div>
              )}
              {view === 'vista-general' && (
                <MatrixView 
                  evidences={filteredEvidences} 
                  filterYear={filterYear} 
                  availableYears={years} 
                  onYearChange={setFilterYear} 
                  isConsolidated={selectedProgram === 'consolidated'}
                />
              )}
              {view === 'seguimiento' && (
                <Dashboard 
                  evidences={filteredEvidences} 
                  filterYear={filterYear} 
                  availableYears={years} 
                  onYearChange={setFilterYear} 
                  isConsolidated={selectedProgram === 'consolidated'}
                />
              )} 
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, collapsed }: any) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm mb-1",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    )}>
      <span className={cn("shrink-0", active ? "text-white" : "text-slate-400 hover:text-slate-200")}>
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

