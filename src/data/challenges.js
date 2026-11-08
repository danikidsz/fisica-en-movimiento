// Contenido de los retos. Los cálculos de las respuestas están
// verificados en src/lib/physics.test.js.

export const SPEED_LEVELS = [
  {
    id: 's1',
    level: 'Nivel 1',
    context: 'Un ciclista recorre una recta en la ciclovía.',
    data: [
      { label: 'Distancia', value: '100 m' },
      { label: 'Tiempo', value: '20 s' },
    ],
    distance: 100,
    question: '¿A qué velocidad promedio se desplaza el ciclista?',
    options: ['2 m/s', '5 m/s', '10 m/s', '20 m/s'],
    correct: 1,
    hint: 'Divide la distancia entre el tiempo: v = d / t.',
    explanation: 'v = d / t = 100 m / 20 s = 5 m/s. Cada segundo avanza 5 metros.',
  },
  {
    id: 's2',
    level: 'Nivel 2',
    context: 'Por la Calle 5, un ciclista mantiene 72 km/h durante 15 segundos.',
    data: [
      { label: 'Velocidad', value: '72 km/h' },
      { label: 'Tiempo', value: '15 s' },
    ],
    distance: 300,
    question: '¿Cuántos metros recorre en ese tiempo?',
    options: ['4,8 m', '20 m', '300 m', '1.080 m'],
    correct: 2,
    hint: 'Antes de multiplicar, pasa la velocidad a m/s: 1 km = 1.000 m y 1 h = 3.600 s.',
    explanation:
      '72 km/h × (1.000 m / 3.600 s) = 20 m/s. Luego d = v · t = 20 m/s × 15 s = 300 m. Si multiplicas 72 × 15 sin convertir, mezclas horas con segundos.',
  },
  {
    id: 's3',
    level: 'Nivel 3',
    context:
      'Un ciclista recorre 600 m hacia el este en 60 s y regresa al punto de partida en 90 s.',
    data: [
      { label: 'Ida', value: '600 m · 60 s' },
      { label: 'Regreso', value: '600 m · 90 s' },
    ],
    distance: 600,
    roundTrip: true,
    question: '¿Cuáles son su rapidez media y su velocidad media en todo el recorrido?',
    options: [
      'Rapidez 8 m/s · velocidad 8 m/s',
      'Rapidez 8 m/s · velocidad 0 m/s',
      'Rapidez 8,33 m/s · velocidad 0 m/s',
      'Rapidez 0 m/s · velocidad 8 m/s',
    ],
    correct: 1,
    hint: 'La rapidez usa la distancia total recorrida; la velocidad usa el desplazamiento (dónde terminó respecto a dónde empezó).',
    explanation:
      'Rapidez media = 1.200 m / 150 s = 8 m/s. Como vuelve al punto de partida, el desplazamiento es 0 y la velocidad media es 0 m/s. Promediar 10 m/s y 6,67 m/s (8,33) es un error común: pasa más tiempo en el tramo lento.',
  },
];

// Movimientos para "Encuentra la gráfica". x(t) normalizado: t y x entre 0 y 1.
export const MOTIONS = {
  reposo: { label: 'Reposo', shape: 'recta horizontal', x: () => 0.45 },
  constante: { label: 'Velocidad constante', shape: 'recta inclinada que sube', x: (t) => t },
  acelera: { label: 'Acelera desde el reposo', shape: 'curva que empieza plana y se empina', x: (t) => t * t },
  frena: { label: 'Frena hasta detenerse', shape: 'curva que empieza empinada y se aplana', x: (t) => 1 - (1 - t) * (1 - t) },
  regresa: { label: 'Velocidad constante, en sentido contrario', shape: 'recta inclinada que baja', x: (t) => 1 - t },
};

export const GRAPH_EXERCISES = [
  {
    id: 'g1',
    object: 'Un carro avanza por una vía recta.',
    motion: 'constante',
    options: ['reposo', 'constante', 'acelera'],
    explanation:
      'Recorre distancias iguales en tiempos iguales, así que la posición crece de forma lineal: una recta inclinada. Su pendiente es la velocidad.',
  },
  {
    id: 'g2',
    object: 'Un balón empieza quieto y rueda por una rampa cada vez más rápido.',
    motion: 'acelera',
    options: ['frena', 'constante', 'acelera'],
    explanation:
      'Cada segundo avanza más que el anterior, por eso la curva se empina con el tiempo (una parábola que abre hacia arriba). La pendiente creciente indica que la velocidad aumenta.',
  },
  {
    id: 'g3',
    object: 'Un ciclista frena hasta quedar quieto.',
    motion: 'frena',
    options: ['acelera', 'frena', 'reposo'],
    explanation:
      'Al principio avanza mucho por segundo y luego cada vez menos, así que la curva se aplana hasta quedar horizontal: la pendiente (velocidad) llega a cero.',
  },
];

// Reto del balón: datos del tiro de la Actividad 1.
export const SHOT = {
  goalDistance: 50, // m
  crossbar: 2.44, // m
  v0: 25, // m/s inicial
  angle: 25, // ° inicial
};

export const ANGLE_QUESTION = {
  question:
    'Si mantienes la misma velocidad inicial y solo cambias el ángulo, ¿con cuál llega más lejos el balón?',
  options: ['30°', '45°', '60°', '75°'],
  correct: 1,
  hint: 'Prueba en el simulador: deja fija la velocidad y compara 30° con 60°.',
  explanation:
    'El alcance es v₀² · sen(2θ) / g y sen(2θ) es máximo cuando 2θ = 90°, es decir, θ = 45°. Por eso 30° y 60° llegan igual de lejos: sus dobles (60° y 120°) tienen el mismo seno.',
};

// Ítems que cuentan para el progreso.
export const CHALLENGES = [
  { id: 'velocidad', title: 'Detective de velocidad', items: SPEED_LEVELS.map((l) => l.id) },
  { id: 'balon', title: '¿Dónde caerá el balón?', items: ['b-prediccion', 'b-gol', 'b-pregunta'] },
  { id: 'grafica', title: 'Encuentra la gráfica', items: GRAPH_EXERCISES.map((e) => e.id) },
];

export const TOTAL_ITEMS = CHALLENGES.reduce((n, c) => n + c.items.length, 0);

export const CONCEPTS = [
  { label: 'Posición y desplazamiento', challenge: 'velocidad' },
  { label: 'Rapidez y velocidad media', challenge: 'velocidad' },
  { label: 'Conversión de unidades', challenge: 'velocidad' },
  { label: 'Movimiento parabólico', challenge: 'balon' },
  { label: 'Componentes de la velocidad', challenge: 'balon' },
  { label: 'Gráficas de posición contra tiempo', challenge: 'grafica' },
];
