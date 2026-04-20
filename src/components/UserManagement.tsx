import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, setDoc, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { AuthorizedUser } from '../types';
import { UserPlus, Trash2, ShieldCheck, Mail, Calendar, Loader2, Search, ArrowLeft } from 'lucide-react';
import { cn } from '../utils';

interface UserManagementProps {
  onBack: () => void;
}

export default function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'authorized_users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uList = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AuthorizedUser[];
      setUsers(uList);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setSubmitting(true);
    try {
      // In a real app, you might want to invite them. 
      // Here we store by email-derived ID or just an ID. 
      // Using a random ID is safer since we don't know the UID yet.
      // But we need the UID to check permissions in rules.
      // Solution: The admin adds the email, and when the user logs in, 
      // if they aren't found by UID, the App can check if their EMAIL is in the authorized list,
      // then migrate that entry to their real UID.
      
      const userId = `temp_${Date.now()}`;
      await setDoc(doc(db, 'authorized_users', userId), {
        email: newEmail.toLowerCase().trim(),
        role: newRole,
        authorizedAt: new Date().toISOString(),
        isPending: true // Temporary until first login
      });
      
      setNewEmail('');
      setNewRole('user');
    } catch (error) {
      handleFirestoreError(error, 'create', 'authorized_users');
    }
    setSubmitting(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Quitar acceso a este usuario?')) return;
    try {
      await deleteDoc(doc(db, 'authorized_users', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `authorized_users/${id}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Accesos</h2>
            <p className="text-sm text-slate-500 mt-1">Administre quiénes pueden ingresar y registrar evidencias.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add User Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider text-xs">
              <UserPlus size={16} className="text-blue-600" />
              Autorizar Nuevo Usuario
            </h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                  placeholder="usuario@gmail.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rol de Acceso</label>
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm font-bold uppercase tracking-tight"
                >
                  <option value="user">Usuario (Consulta/Registro)</option>
                  <option value="admin">Administrador (Total)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                Autorizar Acceso
              </button>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar usuarios por correo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none text-sm shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Usuario</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Rol</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Cargando lista...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                      No hay usuarios autorizados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Mail size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{u.email}</p>
                            {u.authorizedAt && (
                              <p className="text-[9px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter mt-0.5">
                                <Calendar size={10} /> Desde {new Date(u.authorizedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider",
                          u.role === 'admin' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                          {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => u.uid && handleDeleteUser(u.uid)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar acceso"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
