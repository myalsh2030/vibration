// ثلاث طرق لقياس السعة: القمة، ومن قمة إلى قمة، والقيمة الفعّالة — على الموجة نفسها.
// النسب بينها ليست ثابتة: هي 1 : 2 : 0.707 على الجيبية فقط، وتنهار على النبضية —
// ومن هنا يولد «عامل القمة» الذي يكشف عيوب المحامل قبل أن ترتفع القراءة الفعّالة.
import { SimKit, label, arrow, withAlpha } from './simkit.js';
import { metrics, rng, gauss } from './vibkit.js';
import { CalcInput } from './labkit.js';

const N = 2048, WIN = 0.2, FS = N / WIN;   // 10240 عينة/ث على نافذة 200 ms
const CYC = 5;                              // خمس دورات كاملة داخل النافذة → RMS مضبوط
const AMAX = 8;                             // سقف السعة — مقياس الرسم ثابت عليه
const SHAPES = [
  { id: 'sine', label: 'جيبية' },
  { id: 'square', label: 'مربعة' },
  { id: 'spiky', label: 'نبضية' },
  { id: 'random', label: 'عشوائية' },
];

// موجة كل شكل — تُبنى عند التبديل لا كل إطار، وتُعاير كي تبلغ **القمة نفسها** A.
// توحيد القمة مقصود: عندئذٍ يكون كل فرق في الفعّالة وعامل القمة راجعًا إلى الشكل وحده.
function build(id, A) {
  const x = new Float64Array(N);
  if (id === 'sine' || id === 'square') {
    for (let i = 0; i < N; i++) {
      const s = Math.sin(2 * Math.PI * CYC * i / N);
      x[i] = id === 'square' ? Math.sign(s) || 1 : s;
    }
  } else if (id === 'spiky') {
    // خمس صدمات في النافذة، كل صدمة رنين مخمد — هذا ما يفعله عيب المحمل فعلًا
    const step = N / CYC, decay = 200, ring = 250;
    for (let b = 0; b < CYC; b++) {
      const s0 = Math.round(b * step);
      for (let i = 0; s0 + i < N && i < step; i++) {
        const t = i / FS;
        x[s0 + i] += Math.exp(-decay * t) * Math.sin(2 * Math.PI * ring * t);
      }
    }
  } else {
    const r = rng(20250811);
    for (let i = 0; i < N; i++) x[i] = gauss(r);
  }
  let mx = 1e-12;
  for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(x[i]));
  for (let i = 0; i < N; i++) x[i] *= A / mx;
  return x;
}

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.6 });
  const read = kit.readout();

  let shape = 'sine';
  let sig = null, m = null;
  let ratioMsg = '', ratioT = 0, pulse = 0;
  const done = new Set();

  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  const rebuild = () => {
    sig = build(shape, ampSl.value);
    m = metrics(sig);
    calc.reset(1.4142);
    if (shape === 'spiky' && m.crest > 3) complete('spiky-crest');
  };

  const shapeBtns = kit.buttons(SHAPES.map(s => ({
    label: s.label, onclick: () => { shape = s.id; paint(); rebuild(); },
  })));
  const paint = () => shapeBtns.forEach((b, i) => { b.className = `btn sm ${SHAPES[i].id === shape ? '' : 'secondary'}`; });
  paint();

  const ampSl = kit.slider({
    label: 'سعة الإشارة', min: 3, max: AMAX, step: 0.5, value: 5, unit: 'mm/s',
    fmt: v => v.toFixed(1), oninput: () => rebuild(),
  });

  const calc = new CalcInput(kit.controls, {
    label: 'اكتب ناتج: القمة ÷ الفعّالة', ref: 1.4142, placeholder: '؟',
    onResult: err => {
      if (shape !== 'sine') { ratioMsg = 'هذه النسبة تخص الموجة الجيبية — بدّل إليها'; ratioT = 3; return; }
      if (err <= 3) complete('rms-ratio');
    },
  });

  kit.buttons([{
    label: 'قارن: من قمة إلى قمة ÷ القمة', cls: 'ghost',
    onclick: () => {
      const r = m.peak > 1e-9 ? m.p2p / m.peak : 0;
      ratioMsg = `من قمة إلى قمة ÷ القمة = ${r.toFixed(3)}`;
      ratioT = 4;
      if ((shape === 'sine' || shape === 'square') && Math.abs(r - 2) <= 0.04) complete('p2p-double');
    },
  }]);

  rebuild();

  kit.loop((c, dt) => {
    const W = kit.W, H = kit.H;
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.2);
    if (ratioT > 0) ratioT = Math.max(0, ratioT - dt);

    const gx0 = 78, gx1 = W - 12, gw = Math.max(60, gx1 - gx0);
    const mid = H * 0.52, half = H * 0.34;
    const sc = half / AMAX;                      // مقياس ثابت: رفع السعة يرفع الموجة فعلًا
    const yv = v => mid - v * sc;

    // شبكة ومحور الصفر
    c.strokeStyle = withAlpha(kit.pal.text2, 0.14); c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = mid - half + (2 * half) * i / 4;
      c.beginPath(); c.moveTo(gx0, y); c.lineTo(gx1, y); c.stroke();
    }
    c.strokeStyle = withAlpha(kit.pal.text2, 0.5);
    c.beginPath(); c.moveTo(gx0, mid); c.lineTo(gx1, mid); c.stroke();
    label(c, 'صفر', gx0 - 6, mid, { size: 10.5, align: 'right' });

    // الموجة: عمود min/max لكل بكسل — دقيق وسريع مهما بلغت كثافة العينات
    c.strokeStyle = pulse > 0 ? kit.pal.ok : kit.pal.water;
    c.lineWidth = 1.3; c.beginPath();
    const cols = Math.round(gw);
    for (let p = 0; p < cols; p++) {
      const i0 = Math.floor(N * p / cols), i1 = Math.max(i0 + 1, Math.floor(N * (p + 1) / cols));
      let lo = Infinity, hi = -Infinity;
      for (let i = i0; i < i1; i++) { const v = sig[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
      const x = gx0 + p + 0.5;
      c.moveTo(x, yv(hi)); c.lineTo(x, yv(lo) + 0.6);
    }
    c.stroke();

    // ── خط الفعّالة RMS: أفقي عند ±RMS ──
    c.strokeStyle = kit.pal.ok; c.lineWidth = 1.6; c.setLineDash([6, 4]);
    for (const s of [1, -1]) { c.beginPath(); c.moveTo(gx0, yv(s * m.rms)); c.lineTo(gx1, yv(s * m.rms)); c.stroke(); }
    c.setLineDash([]);
    label(c, `الفعّالة RMS ${m.rms.toFixed(2)}`, gx1 - 4, yv(m.rms) - 10, { size: 11, color: kit.pal.ok, align: 'right' });

    // ── سهم القمة: من الصفر إلى القمة ──
    const xPk = gx0 + gw * 0.20;
    arrow(c, xPk, mid, xPk, yv(m.peak) + 2, { color: kit.pal.amber, width: 2, head: 6 });
    label(c, `القمة ${m.peak.toFixed(2)}`, 72, yv(m.peak / 2), { size: 11, color: kit.pal.amber, align: 'right' });

    // ── سهم من قمة إلى قمة: بين أعلى قيمة وأدناها ──
    const xP2 = gx0 + gw * 0.42, top = yv(m.peak), bot = yv(m.peak - m.p2p), cyM = (top + bot) / 2;
    arrow(c, xP2, cyM, xP2, top + 2, { color: kit.pal.badge, width: 2, head: 6 });
    arrow(c, xP2, cyM, xP2, bot - 2, { color: kit.pal.badge, width: 2, head: 6 });
    label(c, `من قمة إلى قمة ${m.p2p.toFixed(2)}`, 72, mid + 16, { size: 11, color: kit.pal.badge, align: 'right' });

    // رسالة علوية
    if (ratioT > 0) label(c, ratioMsg, W / 2, 12, { size: 12, color: kit.pal.amber, align: 'center' });
    else if (shape === 'spiky') label(c, 'الطاقة محشورة في صدمات قصيرة — الفعّالة صغيرة والقمة عالية', W / 2, 12, { size: 11.5, align: 'center' });
    else if (shape === 'sine') label(c, 'على الجيبية وحدها: القمة ÷ الفعّالة = 1.414', W / 2, 12, { size: 11.5, align: 'center' });

    read.set([
      { label: 'القمة', value: `${m.peak.toFixed(2)} mm/s`, color: kit.pal.amber },
      { label: 'من قمة لقمة', value: `${m.p2p.toFixed(2)} mm/s`, color: kit.pal.badge },
      { label: 'الفعّالة', value: `${m.rms.toFixed(2)} mm/s`, color: kit.pal.ok },
      { label: 'عامل القمة', value: m.crest.toFixed(2), color: m.crest > 3 ? kit.pal.bad : kit.pal.water },
    ]);
  });

  return { destroy() { kit.destroy(); } };
}
