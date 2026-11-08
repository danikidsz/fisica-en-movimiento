import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Hand, Maximize, Minimize, Pause, Play, RotateCcw, VideoOff, ImageOff } from 'lucide-react';
import { MEDIA } from '../config.js';
import { createDemoPanorama } from '../lib/demoPanorama.js';
import { prefersReducedMotion, useInView } from '../hooks/useMotion.js';
import './Immersive360.css';

const START = { lon: 0, lat: -8 };

export default function Immersive360() {
  const [sectionRef, inView] = useInView({ rootMargin: '300px 0px' });
  const stageRef = useRef(null);
  const canvasHost = useRef(null);
  const engine = useRef(null);
  const view = useRef({ ...START, dragging: false, x: 0, y: 0, lon0: 0, lat0: 0, idle: true });

  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [video, setVideo] = useState(MEDIA.video360 ? 'loading' : 'pending'); // pending | loading | playing | paused | error
  const [hint, setHint] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const [activated, setActivated] = useState(false);
  useEffect(() => {
    if (inView) setActivated(true);
  }, [inView]);
  const canFullscreen =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled || document.webkitFullscreenEnabled);

  // ─── Inicializar Three.js cuando la sección se acerca ──────
  useEffect(() => {
    if (!activated || engine.current) return undefined;
    setStatus('loading');
    let disposed = false;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setErrorMsg('Tu navegador no tiene WebGL activo, necesario para la vista 360°.');
      setStatus('error');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const host = canvasHost.current;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, 1, 1, 1100);
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1); // ver la esfera desde dentro
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    scene.add(new THREE.Mesh(geometry, material));

    const setTexture = (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      material.map?.dispose();
      material.map = tex;
      material.needsUpdate = true;
    };

    const usePanorama = async () => {
      if (MEDIA.panorama) {
        new THREE.TextureLoader().load(
          MEDIA.panorama,
          (tex) => !disposed && (setTexture(tex), setStatus('ready')),
          undefined,
          () => {
            if (disposed) return;
            setErrorMsg('No se encontró la imagen panorámica configurada en src/config.js.');
            setStatus('error');
          }
        );
        return;
      }
      try {
        await document.fonts?.ready;
      } catch {
        /* sin fuentes cargadas: se usa la de respaldo */
      }
      if (disposed) return;
      setTexture(new THREE.CanvasTexture(createDemoPanorama(renderer.capabilities.maxTextureSize >= 4096 ? 4096 : 2048)));
      setStatus('ready');
    };

    let videoEl = null;
    if (MEDIA.video360) {
      videoEl = document.createElement('video');
      Object.assign(videoEl, { src: MEDIA.video360, crossOrigin: 'anonymous', loop: true, muted: true, playsInline: true, preload: 'auto' });
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');
      videoEl.addEventListener('loadeddata', () => {
        if (disposed) return;
        setTexture(new THREE.VideoTexture(videoEl));
        setStatus('ready');
        setVideo('paused');
      });
      videoEl.addEventListener('error', () => {
        if (disposed) return;
        setVideo('error');
        usePanorama();
      });
      videoEl.addEventListener('play', () => setVideo('playing'));
      videoEl.addEventListener('pause', () => setVideo('paused'));
      videoEl.load();
    } else {
      usePanorama();
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const reduced = prefersReducedMotion();
    const target = new THREE.Vector3();
    const render = () => {
      const v = view.current;
      if (v.idle && !v.dragging && !reduced) v.lon += 0.03;
      v.lat = Math.max(-80, Math.min(80, v.lat));
      const phi = THREE.MathUtils.degToRad(90 - v.lat);
      const theta = THREE.MathUtils.degToRad(v.lon);
      target.set(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
      camera.lookAt(target);
      renderer.render(scene, camera);
    };

    engine.current = { renderer, render, video: videoEl, running: false, raf: 0 };

    return () => {
      disposed = true;
      cancelAnimationFrame(engine.current?.raf);
      ro.disconnect();
      videoEl?.pause();
      if (videoEl) videoEl.removeAttribute('src');
      material.map?.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      engine.current = null;
    };
  }, [activated]);

  // ─── Bucle de render solo mientras se ve ───────────────────
  useEffect(() => {
    const e = engine.current;
    if (!e || status !== 'ready') return undefined;
    if (!inView) {
      e.video?.pause();
      return undefined;
    }
    let raf;
    const loop = () => {
      e.render();
      raf = requestAnimationFrame(loop);
      e.raf = raf;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [inView, status]);

  // ─── Interacción: arrastrar, tocar y teclado ───────────────
  const onPointerDown = (ev) => {
    const v = view.current;
    v.dragging = true;
    v.idle = false;
    v.x = ev.clientX;
    v.y = ev.clientY;
    v.lon0 = v.lon;
    v.lat0 = v.lat;
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
    setHint(false);
  };
  const onPointerMove = (ev) => {
    const v = view.current;
    if (!v.dragging) return;
    v.lon = v.lon0 - (ev.clientX - v.x) * 0.15;
    v.lat = v.lat0 + (ev.clientY - v.y) * 0.15;
  };
  const onPointerUp = () => {
    view.current.dragging = false;
  };
  const onKeyDown = (ev) => {
    const v = view.current;
    const step = 6;
    const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (!map[ev.key]) return;
    ev.preventDefault();
    v.idle = false;
    v.lon += map[ev.key][0];
    v.lat += map[ev.key][1];
    setHint(false);
  };

  const recenter = () => {
    Object.assign(view.current, START, { idle: false });
  };

  const togglePlay = () => {
    const vid = engine.current?.video;
    if (!vid) return;
    if (vid.paused) vid.play().catch(() => setVideo('error'));
    else vid.pause();
  };

  const toggleFull = useCallback(() => {
    const el = stageRef.current;
    const doc = document;
    const current = doc.fullscreenElement || doc.webkitFullscreenElement;
    if (current) (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    else (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const hasVideo = video === 'playing' || video === 'paused';

  return (
    <section id="explora" className="section section--navy immersive" ref={sectionRef} aria-labelledby="explora-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          Apartado 01 · Observa el movimiento
        </p>
        <h2 id="explora-title" className="section-title" data-reveal="2">
          Observa el movimiento desde otra perspectiva.
        </h2>
        <p className="section-lead" data-reveal="3">
          Párate en la cancha y mira a tu alrededor. Antes de medir cualquier cosa, hay que saber
          desde dónde la observas.
        </p>

        <div
          ref={stageRef}
          className={`immersive__stage ${isFull ? 'is-full' : ''}`}
          data-reveal
        >
          <div
            ref={canvasHost}
            className="immersive__canvas"
            role="application"
            aria-roledescription="visor 360"
            aria-label="Vista 360° de la cancha. Usa las flechas del teclado para mirar alrededor."
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
          />

          {(status === 'idle' || status === 'loading') && (
            <div className="immersive__state" role="status">
              <span className="spinner" aria-hidden="true" />
              <span>Cargando vista 360°…</span>
            </div>
          )}

          {status === 'error' && (
            <div className="immersive__state immersive__state--error" role="alert">
              <ImageOff aria-hidden="true" />
              <strong>No se pudo mostrar la vista 360°</strong>
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'ready' && hint && (
            <div className="immersive__hint" aria-hidden="true">
              <Hand />
              <span>Arrastra para mirar alrededor</span>
            </div>
          )}

          {status === 'ready' && !hasVideo && (
            <div className="immersive__badge">
              <VideoOff aria-hidden="true" />
              <span>
                {video === 'error' ? 'El video 360° no cargó' : 'Video 360° en producción'} · panorama de
                demostración
              </span>
            </div>
          )}

          <div className="immersive__controls">
            {hasVideo && (
              <button type="button" className="icon-btn" onClick={togglePlay} aria-label={video === 'playing' ? 'Pausar video' : 'Reproducir video'}>
                {video === 'playing' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              </button>
            )}
            <button type="button" className="icon-btn" onClick={recenter} aria-label="Centrar la vista" disabled={status !== 'ready'}>
              <RotateCcw aria-hidden="true" />
            </button>
            {canFullscreen && (
              <button type="button" className="icon-btn" onClick={toggleFull} aria-label={isFull ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                {isFull ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>

        <ol className="immersive__prompts">
          <li data-reveal>
            <span>01</span>Elige un punto fijo, como el arco. Será tu sistema de referencia.
          </li>
          <li data-reveal="2">
            <span>02</span>¿Qué cosas cambiarían de posición respecto a ese punto si empieza el juego?
          </li>
          <li data-reveal="3">
            <span>03</span>Ubica el balón: desde ahí sale el tiro que vas a analizar a continuación.
          </li>
        </ol>
      </div>
    </section>
  );
}
