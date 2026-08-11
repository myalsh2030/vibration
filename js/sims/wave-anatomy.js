// تشريح موجة الاهتزاز: الموجة الجيبية **هي** دوران العمود مرسومًا على محور الزمن.
// عمود يدور + نبضة مرجع (tacho) مرة كل دورة + مؤشّر يمشي على الموجة بالطور نفسه،
// فيرى المتدرب بعينه أن دورة كاملة على الموجة = لفة كاملة للعمود.
import { SimKit, label, arrow, withAlpha } from './simkit.js';
import { shaftHz } from './vibkit.js';
import { CalcInput } from './labkit.js';

const WIN = 0.2;            // نافذة العرض على محور الزمن (ثانية) — ثابتة كشاشة راسم إشارة

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.66 });
  const read = kit.readout();

  let tau = 0;              // الزمن داخل النافذة (ث) — يلف من 0 إلى WIN
  let revs = 0;             // عدّاد اللفات المكتملة منذ بدء النافذة
  let flash = 0;            // وهج نبضة المرجع
  let pulse = 0;            // وهج إنجاز مهمة
  let hint = '';            // رسالة إرشاد فوق اللوحة
  const done = new Set();

  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); pulse = 1; ctx.completeMission(id);
  };

  const rpmSl = kit.slider({
    label: 'سرعة الدوران', min: 300, max: 3600, step: 30, value: 900, unit: 'RPM',
    oninput: v => { hint = ''; calc.reset(1000 / shaftHz(v)); if (v === 1500) complete('hz-25'); },
  });
  const ampSl = kit.slider({ label: 'السعة', min: 0.2, max: 2, step: 0.05, value: 1, unit: 'mm', fmt: v => v.toFixed(2) });
  const phSl = kit.slider({
    label: 'الطور', min: 0, max: 360, step: 5, value: 0, unit: '°',
    oninput: v => { if (v >= 85 && v <= 95) complete('phase-shift'); },
  });

  // إدخال الزمن الدوري — المرجع يتبع السرعة الحالية، والمهمة تشترط 1500 RPM
  const calc = new CalcInput(kit.controls, {
    label: 'اقرأ الزمن الدوري', unit: 'ms', ref: 1000 / shaftHz(900), placeholder: '؟',
    onResult: (err) => {
      if (rpmSl.value !== 1500) { hint = 'اضبط السرعة على 1500 لفة/دقيقة أولًا'; return; }
      hint = '';
      if (err <= 5) complete('period-read');
    },
  });

  kit.loop((c, dt, t) => {
    const W = kit.W, H = kit.H;
    const rpm = rpmSl.value, A = ampSl.value, phDeg = phSl.value;
    const f = shaftHz(rpm);              // Hz
    const T = 1 / f;                     // s
    const ph = phDeg * Math.PI / 180;

    // ── الزمن: يمشي بسرعة مبطّأة كي تُرى الدورة، ويلف عند حافة النافذة ──
    const prev = tau;
    tau += dt * 0.25;
    if (tau >= WIN) { tau -= WIN; revs = 0; }
    // نبضة المرجع: مرة واحدة كل لفة كاملة للعمود
    const nPrev = Math.floor(f * prev + phDeg / 360);
    const nNow = Math.floor(f * tau + phDeg / 360);
    if (nNow > nPrev) { flash = 1; revs++; }
    flash = Math.max(0, flash - dt * 3.2);
    if (pulse > 0) pulse = Math.max(0, pulse - dt * 1.2);

    const ang = 2 * Math.PI * f * tau + ph;   // زاوية العمود = طور الموجة تمامًا
    const yNow = Math.sin(ang);

    // ── تخطيط اللوحة: العمود يمينًا (RTL)، والموجة على بقية العرض ──
    const rotR = Math.min(H * 0.24, W * 0.13);
    const rcx = W - rotR - 14, rcy = H * 0.5;
    const gx0 = 14, gx1 = rcx - rotR - 24;
    const gw = Math.max(60, gx1 - gx0);
    const mid = H * 0.5, half = H * 0.30;

    // شبكة ومحور الزمن
    c.strokeStyle = withAlpha(kit.pal.text2, 0.16); c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = mid - half + (2 * half) * i / 4;
      c.beginPath(); c.moveTo(gx0, y); c.lineTo(gx0 + gw, y); c.stroke();
    }
    c.strokeStyle = withAlpha(kit.pal.text2, 0.45);
    c.beginPath(); c.moveTo(gx0, mid); c.lineTo(gx0 + gw, mid); c.stroke();

    // ── الموجة: y = A·sin(2πf·τ + φ) عبر النافذة كاملة ──
    const px = s => gx0 + gw * s / WIN;
    const py = v => mid - v * half * (A / 2);
    c.strokeStyle = pulse > 0 ? kit.pal.ok : kit.pal.water;
    c.lineWidth = 2; c.beginPath();
    const steps = Math.min(240, Math.max(80, Math.round(gw)));
    for (let i = 0; i <= steps; i++) {
      const s = WIN * i / steps;
      const v = Math.sin(2 * Math.PI * f * s + ph);
      i ? c.lineTo(px(s), py(v)) : c.moveTo(px(s), py(v));
    }
    c.stroke();

    // مؤشّر يمشي على الموجة بالتزامن مع العمود
    c.fillStyle = kit.pal.amber;
    c.beginPath(); c.arc(px(tau), py(yNow), 4.5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = withAlpha(kit.pal.amber, 0.35);
    c.beginPath(); c.moveTo(px(tau), mid - half); c.lineTo(px(tau), mid + half); c.stroke();

    // ── علامة زمن دوري واحد بسهم مزدوج ──
    const ty = mid + half + 12;
    const x1 = px(0), x2 = px(Math.min(T, WIN));
    if (x2 - x1 > 26) {
      const cxm = (x1 + x2) / 2;
      arrow(c, cxm, ty, x1 + 1, ty, { color: kit.pal.amber, width: 2, head: 6 });
      arrow(c, cxm, ty, x2 - 1, ty, { color: kit.pal.amber, width: 2, head: 6 });
      label(c, `T = ${(T * 1000).toFixed(1)} ms`, cxm, ty + 13, { size: 12, color: kit.pal.amber, align: 'center' });
    } else {
      label(c, `T = ${(T * 1000).toFixed(1)} ms — دورة واحدة أضيق من أن تُعلَّم`, gx0 + gw, ty + 6, { size: 11, align: 'right' });
    }
    label(c, `نافذة العرض ${(WIN * 1000).toFixed(0)} ms`, gx0, mid - half - 8, { size: 10.5, align: 'left' });

    // ── الآلة الدوّارة: قرص + نقطة ثقيلة + علامة المرجع ──
    c.strokeStyle = withAlpha(kit.pal.text, 0.5); c.lineWidth = 2;
    c.beginPath(); c.arc(rcx, rcy, rotR, 0, Math.PI * 2); c.stroke();
    c.fillStyle = withAlpha(kit.pal.text, 0.07);
    c.beginPath(); c.arc(rcx, rcy, rotR, 0, Math.PI * 2); c.fill();
    // علامة المرجع الثابتة (حسّاس tacho) أعلى القرص
    const tacho = flash > 0.02 ? kit.pal.ok : withAlpha(kit.pal.text2, 0.55);
    c.fillStyle = tacho;
    c.fillRect(rcx - 2, rcy - rotR - 12, 4, 9);
    if (flash > 0.02) {
      c.strokeStyle = withAlpha(kit.pal.ok, flash);
      c.lineWidth = 3;
      c.beginPath(); c.arc(rcx, rcy, rotR + 6 * flash, 0, Math.PI * 2); c.stroke();
    }
    // العمود والنقطة الدوّارة (الزاوية 0 عند الأعلى كي توافق قمة الجيب)
    const kx = rcx + rotR * 0.72 * Math.sin(ang), ky = rcy - rotR * 0.72 * Math.cos(ang);
    c.strokeStyle = kit.pal.water; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(rcx, rcy); c.lineTo(kx, ky); c.stroke();
    c.fillStyle = kit.pal.amber;
    c.beginPath(); c.arc(kx, ky, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = kit.pal.text2;
    c.beginPath(); c.arc(rcx, rcy, 3.5, 0, Math.PI * 2); c.fill();
    // خط الإسقاط: ارتفاع النقطة = قيمة الموجة الآن
    c.strokeStyle = withAlpha(kit.pal.amber, 0.4);
    c.setLineDash([4, 4]); c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(px(tau), py(yNow)); c.lineTo(kx, ky); c.stroke();
    c.setLineDash([]);
    label(c, 'نبضة مرجع كل لفة', rcx, rcy + rotR + 14, { size: 10.5, align: 'center', color: flash > 0.02 ? kit.pal.ok : undefined });

    // ── رسالة علوية ──
    if (hint) label(c, hint, W / 2, 12, { size: 12, color: kit.pal.bad, align: 'center' });
    else if (phDeg >= 85 && phDeg <= 95) label(c, 'الموجة تبدأ من قمتها — طور 90°', W / 2, 12, { size: 12, color: kit.pal.ok, align: 'center' });
    else if (rpm === 1500) label(c, 'التردد الآن 25 هرتز بالضبط — أي 1500 مقسومة على 60', W / 2, 12, { size: 12, color: kit.pal.ok, align: 'center' });

    read.set([
      { label: 'التردد', value: `${f.toFixed(2)} Hz`, color: kit.pal.water },
      { label: 'الزمن الدوري T', value: `${(T * 1000).toFixed(1)} ms`, color: kit.pal.amber },
      { label: 'دورات معروضة', value: `${(f * WIN).toFixed(1)}`, color: kit.pal.badge },
      { label: 'لفات منذ الحافة', value: `${revs}`, color: kit.pal.ok },
    ]);
  });

  return { destroy() { kit.destroy(); } };
}
