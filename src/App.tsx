/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AIChat } from './components/AIChat';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { Onboarding } from './components/Onboarding';
import { AboutModal } from './components/AboutModal';
import { DataVisualization } from './components/DataVisualization';
import { AppState, ChatMessage, Spreadsheet } from './types';
import { parsePublicGoogleSheet, parseExcelBuffer, cleanData, detectDuplicates } from './lib/sheets';
import { askGuru, speak } from './lib/gemini';
import { cn } from './lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Table as TableIcon, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Loader2,
  Upload,
  Globe,
  Plus,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [state, setState] = useState<AppState>({
    spreadsheet: null,
    activeSheetIndex: 0,
    messages: [{
      role: 'assistant',
      content: "Hello sir! 👋 I am your Spreadsheet AI assistant and I am here to help you out. How can I assist you today? 📊"
    }],
    isAnalyzing: false,
    voiceEnabled: true,
    voiceIndex: 0,
    onboardingComplete: false
  });

  useEffect(() => {
    // Speak the initial greeting if voice is enabled
    if (state.voiceEnabled && state.messages.length === 1 && state.messages[0].role === 'assistant') {
      speak(state.messages[0].content, state.voiceIndex);
    }
  }, []);

  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [selectedDuplicateCols, setSelectedDuplicateCols] = useState<number[]>([]);
  const [foundDuplicates, setFoundDuplicates] = useState<number[]>([]);

  // Find the latest message with chart data to display in dashboard
  const latestChartMessage = [...state.messages].reverse().find(m => m.role === 'assistant' && m.chartData);

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sheets_guru_onboarding');
    if (saved === 'true') {
      setState(prev => ({ ...prev, onboardingComplete: true }));
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMsg: ChatMessage = { role: 'user', content, timestamp: Date.now() };
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMsg],
      isAnalyzing: true 
    }));

    // Generate context from current sheet
    const currentSheet = state.spreadsheet?.sheets[state.activeSheetIndex];
    let context = "No data available.";
    if (currentSheet) {
      // Small sample for context (max 20 rows to avoid token overflow)
      const head = currentSheet.data.slice(0, 20);
      context = "Sheet Name: " + currentSheet.name + "\nData (CSV format):\n" + 
                head.map(row => row.join(',')).join('\n');
    }

    const response = await askGuru(content, context);
    
    // Extract chart data if present
    let finalContent = response;
    let chartData = undefined;
    
    const chartMatch = response.match(/\[CHART_DATA\]([\s\S]*?)\[\/CHART_DATA\]/);
    if (chartMatch) {
      try {
        chartData = JSON.parse(chartMatch[1].trim());
        finalContent = response.replace(/\[CHART_DATA\][\s\S]*?\[\/CHART_DATA\]/, '').trim();
      } catch (e) {
        console.error("Failed to parse chart data", e);
      }
    }

    const aiMsg: ChatMessage = { 
      role: 'assistant', 
      content: finalContent, 
      timestamp: Date.now(),
      chartData
    };
    
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, aiMsg],
      isAnalyzing: false 
    }));

    if (state.voiceEnabled) {
      speak(finalContent, state.voiceIndex);
    }
  };

  const handleImportUrl = async () => {
    if (!sheetUrl) return;
    setIsLoading(true);
    try {
      const spreadsheet = await parsePublicGoogleSheet(sheetUrl);
      setState(prev => ({ ...prev, spreadsheet, activeSheetIndex: 0 }));
      setShowUrlDialog(false);
      setSheetUrl('');
      toast.success("Spreadsheet imported successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const spreadsheet = await parseExcelBuffer(buffer, file.name);
      setState(prev => ({ ...prev, spreadsheet, activeSheetIndex: 0 }));
      toast.success("File uploaded successfully!");
    } catch (error: any) {
      toast.error("Failed to parse file.");
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  } as any);

  const handleCellEdit = (rowIndex: number, colIndex: number, value: any) => {
    if (!state.spreadsheet) return;
    const newSheets = [...state.spreadsheet.sheets];
    newSheets[state.activeSheetIndex].data[rowIndex][colIndex] = value;
    setState(prev => ({
      ...prev,
      spreadsheet: { ...prev.spreadsheet!, sheets: newSheets }
    }));
  };

  const handleCleanData = () => {
    if (!state.spreadsheet) return;
    const currentSheet = state.spreadsheet.sheets[state.activeSheetIndex];
    const cleaned = cleanData(currentSheet.data);
    const newSheets = [...state.spreadsheet.sheets];
    newSheets[state.activeSheetIndex].data = cleaned;
    setState(prev => ({
      ...prev,
      spreadsheet: { ...prev.spreadsheet!, sheets: newSheets }
    }));
    toast.success("Data cleaned and empty rows removed.");
  };

  const handleDetectDuplicates = () => {
    if (!state.spreadsheet) return;
    const currentSheet = state.spreadsheet.sheets[state.activeSheetIndex];
    if (currentSheet.data.length === 0) return;
    
    // Default to comparing all columns if nothing selected
    const duplicates = detectDuplicates(currentSheet.data, selectedDuplicateCols);
    setFoundDuplicates(duplicates);
    
    if (duplicates.length > 0) {
      toast.info(`Found ${duplicates.length} duplicate rows.`);
    } else {
      toast.success("No duplicates found with the selected criteria!");
    }
  };

  const handleRemoveDuplicates = () => {
    if (!state.spreadsheet || foundDuplicates.length === 0) return;
    
    const currentSheet = state.spreadsheet.sheets[state.activeSheetIndex];
    const newData = currentSheet.data.filter((_, index) => !foundDuplicates.includes(index));
    
    const newSheets = [...state.spreadsheet.sheets];
    newSheets[state.activeSheetIndex].data = newData;
    
    setState(prev => ({
      ...prev,
      spreadsheet: { ...prev.spreadsheet!, sheets: newSheets }
    }));
    
    setFoundDuplicates([]);
    setShowDuplicatesDialog(false);
    toast.success(`Removed ${foundDuplicates.length} duplicate rows.`);
    handleSendMessage(`Guru, I've just removed some duplicate records from my dataset to ensure data integrity. 🧹`);
  };

  const handleAddRow = () => {
    if (!state.spreadsheet) return;
    const currentSheet = state.spreadsheet.sheets[state.activeSheetIndex];
    const newRow = new Array(currentSheet.data[0]?.length || 1).fill('');
    const newSheets = [...state.spreadsheet.sheets];
    newSheets[state.activeSheetIndex].data = [...currentSheet.data, newRow];
    setState(prev => ({
      ...prev,
      spreadsheet: { ...prev.spreadsheet!, sheets: newSheets }
    }));
  };

  if (!state.onboardingComplete) {
    return <Onboarding onFinish={() => {
      localStorage.setItem('sheets_guru_onboarding', 'true');
      setState(prev => ({ ...prev, onboardingComplete: true }));
    }} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F0F2F5] overflow-hidden text-slate-800 font-sans">
      <div className="atmosphere" />
      <Toaster position="top-center" />
      
      <Sidebar 
        onNewSheet={() => setState(prev => ({ ...prev, spreadsheet: null }))}
        onShowAbout={() => setShowAbout(true)}
        onShowSettings={() => {}}
        onImportUrl={() => setShowUrlDialog(true)}
      />

      <main className="flex-1 h-full flex flex-col relative min-w-0">
        <header className="h-16 bg-white/40 backdrop-blur-md border-b border-white/40 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex-1 max-w-xl relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Globe className="w-4 h-4" />
            </span>
            <Input 
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
              placeholder="Paste Google Sheets link..." 
              className="pill-input"
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2 hover:bg-white/60 rounded-full transition-colors text-slate-600"
              onClick={() => setState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
            >
              {state.voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button 
              disabled={isLoading || !sheetUrl}
              onClick={handleImportUrl}
              className="btn-primary"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sync Data"}
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          <div className="flex-[2] flex flex-col gap-4 min-w-0">
            {!state.spreadsheet ? (
              <div 
                {...getRootProps()} 
                className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all duration-500 ${
                  isDragActive ? "border-blue-500 bg-blue-50/50" : "border-white/60 bg-white/30 backdrop-blur-sm shadow-sm"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-white">
                  {isLoading ? <Loader2 className="w-10 h-10 text-blue-600 animate-spin" /> : <Upload className="w-10 h-10 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold mb-2">Command your data</h3>
                <p className="text-slate-400 text-sm max-w-xs text-center leading-relaxed">
                  Drop an Excel/CSV file or use the portal above to sync from Google Sheets.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4 min-h-0 min-w-0">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                  <Tabs 
                    value={state.activeSheetIndex.toString()} 
                    onValueChange={(v) => setState(prev => ({ ...prev, activeSheetIndex: parseInt(v) }))}
                    className="bg-transparent"
                  >
                    <TabsList className="bg-transparent p-0 gap-2 h-auto">
                      {state.spreadsheet.sheets.map((sheet, i) => (
                        <TabsTrigger 
                          key={i} 
                          value={i.toString()}
                          className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold shadow-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-700 transition-all font-mono"
                        >
                          {sheet.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex gap-2">
                    {isSearchActive ? (
                      <div className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-lg px-2 animate-in fade-in slide-in-from-right-4">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <input 
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search records..."
                          className="text-xs bg-transparent border-none outline-none w-32 py-1"
                        />
                        <button 
                          onClick={() => {
                            setIsSearchActive(false);
                            setSearchQuery('');
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                           <VolumeX className="w-3 h-3 rotate-45" /> 
                        </button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-slate-500 hover:bg-white/80 rounded-lg text-xs font-medium flex gap-2"
                        onClick={() => setIsSearchActive(true)}
                      >
                        <Search className="w-3.5 h-3.5" />
                        Search Grid
                      </Button>
                    )}
                  </div>
                </div>

                {/* Dashboard Workspace */}
                <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-4">
                  {/* Sheet Stats & Background Preview */}
                  <div className="grid grid-cols-4 gap-4 shrink-0">
                    <div className="col-span-3 glass-card p-4 relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <FileSpreadsheet className="w-48 h-48" />
                      </div>
                      <div className="relative z-10 flex gap-6 h-full">
                        <div className="flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <TableIcon className="w-4 h-4 text-blue-500" />
                              {state.spreadsheet.sheets[state.activeSheetIndex].name} Summary
                            </h3>
                            <div className="mt-3 flex gap-6">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Rows</span>
                                <span className="text-xl font-mono font-bold text-slate-700">
                                  {state.spreadsheet.sheets[state.activeSheetIndex].data.length.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-col border-l border-slate-100 pl-6">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Columns</span>
                                <span className="text-xl font-mono font-bold text-slate-700">
                                  {state.spreadsheet.sheets[state.activeSheetIndex].data[0]?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold mt-2">
                            <CheckCircle2 className="w-3 h-3" /> Secure Sync Active
                          </div>
                        </div>

                        {latestChartMessage?.chartData && (
                          <div className="flex-1 min-w-0 h-full border-l border-slate-100 pl-6 animate-in fade-in slide-in-from-right-4">
                            <DataVisualization 
                              type={latestChartMessage.chartData.type}
                              data={latestChartMessage.chartData.data}
                              keys={latestChartMessage.chartData.keys}
                              title={latestChartMessage.chartData.title}
                              compact={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-1">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">AI Intelligence</span>
                      <span className="text-[10px] text-slate-400">Context active for this sheet</span>
                    </div>
                  </div>

                  {/* Integrated Grid and Control Bar */}
                  <div className="flex-1 min-h-0 min-w-0 flex flex-col glass-card overflow-hidden">
                    <div className="flex-1 overflow-auto">
                      <SpreadsheetGrid 
                        data={state.spreadsheet.sheets[state.activeSheetIndex].data} 
                        onCellBlur={handleCellEdit}
                        searchQuery={searchQuery}
                      />
                    </div>
                    
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3 overflow-x-auto custom-scrollbar shadow-inner">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Guru Actions:</span>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleCleanData}
                        className="h-8 rounded-full bg-white text-xs border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 flex gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        Clean
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFoundDuplicates([]);
                          setSelectedDuplicateCols([]);
                          setShowDuplicatesDialog(true);
                        }}
                        className="h-8 rounded-full bg-white text-xs border-slate-200 hover:border-amber-200 hover:bg-amber-50 text-slate-600 flex gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-500" />
                        Duplicates
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleAddRow}
                        className="h-8 rounded-full bg-white text-xs border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 flex gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-500" />
                        Row
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <AIChat 
            messages={state.messages}
            onSendMessage={handleSendMessage}
            isAnalyzing={state.isAnalyzing}
            voiceEnabled={state.voiceEnabled}
            onToggleVoice={() => setState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
            voiceIndex={state.voiceIndex}
            onVoiceChange={(index) => setState(prev => ({ ...prev, voiceIndex: index }))}
            onFileUpload={onDrop}
          />
        </div>

        <footer className="h-8 bg-white/20 px-8 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/20">
          <p>© 2024 CJA_AI AGENT Pvt. Ltd. | Secure Local Processing Active</p>
          <div className="flex items-center gap-4 uppercase font-bold tracking-widest">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Voice: {state.voiceEnabled ? "Active" : "Muted"}</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Formula Engine: v2.4</span>
          </div>
        </footer>
      </main>

      <AboutModal isOpen={showAbout} onOpenChange={setShowAbout} />

      {/* Duplicate Detection Dialog */}
      <Dialog open={showDuplicatesDialog} onOpenChange={setShowDuplicatesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-amber-500" />
              Duplicate Detection
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 mb-4">
              Select the columns you want to use for identifying duplicate rows. If no columns are selected, the entire row will be compared.
            </p>
            
            <div className="max-h-[300px] overflow-y-auto border border-slate-100 rounded-lg p-3 space-y-2">
              {state.spreadsheet?.sheets[state.activeSheetIndex].data[0]?.map((header, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded transition-colors cursor-pointer" onClick={() => {
                  setSelectedDuplicateCols(prev => 
                    prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                  );
                }}>
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-all",
                    selectedDuplicateCols.includes(idx) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                  )}>
                    {selectedDuplicateCols.includes(idx) && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {String(header || `Column ${idx + 1}`)}
                  </span>
                </div>
              ))}
            </div>

            {foundDuplicates.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-900">
                  Detected {foundDuplicates.length} duplicates
                </span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRemoveDuplicates}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Remove All
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicatesDialog(false)}>Cancel</Button>
            <Button onClick={handleDetectDuplicates} className="btn-primary">
              <Search className="w-4 h-4 mr-2" />
              Scan for Duplicates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

