// Funciones de física del módulo. Sin resistencia del aire, g = 9,8 m/s².
export const G = 9.8;

export const toRad = (deg) => (deg * Math.PI) / 180;

/** Velocidad (o rapidez) media: v = d / t */
export function averageSpeed(distance, time) {
  if (time <= 0) throw new RangeError('El tiempo debe ser mayor que cero');
  return distance / time;
}

/** km/h → m/s */
export const kmhToMs = (kmh) => (kmh * 1000) / 3600;

/**
 * Lanzamiento desde el suelo (altura inicial 0).
 * Devuelve componentes, tiempo de vuelo, alcance, altura máxima y funciones de posición.
 */
export function projectile(v0, angleDeg, g = G) {
  const a = toRad(angleDeg);
  const vx = v0 * Math.cos(a);
  const vy = v0 * Math.sin(a);
  const timeOfFlight = (2 * vy) / g;
  const range = vx * timeOfFlight; // = v0² sin(2θ) / g
  const maxHeight = (vy * vy) / (2 * g);
  return {
    vx,
    vy,
    timeOfFlight,
    range,
    maxHeight,
    positionAt: (t) => ({ x: vx * t, y: vy * t - 0.5 * g * t * t }),
    velocityAt: (t) => ({ vx, vy: vy - g * t }),
    heightAtX: (x) => {
      if (vx === 0) return NaN;
      const t = x / vx;
      return vy * t - 0.5 * g * t * t;
    },
  };
}

/**
 * Resultado de un tiro hacia un arco ubicado a `goalDistance` metros
 * con travesaño a `crossbar` metros (se toma el balón como un punto).
 */
export function shotOutcome(v0, angleDeg, goalDistance = 50, crossbar = 2.44) {
  const p = projectile(v0, angleDeg);
  if (p.range < goalDistance) {
    return { result: 'corto', heightAtGoal: null, range: p.range };
  }
  const h = p.heightAtX(goalDistance);
  if (h <= crossbar) return { result: 'gol', heightAtGoal: h, range: p.range };
  return { result: 'alto', heightAtGoal: h, range: p.range };
}
