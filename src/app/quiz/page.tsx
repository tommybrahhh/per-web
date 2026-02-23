'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import questionsData from '@/data/questions.json';
import { Question } from '@/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, HelpCircle, BookOpen, Trophy, AlertCircle } from 'lucide-react';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Unique ID for questions since they don't have one in the JSON
const getQuestionId = (q: Question) => `${q.Tipo}-${q.Pregunta}`;

function QuizContent() {
  const searchParams = useSearchParams();
  const isReviewMode = searchParams.get('mode') === 'review';
  const isRandom20 = searchParams.get('mode') === 'random20';
  const selectedType = searchParams.get('type');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let allQuestions = (questionsData as Question[]).filter(q => q.Pregunta && q.Respuesta);
    
    if (isReviewMode) {
      const failedIds = JSON.parse(localStorage.getItem('failedQuestions') || '[]');
      allQuestions = allQuestions.filter(q => failedIds.includes(getQuestionId(q)));
    } else if (selectedType) {
      allQuestions = allQuestions.filter(q => q.Tipo === selectedType);
    }

    let finalSet = shuffleArray(allQuestions);
    if (isRandom20) {
      finalSet = finalSet.slice(0, 20);
    }
    
    setQuestions(finalSet);
  }, [isReviewMode, isRandom20, selectedType]);

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
    const correctText = q.Respuesta.trim().toLowerCase();
    
    const allOptions = [
      { text: q["Respuesta A"], isCorrect: q["Respuesta A"]?.trim().toLowerCase() === correctText },
      { text: q["Respuesta B"], isCorrect: q["Respuesta B"]?.trim().toLowerCase() === correctText },
      { text: q["Respuesta C"], isCorrect: q["Respuesta C"]?.trim().toLowerCase() === correctText },
      { text: q["Respuesta D"], isCorrect: q["Respuesta D"]?.trim().toLowerCase() === correctText },
    ].filter(opt => opt.text && opt.text.trim() !== "");

    return shuffleArray(allOptions);
  }, [questions, currentIndex]);

  const handleSelect = (index: number) => {
    if (selectedAnswerIndex !== null) return;
    
    const isCorrect = currentOptions[index].isCorrect;
    const currentQId = getQuestionId(questions[currentIndex]);
    const failedIds = JSON.parse(localStorage.getItem('failedQuestions') || '[]');
    
    if (isCorrect) {
      setScore(score + 1);
      // If correct, remove from failed questions list
      const newFailedIds = failedIds.filter((id: string) => id !== currentQId);
      localStorage.setItem('failedQuestions', JSON.stringify(newFailedIds));
    } else {
      // If incorrect, add to failed questions list if not already there
      if (!failedIds.includes(currentQId)) {
        failedIds.push(currentQId);
        localStorage.setItem('failedQuestions', JSON.stringify(failedIds));
      }
    }
    
    setSelectedAnswerIndex(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswerIndex(null);
    setShowExplanation(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if ((isReviewMode || selectedType) && questions.length === 0 && currentIndex === 0) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
        <CheckCircle2 className="text-green-600 w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold mb-2">¡Todo al día!</h2>
      <p className="text-slate-500 mb-8 max-w-xs">
        {isReviewMode ? 'No tienes preguntas pendientes de repasar.' : `No hay preguntas disponibles para: ${selectedType}`}
      </p>
      <Link href="/" className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
        <Home size={18} /> Volver al Inicio
      </Link>
    </div>
  );

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
        <h2 className="text-2xl font-bold mb-1 text-slate-900">
          {isReviewMode ? '¡Repaso Finalizado!' : '¡Completado!'}
        </h2>
        <p className="text-slate-500 mb-8 font-medium">
          {isReviewMode ? 'Has repasado tus errores.' : `Has terminado el set de ${isRandom20 ? '20 preguntas' : 'preguntas'}.`}
        </p>
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
              setCurrentIndex(0); setScore(0); setSelectedAnswerIndex(null); setShowExplanation(false);
              let allQuestions = (questionsData as Question[]).filter(q => q.Pregunta && q.Respuesta);
              if (isReviewMode) {
                const failedIds = JSON.parse(localStorage.getItem('failedQuestions') || '[]');
                allQuestions = allQuestions.filter(q => failedIds.includes(getQuestionId(q)));
              } else if (selectedType) {
                allQuestions = allQuestions.filter(q => q.Tipo === selectedType);
              }
              let finalSet = shuffleArray(allQuestions);
              if (isRandom20) finalSet = finalSet.slice(0, 20);
              setQuestions(finalSet);
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

  const getModeTitle = () => {
    if (isReviewMode) return 'MODO REPASO';
    if (isRandom20) return 'PRÁCTICA (20)';
    if (selectedType) return selectedType.toUpperCase();
    return 'PRÁCTICA LIBRE';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Home size={20} />
            </Link>
            <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
            <div className={`p-2 rounded-lg ${isReviewMode ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
              {isReviewMode ? <AlertCircle size={18} /> : <BookOpen size={18} />}
            </div>
          </div>
          
          <div className="flex-1 px-4 overflow-hidden">
            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">
              {getModeTitle()}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                <motion.div animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} className={`h-full ${isReviewMode ? 'bg-orange-500' : 'bg-blue-500'}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 shrink-0">{currentIndex + 1}/{questions.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 shrink-0">
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
                  <div className={`p-5 rounded-xl border mb-6 ${
                    currentOptions[selectedAnswerIndex!]?.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-3 rounded-full ${
                          currentOptions[selectedAnswerIndex!]?.isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest ${
                          currentOptions[selectedAnswerIndex!]?.isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {currentOptions[selectedAnswerIndex!]?.isCorrect ? '¡Correcto!' : 'Respuesta Incorrecta'}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-slate-800 leading-relaxed text-sm font-semibold mb-2 italic">
                      {currentQuestion.Explicacion || "Respuesta verificada según el reglamento oficial."}
                    </p>
                    
                    {!currentOptions[selectedAnswerIndex!]?.isCorrect && (
                      <div className="mt-3 pt-3 border-t border-red-100">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">La respuesta correcta era:</span>
                        <p className="text-red-700 text-sm font-bold">{currentQuestion.Respuesta}</p>
                      </div>
                    )}
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

export default function Quiz() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-400">
        <RotateCcw size={32} className="animate-spin mb-2" />
        <p className="text-lg font-medium tracking-tight">Cargando quiz...</p>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
