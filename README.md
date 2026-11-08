# Física en movimiento

Página web interactiva de Física Mecánica (UAO): portada, recorrido por el laboratorio virtual con vista 360°, secuencia del tiro controlada por scroll, tres retos con progreso compartido y cierre con resultados.

**Sitio publicado:** https://fisica-en-movimiento-five.vercel.app  
**Laboratorio virtual:** https://laboratorio-fisica-uao.vercel.app ([repositorio](https://github.com/danikidsz/laboratorio-fisica-uao))

Proyecto *Física en movimiento* · Digitatón · Reto 37 · Equipo 2  
Miguel Ángel Mosquera · Juan Esteban Suárez · Juan Daniel Cárdenas  
Docente: Monica Diana Didyme

React 18 + Vite 5 · GSAP + ScrollTrigger · Three.js · Lucide React · DM Sans incluida en el proyecto (no depende de Google Fonts). Identidad visual del manual UAO 2026 (rojo #FF051E y crema #FBF5EC).

## Ejecutar en local

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas de las fórmulas de física
npm run build      # genera la carpeta dist/
npm run preview    # sirve dist/ para revisarla
```

## Estructura

```
src/
  config.js                 ← rutas de video 360°, panorama, secuencia y enlace al Genially
  App.jsx · main.jsx
  components/
    Navbar.jsx              navegación, sección actual, puntaje y "volver arriba"
    Hero.jsx                portada con la ilustración del futbolista
    Player.jsx              futbolista y balón en SVG (piezas animables)
    LabTour.jsx             sección «Recorrido 360°»: abre el laboratorio virtual (LAB_URL) y muestra las mesas exploradas
    Immersive360.jsx        (ya no se usa) visor 360° del estadio de demostración
    ScrollStorytelling.jsx  secuencia del tiro en 8 pasos ligada al scroll (GSAP)
    FrameSequence.jsx       modo "secuencia de imágenes" para esa sección
    Laboratory.jsx          contenedor de los tres retos
    SpeedChallenge.jsx      Reto 01 · Detective de velocidad (3 niveles)
    ProjectileChallenge.jsx Reto 02 · ¿Dónde caerá el balón? (predice → marca gol → concluye)
    GraphChallenge.jsx      Reto 03 · Encuentra la gráfica (3 ejercicios)
    ChoiceQuestion.jsx      pregunta con reintento, pista y explicación
    ProgressTracker.jsx     progreso del laboratorio
    FinalResults.jsx        cierre, resumen y "Volver al curso"
    ErrorBoundary.jsx       si una sección falla, el resto sigue funcionando
  data/challenges.js        textos, opciones y respuestas de los retos
  hooks/useProgress.jsx     progreso en localStorage (tolerante a bloqueos)
  hooks/useMotion.js        movimiento reducido, aparición al hacer scroll, desplazamiento suave
  lib/physics.js            fórmulas (v = d/t, tiro parabólico, resultado del tiro)
  lib/physics.test.js       pruebas: 48,9 m con 25°, gol con 28°, 45° máximo, etc.
  lib/format.js             números con coma decimal (es-CO)
  lib/demoPanorama.js       panorama de demostración generado por código
  styles/global.css         tokens de color, tipografía, botones y utilidades
public/assets/
  images/ videos/ panorama/ scroll-sequence/   ← aquí van los recursos definitivos
```

Los recursos pendientes y cómo reemplazarlos están en **RECURSOS.md**.

## Decisiones respecto al prompt original

- **Reto 01** sube de nivel: 100 m en 20 s → conversión de 72 km/h → rapidez media contra velocidad media (ida y vuelta).
- **Reto 02** pide predecir antes de lanzar y usa los datos de la Actividad 1: arco a 50 m, travesaño a 2,44 m, 25 m/s. Con 25° cae a 48,9 m; con 28° entra a 1,44 m de altura. Todo sale de `lib/physics.js` y está probado.
- **Coma decimal** en todo lo que se muestra (9,8 m/s²).
- **Secuencia**: además del scroll, tiene botones anterior/siguiente y puntos por paso, para que funcione bien dentro de un iframe.
- **Rojo #FF051E** solo en fondos de botones, titulares grandes y acentos. Para texto rojo pequeño se usa `#C40017` (contraste 6,2:1).
- **Movimiento reducido**: sin animaciones; la secuencia se muestra como escena final + lista de pasos.
- **Sin errores**: si un reto falla, los demás siguen; si WebGL o el video no están, el visor 360° lo dice.

## Desplegar en Vercel

1. Sube la carpeta a un repositorio de GitHub (sin `node_modules` ni `dist`).
2. En vercel.com → **Add New → Project** → importa el repositorio.
3. Vercel detecta Vite: comando `npm run build`, carpeta de salida `dist`. Deja eso y pulsa **Deploy**.
4. Cada `git push` vuelve a publicar.

Alternativa sin GitHub: `npm i -g vercel` y luego `vercel --prod` dentro de la carpeta.

También funciona en Netlify (arrastrar la carpeta `dist/` a app.netlify.com/drop) o en un servidor institucional: `vite.config.js` usa rutas relativas.

## Incrustar en Genially

1. Copia la URL publicada (p. ej. `https://fisica-en-movimiento.vercel.app`).
2. En Genially: **Insertar → Otros → Insertar** (contenido externo) y pega:

```html
<iframe
  src="https://TU-URL.vercel.app"
  width="100%" height="100%"
  style="border:0"
  allow="fullscreen; autoplay; accelerometer; gyroscope"
  allowfullscreen
  title="Física en movimiento · Módulo 01">
</iframe>
```

3. Agranda el elemento para que ocupe casi toda la pantalla de Genially (la página está pensada para 16:9 o más alto).
4. Pon junto al iframe un botón **"Abrir en pantalla completa"** con enlace a la misma URL (nueva pestaña). Sirve de respaldo y es mejor en celular.

Para que **"Volver al curso"** funcione, pega la URL del Genially en `COURSE_URL` (`src/config.js`) y vuelve a publicar. Si Genially o Moodle bloquean la navegación desde el iframe, cambia `COURSE_TARGET` a `'_blank'`.

### Probar antes de la demo

- El iframe dentro de Genially y dentro del SCORM en Moodle, en computador y celular.
- Que el scroll de la secuencia avance dentro del iframe (si no, usar los botones de paso).
- El progreso se guarda **solo en el navegador del estudiante** (localStorage). No llega a Moodle ni cuenta como nota.
- La página necesita internet: dentro del paquete SCORM sin conexión no carga.
