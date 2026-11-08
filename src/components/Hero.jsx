import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown } from 'lucide-react';
import Player, { Ball } from './Player.jsx';
import { prefersReducedMotion, scrollToId } from '../hooks/useMotion.js';
import './Hero.css';

export default function Hero() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero__line > span', { yPercent: 110, duration: 0.9, stagger: 0.08 })
        .from('.hero__meta, .hero__text, .hero__actions', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.5')
        .from('.hero__disc', { scale: 0.85, opacity: 0, duration: 1.1, transformOrigin: '50% 50%' }, 0.1)
        .from('.hero__player', { x: -40, opacity: 0, duration: 0.9 }, 0.3)
        .fromTo('.hero__arc', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.4, ease: 'power2.inOut' }, 0.6)
        .from('.hero__tag', { opacity: 0, y: 10, duration: 0.5, stagger: 0.1 }, 1.3);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="inicio" className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero__grid wrap">
        <div className="hero__copy">
          <p className="hero__uni">Universidad Autónoma de Occidente</p>
          <p className="eyebrow hero__meta">Módulo 01 · Cinemática</p>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>El movimiento</span>
            </span>
            <span className="hero__line">
              <span>está en</span>
            </span>
            <span className="hero__line">
              <span>
                todas <em>partes.</em>
              </span>
            </span>
          </h1>

          <p className="hero__text">
            La cinemática estudia cómo se mueven los cuerpos: su posición, su velocidad y sus
            cambios de dirección, sin analizar las causas del movimiento.
          </p>

          <div className="hero__actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToId('explora')}>
              Comenzar experiencia
            </button>
            <p className="hero__motto">
              Explora. Experimenta. <strong>Comprende.</strong>
            </p>
          </div>
        </div>

        <div className="hero__art" aria-hidden="true">
          <svg viewBox="0 0 640 640" className="hero__svg">
            <circle className="hero__disc" cx="380" cy="318" r="262" fill="#FFFFFF" />
            <path d="M118 318 A262 262 0 0 1 380 56" fill="none" stroke="#FF051E" strokeWidth="6" strokeLinecap="round" className="hero__disc" />
            <line x1="20" y1="628" x2="640" y2="628" stroke="#1A1A1A" strokeOpacity="0.18" strokeWidth="2" />
            {/* trayectoria */}
            <path
              className="hero__arc"
              d="M314 606 Q470 120 626 250"
              fill="none"
              stroke="#FF051E"
              strokeWidth="4"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            <path d="M314 606 Q470 120 626 250" fill="none" stroke="#1A1A1A" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 12" />
            {/* ángulo */}
            <path d="M384 606 A70 70 0 0 0 340 540" fill="none" stroke="#1A1A1A" strokeWidth="2.5" />
            <g className="hero__tag">
              <rect x="404" y="548" width="52" height="34" rx="17" fill="#1A1A1A" />
              <text x="430" y="571" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="700">θ</text>
            </g>
            <g className="hero__tag">
              <rect x="440" y="300" width="64" height="34" rx="17" fill="#FF051E" />
              <text x="472" y="323" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="700">v₀</text>
            </g>
            <g className="hero__tag">
              <rect x="540" y="372" width="78" height="30" rx="15" fill="#FBF5EC" />
              <text x="579" y="392" textAnchor="middle" fill="#1A1A1A" fontSize="14" fontWeight="700">x(t), y(t)</text>
            </g>
            <g className="hero__player" transform="translate(70 200) scale(1.45)">
              <Player
                pose={{ lean: 7, kickThigh: 38, kickShin: 62, armFront: -48, armBack: 52, standThigh: -6 }}
              />
            </g>
            <Ball cx={314} cy={606} r={20} />
          </svg>
        </div>
      </div>

      <button type="button" className="hero__scroll" onClick={() => scrollToId('explora')}>
        <span>Desliza</span>
        <ArrowDown aria-hidden="true" />
      </button>
    </section>
  );
}
