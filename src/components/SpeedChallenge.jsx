import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bike, Check, RotateCcw } from 'lucide-react';
import ChoiceQuestion from './ChoiceQuestion.jsx';
import { SPEED_LEVELS } from '../data/challenges.js';
import { useProgress } from '../hooks/useProgress.jsx';
import { prefersReducedMotion } from '../hooks/useMotion.js';

function Track({ level, playKey }) {
  const rider = useRef(null);
  useEffect(() => {
    const el = rider.current;
    if (!el?.animate) return undefined;
    if (prefersReducedMotion()) {
      el.style.left = level.roundTrip ? '0%' : '100%';
      return undefined;
    }
    // Duraciones proporcionales a los tiempos del enunciado.
    const frames = level.roundTrip
      ? [
          { left: '0%', transform: 'translateX(-50%) scaleX(1)', offset: 0 },
          { left: '100%', transform: 'translateX(-50%) scaleX(1)', offset: 0.4 },
          { left: '100%', transform: 'translateX(-50%) scaleX(-1)', offset: 0.401 },
          { left: '0%', transform: 'translateX(-50%) scaleX(-1)', offset: 1 },
        ]
      : [
          { left: '0%', transform: 'translateX(-50%)' },
          { left: '100%', transform: 'translateX(-50%)' },
        ];
    const anim = el.animate(frames, { duration: level.roundTrip ? 4200 : 2600, easing: 'linear', fill: 'forwards' });
    return () => anim.cancel();
  }, [level, playKey]);

  return (
    <div className="track" aria-hidden="true">
      <div className="track__line">
        <span ref={rider} className="track__rider">
          <Bike />
        </span>
      </div>
      <div className="track__ticks">
        <span>0 m</span>
        <span>{level.distance.toLocaleString('es-CO')} m</span>
      </div>
    </div>
  );
}

export default function SpeedChallenge() {
  const { items, record } = useProgress();
  const firstOpen = SPEED_LEVELS.findIndex((l) => !items[l.id]);
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [playKey, setPlayKey] = useState(0);
  const level = SPEED_LEVELS[index];
  const solved = Boolean(items[level.id]);
  const allDone = SPEED_LEVELS.every((l) => items[l.id]);

  const onSolved = ({ firstTry, mistakes }) => {
    record(level.id, { firstTry, points: firstTry ? 100 : mistakes === 1 ? 60 : 30 });
  };

  return (
    <div className="challenge__body">
      <div className="levels" role="tablist" aria-label="Niveles">
        {SPEED_LEVELS.map((l, i) => {
          const done = Boolean(items[l.id]);
          const reachable = done || i === firstOpen || i <= Math.max(0, firstOpen);
          return (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`levels__tab ${done ? 'is-done' : ''}`}
              onClick={() => reachable && setIndex(i)}
              disabled={!reachable}
            >
              {done && <Check aria-hidden="true" />}
              {l.level}
            </button>
          );
        })}
      </div>

      <div className="challenge__split">
        <div className="scenario">
          <p className="scenario__context">{level.context}</p>
          <Track level={level} playKey={`${level.id}-${playKey}`} />
          <dl className="scenario__data">
            {level.data.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPlayKey((k) => k + 1)}>
            <RotateCcw aria-hidden="true" /> Ver de nuevo
          </button>
        </div>

        <div className="challenge__question">
          <p className="formula" aria-label="Fórmula: v igual a d sobre t">
            v = <span className="frac"><span>d</span><span>t</span></span>
          </p>
          <ChoiceQuestion
            id={level.id}
            question={level.question}
            options={level.options}
            correct={level.correct}
            hint={level.hint}
            explanation={level.explanation}
            solved={solved}
            onSolved={onSolved}
            layout="grid"
          />
          {solved && index < SPEED_LEVELS.length - 1 && (
            <button type="button" className="btn btn--dark challenge__next" onClick={() => setIndex(index + 1)}>
              Siguiente nivel <ArrowRight aria-hidden="true" />
            </button>
          )}
          {allDone && index === SPEED_LEVELS.length - 1 && (
            <p className="challenge__done">
              <Check aria-hidden="true" /> Reto completado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
