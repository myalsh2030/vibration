// التثبيت يصنع القراءة — الحسّاس نفسه والآلة نفسها وقراءتان مختلفتان تمامًا.
//
// المضخة بها عيب مسار خارجي محقون: تردد العيب BPFO نحو 176 هرتز، لكن **طاقته
// الحقيقية** ليست هناك — هي في رنين المحمل نحو 3100 هرتز حيث تُرنّ كل صدمة.
// المسبار اليدوي يقطع كل ما فوق 1 kHz، فتختفي تلك الطاقة من الطيف حرفيًا
// وتبقى قمة BPFO الهزيلة وحدها. وهذا أشيع خطأ ميداني في قياس المحامل.
import { SimKit, label, withAlpha } from './simkit.js';
import { Scope } from './scope.js';
import { drawMachine, drawSensor, roundRect } from './machinedraw.js';
import { synth, spectrum, lowpass, ampAt, bearingFreqs, metrics } from './vibkit.js';
import { MACHINES } from './machines.js';
import { MOUNTS } from './vibstd.js';
import { el } from '../ui.js';

const M = MACHINES.pump;
const FS = 25600, N = 8192, SEV = 0.7, FVIEW = 6000;
const RES = M.bearing.resHz;                       // 3100 Hz — رنين المحمل
const BPFO = bearingFreqs(M.bearing, M.rpm).bpfo;  // ≈ 175.6 Hz

