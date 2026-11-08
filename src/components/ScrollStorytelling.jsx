import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Player, { Ball, JOINTS } from './Player.jsx';
import FrameSequence from './FrameSequence.jsx';
import { MEDIA } from '../config.js';
import { useReducedMotion } from '../hooks/useMotion.js';
import './ScrollStorytelling.css';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { title: 'Preparado.', text: 'El jugador está frente al balón. Todo está en reposo: la velocidad del balón es cero.' },
  { title: 'Inicia el movimiento.', text: 'La pierna toma impulso hacia atrás. El cuerpo se inclina para ganar recorrido.' },
  { title: 'Contacto.', text: 'En una fracción de segundo, el pie le da al balón su velocidad inicial, v₀.' },
  { title: 'El balón despega.', text: 'Desde ahora su posición cambia con el tiempo. Eso es lo que describe la cinemática.' },
  { title: 'Aparece la trayectoria.', text: 'Sin resistencia del aire, el camino del balón es una parábola.' },
  { title: 'Vectores de velocidad.', text: 'La componente horizontal no cambia. La vertical disminuye por la gravedad, se anula en lo más alto y luego apunta hacia abajo.' },
  { title: 'Las variables.', text: 'Posición, velocidad, ángulo, tiempo y gravedad. Los puntos están separados por tiempos iguales: avanzan lo mismo en horizontal.' },
  { title: 'En movimiento.', text: 'Describimos cómo se mueve sin preguntar por qué. Eso es la cinemática.' },
];
const N = STEPS.length;

// Trayectoria: Bézier cuadrática con x lineal en t (parábola de eje vertical).
const P0 = { x: 320, y: 586 };
const P1 = { x: 710, y: 40 };
const P2 = { x: 1100, y: 520 };
const at = (t) => ({
  x: P0.x + (P2.x - P0.x) * t,
  y: (1 - t) ** 2 * P0.y + 2 * t * (1 - t) * P1.y + t * t * P2.y,
});
const vel = (t) => ({ vx: P2.x - P0.x, vy: 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y) });
const V_SCALE = 0.13;
const PATH_D = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
const STROBE = Array.from({ length: 9 }, (_, i) => at(i / 8));

function arrow(x1, y1, x2, y2) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 6) return `M${x1} ${y1}`;
  const h = 12;
  const a1 = ang + Math.PI * 0.85;
  const a2 = ang - Math.PI * 0.85;
  return `M${x1} ${y1} L${x2} ${y2} M${x2 + h * Math.cos(a1)} ${y2 + h * Math.sin(a1)} L${x2} ${y2} L${x2 + h * Math.cos(a2)} ${y2 + h * Math.sin(a2)}`;
}

