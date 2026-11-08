import { useEffect, useRef, useState } from 'react';
import { MEDIA } from '../config.js';

// Dibuja en un canvas el fotograma que corresponde al progreso del scroll.
// Se activa cuando MEDIA.sequence.frameCount > 0 (ver src/config.js).
export default function FrameSequence({ frame }) {
  const canvas = useRef(null);
  const images = useRef([]);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const total = MEDIA.sequence.frameCount;

  useEffect(() => {
    let alive = true;
    images.current = Array.from({ length: total }, (_, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => alive && setLoaded((n) => n + 1);
      img.onerror = () => alive && i === 0 && setFailed(true);
      img.src = MEDIA.sequence.frame(i + 1);
      return img;
    });
    return () => {
      alive = false;
    };
  }, [total]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    // Busca el fotograma cargado más cercano hacia atrás.
    let img = null;
    for (let i = frame; i >= 0; i--) {
      const cand = images.current[i];
      if (cand?.complete && cand.naturalWidth) {
        img = cand;
        break;
      }
    }
    if (!img) return;
    if (c.width !== img.naturalWidth) {
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
    }
    c.getContext('2d').drawImage(img, 0, 0);
  }, [frame, loaded]);

  if (failed) {
    return (
      <div className="story__frames-state" role="alert">
        No se encontró el primer fotograma de la secuencia. Revisa los nombres en
        /public/assets/scroll-sequence/ y MEDIA.sequence en src/config.js.
      </div>
    );
  }

  return (
    <>
      <canvas ref={canvas} className="story__svg" role="img" aria-label="Secuencia del tiro, cuadro a cuadro" />
      {loaded < total && (
        <div className="story__frames-loading" role="status">
          Cargando secuencia… {Math.round((loaded / total) * 100)} %
        </div>
      )}
    </>
  );
}
