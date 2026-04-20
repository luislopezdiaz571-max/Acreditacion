
import React, { useState, useEffect } from 'react';
import { Evidence, AuthorizedUser } from './types';
import Dashboard from './components/Dashboard';
import EvidenceForm from './components/EvidenceForm';
import EvidenceList from './components/EvidenceList';
import MatrixView from './components/MatrixView';
import AuthContainer from './components/AuthContainer';
import UserManagement from './components/UserManagement';
import { cn } from './utils';
import { db, auth, handleFirestoreError } from './lib/firebase';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { 
  Plus, LayoutDashboard, Database, Table, University, Bell, Menu, Search, LogOut, Users, Settings, ShieldCheck
} from 'lucide-react';
import { signOut } from 'firebase/auth';

import Logo from './components/Logo';

export default function App() {
  return (
    <AuthContainer>
      {(user, authUser) => <MainApp user={user} authUser={authUser} />}
    </AuthContainer>
  );
}

function MainApp({ user, authUser }: { user: any, authUser: AuthorizedUser }) {
  const [view, setView] = useState<'dashboard' | 'registrar' | 'evidencias' | 'matriz' | 'usuarios'>('dashboard');
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Firestore Sync for Evidences
  useEffect(() => {
    const q = query(collection(db, 'evidences'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eList = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as Evidence[];
      setEvidences(eList);
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
      setView('evidencias');
    } catch (e) {
      handleFirestoreError(e, editingEvidence ? 'update' : 'create', `evidences/${data.id}`);
    }
  };

  const handleEdit = (evidence: Evidence) => {
    setEditingEvidence(evidence);
    setView('registrar');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'evidences', id));
    } catch (e) {
      handleFirestoreError(e, 'delete', `evidences/${id}`);
    }
  };

  const handleLogout = () => signOut(auth);

  const isAdmin = authUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 z-50 flex flex-col",
        sidebarOpen ? "w-64 md:w-72" : "w-0 md:w-20"
      )}>
        <div className="p-5 border-b border-slate-800 shrink-0">
          <Logo variant="dark" showText={sidebarOpen} className={cn("transition-all duration-300", !sidebarOpen && "justify-center")} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarOpen && <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-2">Gestión de Calidad</div>}
          <NavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" collapsed={!sidebarOpen} />
          <NavItem active={view === 'evidencias'} onClick={() => setView('evidencias')} icon={<Database size={18} />} label="Registro Histórico" collapsed={!sidebarOpen} />
          <NavItem active={view === 'registrar'} onClick={() => { setEditingEvidence(undefined); setView('registrar'); }} icon={<Plus size={18} />} label="Nuevo Registro" collapsed={!sidebarOpen} />
          <NavItem active={view === 'matriz'} onClick={() => setView('matriz')} icon={<Table size={18} />} label="CNA Matrix" collapsed={!sidebarOpen} />
          
          {isAdmin && (
            <>
              {sidebarOpen && <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 mt-6 px-2">Administración</div>}
              <NavItem active={view === 'usuarios'} onClick={() => setView('usuarios')} icon={<Users size={18} />} label="Gestión de Accesos" collapsed={!sidebarOpen} />
            </>
          )}
        </nav>

        <div className="p-4 bg-slate-950/20 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-medium text-sm mt-auto",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "md:ml-72" : "md:ml-20")}>
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm bg-white/90">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full w-96 border border-slate-200/50">
              <Search className="text-slate-400" size={16} />
              <input type="text" placeholder="Buscar evidencias..." className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder:text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:block text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <p className="text-xs font-bold leading-none text-slate-900">{user.displayName || 'Usuario'}</p>
                {isAdmin && <ShieldCheck className="text-blue-600" size={12} />}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight truncate max-w-[150px]">{user.email}</p>
            </div>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100"
            />
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto w-full">
          {loading && view !== 'usuarios' && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando con la nube...</p>
            </div>
          )}

          {!loading && (
            <>
              {view === 'dashboard' && <Dashboard evidences={evidences} />}
              {view === 'evidencias' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Registro Histórico</h2>
                        <p className="text-sm text-slate-500 mt-1">Gestión integral de evidencias almacenadas de forma segura.</p>
                      </div>
                      <button onClick={() => setView('registrar')} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                        <Plus size={18} /> Nueva Evidencia
                      </button>
                   </div>
                   <EvidenceList evidences={evidences} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              )}
              {view === 'registrar' && (
                <div className="max-w-4xl mx-auto">
                   <EvidenceForm onSave={handleSaveEvidence} onCancel={() => setView('evidencias')} initialData={editingEvidence} />
                </div>
              )}
              {view === 'matriz' && <MatrixView evidences={evidences} />}
              {view === 'usuarios' && isAdmin && <UserManagement onBack={() => setView('dashboard')} />}
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
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium text-sm",
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

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
