// vibkit — محرّك الإشارة الاهتزازية: توليف موجة زمنية من نموذج عطل، وتحويل فورييه، والقياسات.
// وحدة حسابية خالصة: لا DOM ولا CSS ولا ألوان. تعمل في المتصفح وفي node (للاختبار).
//
// العقد الأساسي:
//   1) العطل يُوصف بمكوّنات (components) لا بأرقام نهائية — فالرقم يُشتق من الفيزياء لا يُكتب باليد.
//   2) الموجة المولَّدة هي **التسارع** بوحدة m/s². السرعة والإزاحة تُشتقان منها بالتكامل الترددي.
//   3) كل ما يراه المتدرب (RMS, Peak, Crest Factor, الطيف, حكم ISO) يُحسب من هذه الموجة نفسها،
//      فلا يمكن أن تتناقض شاشتان في المنصة.

// ═══════════════ مولّد عشوائي مبذور ═══════════════
// عطل الجلسة يُبذر برقم، فتتكرر الجلسة نفسها بالضبط عند إعادة المحاولة بالبذرة نفسها،
// وتختلف بين المتدربين — فلا يُحفظ الجواب.
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// ضجيج غاوسي من زوج موحّد (Box–Muller)
export function gauss(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ═══════════════ ترددات الآلة ═══════════════
export const G = 9.80665;          // m/s² لكل 1 g
export const shaftHz = rpm => rpm / 60;
export const rpmOf = hz => hz * 60;

// ترددات أعطال المحمل الدحروجي — الصيغ القياسية.
// b: {n عدد الكرات, bd قطر الكرة, pd قطر دائرة المراكز, phi زاوية التلامس بالدرجات}
export function bearingFreqs(b, rpm) {
  const S = shaftHz(rpm);
  const r = (b.bd / b.pd) * Math.cos((b.phi || 0) * Math.PI / 180);
  return {
    ftf: (S / 2) * (1 - r),                    // قفص الكرات
    bpfo: (b.n / 2) * S * (1 - r),             // مسار خارجي
    bpfi: (b.n / 2) * S * (1 + r),             // مسار داخلي
    bsf: (b.pd / (2 * b.bd)) * S * (1 - r * r),// دوران الكرة
  };
}

// ═══════════════ نماذج الأعطال ═══════════════
// كل عطل يُرجع مكوّنات جيبية ومساهمات ضجيج، بحسب الاتجاه (H أفقي / V رأسي / A محوري).
// وحدة المكوّن: 'v' = سعة قمة بالسرعة mm/s، 'a' = سعة قمة بالتسارع g.
// اخترنا mm/s للمكوّنات المتزامنة لأن فنّي الاهتزازات يفكّر بها، و g للمكوّنات عالية التردد.
//
// sev: شدة العطل 0..1 (0 = سليم، 1 = شديد).

const DIR = { H: 0, V: 1, A: 2 };

export const FAULTS = {
  // ── عدم الاتزان: 1× مهيمن، شعاعي، طور ثابت، محوري ضعيف ──
  unbalance: {
    label: 'عدم اتزان', term: 'Unbalance',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const base = 8.0 * sev;                       // mm/s قمة عند الشدة القصوى
      const g = dir === DIR.A ? 0.12 : (dir === DIR.V ? 0.80 : 1.0); // H > V >> A
      const ph = m.heavySpotDeg ?? 0;
      return [{ f: S, amp: base * g, unit: 'v', ph: ph + (dir === DIR.V ? 90 : 0) },
      { f: 2 * S, amp: base * g * 0.06, unit: 'v', ph: 2 * ph }];
    },
  },

  // ── عدم اصطفاف متوازٍ: 2× يعلو على 1×، شعاعي، وفرق طور 180° عبر القارنة ──
  misalignParallel: {
    label: 'عدم اصطفاف متوازٍ', term: 'Parallel Misalignment',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const base = 6.5 * sev;
      const g = dir === DIR.A ? 0.35 : 1.0;
      return [{ f: S, amp: base * g * 0.55, unit: 'v', ph: 40 },
      { f: 2 * S, amp: base * g, unit: 'v', ph: 220 },
      { f: 3 * S, amp: base * g * 0.30, unit: 'v', ph: 60 }];
    },
  },

  // ── عدم اصطفاف زاوي: 1× و2× **محوريان** عاليان — المحوري ≥ نصف الشعاعي ──
  misalignAngular: {
    label: 'عدم اصطفاف زاوي', term: 'Angular Misalignment',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const base = 6.0 * sev;
      const g = dir === DIR.A ? 1.0 : 0.42;         // المحوري هو السائد
      return [{ f: S, amp: base * g, unit: 'v', ph: 15 },
      { f: 2 * S, amp: base * g * 0.75, unit: 'v', ph: 195 },
      { f: 3 * S, amp: base * g * 0.25, unit: 'v', ph: 30 }];
    },
  },

  // ── رخاوة ميكانيكية: سلسلة توافقيات طويلة + نصف توافقيات + أرضية ضجيج مرتفعة، ورأسي سائد ──
  looseness: {
    label: 'رخاوة ميكانيكية', term: 'Mechanical Looseness',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const base = 5.0 * sev;
      const g = dir === DIR.V ? 1.0 : (dir === DIR.H ? 0.55 : 0.30);
      const out = [];
      for (let k = 1; k <= 8; k++)                    // 1×..8×
        out.push({ f: k * S, amp: base * g * Math.pow(0.78, k - 1), unit: 'v', ph: (k * 47) % 360 });
      for (const h of [0.5, 1.5, 2.5, 3.5])           // نصف توافقيات — بصمة الرخاوة
        out.push({ f: h * S, amp: base * g * 0.30 * Math.pow(0.8, h), unit: 'v', ph: (h * 133) % 360 });
      return out;
    },
    noise: (m, sev) => ({ from: 20, to: 2000, gRms: 0.05 * sev }),
  },

  // ── عمود منحنٍ: 1× محوري عالٍ (يشبه الزاوي لكن بلا 2×) ──
  bentShaft: {
    label: 'عمود منحنٍ', term: 'Bent Shaft',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const base = 5.5 * sev;
      const g = dir === DIR.A ? 1.0 : 0.65;
      return [{ f: S, amp: base * g, unit: 'v', ph: 10 },
      { f: 2 * S, amp: base * g * 0.18, unit: 'v', ph: 200 }];
    },
  },

  // ── عيب مسار خارجي ──
  // الآلية الحقيقية: كل مرور كرة فوق العيب يُحدث **صدمة** تُرنّ المحمل عند تردده الطبيعي.
  // فالنبضات هي المصدر، وسلسلة قمم BPFO في الطيف نتيجةٌ لها لا مصدرٌ مستقل.
  // (خلط الاثنين يرفع الطاقة الكلية فيهبط عامل القمة — وهو أهم مؤشر مبكر لعطل المحمل.)
  // العيب في المسار الخارجي ثابت داخل منطقة الحمل، فتعديل النبضات ضعيف وبتردد القفص.
  bearingOuter: {
    label: 'عيب المسار الخارجي', term: 'Outer Race Defect',
    comps(m, sev, dir, rand) {
      const bf = bearingFreqs(m.bearing, m.rpm);
      const base = 0.22 * sev;                       // g قمة — مكوّن القوة منخفض التردد فقط
      const g = dir === DIR.A ? 0.45 : 1.0;
      const out = [];
      for (let k = 1; k <= 4; k++) {
        const a = base * g * Math.pow(0.62, k - 1);
        out.push({ f: k * bf.bpfo, amp: a, unit: 'a', ph: (k * 71) % 360 });
        for (const s of [-1, 1])                     // جوانب تعديل بتردد القفص
          out.push({ f: k * bf.bpfo + s * bf.ftf, amp: a * 0.28, unit: 'a', ph: (k * 29) % 360 });
      }
      return out;
    },
    noise: (m, sev) => ({ from: 1200, to: 8000, gRms: 0.045 * sev }),
    impacts: (m, sev) => ({
      rateHz: bearingFreqs(m.bearing, m.rpm).bpfo, gPeak: 2.6 * sev,
      ringHz: m.bearing.resHz || 3200, decay: 1100,
      modHz: bearingFreqs(m.bearing, m.rpm).ftf, modDepth: 0.18,
    }),
  },

  // ── عيب مسار داخلي ──
  // العيب يدور مع العمود فيدخل منطقة الحمل ويخرج منها مرة كل دورة، فتتعدّل شدة النبضات
  // بتردد الدوران 1× — ومن هذا التعديل تولد الجوانب التي تميّز العيب الداخلي عن الخارجي.
  bearingInner: {
    label: 'عيب المسار الداخلي', term: 'Inner Race Defect',
    comps(m, sev, dir, rand) {
      const bf = bearingFreqs(m.bearing, m.rpm);
      const S = shaftHz(m.rpm);
      const base = 0.20 * sev;
      const g = dir === DIR.A ? 0.5 : 1.0;
      const out = [];
      for (let k = 1; k <= 3; k++) {
        const a = base * g * Math.pow(0.65, k - 1);
        out.push({ f: k * bf.bpfi, amp: a, unit: 'a', ph: (k * 53) % 360 });
        for (const s of [-2, -1, 1, 2])              // جوانب بمضاعفات 1×
          out.push({ f: k * bf.bpfi + s * S, amp: a * (Math.abs(s) === 1 ? 0.40 : 0.18), unit: 'a', ph: (k * 37) % 360 });
      }
      return out;
    },
    noise: (m, sev) => ({ from: 1200, to: 8000, gRms: 0.040 * sev }),
    impacts: (m, sev) => ({
      rateHz: bearingFreqs(m.bearing, m.rpm).bpfi, gPeak: 2.3 * sev,
      ringHz: m.bearing.resHz || 3200, decay: 1150,
      modHz: shaftHz(m.rpm), modDepth: 0.60,
    }),
  },

  // ── تكهّف: ضجيج عشوائي عريض النطاق بلا قمم منفصلة — البصمة الوحيدة التي «لا شكل لها» ──
  cavitation: {
    label: 'تكهّف', term: 'Cavitation',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const bp = (m.vanes || 6) * S;                 // تردد مرور الريش يعلو قليلًا مع التكهّف
      return [{ f: bp, amp: 0.30 * sev, unit: 'a', ph: 0 }];
    },
    noise: (m, sev) => ({ from: 600, to: 12000, gRms: 0.55 * sev }),
  },

  // ── رنين: تضخيم حاد لما يقع قرب التردد الطبيعي ──
  resonance: {
    label: 'رنين', term: 'Resonance',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const fn = m.natHz || 100;
      const Q = 6 + 14 * sev;                        // حدّة الرنين
      const out = [];
      for (let k = 1; k <= 3; k++) {                 // تضخيم توافقيات الدوران القريبة من fn
        const f = k * S;
        const r = f / fn;
        const mag = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / Q, 2));
        if (mag > 1.5) out.push({ f, amp: 0.9 * sev * mag, unit: 'v', ph: (k * 90) % 360 });
      }
      return out;
    },
  },

  // ── اختلال المكينة الترددية ──
  // هنا لا نخترع سعات: المحطة تحسب **قوى القصور المتبقية** بـbalancekit من هندسة الكرنك
  // وكتلة كل مكبس، وتضعها في m.recipResidual، ثم يحوّلها هذا النموذج إلى اهتزاز
  // بضربها في «المطاوعة» mobility (mm/s لكل نيوتن) — وهي خاصية تركيب الآلة على مساندها.
  // فإن كان التكوين رباعيًا متوازنًا اختفى 1× تلقائيًا وبقي 2×، وإن أُضيفت كتلة إلى مكبس
  // واحد عاد 1× — وهذا بالضبط ما تطلب الحقيبة أن يكتشفه المتدرب من الطيف.
  recipUnbalance: {
    label: 'اختلال مكينة ترددية', term: 'Reciprocating Unbalance',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const res = m.recipResidual || { fp: 0, fs: 0 };
      const mob = (m.mobility ?? 0.006) * sev;
      const g = dir === DIR.A ? 0.25 : (dir === DIR.V ? 1.0 : 0.70);  // الترددي يهتزّ رأسيًا أساسًا
      const p = res.fp * mob * g, s = res.fs * mob * g;
      return [
        { f: S, amp: p, unit: 'v', ph: 0 },
        { f: 2 * S, amp: s, unit: 'v', ph: 180 },
        { f: 3 * S, amp: p * 0.12, unit: 'v', ph: 60 },
        { f: 4 * S, amp: s * 0.10, unit: 'v', ph: 240 },
        { f: 0.5 * S, amp: (p + s) * 0.05, unit: 'v', ph: 15 },  // دورة الأشواط الأربعة
      ];
    },
    noise: (m, sev) => ({ from: 30, to: 3000, gRms: 0.03 * sev }),
  },

  // ── تردد مرور الريش/السنّ: ليس عطلًا بذاته، لكنه بصمة تُميّز المروحة والمضخة ──
  bladePass: {
    label: 'مرور الريش', term: 'Blade Pass',
    comps(m, sev, dir, rand) {
      const S = shaftHz(m.rpm);
      const nb = m.vanes || m.blades || 0;
      if (!nb) return [];
      const g = dir === DIR.A ? 0.6 : 1.0;
      return [{ f: nb * S, amp: 1.6 * sev * g, unit: 'v', ph: 120 },
      { f: 2 * nb * S, amp: 0.5 * sev * g, unit: 'v', ph: 240 }];
    },
  },
};

