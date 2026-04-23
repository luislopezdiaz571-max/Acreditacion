
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100 via-slate-50 to-slate-50">
          <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-rose-100 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
              <AlertTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">Ops! Algo salió mal</h2>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              La aplicación ha encontrado un error inesperado en tiempo de ejecución. 
              <br />
              <span className="text-[10px] font-mono bg-slate-50 p-2 block mt-4 rounded-lg text-rose-500 border border-slate-100 break-all">
                {this.state.error?.message}
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
              >
                <RefreshCcw size={18} /> Reintentar Cargar
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
              >
                <Home size={18} /> Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
