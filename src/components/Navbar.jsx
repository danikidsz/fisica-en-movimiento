import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useProgress } from '../hooks/useProgress.jsx';
import { scrollToId } from '../hooks/useMotion.js';
import './Navbar.css';

export const SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'explora', label: 'Recorrido 360°' },
  { id: 'secuencia', label: 'Secuencia' },
  { id: 'laboratorio', label: 'Laboratorio' },
  { id: 'resultados', label: 'Resultados' },
];

export default function Navbar() {
  const [active, setActive] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { summary } = useProgress();

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));

    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setShowTop(window.scrollY > window.innerHeight * 1.2);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (e, id) => {
    e.preventDefault();
    scrollToId(id);
  };

  const activeIndex = SECTIONS.findIndex((s) => s.id === active);

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <a href="#inicio" className="nav__brand" onClick={(e) => go(e, 'inicio')}>
            <img src={`${import.meta.env.BASE_URL}assets/brand/uao-rojo.png`} alt="UAO" className="nav__logo" />
            <span className="nav__sep" aria-hidden="true" />
            <span>
              Física <strong>en movimiento</strong>
            </span>
          </a>

          <nav aria-label="Secciones">
            <ol className="nav__links">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => go(e, s.id)}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={i <= activeIndex ? 'is-passed' : ''}
                  >
                    <span className="nav__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="nav__label">{s.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <a
            href="#laboratorio"
            className="nav__score"
            onClick={(e) => go(e, 'laboratorio')}
            aria-label={`Puntuación ${summary.score}. Progreso ${summary.percent} por ciento`}
          >
            <span className="nav__score-num">{summary.score}</span>
            <span className="nav__score-lbl">pts</span>
            <span className="nav__score-bar" aria-hidden="true">
              <span style={{ width: `${summary.percent}%` }} />
            </span>
          </a>
        </div>
      </header>

      <button
        type="button"
        className={`to-top ${showTop ? 'is-shown' : ''}`}
        onClick={() => scrollToId('inicio')}
        aria-label="Volver arriba"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp aria-hidden="true" />
      </button>
    </>
  );
}