// ═══════════════ توليف الموجة ═══════════════
// m: مواصفة الآلة {rpm, bearing, vanes/blades, natHz, floorG}
// faults: [{ type: 'unbalance', sev: 0.6 }, ...]
// opts: { dir: 'H'|'V'|'A', fs, n, seed }
// المخرج: { a: Float64Array تسارع m/s², fs, n, dt }
export function synth(m, faults, { dir = 'H', fs = 25600, n = 8192, seed = 1 } = {}) {
  const d = DIR[dir] ?? 0;
  const rand = rng(seed + d * 7919);
  const a = new Float64Array(n);
  const dt = 1 / fs;

  const push = c => {
    const w = 2 * Math.PI * c.f;
    if (c.f <= 0 || c.f >= fs / 2) return;              // فوق نايكويست: يُهمل لا يُطوى
    // تحويل السعة إلى تسارع m/s² قمة
    const aPk = c.unit === 'a' ? c.amp * G : (c.amp / 1000) * w;
    const ph0 = (c.ph || 0) * Math.PI / 180;
    for (let i = 0; i < n; i++) a[i] += aPk * Math.sin(w * i * dt + ph0);
  };

  for (const f of faults) {
    const model = FAULTS[f.type];
    if (!model || !(f.sev > 0)) continue;
    (model.comps(m, f.sev, d, rand) || []).forEach(push);

    // ضجيج عريض النطاق ضمن مجال محدد
    if (model.noise) {
      const nz = model.noise(m, f.sev);
      if (nz && nz.gRms > 0) addBandNoise(a, fs, nz.from, nz.to, nz.gRms * G, rand);
    }
    // نبضات دورية (عيوب المحامل): رنين مخمد يتكرر بمعدل العيب — مصدر عامل القمة المرتفع
    if (model.impacts) {
      const im = model.impacts(m, f.sev);
      if (im && im.gPeak > 0) addImpacts(a, fs, im, rand, d === DIR.A ? 0.5 : 1);
    }
  }

  // أرضية ضجيج الآلة السليمة — لا توجد آلة صامتة تمامًا
  addBandNoise(a, fs, 10, fs / 2.2, (m.floorG ?? 0.02) * G, rand);
  return { a, fs, n, dt };
}

