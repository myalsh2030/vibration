// اللواقط الثلاثة — لكل لاقط مجال يجيده ومجال يعمى عنه.
// الفكرة المحورية: المجال الترددي ليس مواصفة على الورق، بل هو الذي يقرّر
// هل يرى اللاقط العطل أم لا. ولذلك نضع تردد كل حالة على المحور نفسه
// أمام أشرطة المجالات — فيُرى الجواب قبل أن يُقال.
import { SimKit, label, arrow, withAlpha } from './simkit.js';
import { Scope } from './scope.js';
import { synth, spectrum, integrateWave, lowpass, ampAt } from './vibkit.js';
import { MACHINES } from './machines.js';
import { el } from '../ui.js';

const FS = 25600, N = 8192;
const AX0 = 1, AX1 = 20000;                       // حدود محور التردد اللوغاريتمي

// المجالات من كتالوجات اللواقط الصناعية الشائعة
const SENSORS = [
  {
    id: 'disp', label: 'لاقط الإزاحة', term: 'Eddy Current Probe', unit: 'µm', pal: 'water',
    f0: 0, f1: 1000, reads: 'حركة العمود داخل المحمل',
    note: 'تيار دوامي بلا تلامس، مثبّت في غطاء المحمل الانزلاقي ويرصد العمود مباشرة.',
  },
  {
    id: 'vel', label: 'لاقط السرعة', term: 'Velocity Pickup', unit: 'mm/s', pal: 'ok',
    f0: 10, f1: 2000, reads: 'حركة الغلاف',
    note: 'ملف متحرك داخل مغناطيس — قراءته متوازنة في مجال حكم ISO.',
  },
  {
    id: 'acc', label: 'لاقط التسارع', term: 'Accelerometer', unit: 'm/s²', pal: 'amber',
    f0: 1, f1: 15000, reads: 'حركة الغلاف',
    note: 'بلورة كهروضغطية على الغلاف — وحده يبلغ ترددات رنين المحامل.',
  },
];

// الحالات الثلاث: لكل حالة تردّدها الحاسم واللاقط الذي يجب أن يُختار
const CASES = [
  {
    id: 'journal', label: 'حركة عمود داخل محمل انزلاقي', fKey: 50, best: 'disp', shaft: true,
    build: () => [MACHINES.turbine, [{ type: 'unbalance', sev: 0.55 }]],
  },
  {
    id: 'general', label: 'اهتزاز عام لمضخة', fKey: 49.2, best: 'vel', shaft: false,
    build: () => [MACHINES.pump, [{ type: 'unbalance', sev: 0.5 }, { type: 'misalignParallel', sev: 0.45 }]],
  },
  {
    id: 'brg4k', label: 'عيب محمل دحروجي عند 4000 Hz',
    html: 'عيب محمل دحروجي عند <span class="ltr">4000 Hz</span>', fKey: 4000, best: 'acc', shaft: false,
    build: () => [{ ...MACHINES.pump, bearing: { ...MACHINES.pump.bearing, resHz: 4000 } },
      [{ type: 'bearingOuter', sev: 0.75 }]],
  },
];

