import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogIn, ShieldAlert, Loader2, LogOut } from 'lucide-react';
import { cn } from '../utils';
import { AuthorizedUser } from '../types';

import Logo from './Logo';

interface AuthContainerProps {
  children: (user: User, role: AuthorizedUser) => React.ReactNode;
}

export default function AuthContainer({ children }: AuthContainerProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authorizedUser, setAuthorizedUser] = useState<AuthorizedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, 'authorized_users', u.uid));
          if (userDoc.exists()) {
            setAuthorizedUser(userDoc.data() as AuthorizedUser);
            setUser(u);
            setError(null);
          } else {
            // Check for bootstrap admins
            const admins = ['nikolsteffanyzambranolopez@gmail.com', 'luislopezdiaz571@gmail.com'];
            if (admins.includes(u.email || '')) {
              // Automatically register bootstrap admins in Firestore
              const newAdmin: AuthorizedUser = {
                email: u.email!,
                role: 'admin',
                authorizedAt: new Date().toISOString()
              };
              await setDoc(doc(db, 'authorized_users', u.uid), newAdmin);
              setAuthorizedUser(newAdmin);
              setUser(u);
              setError(null);
            } else {
              setError("Su correo electrónico no está autorizado para acceder a esta plataforma.");
              await signOut(auth);
              setUser(null);
            }
          }
        } catch (e: any) {
          console.error("Auth error", e);
          setError("Error al verificar credenciales.");
          await signOut(auth);
        }
      } else {
        setUser(null);
        setAuthorizedUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error(e);
      setError("Error al iniciar sesión con Google.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Iniciando Sistema...</p>
        </div>
      </div>
    );
  }

  if (user && authorizedUser) {
    return <>{children(user, authorizedUser)}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://picsum.photos/seed/music/1920/1080?blur=5')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-md"></div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
        <div className="p-10 bg-slate-100 flex justify-center border-b border-slate-200">
          <Logo variant="light" className="scale-125" />
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-lg font-black text-blue-950 uppercase tracking-tighter leading-tight">
              Acreditación Departamento de Música
            </h1>
            <p className="text-xs font-serif italic text-slate-500">
              Universidad del Cauca
            </p>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          <div className="text-center">
            <p className="text-xs text-slate-500 leading-relaxed px-4">
              Sistema oficial para la gestión de evidencias de alta calidad. Por favor inicie sesión con su correo institucional.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-medium text-rose-800">{error}</p>
            </div>
          )}

          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-slate-50 transition-all p-3 rounded-xl font-bold text-slate-700 shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Acceder con Google
          </button>

          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest pt-4">
            Gestión de Calidad • Programa de Música
          </p>
        </div>
      </div>
    </div>
  );
}
