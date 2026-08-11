// مضلّع الاتزان — ثلاث كتل على قرص، ومتجه رابع يُغلق المضلّع فيُسكِتها.
// كل ضلع مقداره M × r بزاويته، والفجوة الباقية هي القوة المتبقية: كلما ضاق المضلّع هدأت الآلة.
import { SimKit, label, arrow, withAlpha } from './simkit.js';
import { segment } from './analyzer.js';
import { el } from '../ui.js';
import { C, centrifugalForce } from './balancekit.js';

const RB = 100;                       // نصف قطر حلقة كتلة الموازنة (mm) — ثابت كما في القرص الحقيقي
const RPM_MAX = 3000;
const COLS = ['water', 'water2', 'amber'];

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.66 });
  const read = kit.readout();
  const done = new Set();
  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); ctx.completeMission(id);
  };

  const masses = [
    { g: 250, r: 120, a: 0 }, { g: 150, r: 90, a: 100 }, { g: 100, r: 80, a: 200 },
  ];
  let sel = 0, balG = 0, balA = 0, rpm = 1500, rot = 0, lastKey = '';

  // ═══ الحساب: متجهات M×r ═══
  const sumU = () => masses.reduce((s, m) => C.add(s, C.polar(m.g * m.r, m.a)), { re: 0, im: 0 });
  const state = () => {
    const s = sumU(), p = C.toPolar(s);
    const bal = C.polar(balG * RB, balA);
    const gap = C.add(s, bal);
    const largest = Math.max(...masses.map(m => m.g * m.r), balG * RB, 1e-9);
    const k = Math.pow(2 * Math.PI * rpm / 60, 2) / 1e6;      // g·mm → N
    return {
      need: { mag: p.mag, deg: (p.deg + 180) % 360 }, needG: p.mag / RB,
      gap: C.toPolar(gap), rel: C.mag(gap) / largest, largest, k,
    };
  };

  const rtl = html => el('span', { html });
  segment(kit.controls, {
    label: 'اضبط الكتلة', value: 0,
    items: masses.map((_, i) => ({ id: i, label: rtl(`الكتلة <span class="ltr">${i + 1}</span>`) })),
    onchange: id => { sel = +id; gSl.set(masses[sel].g); rSl.set(masses[sel].r); aSl.set(masses[sel].a); },
  });
  const gSl = kit.slider({ label: rtl('الكتلة <span class="ltr">M</span>'), min: 20, max: 300, step: 5, value: masses[0].g, unit: 'g', oninput: x => { masses[sel].g = x; check(); } });
  const rSl = kit.slider({ label: rtl('نصف القطر <span class="ltr">r</span>'), min: 40, max: 130, step: 5, value: masses[0].r, unit: 'mm', oninput: x => { masses[sel].r = x; check(); } });
  const aSl = kit.slider({ label: 'الزاوية', min: 0, max: 355, step: 5, value: masses[0].a, unit: '°', oninput: x => { masses[sel].a = x; check(); } });
  const bgSl = kit.slider({ label: 'كتلة الموازنة', min: 0, max: 500, step: 1, value: 0, unit: 'g', oninput: x => { balG = x; check(); } });
  const baSl = kit.slider({ label: 'زاوية الموازنة', min: 0, max: 360, step: 1, value: 0, unit: '°', oninput: x => { balA = x; check(); } });
  const rSpd = kit.slider({ label: 'سرعة الدوران', min: 300, max: RPM_MAX, step: 50, value: rpm, unit: 'RPM', oninput: x => { rpm = x; } });

  const cmp = el('div', {
    style: 'font-size:12.5px; color:var(--c-text2); line-height:1.8; margin-top:2px',
    html: `كتلة الموازنة تُركَّب على حلقة نصف قطرها <span class="ltr">${RB} mm</span> — فالمطلوب منك مقدارها وزاويتها فقط.`,
  });
  kit.buttons([{
    label: 'ضاعف سرعة الدوران', cls: 'ghost',
    onclick: () => {
      const b = rpm * 2 > RPM_MAX ? 1500 : rpm;
      rSpd.set(b);
      const st0 = state(), f0 = masses.map(m => centrifugalForce(m.g, m.r, b));
      rSpd.set(b * 2);
      const st1 = state(), f1 = masses.map(m => centrifugalForce(m.g, m.r, b * 2));
      const ratios = f1.map((x, i) => x / f0[i]);
      const dAng = Math.abs(st1.need.deg - st0.need.deg);
      cmp.innerHTML = `عند <span class="ltr">${b} RPM</span> كانت القوى ` +
        `<span class="ltr">${f0.map(x => x.toFixed(0)).join(' / ')} N</span>، وعند <span class="ltr">${b * 2} RPM</span> صارت ` +
        `<span class="ltr">${f1.map(x => x.toFixed(0)).join(' / ')} N</span> — النسبة ` +
        `<b class="ltr">×${ratios[0].toFixed(2)}</b>. وزاوية الموازنة بقيت ` +
        `<b class="ltr">${st1.need.deg.toFixed(1)}°</b> كما كانت. القوة تتبع <span class="ltr">F = M ω² r</span>: ` +
        'ضِعف السرعة يعني أربعة أضعاف القوة، والاتجاه لا يتغيّر.';
      if (ratios.every(x => x > 3.9 && x < 4.1) && dAng < 0.5) complete('force-square');
    },
  }]);
  kit.controls.append(cmp);

  function check() {
    const s = state();
    if (balG > 0 && s.rel < 0.05) complete('close-polygon');
    if (balG >= 50) {
      let d = Math.abs(balA - s.need.deg) % 360;
      if (d > 180) d = 360 - d;
      if (d <= 5) complete('read-angle');
    }
  }

  kit.loop((g, dt) => {
    const pal = kit.pal, W = kit.W, H = kit.H;
    rot += dt * (rpm / 60) * 0.25;
    const s = state();

    // ═══ القرص ═══
    const dcx = W * 0.24, dcy = H * 0.52, R = Math.min(W * 0.2, H * 0.36);
    const rMax = Math.max(RB, ...masses.map(m => m.r));
    g.save();
    g.strokeStyle = withAlpha(pal.text2, 0.5); g.lineWidth = 1.4;
    g.beginPath(); g.arc(dcx, dcy, R, 0, Math.PI * 2); g.stroke();
    g.setLineDash([3, 4]); g.strokeStyle = withAlpha(pal.ok, 0.45);
    g.beginPath(); g.arc(dcx, dcy, R * RB / rMax, 0, Math.PI * 2); g.stroke();
    g.restore();
    const put = (mag, deg, col, txt, big) => {
      const t = (deg * Math.PI / 180) + rot;
      const x = dcx + Math.cos(t) * R * mag / rMax, y = dcy - Math.sin(t) * R * mag / rMax;
      g.save();
      g.strokeStyle = withAlpha(col, 0.6); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(dcx, dcy); g.lineTo(x, y); g.stroke();
      g.fillStyle = col;
      g.beginPath(); g.arc(x, y, big, 0, Math.PI * 2); g.fill();
      g.restore();
      label(g, txt, x, y - big - 8, { size: 10, color: col, align: 'center' });
    };
    masses.forEach((m, i) => put(m.r, m.a, pal[COLS[i]], `${m.g} g`, 4 + m.g / 60));
    if (balG > 0) put(RB, balA, pal.ok, `موازنة ${balG} g`, 4 + balG / 90);
    g.save(); g.fillStyle = pal.text2;
    g.beginPath(); g.arc(dcx, dcy, 3, 0, Math.PI * 2); g.fill(); g.restore();
    label(g, 'القرص الدوّار', dcx, dcy + R + 16, { size: 11, color: pal.text2, align: 'center' });

    // ═══ مضلّع القوى: ضلعًا بعد ضلع، رأس كلٍّ عند ذيل التالي ═══
    const vecs = masses.map((m, i) => ({ mag: m.g * m.r * s.k, deg: m.a, col: pal[COLS[i]], tag: `${i + 1}` }));
    if (balG > 0) vecs.push({ mag: balG * RB * s.k, deg: balA, col: pal.ok, tag: 'موازنة' });
    const pts = [{ x: 0, y: 0 }];
    for (const v of vecs) {
      const t = v.deg * Math.PI / 180, p = pts[pts.length - 1];
      pts.push({ x: p.x + Math.cos(t) * v.mag, y: p.y + Math.sin(t) * v.mag });
    }
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const bw = Math.max(1e-6, Math.max(...xs) - Math.min(...xs)), bh = Math.max(1e-6, Math.max(...ys) - Math.min(...ys));
    const boxW = W * 0.44, boxH = H * 0.66;
    const sc = Math.min(boxW / bw, boxH / bh, 0.9);
    const ox = W * 0.62 - (Math.min(...xs) + bw / 2) * sc, oy = H * 0.5 + (Math.min(...ys) + bh / 2) * sc;
    const PX = p => ox + p.x * sc, PY = p => oy - p.y * sc;
    vecs.forEach((v, i) => {
      arrow(g, PX(pts[i]), PY(pts[i]), PX(pts[i + 1]), PY(pts[i + 1]), { color: v.col, width: 2.6, head: 8 });
      label(g, v.tag, (PX(pts[i]) + PX(pts[i + 1])) / 2, (PY(pts[i]) + PY(pts[i + 1])) / 2 - 9,
        { size: 10.5, color: v.col, align: 'center' });
    });
    const tail = pts[pts.length - 1];
    const gapN = s.gap.mag * s.k;
    if (s.rel > 0.005) {
      g.save(); g.setLineDash([5, 4]);
      arrow(g, PX(tail), PY(tail), PX(pts[0]), PY(pts[0]), { color: pal.bad, width: 2, head: 7 });
      g.restore();
      label(g, `الفجوة ${gapN.toFixed(0)} N`, (PX(tail) + PX(pts[0])) / 2, (PY(tail) + PY(pts[0])) / 2 + 12,
        { size: 10.5, color: pal.bad, align: 'center' });
    } else {
      label(g, 'المضلّع مغلق', PX(pts[0]), PY(pts[0]) + 14, { size: 11.5, color: pal.ok, align: 'center', weight: 800 });
    }
    label(g, 'مضلّع القوى', W - 8, 14, { size: 11.5, color: pal.text2, align: 'right' });

    const key = `${masses.map(m => m.g + '/' + m.r + '/' + m.a).join()}|${balG}|${balA}|${rpm}`;
    if (key !== lastKey) {
      lastKey = key;
      read.set([
        { label: 'القوة المتبقية', value: `${gapN.toFixed(1)} N`, color: s.rel < 0.05 ? 'var(--c-ok)' : 'var(--c-bad)' },
        { label: 'نسبتها لأكبر متجه', value: `${(s.rel * 100).toFixed(1)} %`, color: 'var(--c-amber)' },
        { label: 'أكبر قوة', value: `${(s.largest * s.k).toFixed(0)} N`, color: 'var(--c-water)' },
        { label: 'سرعة الدوران', value: `${rpm} RPM`, color: 'var(--c-badge)' },
      ]);
    }
  });

  return { destroy() { kit.destroy(); } };
}