// في المحمل الانزلاقي يفصل غشاء الزيت العمودَ عن الغلاف، فلا يصل إلى الغلاف
// إلا جزء يسير من حركة العمود — ولهذا لا يغني لاقط التسارع عن لاقط الإزاحة.
const OIL_FILM = 0.06;

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.66 });
  const read = kit.readout();
  const scope = new Scope(kit.controls, { height: 150 });

  let ci = 0, si = 1, compare = false, pulse = 0;
  const done = new Set();
  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  // ── الحساب المكلف مرة واحدة لكل تركيبة، ثم يُخزَّن ──
  const rawCache = new Map(), viewCache = new Map();
  const raw = c => {
    if (!rawCache.has(c.id)) {
      const [m, faults] = c.build();
      rawCache.set(c.id, synth(m, faults, { dir: 'H', fs: FS, n: N, seed: 41 }).a);
    }
    return rawCache.get(c.id);
  };
  const view = (c, s) => {
    const key = `${c.id}|${s.id}`;
    if (viewCache.has(key)) return viewCache.get(key);
    let a = raw(c);
    if (c.shaft && s.id !== 'disp') a = a.map(v => v * OIL_FILM);   // ما يعبر غشاء الزيت
    const band = lowpass(a, FS, s.f1);
    const x = s.id === 'disp' ? integrateWave(band, FS, 2, 4)
      : s.id === 'vel' ? integrateWave(band, FS, 1, s.f0) : band;
    const spec = spectrum(x, FS, { win: 'hann' });
    const inBand = c.fKey >= s.f0 && c.fKey <= s.f1;
    const out = { x, spec, inBand, peak: ampAt(spec, c.fKey, Math.max(6, c.fKey * 0.03)).amp };
    viewCache.set(key, out);
    return out;
  };

  // ── أشرطة الاختيار ──
  const caseBtns = kit.buttons(CASES.map((c, i) => ({
    label: c.label, onclick: () => { ci = i; refresh(); },
  })));
  // الأرقام اللاتينية داخل نص عربي تُعزل، وإلا انقلب ترتيبها أمام المتدرب
  caseBtns.forEach((b, i) => { if (CASES[i].html) b.innerHTML = CASES[i].html; });
  const sensBtns = kit.buttons(SENSORS.map((s, i) => ({
    label: s.label, onclick: () => { si = i; refresh(); },
  })));
  kit.buttons([{
    label: 'قارن المجالات الثلاثة', cls: 'ghost',
    onclick: () => { compare = !compare; refresh(); },
  }]);

  // أزرار الحكم في وضع المقارنة
  const widestRow = el('div', { class: 'sim-btns', style: 'display:none' },
    el('span', { class: 'chip' }, 'أيّها يغطي أوسع مدى؟'),
    ...SENSORS.map(s => el('button', {
      class: 'btn sm secondary',
      onclick: () => { if (s.id === 'acc') { complete('range-compare'); } refresh(s.id === 'acc' ? '' : 'خطأ: قارن حدّي كل شريط على المحور'); },
    }, s.label)));
  kit.controls.append(widestRow);

  // ── بطاقة الفرق الجوهري ──
  kit.controls.append(el('div', { class: 'card' },
    el('div', { style: 'font-weight:800; color:var(--c-amber); margin-bottom:6px' }, 'الفرق الجوهري — لا يُختصر بمجال التردد'),
    el('div', { class: 'small' },
      'لاقط الإزاحة يقيس ', el('b', {}, 'حركة العمود داخل المحمل'),
      '، ولاقط التسارع يقيس ', el('b', {}, 'حركة الغلاف'),
      '. وهما شيئان مختلفان: غشاء الزيت في المحمل الانزلاقي يمرّر نحو ',
      el('span', { class: 'ltr' }, '6%'),
      ' فقط من حركة العمود إلى الغلاف، فلا يُغني أحدهما عن الآخر مهما اتّسع مجاله.'),
  ));

  let hint = '';
  function refresh(msg = '') {
    hint = msg;
    caseBtns.forEach((b, i) => { b.className = `btn sm ${i === ci ? '' : 'secondary'}`; });
    sensBtns.forEach((b, i) => { b.className = `btn sm ${i === si ? '' : 'secondary'}`; });
    widestRow.style.display = compare ? '' : 'none';

    const c = CASES[ci], s = SENSORS[si], v = view(c, s);
    if (c.best === s.id && v.inBand) {
      if (c.id === 'journal') complete('pick-eddy');
      if (c.id === 'brg4k') complete('pick-accel');
    }
    scope.wave(v.x, FS, { unit: s.unit, ms: c.fKey > 500 ? 12 : 60, label: `الإشارة كما يراها ${s.label}` });
    read.set([
      { label: 'التردد الحاسم', value: `${c.fKey} Hz`, color: kit.pal.badge },
      { label: 'مجال اللاقط', value: `${s.f0}–${s.f1} Hz`, color: kit.pal[s.pal] },
      { label: 'القراءة عند التردد الحاسم', value: `${fmt(v.peak)} ${s.unit}`, color: v.inBand ? kit.pal.ok : kit.pal.bad },
    ]);
  }

  kit.loop((c2, dt, t) => {
    const W = kit.W, H = kit.H, p = kit.pal;
    const cs = CASES[ci], sn = SENSORS[si], v = view(cs, sn);
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.4);

    // ── ثلاثة لواقط مرسومة في صف ──
    const cardW = (W - 40) / 3, cardH = H * 0.42, top = 26;
    SENSORS.forEach((s, i) => {
      const x = 12 + i * (cardW + 8), on = i === si;
      c2.fillStyle = withAlpha(p[s.pal], on ? 0.16 : 0.05);
      c2.strokeStyle = on ? p[s.pal] : p.line;
      c2.lineWidth = on ? 2 : 1;
      round(c2, x, top, cardW, cardH, 10); c2.fill(); c2.stroke();
      drawSensor(c2, s.id, x + cardW / 2, top + cardH * 0.52, Math.min(cardW * 0.7, cardH * 0.62), p, on);
      label(c2, s.label, x + cardW / 2, top + 14, { size: 12, color: on ? p[s.pal] : p.text2, align: 'center', weight: 800 });
      label(c2, `${s.f0}–${s.f1} Hz`, x + cardW / 2, top + cardH - 11, { size: 11, color: p.text2, align: 'center' });
    });
    label(c2, 'اضغط اللاقط الذي تختاره لهذه الحالة', W - 12, 12, { size: 11.5, color: p.text2 });

    // ── محور التردد اللوغاريتمي وأشرطة المجالات ──
    const ax0 = 46, ax1 = W - 14, axW = ax1 - ax0;
    const fx = f => ax0 + (Math.log10(Math.max(f, AX0)) / Math.log10(AX1)) * axW;
    const barsTop = top + cardH + 22;
    const rows = compare ? SENSORS : [sn];
    rows.forEach((s, i) => {
      const y = barsTop + i * 17;
      c2.strokeStyle = withAlpha(p.text2, 0.22); c2.lineWidth = 1;
      c2.beginPath(); c2.moveTo(ax0, y); c2.lineTo(ax1, y); c2.stroke();
      c2.fillStyle = withAlpha(p[s.pal], 0.55);
      c2.fillRect(fx(Math.max(s.f0, AX0)), y - 5, fx(s.f1) - fx(Math.max(s.f0, AX0)), 10);
      label(c2, s.label, ax0 - 4, y, { size: 10.5, color: p[s.pal] });
    });
    // تدريج المحور
    const axY = barsTop + rows.length * 17 + 6;
    c2.strokeStyle = withAlpha(p.text2, 0.35); c2.lineWidth = 1;
    c2.beginPath(); c2.moveTo(ax0, axY); c2.lineTo(ax1, axY); c2.stroke();
    for (const f of [1, 10, 100, 1000, 10000]) {
      c2.beginPath(); c2.moveTo(fx(f), axY); c2.lineTo(fx(f), axY + 4); c2.stroke();
      label(c2, f >= 1000 ? `${f / 1000}k` : `${f}`, fx(f), axY + 12, { size: 10, color: p.text2, align: 'center' });
    }

    // ── تردد الحالة على المحور نفسه: هنا يُرى الجواب ──
    const kx = fx(cs.fKey);
    const glow = 0.55 + 0.45 * Math.abs(Math.sin(t * 2));
    arrow(c2, kx, barsTop - 16, kx, barsTop - 3, { color: withAlpha(p.badge, glow), width: 2, head: 6 });
    label(c2, `${cs.fKey} Hz`, kx, barsTop - 24, { size: 11, color: p.badge, align: 'center' });

    // ── الحكم ──
    const ok = v.inBand && (!cs.shaft || sn.id === 'disp');
    const msg = hint || (v.inBand
      ? (cs.shaft && sn.id !== 'disp'
        ? `يرى التردد لكنه على الغلاف — غشاء الزيت أضعف القراءة إلى ${fmt(OIL_FILM * 100)}%`
        : `يرى العطل: القراءة معتبرة عند ${cs.fKey} Hz`)
      : `أعمى عن العطل: ${cs.fKey} Hz خارج مجال ${sn.label}`);
    label(c2, `${ok ? '✅' : '❌'} ${msg}`, W / 2, H - 12,
      { size: 12, color: hint ? p.bad : (ok ? p.ok : p.bad), align: 'center', weight: 800 });
    if (pulse > 0) {
      c2.strokeStyle = withAlpha(p.ok, pulse * 0.8); c2.lineWidth = 3;
      round(c2, 3, 3, W - 6, H - 6, 12); c2.stroke();
    }
  });

  refresh();
  return { destroy() { scope.destroy(); kit.destroy(); } };
}

