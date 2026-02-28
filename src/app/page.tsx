'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, BookOpen, CheckCircle2, ArrowRight, Anchor, ShieldCheck, AlertCircle, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import questionsData from '@/data/questions.json';
import { Question } from '@/types';
import { getProgress, MasteryLevel } from '@/lib/progress';

export default function Home() {
  const [stats, setStats] = useState({
    learning: 0,
    mastered: 0,
    total: questionsData.length
  });
  const [types, setTypes] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const progress = getProgress();
    const levels = Object.values(progress);
    
    setStats({
      learning: levels.filter(l => l === 1).length,
      mastered: levels.filter(l => l === 3).length,
      total: questionsData.length
    });

    // Extract unique types from questionsData
    const uniqueTypes = [...new Set((questionsData as Question[]).map(q => q.Tipo).filter(t => t))];
    setTypes(uniqueTypes);
  }, []);

  if (!isMounted) {
    return null;
  }

  const masteredPercentage = Math.round((stats.mastered / stats.total) * 100);

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
            Sistema de aprendizaje inteligente para el <span className="text-blue-600 font-bold">PER</span>.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-900 rounded-2xl p-5 mb-8 text-white shadow-inner relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Tu Progreso</p>
                <h3 className="text-2xl font-black">{masteredPercentage}% <span className="text-sm font-medium text-slate-400">Dominado</span></h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Dominadas</p>
                <p className="text-sm font-bold text-blue-400">{stats.mastered} / {stats.total}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${masteredPercentage}%` }}
                className="h-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Main Actions */}
          <div className="space-y-3">
            <Link href="/quiz?mode=smart">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer mb-2"
              >
                <Sparkles size={18} /> Estudio Inteligente
              </motion.div>
            </Link>

            {stats.learning > 0 && (
              <Link href="/quiz?mode=review">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-orange-50 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-100 transition-all border border-orange-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertCircle size={16} /> Repasar Críticas ({stats.learning})
                </motion.div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/quiz">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen size={16} /> Todo
                </motion.div>
              </Link>
              
              <Link href="/quiz?mode=random20">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={16} /> 20 Random
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Practice by Type */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Compass size={16} className="text-slate-400" />
              <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Por Temario</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide">
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
