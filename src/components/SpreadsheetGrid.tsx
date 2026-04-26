import React from 'react';
import { cn } from '@/lib/utils';

interface SpreadsheetGridProps {
  data: any[][];
  onCellBlur: (rowIndex: number, colIndex: number, value: any) => void;
  searchQuery?: string;
}

export function SpreadsheetGrid({ data, onCellBlur, searchQuery = '' }: SpreadsheetGridProps) {
  if (!data || data.length === 0) return null;

  const maxCols = Math.max(...data.map(row => row.length));
  const colHeaders = Array.from({ length: maxCols }, (_, i) => String.fromCharCode(65 + i));

  // Filter rows if search query is active
  const filteredData = searchQuery.trim() 
    ? data.map((row, i) => ({ row, originalIndex: i }))
          .filter(item => item.row.some(cell => 
            String(cell).toLowerCase().includes(searchQuery.toLowerCase())
          ))
    : data.map((row, i) => ({ row, originalIndex: i }));

  return (
    <table className="w-full text-left border-collapse table-fixed min-w-0">
      <thead className="sticky top-0 z-10">
        <tr className="bg-slate-50/50 border-b border-slate-100 backdrop-blur-sm">
          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12 text-center">#</th>
          {colHeaders.map((header, i) => (
            <th key={i} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredData.map(({ row, originalIndex }, displayIndex) => (
          <tr key={originalIndex} className="border-b border-slate-50/80 hover:bg-white/40 group transition-colors">
            <td className="px-4 py-3 font-mono text-[11px] text-slate-400 text-center">
              {originalIndex + 1}
            </td>
            {Array.from({ length: maxCols }).map((_, colIndex) => {
              const cellValue = row[colIndex] ?? '';
              const isMatch = searchQuery && String(cellValue).toLowerCase().includes(searchQuery.toLowerCase());
              
              return (
                <td key={colIndex} className="p-0 border-r border-slate-50/50 last:border-r-0">
                  <input
                    type="text"
                    className={cn(
                      "w-full h-full px-4 py-3 bg-transparent outline-none focus:bg-blue-50/30 transition-all text-sm text-slate-600 font-medium placeholder:opacity-0",
                      isMatch && "bg-amber-100/40 text-amber-900"
                    )}
                    defaultValue={cellValue}
                    onBlur={(e) => onCellBlur(originalIndex, colIndex, e.target.value)}
                    placeholder="-"
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
