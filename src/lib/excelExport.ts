
import * as XLSX from 'xlsx';
import { Evidence, EvidenceClassification } from '../types';
import { FACTORS, CHARACTERISTICS, PROGRAMS } from '../constants';

/**
 * Formats a single evidence object for Excel row representation.
 */
function formatEvidenceRow(e: Evidence) {
  // Format factors and characteristics
  const factorNames = e.classifications.map(c => {
    const factor = FACTORS.find(f => f.id === c.factorId);
    return factor ? `Factor ${factor.id}: ${factor.name}` : `Factor ${c.factorId}`;
  }).join('; ');

  const characteristicNames = e.classifications.map(c => {
    const char = CHARACTERISTICS.find(char => char.id === c.characteristicId);
    return char ? `${char.id}: ${char.name}` : c.characteristicId;
  }).join('; ');

  // Detail format for classifications (Factor + Characteristic pairs)
  const classificationsDetail = e.classifications.map(c => {
    const factor = FACTORS.find(f => f.id === c.factorId);
    const char = CHARACTERISTICS.find(char => char.id === c.characteristicId);
    const factorStr = factor ? `F${factor.id}` : `F${c.factorId}`;
    const charStr = char ? char.id : c.characteristicId;
    return `[${factorStr} - ${charStr}]`;
  }).join(', ');

  return {
    'Programas': e.programs.join(', '),
    'Título / Nombre': e.name,
    'Años': e.years.join(', '),
    'Fecha': e.date || 'N/A',
    'Factores': factorNames,
    'Características': characteristicNames,
    'Clasificaciones (F-C)': classificationsDetail,
    'Descripción': e.description,
    'Tipo': e.type,
    'Link de Soporte': e.supportLink || 'N/A',
    'Estado': e.status,
    'Fuente': e.source || 'N/A',
    'Observaciones': e.observations,
    'Etiquetas': e.tags.join(', '),
    'Fecha de Registro': new Date(e.createdAt).toLocaleString(),
  };
}

/**
 * Sets standard column widths for worksheets.
 */
function setWorksheetColWidths(ws: XLSX.WorkSheet) {
  const colWidths = [
    { wch: 25 }, // Programas
    { wch: 40 }, // Título
    { wch: 15 }, // Años
    { wch: 12 }, // Fecha
    { wch: 50 }, // Factores
    { wch: 50 }, // Características
    { wch: 30 }, // Clasificaciones
    { wch: 50 }, // Descripción
    { wch: 20 }, // Tipo
    { wch: 40 }, // Link
    { wch: 15 }, // Estado
    { wch: 20 }, // Fuente
    { wch: 40 }, // Observaciones
    { wch: 30 }, // Etiquetas
    { wch: 20 }, // Fecha Registro
  ];
  ws['!cols'] = colWidths;
}

/**
 * Exports evidence data to an Excel file with multiple sheets.
 * Includes one sheet per program and one consolidated sheet.
 * @param evidences Array of all evidence objects to export.
 * @param filename Name of the file to be downloaded.
 */
export function exportToExcel(evidences: Evidence[], filename: string) {
  const wb = XLSX.utils.book_new();

  // 1. Create Sheets for each Program
  PROGRAMS.forEach(prog => {
    const programEvidences = evidences.filter(e => e.programs.includes(prog.id));
    if (programEvidences.length > 0) {
      const data = programEvidences.map(formatEvidenceRow);
      const ws = XLSX.utils.json_to_sheet(data);
      setWorksheetColWidths(ws);
      // Sheet names must be <= 31 chars
      const sheetName = prog.name.length > 31 ? prog.name.substring(0, 31) : prog.name;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });

  // 2. Create Consolidated Sheet (all evidences)
  const consolidatedData = evidences.map(formatEvidenceRow);
  const consolidatedWs = XLSX.utils.json_to_sheet(consolidatedData);
  setWorksheetColWidths(consolidatedWs);
  XLSX.utils.book_append_sheet(wb, consolidatedWs, 'Consolidado General');

  // Generate file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
