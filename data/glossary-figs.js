// data/glossary-figs.js — أشكال SVG توضيحية لمصطلحات مقرر «الاهتزازات والاتزان» (264 مصيم)
// المفتاح = قيمة en في data/glossary.js حرفيًا. كل شكل: viewBox="0 0 320 140"،
// ألوان عبر متغيرات CSS فقط (var(--c-text), var(--c-text2), var(--c-water), var(--c-water2),
// var(--c-amber), var(--c-ok), var(--c-bad), var(--c-badge))، بلا defs وبلا id وبلا hex صلب.
export const FIGS = {

  // ─────────────── u1 — عالم الاهتزاز ───────────────

  'Frequency': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="40" x2="300" y2="40" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <path d="M40,40 L50,28.7 L60,24 L70,28.7 L80,40 L90,51.3 L100,56 L110,51.3 L120,40 L130,28.7 L140,24 L150,28.7 L160,40 L170,51.3 L180,56 L190,51.3 L200,40 L210,28.7 L220,24 L230,28.7 L240,40 L250,51.3 L260,56 L270,51.3 L280,40" fill="none" stroke="var(--c-water)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="30" y1="100" x2="300" y2="100" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <path d="M40,100 L50,84 L60,100 L70,116 L80,100 L90,84 L100,100 L110,116 L120,100 L130,84 L140,100 L150,116 L160,100 L170,84 L180,100 L190,116 L200,100 L210,84 L220,100 L230,116 L240,100 L250,84 L260,100 L270,116 L280,100" fill="none" stroke="var(--c-water2)" stroke-width="2.5" stroke-linecap="round"/>
    <text x="295" y="36" font-size="12" fill="var(--c-text2)" text-anchor="end">بطيء</text>
    <text x="295" y="96" font-size="12" fill="var(--c-amber)" text-anchor="end">سريع</text>
  </svg>`,

  'Cycle & Period': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="20" y1="70" x2="300" y2="70" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <path d="M40,70 L50,56.6 L60,48.7 L70,49.7 L80,59 L90,72.9 L100,85.6 L110,91.8 L120,89.1 L130,78.4 L140,64.3 L150,52.5 L160,48 L170,52.5 L180,64.3 L190,78.4 L200,89.1 L210,91.8 L220,85.6 L230,72.9 L240,59 L250,49.7 L260,48.7 L270,56.6 L280,70" fill="none" stroke="var(--c-water)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="40" y1="122" x2="40" y2="128" stroke="var(--c-amber)" stroke-width="1.5"/>
    <line x1="136" y1="122" x2="136" y2="128" stroke="var(--c-amber)" stroke-width="1.5"/>
    <line x1="46" y1="125" x2="130" y2="125" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="40,125 46,121 46,129" fill="var(--c-amber)"/>
    <polygon points="136,125 130,121 130,129" fill="var(--c-amber)"/>
    <text x="88" y="138" font-size="13" fill="var(--c-amber)" text-anchor="middle">T</text>
  </svg>`,

  'Amplitude': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="20" y1="70" x2="300" y2="70" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <path d="M40,70 L50,54.2 L60,44.9 L70,46 L80,57 L90,73.4 L100,88.4 L110,95.8 L120,92.5 L130,79.9 L140,63.3 L150,49.4 L160,44 L170,49.4 L180,63.3 L190,79.9 L200,92.5 L210,95.8 L220,88.4 L230,73.4 L240,57 L250,46 L260,44.9 L270,54.2 L280,70" fill="none" stroke="var(--c-water)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="160" y1="68" x2="160" y2="46" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="160,44 156,50 164,50" fill="var(--c-amber)"/>
    <circle cx="160" cy="70" r="2.5" fill="var(--c-amber)"/>
    <text x="170" y="58" font-size="13" fill="var(--c-amber)">A</text>
  </svg>`,

  'Peak, Peak-to-Peak, RMS': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="36" x2="300" y2="36" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <line x1="30" y1="95" x2="300" y2="95" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <line x1="30" y1="65" x2="300" y2="65" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="1,4"/>
    <line x1="30" y1="45" x2="300" y2="45" stroke="var(--c-ok)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <path d="M40,65 L50,46.7 L60,36 L70,37.3 L80,50 L90,68.9 L100,86.2 L110,94.7 L120,91 L130,76.5 L140,57.2 L150,41.2 L160,35 L170,41.2 L180,57.2 L190,76.5 L200,91 L210,94.7 L220,86.2 L230,68.9 L240,50 L250,37.3 L260,36 L270,46.7 L280,65" fill="none" stroke="var(--c-water)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="18" y1="63" x2="18" y2="38" stroke="var(--c-water)" stroke-width="2"/>
    <polygon points="18,36 14,42 22,42" fill="var(--c-water)"/>
    <text x="18" y="30" font-size="9" fill="var(--c-water)" text-anchor="middle">Peak</text>
    <line x1="308" y1="38" x2="308" y2="93" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="308,36 304,42 312,42" fill="var(--c-amber)"/>
    <polygon points="308,95 304,89 312,89" fill="var(--c-amber)"/>
    <text x="308" y="26" font-size="9" fill="var(--c-amber)" text-anchor="middle">P-P</text>
    <text x="34" y="42" font-size="9" fill="var(--c-ok)">RMS</text>
  </svg>`,

  'Phase': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M40,55 L50,44 L60,35.9 L70,33 L80,35.9 L90,44 L100,55 L110,66 L120,74.1 L130,77 L140,74.1 L150,66 L160,55 L170,44 L180,35.9 L190,33 L200,35.9 L210,44 L220,55 L230,66 L240,74.1 L250,77 L260,74.1 L270,66 L280,55" fill="none" stroke="var(--c-water)" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M40,77 L50,73.1 L60,75.1 L70,82.4 L80,93.1 L90,104.3 L100,113 L110,116.9 L120,114.9 L130,107.6 L140,96.9 L150,85.7 L160,77 L170,73.1 L180,75.1 L190,82.4 L200,93.1 L210,104.3 L220,113 L230,116.9 L240,114.9 L250,107.6 L260,96.9 L270,85.7 L280,77" fill="none" stroke="var(--c-water2)" stroke-width="2.3" stroke-linecap="round"/>
    <line x1="70" y1="15" x2="70" y2="33" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="52" y1="15" x2="52" y2="73" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="52" y1="15" x2="70" y2="15" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="52,15 57,11 57,19" fill="var(--c-amber)"/>
    <polygon points="70,15 65,11 65,19" fill="var(--c-amber)"/>
    <text x="61" y="10" font-size="12" fill="var(--c-amber)" text-anchor="middle">φ</text>
  </svg>`,

  // ─────────────── u2 — مبادئ الاهتزاز ───────────────

  'Resonance': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M40,114.9 L58,114.9 L76,114.8 L94,114.7 L112,114.6 L130,114.3 L148,113.6 L160,112.3 L172,107.9 L184,77.9 L190,37 L196,77.9 L208,107.9 L220,112.3 L238,113.9 L256,114.4 L274,114.6" fill="none" stroke="var(--c-bad)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="190" y1="20" x2="190" y2="115" stroke="var(--c-amber)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <text x="190" y="15" font-size="11" fill="var(--c-amber)" text-anchor="middle">fn</text>
    <text x="302" y="128" font-size="11" fill="var(--c-text2)" text-anchor="end">f</text>
  </svg>`,

  'Damping': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="70" x2="300" y2="70" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <path d="M40,36 L60,41.5 L80,46 L100,49.9 L120,53.1 L140,55.8 L160,58.1 L180,60 L200,61.6 L220,63 L240,64.1 L260,65 L280,65.8" fill="none" stroke="var(--c-text2)" stroke-width="1.3" stroke-dasharray="3,2"/>
    <path d="M40,104 L60,98.5 L80,94 L100,90.1 L120,86.9 L140,84.2 L160,81.9 L180,80 L200,78.4 L220,77 L240,75.9 L260,75 L280,74.2" fill="none" stroke="var(--c-text2)" stroke-width="1.3" stroke-dasharray="3,2"/>
    <path d="M40,70 L44,52.2 L48,49.3 L52,56.8 L56,67.3 L60,75 L64,77.4 L68,75.6 L72,71.9 L76,68.8 L80,67.5 L88,68.9 L96,70.8 L104,70.5 L112,69.8 L120,69.8 L140,70 L160,70 L200,70 L240,70 L280,70" fill="none" stroke="var(--c-water)" stroke-width="2.3" stroke-linecap="round"/>
    <line x1="30" y1="132" x2="300" y2="132" stroke="var(--c-text2)" stroke-width="1"/>
    <polygon points="303,132 297,128 297,136" fill="var(--c-text2)"/>
    <text x="306" y="136" font-size="10" fill="var(--c-text2)">t</text>
  </svg>`,

  'Free Vibration': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="70" x2="300" y2="70" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <path d="M40,70 L44,54.1 L48,48.3 L52,51.7 L56,60.5 L60,70 L64,76.8 L68,79.3 L72,77.8 L76,74.1 L80,70 L88,66.7 L96,68.3 L104,71.2 L112,71.4 L120,70 L140,70 L160,70 L200,70 L240,70 L280,70" fill="none" stroke="var(--c-water)" stroke-width="2.5" stroke-linecap="round"/>
    <text x="52" y="42" font-size="11" fill="var(--c-amber)">إزاحة أولية</text>
    <text x="230" y="64" font-size="11" fill="var(--c-text2)">سكون</text>
  </svg>`,

  'Forced Vibration': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="70" x2="300" y2="70" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <line x1="4" y1="70" x2="24" y2="70" stroke="var(--c-amber)" stroke-width="2.5"/>
    <polygon points="27,70 20,65 20,75" fill="var(--c-amber)"/>
    <path d="M40,70 L50,44.9 L60,57 L70,88.4 L80,92.5 L90,63.3 L100,44 L110,63.3 L120,92.5 L130,88.4 L140,57 L150,44.9 L160,70 L170,95.1 L180,83 L190,51.6 L200,47.5 L210,76.7 L220,96 L230,76.7 L240,47.5 L250,51.6 L260,83 L270,95.1 L280,70" fill="none" stroke="var(--c-water)" stroke-width="2.3" stroke-linecap="round"/>
    <text x="8" y="60" font-size="11" fill="var(--c-amber)">F</text>
  </svg>`,

  'Degree of Freedom': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="115" y1="20" x2="205" y2="20" stroke="var(--c-text)" stroke-width="2.5"/>
    <line x1="120" y1="20" x2="112" y2="28" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="135" y1="20" x2="127" y2="28" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="150" y1="20" x2="142" y2="28" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="165" y1="20" x2="157" y2="28" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="180" y1="20" x2="172" y2="28" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="195" y1="20" x2="187" y2="28" stroke="var(--c-text2)" stroke-width="1.3"/>
    <path d="M160,20 L150,27 L170,34 L150,41 L170,48 L150,55 L170,62 L160,69" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="110" y1="65" x2="110" y2="115" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <line x1="210" y1="65" x2="210" y2="115" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <rect x="130" y="70" width="60" height="36" fill="none" stroke="var(--c-water2)" stroke-width="2"/>
    <text x="160" y="93" font-size="14" fill="var(--c-text)" text-anchor="middle">M</text>
    <line x1="230" y1="75" x2="230" y2="110" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="230,72 226,80 234,80" fill="var(--c-amber)"/>
    <polygon points="230,113 226,105 234,105" fill="var(--c-amber)"/>
  </svg>`,

  // ─────────────── u3 — أجهزة القياس ───────────────

  'Eddy Current Probe': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="40" y="95" width="220" height="24" rx="12" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <rect x="140" y="25" width="16" height="45" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <line x1="148" y1="70" x2="148" y2="95" stroke="var(--c-amber)" stroke-width="1.5" stroke-dasharray="2,2"/>
    <polygon points="148,70 145,76 151,76" fill="var(--c-amber)"/>
    <polygon points="148,95 145,89 151,89" fill="var(--c-amber)"/>
    <path d="M138,95 A10,4 0 0 1 158,95" stroke="var(--c-badge)" fill="none" stroke-width="1.5"/>
    <path d="M126,95 A22,7 0 0 1 170,95" stroke="var(--c-badge)" fill="none" stroke-width="1.2"/>
    <text x="200" y="80" font-size="11" fill="var(--c-text2)">بلا تلامس</text>
  </svg>`,

  'Velocity Sensor': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="115" y="25" width="90" height="80" rx="6" fill="none" stroke="var(--c-water2)" stroke-width="2"/>
    <rect x="140" y="45" width="40" height="40" rx="4" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="160" y1="30" x2="160" y2="45" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="160" y1="85" x2="160" y2="100" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="220" y1="45" x2="220" y2="85" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="220,42 216,50 224,50" fill="var(--c-amber)"/>
    <polygon points="220,88 216,80 224,80" fill="var(--c-amber)"/>
    <line x1="150" y1="85" x2="150" y2="110" stroke="var(--c-text)" stroke-width="1.3"/>
    <line x1="170" y1="85" x2="170" y2="110" stroke="var(--c-text)" stroke-width="1.3"/>
    <circle cx="160" cy="118" r="10" fill="none" stroke="var(--c-text)" stroke-width="1.5"/>
    <text x="160" y="122" font-size="10" fill="var(--c-text)" text-anchor="middle">V</text>
  </svg>`,

  'Piezoelectric Accelerometer': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="90" y="100" width="140" height="14" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <line x1="98" y1="114" x2="92" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <line x1="113" y1="114" x2="107" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <line x1="128" y1="114" x2="122" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <line x1="143" y1="114" x2="137" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <line x1="158" y1="114" x2="152" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <line x1="173" y1="114" x2="167" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <line x1="188" y1="114" x2="182" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <line x1="203" y1="114" x2="197" y2="122" stroke="var(--c-text2)" stroke-width="1"/>
    <rect x="145" y="75" width="30" height="25" fill="none" stroke="var(--c-badge)" stroke-width="2"/>
    <rect x="140" y="45" width="40" height="30" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <text x="160" y="64" font-size="12" fill="var(--c-text)" text-anchor="middle">m</text>
    <line x1="175" y1="87" x2="250" y2="87" stroke="var(--c-text2)" stroke-width="1.3"/>
    <circle cx="258" cy="87" r="8" fill="none" stroke="var(--c-text2)" stroke-width="1.3"/>
    <text x="258" y="91" font-size="10" fill="var(--c-text2)" text-anchor="middle">q</text>
    <line x1="160" y1="15" x2="160" y2="43" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="160,13 156,21 164,21" fill="var(--c-amber)"/>
    <polygon points="160,102 156,94 164,94" fill="var(--c-amber)" opacity="0"/>
  </svg>`,

  'Sensor Selection Criteria': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="115" x2="300" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <text x="30" y="130" font-size="10" fill="var(--c-water)">إزاحة</text>
    <text x="140" y="130" font-size="10" fill="var(--c-water2)">سرعة</text>
    <text x="255" y="130" font-size="10" fill="var(--c-amber)">تسارع</text>
    <line x1="30" y1="100" x2="110" y2="100" stroke="var(--c-water)" stroke-width="3"/>
    <line x1="110" y1="70" x2="210" y2="70" stroke="var(--c-water2)" stroke-width="3"/>
    <line x1="210" y1="30" x2="300" y2="30" stroke="var(--c-amber)" stroke-width="3"/>
    <text x="35" y="25" font-size="10" fill="var(--c-text2)">التردد ←</text>
  </svg>`,

  'Mounting & Frequency Limit': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="120" x2="300" y2="120" stroke="var(--c-text2)" stroke-width="1.5"/>
    <rect x="50" y="30" width="40" height="90" fill="var(--c-water)"/>
    <rect x="120" y="60" width="40" height="60" fill="var(--c-water2)"/>
    <rect x="190" y="90" width="40" height="30" fill="var(--c-amber)"/>
    <rect x="260" y="114" width="40" height="6" fill="var(--c-bad)"/>
    <text x="70" y="24" font-size="10" fill="var(--c-text)" text-anchor="middle">15</text>
    <text x="140" y="54" font-size="10" fill="var(--c-text)" text-anchor="middle">10</text>
    <text x="210" y="84" font-size="10" fill="var(--c-text)" text-anchor="middle">5</text>
    <text x="280" y="108" font-size="10" fill="var(--c-text)" text-anchor="middle">1</text>
    <text x="70" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">برغي</text>
    <text x="140" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">لصق</text>
    <text x="210" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">مغناطيس</text>
    <text x="280" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">مسبار</text>
    <text x="16" y="20" font-size="9" fill="var(--c-text2)">kHz</text>
  </svg>`,

  'Measurement Directions H/V/A': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="40" y="60" width="240" height="20" rx="10" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <rect x="130" y="45" width="60" height="50" fill="none" stroke="var(--c-text)" stroke-width="2"/>
    <circle cx="160" cy="70" r="3" fill="var(--c-text)"/>
    <line x1="160" y1="70" x2="160" y2="22" stroke="var(--c-water)" stroke-width="2.3"/>
    <polygon points="160,18 155,26 165,26" fill="var(--c-water)"/>
    <text x="160" y="14" font-size="12" fill="var(--c-water)" text-anchor="middle">V</text>
    <line x1="160" y1="70" x2="122" y2="37" stroke="var(--c-water2)" stroke-width="2.3"/>
    <polygon points="119,34 121,43 129,37" fill="var(--c-water2)"/>
    <text x="106" y="30" font-size="12" fill="var(--c-water2)" text-anchor="middle">H</text>
    <line x1="160" y1="70" x2="228" y2="70" stroke="var(--c-amber)" stroke-width="2.3"/>
    <polygon points="232,70 224,65 224,75" fill="var(--c-amber)"/>
    <text x="240" y="74" font-size="12" fill="var(--c-amber)" text-anchor="middle">A</text>
  </svg>`,

  // ─────────────── u4 — المراقبة والتشخيص ───────────────

  'Spectrum Reading': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <line x1="25" y1="115" x2="25" y2="15" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L65.5,115 L70.5,85 L75.5,115 L111.4,115 L116.4,60 L121.4,115 L160,115 L165,93 L170,115 L208.6,115 L213.6,75 L218.6,115 L254.5,115 L259.5,100 L264.5,115 L300,115" fill="none" stroke="var(--c-water)" stroke-width="2.3" stroke-linecap="round"/>
    <text x="302" y="128" font-size="10" fill="var(--c-text2)" text-anchor="end">Hz</text>
    <text x="20" y="14" font-size="10" fill="var(--c-text2)" text-anchor="end">mm/s</text>
  </svg>`,

  'Orders 1× and 2×': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L92.5,115 L97.5,40 L102.5,115 L160,115 L165,83 L170,115 L227.5,115 L232.5,105 L237.5,115 L300,115" fill="none" stroke="var(--c-water)" stroke-width="2.5" stroke-linecap="round"/>
    <text x="97.5" y="34" font-size="12" fill="var(--c-water)" text-anchor="middle">1×</text>
    <text x="165" y="77" font-size="11" fill="var(--c-water2)" text-anchor="middle">2×</text>
    <text x="232.5" y="99" font-size="9" fill="var(--c-text2)" text-anchor="middle">3×</text>
  </svg>`,

  'Harmonics': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L68.2,115 L73.2,35 L78.2,115 L111.4,115 L116.4,60 L121.4,115 L154.6,115 L159.6,77 L164.6,115 L197.8,115 L202.8,89 L207.8,115 L241,115 L246,99 L251,115 L300,115" fill="none" stroke="var(--c-water)" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M73.2,35 L116.4,60 L159.6,77 L202.8,89 L246,99" fill="none" stroke="var(--c-amber)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <text x="73.2" y="29" font-size="10" fill="var(--c-water)" text-anchor="middle">1×</text>
    <text x="246" y="93" font-size="9" fill="var(--c-text2)" text-anchor="middle">5×</text>
  </svg>`,

  'Sidebands': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L133,115 L138,101 L143,115 L149.2,115 L154.2,93 L159.2,115 L165,37 L170.8,115 L175.8,93 L180.8,115 L187,115 L192,101 L197,115 L300,115" fill="none" stroke="var(--c-water)" stroke-width="2.3" stroke-linecap="round"/>
    <text x="165" y="31" font-size="11" fill="var(--c-water)" text-anchor="middle">قمة رئيسية</text>
    <line x1="149.2" y1="122" x2="165" y2="122" stroke="var(--c-amber)" stroke-width="1.5"/>
    <line x1="165" y1="122" x2="180.8" y2="122" stroke="var(--c-amber)" stroke-width="1.5"/>
    <text x="165" y="133" font-size="10" fill="var(--c-amber)" text-anchor="middle">Δf متساوٍ</text>
  </svg>`,

  'Noise Floor': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <line x1="30" y1="100" x2="300" y2="100" stroke="var(--c-ok)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <text x="34" y="97" font-size="10" fill="var(--c-ok)">طبيعي</text>
    <path d="M30,110 L43.5,97.7 L57,104.6 L70.5,98.9 L84,90.7 L97.5,101 L111,92.8 L124.5,108.3 L138,104.8 L151.5,106.5 L165,99.3 L178.5,108.9 L192,88.7 L205.5,100.2 L219,105.8 L232.5,97.9 L246,103.8 L259.5,88.3 L273,104.9 L286.5,102.7 L300,93" fill="none" stroke="var(--c-bad)" stroke-width="2" stroke-linecap="round"/>
    <text x="230" y="82" font-size="10" fill="var(--c-bad)">مرتفع — بلا قمم</text>
  </svg>`,

  'Crest Factor': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="76" x2="300" y2="76" stroke="var(--c-ok)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <line x1="30" y1="20" x2="300" y2="20" stroke="var(--c-bad)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <path d="M40,70 L60,58 L80,70 L100,82 L120,70 L140,58 L160,70 L163,20 L166,70 L180,82 L200,70 L220,58 L240,70 L260,82 L280,70" fill="none" stroke="var(--c-water)" stroke-width="2.3" stroke-linecap="round"/>
    <line x1="305" y1="22" x2="305" y2="74" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="305,20 301,26 309,26" fill="var(--c-amber)"/>
    <polygon points="305,76 301,70 309,70" fill="var(--c-amber)"/>
    <text x="313" y="50" font-size="10" fill="var(--c-amber)" writing-mode="vertical-rl">CF</text>
    <text x="34" y="73" font-size="9" fill="var(--c-ok)">RMS</text>
    <text x="34" y="18" font-size="9" fill="var(--c-bad)">Peak</text>
  </svg>`,

  'Blade Pass Frequency': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="90" cy="70" r="35" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="90" y1="70" x2="125" y2="70" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="90" y1="70" x2="100.8" y2="36.7" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="90" y1="70" x2="61.7" y2="49.4" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="90" y1="70" x2="61.7" y2="90.6" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="90" y1="70" x2="100.8" y2="103.3" stroke="var(--c-water)" stroke-width="2"/>
    <path d="M70,40 A25,25 0 0 1 110,40" stroke="var(--c-amber)" fill="none" stroke-width="1.5"/>
    <polygon points="110,40 102,38 105,46" fill="var(--c-amber)"/>
    <line x1="160" y1="120" x2="305" y2="120" stroke="var(--c-text2)" stroke-width="1.3"/>
    <path d="M160,120 L215,120 L225,50 L235,120 L300,120" fill="none" stroke="var(--c-bad)" stroke-width="2.3" stroke-linecap="round"/>
    <text x="225" y="44" font-size="10" fill="var(--c-amber)" text-anchor="middle">BPF</text>
  </svg>`,

  'Bearing Fault Frequencies': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="160" cy="70" r="55" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <circle cx="160" cy="70" r="25" fill="none" stroke="var(--c-water2)" stroke-width="2"/>
    <circle cx="160" cy="70" r="40" fill="none" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <circle cx="200" cy="70" r="6" fill="none" stroke="var(--c-badge)" stroke-width="1.5"/>
    <circle cx="180" cy="35.4" r="6" fill="none" stroke="var(--c-badge)" stroke-width="1.5"/>
    <circle cx="140" cy="35.4" r="6" fill="none" stroke="var(--c-badge)" stroke-width="1.5"/>
    <circle cx="120" cy="70" r="6" fill="none" stroke="var(--c-badge)" stroke-width="1.5"/>
    <circle cx="140" cy="104.6" r="6" fill="none" stroke="var(--c-badge)" stroke-width="1.5"/>
    <circle cx="180" cy="104.6" r="6" fill="none" stroke="var(--c-badge)" stroke-width="1.5"/>
    <line x1="160" y1="15" x2="160" y2="6" stroke="var(--c-text2)" stroke-width="1"/>
    <text x="160" y="10" font-size="9" fill="var(--c-text)" text-anchor="middle">BPFO</text>
    <line x1="160" y1="45" x2="105" y2="24" stroke="var(--c-text2)" stroke-width="1"/>
    <text x="70" y="28" font-size="9" fill="var(--c-text)" text-anchor="middle">BPFI</text>
    <line x1="200" y1="70" x2="258" y2="62" stroke="var(--c-text2)" stroke-width="1"/>
    <text x="280" y="60" font-size="9" fill="var(--c-text)" text-anchor="middle">BSF</text>
    <line x1="160" y1="110" x2="160" y2="124" stroke="var(--c-text2)" stroke-width="1"/>
    <text x="160" y="134" font-size="9" fill="var(--c-text)" text-anchor="middle">FTF</text>
  </svg>`,

  'ISO 2372 / 10816': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="120" x2="300" y2="120" stroke="var(--c-text2)" stroke-width="1.5"/>
    <rect x="30" y="105" width="70" height="15" fill="var(--c-ok)"/>
    <rect x="100" y="90" width="70" height="30" fill="var(--c-water2)"/>
    <rect x="170" y="65" width="70" height="55" fill="var(--c-amber)"/>
    <rect x="240" y="30" width="60" height="90" fill="var(--c-bad)"/>
    <text x="65" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">جيد</text>
    <text x="135" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">مرضٍ</text>
    <text x="205" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">غير مرضٍ</text>
    <text x="270" y="132" font-size="9" fill="var(--c-text2)" text-anchor="middle">مرفوض</text>
    <text x="20" y="18" font-size="9" fill="var(--c-text2)" text-anchor="end">mm/s</text>
  </svg>`,

  'Bearing Vibration Severity Chart': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="120" x2="300" y2="120" stroke="var(--c-text2)" stroke-width="1.5"/>
    <line x1="30" y1="120" x2="30" y2="15" stroke="var(--c-text2)" stroke-width="1.5"/>
    <line x1="30" y1="120" x2="300" y2="15" stroke="var(--c-ok)" stroke-width="2"/>
    <line x1="30" y1="120" x2="250" y2="15" stroke="var(--c-amber)" stroke-width="2" stroke-dasharray="4,3"/>
    <line x1="30" y1="120" x2="170" y2="15" stroke="var(--c-bad)" stroke-width="2" stroke-dasharray="2,3"/>
    <text x="304" y="16" font-size="9" fill="var(--c-ok)">قمة</text>
    <text x="22" y="132" font-size="9" fill="var(--c-text2)" text-anchor="end">فعّالة →</text>
  </svg>`,

  'Unbalance Signature': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L106,115 L111,30 L116,115 L160,115 L165,105 L170,115 L214,115 L219,109 L224,115 L300,115" fill="none" stroke="var(--c-bad)" stroke-width="2.5" stroke-linecap="round"/>
    <text x="111" y="24" font-size="12" fill="var(--c-amber)" text-anchor="middle">1×</text>
  </svg>`,

  'Misalignment Signature': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L92.5,115 L97.5,75 L102.5,115 L160,115 L165,37 L170,115 L227.5,115 L232.5,101 L237.5,115 L300,115" fill="none" stroke="var(--c-bad)" stroke-width="2.5" stroke-linecap="round"/>
    <text x="97.5" y="69" font-size="10" fill="var(--c-text2)" text-anchor="middle">1×</text>
    <text x="165" y="31" font-size="12" fill="var(--c-amber)" text-anchor="middle">2×</text>
  </svg>`,

  'Looseness Signature': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L57.4,115 L62.4,45 L67.4,115 L89.8,115 L94.8,57 L99.8,115 L122.2,115 L127.2,67 L132.2,115 L154.6,115 L159.6,75 L164.6,115 L187,115 L192,82 L197,115 L219.4,115 L224.4,88 L229.4,115 L251.8,115 L256.8,93 L261.8,115 L300,115" fill="none" stroke="var(--c-bad)" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="30" y1="108" x2="300" y2="108" stroke="var(--c-amber)" stroke-width="1" stroke-dasharray="2,3"/>
    <text x="230" y="103" font-size="9" fill="var(--c-amber)">أرضية مرتفعة</text>
  </svg>`,

  'Bearing Defect Signature': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,115 L119.5,115 L124.5,95 L129.5,115 L138.4,115 L143.4,77 L148.4,115 L160,115 L165,43 L170,115 L181.6,115 L186.6,77 L191.6,115 L200.5,115 L205.5,95 L210.5,115 L300,115" fill="none" stroke="var(--c-bad)" stroke-width="2.3" stroke-linecap="round"/>
    <text x="165" y="37" font-size="10" fill="var(--c-amber)" text-anchor="middle">BPFO</text>
    <text x="205" y="132" font-size="9" fill="var(--c-text2)">جوانب حوله</text>
  </svg>`,

  'Cavitation Signature': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="25" y1="115" x2="305" y2="115" stroke="var(--c-text2)" stroke-width="1.5"/>
    <path d="M30,110 L43.5,97.7 L57,104.6 L70.5,98.9 L84,90.7 L97.5,101 L111,92.8 L124.5,108.3 L138,104.8 L151.5,106.5 L165,99.3 L178.5,108.9 L192,88.7 L205.5,100.2 L219,105.8 L232.5,97.9 L246,103.8 L259.5,88.3 L273,104.9 L286.5,102.7 L300,93" fill="none" stroke="var(--c-bad)" stroke-width="2.2" stroke-linecap="round"/>
    <text x="165" y="80" font-size="10" fill="var(--c-text2)" text-anchor="middle">ضجيج عريض — بلا قمم</text>
  </svg>`,

  // ─────────────── u5 — الاتزان ───────────────

  'Centrifugal Force F = M ω² r': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="140" cy="70" r="45" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <line x1="135" y1="70" x2="145" y2="70" stroke="var(--c-text)" stroke-width="1.3"/>
    <line x1="140" y1="65" x2="140" y2="75" stroke="var(--c-text)" stroke-width="1.3"/>
    <line x1="140" y1="70" x2="176.9" y2="44.2" stroke="var(--c-text)" stroke-width="1.5"/>
    <text x="155" y="60" font-size="11" fill="var(--c-text)">r</text>
    <circle cx="176.9" cy="44.2" r="7" fill="var(--c-badge)"/>
    <line x1="176.9" y1="44.2" x2="205" y2="26.4" stroke="var(--c-bad)" stroke-width="2.5"/>
    <polygon points="208,24.4 199,24 202,32" fill="var(--c-bad)"/>
    <text x="212" y="22" font-size="13" fill="var(--c-bad)">F</text>
    <path d="M105,42 A45,45 0 0 1 165,25" stroke="var(--c-amber)" fill="none" stroke-width="1.5"/>
    <polygon points="165,25 157,22 158,31" fill="var(--c-amber)"/>
    <text x="180" y="18" font-size="12" fill="var(--c-amber)">ω</text>
  </svg>`,

  'Unbalance': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="150" cy="70" rx="58" ry="16" fill="none" stroke="var(--c-bad)" stroke-width="1.2" stroke-dasharray="2,3"/>
    <circle cx="150" cy="70" r="45" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="145" y1="70" x2="155" y2="70" stroke="var(--c-text)" stroke-width="1.3"/>
    <line x1="150" y1="65" x2="150" y2="75" stroke="var(--c-text)" stroke-width="1.3"/>
    <line x1="150" y1="70" x2="180" y2="55" stroke="var(--c-amber)" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="168" y="58" font-size="11" fill="var(--c-amber)">e</text>
    <circle cx="180" cy="55" r="8" fill="var(--c-bad)"/>
    <text x="180" y="42" font-size="10" fill="var(--c-bad)" text-anchor="middle">كتلة زائدة</text>
  </svg>`,

  'Static & Dynamic Balance': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="60" width="120" height="16" rx="8" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <circle cx="32" cy="60" r="7" fill="var(--c-bad)"/>
    <circle cx="128" cy="76" r="7" fill="var(--c-bad)"/>
    <path d="M20,48 A20,20 0 0 0 32,32" stroke="var(--c-amber)" fill="none" stroke-width="1.3"/>
    <path d="M140,88 A20,20 0 0 0 128,104" stroke="var(--c-amber)" fill="none" stroke-width="1.3"/>
    <text x="80" y="108" font-size="10" fill="var(--c-text2)" text-anchor="middle">ساكن فقط — عزم غير متزن</text>
    <line x1="160" y1="20" x2="160" y2="122" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <rect x="180" y="60" width="120" height="16" rx="8" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <circle cx="192" cy="60" r="7" fill="var(--c-ok)"/>
    <circle cx="288" cy="60" r="7" fill="var(--c-ok)"/>
    <text x="240" y="108" font-size="10" fill="var(--c-text2)" text-anchor="middle">ساكن وديناميكي معًا</text>
  </svg>`,

  'Vector Polygon': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="30" y1="110" x2="300" y2="110" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <line x1="50" y1="110" x2="120" y2="80" stroke="var(--c-water)" stroke-width="2"/>
    <polygon points="120,80 114.2,86.8 111.1,79.5" fill="var(--c-water)"/>
    <line x1="120" y1="80" x2="170" y2="50" stroke="var(--c-water2)" stroke-width="2"/>
    <polygon points="170,50 165.2,57.6 161.1,50.7" fill="var(--c-water2)"/>
    <line x1="170" y1="50" x2="230" y2="90" stroke="var(--c-amber)" stroke-width="2"/>
    <polygon points="230,90 221.1,88.9 225.6,82.2" fill="var(--c-amber)"/>
    <line x1="50" y1="110" x2="230" y2="90" stroke="var(--c-bad)" stroke-width="2.3" stroke-dasharray="4,3"/>
    <polygon points="230,90 220.6,96.1 219.5,86.1" fill="var(--c-bad)"/>
    <circle cx="50" cy="110" r="2.5" fill="var(--c-text)"/>
    <text x="238" y="90" font-size="12" fill="var(--c-bad)">R</text>
  </svg>`,

  'Trial Mass': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="150" cy="70" r="45" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <line x1="150" y1="70" x2="195" y2="70" stroke="var(--c-text2)" stroke-width="1" stroke-dasharray="2,3"/>
    <path d="M195,70 A45,45 0 0 1 184.5,41.1" stroke="var(--c-amber)" fill="none" stroke-width="1.3"/>
    <text x="203" y="52" font-size="10" fill="var(--c-amber)">θt</text>
    <rect x="178" y="35" width="13" height="13" rx="2" fill="var(--c-badge)"/>
    <text x="200" y="34" font-size="10" fill="var(--c-text)">mt</text>
  </svg>`,

  'Influence Coefficient': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="60" cy="100" r="2.5" fill="var(--c-text)"/>
    <line x1="60" y1="100" x2="150" y2="50" stroke="var(--c-bad)" stroke-width="2.3"/>
    <polygon points="150,50 144.9,57.4 141.1,50.4" fill="var(--c-bad)"/>
    <text x="150" y="43" font-size="11" fill="var(--c-bad)">V0</text>
    <line x1="60" y1="100" x2="210" y2="90" stroke="var(--c-water)" stroke-width="2.3"/>
    <polygon points="210,90 202.3,94.5 201.8,86.5" fill="var(--c-water)"/>
    <text x="214" y="96" font-size="11" fill="var(--c-water)">V1</text>
    <line x1="150" y1="50" x2="210" y2="90" stroke="var(--c-amber)" stroke-width="2" stroke-dasharray="4,3"/>
    <polygon points="210,90 201.1,88.9 205.6,82.2" fill="var(--c-amber)"/>
    <text x="185" y="63" font-size="12" fill="var(--c-amber)">α·T</text>
  </svg>`,

  'Two-Plane Balancing': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="60" y="55" width="200" height="30" rx="15" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <line x1="90" y1="40" x2="90" y2="100" stroke="var(--c-water)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <circle cx="90" cy="55" r="6" fill="var(--c-water)"/>
    <text x="90" y="34" font-size="11" fill="var(--c-water)" text-anchor="middle">1</text>
    <line x1="230" y1="40" x2="230" y2="100" stroke="var(--c-water2)" stroke-width="1.3" stroke-dasharray="3,3"/>
    <circle cx="230" cy="85" r="6" fill="var(--c-water2)"/>
    <text x="230" y="108" font-size="11" fill="var(--c-water2)" text-anchor="middle">2</text>
    <path d="M90,35 C140,10 180,10 230,35" stroke="var(--c-amber)" fill="none" stroke-width="1.3" stroke-dasharray="2,3"/>
    <polygon points="230,35 221,32 223,40" fill="var(--c-amber)"/>
    <text x="160" y="14" font-size="10" fill="var(--c-amber)">α</text>
  </svg>`,

  'Primary Inertia Force': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="70" y="45" width="140" height="30" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <rect x="150" y="48" width="20" height="24" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="160" y1="60" x2="215" y2="80" stroke="var(--c-text2)" stroke-width="1.5"/>
    <circle cx="230" cy="60" r="25" fill="none" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="230" y1="60" x2="215" y2="80" stroke="var(--c-text2)" stroke-width="1.5"/>
    <circle cx="215" cy="80" r="4" fill="var(--c-text)"/>
    <line x1="130" y1="30" x2="180" y2="30" stroke="var(--c-bad)" stroke-width="2.3"/>
    <polygon points="130,30 137,26 137,34" fill="var(--c-bad)"/>
    <polygon points="180,30 173,26 173,34" fill="var(--c-bad)"/>
    <text x="155" y="22" font-size="11" fill="var(--c-bad)" text-anchor="middle">Fp</text>
    <path d="M245,15 Q265,2 285,15" stroke="var(--c-bad)" fill="none" stroke-width="1.5"/>
    <text x="265" y="112" font-size="10" fill="var(--c-text2)" text-anchor="middle">1×</text>
  </svg>`,

  'Secondary Inertia Force': `<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="70" y="45" width="140" height="30" fill="none" stroke="var(--c-text2)" stroke-width="2"/>
    <rect x="150" y="48" width="20" height="24" fill="none" stroke="var(--c-water)" stroke-width="2"/>
    <line x1="160" y1="60" x2="215" y2="80" stroke="var(--c-text2)" stroke-width="1.5"/>
    <circle cx="230" cy="60" r="25" fill="none" stroke="var(--c-text2)" stroke-width="1.3"/>
    <line x1="230" y1="60" x2="215" y2="80" stroke="var(--c-text2)" stroke-width="1.5"/>
    <circle cx="215" cy="80" r="4" fill="var(--c-text)"/>
    <line x1="138" y1="30" x2="172" y2="30" stroke="var(--c-badge)" stroke-width="1.8"/>
    <polygon points="138,30 143,27 143,33" fill="var(--c-badge)"/>
    <polygon points="172,30 167,27 167,33" fill="var(--c-badge)"/>
    <text x="155" y="22" font-size="11" fill="var(--c-badge)" text-anchor="middle">Fs</text>
    <path d="M245,15 Q253,4 261,15 Q269,26 277,15" stroke="var(--c-badge)" fill="none" stroke-width="1.5"/>
    <text x="265" y="112" font-size="10" fill="var(--c-text2)" text-anchor="middle">2×</text>
  </svg>`,
};
