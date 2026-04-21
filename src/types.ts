
export interface Characteristic {
  id: string; // e.g., "C1"
  name: string;
  factorId: number;
  description: string;
  examples: string[];
}

export interface Factor {
  id: number;
  name: string;
  characteristics: string[]; // List of Characteristic IDs
}

export type EvidenceStatus = "Completo" | "Parcial" | "Pendiente";

export interface Evidence {
  id: string;
  year: number;
  date?: string;
  name: string;
  programs: string[]; // Selection of academic programs
  factorId: number;
  characteristicId: string;
  description: string;
  type: string;
  supportLink: string;
  status: EvidenceStatus;
  observations: string;
  responsible?: string;
  source?: string;
  tags: string[];
  createdAt: string;
}

export type AcademicProgramId = "Música Instrumental" | "Dirección de Banda" | "Licenciatura en Música" | "consolidated";

export interface YearFilter {
  type: 'single' | 'range' | 'all';
  year?: number;
  startYear?: number;
  endYear?: number;
}

export interface AcademicProgram {
  id: AcademicProgramId;
  name: string;
}

export interface DashboardStats {
  totalEvidences: number;
  statusCounts: Record<EvidenceStatus, number>;
  factorProgress: Record<number, number>; // Percentage
  emptyCharacteristics: string[];
}

export interface SystemSettings {
  generalDriveLink: string;
  updatedAt: string;
  updatedBy: string;
}
