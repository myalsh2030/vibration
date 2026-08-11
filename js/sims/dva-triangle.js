// الإزاحة والسرعة والتسارع — اهتزاز واحد بثلاث عيون: الكمية التي تختارها تُظهر العطل أو تُخفيه.
// العلاقات المحسوبة هنا (ولا تُعرض اشتقاقاتها): ω = 2πf ، v = a ÷ ω ، d = v ÷ ω.
// العتبات: عتبة السرعة من ISO 10816، وعتبتا الإزاحة والتسارع مشتقّتان منها عند حدّي المجال 10 و1000 هرتز،
// فتتقاطع المنحنيات الثلاثة عند الحدّين بالضبط — وهنا يظهر لماذا لكل مجال كميته.
import { SimKit, label, withAlpha } from './simkit.js';
import { el } from '../ui.js';

const V_REF = 4.5;                                     // mm/s — عتبة السرعة المعتبرة (ISO 10816)
const F_LO = 10, F_HI = 1000;                          // حدّا مجال حكم السرعة
const D_REF = 1000 * V_REF / (2 * Math.PI * F_LO);     // µm ≈ 71.6
const A_REF = 2 * Math.PI * F_HI * V_REF / 1000;       // m/s² ≈ 28.3
const F_MIN = 2, F_MAX = 5000;
const LG = Math.log10, L0 = LG(F_MIN), L1 = LG(F_MAX);
const IDS = ['low-freq-disp', 'high-freq-acc', 'velocity-flat'];

