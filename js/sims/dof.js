// درجات الحرية: عدد الترددات الطبيعية = عدد درجات الحرية.
// كتلة واحدة → قمة واحدة في منحنى المسح. أضف كتلة ثانية بنابض ثانٍ → قمّتان بينهما قاع.
// المنحنى استجابة ترددية حقيقية بتخميد هستيري: |X₁|·k₁/F مقابل تردد الإثارة.
import { SimKit, label, arrow, withAlpha } from './simkit.js';

const ETA = 0.05;                 // تخميد هستيري — يمنع القمم اللانهائية
const M1 = 4, M2 = 2, K2 = 1200;  // kg و kg و N/m
const F0 = 0.5, F1 = 14, NB = 280;  // مدى المسح Hz وعدد نقاط المنحنى

// التردد(ات) الطبيعية بالهرتز
function nat(k1, two) {
  const wn = Math.sqrt(k1 / M1) / (2 * Math.PI);
  if (!two) return [wn];
  const a = M1 * M2, b = -((k1 + K2) * M2 + M1 * K2), q = k1 * K2;
  const d = Math.sqrt(Math.max(0, b * b - 4 * a * q));
  return [Math.sqrt((-b - d) / (2 * a)) / (2 * Math.PI), Math.sqrt((-b + d) / (2 * a)) / (2 * Math.PI)];
}