// ضجيج محصور في نطاق ترددي، معايَر ليعطي gRms المطلوب داخل النطاق
function addBandNoise(a, fs, f1, f2, rmsTarget, rand) {
  const n = a.length;
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = gauss(rand);
  fftInPlace(re, im, -1);
  const df = fs / n;
  for (let k = 0; k <= n / 2; k++) {
    const f = k * df;
    const keep = f >= f1 && f <= f2;
    const kk = k === 0 || k === n / 2 ? [k] : [k, n - k];
    for (const j of kk) { if (!keep) { re[j] = 0; im[j] = 0; } }
  }
  fftInPlace(re, im, +1);
  let s = 0; for (let i = 0; i < n; i++) s += re[i] * re[i];
  const cur = Math.sqrt(s / n);
  if (cur < 1e-12) return;
  const k = rmsTarget / cur;
  for (let i = 0; i < n; i++) a[i] += re[i] * k;
}

// نبضات صدمية دورية: كل نبضة رنين مخمد exp(-decay·t)·sin(2π·ringHz·t)
// modHz/modDepth: تعديل سعة النبضات — منه تولد الجوانب (sidebands) في الطيف.
//   عيب خارجي  → تعديل ضعيف بتردد القفص FTF.
//   عيب داخلي  → تعديل قوي بتردد الدوران 1× (العيب يدخل منطقة الحمل ويخرج كل دورة).
function addImpacts(a, fs, { rateHz, gPeak, ringHz, decay, modHz = 0, modDepth = 0 }, rand, gain) {
  const n = a.length, dt = 1 / fs;
  if (!(rateHz > 0)) return;
  const step = fs / rateHz;
  const pk = gPeak * G * gain;
  const ringLen = Math.min(n, Math.ceil(fs * 5 / decay));
  for (let start = rand() * step; start < n; start += step) {
    const jitter = 1 + (rand() - 0.5) * 0.04;         // تذبذب طفيف — نبضات مثالية تمامًا غير واقعية
    const s0 = Math.floor(start);
    const mod = modHz > 0 ? 1 + modDepth * Math.cos(2 * Math.PI * modHz * s0 * dt) : 1;
    const amp = pk * jitter * mod;
    for (let i = 0; i < ringLen && s0 + i < n; i++) {
      const t = i * dt;
      a[s0 + i] += amp * Math.exp(-decay * t) * Math.sin(2 * Math.PI * ringHz * t);
    }
  }
}