const quantities = (f, V) => {                          // V: سعة السرعة mm/s
  const w = 2 * Math.PI * f;
  return { d: 1000 * V / w, v: V, a: w * V / 1000 };
};
const fmtQ = x => x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x >= 0.01 ? x.toFixed(2) : x.toExponential(1);
const fmtF = f => f < 10 ? f.toFixed(2) : f < 100 ? f.toFixed(1) : String(Math.round(f));
const pos = N => Math.max(0, Math.min(1, 0.5 + LG(Math.max(N, 1e-6)) / 4));  // ×0.01 → ×100 على المحور

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.95 });
  const read = kit.readout();

  const done = new Set(IDS.filter(i => ctx.isMissionDone?.(i)));
  const complete = id => { if (done.has(id)) return; done.add(id); ctx.completeMission(id); showCard(); };

  let visits = [], dwell = 0, lastF = 0, holdLo = 0, holdHi = 0, note = '';

  const fSl = kit.slider({
    label: 'التردد', min: L0, max: L1, step: 0.002, value: LG(50), unit: 'Hz',
    fmt: v => fmtF(10 ** v),                            // المنزلق لوغاريتمي: قيمته أُسّ العشرة
  });
  const aSl = kit.slider({ label: 'شدة الاهتزاز', min: 0.2, max: 20, step: 0.05, value: 6, unit: 'mm/s', fmt: v => v.toFixed(2) });
  kit.buttons([{
    label: 'أعد الضبط', cls: 'ghost',
    onclick: () => { fSl.set(LG(50)); aSl.set(6); visits = []; note = ''; },
  }]);

  const card = el('div', { class: 'card small', style: 'display:none; margin-top:12px; border-right:3px solid var(--c-ok)' },
    el('div', { style: 'font-weight:800; color:var(--c-ok); margin-bottom:6px' }, 'لماذا يحكم معيار ISO بالسرعة تحديدًا؟'),
    el('div', {}, 'لأن السرعة هي الكمية الوحيدة التي تعطي وزنًا متوازنًا عبر مجال أعطال الآلات الدوّارة ',
      el('span', { class: 'ltr' }, '10–1000 Hz'), ': قراءتها لا تتضخم في الطرف المنخفض ولا تتلاشى في المرتفع.'),
    el('div', { style: 'margin-top:4px' }, 'الإزاحة تصرخ تحت ', el('span', { class: 'ltr' }, '10 Hz'),
      ' وتصمت فوقها، والتسارع يصرخ فوق ', el('span', { class: 'ltr' }, '1000 Hz'), ' ويصمت تحتها.'),
    el('div', { class: 'muted', style: 'margin-top:6px' }, 'فالكمية ليست ذوقًا — هي اختيار يُظهر العطل أو يدفنه.'),
  );
  kit.controls.append(card);
  const showCard = () => { if (IDS.every(i => done.has(i))) card.style.display = ''; };
  showCard();

  kit.loop((c, dt) => {
    const W = kit.W, H = kit.H;
    const f = 10 ** fSl.value, V = aSl.value;
    const q = quantities(f, V);
    const N = { d: q.d / D_REF, v: q.v / V_REF, a: q.a / A_REF };

    // ═════ المهام ═════
    holdLo = (f >= 4.5 && f <= 5.5 && N.d >= 1 && N.v < 1 && N.a < 1) ? holdLo + dt : 0;
    holdHi = (f >= 1800 && f <= 2200 && N.a >= 1 && N.v < 1 && N.d < 1) ? holdHi + dt : 0;
    if (holdLo > 0.4) complete('low-freq-disp');
    if (holdHi > 0.4) complete('high-freq-acc');
    if (f >= F_LO && f <= F_HI) {
      dwell = Math.abs(LG(f) - LG(lastF || f)) < 0.02 ? dwell + dt : 0;
      if (dwell > 0.6 && visits.every(p => Math.abs(LG(f / p.f)) > 0.47)) { visits.push({ f, v: q.v, d: q.d }); dwell = 0; note = ''; }
    } else dwell = 0;
    lastF = f;
    if (visits.length >= 3 && !done.has('velocity-flat')) {
      const vs = visits.map(p => p.v);
      if (Math.max(...vs) / Math.min(...vs) <= 1.15) complete('velocity-flat');
      else { visits = []; note = 'ثبّت شدة الاهتزاز أثناء تنقّلك بين الترددات'; }
    }

    // ═════ المقاييس الثلاثة ═════
    const rg = Math.min(W * 0.135, H * 0.16), gy = 10 + rg;
    const items = [
      { k: 'd', name: 'الإزاحة', val: q.d, unit: 'µm', n: N.d, col: kit.pal.badge },
      { k: 'v', name: 'السرعة', val: q.v, unit: 'mm/s', n: N.v, col: kit.pal.water },
      { k: 'a', name: 'التسارع', val: q.a, unit: 'm/s²', n: N.a, col: kit.pal.amber },
    ];
    items.forEach((it, i) => {
      const cx = W * (0.5 + (i - 1) * 0.315);
      gauge(c, kit.pal, cx, gy, rg, it, kit.pal.bad);
      label(c, it.name, cx, gy + rg * 0.62, { size: 12, align: 'center', color: kit.pal.text2 });
      label(c, `${fmtQ(it.val)} ${it.unit}`, cx, gy + rg + 12, { size: 13, align: 'center', color: it.col, weight: 800 });
    });

    // ═════ مخطط المقارنة: أيّها يصرخ وأيّها صامت ═════
    const bT = gy + rg + 30, bL = 54, bW = W - bL - 46;
    label(c, 'كل عمود = القراءة ÷ عتبتها المعتبرة', W - 8, bT - 6, { size: 11, color: kit.pal.text2 });
    items.forEach((it, i) => {
      const y = bT + 8 + i * 20;
      c.fillStyle = withAlpha(kit.pal.text2, 0.12);
      c.fillRect(bL, y, bW, 13);
      c.fillStyle = withAlpha(it.n >= 1 ? kit.pal.bad : it.col, it.n >= 1 ? 0.9 : 0.55);
      c.fillRect(bL, y, Math.max(2, bW * pos(it.n)), 13);
      label(c, it.name, bL - 6, y + 7, { size: 11, color: kit.pal.text2 });
      label(c, it.n >= 1 ? `×${fmtQ(it.n)} فوق العتبة` : `×${fmtQ(it.n)}`, bL + bW + 4, y + 7,
        { size: 10.5, align: 'left', color: it.n >= 1 ? kit.pal.bad : kit.pal.text2 });
    });
    c.strokeStyle = kit.pal.ok; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(bL + bW * 0.5, bT + 2); c.lineTo(bL + bW * 0.5, bT + 8 + 3 * 20); c.stroke();
    label(c, 'العتبة', bL + bW * 0.5, bT + 2, { size: 10, align: 'center', color: kit.pal.ok });

    // ═════ المنحنى المرجعي: الكميات الثلاث مقابل التردد ═════
    const P = { l: 40, r: 12, t: bT + 8 + 3 * 20 + 24, b: H - 18 };
    const gw = W - P.l - P.r, gh = P.b - P.t;
    const xOf = fr => P.l + gw * (LG(fr) - L0) / (L1 - L0);
    const nd = fr => 1000 * V / (2 * Math.PI * fr) / D_REF;
    const na = fr => 2 * Math.PI * fr * V / 1000 / A_REF;
    const yTop = LG(Math.max(nd(F_MIN), na(F_MAX), N.v)) + 0.25;
    const yBot = LG(Math.min(nd(F_MAX), na(F_MIN))) - 0.15;
    const yOf = n => P.b - gh * (LG(Math.max(n, 1e-9)) - yBot) / (yTop - yBot);

    const zones = [                                     // مناطق الحكم الثلاث
      [F_MIN, F_LO, kit.pal.badge, 'الإزاحة'],
      [F_LO, F_HI, kit.pal.water, 'السرعة — مجال حكم ISO'],
      [F_HI, F_MAX, kit.pal.amber, 'التسارع'],
    ];
    for (const [z0, z1, col, name] of zones) {
      c.fillStyle = withAlpha(col, 0.12);
      c.fillRect(xOf(z0), P.t, xOf(z1) - xOf(z0), gh);
      label(c, name, (xOf(z0) + xOf(z1)) / 2, P.t + 9, { size: 10.5, align: 'center', color: col });
    }
    c.strokeStyle = withAlpha(kit.pal.ok, 0.7); c.lineWidth = 1;
    c.save(); c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(P.l, yOf(1)); c.lineTo(P.l + gw, yOf(1)); c.stroke(); c.restore();
    label(c, 'العتبة', P.l - 4, yOf(1), { size: 10, color: kit.pal.ok });

    for (const [fn2, col] of [[nd, kit.pal.badge], [na, kit.pal.amber]]) {
      c.beginPath();
      for (let i = 0; i <= 90; i++) {
        const fr = 10 ** (L0 + (L1 - L0) * i / 90);
        i ? c.lineTo(xOf(fr), yOf(fn2(fr))) : c.moveTo(xOf(fr), yOf(fn2(fr)));
      }
      c.strokeStyle = col; c.lineWidth = 2; c.stroke();
    }
    c.beginPath(); c.moveTo(P.l, yOf(N.v)); c.lineTo(P.l + gw, yOf(N.v));
    c.strokeStyle = kit.pal.water; c.lineWidth = 2.4; c.stroke();

    c.save(); c.setLineDash([2, 3]); c.strokeStyle = withAlpha(kit.pal.text, 0.6); c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(xOf(f), P.t); c.lineTo(xOf(f), P.b); c.stroke(); c.restore();
    for (const it of items) { c.beginPath(); c.arc(xOf(f), yOf(it.n), 3.6, 0, Math.PI * 2); c.fillStyle = it.col; c.fill(); }
    for (const p of visits) {
      c.fillStyle = kit.pal.ok;
      c.fillRect(xOf(p.f) - 1, P.b - 6, 2, 6);
    }
    for (const tk of [2, 10, 100, 1000, 5000])
      label(c, String(tk), xOf(tk), P.b + 9, { size: 10, align: 'center', color: kit.pal.text2 });

    const hint = note || (visits.length && !done.has('velocity-flat')
      ? `ترددات مسجّلة داخل مجال ISO: ${visits.length} من 3` : '');
    if (hint) label(c, hint, W / 2, P.t - 8, { size: 11, align: 'center', color: note ? kit.pal.bad : kit.pal.ok });

    read.set([
      { label: 'التردد', value: `${fmtF(f)} Hz`, color: kit.pal.text2 },
      { label: 'الإزاحة', value: `${fmtQ(q.d)} µm`, color: kit.pal.badge },
      { label: 'السرعة', value: `${fmtQ(q.v)} mm/s`, color: kit.pal.water },
      { label: 'التسارع', value: `${fmtQ(q.a)} m/s²`, color: kit.pal.amber },
      { label: 'الأعلى نسبةً', value: N.d >= N.v && N.d >= N.a ? 'd' : N.a >= N.v ? 'a' : 'v', color: kit.pal.ok },
    ]);
  });

  return { destroy() { kit.destroy(); } };
}

