// قراءة الطيف — المؤشّر يقرأ، والخطوط المساعدة تُفسّر: من غابة أعمدة إلى جملة مفهومة.
// كل طيف يُولَّد بـsynth مرة واحدة لكل (آلة × عطل) ويُخزَّن في Map — حلقة الرسم لا تحسب شيئًا.
import { SimKit, label, withAlpha } from './simkit.js';
import { segment } from './analyzer.js';
import { el } from '../ui.js';
import { synth, spectrum, integrateWave, ampAt, topPeaks, shaftHz, bearingFreqs } from './vibkit.js';
import { MACHINES } from './machines.js';

const FS = 12800, N = 16384, F_TOP = 600;      // fs فوق رنين المحمل فلا يحدث طيّ
const P = { l: 46, r: 14, t: 30, b: 26 };

// نص عربي فيه قيمة لاتينية يُمرَّر عنصرًا لا نصًا — كي تُعزل جهته داخل الزر
const rtl = html => el('span', { html });
const MACH = [
  { id: 'pump', text: 'مضخة <span class="ltr">2950 RPM</span>' },
  { id: 'fan', text: 'مروحة <span class="ltr">1800 RPM</span> — سبع شفرات' },
];
const FAULTS = [
  { id: 'unbalance', label: 'عدم اتزان', sev: 0.75 },
  { id: 'misalignParallel', label: 'عدم اصطفاف متوازٍ', sev: 0.75 },
  { id: 'looseness', label: 'رخاوة', sev: 0.8 },
  { id: 'bearingInner', label: 'عيب محمل — مسار داخلي', sev: 0.85 },
];

// ═══ توليد الحالة وتخزينها ═══
const CASES = new Map();
function caseOf(mid, fid) {
  const key = mid + '|' + fid;
  if (CASES.has(key)) return CASES.get(key);
  const m = MACHINES[mid], f = FAULTS.find(x => x.id === fid);
  // أرضية عدم اتزان خفيفة ومرور ريش دائم — لا آلة بلا 1× ولا مروحة بلا تردد ريش
  const raw = synth(m, [{ type: fid, sev: f.sev }, { type: 'unbalance', sev: 0.22 }, { type: 'bladePass', sev: 0.5 }],
    { dir: 'H', fs: FS, n: N, seed: 7 });
  const acc = fid === 'bearingInner';                    // عيب المحمل يُقرأ بالتسارع لا بالسرعة
  const sp = spectrum(acc ? raw.a : integrateWave(raw.a, FS, 1), FS, { win: 'hann' });
  const S = shaftHz(m.rpm), nb = m.vanes || m.blades || 0;
  const k0 = Math.ceil(5 / sp.df), k1 = Math.floor(F_TOP / sp.df);
  let max = 1e-12; const arr = [];
  for (let k = k0; k <= k1; k++) { if (sp.amp[k] > max) max = sp.amp[k]; arr.push(sp.amp[k]); }
  arr.sort((a, b) => a - b);
  const floor = arr[Math.floor(arr.length / 2)] || 0;    // وسيط السعات = أرضية الضجيج
  // التوافقيات الظاهرة: قمم حقيقية عند مضاعفات 1×، وتردد مرور الريش لا يُعدّ منها (له خط خاص)
  const orders = [];
  for (const p of topPeaks(sp, { count: 24, fMin: 5, fMax: F_TOP, minRel: 0.05 })) {
    const k = Math.round(p.f / S);
    if (k >= 1 && k <= 8 && k !== nb && Math.abs(p.f - k * S) < 0.03 * S && !orders.includes(k)) orders.push(k);
  }
  orders.sort((a, b) => a - b);
  const bpfi = bearingFreqs(m.bearing, m.rpm).bpfi;
  const sb = acc ? [ampAt(sp, bpfi - S, 3), ampAt(sp, bpfi, 3), ampAt(sp, bpfi + S, 3)] : null;
  const c = { sp, acc, S, nb, bpf: nb * S, bpfi, sb, max, floor, orders, m, unit: acc ? 'm/s²' : 'mm/s' };
  CASES.set(key, c);
  return c;
}

