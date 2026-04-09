/**
 * Animated SVG sponsor icons.
 * Post-launch: replace these with Gemini API-generated SVGs.
 * API key: stored in env as VITE_GEMINI_API_KEY
 * Model: gemini-2.5-flash-preview-04-17
 */

export const SponsorIcons = {
  // Uber Eats — animated burger
  burger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <style>
      .bun { animation: bounceB 2s ease-in-out infinite; }
      @keyframes bounceB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
    </style>
    <rect class="bun" x="8" y="8" width="32" height="8" rx="4" fill="#f59e0b"/>
    <rect x="8" y="18" width="32" height="4" rx="2" fill="#10b981"/>
    <rect x="8" y="24" width="32" height="5" rx="2" fill="#ef4444"/>
    <rect x="8" y="31" width="32" height="4" rx="2" fill="#fbbf24"/>
    <rect x="8" y="37" width="32" height="7" rx="3.5" fill="#f59e0b"/>
    <circle cx="14" cy="12" r="2" fill="#fef3c7" opacity="0.7"/>
  </svg>`,

  // Nike — animated swoosh sneaker
  sneaker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <style>
      .shoe { animation: slideShoe 2.5s ease-in-out infinite; }
      .swoosh { animation: fadeS 2.5s ease-in-out infinite; }
      @keyframes slideShoe { 0%,100%{transform:translateX(0)} 50%{transform:translateX(2px)} }
      @keyframes fadeS { 0%,100%{opacity:1} 50%{opacity:0.7} }
    </style>
    <g class="shoe">
      <path d="M6 34 Q10 24 18 22 L38 20 Q42 20 42 24 L40 28 Q36 32 28 32 L10 34 Z" fill="#1a1a1a"/>
      <path d="M10 34 Q8 36 10 38 L36 38 Q40 38 40 36 L40 34 Z" fill="#111"/>
      <path class="swoosh" d="M20 26 Q28 18 38 22 Q34 26 26 28 Z" fill="white" opacity="0.9"/>
      <rect x="14" y="18" width="10" height="6" rx="2" fill="#333"/>
    </g>
  </svg>`,

  // IKEA — animated sofa
  sofa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <style>
      .cushion { animation: squishC 3s ease-in-out infinite; }
      @keyframes squishC { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.93) translateY(1px)} }
    </style>
    <rect x="4" y="28" width="40" height="12" rx="4" fill="#0058a3"/>
    <rect x="4" y="22" width="8" height="18" rx="3" fill="#004f96"/>
    <rect x="36" y="22" width="8" height="18" rx="3" fill="#004f96"/>
    <g class="cushion">
      <rect x="12" y="20" width="11" height="10" rx="3" fill="#1a75d2"/>
      <rect x="25" y="20" width="11" height="10" rx="3" fill="#1a75d2"/>
    </g>
    <rect x="10" y="38" width="6" height="4" rx="1" fill="#004080"/>
    <rect x="32" y="38" width="6" height="4" rx="1" fill="#004080"/>
  </svg>`,

  // Booking.com — animated hotel building
  hotel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <style>
      .light { animation: blinkL 2s step-end infinite; }
      @keyframes blinkL { 0%,49%{fill:#fbbf24} 50%,100%{fill:#374151} }
    </style>
    <rect x="10" y="14" width="28" height="30" rx="2" fill="#003580"/>
    <rect x="18" y="6" width="12" height="10" rx="1" fill="#003580"/>
    <rect x="22" y="2" width="4" height="6" rx="1" fill="#dc2626"/>
    <rect class="light" x="14" y="20" width="5" height="5" rx="1"/>
    <rect class="light" x="22" y="20" width="5" height="5" rx="1" style="animation-delay:0.3s"/>
    <rect class="light" x="30" y="20" width="5" height="5" rx="1" style="animation-delay:0.6s"/>
    <rect class="light" x="14" y="29" width="5" height="5" rx="1" style="animation-delay:0.9s"/>
    <rect class="light" x="30" y="29" width="5" height="5" rx="1" style="animation-delay:1.2s"/>
    <rect x="20" y="34" width="8" height="10" rx="1" fill="#1a4a8c"/>
    <rect x="18" y="43" width="12" height="2" rx="1" fill="#001f5c"/>
  </svg>`,
};

/** Returns inline SVG string for a sponsor by name key */
export function getSponsorIcon(key) {
  return SponsorIcons[key] || null;
}
