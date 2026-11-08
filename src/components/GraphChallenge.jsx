import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import ChoiceQuestion from './ChoiceQuestion.jsx';
import { GRAPH_EXERCISES, MOTIONS } from '../data/challenges.js';
import { useProgress } from '../hooks/useProgress.jsx';
import { prefersReducedMotion } from '../hooks/useMotion.js';

const DURATION = 3200;
const MARKS = 7; // posiciones a intervalos iguales de tiempo

function MotionStrip({ motion, playKey }) {
  const dot = useRef(null);
  const [t, setT] = useState(prefersReducedMotion() ? 1 : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setT(1);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion, playKey]);

  const x = MOTIONS[motion].x;
  const shown = Array.from({ length: MARKS }, (_, i) => i / (MARKS - 1)).filter((ti) => ti <= t + 1e-6);

  return (
    <svg viewBox="0 0 600 124" className="strip" aria-hidden="true">
      <line x1="30" y1="80" x2="570" y2="80" stroke="#1A1A1A" strokeOpacity="0.25" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={30 + i * 54} y1="80" x2={30 + i * 54} y2="88" stroke="#1A1A1A" strokeOpacity="0.3" />
      ))}
      {shown.map((ti) => (
        <g key={ti}>
          <circle cx={30 + x(ti) * 540} cy="62" r="10" fill="#1A1A1A" opacity="0.18" />
          <text x={30 + x(ti) * 540} y="112" textAnchor="middle" fontSize="18" fill="#4D4D4D">
            {Math.round(ti * (MARKS - 1))} s
          </text>
        </g>
      ))}
      <circle ref={dot} cx={30 + x(t) * 540} cy="62" r="13" fill="#FF051E" />
      <text x="30" y="24" fontSize="18" fontWeight="700" fill="#4D4D4D">
        Una marca por segundo
      </text>
    </svg>
  );
}

function Graph({ motion }) {
  const fn = MOTIONS[motion].x;
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return `${24 + t * 150},${136 - fn(t) * 110}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 190 160" className="graph" aria-hidden="true">
      <line x1="24" y1="140" x2="182" y2="140" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="24" y1="140" x2="24" y2="12" stroke="#1A1A1A" strokeWidth="2" />
      <text x="180" y="156" textAnchor="end" fontSize="12" fill="#4D4D4D">t</text>
      <text x="8" y="22" fontSize="12" fill="#4D4D4D">x</text>
      <polyline points={pts} fill="none" stroke="#FF051E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function GraphChallenge() {
  const { items, record } = useProgress();
  const firstOpen = GRAPH_EXERCISES.findIndex((e) => !items[e.id]);
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [playKey, setPlayKey] = useState(0);
  const ex = GRAPH_EXERCISES[index];
  const solved = Boolean(items[ex.id]);
  const allDone = GRAPH_EXERCISES.every((e) => items[e.id]);

  return (
    <div className="challenge__body">
      <div className="levels" role="tablist" aria-label="Ejercicios">
        {GRAPH_EXERCISES.map((e, i) => {
          const done = Boolean(items[e.id]);
          const reachable = done || i <= Math.max(0, firstOpen);
          return (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`levels__tab ${done ? 'is-done' : ''}`}
              onClick={() => reachable && setIndex(i)}
              disabled={!reachable}
            >
              {done && <Check aria-hidden="true" />}
              Ejercicio {i + 1}
            </button>
          );
        })}
      </div>

      <div className="scenario scenario--wide">
        <p className="scenario__context">{ex.object}</p>
        <MotionStrip motion={ex.motion} playKey={`${ex.id}-${playKey}`} />
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPlayKey((k) => k + 1)}>
          <RotateCcw aria-hidden="true" /> Ver de nuevo
        </button>
      </div>

      <div className="challenge__question challenge__question--wide">
        <ChoiceQuestion
          id={ex.id}
          question="¿Cuál gráfica de posición contra tiempo representa este movimiento?"
          options={ex.options}
          correct={ex.options.indexOf(ex.motion)}
          hint="Fíjate en la separación entre marcas: si es igual, la posición cambia al mismo ritmo; si crece o se reduce, la pendiente de la gráfica cambia."
          explanation={ex.explanation}
          solved={solved}
          onSolved={({ firstTry, mistakes }) => record(ex.id, { firstTry, points: firstTry ? 100 : mistakes === 1 ? 50 : 25 })}
          renderOption={(m) => (
            <>
              <Graph motion={m} />
              <span className="sr-only">Gráfica: {MOTIONS[m].shape}</span>
            </>
          )}
          layout="cards"
        />
        {solved && index < GRAPH_EXERCISES.length - 1 && (
          <button type="button" className="btn btn--dark challenge__next" onClick={() => setIndex(index + 1)}>
            Siguiente ejercicio <ArrowRight aria-hidden="true" />
          </button>
        )}
        {allDone && index === GRAPH_EXERCISES.length - 1 && (
          <p className="challenge__done">
            <Check aria-hidden="true" /> Reto completado
          </p>
        )}
      </div>
    </div>
  );
}