// ── رسم اللواقط ──
function drawSensor(c, id, cx, cy, s, p, on) {
  const ink = on ? p.text : p.text2;
  c.save();
  c.strokeStyle = ink; c.lineWidth = 1.6; c.lineCap = 'round';
  if (id === 'disp') {                       // عمود داخل محمل انزلاقي ومسبار بلا تلامس
    c.strokeStyle = withAlpha(p.text2, 0.7);
    c.beginPath(); c.arc(cx, cy + s * 0.06, s * 0.36, 0, Math.PI * 2); c.stroke();
    c.fillStyle = withAlpha(p.water, on ? 0.55 : 0.25);
    c.beginPath(); c.arc(cx + s * 0.05, cy + s * 0.1, s * 0.24, 0, Math.PI * 2); c.fill();
    c.strokeStyle = ink;
    c.beginPath(); c.moveTo(cx, cy - s * 0.5); c.lineTo(cx, cy - s * 0.24); c.stroke();
    c.fillStyle = ink; c.fillRect(cx - s * 0.09, cy - s * 0.62, s * 0.18, s * 0.14);
    c.setLineDash([2, 2]); c.strokeStyle = withAlpha(p.water, 0.9);
    c.beginPath(); c.moveTo(cx, cy - s * 0.24); c.lineTo(cx, cy - s * 0.12); c.stroke();
  } else if (id === 'vel') {                 // ملف متحرك حول كتلة مغناطيسية
    c.strokeStyle = ink;
    c.strokeRect(cx - s * 0.3, cy - s * 0.46, s * 0.6, s * 0.92);
    c.fillStyle = withAlpha(p.ok, on ? 0.5 : 0.22);
    c.fillRect(cx - s * 0.12, cy - s * 0.2, s * 0.24, s * 0.42);
    c.strokeStyle = withAlpha(p.ok, 0.95);
    for (let i = 0; i < 5; i++) {
      const y = cy - s * 0.18 + i * s * 0.1;
      c.beginPath(); c.moveTo(cx - s * 0.22, y); c.lineTo(cx + s * 0.22, y + s * 0.05); c.stroke();
    }
  } else {                                   // كتلة زلزالية فوق بلورة كهروضغطية
    c.fillStyle = withAlpha(p.amber, on ? 0.5 : 0.22);
    c.fillRect(cx - s * 0.26, cy - s * 0.42, s * 0.52, s * 0.26);
    c.strokeStyle = withAlpha(p.amber, 0.95);
    for (let i = 0; i < 4; i++) {
      const y = cy - s * 0.14 + i * s * 0.05;
      c.beginPath(); c.moveTo(cx - s * 0.26, y); c.lineTo(cx + s * 0.26, y); c.stroke();
    }
    c.strokeStyle = ink;
    c.beginPath(); c.moveTo(cx - s * 0.34, cy + s * 0.12); c.lineTo(cx + s * 0.34, cy + s * 0.12);
    c.lineTo(cx + s * 0.26, cy + s * 0.42); c.lineTo(cx - s * 0.26, cy + s * 0.42); c.closePath(); c.stroke();
  }
  c.restore();
}

function round(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

function fmt(v) {
  const a = Math.abs(v);
  return a >= 100 ? v.toFixed(0) : a >= 1 ? v.toFixed(2) : a >= 0.001 ? v.toFixed(4) : v.toExponential(1);
}
