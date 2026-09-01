import { RanaFrog } from "./RanaFrog";

interface SnowSceneProps {
  size: number;
}

/** Static scene inside the globe, drawn in Rana's flat isometric illustration style. */
export function SnowScene({ size }: SnowSceneProps) {
  const c = size / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <clipPath id="globeClip">
          <circle cx={c} cy={c} r={c - 2} />
        </clipPath>
      </defs>

      <g clipPath="url(#globeClip)">
        {/* backdrop wash */}
        <circle cx={c} cy={c} r={c} fill="var(--blue-100)" />
        <circle cx={c * 0.65} cy={c * 0.6} r={c * 0.85} fill="var(--blue-50)" opacity={0.7} />

        {/* faint background stars */}
        {[
          [0.22, 0.18],
          [0.78, 0.22],
          [0.85, 0.4],
          [0.15, 0.42],
          [0.5, 0.12],
        ].map(([fx, fy], i) => (
          <circle key={i} cx={c * 2 * fx} cy={c * 2 * fy} r={1.6} fill="var(--blue-300)" opacity={0.8} />
        ))}

        {/* snowy ground mound (kept off pure white so falling/settled snow stays visible against it) */}
        <ellipse cx={c} cy={size * 0.86} rx={c * 1.05} ry={size * 0.22} fill="var(--blue-300)" />
        <ellipse cx={c} cy={size * 0.84} rx={c * 0.95} ry={size * 0.16} fill="var(--blue-200)" />

        {/* gift box, isometric cube like the reference illustrations */}
        <g transform={`translate(${size * 0.68} ${size * 0.72})`}>
          <path d="M -16 -4 L 0 -13 L 16 -4 L 0 5 Z" fill="var(--blue-200)" />
          <path d="M -16 -4 L 0 5 L 0 22 L -16 13 Z" fill="var(--blue-500)" />
          <path d="M 16 -4 L 0 5 L 0 22 L 16 13 Z" fill="var(--navy-800)" />
          <path d="M -16 -4 L 0 -13 L 16 -4 L 0 5 Z M 0 5 L 0 22" stroke="var(--white)" strokeWidth={1.6} fill="none" opacity={0.7} />
          <path d="M -8 -8.5 L -8 17.5 M 8 -8.5 L 8 17.5" stroke="var(--white)" strokeWidth={1.6} opacity={0.55} />
        </g>

        {/* christmas tree, stacked flat triangles */}
        <g transform={`translate(${size * 0.36} ${size * 0.5})`}>
          <rect x={-5} y={44} width={10} height={12} rx={2} fill="var(--navy-800)" />
          <path d="M 0 -58 L 24 -18 L -24 -18 Z" fill="var(--blue-400)" />
          <path d="M 0 -58 L 3 -18 L -24 -18 Z" fill="var(--blue-500)" opacity={0.55} />
          <path d="M 0 -34 L 32 8 L -32 8 Z" fill="var(--blue-500)" />
          <path d="M 0 -34 L 4 8 L -32 8 Z" fill="var(--blue-600)" opacity={0.5} />
          <path d="M 0 -6 L 40 44 L -40 44 Z" fill="var(--navy-700)" />
          <path d="M 0 -6 L 5 44 L -40 44 Z" fill="var(--navy-800)" opacity={0.45} />
          {/* ornaments */}
          <circle cx={-10} cy={-6} r={3} fill="var(--white)" />
          <circle cx={14} cy={16} r={3} fill="var(--white)" />
          <circle cx={-18} cy={30} r={3} fill="var(--white)" />
          <circle cx={8} cy={-24} r={2.4} fill="var(--white)" />
          {/* star */}
          <path
            d="M 0 -70 L 3.2 -62 L 12 -61 L 5.2 -55 L 7.4 -47 L 0 -52 L -7.4 -47 L -5.2 -55 L -12 -61 L -3.2 -62 Z"
            fill="var(--white)"
          />
        </g>

        <RanaFrog x={size * 0.53} y={size * 0.8} scale={size / 300} />
      </g>

      {/* inner rim shading for glass depth */}
      <circle
        cx={c}
        cy={c}
        r={c - 3}
        fill="none"
        stroke="var(--navy-800)"
        strokeOpacity={0.08}
        strokeWidth={4}
      />
    </svg>
  );
}
