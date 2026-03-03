'use client';

import { motion } from 'framer-motion';

interface Props {
  type: 'light' | 'mark' | 'buoy';
  colors: string[];
  shapes?: ('circle' | 'triangle-up' | 'triangle-down' | 'square' | 'x')[];
}

export const NauticalVisualizer = ({ type, colors, shapes = [] }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-2xl my-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full animate-pulse ${type === 'light' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {type === 'light' ? 'Simulación Nocturna (Luces)' : 'Señal Diurna (Marcas de Tope)'}
        </span>
      </div>
      
      <div className="flex gap-6 items-center justify-center min-h-[120px]">
        {type === 'light' ? (
          <div className="flex flex-col gap-4">
            {colors.map((c, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-7 h-7 rounded-full"
                style={{ 
                  backgroundColor: c === 'white' ? '#fff' : c,
                  boxShadow: `0 0 20px ${c === 'white' ? '#fff' : c}, 0 0 40px ${c === 'white' ? '#ffffff44' : c + '44'}`
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col -space-y-1 items-center bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            {shapes.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`
                  ${s === 'circle' ? 'w-10 h-10 rounded-full' : ''}
                  ${s === 'square' ? 'w-10 h-10' : ''}
                  ${s === 'x' ? 'w-10 h-10 flex items-center justify-center' : ''}
                  ${s.startsWith('triangle') ? 'w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent' : ''}
                  ${s === 'triangle-up' ? 'border-b-[35px]' : ''}
                  ${s === 'triangle-down' ? 'border-t-[35px]' : ''}
                `}
                style={{ 
                  backgroundColor: (!s.startsWith('triangle') && s !== 'x') ? colors[i] || colors[0] : 'transparent',
                  borderBottomColor: s === 'triangle-up' ? colors[i] || colors[0] : undefined,
                  borderTopColor: s === 'triangle-down' ? colors[i] || colors[0] : undefined
                }}
              >
                {s === 'x' && (
                  <div className="relative w-full h-full">
                    <div className="absolute top-1/2 left-0 w-full h-2 bg-yellow-400 rotate-45 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-full h-2 bg-yellow-400 -rotate-45 rounded-full"></div>
                  </div>
                )}
              </motion.div>
            ))}
            {/* Mástil simbólico */}
            <div className="w-1 h-12 bg-slate-700 mt-2 rounded-full opacity-30"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export const detectSignal = (text: string) => {
  const t = text.toLowerCase();
  
  // LUCES (RIPA)
  if (t.includes('luz roja sobre blanca') || t.includes('roja sobre blanca')) return { type: 'light', colors: ['red', 'white'] };
  if (t.includes('luz blanca sobre roja') || t.includes('blanca sobre roja')) return { type: 'light', colors: ['white', 'red'] };
  if (t.includes('dos luces rojas') || t.includes('dos rojas en línea vertical')) return { type: 'light', colors: ['red', 'red'] };
  if (t.includes('tres luces rojas')) return { type: 'light', colors: ['red', 'red', 'red'] };
  if (t.includes('luz verde sobre blanca') || t.includes('verde sobre blanca')) return { type: 'light', colors: ['green', 'white'] };
  if (t.includes('luz roja sobre verde')) return { type: 'light', colors: ['red', 'green'] };
  
  // MARCAS CARDINALES (Triángulos negros)
  if (t.includes('cardinal norte')) return { type: 'mark', colors: ['black', 'black'], shapes: ['triangle-up', 'triangle-up'] };
  if (t.includes('cardinal sur')) return { type: 'mark', colors: ['black', 'black'], shapes: ['triangle-down', 'triangle-down'] };
  if (t.includes('cardinal este')) return { type: 'mark', colors: ['black', 'black'], shapes: ['triangle-up', 'triangle-down'] };
  if (t.includes('cardinal oeste')) return { type: 'mark', colors: ['black', 'black'], shapes: ['triangle-down', 'triangle-up'] };
  
  // MARCAS LATERALES (Región A)
  if (t.includes('marca lateral babor') || (t.includes('cilindro') && t.includes('rojo'))) return { type: 'mark', colors: ['red'], shapes: ['square'] };
  if (t.includes('marca lateral estribor') || (t.includes('cono') && t.includes('verde'))) return { type: 'mark', colors: ['green'], shapes: ['triangle-up'] };
  
  // OTRAS MARCAS
  if (t.includes('peligro aislado') || t.includes('dos bolas negras')) return { type: 'mark', colors: ['black', 'black'], shapes: ['circle', 'circle'] };
  if (t.includes('aguas navegables') || t.includes('una bola roja')) return { type: 'mark', colors: ['red'], shapes: ['circle'] };
  if (t.includes('marca especial') || t.includes('una x amarilla') || t.includes('aspa')) return { type: 'mark', colors: ['yellow'], shapes: ['x'] };
  
  return null;
};