// ═══════════════ تحويل فورييه ═══════════════
// FFT مركّبة في المكان، radix-2. sign=-1 أمامية، sign=+1 عكسية (مع القسمة على n).
export function fftInPlace(re, im, sign = -1) {
  const n = re.length;
  if ((n & (n - 1)) !== 0) throw new Error('fft: الطول يجب أن يكون قوة للعدد 2');
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = sign * 2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const ur = re[i + k], ui = im[i + k];
        const xr = re[i + k + half], xi = im[i + k + half];
        const vr = xr * cr - xi * ci, vi = xr * ci + xi * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + half] = ur - vr; im[i + k + half] = ui - vi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
  if (sign > 0) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

// النوافذ — كل نافذة بمكسبها المتماسك (لتصحيح سعة القمة) ومكسبها للقدرة (لتصحيح RMS)
export const WINDOWS = {
  rect: { label: 'مستطيلة', term: 'Rectangular', w: () => 1, cg: 1, ng: 1 },
  hann: {
    label: 'هانّ', term: 'Hann',
    w: (i, N) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N), cg: 0.5, ng: 0.375,
  },
  hamming: {
    label: 'هامنغ', term: 'Hamming',
    w: (i, N) => 0.54 - 0.46 * Math.cos(2 * Math.PI * i / N), cg: 0.54, ng: 0.3974,
  },
  flattop: {
    label: 'مسطّحة القمة', term: 'Flat Top',
    w: (i, N) => {
      const x = 2 * Math.PI * i / N;
      return 0.21557895 - 0.41663158 * Math.cos(x) + 0.277263158 * Math.cos(2 * x)
        - 0.083578947 * Math.cos(3 * x) + 0.006947368 * Math.cos(4 * x);
    }, cg: 0.21557895, ng: 0.1554,
  },
};

