// من الموجة إلى الطيف — جيبان يُجمعان في الأعلى، وطيفهما في الأسفل.
// القاعدة الوحيدة التي تحكم كل شيء هنا: Δf = fs ÷ N.
// وكل ما يراه المتدرب — اندماج القمّتين، انفصالهما، ظهور التسرّب وانحساره —
// نتيجةٌ لهذه القسمة وحدها لا لشيء آخر.
import { SimKit, label, withAlpha } from './simkit.js';
import { spectrum, topPeaks, WINDOWS } from './vibkit.js';
import { el } from '../ui.js';

const NS = [1024, 2048, 4096, 8192];
const FSS = [1280, 2560, 5120];
const WINS = ['rect', 'hann', 'flattop'];
const FVIEW = 260;                                  // مدى العرض الترددي على اللوحة

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.78 });
  const read = kit.readout();

  // الحالة الابتدائية: نغمة واحدة على مركز خانة بنافذة هانّ — لا مهمة تتحقق بها
  let f1 = 60, f2 = 60, a1 = 1.0, a2 = 0, ni = 0, fi = 2, wi = 1, pulse = 0;
  let sig = null, spec = null, peaks = [];
  let mergedAt = null, leakAt = null;                // مراحل المهام متعددة الخطوات
  const done = new Set();
  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  const N = () => NS[ni], FS = () => FSS[fi], DF = () => FSS[fi] / NS[ni];

  // ── الحساب المكلف: عند تغيّر الإعداد فقط، لا داخل حلقة الرسم ──
  function recompute() {
    const n = N(), fs = FS();
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++)
      x[i] = a1 * Math.sin(2 * Math.PI * f1 * i / fs) + a2 * Math.sin(2 * Math.PI * f2 * i / fs);
    sig = x;
    spec = spectrum(x, fs, { win: WINS[wi] });
    peaks = topPeaks(spec, { count: 5, fMin: 10, fMax: 400, minRel: 0.3 });
    check();
    paint();
  }

  // نسبة أرضية التسرّب حول قمة: متوسط السعة على بعد 5..40 خانة، منسوبًا إلى القمة
  function leakFloor(f, other) {
    const k0 = Math.round(f / spec.df), kOther = Math.round(other / spec.df);
    let s = 0, c = 0;
    for (let k = 1; k * spec.df <= 400 && k < spec.amp.length; k++) {
      const d = Math.abs(k - k0);
      if (d < 5 || d > 40 || Math.abs(k - kOther) < 5) continue;
      s += spec.amp[k]; c++;
    }
    return c ? (s / c) / Math.max(1e-12, spec.amp[k0]) : 0;
  }
  const binOffset = f => { const q = f / spec.df; return q - Math.round(q); };

  function check() {
    const gap = Math.abs(f2 - f1), df = DF(), pair = `${f1}|${f2}`;
    const two = a2 >= 0.5 * a1;

    // ① قمّتان منفصلتان بتردّدين متباعدين
    if (two && gap > 5 * df && peaks.length === 2) complete('two-peaks');

    // ② الاندماج ثم الانفصال — على التركيبة الترددية نفسها، بتغيير الدقة وحدها
    if (two && gap > 0 && gap < 2 * df && peaks.length === 1) mergedAt = pair;
    if (two && mergedAt === pair && gap > 3 * df && peaks.length === 2) complete('resolution');

    // ③ التسرّب: نافذة مستطيلة وتردد خارج مركز الخانة، ثم هانّ فينحسر
    const off = Math.abs(binOffset(f1)), floor = leakFloor(f1, f2);
    if (WINS[wi] === 'rect' && off > 0.25 && floor > 5e-3) leakAt = `${f1}|${N()}|${FS()}`;
    if (WINS[wi] === 'hann' && leakAt === `${f1}|${N()}|${FS()}` && floor < 1e-3) complete('leakage');
  }

  // ── التحكمات ──
  const s1 = kit.slider({ label: 'تردد الجيب الأول', min: 20, max: 200, step: 0.5, value: f1, unit: 'Hz', fmt: v => v.toFixed(1), oninput: v => { f1 = v; recompute(); } });
  const s2 = kit.slider({ label: 'تردد الجيب الثاني', min: 20, max: 200, step: 0.5, value: f2, unit: 'Hz', fmt: v => v.toFixed(1), oninput: v => { f2 = v; recompute(); } });
  const g1 = kit.slider({ label: 'سعة الأول', min: 0, max: 1, step: 0.05, value: a1, fmt: v => v.toFixed(2), oninput: v => { a1 = v; recompute(); } });
  const g2 = kit.slider({ label: 'سعة الثاني', min: 0, max: 1, step: 0.05, value: a2, fmt: v => v.toFixed(2), oninput: v => { a2 = v; recompute(); } });

  const nBtns = kit.buttons(NS.map((n, i) => ({ label: `N = ${n}`, onclick: () => { ni = i; recompute(); } })));
  const fBtns = kit.buttons(FSS.map((f, i) => ({ label: `fs = ${f} Hz`, onclick: () => { fi = i; recompute(); } })));
  const wBtns = kit.buttons(WINS.map((w, i) => ({ label: WINDOWS[w].label, onclick: () => { wi = i; recompute(); } })));

  const paint = () => {
    nBtns.forEach((b, i) => { b.className = `btn sm ${i === ni ? '' : 'secondary'}`; });
    fBtns.forEach((b, i) => { b.className = `btn sm ${i === fi ? '' : 'secondary'}`; });
    wBtns.forEach((b, i) => { b.className = `btn sm ${i === wi ? '' : 'secondary'}`; });
    read.set([
      { label: 'دقة التردد', value: `Δf = ${FS()} ÷ ${N()} = ${DF().toFixed(3)} Hz`, color: kit.pal.amber },
      { label: 'الفارق بين الترددين', value: `${Math.abs(f2 - f1).toFixed(1)} Hz = ${(Math.abs(f2 - f1) / DF()).toFixed(1)} × Δf`, color: kit.pal.water },
      { label: 'قمم رصدها المحلّل', value: `${peaks.length}`, color: peaks.length > 1 ? kit.pal.ok : kit.pal.text2 },
      { label: 'إزاحة الأول عن مركز الخانة', value: `${binOffset(f1).toFixed(2)}`, color: kit.pal.badge },
    ]);
  };

  // زر مساعد: يضبط حالة اندماج مؤكدة (Δf = 5 Hz وفارق 3 Hz)، ثم يبقى الحلّ بيد المتدرب
  kit.buttons([{
    label: 'اضبط حالة الاندماج — ثم ارفع عدد العينات بنفسك', cls: 'ghost',
    onclick: () => { ni = 0; fi = 2; g1.set(1); g2.set(0.9); s1.set(60); s2.set(63); },
  }]);

  kit.controls.append(el('div', { class: 'card' },
    el('div', { style: 'font-weight:800; color:var(--c-amber); margin-bottom:6px' }, 'القاعدة العملية'),
    el('div', { class: 'small' },
      'دقة التردد ', el('span', { class: 'ltr' }, 'Δf = fs ÷ N'),
      '. لفصل قمّتين متقاربتين ليس أمامك إلا طريقان: ارفع عدد العينات ',
      el('span', { class: 'ltr' }, 'N'), '، أو اخفض النطاق فينخفض ',
      el('span', { class: 'ltr' }, 'fs'),
      ' — ولا شيء ثالث. وقاعدة اختيار النطاق: ',
      el('span', { class: 'ltr' }, 'fs = 2.56 × أعلى تردد'), ' تريد رؤيته.'),
    el('div', { class: 'small', style: 'margin-top:6px; color:var(--c-text2)' },
      'والنافذة لا تغيّر Δf، بل تكبح ذيل القمة: المستطيلة تنشر التسرّب، وهانّ تحصره، والمسطّحة القمة تُعطي أدق سعة.'),
  ));

  // ── اللوحة: موجة في الأعلى وطيف في الأسفل ──
  kit.loop((c, dt) => {
    if (!spec) return;
    const W = kit.W, H = kit.H, p = kit.pal;
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.4);
    const L = 44, R = W - 12, gw = R - L;

    // ① الموجة الزمنية المركّبة
    const wTop = 22, wH = H * 0.34, mid = wTop + wH / 2;
    const ms = 60, span = Math.min(sig.length, Math.round(FS() * ms / 1000));
    let mx = 1e-9;
    for (let i = 0; i < span; i++) mx = Math.max(mx, Math.abs(sig[i]));
    c.strokeStyle = withAlpha(p.text2, 0.3); c.lineWidth = 1;
    c.beginPath(); c.moveTo(L, mid); c.lineTo(R, mid); c.stroke();
    c.strokeStyle = p.water; c.lineWidth = 1.6; c.beginPath();
    const st = Math.max(1, Math.floor(span / (gw * 2)));
    for (let i = 0, k = 0; i < span; i += st, k++) {
      const x = L + gw * i / span, y = mid - sig[i] / mx * (wH / 2) * 0.92;
      k ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    label(c, 'الموجة الزمنية — ماذا يحدث', R, wTop - 10, { size: 11.5, color: p.water });
    label(c, `${ms} ms`, R, wTop + wH + 10, { size: 10, color: p.text2 });

    // ② الطيف — المقياس الرأسي مضغوط كي تُرى أرضية التسرّب لا القمم وحدها
    const sTop = wTop + wH + 26, sH = H - sTop - 30, base = sTop + sH;
    const kMax = Math.min(spec.amp.length - 1, Math.floor(FVIEW / spec.df));
    let smax = 1e-12;
    for (let k = 1; k <= kMax; k++) smax = Math.max(smax, spec.amp[k]);
    c.strokeStyle = withAlpha(p.text2, 0.18);
    for (let i = 0; i <= 3; i++) { const y = sTop + sH * i / 3; c.beginPath(); c.moveTo(L, y); c.lineTo(R, y); c.stroke(); }
    c.strokeStyle = p.amber; c.lineWidth = 1;
    for (let px = 0; px < gw; px++) {
      const k0 = Math.max(1, Math.floor(kMax * px / gw)), k1 = Math.max(k0, Math.floor(kMax * (px + 1) / gw));
      let m = 0;
      for (let k = k0; k <= k1; k++) m = Math.max(m, spec.amp[k]);
      const h = sH * Math.pow(m / smax, 0.4) * 0.94;
      if (h < 0.4) continue;
      c.beginPath(); c.moveTo(L + px + 0.5, base); c.lineTo(L + px + 0.5, base - h); c.stroke();
    }
    // مواضع الجيبين الحقيقية
    for (const [f, on] of [[f1, a1 > 0], [f2, a2 > 0]]) {
      if (!on || f > FVIEW) continue;
      const x = L + gw * f / FVIEW;
      c.save(); c.setLineDash([3, 3]); c.strokeStyle = withAlpha(p.badge, 0.7);
      c.beginPath(); c.moveTo(x, sTop); c.lineTo(x, base); c.stroke(); c.restore();
    }
    // القمم التي رصدها المحلّل فعلًا
    for (const pk of peaks) {
      if (pk.f > FVIEW) continue;
      const x = L + gw * pk.f / FVIEW, y = base - sH * Math.pow(pk.amp / smax, 0.4) * 0.94;
      c.fillStyle = p.ok; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill();
      label(c, `${pk.f.toFixed(1)} Hz`, x, y - 10, { size: 10, color: p.ok, align: 'center' });
    }
    label(c, 'الطيف الترددي — لماذا يحدث', R, sTop - 10, { size: 11.5, color: p.amber });
    label(c, '0', L, base + 11, { size: 10, color: p.text2, align: 'center' });
    label(c, `${FVIEW} Hz`, R, base + 11, { size: 10, color: p.text2, align: 'right' });
    label(c, `Δf = ${FS()} ÷ ${N()} = ${DF().toFixed(3)} Hz`, L, base + 26, { size: 12, color: p.amber, align: 'left', weight: 800 });
    label(c, `نافذة ${WINDOWS[WINS[wi]].label} · المقياس الرأسي مضغوط لإظهار الأرضية`, R, base + 26, { size: 10.5, color: p.text2 });

    // حالة الاندماج معلنة صراحةً
    const gap = Math.abs(f2 - f1);
    if (a2 >= 0.5 * a1 && gap > 0) {
      const merged = peaks.length < 2;
      label(c, merged ? `❌ قمّة واحدة: الفارق ${(gap / DF()).toFixed(1)} × Δf — أقل مما يفصل` :
        `✅ قمّتان منفصلتان: الفارق ${(gap / DF()).toFixed(1)} × Δf`,
        W / 2, 12, { size: 12, color: merged ? p.bad : p.ok, align: 'center', weight: 800 });
    }
    if (pulse > 0) {
      c.strokeStyle = withAlpha(p.ok, pulse * 0.8); c.lineWidth = 3;
      c.beginPath(); c.rect(3, 3, W - 6, H - 6); c.stroke();
    }
  });

  recompute();
  return { destroy() { kit.destroy(); } };
}
