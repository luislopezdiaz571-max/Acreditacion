import React from 'react';
import { cn } from '../utils';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
}

export default function Logo({ variant = 'dark', className, showText = true }: LogoProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center transition-all",
        isDark ? "bg-transparent text-white" : "bg-transparent text-slate-900"
      )}>
        {/* Brand Text */}
        {showText && (
          <div className="flex flex-col leading-tight">
            <span className={cn("text-sm font-black uppercase tracking-tight", isDark ? "text-white" : "text-blue-900")}>
              Facultad de Artes
            </span>
            <span className={cn("text-xs font-bold uppercase tracking-tighter opacity-90", isDark ? "text-slate-300" : "text-blue-800")}>
              Departamento de Música
            </span>
            <span className={cn("text-[10px] font-serif italic mt-0.5", isDark ? "text-slate-400" : "text-slate-600")}>
              Universidad del Cauca
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
