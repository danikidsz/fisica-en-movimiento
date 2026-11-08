import { useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { useProgress } from '../hooks/useProgress.jsx';
import { scrollToId } from '../hooks/useMotion.js';
import { CONCEPTS } from '../data/challenges.js';
import { COURSE_URL, COURSE_TARGET } from '../config.js';
import './FinalResults.css';

export default function FinalResults() {
  const { summary, reset } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const doneIds = new Set(summary.perChallenge.filter((c) => c.done > 0).map((c) => c.id));
  const finished = summary.completed === 3;

  const stats = [
    { label: 'Retos completados', value: `${summary.completed}/3` },
    { label: 'Aciertos al primer intento', value: `${summary.correct}/${summary.total}` },
    { label: 'Puntuación total', value: summary.score },
    { label: 'Progreso', value: `${summary.percent} %` },
  ];

  return (
    <section id="resultados" className="section section--navy results" aria-labelledby="results-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          Cierre
        </p>
        <h2 id="results-title" className="section-title results__title" data-reveal="2">
          El movimiento ya no es <span>un misterio.</span>
        </h2>
        <p className="section-lead" data-reveal="3">
          {finished
            ? 'Completaste los tres retos. Ya puedes describir un movimiento con posición, velocidad, tiempo y su gráfica.'
            : summary.answered === 0
              ? 'Aún no has resuelto retos. Vuelve al laboratorio y completa los tres para ver tu resumen.'
              : 'Vas bien. Completa los retos que faltan para cerrar el módulo.'}
        </p>

        <dl className="results__stats" data-reveal>
          {stats.map((s) => (
            <div key={s.label}>
              <dd>{s.value}</dd>
              <dt>{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="results__concepts" data-reveal>
          <h3>Conceptos explorados</h3>
          <ul>
            {CONCEPTS.map((c) => {
              const on = doneIds.has(c.challenge);
              return (
                <li key={c.label} className={on ? 'is-on' : ''}>
                  <span aria-hidden="true">{on ? <Check /> : null}</span>
                  {c.label}
                  <span className="sr-only">{on ? '(explorado)' : '(pendiente)'}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="results__actions">
          {COURSE_URL ? (
            <a className="btn btn--primary" href={COURSE_URL} target={COURSE_TARGET} rel="noopener">
              Volver al curso <ArrowRight aria-hidden="true" />
            </a>
          ) : (
            <span className="results__pending">
              <button type="button" className="btn btn--primary" disabled aria-describedby="course-note">
                Volver al curso <ArrowRight aria-hidden="true" />
              </button>
              <small id="course-note">Enlace al Genially pendiente (configúralo en src/config.js).</small>
            </span>
          )}

          {!finished && (
            <button type="button" className="btn btn--ghost" onClick={() => scrollToId('laboratorio')}>
              Ir al laboratorio
            </button>
          )}

          {summary.answered > 0 &&
            (confirming ? (
              <span className="results__confirm" role="group" aria-label="Confirmar reinicio">
                <span>¿Borrar tu progreso?</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => (reset(), setConfirming(false), scrollToId('laboratorio'))}>
                  Sí, reiniciar
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(false)}>
                  Cancelar
                </button>
              </span>
            ) : (
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(true)}>
                <RotateCcw aria-hidden="true" /> Repetir retos
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
