import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Volume2, VolumeX, Sparkles, Wand2, CheckCircle2, Upload } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '../types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DataVisualization } from './DataVisualization';
import { useDropzone } from 'react-dropzone';

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isAnalyzing: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  voiceIndex: number;
  onVoiceChange: (index: number) => void;
  onFileUpload: (files: File[]) => void;
}

export function AIChat({ 
  messages, 
  onSendMessage, 
  isAnalyzing, 
  voiceEnabled, 
  onToggleVoice,
  voiceIndex,
  onVoiceChange,
  onFileUpload
}: AIChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: onFileUpload,
    noClick: true,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  } as any);

  const isNearBottom = () => {
    const container = scrollRef.current;
    if (!container) return false;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll to bottom ONLY if user is already near bottom or it's the first message
    if (messages.length > prevMessagesLength.current) {
      if (isNearBottom() || messages.length === 1) {
        scrollToBottom();
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, []);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v.filter(voice => voice.lang.includes('en')));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAnalyzing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div 
      {...getRootProps()}
      className="w-[600px] h-full flex flex-col bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-xl p-0 overflow-hidden shrink-0 box-border relative"
    >
      <input {...getInputProps()} />
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white"
          >
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 border border-white/40 shadow-xl">
              <Upload className="w-10 h-10 text-white animate-bounce" />
            </div>
            <h3 className="text-xl font-bold">Release to analyze</h3>
            <p className="text-white/60 text-sm">Drop your Excel or CSV file here</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section (fixed top) */}
      <div className="p-5 flex items-center gap-2 border-b border-white/40 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h2 className="text-sm font-bold">AI Assistant</h2>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                <Volume2 className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 glass-panel rounded-xl">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest">Voice Output</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {voices.length > 0 ? (
                  voices.slice(0, 8).map((voice, i) => (
                    <DropdownMenuItem 
                      key={i} 
                      onClick={() => onVoiceChange(i)}
                      className="flex justify-between items-center cursor-pointer"
                    >
                      <span className="text-[11px] truncate">{voice.name}</span>
                      {voiceIndex === i && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Loading voices...</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Ready to help
          </p>
        </div>
      </div>

      {/* Chat messages area (scrollable) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-5 scroll-smooth custom-scrollbar"
      >
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto border border-white shadow-sm">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium font-sans">I've analyzed your workplace. <br/> Ask me to summarize or find trends.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex flex-col gap-1 max-w-full",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                msg.role === 'user' ? "mr-2" : "ml-2"
              )}>
                {msg.role === 'user' ? 'You' : 'Agent'}
              </span>
              <div className={cn(
                "p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2",
                "max-w-[85%] whitespace-pre-wrap break-words overflow-wrap-anywhere box-border",
                msg.role === 'user' 
                  ? "bg-blue-600 text-white rounded-tr-none shadow-md" 
                  : "bg-white border border-slate-100 rounded-tl-none text-slate-600"
              )}>
                {msg.content}
                {msg.chartData && (
                  <DataVisualization 
                    type={msg.chartData.type}
                    data={msg.chartData.data}
                    keys={msg.chartData.keys}
                    title={msg.chartData.title}
                  />
                )}
              </div>
            </motion.div>
          ))}
          
          {isAnalyzing && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-widest">Agent</span>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm w-fit">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area (fixed bottom) */}
      <div className="p-4 border-t border-white/40 bg-white/20 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Guru anything..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100/50 border border-transparent rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all outline-none box-border"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isAnalyzing}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