// مقياس قوسي لوغاريتمي: منتصف القوس = العتبة، فما تجاوزها صار «صراخًا»
function gauge(c, pal, cx, cy, r, it, hotCol) {
  const A0 = Math.PI * 0.75, SW = Math.PI * 1.5;
  const hot = it.n >= 1;
  c.save();
  c.lineCap = 'round';
  c.beginPath(); c.arc(cx, cy, r, A0, A0 + SW);
  c.strokeStyle = withAlpha(pal.text2, 0.22); c.lineWidth = r * 0.20; c.stroke();
  c.beginPath(); c.arc(cx, cy, r, A0, A0 + SW * pos(it.n));
  c.strokeStyle = hot ? hotCol : it.col; c.lineWidth = r * 0.20; c.stroke();

  c.beginPath();                                        // علامة العتبة عند المنتصف
  const am = A0 + SW * 0.5;
  c.moveTo(cx + Math.cos(am) * r * 0.82, cy + Math.sin(am) * r * 0.82);
  c.lineTo(cx + Math.cos(am) * r * 1.14, cy + Math.sin(am) * r * 1.14);
  c.strokeStyle = pal.ok; c.lineWidth = 2; c.stroke();

  const a = A0 + SW * pos(it.n);                        // المؤشّر
  c.beginPath();
  c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78);
  c.strokeStyle = hot ? hotCol : pal.text; c.lineWidth = 2.4; c.stroke();
  c.beginPath(); c.arc(cx, cy, r * 0.11, 0, Math.PI * 2);
  c.fillStyle = hot ? hotCol : pal.text2; c.fill();
  c.restore();
}