export default function ScrollStorytelling() {
  const section = useRef(null);
  const svg = useRef(null);
  const [step, setStep] = useState(0);
  const [frame, setFrame] = useState(0);
  const reduced = useReducedMotion();
  const useSequence = MEDIA.sequence.frameCount > 0;

  useLayoutEffect(() => {
    const q = gsap.utils.selector(svg);
    const ball = { t: 0, frame: 0 };

    const update = () => {
      if (!svg.current) return;
      const p = at(ball.t);
      const v = vel(ball.t);
      q('.sc-ball')[0]?.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ball.t * 900})`);
      q('.sc-ball-shadow')[0]?.setAttribute('cx', p.x);
      const ex = p.x + v.vx * V_SCALE;
      const ey = p.y + v.vy * V_SCALE;
      q('.sc-v')[0]?.setAttribute('d', arrow(p.x, p.y, ex, ey));
      q('.sc-vx')[0]?.setAttribute('d', arrow(p.x, p.y, ex, p.y));
      q('.sc-vy')[0]?.setAttribute('d', arrow(p.x, p.y, p.x, ey));
      const vyLabel = q('.sc-vy-label')[0];
      if (vyLabel) {
        vyLabel.setAttribute('x', p.x - 16);
        vyLabel.setAttribute('y', (p.y + ey) / 2 + 6);
        vyLabel.setAttribute('opacity', Math.abs(ey - p.y) > 22 ? 1 : 0);
      }
      const vLabel = q('.sc-v-label')[0];
      if (vLabel) {
        vLabel.setAttribute('x', ex + 10);
        vLabel.setAttribute('y', ey - 6);
      }
      const vxLabel = q('.sc-vx-label')[0];
      if (vxLabel) {
        vxLabel.setAttribute('x', (p.x + ex) / 2);
        vxLabel.setAttribute('y', p.y + 26);
      }
      const posLabel = q('.sc-pos')[0];
      if (posLabel) posLabel.setAttribute('transform', `translate(${p.x} ${p.y})`);
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none', duration: 1 }, paused: true });

      if (useSequence) {
        tl.to(ball, {
          frame: MEDIA.sequence.frameCount - 1,
          duration: N,
          onUpdate: () => setFrame(Math.round(ball.frame)),
        });
      } else {
        gsap.set(q('.sc-player'), { opacity: 0, x: -50 });
        gsap.set(q('.sc-vectors, .sc-vars, .sc-strobe, .sc-angle, .sc-flash'), { opacity: 0 });
        gsap.set(q('.sc-path'), { attr: { 'stroke-dashoffset': 1 } });

        // 0 → 1 · aparece el jugador
        tl.to(q('.sc-player'), { opacity: 1, x: 0, ease: 'power2.out' }, 0)
          // 1 → 2 · impulso hacia atrás + acercamiento
          .to(q('.pl-kick-thigh'), { rotation: 38, svgOrigin: JOINTS.hipKick }, 1)
          .to(q('.pl-kick-shin'), { rotation: 64, svgOrigin: JOINTS.kneeKick }, 1)
          .to(q('.pl-arm-front'), { rotation: -50, svgOrigin: JOINTS.shoulderFront }, 1)
          .to(q('.pl-arm-back'), { rotation: 55, svgOrigin: JOINTS.shoulderBack }, 1)
          .to(q('.pl-body'), { rotation: 7, svgOrigin: JOINTS.body }, 1)
          .to(q('.sc-cam'), { scale: 1.32, svgOrigin: '330 540' }, 1)
          // 2 → 3 · contacto
          .to(q('.pl-kick-thigh'), { rotation: -28, svgOrigin: JOINTS.hipKick, ease: 'power2.in', duration: 0.7 }, 2)
          .to(q('.pl-kick-shin'), { rotation: -4, svgOrigin: JOINTS.kneeKick, ease: 'power2.in', duration: 0.7 }, 2)
          .to(q('.pl-arm-front'), { rotation: 40, svgOrigin: JOINTS.shoulderFront }, 2)
          .to(q('.pl-arm-back'), { rotation: -45, svgOrigin: JOINTS.shoulderBack }, 2)
          .to(q('.sc-flash'), { opacity: 1, scale: 1.6, svgOrigin: `${P0.x} ${P0.y}`, duration: 0.3 }, 2.6)
          .to(q('.sc-flash'), { opacity: 0, duration: 0.3 }, 3)
          // 3 → 4 · despega; la cámara se aleja
          .to(ball, { t: 0.28, onUpdate: update, ease: 'power1.in' }, 3)
          .to(q('.pl-kick-thigh'), { rotation: -62, svgOrigin: JOINTS.hipKick }, 3)
          .to(q('.pl-kick-shin'), { rotation: -18, svgOrigin: JOINTS.kneeKick }, 3)
          .to(q('.sc-cam'), { scale: 1, svgOrigin: '330 540', ease: 'power2.inOut' }, 3)
          // 4 → 5 · trayectoria
          .to(q('.sc-path'), { attr: { 'stroke-dashoffset': 0 } }, 4)
          .to(ball, { t: 0.45, onUpdate: update }, 4)
          // 5 → 6 · vectores
          .to(q('.sc-vectors'), { opacity: 1, duration: 0.4 }, 5)
          .to(ball, { t: 0.62, onUpdate: update }, 5)
          // 6 → 7 · variables, ángulo y estroboscopia
          .to(q('.sc-angle'), { opacity: 1, duration: 0.4 }, 6)
          .to(q('.sc-strobe'), { opacity: 1, duration: 0.5 }, 6.1)
          .fromTo(q('.sc-var'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.4 }, 6.2)
          .to(q('.sc-vars'), { opacity: 1, duration: 0.2 }, 6.2)
          .to(ball, { t: 0.8, onUpdate: update }, 6)
          // 7 → 8 · el balón llega al arco
          .to(ball, { t: 1, onUpdate: update, ease: 'power1.out' }, 7)
          .to(q('.sc-net'), { x: 10, duration: 0.25 }, 7.75)
          // parallax de fondo durante toda la secuencia
          .to(q('.sc-far'), { x: -90, duration: N }, 0)
          .to(q('.sc-mid'), { x: -30, duration: N }, 0);
        update();
      }

      if (reduced) {
        tl.progress(1);
        update();
        return;
      }

      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => setStep(Math.min(N - 1, Math.floor(self.progress * N))),
      });
    }, section);

    return () => ctx.revert();
  }, [reduced, useSequence]);

  const goTo = useCallback(
    (i) => {
      const el = section.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(N - 1, i));
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((clamped + 0.5) / N) * travel, behavior: reduced ? 'auto' : 'smooth' });
    },
    [reduced]
  );

  const current = STEPS[step];

  return (
    <section
      id="secuencia"
      ref={section}
      className={`story ${reduced ? 'story--static' : ''}`}
      style={reduced ? undefined : { height: `${N * 75 + 100}svh` }}
      aria-labelledby="story-title"
    >
      <div className="story__sticky">
        <div className="story__head wrap">
          <p className="eyebrow">Secuencia · el tiro</p>
          <h2 id="story-title" className="story__title">
            Un instante. <span>Muchas variables.</span>
          </h2>
        </div>

        <div className="story__stage">
          {useSequence ? (
            <FrameSequence frame={frame} />
          ) : (
            <svg
              ref={svg}
              viewBox="0 205 1200 470"
              className="story__svg"
              role="img"
              aria-label="Animación: un futbolista patea un balón que describe una trayectoria parabólica hasta el arco."
            >
              <defs>
                <pattern id="crowd" width="16" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="2.6" fill="#1A1A1A" opacity="0.12" />
                  <circle cx="13" cy="11" r="2.6" fill="#FF051E" opacity="0.1" />
                </pattern>
              </defs>

              {/* fondo con parallax */}
              <g className="sc-far">
                <rect x="-40" y="378" width="1400" height="96" fill="#EEEAE0" />
                <rect x="-40" y="378" width="1400" height="96" fill="url(#crowd)" />
                <rect x="-40" y="370" width="1400" height="8" fill="#1A1A1A" opacity="0.7" />
                {Array.from({ length: 9 }, (_, i) => (
                  <rect key={i} x={i * 170} y="378" width="4" height="96" fill="#1A1A1A" opacity="0.1" />
                ))}
              </g>

              <g className="sc-cam">
                <g className="sc-mid">
                  <rect x="-40" y="474" width="1400" height="6" fill="#FF051E" />
                </g>
                <rect x="-40" y="480" width="1400" height="200" fill="#FBF5EC" />
                <line x1="0" y1="600" x2="1200" y2="600" stroke="#1A1A1A" strokeOpacity="0.25" strokeWidth="2" />

                {/* arco a la derecha */}
                <g className="sc-goal">
                  <g className="sc-net" opacity="0.5">
                    {Array.from({ length: 7 }, (_, i) => (
                      <line key={`v${i}`} x1={1110 + i * 12} y1="470" x2={1110 + i * 12} y2="600" stroke="#1A1A1A" strokeOpacity="0.35" />
                    ))}
                    {Array.from({ length: 6 }, (_, i) => (
                      <line key={`h${i}`} x1="1100" y1={480 + i * 22} x2="1190" y2={480 + i * 22} stroke="#1A1A1A" strokeOpacity="0.35" />
                    ))}
                  </g>
                  <rect x="1094" y="466" width="8" height="134" fill="#1A1A1A" />
                  <rect x="1094" y="466" width="100" height="8" fill="#1A1A1A" />
                </g>

                {/* estroboscopia: posiciones a intervalos iguales de tiempo */}
                <g className="sc-strobe">
                  {STROBE.map((p, i) => (
                    <g key={i}>
                      <line x1={p.x} y1={p.y} x2={p.x} y2="600" stroke="#1A1A1A" strokeOpacity="0.18" strokeDasharray="3 6" />
                      <circle cx={p.x} cy={p.y} r="6" fill="#1A1A1A" opacity="0.35" />
                    </g>
                  ))}
                </g>

                <path className="sc-path" d={PATH_D} pathLength="1" strokeDasharray="1" fill="none" stroke="#FF051E" strokeWidth="4" strokeLinecap="round" />

                <g className="sc-angle">
                  <line x1={P0.x} y1={P0.y} x2={P0.x + 120} y2={P0.y} stroke="#1A1A1A" strokeWidth="2" strokeDasharray="5 5" />
                  <path d={`M${P0.x + 70} ${P0.y} A70 70 0 0 0 ${P0.x + 70 * Math.cos(0.951)} ${P0.y - 70 * Math.sin(0.951)}`} fill="none" stroke="#1A1A1A" strokeWidth="3" />
                  <text x={P0.x + 84} y={P0.y - 26} fontSize="24" fontWeight="800" fill="#1A1A1A">θ</text>
                </g>

                <g transform="translate(150 305)">
                  <g className="sc-player">
                    <Player />
                  </g>
                </g>

                <circle className="sc-flash" cx={P0.x} cy={P0.y} r="26" fill="none" stroke="#FF051E" strokeWidth="4" />
                <ellipse className="sc-ball-shadow" cx={P0.x} cy="600" rx="14" ry="3" fill="#1A1A1A" opacity="0.15" />
                <g className="sc-ball" transform={`translate(${P0.x} ${P0.y})`}>
                  <Ball r={14} />
                </g>

                <g className="sc-vectors">
                  <path className="sc-vx" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path className="sc-vy" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path className="sc-v" fill="none" stroke="#FF051E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <text className="sc-v-label" fontSize="22" fontWeight="800" fill="#C40017">v</text>
                  <text className="sc-vx-label" fontSize="18" fontWeight="700" fill="#1A1A1A" textAnchor="middle">vₓ</text>
                  <text className="sc-vy-label" fontSize="18" fontWeight="700" fill="#1A1A1A" textAnchor="end">vᵧ</text>
                </g>

                <g className="sc-vars">
                  <g transform="translate(24 216)">
                    <g className="sc-var">
                      <rect width="220" height="38" rx="19" fill="#1A1A1A" />
                      <text x="20" y="25" fontSize="16" fontWeight="700" fill="#FFFFFF">Posición · x(t), y(t)</text>
                    </g>
                  </g>
                  <g transform="translate(256 216)">
                    <g className="sc-var">
                      <rect width="229" height="38" rx="19" fill="#FF051E" />
                      <text x="20" y="25" fontSize="16" fontWeight="700" fill="#FFFFFF">Velocidad inicial · v₀</text>
                    </g>
                  </g>
                  <g transform="translate(497 216)">
                    <g className="sc-var">
                      <rect width="126" height="38" rx="19" fill="#FFFFFF" stroke="#1A1A1A" strokeOpacity="0.15" />
                      <text x="20" y="25" fontSize="16" fontWeight="700" fill="#1A1A1A">Ángulo · θ</text>
                    </g>
                  </g>
                  <g transform="translate(635 216)">
                    <g className="sc-var">
                      <rect width="126" height="38" rx="19" fill="#FFFFFF" stroke="#1A1A1A" strokeOpacity="0.15" />
                      <text x="20" y="25" fontSize="16" fontWeight="700" fill="#1A1A1A">Tiempo · t</text>
                    </g>
                  </g>
                  <g transform="translate(773 216)">
                    <g className="sc-var">
                      <rect width="237" height="38" rx="19" fill="#FFFFFF" stroke="#1A1A1A" strokeOpacity="0.15" />
                      <text x="20" y="25" fontSize="16" fontWeight="700" fill="#1A1A1A">Gravedad · g = 9,8 m/s²</text>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          )}
        </div>

        {!reduced && (
          <div className="story__ui wrap">
            <div className="story__caption" aria-live="polite">
              <p className="story__count">
                <strong>{String(step + 1).padStart(2, '0')}</strong> / {String(N).padStart(2, '0')}
              </p>
              <h3 key={`t${step}`} className="story__cap-title">
                {current.title}
              </h3>
              <p key={`p${step}`} className="story__cap-text">
                {current.text}
              </p>
            </div>

            <div className="story__nav">
              <button type="button" className="icon-btn" onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="Paso anterior">
                <ChevronLeft aria-hidden="true" />
              </button>
              <ol className="story__dots">
                {STEPS.map((s, i) => (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      className={i <= step ? 'is-on' : ''}
                      aria-label={`Paso ${i + 1}: ${s.title}`}
                      aria-current={i === step ? 'step' : undefined}
                    />
                  </li>
                ))}
              </ol>
              <button type="button" className="icon-btn" onClick={() => goTo(step + 1)} disabled={step === N - 1} aria-label="Paso siguiente">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {reduced && (
          <ol className="story__list wrap">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{s.title}</strong> {s.text}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