// طيف السعة أحادي الجانب. المخرج بوحدة الإشارة الداخلة (قمة).
export function spectrum(x, fs, { win = 'hann' } = {}) {
  const n = x.length;
  const W = WINDOWS[win] || WINDOWS.hann;
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = x[i] * W.w(i, n);
  fftInPlace(re, im, -1);
  const half = n >> 1;
  const amp = new Float64Array(half);
  const df = fs / n;
  for (let k = 0; k < half; k++) {
    const mag = Math.hypot(re[k], im[k]);
    amp[k] = (k === 0 ? mag / n : 2 * mag / n) / W.cg;   // تصحيح النافذة → سعة قمة حقيقية
  }
  return { amp, df, n, fs, win };
}

// ── فقد التحديد (scalloping loss) ──
// تردد لا يقع في مركز خانة تمامًا تنقسم طاقته على خانتين، فتظهر قمته **أقل** من حقيقتها:
// حتى 15% مع نافذة هانّ. الجهاز الحقيقي يعاني هذا أيضًا، ولذلك تُستعمل النافذة المسطّحة
// حين يكون المطلوب دقة السعة لا دقة التردد. هنا نصحّحه رياضيًا كي لا يُعاقَب المتدرب
// على خطأ ليس خطأه حين يقرأ سعة قمة من الطيف.
const LOBE = {
  rect: d => Math.abs(sinc(d)),
  hann: d => Math.abs(sinc(d) / (1 - d * d)),
  hamming: d => Math.abs(0.54 * sinc(d) + 0.23 * (sinc(d - 1) + sinc(d + 1))) / 0.54,
  flattop: () => 1,                                    // فقدها أقل من 0.01 dB — لا يُصحَّح
};
function sinc(d) { return Math.abs(d) < 1e-9 ? 1 : Math.sin(Math.PI * d) / (Math.PI * d); }

