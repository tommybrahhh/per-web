'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import questionsData from '@/data/questions.json';
import { Question } from '@/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, HelpCircle, BookOpen, Trophy } from 'lucide-react';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuestions(shuffleArray(questionsData as Question[]));
  }, []);

  // Effect to scroll to explanation/button when it appears
  useEffect(() => {
    if (showExplanation && explanationRef.current) {
      setTimeout(() => {
        explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }, [showExplanation]);

  const currentOptions = useMemo(() => {
    if (questions.length === 0 || currentIndex >= questions.length) return [];
    const q = questions[currentIndex];
    const correctLetter = q.Respuesta.trim().toUpperCase();
    const allOptions = [
      { text: q["Respuesta A"], isCorrect: correctLetter === 'A' },
      { text: q["Respuesta B"], isCorrect: correctLetter === 'B' },
      { text: q["Respuesta C"], isCorrect: correctLetter === 'C' },
      { text: q["Respuesta D"], isCorrect: correctLetter === 'D' },
    ];
    return shuffleArray(allOptions);
  }, [questions, currentIndex]);

  if (questions.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-400">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-2">
        <RotateCcw size={32} />
      </motion.div>
      <p className="text-lg font-medium tracking-tight">Cargando...</p>
    </div>
  );
  
  if (currentIndex >= questions.length) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-slate-100"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-blue-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-1 text-slate-900">¡Completado!</h2>
        <p className="text-slate-500 mb-8 font-medium">Has terminado el set de preguntas.</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="block text-2xl font-bold text-green-600">{score}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Aciertos</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="block text-2xl font-bold text-blue-600">{questions.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              setQuestions(shuffleArray(questionsData as Question[]));
              setCurrentIndex(0); setScore(0); setSelectedAnswerIndex(null); setShowExplanation(false);
            }}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Reiniciar
          </button>
          <Link href="/" className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-200 text-center flex items-center justify-center gap-2">
            <Home size={18} /> Inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );

  const currentQuestion = questions[currentIndex];

  const handleSelect = (index: number) => {
    if (selectedAnswerIndex !== null) return;
    setSelectedAnswerIndex(index);
    setShowExplanation(true);
    if (currentOptions[index].isCorrect) setScore(score + 1);
  };

  const nextQuestion = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswerIndex(null);
    setShowExplanation(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen size={18} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">PROGRESO</span>
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} className="h-full bg-blue-500" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">{currentIndex + 1}/{questions.length}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs font-bold text-green-700">{score}</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
              <HelpCircle size={10} />
              {currentQuestion.Tipo || 'General'}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 leading-tight tracking-tight">
              {currentQuestion.Pregunta}
            </h2>

            <div className="grid gap-3 mb-6">
              {currentOptions.map((opt, idx) => {
                const isSelected = selectedAnswerIndex === idx;
                const isCorrect = opt.isCorrect;
                const answered = selectedAnswerIndex !== null;
                
                return (
                  <button 
                    key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                    className={`
                      relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3
                      ${!answered 
                        ? 'bg-white border-slate-100 active:bg-blue-50' 
                        : isCorrect 
                          ? 'bg-green-50 border-green-500 text-green-900' 
                          : isSelected 
                            ? 'bg-red-50 border-red-500 text-red-900' 
                            : 'bg-white border-slate-50 opacity-40 grayscale'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
                      ${!answered 
                        ? 'bg-slate-100 text-slate-400' 
                        : isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-300'
                      }
                    `}>
                      {['A', 'B', 'C', 'D'][idx]}
                    </div>
                    <span className="pt-1 text-base font-semibold leading-snug flex-1">{opt.text}</span>
                    {answered && (isCorrect || isSelected) && (
                      <div className="shrink-0 pt-1.5">
                        {isCorrect ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden" ref={explanationRef}>
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Explicación</h3>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-sm font-medium italic">
                      {currentQuestion.Explicacion || "Respuesta verificada según el reglamento oficial."}
                    </p>
                  </div>
                  <button 
                    onClick={nextQuestion}
                    className="w-full py-4 bg-slate-900 text-white font-bold text-base rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg mb-8"
                  >
                    Siguiente Pregunta <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
