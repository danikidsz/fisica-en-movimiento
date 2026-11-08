import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Play, X } from 'lucide-react';
import { LAB_URL, LAB_COVER, LAB_MESAS } from '../config.js';
import './LabTour.css';

const KEY = 'fem-lab-mesas';
const leer = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export default function LabTour() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(leer);
  const closeRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  // El laboratorio avisa por postMessage cada vez que se completa una mesa.
  useEffect(() => {
    const onMsg = (ev) => {
      const d = ev.data;
      if (!d || d.fuente !== 'uao-laboratorio' || !Array.isArray(d.mesas)) return;
      setDone(d.mesas);
      try {
        localStorage.setItem(KEY, JSON.stringify(d.mesas));
      } catch {
        /* sin almacenamiento: el avance solo dura esta visita */
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const n = done.length;

  return (
    <section id="explora" className="section lab-tour" aria-labelledby="explora-title">
      <div className="wrap lab-tour__grid">
        <div className="lab-tour__copy">
          <p className="eyebrow" data-reveal>
            Recorrido virtual · 360°
          </p>
          <h2 id="explora-title" className="section-title" data-reveal="2">
            Entra al laboratorio <em>de Física.</em>
          </h2>
          <p className="section-lead" data-reveal="3">
            Recorre el pasillo hasta el laboratorio de la UAO, míralo en 360° y explora sus tres mesas.
            En cada una armarás un montaje real y verás la prueba en video.
          </p>

          <ol className="lab-tour__mesas" data-reveal>
            {LAB_MESAS.map((m) => {
              const ok = done.includes(m.id);
              return (
                <li key={m.id} className={ok ? 'is-done' : ''}>
                  <span className="lab-tour__n" aria-hidden="true">
                    {ok ? <Check /> : m.num}
                  </span>
                  <span>
                    <b>{m.name}</b>
                    <small>{m.desc}</small>
                  </span>
                  <span className="sr-only">{ok ? '(completada)' : '(pendiente)'}</span>
                </li>
              );
            })}
          </ol>
          <p className="lab-tour__count" aria-live="polite">
            {n === 0 ? 'Aún no has explorado mesas.' : n === 3 ? '¡Exploraste las tres mesas!' : `Mesas exploradas: ${n} de 3`}
          </p>
        </div>

        <div className="lab-tour__card" data-reveal="2">
          <button type="button" className="lab-tour__cover" onClick={() => setOpen(true)} aria-label="Entrar al recorrido virtual">
            <img src={LAB_COVER} alt="" loading="lazy" />
            <span className="lab-tour__play" aria-hidden="true">
              <Play />
            </span>
            <span className="lab-tour__badge">360°</span>
          </button>
          <div className="lab-tour__arco">
            <img src={`${base}assets/brand/uao-h-crema.png`} alt="UAO" className="lab-tour__logo" />
            <p>Laboratorio de Física · Sede UAO</p>
            <div className="lab-tour__actions">
              <button type="button" className="btn btn--light" onClick={() => setOpen(true)}>
                <Play aria-hidden="true" /> Entrar al recorrido
              </button>
              <a className="btn btn--outline-light btn--sm" href={LAB_URL} target="_blank" rel="noopener">
                Abrir en pestaña nueva <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="lab-modal" role="dialog" aria-modal="true" aria-label="Laboratorio virtual de Física UAO">
          <div className="lab-modal__bar">
            <img src={`${base}assets/brand/uao-h-crema.png`} alt="UAO" />
            <span>Laboratorio virtual · Física UAO</span>
            <button type="button" ref={closeRef} className="btn btn--light btn--sm" onClick={() => setOpen(false)}>
              <X aria-hidden="true" /> Cerrar
            </button>
          </div>
          <iframe src={`${LAB_URL}/?embed=1`} title="Recorrido virtual y experiencia 360° del laboratorio" allow="fullscreen; accelerometer; gyroscope" allowFullScreen />
        </div>
      )}
    </section>
  );
}
