'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, BookOpen, CheckCircle2, ArrowRight, Anchor, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 font-sans">
      <motion.main 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 text-center relative overflow-hidden"
      >
        <motion.div 
          initial={{ rotate: -5, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-200"
        >
          <Anchor size={32} strokeWidth={2.5} />
        </motion.div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">PER Estudio</h1>
        <p className="text-base text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed font-medium">
          Simulador interactivo para el examen de <span className="text-blue-600 font-bold underline decoration-blue-100 decoration-2 underline-offset-4 tracking-tight">Patrón de Embarcaciones</span>.
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: Compass, title: "Real", color: "text-blue-600", bg: "bg-blue-50" },
            { icon: BookOpen, title: "94 Q", color: "text-indigo-600", bg: "bg-indigo-50" },
            { icon: CheckCircle2, title: "Tips", color: "text-green-600", bg: "bg-green-50" },
            { icon: ShieldCheck, title: "Gratis", color: "text-purple-600", bg: "bg-purple-50" },
          ].map((feature, i) => (
            <div 
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 bg-slate-50/50"
            >
              <div className={`p-2 ${feature.bg} ${feature.color} rounded-lg shadow-sm shrink-0`}>
                <feature.icon size={14} />
              </div>
              <span className="font-bold text-[10px] text-slate-600 uppercase tracking-wider">{feature.title}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <Link href="/quiz">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              Comenzar Práctica <ArrowRight size={20} strokeWidth={2.5} />
            </motion.div>
          </Link>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">
            Basado en tu plantilla Excel
          </p>
        </div>
      </motion.main>
      
      <footer className="mt-8 text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
        Mar de Alborán • 2026
      </footer>
    </div>
  );
}
