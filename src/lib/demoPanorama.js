// Panorama equirectangular de DEMOSTRACIÓN generado por código (2:1).
// Solo sirve para probar la navegación 360°; se reemplaza por el video real.

export function createDemoPanorama(width = 4096) {
  const w = width;
  const h = width / 2;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const horizon = h * 0.5;

  // Cielo
  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#9fb6d6');
  sky.addColorStop(1, '#e9eef5');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, horizon);

  // Techo del estadio
  g.fillStyle = '#1A1A1A';
  g.fillRect(0, horizon - h * 0.2, w, h * 0.035);

  // Tribunas con público (puntos rojo, blanco y azul)
  const standTop = horizon - h * 0.165;
  const standBottom = horizon - h * 0.005;
  g.fillStyle = '#2b4268';
  g.fillRect(0, standTop, w, standBottom - standTop);
  const colors = ['#FF051E', '#FFFFFF', '#FBF5EC', '#5b6f91', '#ff6b7a'];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = standTop + 6; y < standBottom - 4; y += 9) {
    for (let x = (y / 9) % 2 ? 3 : 7; x < w; x += 9) {
      g.fillStyle = colors[Math.floor(rnd() * colors.length)];
      g.globalAlpha = 0.55 + rnd() * 0.45;
      g.beginPath();
      g.arc(x, y, 2.4, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.globalAlpha = 1;
  // Pasillos
  g.fillStyle = '#1A1A1A';
  for (let x = 0; x < w; x += w / 16) g.fillRect(x, standTop, 10, standBottom - standTop);

  // Valla publicitaria
  g.fillStyle = '#FF051E';
  g.fillRect(0, standBottom, w, h * 0.022);
  g.fillStyle = '#FFFFFF';
  g.font = `800 ${Math.round(h * 0.016)}px DM Sans Variable, system-ui, sans-serif`;
  g.textBaseline = 'middle';
  for (let x = 40; x < w; x += w / 8) {
    g.fillText('FÍSICA EN MOVIMIENTO · UAO', x, standBottom + h * 0.011);
  }

  // Cancha con franjas
  const grassTop = standBottom + h * 0.022;
  for (let i = 0; i < 24; i++) {
    g.fillStyle = i % 2 ? '#3f8f4f' : '#479a57';
    g.fillRect((i * w) / 24, grassTop, w / 24 + 1, h - grassTop);
  }
  const grassFade = g.createLinearGradient(0, grassTop, 0, h);
  grassFade.addColorStop(0, 'rgba(0,0,0,0)');
  grassFade.addColorStop(1, 'rgba(0,0,0,0.25)');
  g.fillStyle = grassFade;
  g.fillRect(0, grassTop, w, h - grassTop);

  // Líneas de la cancha (aproximadas en la proyección)
  g.strokeStyle = 'rgba(255,255,255,0.85)';
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(0, grassTop + h * 0.06);
  g.lineTo(w, grassTop + h * 0.06);
  g.stroke();

  // Arco al frente (centro de la imagen = mirada inicial)
  const gx = w / 2;
  const gw = w * 0.06;
  const gh = h * 0.05;
  const gb = grassTop + h * 0.058;
  g.fillStyle = 'rgba(255,255,255,0.18)';
  g.fillRect(gx - gw / 2, gb - gh, gw, gh);
  g.strokeStyle = '#FFFFFF';
  g.lineWidth = 8;
  g.strokeRect(gx - gw / 2, gb - gh, gw, gh);

  // Balón en el punto de partida (abajo, hacia el frente)
  g.fillStyle = '#FFFFFF';
  g.beginPath();
  g.arc(gx, h * 0.8, h * 0.02, 0, Math.PI * 2);
  g.fill();

  // Marca de demostración en cuatro direcciones
  g.fillStyle = 'rgba(23,43,77,0.75)';
  g.font = `800 ${Math.round(h * 0.03)}px DM Sans Variable, system-ui, sans-serif`;
  g.textAlign = 'center';
  for (let k = 0; k < 4; k++) {
    g.fillText('PANORAMA DE DEMOSTRACIÓN', w * (0.125 + k * 0.25), h * 0.12);
  }

  return c;
}
