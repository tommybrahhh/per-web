export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

export interface QuestionProgress {
  level: MasteryLevel;
  nextReview: number; // Timestamp
}

export const MasteryLabels = {
  0: 'NUEVA',
  1: 'APRENDIENDO',
  2: 'REPASO CORTO',
  3: 'REPASO LARGO',
  4: 'DOMINADA'
};

export const MasteryColors = {
  0: 'bg-slate-100 text-slate-500',
  1: 'bg-orange-100 text-orange-600',
  2: 'bg-blue-100 text-blue-600',
  3: 'bg-indigo-100 text-indigo-600',
  4: 'bg-green-100 text-green-600'
};

// Intervalos en milisegundos
const INTERVALS = {
  0: 0,
  1: 1 * 60 * 60 * 1000, // 1 hora
  2: 24 * 60 * 60 * 1000, // 1 día
  3: 3 * 24 * 60 * 60 * 1000, // 3 días
  4: 7 * 24 * 60 * 60 * 1000, // 7 días
};

export const getProgress = (): Record<string, QuestionProgress> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('per-mastery-v2');
    if (!saved) {
      // Migración básica si existía el formato antiguo
      const old = localStorage.getItem('per-mastery');
      if (old) {
        const oldData = JSON.parse(old);
        const migrated: Record<string, QuestionProgress> = {};
        Object.keys(oldData).forEach(id => {
          migrated[id] = { level: oldData[id], nextReview: Date.now() };
        });
        return migrated;
      }
      return {};
    }
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
};

export const updateProgress = (qId: string, isCorrect: boolean): MasteryLevel => {
  const current = getProgress();
  const currentData = current[qId] || { level: 0, nextReview: 0 };
  
  let newLevel: MasteryLevel = 0;
  if (isCorrect) {
    newLevel = Math.min(currentData.level + 1, 4) as MasteryLevel;
  } else {
    // Si falla, vuelve al nivel 1 para repasar pronto
    newLevel = 1;
  }
  
  const nextReview = Date.now() + (INTERVALS[newLevel] || 0);
  
  current[qId] = {
    level: newLevel,
    nextReview
  };
  
  localStorage.setItem('per-mastery-v2', JSON.stringify(current));
  return newLevel;
};

export const getQuestionId = (q: any) => `${q.Tipo}-${q.Pregunta}`;

export const isDue = (progress?: QuestionProgress): boolean => {
  if (!progress) return true; // Si es nueva, está disponible
  return Date.now() >= progress.nextReview;
};
