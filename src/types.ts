
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
  date: string;
  name: string;
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
