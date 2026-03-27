/**
 * SVG markup for a stylized vinyl disc (used inside album detail carousel).
 * @param {string} idPrefix — unique prefix for SVG defs (e.g. from React useId)
 */
export function makeVinylSvgString(idPrefix, c1, c2, accent) {
  const id = String(idPrefix).replace(/[^a-zA-Z0-9_-]/g, '');
  const rings = [56, 40, 28, 16]
    .map(
      (r) =>
        `<circle cx="65" cy="65" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.2"/>`
    )
    .join('');

  return `<svg class="vinyl-svg" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${id}_bg" cx="50%" cy="50%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </radialGradient>
      <radialGradient id="${id}_sheen" cx="32%" cy="28%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.04)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <circle cx="65" cy="65" r="65" fill="url(#${id}_bg)"/>
    ${rings}
    <circle cx="65" cy="65" r="50" fill="none" stroke="${accent}" stroke-width="0.8" stroke-opacity="0.35"/>
    <circle cx="65" cy="65" r="38" fill="none" stroke="${accent}" stroke-width="0.5" stroke-opacity="0.2"/>
    <circle cx="65" cy="65" r="18" fill="rgba(255,255,255,0.12)"/>
    <circle cx="65" cy="65" r="17" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
    <circle cx="65" cy="65" r="4.5" fill="rgba(255,255,255,0.45)"/>
    <circle cx="65" cy="65" r="2.5" fill="${c2}"/>
    <circle cx="65" cy="65" r="65" fill="url(#${id}_sheen)"/>
  </svg>`;
}

export const VINYL_PALETTES = [
  { color1: '#1a2050', color2: '#0a1030', accent: '#8899ff' },
  { color1: '#1f2a18', color2: '#0d180a', accent: '#88cc88' },
  { color1: '#2a1818', color2: '#180808', accent: '#ff9988' },
  { color1: '#1a1830', color2: '#0a0820', accent: '#aa88ff' },
  { color1: '#1a2520', color2: '#0a1510', accent: '#88ffcc' },
  { color1: '#251818', color2: '#150808', accent: '#ffcc88' },
  { color1: '#201a28', color2: '#100818', accent: '#cc88ff' },
];

export function paletteForIndex(index) {
  return VINYL_PALETTES[((index % VINYL_PALETTES.length) + VINYL_PALETTES.length) % VINYL_PALETTES.length];
}
