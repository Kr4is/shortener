import { useId } from 'react';

/** Two interlocking links that read as an S. Same artwork as app/icon.svg. */
export default function Logo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  const top = 'M22.5 9.25H13.5a4.375 4.375 0 0 0 0 8.75h6';
  const bottom = 'M9.5 22.75h9a4.375 4.375 0 0 0 0-8.75h-6';
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3466E6" />
          <stop offset="1" stopColor="#1E46B4" />
        </linearGradient>
        <mask
          id={`${id}-under`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="32"
          height="32"
        >
          <rect width="32" height="32" fill="#fff" />
          <path
            d={top}
            fill="none"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id}-bg)`} />
      <path
        d={bottom}
        fill="none"
        stroke="#A9C0FF"
        strokeWidth="3.2"
        strokeLinecap="round"
        mask={`url(#${id}-under)`}
      />
      <path
        d={top}
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
