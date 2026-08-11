// الحر والجبري والتخميد: كتلة على نابض ومخمّد.
// اطرقها فتهتز بترددها الطبيعي وتتلاشى (حر)، أو ادفعها بقوة دورية فتهتز بتردد القوة بلا تلاشٍ (جبري).
// المعادلة المحلولة عدديًا: m·x″ + c·x′ + k·x = F₀·sin(2π·f·t) ، و c = ζ·2√(k·m).
import { SimKit, label, arrow, withAlpha } from './simkit.js';
import { Scope } from './scope.js';
import { CalcInput } from './labkit.js';

const H_FS = 100, H_N = 600;        // تاريخ 6 ثوانٍ لمنحنى الاستجابة
const STEP = 0.0005;                // خطوة تكامل ثابتة — مستقلة عن معدل الإطارات
const X0 = 0.02;                    // إزاحة الطرق الابتدائية (m)

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.62 });
  const read = kit.readout();
  const scope = new Scope(container, { height: 132 });
  kit.stage.after(scope.root);

  let x = 0, v = 0, acc = 0, ph = 0;
  let forced = false, forcedT = 0;
  let struck = false, since = 0;
  let msg = '', msgT = 0, pulse = 0;
  const hist = new Float64Array(H_N), lin = new Float64Array(H_N);
  let hIdx = 0, hAcc = 0, scAcc = 0;
  let bMax = 0, bT = 0; const buckets = [];
  const done = new Set();

  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  const P = () => {
    const k = kSl.value, m = mSl.value, z = zSl.value;
    const wn = Math.sqrt(k / m);
    return { k, m, z, wn, sig: z * wn, wd: wn * Math.sqrt(Math.max(1e-6, 1 - z * z)) };
  };
  const t10 = () => { const p = P(); return Math.LN10 / p.sig; };   // زمن التلاشي إلى 10%
  const refresh = () => { buckets.length = 0; bMax = 0; bT = 0; calc?.reset(t10()); };

  const kSl = kit.slider({ label: 'الصلابة k', min: 500, max: 8000, step: 100, value: 2000, unit: 'N/m', oninput: refresh });
  const mSl = kit.slider({ label: 'الكتلة m', min: 1, max: 20, step: 0.5, value: 5, unit: 'kg', fmt: n => n.toFixed(1), oninput: refresh });
  const zSl = kit.slider({ label: 'التخميد ζ', min: 0.02, max: 1, step: 0.02, value: 0.06, unit: '', fmt: n => n.toFixed(2), oninput: refresh });
  const fSl = kit.slider({ label: 'تردد القوة', min: 1, max: 20, step: 0.25, value: 8, unit: 'Hz', fmt: n => n.toFixed(2), oninput: refresh });

  kit.buttons([
    {
      label: 'اطرق', onclick: () => {
        forced = false; forcedT = 0; refresh();
        x = X0; v = 0; struck = true; since = 0;
        msg = 'اهتزاز حر: يبدأ بترددها الطبيعي ثم يتلاشى'; msgT = 3;
        if (zSl.value >= 0.98) complete('damp-high');
      },
    },
    {
      label: 'قوة دورية', cls: 'secondary', onclick: () => {
        forced = !forced; forcedT = 0; refresh();
        if (forced) { struck = false; msg = 'اهتزاز جبري: يتبع تردد القوة ولا يتلاشى'; }
        else { msg = 'أُوقفت القوة — راقب التلاشي'; }
        msgT = 3;
      },
    },
    { label: 'سكون', cls: 'ghost', onclick: () => { x = 0; v = 0; forced = false; struck = false; refresh(); } },
  ]);

  const calc = new CalcInput(kit.controls, {
    label: 'زمن التلاشي إلى عُشر السعة', unit: 's', ref: Math.LN10 / (0.06 * Math.sqrt(2000 / 5)), placeholder: '؟',
    onResult: err => {
      if (!struck) { msg = 'اطرق الكتلة أولًا ثم اقرأ زمن التلاشي'; msgT = 3; return; }
      if (err <= 10) complete('strike-decay');
    },
  });

  kit.loop((c, dt) => {
    const W = kit.W, H = kit.H;
    const p = P();
    const cDamp = p.z * 2 * Math.sqrt(p.k * p.m);
    const F0 = 0.02 * p.k;                       // انحراف ساكن ثابت 20 mm مهما تغيّرت k
    const wf = 2 * Math.PI * fSl.value;

    // ── تكامل بخطوة ثابتة (شبه ضمني) ──
    acc = Math.min(acc + dt, 0.1);
    while (acc >= STEP) {
      const F = forced ? F0 * Math.sin(wf * ph) : 0;
      const a = (F - cDamp * v - p.k * x) / p.m;
      v += a * STEP; x += v * STEP;
      ph += STEP; acc -= STEP;
      if (struck) since += STEP;
      if (forced) forcedT += STEP;
    }

    // مغلّف السعة من الحالة نفسها: A = √(x² + ((v+σx)/ω_d)²)
    const env = Math.sqrt(x * x + Math.pow((v + p.sig * x) / p.wd, 2));

    // ── تاريخ الاستجابة ──
    hAcc += dt;
    while (hAcc >= 1 / H_FS) { hist[hIdx] = x * 1000; hIdx = (hIdx + 1) % H_N; hAcc -= 1 / H_FS; }
    scAcc += dt;
    if (scAcc >= 0.09) {
      scAcc = 0;
      for (let i = 0; i < H_N; i++) lin[i] = hist[(hIdx + i) % H_N];
      scope.wave(lin, H_FS, { unit: 'mm', label: forced ? 'الاستجابة الجبرية — سعة ثابتة' : 'الاستجابة الحرة — تلاشٍ أسّي', color: forced ? kit.pal.amber : kit.pal.water });
    }

    // ── ثبات السعة الجبرية: ثلاث نوافذ متتالية من ثانية ──
    if (forced) {
      bMax = Math.max(bMax, Math.abs(x)); bT += dt;
      if (bT >= 1) {
        buckets.push(bMax); if (buckets.length > 3) buckets.shift();
        bMax = 0; bT = 0;
        if (forcedT >= 5 && buckets.length === 3) {
          const hi = Math.max(...buckets), lo = Math.min(...buckets);
          if (hi > 1e-4 && (hi - lo) / hi <= 0.08) complete('forced-steady');
        }
      }
    }

    // ═══ الرسم ═══
    const cx = W * 0.5, ceil = 14, rest = H * 0.60;
    const room = Math.min(rest - ceil - 46, H - rest - 34);
    const xp = Math.max(-room, Math.min(room, x * 2200));
    const my = rest + xp;

    // السقف الثابت
    c.strokeStyle = withAlpha(kit.pal.text, 0.55); c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 92, ceil); c.lineTo(cx + 92, ceil); c.stroke();
    c.lineWidth = 1.2;
    for (let i = 0; i < 10; i++) {
      const hx = cx - 90 + i * 20;
      c.beginPath(); c.moveTo(hx, ceil); c.lineTo(hx - 7, ceil - 8); c.stroke();
    }

    // النابض (يسار) — الزنبرك يتمدد ويتقلص مع الإزاحة
    const sx = cx - 42, len = my - 22 - ceil;
    c.strokeStyle = kit.pal.water; c.lineWidth = 2.2; c.beginPath();
    c.moveTo(sx, ceil); c.lineTo(sx, ceil + 8);
    for (let i = 0; i <= 8; i++) {
      const yy = ceil + 8 + (len - 16) * i / 8;
      c.lineTo(sx + (i % 2 ? 13 : -13), yy);
    }
    c.lineTo(sx, ceil + len - 8); c.lineTo(sx, ceil + len);
    c.stroke();

    // المخمّد (يمين): أسطوانة ثابتة ومكبس يتحرك
    const dx = cx + 42;
    c.strokeStyle = withAlpha(kit.pal.text2, 0.8); c.lineWidth = 2;
    c.beginPath(); c.moveTo(dx, ceil); c.lineTo(dx, ceil + 26); c.stroke();
    c.strokeRect(dx - 13, ceil + 26, 26, 34);
    c.beginPath(); c.moveTo(dx, ceil + 40); c.lineTo(dx, ceil + len); c.stroke();
    c.fillStyle = withAlpha(kit.pal.bad, 0.25 + 0.6 * p.z);
    c.fillRect(dx - 11, ceil + 28 + 26 * p.z, 22, 6);

    // الكتلة
    c.fillStyle = withAlpha(kit.pal.water2, 0.35);
    c.strokeStyle = pulse > 0 ? kit.pal.ok : kit.pal.water2; c.lineWidth = 2.4;
    c.fillRect(cx - 46, my - 22, 92, 44); c.strokeRect(cx - 46, my - 22, 92, 44);
    label(c, `${p.m.toFixed(1)} kg`, cx, my, { size: 13, color: kit.pal.text, align: 'center', weight: 800 });

    // خط الاتزان وسهم الإزاحة
    c.strokeStyle = withAlpha(kit.pal.text2, 0.4); c.setLineDash([5, 5]); c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 78, rest); c.lineTo(cx + 78, rest); c.stroke();
    c.setLineDash([]);
    if (Math.abs(xp) > 6) arrow(c, cx + 62, rest, cx + 62, my, { color: kit.pal.amber, width: 2, head: 6 });

    // سهم القوة الدورية
    if (forced) {
      const dir = Math.sin(wf * ph) >= 0 ? 1 : -1;
      arrow(c, cx - 78, my, cx - 78, my + dir * 24, { color: kit.pal.bad, width: 2.5, head: 7 });
      label(c, 'قوة دورية', cx - 84, my + dir * 34, { size: 11, color: kit.pal.bad, align: 'right' });
    }

    if (msgT > 0) { msgT -= dt; label(c, msg, W / 2, H - 10, { size: 11.5, color: kit.pal.amber, align: 'center' }); }
    else if (struck && p.z >= 0.98) label(c, 'تخميد حرج: عادت الكتلة للسكون قبل إتمام دورة واحدة', W / 2, H - 10, { size: 11.5, color: kit.pal.ok, align: 'center' });
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.2);

    read.set([
      { label: 'التردد الطبيعي', value: `${(p.wn / (2 * Math.PI)).toFixed(2)} Hz`, color: kit.pal.water },
      { label: 'السعة الآن', value: `${(env * 1000).toFixed(2)} mm`, color: kit.pal.amber },
      { label: struck ? 'منذ الطرق' : 'زمن القوة', value: `${(struck ? since : forcedT).toFixed(2)} s`, color: kit.pal.badge },
      { label: 'نسبة السعة', value: `${struck && X0 > 0 ? (env / X0 * 100).toFixed(0) : '—'} %`, color: kit.pal.ok },
    ]);
  });

  return { destroy() { scope.destroy(); kit.destroy(); } };
}
