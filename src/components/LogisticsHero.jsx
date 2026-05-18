/**
 * Custom SVG illustration — AI logistics intelligence motif.
 */
export default function LogisticsHero({ className }) {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3BE0FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="heroGlow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#3BE0FF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3BE0FF" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow */}
      <ellipse cx="200" cy="140" rx="160" ry="100" fill="url(#heroGlow)" />

      {/* Grid floor */}
      <path
        d="M40 200 L200 120 L360 200 L200 240 Z"
        stroke="rgba(59,224,255,0.15)"
        strokeWidth="1"
        fill="rgba(21,31,53,0.4)"
      />

      {/* Container stack */}
      <rect x="120" y="130" width="70" height="50" rx="4" fill="#151F35" stroke="url(#heroGrad)" strokeWidth="1.5" />
      <rect x="130" y="115" width="70" height="50" rx="4" fill="#111A2E" stroke="rgba(59,224,255,0.4)" strokeWidth="1" />
      <rect x="140" y="100" width="70" height="50" rx="4" fill="#0B1220" stroke="rgba(79,140,255,0.5)" strokeWidth="1" />

      {/* Ship hull */}
      <path
        d="M220 175 L320 175 L300 210 L240 210 Z"
        fill="#151F35"
        stroke="url(#heroGrad)"
        strokeWidth="1.5"
      />
      <path d="M250 175 L250 155 L290 155 L295 175" stroke="#3BE0FF" strokeWidth="1.5" fill="none" />

      {/* AI neural nodes */}
      <circle cx="80" cy="80" r="6" fill="#3BE0FF" filter="url(#glow)" opacity="0.9" />
      <circle cx="120" cy="60" r="4" fill="#4F8CFF" opacity="0.8" />
      <circle cx="300" cy="70" r="5" fill="#3BE0FF" opacity="0.85" />
      <circle cx="340" cy="100" r="4" fill="#4F8CFF" opacity="0.7" />

      {/* Connection lines */}
      <path
        d="M80 80 L120 60 L200 90 L300 70 L340 100"
        stroke="rgba(59,224,255,0.35)"
        strokeWidth="1"
        strokeDasharray="4 4"
        fill="none"
      />
      <path d="M200 90 L200 120" stroke="rgba(79,140,255,0.4)" strokeWidth="1" />

      {/* Central AI chip */}
      <rect x="175" y="75" width="50" height="50" rx="8" fill="#111A2E" stroke="url(#heroGrad)" strokeWidth="2" filter="url(#glow)" />
      <path
        d="M190 95 H210 M200 85 V105 M185 100 H215 M185 110 H215"
        stroke="#3BE0FF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Route arc */}
      <path
        d="M60 180 Q200 80 340 180"
        stroke="url(#heroGrad)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="6 4"
        opacity="0.6"
      />

      {/* Plane icon */}
      <path
        d="M310 55 L330 65 L310 75 L315 65 Z"
        fill="#3BE0FF"
        opacity="0.9"
      />
    </svg>
  )
}

