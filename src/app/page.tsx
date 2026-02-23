'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, BookOpen, CheckCircle2, ArrowRight, Anchor, ShieldCheck, AlertCircle, RotateCcw } from 'lucide-react';
import questionsData from '@/data/questions.json';
import { Question } from '@/types';

export default function Home() {
  const [failedCount, setFailedCount] = useState(0);
  const [types, setTypes] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const failedIds = JSON.parse(localStorage.getItem('failedQuestions') || '[]');
    setFailedCount(failedIds.length);

    // Extract unique types from questionsData
    const uniqueTypes = [...new Set((questionsData as Question[]).map(q => q.Tipo).filter(t => t))];
    setTypes(uniqueTypes);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 font-sans">
      <motion.main 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ rotate: -5, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200"
          >
            <Anchor size={32} strokeWidth={2.5} />
          </motion.div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">PER Estudio</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
            Simulador interactivo para el <span className="text-blue-600 font-bold">Patrón de Embarcaciones de Recreo</span>.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Main Actions */}
          <div className="space-y-3">
            {failedCount > 0 && (
              <Link href="/quiz?mode=review">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-orange-50 text-orange-700 rounded-xl font-bold text-base hover:bg-orange-100 transition-all border border-orange-100 flex items-center justify-center gap-2 cursor-pointer mb-4"
                >
                  <AlertCircle size={18} /> Repasar Errores ({failedCount})
                </motion.div>
              </Link>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Link href="/quiz">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen size={18} /> Practicar Todo
                </motion.div>
              </Link>
              
              <Link href="/quiz?mode=random20">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-base hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={18} /> Aleatorio (20 Preguntas)
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Practice by Type */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Compass size={16} className="text-slate-400" />
              <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Practicar por Temario</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {types.map((type, idx) => (
                <Link key={idx} href={`/quiz?type=${encodeURIComponent(type)}`}>
                  <motion.div 
                    whileTap={{ scale: 0.99 }}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors line-clamp-1">{type}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
            Mar de Alborán • 2026
          </p>
        </div>
      </motion.main>
    </div>
  );
}
