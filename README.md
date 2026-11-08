# Física en movimiento

Página web interactiva de Física Mecánica de la Universidad Autónoma de Occidente (UAO). Complementa los módulos del curso con un recorrido por el laboratorio virtual, una secuencia animada del tiro parabólico y tres retos prácticos de cinemática.

**Sitio publicado:** https://fisica-en-movimiento-five.vercel.app  
**Laboratorio virtual:** https://laboratorio-fisica-uao.vercel.app · [repositorio](https://github.com/danikidsz/laboratorio-fisica-uao)

Proyecto *Física en movimiento* · Digitatón · Reto 37 · Equipo 2  
Miguel Ángel Mosquera · Juan Esteban Suárez · Juan Daniel Cárdenas  
Docente: Monica Diana Didyme

## Secciones de la página

1. **Portada:** presentación del tema con la ilustración del futbolista.
2. **Recorrido 360°:** abre el laboratorio virtual dentro de la página (o en una pestaña nueva) y muestra cuáles de sus tres mesas ya exploró el estudiante: caída libre, carril de aire y movimiento parabólico.
3. **Secuencia del tiro:** el tiro del balón explicado en 8 pasos que avanzan con el scroll o con botones.
4. **Retos:**
   - Reto 01 · *Detective de velocidad*: rapidez y velocidad media en 3 niveles.
   - Reto 02 · *¿Dónde caerá el balón?*: predecir, lanzar y concluir con tiro parabólico.
   - Reto 03 · *Encuentra la gráfica*: interpretar gráficas de movimiento.
5. **Resultados:** resumen del progreso del estudiante.

El progreso se guarda en el navegador del estudiante (localStorage); no se envía a Moodle ni cuenta como nota.

## Tecnologías

React 18 · Vite 5 · GSAP + ScrollTrigger · Lucide React · DM Sans incluida en el proyecto.  
Identidad visual del manual UAO 2026: rojo #FF051E y crema #FBF5EC como colores principales.

## Ejecutar en local

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas de las fórmulas de física
npm run build      # genera la carpeta dist/
```

## Estructura

```
src/
  config.js            enlace del laboratorio virtual y recursos de la página
  App.jsx              orden de las secciones
  components/          portada, recorrido, secuencia, retos y resultados
  data/challenges.js   textos, opciones y respuestas de los retos
  hooks/               progreso y animaciones al hacer scroll
  lib/physics.js       fórmulas (v = d/t, tiro parabólico) con sus pruebas
  styles/global.css    colores, tipografía y botones
public/assets/         logos, imágenes y videos
```

## Publicar cambios

El sitio está en Vercel. Para publicar una nueva versión:

```bash
npx vercel --prod
```

Si conectas este repositorio a su proyecto en Vercel, cada `git push` publica automáticamente.
