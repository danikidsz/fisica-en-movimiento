import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Play, RotateCcw, Target } from 'lucide-react';
import ChoiceQuestion from './ChoiceQuestion.jsx';
import { ANGLE_QUESTION, SHOT } from '../data/challenges.js';
import { projectile, shotOutcome, G } from '../lib/physics.js';
import { fmt } from '../lib/format.js';
import { useProgress } from '../hooks/useProgress.jsx';
import { prefersReducedMotion } from '../hooks/useMotion.js';

const X_MAX = 82; // m visibles (alcance máximo posible: 28² / 9,8 ≈ 80 m)
const PAD = { l: 44, r: 16, t: 16, b: 34 };
const C = {
  navy: '#1A1A1A',
  red: '#FF051E',
  redInk: '#C40017',
  line: 'rgba(23,43,77,0.12)',
  muted: '#4D4D4D',
  cream: '#FBF5EC',
};

const PHASES = [
  { id: 'b-prediccion', label: 'Predice' },
  { id: 'b-gol', label: 'Marca un gol' },
  { id: 'b-pregunta', label: 'Concluye' },
];

function useCanvas(draw, deps) {
  const ref = useRef(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const redraw = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    const { w, h, dpr } = size.current;
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    draw(g, w, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const c = ref.current;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const h = e.contentRect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w, h, dpr };
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      redraw();
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => redraw(), [redraw]);
  return [ref, redraw];
}

