
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

export interface EvidenceClassification {
  factorId: number;
  characteristicId: string;
}

export interface Evidence {
  id: string;
  years: number[];
  date?: string;
  name: string;
  programs: string[]; // Selection of academic programs
  classifications: EvidenceClassification[]; // Supports multiple factor/characteristic associations
  description: string;
  type: string;
  supportLink?: string; // Optional link
  status: EvidenceStatus;
  observations: string;
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
