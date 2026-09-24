/* ============================================================
   Shared component: companion-character pose SVGs.
   Genuinely reused across 2+ screens — poseIdleSvg is used on 2 of the
   3 breather screens (js/screens/breather.js), and poseThinkingSvg is
   used on the 3rd breather screen AND on the calculating screen
   (js/screens/calculating.js) — so this lives in js/components/
   rather than inside either screen file.

   Inline, from the Companion.dc.html asset export plus new pose
   variants authored for T007. Each pose is a self-contained
   0-0-200-200 viewBox drawing; sized per call-site. Markup is
   byte-for-byte identical to the pre-T014 inline <script> — only the
   file location changed.
   ============================================================ */

export function poseThinkingSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200">
    <ellipse cx="100" cy="150" rx="46" ry="10" fill="var(--ink-900, #2A211A)" opacity="0.06"></ellipse>
    <ellipse cx="72" cy="150" rx="14" ry="16" fill="var(--marigold-500, #F5C242)"></ellipse>
    <ellipse cx="128" cy="150" rx="14" ry="16" fill="var(--marigold-500, #F5C242)"></ellipse>
    <rect x="148" y="90" width="26" height="40" rx="13" fill="var(--marigold-400, #FED455)" stroke="var(--marigold-600, #D9A62E)" stroke-width="2"></rect>
    <g transform="rotate(48 60 110)">
      <rect x="34" y="88" width="24" height="44" rx="12" fill="var(--marigold-400, #FED455)" stroke="var(--marigold-600, #D9A62E)" stroke-width="2"></rect>
    </g>
    <ellipse cx="100" cy="105" rx="72" ry="68" fill="var(--marigold-400, #FED455)"></ellipse>
    <path d="M 46 61 A 72 68 0 0 1 154 61 Q 100 83 46 61 Z" fill="var(--marigold-700, #B0801E)"></path>
    <path d="M 46 61 Q 100 83 154 61" stroke="var(--ink-900, #2A211A)" stroke-width="2.5" fill="none" stroke-linecap="round"></path>
    <g transform="translate(100,38) scale(0.77) translate(-100,-48)">
      <path d="M 34 74 Q 100 92 166 74" stroke="var(--marigold-600, #D9A62E)" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5"></path>
      <path d="M 42 62 C 30 50 34 30 52 26 C 56 14 76 14 82 24 C 88 14 100 18 100 28 C 100 18 112 14 118 24 C 124 14 144 14 148 26 C 166 30 170 50 158 62 C 168 66 164 78 150 76 C 152 84 138 84 132 76 C 130 84 112 82 108 76 C 106 82 94 82 92 76 C 88 82 70 84 68 76 C 62 84 48 84 50 76 C 36 78 32 66 42 62 Z" fill="#F0A29B" stroke="#B5564E" stroke-width="2.5" stroke-linejoin="round"></path>
      <path d="M 100 20 C 100 36 100 55 100 76" stroke="#8E3D38" stroke-width="3" fill="none" stroke-linecap="round"></path>
      <path d="M 50 40 Q 58 34 66 40" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 46 52 Q 56 48 62 54" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 55 64 Q 65 60 72 66" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 70 30 Q 78 26 84 32" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 62 72 Q 72 70 80 74" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 150 40 Q 142 34 134 40" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 154 52 Q 144 48 138 54" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 145 64 Q 135 60 128 66" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 130 30 Q 122 26 116 32" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
      <path d="M 138 72 Q 128 70 120 74" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    </g>
    <ellipse cx="100" cy="140" rx="72" ry="30" fill="var(--marigold-500, #F5C242)" opacity="0.35"></ellipse>
    <circle cx="66" cy="90" r="2" fill="var(--ink-900, #2A211A)"></circle>
    <circle cx="76" cy="82" r="2" fill="var(--ink-900, #2A211A)"></circle>
    <circle cx="87" cy="76" r="2" fill="var(--ink-900, #2A211A)"></circle>
    <circle cx="80" cy="98" r="19" fill="var(--ink-0, #FFFFFF)" stroke="var(--ink-900, #2A211A)" stroke-width="2"></circle>
    <circle cx="126" cy="98" r="19" fill="var(--ink-0, #FFFFFF)" stroke="var(--ink-900, #2A211A)" stroke-width="2"></circle>
    <circle cx="86" cy="101" r="9.5" fill="var(--ink-800, #3A2F26)"></circle>
    <circle cx="132" cy="101" r="9.5" fill="var(--ink-800, #3A2F26)"></circle>
    <circle cx="89" cy="96" r="3.8" fill="var(--ink-0, #FFFFFF)"></circle>
    <circle cx="135" cy="96" r="3.8" fill="var(--ink-0, #FFFFFF)"></circle>
    <path d="M 71 107 Q 80 112 89 107" stroke="var(--ink-900, #2A211A)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.3"></path>
    <path d="M 117 107 Q 126 112 135 107" stroke="var(--ink-900, #2A211A)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.3"></path>
    <path d="M 68 80 Q 80 74 93 80" stroke="var(--ink-900, #2A211A)" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7"></path>
    <ellipse cx="64" cy="125" rx="9" ry="5.5" fill="var(--ripe-100, #FDE2D5)" opacity="0.55"></ellipse>
    <ellipse cx="140" cy="125" rx="9" ry="5.5" fill="var(--ripe-100, #FDE2D5)" opacity="0.55"></ellipse>
    <ellipse cx="103" cy="130" rx="7" ry="5" fill="var(--ink-900, #2A211A)"></ellipse>
  </svg>`;
}
export function poseIdleSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200">
    <ellipse cx="100" cy="150" rx="46" ry="10" fill="var(--ink-900, #2A211A)" opacity="0.06"></ellipse>
    <ellipse cx="72" cy="150" rx="14" ry="16" fill="var(--marigold-500, #F5C242)"></ellipse>
    <ellipse cx="128" cy="150" rx="14" ry="16" fill="var(--marigold-500, #F5C242)"></ellipse>
    <rect x="26" y="90" width="26" height="40" rx="13" fill="var(--marigold-400, #FED455)" stroke="var(--marigold-600, #D9A62E)" stroke-width="2"></rect>
    <rect x="148" y="90" width="26" height="40" rx="13" fill="var(--marigold-400, #FED455)" stroke="var(--marigold-600, #D9A62E)" stroke-width="2"></rect>
    <ellipse cx="100" cy="105" rx="72" ry="68" fill="var(--marigold-400, #FED455)"></ellipse>
    <path d="M 46 61 A 72 68 0 0 1 154 61 Q 100 83 46 61 Z" fill="var(--marigold-700, #B0801E)"></path>
    <path d="M 46 61 Q 100 83 154 61" stroke="var(--ink-900, #2A211A)" stroke-width="2.5" fill="none" stroke-linecap="round"></path>
    <g>
    <g transform="translate(100,38) scale(0.77) translate(-100,-48)">
    <path d="M 34 74 Q 100 92 166 74" stroke="var(--marigold-600, #D9A62E)" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5"></path>
    <path d="M 42 62 C 30 50 34 30 52 26 C 56 14 76 14 82 24 C 88 14 100 18 100 28 C 100 18 112 14 118 24 C 124 14 144 14 148 26 C 166 30 170 50 158 62 C 168 66 164 78 150 76 C 152 84 138 84 132 76 C 130 84 112 82 108 76 C 106 82 94 82 92 76 C 88 82 70 84 68 76 C 62 84 48 84 50 76 C 36 78 32 66 42 62 Z" fill="#F0A29B" stroke="#B5564E" stroke-width="2.5" stroke-linejoin="round"></path>
    <path d="M 100 20 C 100 36 100 55 100 76" stroke="#8E3D38" stroke-width="3" fill="none" stroke-linecap="round"></path>
    <path d="M 50 40 Q 58 34 66 40" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 46 52 Q 56 48 62 54" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 55 64 Q 65 60 72 66" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 70 30 Q 78 26 84 32" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 62 72 Q 72 70 80 74" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 150 40 Q 142 34 134 40" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 154 52 Q 144 48 138 54" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 145 64 Q 135 60 128 66" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 130 30 Q 122 26 116 32" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    <path d="M 138 72 Q 128 70 120 74" stroke="#B5564E" stroke-width="1.8" fill="none" stroke-linecap="round"></path>
    </g>
    </g>
    <ellipse cx="100" cy="140" rx="72" ry="30" fill="var(--marigold-500, #F5C242)" opacity="0.35"></ellipse>
    <circle cx="76" cy="97" r="20" fill="var(--ink-0, #FFFFFF)" stroke="var(--ink-900, #2A211A)" stroke-width="2"></circle>
    <circle cx="124" cy="97" r="20" fill="var(--ink-0, #FFFFFF)" stroke="var(--ink-900, #2A211A)" stroke-width="2"></circle>
    <circle cx="79" cy="100" r="10" fill="var(--ink-800, #3A2F26)"></circle>
    <circle cx="127" cy="100" r="10" fill="var(--ink-800, #3A2F26)"></circle>
    <circle cx="83" cy="95" r="4" fill="var(--ink-0, #FFFFFF)"></circle>
    <circle cx="131" cy="95" r="4" fill="var(--ink-0, #FFFFFF)"></circle>
    <path d="M 67 106 Q 76 111 85 106" stroke="var(--ink-900, #2A211A)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.3"></path>
    <path d="M 115 106 Q 124 111 133 106" stroke="var(--ink-900, #2A211A)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.3"></path>
    <path d="M 64 78 Q 76 71 89 77" stroke="var(--ink-900, #2A211A)" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.75"></path>
    <path d="M 111 77 Q 124 71 136 78" stroke="var(--ink-900, #2A211A)" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.75"></path>
    <ellipse cx="62" cy="123" rx="10" ry="6" fill="var(--ripe-100, #FDE2D5)" opacity="0.6"></ellipse>
    <ellipse cx="138" cy="123" rx="10" ry="6" fill="var(--ripe-100, #FDE2D5)" opacity="0.6"></ellipse>
    <path d="M 78 128 Q 100 146 122 128" stroke="var(--ink-900, #2A211A)" stroke-width="5" stroke-linecap="round" fill="none"></path>
  </svg>`;
}