export default function ProjectileChallenge() {
  const { items, record } = useProgress();
  const phaseIndex = PHASES.findIndex((p) => !items[p.id]);
  const phase = phaseIndex === -1 ? 3 : phaseIndex; // 3 = completado
  const locked = phase === 0;

  const [v0, setV0] = useState(SHOT.v0);
  const [angle, setAngle] = useState(SHOT.angle);
  const [prediction, setPrediction] = useState(30);
  const [shot, setShot] = useState(null); // { v0, angle, t, done }
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState(null);
  const goalTries = useRef(0);
  const raf = useRef(0);

  const params = locked ? { v0: SHOT.v0, angle: SHOT.angle } : { v0, angle };
  const p = projectile(params.v0, params.angle);
  const outcomePreview = shotOutcome(params.v0, params.angle, SHOT.goalDistance, SHOT.crossbar);

  const [canvasRef] = useCanvas(
    (g, w, h) => {
      const plotW = w - PAD.l - PAD.r;
      const plotH = h - PAD.t - PAD.b;
      const k = plotW / X_MAX; // px por metro (misma escala en x e y)
      const yMax = plotH / k;
      const X = (x) => PAD.l + x * k;
      const Y = (y) => PAD.t + plotH - y * k;

      // Cuadrícula
      g.font = '600 11px DM Sans Variable, system-ui, sans-serif';
      g.fillStyle = C.muted;
      g.strokeStyle = C.line;
      g.lineWidth = 1;
      g.textAlign = 'center';
      for (let x = 0; x <= X_MAX; x += 10) {
        g.beginPath();
        g.moveTo(X(x), PAD.t);
        g.lineTo(X(x), Y(0));
        g.stroke();
        g.fillText(`${x} m`, X(x), Y(0) + 18);
      }
      g.textAlign = 'right';
      for (let y = 10; y < yMax; y += 10) {
        g.beginPath();
        g.moveTo(PAD.l, Y(y));
        g.lineTo(PAD.l + plotW, Y(y));
        g.stroke();
        g.fillText(`${y} m`, PAD.l - 6, Y(y) + 4);
      }

      // Suelo
      g.fillStyle = C.cream;
      g.fillRect(PAD.l, Y(0), plotW, 4);
      g.strokeStyle = C.navy;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(PAD.l, Y(0));
      g.lineTo(PAD.l + plotW, Y(0));
      g.stroke();

      // Arco a 50 m (travesaño 2,44 m)
      const gx = X(SHOT.goalDistance);
      const gt = Y(SHOT.crossbar);
      g.fillStyle = 'rgba(23,43,77,0.08)';
      g.fillRect(gx, gt, Math.max(10, k * 2), Y(0) - gt);
      g.fillStyle = C.navy;
      g.fillRect(gx - 2, gt, 4, Y(0) - gt);
      g.fillRect(gx - 2, gt - 2, Math.max(14, k * 2.2), 4);
      g.textAlign = 'center';
      g.font = '700 11px DM Sans Variable, system-ui, sans-serif';
      g.fillText('arco · 2,44 m', gx + 6, gt - 8);

      // Predicción
      if (phase === 0 || (shot && shot.predicted != null)) {
        const px = shot?.predicted ?? prediction;
        g.strokeStyle = C.red;
        g.setLineDash([5, 5]);
        g.beginPath();
        g.moveTo(X(px), PAD.t + 10);
        g.lineTo(X(px), Y(0));
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = C.redInk;
        g.font = '700 12px DM Sans Variable, system-ui, sans-serif';
        g.fillText('tu predicción', X(px), PAD.t + 6);
      }

      const path = (pp, tEnd, style) => {
        g.strokeStyle = style.color;
        g.lineWidth = style.width;
        g.setLineDash(style.dash || []);
        g.beginPath();
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const t = (tEnd * i) / steps;
          const pos = pp.positionAt(t);
          if (i === 0) g.moveTo(X(pos.x), Y(Math.max(0, pos.y)));
          else g.lineTo(X(pos.x), Y(Math.max(0, pos.y)));
        }
        g.stroke();
        g.setLineDash([]);
      };

      // Disparos anteriores
      history.forEach((s, i) => {
        const pp = projectile(s.v0, s.angle);
        path(pp, pp.timeOfFlight, { color: `rgba(23,43,77,${0.12 + i * 0.06})`, width: 2 });
      });

      // Vista previa de la dirección de salida
      if (!shot || shot.done) {
        const a = (params.angle * Math.PI) / 180;
        const len = 6 + params.v0 * 0.35;
        g.strokeStyle = C.red;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(X(0), Y(0));
        g.lineTo(X(len * Math.cos(a)), Y(len * Math.sin(a)));
        g.stroke();
      }

      // Disparo actual
      if (shot) {
        const pp = projectile(shot.v0, shot.angle);
        path(pp, shot.t, { color: C.red, width: 3 });
        const pos = pp.positionAt(shot.t);
        const bx = X(pos.x);
        const by = Y(Math.max(0, pos.y));
        g.fillStyle = '#FFFFFF';
        g.strokeStyle = C.navy;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(bx, by - 6, 6, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        if (shot.done && shot.result !== 'gol') {
          g.fillStyle = C.navy;
          g.beginPath();
          g.moveTo(X(pp.range), Y(0) + 2);
          g.lineTo(X(pp.range) - 6, Y(0) + 12);
          g.lineTo(X(pp.range) + 6, Y(0) + 12);
          g.fill();
        }
      } else {
        g.fillStyle = '#FFFFFF';
        g.strokeStyle = C.navy;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(X(0), Y(0) - 6, 6, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
    },
    [shot, history, prediction, params.v0, params.angle, phase],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const finish = (s, o) => {
    const pp = projectile(s.v0, s.angle);
    if (phase === 0) {
      const err = Math.abs(prediction - pp.range);
      const points = err <= 3 ? 100 : err <= 8 ? 70 : 40;
      record('b-prediccion', { firstTry: err <= 5, points });
      setMessage({
        tone: err <= 5 ? 'ok' : 'retry',
        text: `Predijiste ${fmt(prediction, 0)} m y el balón cayó a ${fmt(pp.range, 1)} m (diferencia de ${fmt(err, 1)} m). Con 25° no alcanza los 50 m del arco. Ahora intenta marcar.`,
      });
    } else if (o.result === 'gol') {
      if (phase === 1) {
        const n = goalTries.current;
        record('b-gol', { firstTry: n <= 2, points: n <= 2 ? 100 : n <= 5 ? 70 : 40 });
      }
      setMessage({
        tone: 'ok',
        text: `¡Gol! Al llegar al arco el balón va a ${fmt(o.heightAtGoal, 2)} m de altura, por debajo de los 2,44 m del travesaño.`,
      });
    } else if (o.result === 'corto') {
      setMessage({
        tone: 'retry',
        text: `Se quedó corto: cayó a ${fmt(o.range, 1)} m. Necesitas más alcance: sube la velocidad o acerca el ángulo a 45°.`,
      });
    } else {
      setMessage({
        tone: 'retry',
        text: `Pasó por encima: llegó al arco a ${fmt(o.heightAtGoal, 1)} m de altura. Baja el ángulo o la velocidad.`,
      });
    }
  };

  const launch = () => {
    cancelAnimationFrame(raf.current);
    const s = { ...params };
    const pp = projectile(s.v0, s.angle);
    const o = shotOutcome(s.v0, s.angle, SHOT.goalDistance, SHOT.crossbar);
    // Si es gol, el vuelo termina al cruzar la línea del arco.
    const tEnd = o.result === 'gol' ? SHOT.goalDistance / pp.vx + 0.08 : pp.timeOfFlight;
    if (phase === 1) goalTries.current += 1;
    if (shot?.done) setHistory((h) => [...h.slice(-2), { v0: shot.v0, angle: shot.angle }]);
    setMessage(null);
    const base = { ...s, result: o.result, predicted: phase === 0 ? prediction : null };

    if (prefersReducedMotion()) {
      setShot({ ...base, t: tEnd, done: true });
      finish(s, o);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(tEnd, (now - start) / 1000);
      const done = t >= tEnd;
      setShot({ ...base, t, done });
      if (done) finish(s, o);
      else raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const resetSim = () => {
    cancelAnimationFrame(raf.current);
    setShot(null);
    setHistory([]);
    setMessage(null);
    if (!locked) {
      setV0(SHOT.v0);
      setAngle(SHOT.angle);
    }
  };

  const flying = shot && !shot.done;

  return (
    <div className="challenge__body">
      <ol className="phases" aria-label="Pasos del reto">
        {PHASES.map((ph, i) => (
          <li
            key={ph.id}
            className={`${items[ph.id] ? 'is-done' : ''} ${i === phase ? 'is-current' : ''}`}
            aria-current={i === phase ? 'step' : undefined}
          >
            <span>{items[ph.id] ? <Check aria-hidden="true" /> : i + 1}</span>
            {ph.label}
          </li>
        ))}
      </ol>

      <p className="challenge__instr">
        {phase === 0 && (
          <>
            El balón sale a <strong>25 m/s</strong> con <strong>25°</strong>. Antes de lanzar, mueve la línea roja a
            donde crees que caerá.
          </>
        )}
        {phase === 1 && (
          <>
            <Target aria-hidden="true" className="inline-ico" /> El arco está a <strong>50 m</strong> y el travesaño a{' '}
            <strong>2,44 m</strong>. Ajusta velocidad y ángulo hasta que el balón entre.
          </>
        )}
        {phase >= 2 && <>Explora libremente: cambia los valores y observa cómo cambia la parábola.</>}
      </p>

      <div className="sim">
        <div className="sim__canvas-wrap">
          <canvas
            ref={canvasRef}
            className="sim__canvas"
            role="img"
            aria-label={`Simulación del tiro: velocidad ${fmt(params.v0, 0)} m/s, ángulo ${params.angle}°, alcance ${fmt(p.range, 1)} m.`}
          />
        </div>

        <div className="sim__panel">
          <div className="sim__controls">
            {phase === 0 && (
              <label className="slider">
                <span className="slider__top">
                  Tu predicción <output>{fmt(prediction, 0)} m</output>
                </span>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={prediction}
                  onChange={(e) => setPrediction(+e.target.value)}
                  disabled={flying}
                />
              </label>
            )}
            <label className="slider">
              <span className="slider__top">
                Velocidad inicial <output>{fmt(params.v0, 0)} m/s</output>
              </span>
              <input
                type="range"
                min="10"
                max="28"
                step="1"
                value={params.v0}
                onChange={(e) => setV0(+e.target.value)}
                disabled={locked || flying}
              />
            </label>
            <label className="slider">
              <span className="slider__top">
                Ángulo <output>{params.angle}°</output>
              </span>
              <input
                type="range"
                min="10"
                max="75"
                step="1"
                value={params.angle}
                onChange={(e) => setAngle(+e.target.value)}
                disabled={locked || flying}
              />
            </label>

            <div className="sim__actions">
              <button type="button" className="btn btn--primary" onClick={launch} disabled={flying}>
                <Play aria-hidden="true" /> Lanzar
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={resetSim} disabled={flying}>
                <RotateCcw aria-hidden="true" /> Reiniciar
              </button>
            </div>
          </div>

          <div className="sim__data">
            <dl className="readout">
              <div>
                <dt>vₓ</dt>
                <dd>{fmt(p.vx, 1)} m/s</dd>
              </div>
              <div>
                <dt>vᵧ inicial</dt>
                <dd>{fmt(p.vy, 1)} m/s</dd>
              </div>
              <div>
                <dt>Tiempo de vuelo</dt>
                <dd>{phase === 0 && !shot?.done ? '?' : `${fmt(p.timeOfFlight, 2)} s`}</dd>
              </div>
              <div>
                <dt>Alcance</dt>
                <dd>{phase === 0 && !shot?.done ? '?' : `${fmt(p.range, 1)} m`}</dd>
              </div>
              <div>
                <dt>Altura máxima</dt>
                <dd>{phase === 0 && !shot?.done ? '?' : `${fmt(p.maxHeight, 1)} m`}</dd>
              </div>
              <div>
                <dt>Altura en el arco</dt>
                <dd>
                  {phase === 0 && !shot?.done
                    ? '?'
                    : outcomePreview.heightAtGoal == null
                      ? 'no llega'
                      : `${fmt(outcomePreview.heightAtGoal, 2)} m`}
                </dd>
              </div>
            </dl>
            <p className="sim__note">g = {fmt(G, 1)} m/s² · sin resistencia del aire · balón como un punto</p>
          </div>
        </div>
      </div>

      <div className={`feedback feedback--${message ? message.tone : 'idle'}`} aria-live="polite">
        {message && <p>{message.text}</p>}
      </div>

      {phase >= 2 && (
        <div className="challenge__question challenge__question--wide">
          <ChoiceQuestion
            id="b-pregunta"
            question={ANGLE_QUESTION.question}
            options={ANGLE_QUESTION.options}
            correct={ANGLE_QUESTION.correct}
            hint={ANGLE_QUESTION.hint}
            explanation={ANGLE_QUESTION.explanation}
            solved={Boolean(items['b-pregunta'])}
            onSolved={({ firstTry, mistakes }) =>
              record('b-pregunta', { firstTry, points: firstTry ? 100 : mistakes === 1 ? 60 : 30 })
            }
            layout="grid"
          />
          {phase === 3 && (
            <p className="challenge__done">
              <Check aria-hidden="true" /> Reto completado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
