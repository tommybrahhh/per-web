
export type MasteryLevel = 0 | 1 | 2 | 3;

export const MasteryLabels = {
  0: 'NUEVA',
  1: 'APRENDIENDO',
  2: 'REPASO',
  3: 'DOMINADA'
};

export const MasteryColors = {
  0: 'bg-slate-100 text-slate-500',
  1: 'bg-orange-100 text-orange-600',
  2: 'bg-blue-100 text-blue-600',
  3: 'bg-green-100 text-green-600'
};

export const getProgress = (): Record<string, MasteryLevel> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('per-mastery');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

export const updateProgress = (qId: string, isCorrect: boolean): MasteryLevel => {
  const current = getProgress();
  const currentLevel = current[qId] || 0;
  
  let newLevel: MasteryLevel = 0;
  if (isCorrect) {
    // Si aciertas, subes nivel (máximo 3)
    newLevel = Math.min(currentLevel + 1, 3) as MasteryLevel;
    // Si era nueva y aciertas, pasa directamente a Repaso? 
    // No, mejor paso a paso para asegurar que no ha sido suerte.
  } else {
    // Si fallas, vuelves a Nivel 1 (Aprendiendo) independientemente de donde estuvieras
    newLevel = 1;
  }
  
  current[qId] = newLevel;
  localStorage.setItem('per-mastery', JSON.stringify(current));
  return newLevel;
};

export const getQuestionId = (q: any) => `${q.Tipo}-${q.Pregunta}`;
