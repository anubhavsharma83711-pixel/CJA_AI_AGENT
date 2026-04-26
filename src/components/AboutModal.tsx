import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { User, Award, Globe, Heart } from 'lucide-react';

interface AboutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ isOpen, onOpenChange }: AboutProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md glass-panel p-0 overflow-hidden border-none rounded-3xl">
        <div className="bg-blue-600 h-32 flex items-end justify-center pb-6">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-2xl relative translate-y-12">
            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
               <User className="w-12 h-12 text-slate-400" />
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-8 space-y-6 text-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Ramesh</h2>
            <p className="text-blue-600 font-semibold text-sm">Founder & Visionary, CJA_AI AGENT Pvt. Ltd.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl flex flex-col items-center gap-1 border border-blue-100">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Experience</span>
              <span className="text-xs font-semibold">15+ Years</span>
            </div>
            <div className="p-3 bg-teal-50 rounded-2xl flex flex-col items-center gap-1 border border-teal-100">
              <Globe className="w-5 h-5 text-teal-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mission</span>
              <span className="text-xs font-semibold">Global Scale</span>
            </div>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed italic px-4">
            "CJA_AI AGENT was born from a simple belief: that complex data shouldn't be a barrier to innovation. We're building a future where everyone can command their numbers with the power of AI."
          </p>

          <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by CJA_AI AGENT Team
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
