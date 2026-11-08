import { Check } from 'lucide-react';
import { useProgress } from '../hooks/useProgress.jsx';
import { scrollToId } from '../hooks/useMotion.js';

export default function ProgressTracker() {
  const { summary } = useProgress();
  return (
    <aside className="tracker" aria-label="Tu progreso">
      <ol className="tracker__list">
        {summary.perChallenge.map((c, i) => (
          <li key={c.id} className={c.complete ? 'is-done' : ''}>
            <a href={`#reto-${c.id}`} onClick={(e) => (e.preventDefault(), scrollToId(`reto-${c.id}`))}>
              <span className="tracker__num">{c.complete ? <Check aria-hidden="true" /> : `0${i + 1}`}</span>
              <span className="tracker__name">{c.title}</span>
              <span className="tracker__count">
                {c.done}/{c.items.length}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <dl className="tracker__stats">
        <div>
          <dt>Retos</dt>
          <dd>{summary.completed}/3</dd>
        </div>
        <div>
          <dt>Aciertos</dt>
          <dd>{summary.correct}</dd>
        </div>
        <div>
          <dt>Puntos</dt>
          <dd>{summary.score}</dd>
        </div>
        <div className="tracker__bar">
          <dt>Progreso</dt>
          <dd>
            <span className="tracker__track" aria-hidden="true">
              <span style={{ width: `${summary.percent}%` }} />
            </span>
            {summary.percent} %
          </dd>
        </div>
      </dl>
    </aside>
  );
}