// حقل إدخال مضغوط بتحقق فوري
function ask(host, { label: lab, unit, hint, onSubmit }) {
  const inp = el('input', {
    type: 'number', step: 'any', inputmode: 'decimal', placeholder: '؟',
    style: 'direction:ltr; text-align:center; width:96px; padding:7px; border-radius:10px;' +
      'border:1px solid var(--c-border2); background:transparent; color:var(--c-text); font:inherit',
  });
  const out = el('span', { class: 'chip', style: 'display:none' });
  const go = () => {
    const v = parseFloat(inp.value);
    if (!isFinite(v)) return;
    const r = onSubmit(v);
    out.style.display = '';
    out.style.color = r.ok ? 'var(--c-ok)' : 'var(--c-bad)';
    out.style.borderColor = r.ok ? 'var(--c-ok)' : 'var(--c-bad)';
    out.innerHTML = r.msg;
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  host.append(el('div', { class: 'sim-row', style: 'flex-wrap:wrap; gap:8px' },
    el('label', { style: 'min-width:auto' }, lab), inp,
    unit ? el('span', { class: 'ltr', style: 'color:var(--c-text2); font-size:12px' }, unit) : null,
    el('button', { class: 'btn sm secondary', type: 'button', onclick: go }, 'تحقّق'), out));
  if (hint) host.append(el('div', { style: 'font-size:12px; color:var(--c-text2); margin:-4px 0 2px' , html: hint }));
}

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.62 });
  const read = kit.readout();
  const done = new Set();
  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  let mid = 'pump', fid = 'unbalance', cur = null, pulse = 0, lastKey = '';
  const help = { orders: false, blade: false, sb: false };

  segment(kit.controls, {
    label: 'الآلة', value: mid, items: MACH.map(m => ({ id: m.id, label: rtl(m.text) })),
    onchange: id => { mid = id; cur = null; },
  });
  segment(kit.controls, {
    label: 'العطل', items: FAULTS.map(f => ({ id: f.id, label: f.label })), value: fid,
    onchange: id => { fid = id; cur = null; },
  });

  const hb = kit.buttons([
    { label: rtl('خطوط <span class="ltr">1× – 8×</span>'), onclick: () => { help.orders = !help.orders; paintHelp(); } },
    { label: 'تردد مرور الريش', onclick: () => { help.blade = !help.blade; paintHelp(); } },
    { label: 'تباعد الجوانب', onclick: () => { help.sb = !help.sb; paintHelp(); } },
  ]);
  const paintHelp = () => [help.orders, help.blade, help.sb].forEach((on, i) => {
    hb[i].style.background = on ? 'var(--c-badge)' : '';
    hb[i].style.color = on ? 'var(--c-bg)' : '';
    hb[i].style.borderColor = on ? 'var(--c-badge)' : '';
    hb[i].style.fontWeight = on ? '800' : '';
  });
  paintHelp();

  ask(kit.controls, {
    label: 'عدد التوافقيات الظاهرة', hint: 'عُدّ مضاعفات سرعة الدوران فوق أرضية الضجيج — ولا تحسب تردد مرور الريش، فله خطه الخاص.',
    onSubmit: v => {
      const c = caseOf(mid, fid), n = c.orders.length;
      if (Math.round(v) !== n) return { ok: false, msg: `ليست <span class="ltr">${Math.round(v)}</span> — أعد العدّ` };
      if (n < 3) return { ok: false, msg: 'صحيح، لكن جرّب عطلًا ذا سلسلة توافقيات أطول' };
      complete('count-harmonics');
      return { ok: true, msg: `صحيح: <span class="ltr">${c.orders.map(k => k + '×').join(' · ')}</span>` };
    },
  });
  ask(kit.controls, {
    label: 'تباعد الجوانب', unit: 'Hz', hint: 'شغّل «تباعد الجوانب» على عطل المحمل، واطرح ترددي قمّتين متجاورتين.',
    onSubmit: v => {
      const c = caseOf(mid, fid);
      if (!c.acc) return { ok: false, msg: 'الجوانب تظهر مع عيب المحمل — بدّل العطل' };
      if (Math.abs(v - c.S) > 0.1 * c.S) return { ok: false, msg: 'خارج ±10% — أعد القراءة' };
      complete('sideband-gap');
      return { ok: true, msg: `صحيح — وهو سرعة الدوران <span class="ltr">1×</span> نفسها: <span class="ltr">${c.S.toFixed(1)} Hz</span>` };
    },
  });
  kit.controls.append(el('div', {
    style: 'font-size:12px; color:var(--c-text2); line-height:1.7',
    html: 'تردد مرور الريش = عدد الشفرات × سرعة الدوران. اسحب على اللوحة فينجذب المؤشّر إلى أقرب قمة.',
  }));

  // ═══ المؤشّر: ينجذب إلى أقرب قمة كمؤشّر القمة في الأجهزة ═══
  const pick = e => {
    const c = caseOf(mid, fid);
    const r = kit.canvas.getBoundingClientRect();
    const gw = kit.W - P.l - P.r;
    const px = (e.clientX - r.left) / r.width * kit.W;
    const f = Math.max(0, Math.min(F_TOP, (px - P.l) / gw * F_TOP));
    let k = Math.max(1, Math.round(f / c.sp.df)), best = k;
    for (let j = Math.max(1, k - 5); j <= k + 5 && j < c.sp.amp.length - 1; j++)
      if (c.sp.amp[j] > c.sp.amp[best]) best = j;
    cur = { f: best * c.sp.df, amp: c.sp.amp[best] };
    if (Math.abs(cur.f - c.S) <= 0.03 * c.S) complete('mark-1x');
    if (mid === 'fan' && Math.abs(cur.f - 210) <= 0.03 * 210) complete('blade-freq');
    e.preventDefault();
  };
  const move = e => { if (e.buttons) pick(e); };
  kit.canvas.addEventListener('pointerdown', pick);
  kit.canvas.addEventListener('pointermove', move);

  kit.loop((g, dt) => {
    const c = caseOf(mid, fid), pal = kit.pal;
    const W = kit.W, H = kit.H;
    const gw = W - P.l - P.r, gh = H - P.t - P.b, base = P.t + gh;
    const X = f => P.l + gw * f / F_TOP;
    const Y = a => base - gh * Math.min(1, a / c.max) * 0.94;
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.2);

    // شبكة أفقية
    g.save(); g.strokeStyle = withAlpha(pal.text2, 0.16); g.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = P.t + gh * i / 4;
      g.beginPath(); g.moveTo(P.l, y); g.lineTo(P.l + gw, y); g.stroke();
    }
    g.restore();

    // أعمدة الطيف: أعلى قمة داخل كل بكسل
    g.save();
    g.strokeStyle = pulse > 0 ? withAlpha(pal.ok, 0.4 + 0.6 * pulse) : pal.amber;
    g.lineWidth = 1;
    const kMax = Math.floor(F_TOP / c.sp.df);
    for (let px = 0; px < gw; px++) {
      const a = Math.max(1, Math.floor(kMax * px / gw)), b = Math.max(a, Math.floor(kMax * (px + 1) / gw));
      let m = 0;
      for (let k = a; k <= b; k++) if (c.sp.amp[k] > m) m = c.sp.amp[k];
      const y = Y(m);
      if (base - y < 0.5) continue;
      g.beginPath(); g.moveTo(P.l + px + 0.5, base); g.lineTo(P.l + px + 0.5, y); g.stroke();
    }
    g.restore();

    // أرضية الضجيج
    const yF = Y(c.floor * 3);
    g.save(); g.strokeStyle = withAlpha(pal.text2, 0.55); g.setLineDash([4, 4]); g.lineWidth = 1;
    g.beginPath(); g.moveTo(P.l, yF); g.lineTo(P.l + gw, yF); g.stroke(); g.restore();
    label(g, 'أرضية الضجيج', P.l + gw - 4, yF - 8, { size: 10, color: pal.text2, align: 'right' });

    // خطوط المضاعفات
    if (help.orders) for (let k = 1; k <= 8; k++) {
      const f = k * c.S;
      if (f > F_TOP) break;
      vline(g, X(f), P.t, base, withAlpha(pal.water, 0.6));
      label(g, `${k}×`, X(f), P.t - 9, { size: 10, color: pal.water, align: 'center' });
    }
    // تردد مرور الريش
    if (help.blade && c.bpf > 0 && c.bpf <= F_TOP) {
      vline(g, X(c.bpf), P.t, base, withAlpha(pal.badge, 0.85));
      label(g, `مرور الريش ${c.bpf.toFixed(0)} Hz`, X(c.bpf), P.t + 10, { size: 10.5, color: pal.badge, align: 'center' });
    }
    // مؤشّر تباعد الجوانب: ثلاث قمم متجاورة حول الحامل، بتردد كل واحدة
    if (help.sb && c.sb) {
      const yb = Math.min(...c.sb.map(p => Y(p.amp))) - 14;
      g.save(); g.strokeStyle = pal.ok; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(X(c.sb[0].f), yb); g.lineTo(X(c.sb[2].f), yb); g.stroke();
      for (const p of c.sb) { g.beginPath(); g.moveTo(X(p.f), yb - 4); g.lineTo(X(p.f), yb + 4); g.stroke(); }
      g.restore();
      for (const p of c.sb) label(g, p.f.toFixed(1), X(p.f), yb - 12, { size: 10, color: pal.ok, align: 'center' });
    }

    // المؤشّر
    if (cur) {
      vline(g, X(cur.f), P.t, base, pal.ok, false);
      g.save(); g.fillStyle = pal.ok;
      g.beginPath(); g.arc(X(cur.f), Y(cur.amp), 3.4, 0, Math.PI * 2); g.fill(); g.restore();
    }

    // محاور وعناوين
    label(g, fmt(c.max), P.l - 5, P.t + 6, { size: 10, color: pal.text2 });
    label(g, '0', P.l - 5, base, { size: 10, color: pal.text2 });
    label(g, '0 Hz', P.l, base + 12, { size: 10, color: pal.text2, align: 'center' });
    label(g, `${F_TOP} Hz`, P.l + gw, base + 12, { size: 10, color: pal.text2, align: 'right' });
    label(g, `${c.m.label} — 1× عند ${c.S.toFixed(1)} Hz`, W - 8, 12, { size: 11.5, color: pal.text, align: 'right' });
    label(g, `السعة بـ ${c.unit}`, P.l, 12, { size: 11, color: pal.text2, align: 'left' });

    const key = `${mid}|${fid}|${cur ? cur.f.toFixed(2) : '-'}`;
    if (key !== lastKey) {
      lastKey = key;
      read.set([
        { label: 'التردد', value: cur ? `${cur.f.toFixed(1)} Hz` : '—', color: 'var(--c-ok)' },
        { label: 'السعة', value: cur ? `${fmt(cur.amp)} ${c.unit}` : '—', color: 'var(--c-amber)' },
        { label: 'الترتيب', value: cur ? `${(cur.f / c.S).toFixed(2)} ×` : '—', color: 'var(--c-water)' },
        { label: 'أرضية الضجيج', value: `${fmt(c.floor)} ${c.unit}`, color: 'var(--c-text2)' },
      ]);
    }
  });

  return {
    destroy() {
      kit.canvas.removeEventListener('pointerdown', pick);
      kit.canvas.removeEventListener('pointermove', move);
      CASES.clear();
      kit.destroy();
    },
  };
}

function vline(g, x, y0, y1, color, dashed = true) {
  g.save();
  g.strokeStyle = color; g.lineWidth = dashed ? 1 : 1.4;
  if (dashed) g.setLineDash([3, 3]);
  g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
  g.restore();
}

function fmt(v) {
  const a = Math.abs(v);
  return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : a >= 1 ? v.toFixed(2) : a >= 0.01 ? v.toFixed(3) : v.toExponential(1);
}
