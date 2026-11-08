// Futbolista en ilustración vectorial 2D: formas simples, sin contornos,
// sin rasgos faciales. Mira hacia la derecha. viewBox 0 0 200 300.
// Las piezas tienen clases para animarlas con GSAP (svgOrigin en las articulaciones).

export const JOINTS = {
  hipKick: '112 180',
  kneeKick: '112 230',
  hipStand: '96 180',
  kneeStand: '96 230',
  shoulderFront: '116 84',
  shoulderBack: '94 84',
  body: '104 290',
};

const SKIN = '#9C6644';
const SKIN_SHADE = '#875535';
const RED = '#FF051E';
const RED_SHADE = '#D60019';
const NAVY = '#1A1A1A';

function Leg({ cls, hip, shade, thigh = 0, shin = 0 }) {
  const [hx, hy] = hip.split(' ').map(Number);
  const ky = hy + 50;
  return (
    <g className={`${cls}-thigh`} transform={`rotate(${thigh} ${hx} ${hy})`}>
      <rect x={hx - 9} y={hy - 4} width="18" height="56" rx="9" fill={shade ? SKIN_SHADE : SKIN} />
      <g className={`${cls}-shin`} transform={`rotate(${shin} ${hx} ${ky})`}>
        <rect x={hx - 8} y={ky - 4} width="16" height="22" rx="8" fill={shade ? SKIN_SHADE : SKIN} />
        {/* Media blanca con dos franjas rojas */}
        <rect x={hx - 8.5} y={ky + 12} width="17" height="36" rx="4" fill={shade ? '#E6E1D6' : '#FFFFFF'} />
        <rect x={hx - 8.5} y={ky + 16} width="17" height="3.5" fill={RED} />
        <rect x={hx - 8.5} y={ky + 23} width="17" height="3.5" fill={RED} />
        {/* Guayo rojo con suela negra */}
        <path
          d={`M${hx - 9} ${ky + 46} h18 q14 0 16 10 v2 h-34 z`}
          fill={shade ? RED_SHADE : RED}
        />
        <rect x={hx - 9} y={ky + 57} width="34" height="4" rx="2" fill="#111111" />
      </g>
    </g>
  );
}

function Arm({ cls, shoulder, shade, angle = 0 }) {
  const [sx, sy] = shoulder.split(' ').map(Number);
  return (
    <g className={cls} transform={`rotate(${angle} ${sx} ${sy})`}>
      <rect x={sx - 9} y={sy - 8} width="18" height="30" rx="9" fill={shade ? RED_SHADE : RED} />
      <rect x={sx - 6.5} y={sy + 16} width="13" height="50" rx="6.5" fill={shade ? SKIN_SHADE : SKIN} />
    </g>
  );
}

export default function Player({ pose = {}, className, title }) {
  const {
    lean = 0,
    kickThigh = 0,
    kickShin = 0,
    standThigh = 0,
    standShin = 0,
    armFront = 0,
    armBack = 0,
  } = pose;
  return (
    <g className={className} role={title ? 'img' : undefined} aria-label={title}>
      {/* sombra */}
      <ellipse cx="104" cy="295" rx="58" ry="6" fill={NAVY} opacity="0.12" className="pl-shadow" />
      <g className="pl-body" transform={`rotate(${lean} 104 290)`}>
        <Arm cls="pl-arm-back" shoulder={JOINTS.shoulderBack} shade angle={armBack} />
        <Leg cls="pl-stand" hip={JOINTS.hipStand} shade thigh={standThigh} shin={standShin} />
        {/* torso: camiseta roja */}
        <path d="M78 84 Q80 70 96 69 L116 69 Q132 71 132 86 L128 152 L82 152 Z" fill={RED} />
        <path d="M96 69 L116 69 L112 76 Q106 80 100 76 Z" fill={RED_SHADE} />
        {/* cuello y cabeza */}
        <rect x="99" y="58" width="12" height="14" rx="4" fill={SKIN_SHADE} />
        <circle cx="106" cy="42" r="21" fill={SKIN} />
        {/* cabello negro ondulado */}
        <path
          d="M84 44 C80 24 94 13 110 16 C126 18 133 31 127 42 C123 36 118 39 115 33 C111 38 106 34 102 39 C97 34 93 40 90 37 C88 43 87 47 84 44 Z"
          fill="#111111"
        />
        <circle cx="88" cy="46" r="6" fill={SKIN_SHADE} />
        {/* pantaloneta azul marino */}
        <path d="M80 146 L130 146 L136 190 L110 190 L105 174 L100 190 L74 190 Z" fill={NAVY} />
        <Leg cls="pl-kick" hip={JOINTS.hipKick} thigh={kickThigh} shin={kickShin} />
        <Arm cls="pl-arm-front" shoulder={JOINTS.shoulderFront} angle={armFront} />
      </g>
    </g>
  );
}

export function Ball({ cx = 0, cy = 0, r = 14, className }) {
  return (
    <g className={className} transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#FFFFFF" />
      <path
        d={`M0 ${-r * 0.42} L${r * 0.4} ${-r * 0.13} L${r * 0.25} ${r * 0.34} L${-r * 0.25} ${r * 0.34} L${-r * 0.4} ${-r * 0.13} Z`}
        fill={NAVY}
      />
      <path
        d={`M${-r * 0.95} ${-r * 0.2} L${-r * 0.62} ${-r * 0.3} M${r * 0.95} ${-r * 0.2} L${r * 0.62} ${-r * 0.3} M0 ${r} L0 ${r * 0.62}`}
        stroke={NAVY}
        strokeWidth={r * 0.14}
        strokeLinecap="round"
      />
      <circle r={r} fill="none" stroke={NAVY} strokeOpacity="0.18" strokeWidth="1" />
    </g>
  );
}