// نقطة القياس: على المحمل مباشرة، أو على غلاف الآلة بعيدًا عن مسار الحمل.
// المسار الميكانيكي إلى الغلاف يبتلع أكثر من ثلثي الطاقة قبل أن تبلغ الحسّاس.
const POINTS = [
  { id: 'brg', label: 'على المحمل', gain: 1.0, x: 0.56, y: 0.50, hint: 'مباشرة على غطاء محمل جهة القيادة' },
  { id: 'case', label: 'على الغلاف', gain: 0.3, x: 0.72, y: 0.30, hint: 'على حلزون المضخة بعيدًا عن مسار الحمل' },
];

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.58 });
  const read = kit.readout();
  const scope = new Scope(kit.controls, { height: 168 });

  let mi = 0, pi = 0, pulse = 0, hidden = false;
  const measured = new Map();                      // نتائج نقطة القياس عند تثبيت يبلغ الرنين
  const done = new Set();
  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  // ── الحساب المكلف يُخزَّن: synth مرة لكل نقطة، والطيف مرة لكل تركيبة ──
  const rawCache = new Map(), resCache = new Map();
  const raw = p => {
    if (!rawCache.has(p.id))
      rawCache.set(p.id, synth(M, [{ type: 'bearingOuter', sev: SEV * p.gain }], { dir: 'H', fs: FS, n: N, seed: 7 }).a);
    return rawCache.get(p.id);
  };
  const result = (p, mo) => {
    const key = `${p.id}|${mo.id}`;
    if (resCache.has(key)) return resCache.get(key);
    const x = lowpass(raw(p), FS, mo.fMax);
    const spec = spectrum(x, FS, { win: 'hann' });
    let res = 0;
    for (let k = 1; k < spec.amp.length; k++) {
      const f = k * spec.df;
      if (f > RES - 500 && f < RES + 500 && spec.amp[k] > res) res = spec.amp[k];
    }
    const out = { spec, res, bpfo: ampAt(spec, BPFO, 6).amp, rms: metrics(x).rms };
    resCache.set(key, out);
    return out;
  };
  const refRes = p => result(p, MOUNTS[0]).res;    // مرجع البرغي: أعلى ما يمكن رؤيته

  // ── أشرطة الاختيار ──
  const mountBtns = kit.buttons(MOUNTS.map((mo, i) => ({
    label: mo.label, onclick: () => { mi = i; refresh(); },
  })));
  const pointBtns = kit.buttons(POINTS.map((p, i) => ({
    label: p.label, onclick: () => { pi = i; refresh(); },
  })));

  const verdict = el('div', { class: 'card', style: 'margin-top:4px' });
  kit.controls.append(verdict);

  function refresh() {
    mountBtns.forEach((b, i) => { b.className = `btn sm ${i === mi ? '' : 'secondary'}`; });
    pointBtns.forEach((b, i) => { b.className = `btn sm ${i === pi ? '' : 'secondary'}`; });

    const mo = MOUNTS[mi], p = POINTS[pi], r = result(p, mo);
    const rel = r.res / refRes(p);

    // ① المسبار يُخفي قمة الرنين ② المغناطيس يعيدها بعد أن رآها تختفي
    if (mo.id === 'probe' && rel < 0.02) { hidden = true; complete('probe-hides'); }
    if (mo.id === 'magnet' && rel > 0.5 && hidden) complete('magnet-shows');
    // ③ القراءتان عند نقطتين مختلفتين بتثبيت يبلغ الرنين
    if (mo.fMax >= 5000) {
      measured.set(p.id, r.res);
      if (measured.size === POINTS.length) complete('point-matters');
    }

    scope.spectrum(r.spec, {
      unit: 'm/s²', fMax: FVIEW, peaks: 4,
      label: `الطيف كما يُقرأ عبر ${mo.label} — ${p.label}`,
      marks: [
        { f: BPFO, label: 'BPFO', color: kit.pal.water },
        { f: RES, label: 'رنين المحمل', color: kit.pal.badge },
      ],
    });

    read.set([
      { label: 'سقف التثبيت', value: `${mo.fMax} Hz`, color: kit.pal.amber },
      { label: 'قمة الرنين', value: `${sci(r.res)} m/s²`, color: rel < 0.02 ? kit.pal.bad : kit.pal.ok },
      { label: 'نسبتها إلى البرغي', value: `${(rel * 100).toFixed(rel < 0.01 ? 4 : 1)} %`, color: rel < 0.02 ? kit.pal.bad : kit.pal.ok },
      { label: 'قمة BPFO', value: `${r.bpfo.toFixed(2)} m/s²`, color: kit.pal.water },
    ]);

    const cmp = measured.size === POINTS.length
      ? `<div class="small" style="margin-top:6px">مقارنة النقطتين عند تثبيت يبلغ الرنين: على المحمل <span class="ltr">${sci(measured.get('brg'))}</span> مقابل على الغلاف <span class="ltr">${sci(measured.get('case'))}</span> — أي <b><span class="ltr">${(measured.get('brg') / measured.get('case')).toFixed(1)}×</span></b> لصالح المحمل.</div>`
      : '';
    verdict.innerHTML = rel < 0.02
      ? `<div style="font-weight:800; color:var(--c-bad)">❌ قمة الرنين اختفت من الطيف</div>
         <div class="small">سقف <b>${mo.label}</b> هو <span class="ltr">${mo.fMax} Hz</span>، ورنين المحمل عند <span class="ltr">${RES} Hz</span> — فوقه. طاقة العيب الحقيقية قُطعت قبل أن تصل الجهاز، وبقيت قمة <span class="ltr">BPFO</span> الهزيلة وحدها تخدع القارئ.</div>${cmp}`
      : `<div style="font-weight:800; color:var(--c-ok)">✅ قمة الرنين ظاهرة عند <span class="ltr">${RES} Hz</span></div>
         <div class="small">سقف <b>${mo.label}</b> هو <span class="ltr">${mo.fMax} Hz</span> فيمرّر رنين المحمل. ${mo.note}</div>${cmp}`;
  }

  // ── اللوحة ──
  kit.loop((c, dt, t) => {
    const W = kit.W, H = kit.H, pal = kit.pal;
    const mo = MOUNTS[mi], p = POINTS[pi], r = result(p, mo);
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.4);

    // الآلة في النصف العلوي
    const mh = H * 0.60;
    c.save();
    drawMachine(c, W, mh, pal, M, { rot: t * 2 });
    drawSensor(c, W, mh, pal, p, 'H', mo.id);
    // وسم نقطة القياس
    const px = p.x * W, py = p.y * mh;
    c.beginPath(); c.arc(px, py, 6.5, 0, Math.PI * 2);
    c.fillStyle = pal.amber; c.fill();
    c.restore();
    label(c, p.hint, W - 10, 12, { size: 11, color: pal.text2 });
    label(c, `عطل محقون: عيب المسار الخارجي — شدة ${SEV}`, 10, 12, { size: 11, color: pal.badge, align: 'left' });

    // صورة التثبيت مكبّرة يسار اللوحة
    drawMountIcon(c, 46, mh * 0.30, 34, pal, mo.id);
    label(c, mo.label, 46, mh * 0.30 + 30, { size: 11, color: pal.amber, align: 'center', weight: 800 });

    // ── شريط سقف التردد: المنطقة المقطوعة مظللة، والعلامتان عليه ──
    const bx = 46, bw = W - 60, by = H - 40, bh = 15;
    const fx = f => bx + bw * Math.min(1, f / FVIEW);
    c.fillStyle = withAlpha(pal.ok, 0.28);
    c.fillRect(bx, by, Math.min(bw, fx(mo.fMax) - bx), bh);
    c.fillStyle = withAlpha(pal.bad, 0.24);
    if (mo.fMax < FVIEW) c.fillRect(fx(mo.fMax), by, bx + bw - fx(mo.fMax), bh);
    c.strokeStyle = pal.line; c.lineWidth = 1;
    roundRect(c, bx, by, bw, bh, 3); c.stroke();
    label(c, 'يمرّ', (bx + fx(mo.fMax)) / 2, by + bh / 2, { size: 10.5, color: pal.ok, align: 'center' });
    if (mo.fMax < FVIEW * 0.94)
      label(c, 'مقطوع', (fx(mo.fMax) + bx + bw) / 2, by + bh / 2, { size: 10.5, color: pal.bad, align: 'center' });

    for (const mk of [{ f: BPFO, t: 'BPFO', col: pal.water }, { f: RES, t: 'رنين المحمل', col: pal.badge }]) {
      const x = fx(mk.f), on = mk.f <= mo.fMax;
      c.strokeStyle = on ? mk.col : withAlpha(pal.bad, 0.9); c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, by - 9); c.lineTo(x, by + bh + 5); c.stroke();
      label(c, `${on ? '' : '❌ '}${mk.t}`, x, by - 16, { size: 10.5, color: on ? mk.col : pal.bad, align: 'center' });
    }
    label(c, '0', bx, H - 12, { size: 10, color: pal.text2, align: 'center' });
    label(c, `${FVIEW} Hz`, bx + bw, H - 12, { size: 10, color: pal.text2, align: 'right' });
    label(c, `${mo.fMax}`, fx(mo.fMax), H - 12, { size: 10, color: pal.amber, align: 'center' });

    if (pulse > 0) {
      c.strokeStyle = withAlpha(pal.ok, pulse * 0.8); c.lineWidth = 3;
      roundRect(c, 3, 3, W - 6, H - 6, 12); c.stroke();
    }
    // مؤشر حي على أن القراءة الكلية نفسها تغيّرت، لا الطيف وحده
    label(c, `القيمة الفعّالة المقروءة: ${r.rms.toFixed(2)} m/s²`, W - 10, mh - 6, { size: 11, color: pal.text2 });
  });

  refresh();
  return { destroy() { scope.destroy(); kit.destroy(); } };
}