// تقدير إزاحة القمة عن مركز الخانة. لنافذة هانّ توجد علاقة **مضبوطة** لنغمة مفردة،
// فلا نكتفي بالاستيفاء القطعي التقريبي: d = 2(y₃ − y₁) / (y₁ + 2y₂ + y₃)
const OFFSET = {
  hann: (y1, y2, y3) => 2 * (y3 - y1) / (y1 + 2 * y2 + y3 || 1e-15),
  _parabolic: (y1, y2, y3) => {
    const den = y1 - 2 * y2 + y3;
    return Math.abs(den) < 1e-15 ? 0 : 0.5 * (y1 - y3) / den;
  },
};

// تصحيح قمة عند الخانة k: يُرجع {f, amp} بالتردد والسعة الحقيقيين
function refinePeak(spec, k) {
  const a = spec.amp;
  if (k <= 0 || k >= a.length - 1) return { f: k * spec.df, amp: a[k], bin: k, offset: 0 };
  const y1 = a[k - 1], y2 = a[k], y3 = a[k + 1];
  let d = (OFFSET[spec.win] || OFFSET._parabolic)(y1, y2, y3);
  if (!isFinite(d) || Math.abs(d) > 0.5) d = 0;
  const lobe = (LOBE[spec.win] || LOBE.hann)(d);
  return { f: (k + d) * spec.df, amp: lobe > 0.2 ? y2 / lobe : y2, bin: k, offset: d };
}

