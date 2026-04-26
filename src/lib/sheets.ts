import * as XLSX from 'xlsx';
import { Spreadsheet, SheetData } from '../types';

export async function parsePublicGoogleSheet(url: string): Promise<Spreadsheet> {
  // Extract spreadsheet ID from URL
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error('Invalid Google Sheets URL');
  
  const spreadsheetId = match[1];
  // Fetch info about tabs - this part is tricky without API key, 
  // but we can try to fetch the CSV of the first sheet by default
  // or use the export?format=xlsx endpoint which gets all sheets
  const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
  
  const response = await fetch(exportUrl);
  if (!response.ok) throw new Error('Failed to fetch spreadsheet. Is it public?');
  
  const arrayBuffer = await response.arrayBuffer();
  return parseExcelBuffer(arrayBuffer, 'Google Sheet');
}

export async function parseExcelBuffer(buffer: ArrayBuffer, name: string): Promise<Spreadsheet> {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheets: SheetData[] = workbook.SheetNames.map(name => {
    const worksheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    return { name, data };
  });

  return {
    id: Math.random().toString(36).substring(7),
    name,
    sheets,
    createdAt: Date.now()
  };
}

export function cleanData(data: any[][]): any[][] {
  // Remove empty rows and handle duplicates (basic version)
  const cleaned = data.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
  return cleaned;
}

export function detectDuplicates(data: any[][], columnIndices?: number[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];
  data.forEach((row, index) => {
    // If no columns specified, hash the whole row. Otherwise hash only specified columns.
    const relevantData = columnIndices && columnIndices.length > 0 
      ? columnIndices.map(colIdx => row[colIdx])
      : row;
      
    const hash = JSON.stringify(relevantData);
    if (seen.has(hash)) {
      duplicates.push(index);
    } else {
      seen.add(hash);
    }
  });
  return duplicates;
}