// أيقونة طريقة التثبيت: البرغي غائر، واللصق طبقة رقيقة، والمغناطيس قاعدة مقوّسة،
// والمسبار عصا طويلة مرنة — والمرونة هي بالضبط ما يقتل الترددات العالية.
function drawMountIcon(c, cx, cy, s, pal, id) {
  c.save();
  c.strokeStyle = withAlpha(pal.text2, 0.75); c.lineWidth = 1.6; c.lineCap = 'round';
  c.fillStyle = withAlpha(pal.text2, 0.35);
  c.fillRect(cx - s * 0.8, cy + s * 0.3, s * 1.6, s * 0.22);   // سطح الآلة
  c.fillStyle = withAlpha(pal.badge, 0.85);
  const body = (dy) => { roundRect(c, cx - s * 0.3, cy + dy - s * 0.42, s * 0.6, s * 0.42, 3); c.fill(); };
  if (id === 'stud') {
    body(0);
    c.strokeStyle = pal.amber; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy + s * 0.52); c.stroke();
  } else if (id === 'adhesive') {
    body(-s * 0.08);
    c.fillStyle = withAlpha(pal.amber, 0.7);
    c.fillRect(cx - s * 0.34, cy - s * 0.08, s * 0.68, s * 0.36);
  } else if (id === 'magnet') {
    body(-s * 0.34);
    c.fillStyle = withAlpha(pal.amber, 0.7);
    c.beginPath(); c.arc(cx, cy + s * 0.3, s * 0.36, Math.PI, 0); c.fill();
  } else {
    body(-s * 0.9);
    c.strokeStyle = withAlpha(pal.amber, 0.9); c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(cx, cy - s * 0.48);
    c.bezierCurveTo(cx + s * 0.22, cy - s * 0.1, cx - s * 0.2, cy + s * 0.1, cx, cy + s * 0.3);
    c.stroke();
  }
  c.restore();
}

function sci(v) {
  const a = Math.abs(v);
  return a >= 0.01 ? v.toFixed(3) : v.toExponential(1);
}
