# Recursos que deben producir o reemplazar

Todo lo provisional está marcado en pantalla y se cambia en `src/config.js`. No hay que tocar los componentes.

| # | Recurso | Estado actual | Qué producir | Dónde ponerlo | Qué cambiar en `src/config.js` |
|---|---------|---------------|--------------|---------------|-------------------------------|
| 0 | **Laboratorio virtual (recorrido + 360°)** | Publicado en https://laboratorio-fisica-uao.vercel.app y conectado en la sección «Recorrido 360°» | — | — | `LAB_URL` |
| 1 | **Video 360° del escenario** (ya no se usa: la sección 360° ahora es el laboratorio) | Panorama de demostración generado por código, con el aviso "Video 360° en producción" | MP4 equirectangular 2:1 (3840×1920 o 4096×2048), H.264, 20–60 s en bucle, sin audio o con audio opcional, menos de 40 MB | `public/assets/videos/estadio-360.mp4` | `video360: asset('assets/videos/estadio-360.mp4')` |
| 2 | Imagen panorámica (opcional) | Generada por código | JPG o WebP equirectangular 2:1 (4096×2048), una foto 360° real de la cancha para probar mientras se graba el video | `public/assets/panorama/estadio.jpg` | `panorama: asset('assets/panorama/estadio.jpg')` |
| 3 | **Secuencia del tiro** (opcional) | Animación SVG del futbolista (funciona completa) | 60–120 fotogramas WebP de 1280 px de ancho, mismo encuadre, nombrados `frame_0001.webp`, `frame_0002.webp`… Pueden salir de sus ilustraciones (preparación, patada, resultado) con transiciones | `public/assets/scroll-sequence/` | `sequence.frameCount: 90` (el número real de fotogramas) |
| 4 | **Enlace al Genially** | Botón "Volver al curso" deshabilitado con aviso | URL pública del Genially | — | `COURSE_URL = 'https://view.genially.com/...'` |
| 5 | Ilustración del futbolista | Hecha en SVG con el estilo pedido (`Player.jsx`) | Opcional: si prefieren su propia ilustración, reemplacen el SVG por la suya | `src/components/Player.jsx` | — |

## Notas técnicas

- **Video 360°**: si lo alojan en otro dominio, ese servidor debe enviar `Access-Control-Allow-Origin` (CORS); si no, el video no se puede usar como textura. Lo más simple es dejarlo en `public/assets/videos/` y publicarlo junto con la página.
- **iPhone**: el video arranca en silencio y se reproduce con el botón de play (las políticas de autoplay lo exigen).
- **Secuencia de imágenes**: con `frameCount` mayor que 0, la animación SVG se reemplaza por los fotogramas; los textos de los 8 pasos se mantienen.
- **Accesibilidad del video**: si el video tiene narración, preparen subtítulos o una transcripción para ponerla debajo del visor.

## Pendiente de validar con la profesora

- Los textos de la Meta y la Activación de la maqueta (el hero usa la descripción del prompt).
- Colores: el prompt usa crema `#F5F2EA` y azul `#172B4D`. Verifíquenlos contra el manual de marca; se cambian en `src/styles/global.css` (`:root`).