// تكامل ترددي: تسارع m/s² → سرعة mm/s (times=1) أو إزاحة µm (times=2).
// hpHz: قطع ترددي أسفل منه يُصفّر — بديله في الأجهزة الحقيقية مرشّح تمرير عالٍ،
// وبدونه ينفجر التكامل عند الترددات الدنيا (قسمة على ω→0).
export function integrateWave(x, fs, times = 1, hpHz = 2) {
  const n = x.length;
  const re = new Float64Array(x), im = new Float64Array(n);
  fftInPlace(re, im, -1);
  const df = fs / n;
  const half = n >> 1;
  re[0] = im[0] = 0;
  re[half] = im[half] = 0;
  for (let k = 1; k < half; k++) {
    const f = k * df;
    for (const [j, sgn] of [[k, 1], [n - k, -1]]) {
      if (f < hpHz) { re[j] = 0; im[j] = 0; continue; }
      const w = sgn * 2 * Math.PI * f;
      let r = re[j], i2 = im[j];
      for (let t = 0; t < times; t++) {                  // القسمة على (i·ω)
        const nr = i2 / w, ni = -r / w;
        r = nr; i2 = ni;
      }
      re[j] = r; im[j] = i2;
    }
  }
  fftInPlace(re, im, +1);
  const scale = times === 1 ? 1000 : 1e6;                // m/s→mm/s ، m→µm
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = re[i] * scale;
  return out;
}

// مرشّح تمرير منخفض في المجال الترددي — يحاكي أثرين حقيقيين معًا:
//   1) مرشّح مانع الطيّ في الجهاز عند سقف النطاق المختار.
//   2) سقف تردد طريقة التثبيت: المسبار اليدوي يقطع كل ما فوق 1 kHz تقريبًا،
//      فيُخفي عيب المحمل تمامًا. هذا ليس تفصيلًا تجميليًا — هو أشيع خطأ ميداني.
export function lowpass(x, fs, fc, { rolloff = 0.15 } = {}) {
  const n = x.length;
  const re = new Float64Array(x), im = new Float64Array(n);
  fftInPlace(re, im, -1);
  const df = fs / n, half = n >> 1;
  for (let k = 0; k <= half; k++) {
    const f = k * df;
    let g = 1;
    if (f > fc) g = Math.max(0, 1 - (f - fc) / (fc * rolloff));   // انحدار تدريجي لا قطع حاد
    if (g >= 1) continue;
    for (const j of (k === 0 || k === half ? [k] : [k, n - k])) { re[j] *= g; im[j] *= g; }
  }
  fftInPlace(re, im, +1);
  return re;
}

// ═══════════════ القياسات ═══════════════
export function metrics(x) {
  let s = 0, pos = -Infinity, neg = Infinity, pk = 0, mean = 0;
  for (let i = 0; i < x.length; i++) mean += x[i];
  mean /= x.length;
  for (let i = 0; i < x.length; i++) {
    const v = x[i] - mean;
    s += v * v;
    if (v > pos) pos = v;
    if (v < neg) neg = v;
    const av = Math.abs(v); if (av > pk) pk = av;
  }
  const rms = Math.sqrt(s / x.length);
  return { rms, peak: pk, p2p: pos - neg, crest: rms > 1e-12 ? pk / rms : 0, mean };
}

// RMS محصور في نطاق ترددي، محسوب من الطيف (بارسيفال) — هذا ما يقيسه الجهاز فعلًا
// عندما تختار «10–1000 Hz» كما يفرض ISO.
export function bandRms(spec, f1, f2) {
  let s = 0;
  for (let k = 1; k < spec.amp.length; k++) {
    const f = k * spec.df;
    if (f < f1 || f > f2) continue;
    s += (spec.amp[k] / Math.SQRT2) ** 2;               // قمة → فعّالة لكل مكوّن
  }
  return Math.sqrt(s);
}

// أعلى القمم في الطيف: للتشخيص وللمهام «حدّد القمة المهيمنة»
export function topPeaks(spec, { count = 8, fMin = 2, fMax = Infinity, minRel = 0.02 } = {}) {
  const { amp, df } = spec;
  let max = 0;
  for (let k = 1; k < amp.length; k++) { const f = k * df; if (f >= fMin && f <= fMax && amp[k] > max) max = amp[k]; }
  const out = [];
  for (let k = 2; k < amp.length - 1; k++) {
    const f = k * df;
    if (f < fMin || f > fMax) continue;
    if (amp[k] <= amp[k - 1] || amp[k] < amp[k + 1]) continue;   // قمة محلية
    if (amp[k] < minRel * max) continue;
    out.push(refinePeak(spec, k));
  }
  out.sort((p, q) => q.amp - p.amp);
  return out.slice(0, count);
}

