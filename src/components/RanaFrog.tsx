interface RanaFrogProps {
  x: number;
  y: number;
  scale?: number;
}

/** A small nod to Rana's mascot, dressed for the occasion. */
export function RanaFrog({ x, y, scale = 1 }: RanaFrogProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* legs */}
      <ellipse cx={-13} cy={16} rx={9} ry={6} fill="var(--blue-600)" />
      <ellipse cx={13} cy={16} rx={9} ry={6} fill="var(--blue-700)" />

      {/* body */}
      <ellipse cx={0} cy={2} rx={19} ry={16} fill="var(--blue-500)" />
      <ellipse cx={4} cy={7} rx={14} ry={11} fill="var(--blue-600)" opacity={0.55} />

      {/* head */}
      <circle cx={0} cy={-14} r={15} fill="var(--blue-500)" />
      <circle cx={5} cy={-10} r={11} fill="var(--blue-600)" opacity={0.4} />

      {/* eye bumps */}
      <circle cx={-9} cy={-24} r={7} fill="var(--blue-500)" />
      <circle cx={9} cy={-24} r={7} fill="var(--blue-500)" />
      <circle cx={-9} cy={-24} r={4.2} fill="var(--white)" />
      <circle cx={9} cy={-24} r={4.2} fill="var(--white)" />
      <circle cx={-8} cy={-24} r={2} fill="var(--navy-900)" />
      <circle cx={10} cy={-24} r={2} fill="var(--navy-900)" />

      {/* glasses, echoing the onboarding illustration */}
      <g stroke="var(--navy-800)" strokeWidth={1.4} fill="none" opacity={0.85}>
        <circle cx={-9} cy={-24} r={7.5} />
        <circle cx={9} cy={-24} r={7.5} />
        <line x1={-1.5} y1={-24} x2={1.5} y2={-24} />
      </g>

      {/* santa hat, kept on-brand in navy + white */}
      <path
        d="M -13 -25 Q -6 -46 12 -34 Q 4 -30 -2 -24 Z"
        fill="var(--navy-800)"
      />
      <circle cx={-13} cy={-25} r={4.2} fill="var(--white)" />
      <rect x={-16} y={-27} width={10} height={5} rx={2.5} fill="var(--white)" />
    </g>
  );
}
