// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE RECURSOS
// Cambia aquí los archivos definitivos. Ver RECURSOS.md.
// Las rutas son relativas a /public.
// ─────────────────────────────────────────────────────────────

const base = import.meta.env.BASE_URL;
const asset = (path) => (path ? `${base}${path.replace(/^\//, '')}` : null);

export const MEDIA = {
  // Video 360° equirectangular (MP4, H.264, 2:1). Mientras sea null,
  // se muestra el panorama de demostración y el aviso "video pendiente".
  video360: asset(null), // p. ej. asset('assets/videos/estadio-360.mp4')

  // Imagen panorámica equirectangular (JPG/WebP, 2:1) para probar la navegación.
  // Si es null, se genera un panorama de demostración por código.
  panorama: asset(null), // p. ej. asset('assets/panorama/estadio-demo.jpg')

  // Secuencia de imágenes del scroll storytelling.
  // Con frameCount = 0 se usa la animación SVG de demostración.
  sequence: {
    frameCount: 0,
    frame: (i) => asset(`assets/scroll-sequence/frame_${String(i).padStart(4, '0')}.webp`),
  },
};

// Enlace del Genially principal para el botón "VOLVER AL CURSO".
// Mientras esté vacío, el botón aparece deshabilitado con un aviso.
export const COURSE_URL = '';
// '_top' sale del iframe y vuelve al curso en la misma pestaña.
// Usa '_blank' si Genially o Moodle bloquean la navegación del iframe.
export const COURSE_TARGET = '_top';

// Laboratorio virtual (recorrido por scroll + experiencia 360° con las 3 mesas).
// Se abre en una ventana dentro de esta página y también en una pestaña nueva.
export const LAB_URL = 'https://laboratorio-fisica-uao.vercel.app';
export const LAB_COVER = `${base}assets/images/lab-portada.jpg`;
export const LAB_MESAS = [
  { id: 'm1', num: '1', name: 'Caída libre', desc: 'Arma el montaje y elige el sensor correcto.' },
  { id: 'm2', num: '2', name: 'Carril de aire', desc: 'Suelta el planeador desde tres posiciones.' },
  { id: 'm3', num: '3', name: 'Movimiento parabólico', desc: 'Predice qué lanzamiento llega más lejos.' },
];
