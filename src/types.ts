export interface SheetData {
  name: string;
  data: any[][];
}

export interface Spreadsheet {
  id: string;
  name: string;
  sheets: SheetData[];
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  chartData?: {
    type: 'bar' | 'line' | 'pie';
    data: any[];
    keys: string[];
    title: string;
  };
}

export interface AppState {
  spreadsheet: Spreadsheet | null;
  activeSheetIndex: number;
  messages: ChatMessage[];
  isAnalyzing: boolean;
  voiceEnabled: boolean;
  voiceIndex: number;
  onboardingComplete: boolean;
}
