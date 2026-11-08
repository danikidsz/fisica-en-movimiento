import ProgressTracker from './ProgressTracker.jsx';
import SpeedChallenge from './SpeedChallenge.jsx';
import ProjectileChallenge from './ProjectileChallenge.jsx';
import GraphChallenge from './GraphChallenge.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { useProgress } from '../hooks/useProgress.jsx';
import './Laboratory.css';

const CHALLENGES = [
  {
    id: 'velocidad',
    n: '01',
    title: 'Detective de velocidad',
    goal: 'Relaciona distancia, tiempo y velocidad.',
    Comp: SpeedChallenge,
  },
  {
    id: 'balon',
    n: '02',
    title: '¿Dónde caerá el balón?',
    goal: 'Predice y explora el movimiento parabólico.',
    Comp: ProjectileChallenge,
  },
  {
    id: 'grafica',
    n: '03',
    title: 'Encuentra la gráfica',
    goal: 'Relaciona un movimiento con su gráfica de posición contra tiempo.',
    Comp: GraphChallenge,
  },
];

export default function Laboratory() {
  const { version } = useProgress();
  return (
    <section id="laboratorio" className="section lab" aria-labelledby="lab-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          Laboratorio interactivo
        </p>
        <h2 id="lab-title" className="section-title" data-reveal="2">
          Ahora te toca experimentar.
        </h2>
        <p className="section-lead" data-reveal="3">
          Explora diferentes situaciones y descubre cómo cambian las variables del movimiento. Si te
          equivocas, recibes una pista y vuelves a intentarlo.
        </p>

        <div className="lab__layout">
          <ProgressTracker />

          <div className="lab__challenges">
            {CHALLENGES.map(({ id, n, title, goal, Comp }) => (
              <article key={id} id={`reto-${id}`} className="challenge" aria-labelledby={`t-${id}`} data-reveal>
                <header className="challenge__head">
                  <span className="challenge__n">Reto {n}</span>
                  <h3 id={`t-${id}`} className="challenge__title">
                    {title}
                  </h3>
                  <p className="challenge__goal">{goal}</p>
                </header>
                <ErrorBoundary name={`El reto ${n}`}>
                  <Comp key={version} />
                </ErrorBoundary>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