// التضخيم عند تردد f: [استجابة الكتلة 1، استجابة الكتلة 2]
function resp(f, k1, two) {
  const w2 = Math.pow(2 * Math.PI * f, 2);
  if (!two) return [k1 / Math.hypot(k1 - w2 * M1, ETA * k1), 0];
  const Ar = k1 + K2 - w2 * M1, Ai = ETA * (k1 + K2);
  const Br = K2 - w2 * M2, Bi = ETA * K2;
  const Cr = K2 * K2 * (1 - ETA * ETA), Ci = 2 * ETA * K2 * K2;
  const D = Math.hypot(Ar * Br - Ai * Bi - Cr, Ar * Bi + Ai * Br - Ci);
  return [k1 * Math.hypot(Br, Bi) / D, k1 * K2 / D];
}

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.8 });
  const read = kit.readout();

  let two = false, phase = 0, pulse = 0, msg = '', msgT = 0;
  let hit1 = false, hit2 = false;
  const curve = new Float64Array(NB + 1);
  let cMax = 1, fns = [];
  const done = new Set();

  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  const rebuild = () => {
    const k1 = kSl.value;
    fns = nat(k1, two);
    cMax = 1e-9;
    for (let i = 0; i <= NB; i++) {
      curve[i] = resp(F0 + (F1 - F0) * i / NB, k1, two)[0];
      if (curve[i] > cMax) cMax = curve[i];
    }
    hit1 = hit2 = false;
    check();
  };

  // تحقّق المهام من موضع منزلق المسح مقارنةً بالترددات الطبيعية الحية
  const check = () => {
    const f = fSl.value;
    const near = i => fns[i] && Math.abs(f - fns[i]) / fns[i] <= 0.05;
    if (!two) { if (near(0)) complete('one-dof'); return; }
    if (near(0)) hit1 = true;
    if (near(1)) hit2 = true;
    if (hit1 && hit2) complete('two-dof');
  };

  const kSl = kit.slider({
    label: 'الصلابة k', min: 1000, max: 16000, step: 100, value: 2000, unit: 'N/m',
    oninput: () => rebuild(),
  });
  const fSl = kit.slider({
    label: 'مسح التردد', min: F0, max: F1, step: 0.02, value: F0, unit: 'Hz',
    fmt: v => v.toFixed(2), oninput: () => check(),
  });

  const modeBtn = kit.buttons([
    { label: 'أضف كتلة ثانية', onclick: () => { two = !two; modeBtn[0].textContent = two ? 'احذف الكتلة الثانية' : 'أضف كتلة ثانية'; rebuild(); } },
    {
      label: 'ضاعف الصلابة', cls: 'ghost', onclick: () => {
        if (two) { msg = 'المهمة على منظومة الدرجة الواحدة — احذف الكتلة الثانية'; msgT = 3.5; return; }
        const before = nat(kSl.value, false)[0];
        if (kSl.value * 2 > 16000) { msg = 'خفّض الصلابة أولًا كي تتسع المضاعفة للمدى'; msgT = 3.5; return; }
        kSl.set(kSl.value * 2);
        const after = nat(kSl.value, false)[0];
        msg = `التردد الطبيعي ارتفع من ${before.toFixed(2)} إلى ${after.toFixed(2)} هرتز — بمقدار الجذر التربيعي للاثنين`;
        msgT = 5;
        if (Math.abs(after / before - Math.SQRT2) <= 0.02) complete('stiffer-up');
      },
    },
  ]);

  rebuild();

  kit.loop((c, dt) => {
    const W = kit.W, H = kit.H;
    const f = fSl.value, k1 = kSl.value;
    const [a1, a2] = resp(f, k1, two);
    check();                                            // الرصد لا يفوت قمة عند السحب السريع
    phase += dt * 2 * Math.PI * Math.min(f, 3.5);      // حركة مبطّأة كي تُرى
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.2);
    if (msgT > 0) msgT -= dt;

    // ═══ المنظومة ═══
    const base = H * 0.55, ceil = 12, cx = W * 0.5;
    const y1 = ceil + (base - ceil) * (two ? 0.36 : 0.55);
    const y2 = ceil + (base - ceil) * 0.80;
    const sw = Math.sin(phase);
    const d1 = Math.max(-16, Math.min(16, 16 * a1 / cMax)) * sw;
    const d2 = two ? Math.max(-16, Math.min(16, 16 * a2 / cMax)) * sw : 0;

    c.strokeStyle = withAlpha(kit.pal.text, 0.55); c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 76, ceil); c.lineTo(cx + 76, ceil); c.stroke();
    c.lineWidth = 1.1;
    for (let i = 0; i < 8; i++) { const hx = cx - 74 + i * 21; c.beginPath(); c.moveTo(hx, ceil); c.lineTo(hx - 6, ceil - 7); c.stroke(); }

    spring(c, cx, ceil, y1 + d1 - 15, kit.pal.water, 1 + k1 / 16000);
    block(c, kit, cx, y1 + d1, 'm₁', pulse);
    if (two) {
      spring(c, cx, y1 + d1 + 15, y2 + d2 - 15, kit.pal.water2, 1);
      block(c, kit, cx, y2 + d2, 'm₂', pulse);
    }
    // قوة الإثارة على الكتلة الأولى
    arrow(c, cx - 62, y1 + d1, cx - 62, y1 + d1 + (sw >= 0 ? 18 : -18), { color: kit.pal.bad, width: 2.2, head: 6 });
    label(c, 'إثارة', cx - 68, y1 + d1 - 16, { size: 10.5, color: kit.pal.bad, align: 'right' });
    label(c, two ? 'درجتا حرية → ترددان طبيعيان' : 'درجة حرية واحدة → تردد طبيعي واحد',
      W - 8, ceil + 6, { size: 11.5, color: kit.pal.badge, align: 'right' });

    // ═══ منحنى المسح ═══
    const px0 = 38, px1 = W - 10, py1 = H - 20, py0 = H * 0.60;
    const gw = px1 - px0, gh = py1 - py0;
    c.strokeStyle = withAlpha(kit.pal.text2, 0.16); c.lineWidth = 1;
    for (let i = 0; i <= 3; i++) { const y = py0 + gh * i / 3; c.beginPath(); c.moveTo(px0, y); c.lineTo(px1, y); c.stroke(); }
    c.strokeStyle = withAlpha(kit.pal.text2, 0.5);
    c.beginPath(); c.moveTo(px0, py1); c.lineTo(px1, py1); c.stroke();

    const fx = v => px0 + gw * (v - F0) / (F1 - F0);
    c.strokeStyle = pulse > 0 ? kit.pal.ok : kit.pal.amber; c.lineWidth = 2; c.beginPath();
    for (let i = 0; i <= NB; i++) {
      const X = px0 + gw * i / NB, Y = py1 - gh * (curve[i] / cMax) * 0.94;
      i ? c.lineTo(X, Y) : c.moveTo(X, Y);
    }
    c.stroke();

    // علامات الترددات الطبيعية
    c.setLineDash([3, 3]); c.lineWidth = 1;
    fns.forEach((fn, i) => {
      c.strokeStyle = withAlpha(kit.pal.ok, 0.8);
      c.beginPath(); c.moveTo(fx(fn), py0); c.lineTo(fx(fn), py1); c.stroke();
      label(c, `f${i + 1}`, fx(fn), py0 - 7, { size: 10.5, color: kit.pal.ok, align: 'center' });
    });
    c.setLineDash([]);

    // مؤشّر المسح
    c.strokeStyle = kit.pal.water; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(fx(f), py0 - 3); c.lineTo(fx(f), py1); c.stroke();
    c.fillStyle = kit.pal.water;
    c.beginPath(); c.arc(fx(f), py1 - gh * (a1 / cMax) * 0.94, 4, 0, Math.PI * 2); c.fill();
    label(c, 'التضخيم', px0 - 5, py0 + 6, { size: 10, align: 'right' });
    label(c, `${F0} Hz`, px0, py1 + 11, { size: 10, align: 'center' });
    label(c, `${F1} Hz`, px1, py1 + 11, { size: 10, align: 'center' });

    if (msgT > 0) label(c, msg, W / 2, py0 - 20, { size: 11.5, color: kit.pal.amber, align: 'center' });
    else if (two && hit1 !== hit2) label(c, 'وجدت قمة واحدة — ابحث عن الأخرى', W / 2, py0 - 20, { size: 11.5, color: kit.pal.badge, align: 'center' });

    read.set([
      { label: 'درجات الحرية', value: two ? '2' : '1', color: kit.pal.badge },
      { label: 'تردد الإثارة', value: `${f.toFixed(2)} Hz`, color: kit.pal.water },
      { label: fns.length > 1 ? 'الطبيعيان' : 'الطبيعي', value: fns.map(n => n.toFixed(2)).join(' / ') + ' Hz', color: kit.pal.ok },
      { label: 'التضخيم', value: `×${a1.toFixed(1)}`, color: a1 > cMax * 0.6 ? kit.pal.bad : kit.pal.amber },
    ]);
  });

  return { destroy() { kit.destroy(); } };
}

// نابض زنبركي بين ارتفاعين (عدد اللفات ثابت — العرض يضيق كلما زادت الصلابة)
function spring(c, cx, yTop, yBot, color, tight) {
  const len = Math.max(8, yBot - yTop), w = 13 / Math.max(1, tight);
  c.strokeStyle = color; c.lineWidth = 2.2; c.beginPath();
  c.moveTo(cx, yTop); c.lineTo(cx, yTop + len * 0.12);
  for (let i = 0; i <= 7; i++) c.lineTo(cx + (i % 2 ? w : -w), yTop + len * (0.12 + 0.76 * i / 7));
  c.lineTo(cx, yTop + len * 0.88); c.lineTo(cx, yBot);
  c.stroke();
}

// كتلة
function block(c, kit, cx, cy, name, pulse) {
  c.fillStyle = withAlpha(kit.pal.water2, 0.3);
  c.strokeStyle = pulse > 0 ? kit.pal.ok : kit.pal.water2; c.lineWidth = 2.2;
  c.fillRect(cx - 34, cy - 15, 68, 30); c.strokeRect(cx - 34, cy - 15, 68, 30);
  label(c, name, cx, cy, { size: 13, color: kit.pal.text, align: 'center', weight: 800 });
}
