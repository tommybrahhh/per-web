'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import questionsData from '@/data/questions.json';
import { Question } from '@/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, HelpCircle, BookOpen, Trophy, AlertCircle, Sparkles } from 'lucide-react';
import { getProgress, updateProgress, getQuestionId, MasteryLabels, MasteryColors, MasteryLevel, isDue } from '@/lib/progress';
import { NauticalVisualizer, detectSignal } from '@/components/NauticalVisualizer';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

function QuizContent() {
  const searchParams = useSearchParams();
  const isReviewMode = searchParams.get('mode') === 'review';
  const isRandom20 = searchParams.get('mode') === 'random20';
  const isSmartStudy = searchParams.get('mode') === 'smart';
  const isFlashcardMode = searchParams.get('mode') === 'flashcards';
  const selectedType = searchParams.get('type');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [masteryData, setMasteryData] = useState<Record<string, { level: number, nextReview: number }>>({});
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = getProgress();
    setMasteryData(progress as any);
    
    let allQuestions = (questionsData as Question[]).filter(q => q.Pregunta && q.Respuesta);
    
    if (isReviewMode || isFlashcardMode) {
      allQuestions = allQuestions.filter(q => {
        const p = progress[getQuestionId(q)];
        if (isFlashcardMode && !p) return true;
        return isDue(p);
      });
    } else if (isSmartStudy) {
      allQuestions = allQuestions.filter(q => isDue(progress[getQuestionId(q)]));
      allQuestions = shuffleArray(allQuestions).slice(0, 15);
    } else if (selectedType) {
      allQuestions = allQuestions.filter(q => q.Tipo === selectedType);
    }

    let finalSet = (isSmartStudy || isFlashcardMode) ? allQuestions : shuffleArray(allQuestions);
    if (isRandom20) {
      finalSet = finalSet.slice(0, 20);
    }
    
    setQuestions(finalSet);
  }, [isReviewMode, isRandom20, isSmartStudy, isFlashcardMode, selectedType]);

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

  // Detector de señales visuales para la pregunta actual
  const visualAid = useMemo(() => {
    if (!questions[currentIndex]) return null;
    const q = questions[currentIndex];
    return detectSignal(q.Pregunta + ' ' + (q.Explicacion || ''));
  }, [questions, currentIndex]);

  const handleSelect = (index: number) => {
    if (selectedAnswerIndex !== null) return;
    const isCorrect = currentOptions[index].isCorrect;
    const currentQId = getQuestionId(questions[currentIndex]);
    updateProgress(currentQId, isCorrect);
    setMasteryData(getProgress() as any);
    if (isCorrect) setScore(score + 1);
    setSelectedAnswerIndex(index);
    setShowExplanation(true);
  };

  const handleFlashcardResult = (isCorrect: boolean) => {
    const currentQId = getQuestionId(questions[currentIndex]);
    updateProgress(currentQId, isCorrect);
    setMasteryData(getProgress() as any);
    if (isCorrect) setScore(score + 1);
    nextQuestion();
  };

  const nextQuestion = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswerIndex(null);
    setShowExplanation(false);
    setIsFlipped(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (questions.length === 0 && currentIndex === 0) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600"><CheckCircle2 size={32} /></div>
      <h2 className="text-xl font-bold mb-2">¡Todo al día!</h2>
      <p className="text-slate-500 mb-8 max-w-xs">{isReviewMode || isFlashcardMode ? 'No tienes nada pendiente de repaso. ¡Vuelve más tarde!' : isSmartStudy ? '¡Has completado tus repasos de hoy! Mañana tendrás más.' : `No hay preguntas disponibles para: ${selectedType}`}</p>
      <Link href="/" className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><Home size={18} /> Volver al Inicio</Link>
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-400">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-2"><RotateCcw size={32} /></motion.div>
      <p className="text-lg font-medium tracking-tight">Cargando...</p>
    </div>
  );
  
  if (currentIndex >= questions.length) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-slate-100">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><Trophy className="text-blue-600 w-8 h-8" /></div>
        <h2 className="text-2xl font-bold mb-1 text-slate-900">{isFlashcardMode ? '¡Sesión Finalizada!' : '¡Completado!'}</h2>
        <p className="text-slate-500 mb-8 font-medium">Has terminado tu sesión de estudio.</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="block text-2xl font-bold text-green-600">{score}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sabidas</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="block text-2xl font-bold text-blue-600">{questions.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
          </div>
        </div>
        <Link href="/" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><Home size={18} /> Volver al Inicio</Link>
      </motion.div>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const qId = getQuestionId(currentQuestion);
  const masteryInfo = masteryData[qId] || { level: 0 };
  const masteryLevel = masteryInfo.level as MasteryLevel;

  const getModeTitle = () => {
    if (isFlashcardMode) return 'MODO MNEMOTECNIA';
    if (isReviewMode) return 'REPASO ENFOCADO';
    if (isRandom20) return 'PRÁCTICA (20)';
    if (isSmartStudy) return 'ESTUDIO INTELIGENTE';
    return currentQuestion.Tipo?.toUpperCase() || 'PRÁCTICA LIBRE';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><Home size={20} /></Link>
            <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
            <div className={`p-2 rounded-lg ${isFlashcardMode ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              {isFlashcardMode ? <Sparkles size={18} /> : <BookOpen size={18} />}
            </div>
          </div>
          <div className="flex-1 px-4 overflow-hidden text-center">
            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{getModeTitle()}</span>
            <div className="flex items-center gap-2 justify-center">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                <motion.div animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} className={`h-full ${isFlashcardMode ? 'bg-amber-500' : 'bg-blue-500'}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">{currentIndex + 1}/{questions.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 shrink-0">
            <CheckCircle2 size={14} className="text-green-500" /><span className="text-xs font-bold text-green-700">{score}</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                <HelpCircle size={10} /> {currentQuestion.Tipo || 'General'}
              </div>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${MasteryColors[masteryLevel]}`}>
                {MasteryLabels[masteryLevel]}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 leading-tight tracking-tight">{currentQuestion.Pregunta}</h2>

            {/* Ayuda Visual (Solo si se detecta señal náutica) */}
            {visualAid && (
              <NauticalVisualizer 
                type={visualAid.type as any} 
                colors={visualAid.colors} 
                shapes={visualAid.shapes as any} 
              />
            )}

            {isFlashcardMode ? (
              <div className="relative min-h-[400px] mb-8" style={{ perspective: '1000px' }}>
                <motion.div 
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
                >
                  {/* FRONT */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 min-h-[350px] flex flex-col justify-center items-center text-center" style={{ backfaceVisibility: 'hidden', width: '100%' }}>
                    <p className="text-slate-500 text-sm mb-6">Piensa la respuesta y gira la carta...</p>
                    <button onClick={() => setIsFlipped(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors">
                      Revelar Respuesta <RotateCcw size={18} />
                    </button>
                  </div>
                  {/* BACK */}
                  <div className="absolute inset-0 bg-slate-900 p-8 rounded-[2rem] shadow-xl border-2 border-slate-800 min-h-[350px] flex flex-col justify-center items-center text-center text-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', width: '100%' }}>
                    <div className="mb-6">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2">Respuesta Correcta</span>
                      <p className="text-xl font-bold text-white mb-4">{currentQuestion.Respuesta}</p>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-8 italic">{currentQuestion.Explicacion || "Sin explicación adicional."}</p>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <button onClick={() => handleFlashcardResult(false)} className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold flex flex-col items-center gap-1 hover:bg-red-500/20 transition-all"><XCircle size={20} /><span className="text-xs uppercase">No la sabía</span></button>
                      <button onClick={() => handleFlashcardResult(true)} className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold flex flex-col items-center gap-1 hover:bg-green-500/20 transition-all"><CheckCircle2 size={20} /><span className="text-xs uppercase">¡La sabía!</span></button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="grid gap-3 mb-6">
                {currentOptions.map((opt, idx) => {
                  const isSelected = selectedAnswerIndex === idx;
                  const isCorrect = opt.isCorrect;
                  const answered = selectedAnswerIndex !== null;
                  return (
                    <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${!answered ? 'bg-white border-slate-100 active:bg-blue-50' : isCorrect ? 'bg-green-50 border-green-500 text-green-900' : isSelected ? 'bg-red-50 border-red-500 text-red-900' : 'bg-white border-slate-50 opacity-40 grayscale'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${!answered ? 'bg-slate-100 text-slate-400' : isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-300'}`}>{['A', 'B', 'C', 'D'][idx]}</div>
                      <span className="pt-1 text-base font-semibold leading-snug flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <AnimatePresence>
              {showExplanation && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                  <div className={`p-5 rounded-xl border mb-6 ${currentOptions[selectedAnswerIndex!]?.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-slate-800 leading-relaxed text-sm font-semibold mb-2">{currentQuestion.Explicacion || "Respuesta verificada según el reglamento oficial."}</p>
                    {!currentOptions[selectedAnswerIndex!]?.isCorrect && <p className="text-red-700 text-sm font-bold mt-3 border-t border-red-100 pt-3">La respuesta correcta era: {currentQuestion.Respuesta}</p>}
                  </div>
                  <button onClick={nextQuestion} className="w-full py-4 bg-slate-900 text-white font-bold text-base rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg mb-8">Siguiente Pregunta <ArrowRight size={18} /></button>
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-400"><RotateCcw size={32} className="animate-spin mb-2" /><p className="text-lg font-medium tracking-tight">Cargando quiz...</p></div>}>
      <QuizContent />
    </Suspense>
  );
}
