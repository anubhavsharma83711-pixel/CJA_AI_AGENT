import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileSpreadsheet, Sparkles, Wand2, Volume2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to CJA_AI AGENT",
      description: "Your intelligent AI partner for managing complex data effortlessly.",
      icon: <FileSpreadsheet className="w-12 h-12 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      title: "AI Powered Insights",
      description: "Summarize thousands of rows in seconds. Detect trends and patterns with one click.",
      icon: <Sparkles className="w-12 h-12 text-teal-500" />,
      color: "bg-teal-100"
    },
    {
      title: "Natural Voice Support",
      description: "Our Agent doesn't just analyze; it speaks too. Listen to data summaries in a natural human tone.",
      icon: <Volume2 className="w-12 h-12 text-purple-500" />,
      color: "bg-purple-100"
    },
    {
      title: "Privacy First",
      description: "No unnecessary tracking. Local processing wherever possible for maximum security.",
      icon: <ShieldCheck className="w-12 h-12 text-green-500" />,
      color: "bg-green-100"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-white/20">
      <div className="atmosphere" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg glass-panel p-10 rounded-3xl text-center space-y-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
            <div className={`w-24 h-24 ${steps[step].color} rounded-3xl flex items-center justify-center mx-auto shadow-inner`}>
              {steps[step].icon}
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">{steps[step].title}</h2>
              <p className="text-slate-500 text-lg leading-relaxed">{steps[step].description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-6 border-t border-white/20">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${step === i ? "w-6 bg-blue-600" : "bg-slate-200"}`} 
              />
            ))}
          </div>
          
          <Button 
            className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 gap-2 h-12 font-bold"
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else onFinish();
            }}
          >
            {step === steps.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