// سعة مكوّن عند تردد محدد (بالبحث في نافذة ±tol) — لقراءة 1× و2× بدقة
export function ampAt(spec, f, tolHz) {
  const tol = tolHz ?? Math.max(2 * spec.df, f * 0.02);
  const k0 = Math.max(1, Math.round((f - tol) / spec.df));
  const k1 = Math.min(spec.amp.length - 2, Math.round((f + tol) / spec.df));
  let bk = k0, best = -1;
  for (let k = k0; k <= k1; k++) if (spec.amp[k] > best) { best = spec.amp[k]; bk = k; }
  return refinePeak(spec, bk);
}

// ═══════════════ طيف المغلّف (كشف المغلّف) ═══════════════
// الأداة المهنية لكشف عيوب المحامل مبكرًا: النبضات تُرنّ المحمل عند ترددٍ عالٍ (2–5 kHz)،
// فتظهر طاقتها هناك لا عند BPFO. نُمرّر النطاق حول الرنين، ثم نأخذ **مغلّف** الإشارة
// (مقدار الإشارة التحليلية عبر تحويل هيلبرت)، فيظهر معدّل تكرار النبضات — أي BPFO — واضحًا
// في طيف المغلّف رغم أنه شبه مختفٍ في الطيف العادي. هذه هي النقلة من «القياس» إلى «التشخيص».
export function envelope(x, fs, { fLow = 1000, fHigh = 10000 } = {}) {
  const n = x.length;
  const re = new Float64Array(x), im = new Float64Array(n);
  fftInPlace(re, im, -1);
  const df = fs / n, half = n >> 1;
  // تمرير نطاقي + بناء الإشارة التحليلية معًا: نُصفّر الترددات السالبة ونُضاعف الموجبة
  for (let k = 0; k < n; k++) {
    const f = k <= half ? k * df : (n - k) * df;
    const keep = k > 0 && k < half && f >= fLow && f <= fHigh;
    if (!keep) { re[k] = 0; im[k] = 0; }
    else { re[k] *= 2; im[k] *= 2; }
  }
  fftInPlace(re, im, +1);
  const env = new Float64Array(n);
  let mean = 0;
  for (let i = 0; i < n; i++) { env[i] = Math.hypot(re[i], im[i]); mean += env[i]; }
  mean /= n;
  for (let i = 0; i < n; i++) env[i] -= mean;          // إزالة المركّب الثابت
  return env;
}

// ═══════════════ الطور ═══════════════
// الطور عند تردد الدوران بالنسبة لنبضة مرجع (tacho) — أساس كل عمليات الاتزان.
// يُقاس بالكشف المتزامن (ضرب في جيب وجيب تمام ثم تكامل) كما تفعل الأجهزة فعلًا.
export function phaseAt(x, fs, f) {
  const n = x.length, w = 2 * Math.PI * f / fs;
  let sr = 0, si = 0;
  for (let i = 0; i < n; i++) {
    const win = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n);
    sr += x[i] * win * Math.cos(w * i);
    si += x[i] * win * Math.sin(w * i);
  }
  const amp = 2 * Math.hypot(sr, si) / (n * 0.5);
  // اصطلاح الطور: الإشارة x = A·sin(ωt + φ)، فـ Σx·cos ∝ sin φ و Σx·sin ∝ cos φ،
  // ومن ثمّ φ = atan2(الأول، الثاني). (عكس الترتيب يعطي 90° − φ — خطأ يقلب كل حسابات الاتزان.)
  let deg = Math.atan2(sr, si) * 180 / Math.PI;
  if (deg < 0) deg += 360;
  return { amp, deg };
}
