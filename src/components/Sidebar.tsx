import React from 'react';
import { 
  FileSpreadsheet, 
  Settings, 
  HelpCircle, 
  User, 
  History, 
  Plus, 
  Search,
  Globe,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNewSheet: () => void;
  onShowAbout: () => void;
  onShowSettings: () => void;
  onImportUrl: () => void;
}

export function Sidebar({ onNewSheet, onShowAbout, onShowSettings, onImportUrl }: SidebarProps) {
  return (
    <div className="w-64 h-full flex flex-col glass-panel">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">CJA_AI AGENT</h1>
        </div>
        
        <nav className="space-y-1">
          <button 
            onClick={onNewSheet}
            className="w-full sidebar-item sidebar-item-active"
          >
            <Plus className="w-5 h-5" />
            Workplace
          </button>
          <button 
            onClick={onImportUrl}
            className="w-full sidebar-item"
          >
            <Globe className="w-5 h-5" />
            My Sheets
          </button>
          <button 
            className="w-full sidebar-item"
            onClick={() => {}}
          >
            <History className="w-5 h-5" />
            Automation
          </button>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/40 bg-white/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-white flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">R</div>
          <div>
            <p className="text-xs font-semibold text-slate-900">Founder: Ramesh</p>
            <p className="text-[10px] text-slate-500">CJA_AI AGENT Pvt. Ltd.</p>
          </div>
        </div>
        <button 
          onClick={onShowAbout}
          className="w-full text-[11px] text-blue-600 font-medium hover:underline text-left pl-1"
        >
          About Founder
        </button>
      </div>
    </div>
  );
}
