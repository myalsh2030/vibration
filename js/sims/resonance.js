// الرنين والسرعة الحرجة — آلة سليمة تمامًا تهتز اهتزازًا مدمّرًا لمجرد أن سرعتها لامست ترددها الطبيعي.
// كل ما يُعرض مشتقّ من عامل التضخيم Mag = 1 ÷ √[(1−r²)² + (r÷Q)²] حيث r = f ÷ fn — يُحسب هنا ولا يُعرض.
// fn من الصلابة والكتلة: fn = √(k/m) ÷ 2π ، وQ = 1 ÷ 2ζ. الطور يمرّ بـ90° عند الرنين بالضبط.
import { SimKit, label, arrow, withAlpha } from './simkit.js';
import { el } from '../ui.js';

const MASS = 1200;                       // kg — كتلة الآلة على قاعدتها
const K0 = 20;                           // MN/m — صلابة البداية
const RPM_MIN = 200, RPM_MAX = 4000;
const IDS = ['find-critical', 'amplify', 'pass-through', 'stiffen-fix'];

const fnOf = k => Math.sqrt(k * 1e6 / MASS) / (2 * Math.PI);            // Hz
const magOf = (r, Q) => 1 / Math.sqrt((1 - r * r) ** 2 + (r / Q) ** 2);
const phaseOf = (r, Q) => Math.atan2(r / Q, 1 - r * r) * 180 / Math.PI; // 0 → 180، و90 عند r = 1
const peakOf = Q => Q / Math.sqrt(Math.max(1e-6, 1 - 1 / (4 * Q * Q))); // ذروة المنحنى ≈ Q

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.86 });
  const read = kit.readout();

  const done = new Set(IDS.filter(i => ctx.isMissionDone?.(i)));
  const complete = id => {
    if (done.has(id)) return;
    done.add(id); glow = 1; ctx.completeMission(id); showCard();
  };

  let rot = 0;                 // زاوية الدوّار المرسومة
  let revLo = 1050, revHi = 1350;   // مدى السرعات التي جرّبها المتدرب (كشف المنحنى)
  let atPeak = false, belowSeen = false, aboveT = 0, sweepT0 = 0, glow = 0;

  const rpmSl = kit.slider({ label: 'سرعة التشغيل', min: RPM_MIN, max: RPM_MAX, step: 10, value: 1200, unit: 'RPM' });
  const kSl = kit.slider({ label: 'صلابة القاعدة', min: 3, max: 120, step: 1, value: K0, unit: 'MN/m' });
  const zSl = kit.slider({ label: 'التخميد ζ', min: 0.02, max: 0.3, step: 0.01, value: 0.05, fmt: v => v.toFixed(2) });

  kit.buttons([{ label: 'مسح السرعة', cls: 'ghost', onclick: () => { sweepT0 = performance.now(); } }]);

  numBox(kit.controls, 'السرعة الحرجة', 'RPM', v => {
    const fc = fnOf(kSl.value) * 60;
    if (!atPeak) return { ok: false, msg: 'ابلغ قمة الاهتزاز أولًا ثم سجّل القراءة' };
    const err = Math.abs(v - fc) / fc * 100;
    if (err <= 5) complete('find-critical');
    return { ok: err <= 5, msg: err <= 5 ? `مضبوط — خطأ ${err.toFixed(1)}%` : `بعيد — خطأ ${err.toFixed(0)}%` };
  });

  numBox(kit.controls, 'نسبة التضخيم عند الرنين ÷ عند نصف الحرجة', '×', v => {
    const fc = fnOf(kSl.value) * 60, Q = 1 / (2 * zSl.value);
    if (revHi < fc || revLo > fc * 0.5) return { ok: false, msg: 'اكشف المنحنى من نصف الحرجة حتى قمّته' };
    const ref = peakOf(Q) / magOf(0.5, Q);
    const err = Math.abs(v - ref) / ref * 100;
    if (err <= 15) complete('amplify');
    return { ok: err <= 15, msg: err <= 15 ? `صحيح — خطأ ${err.toFixed(0)}%` : `أعد القراءة — خطأ ${err.toFixed(0)}%` };
  });

  const card = el('div', { class: 'card small', style: 'display:none; margin-top:12px; border-right:3px solid var(--c-ok)' },
    el('div', { style: 'font-weight:800; color:var(--c-ok); margin-bottom:6px' }, 'علاجات الرنين ثلاثة لا رابع لها'),
    el('div', {}, '١ — غيّر سرعة التشغيل: أبعِدها عن السرعة الحرجة بأكثر من ', el('span', { class: 'ltr' }, '25%'), '.'),
    el('div', {}, '٢ — صلّب القاعدة: رفع الصلابة يرفع التردد الطبيعي فتنزاح السرعة الحرجة لأعلى.'),
    el('div', {}, '٣ — أضف كتلة: زيادة الكتلة تخفض التردد الطبيعي فتنزاح السرعة الحرجة لأسفل.'),
    el('div', { class: 'muted', style: 'margin-top:6px' }, 'والتخميد يخفّف الذروة ولا يزيلها — فهو تخفيف لا علاج.'),
  );
  kit.controls.append(card);
  const showCard = () => { if (IDS.every(i => done.has(i))) card.style.display = ''; };
  showCard();

  kit.loop((c, dt, t) => {
    const W = kit.W, H = kit.H;

    if (sweepT0) {                                    // مسح السرعة: صعود تدريجي يرسم المنحنى كاملًا
      const p = (performance.now() - sweepT0) / 7000;
      if (p >= 1) { sweepT0 = 0; rpmSl.set(RPM_MAX); }
      else rpmSl.set(Math.round((RPM_MIN + (RPM_MAX - RPM_MIN) * p) / 10) * 10);
    }

    const rpm = rpmSl.value, k = kSl.value, Q = 1 / (2 * zSl.value);
    const fn = fnOf(k), fc = fn * 60, f = rpm / 60, r = f / fn;
    const M = magOf(r, Q), ph = phaseOf(r, Q), pk = peakOf(Q);

    revLo = Math.min(revLo, rpm); revHi = Math.max(revHi, rpm);
    if (Math.abs(r - 1) <= 0.02) { atPeak = true; }
    if (r < 0.9) belowSeen = true;
    if (belowSeen && r > 1.25) { aboveT += dt; if (aboveT > 1.5) complete('pass-through'); } else aboveT = 0;
    if (k > K0 && (fc - rpm) / rpm > 0.25) complete('stiffen-fix');
    glow = Math.max(0, glow - dt * 1.2);

    // ═════ لوحة الآلة ═════
    const mh = H * 0.44, cx = W * 0.5, groundY = mh - 12;
    rot += dt * 2 * Math.PI * (0.9 + 2.6 * (rpm - RPM_MIN) / (RPM_MAX - RPM_MIN));
    const amp = Math.min(26, M * 1.7);
    const dy = amp * Math.sin(rot - ph * Math.PI / 180);   // الإزاحة تتأخر عن القوة بالطور
    const hot = M > 0.6 * pk;

    c.strokeStyle = withAlpha(kit.pal.text2, 0.6); c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - W * 0.3, groundY); c.lineTo(cx + W * 0.3, groundY); c.stroke();
    for (let i = -5; i <= 5; i++) {                        // تهشير الأرضية
      const x = cx + i * W * 0.055;
      c.beginPath(); c.moveTo(x, groundY); c.lineTo(x - 9, groundY + 9); c.stroke();
    }

    const bw = Math.min(W * 0.44, 210), bh = 56;
    const bodyBot = groundY - 52 + dy, bodyTop = bodyBot - bh;
    spring(c, cx - bw * 0.3, bodyBot, groundY, withAlpha(kit.pal.text2, 0.85));
    damper(c, cx + bw * 0.3, bodyBot, groundY, kit.pal.water, dy);

    c.fillStyle = withAlpha(kit.pal.text2, 0.24);
    c.strokeStyle = hot ? kit.pal.bad : withAlpha(kit.pal.text2, 0.7);
    c.lineWidth = hot ? 2.4 : 1.4;
    c.beginPath(); c.rect(cx - bw / 2, bodyTop, bw, bh); c.fill(); c.stroke();

    const rr = bh * 0.33;                                  // الدوّار وبقعته الثقيلة
    c.beginPath(); c.arc(cx, bodyTop + bh / 2, rr, 0, Math.PI * 2);
    c.fillStyle = withAlpha(kit.pal.water, 0.5); c.fill();
    c.strokeStyle = kit.pal.water; c.lineWidth = 1.6; c.stroke();
    c.beginPath(); c.arc(cx + Math.cos(rot) * rr * 0.62, bodyTop + bh / 2 + Math.sin(rot) * rr * 0.62, 3.4, 0, Math.PI * 2);
    c.fillStyle = kit.pal.amber; c.fill();

    if (amp > 3) {                                         // سهم سعة الاهتزاز
      const ax = cx - bw / 2 - 16;
      arrow(c, ax, groundY - 52 - bh / 2, ax, groundY - 52 - bh / 2 - amp, { color: hot ? kit.pal.bad : kit.pal.amber, width: 2 });
      arrow(c, ax, groundY - 52 - bh / 2, ax, groundY - 52 - bh / 2 + amp, { color: hot ? kit.pal.bad : kit.pal.amber, width: 2 });
    }
    label(c, hot ? 'اهتزاز مدمّر — الآلة سليمة والسبب السرعة وحدها' : 'اهتزاز طبيعي', cx, 14,
      { size: 12.5, align: 'center', color: hot ? kit.pal.bad : kit.pal.text2, weight: 800 });
    label(c, `الطور ${Math.round(ph)}°`, cx + bw / 2 + 12, bodyTop + bh / 2, { size: 12, align: 'left', color: kit.pal.badge });
    if (Math.abs(ph - 90) < 6)
      label(c, '90° = رنين مؤكد', cx + bw / 2 + 12, bodyTop + bh / 2 + 16, { size: 11, align: 'left', color: kit.pal.badge });

    // ═════ منحنى الاستجابة ═════
    const P = { l: 42, r: 12, t: mh + 22, b: H - 22 };
    const gw = W - P.l - P.r, gh = P.b - P.t;
    const xOf = v => P.l + gw * (v - RPM_MIN) / (RPM_MAX - RPM_MIN);
    let top = 1;
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const s = RPM_MIN + (RPM_MAX - RPM_MIN) * i / 160;
      const m = magOf(s / 60 / fn, Q);
      pts.push([s, m]); top = Math.max(top, m);
    }
    top *= 1.12;
    const yOf = m => P.b - gh * m / top;

    c.strokeStyle = withAlpha(kit.pal.text2, 0.2); c.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = P.t + gh * i / 3;
      c.beginPath(); c.moveTo(P.l, y); c.lineTo(P.l + gw, y); c.stroke();
      label(c, `×${(top * (1 - i / 3)).toFixed(1)}`, P.l - 5, y, { size: 10, color: kit.pal.text2 });
    }
    for (const s of [200, 1000, 2000, 3000, 4000])
      label(c, String(s), xOf(s), P.b + 11, { size: 10, align: 'center', color: kit.pal.text2 });
    label(c, 'سعة الاهتزاز مقابل السرعة (RPM)', P.l + gw, P.t - 11, { size: 11.5, color: kit.pal.text2 });

    c.save();                                              // الجزء المكشوف من المنحنى فقط
    c.beginPath(); c.rect(xOf(revLo), P.t - 6, Math.max(1, xOf(revHi) - xOf(revLo)), gh + 8); c.clip();
    c.beginPath();
    pts.forEach(([s, m], i) => (i ? c.lineTo(xOf(s), yOf(m)) : c.moveTo(xOf(s), yOf(m))));
    c.lineTo(xOf(RPM_MAX), P.b); c.lineTo(xOf(RPM_MIN), P.b); c.closePath();
    c.fillStyle = withAlpha(kit.pal.water, 0.18); c.fill();
    c.beginPath();
    pts.forEach(([s, m], i) => (i ? c.lineTo(xOf(s), yOf(m)) : c.moveTo(xOf(s), yOf(m))));
    c.strokeStyle = kit.pal.water; c.lineWidth = 2; c.stroke();
    c.restore();
    if (revHi - revLo < RPM_MAX - RPM_MIN - 20)
      label(c, 'حرّك السرعة أو اضغط «مسح السرعة» لكشف بقية المنحنى', P.l + gw / 2, P.b - 8,
        { size: 11, align: 'center', color: kit.pal.text2 });

    if (fc >= RPM_MIN && fc <= RPM_MAX) {                  // خط السرعة الحرجة
      c.save(); c.setLineDash([4, 4]); c.strokeStyle = kit.pal.bad; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(xOf(fc), P.t - 6); c.lineTo(xOf(fc), P.b); c.stroke(); c.restore();
      label(c, 'السرعة الحرجة', xOf(fc) - 5, P.t - 1, { size: 11, color: kit.pal.bad });
      if (revHi >= fc) label(c, `×${pk.toFixed(1)}`, xOf(fc) + 4, yOf(pk) - 9, { size: 11.5, align: 'left', color: kit.pal.bad, weight: 800 });
    }
    const half = fc * 0.5;                                 // مرجع «سرعة بعيدة عن الرنين»
    if (half >= RPM_MIN && revLo <= half) {
      const mh2 = magOf(0.5, Q);
      c.beginPath(); c.arc(xOf(half), yOf(mh2), 3.4, 0, Math.PI * 2); c.fillStyle = kit.pal.ok; c.fill();
      label(c, `×${mh2.toFixed(1)} عند نصف الحرجة`, xOf(half) - 6, yOf(mh2) - 10, { size: 10.5, color: kit.pal.ok });
    }
    c.beginPath(); c.arc(xOf(rpm), yOf(M), 5.5 + glow * 3, 0, Math.PI * 2);
    c.fillStyle = hot ? kit.pal.bad : kit.pal.amber; c.fill();
    c.strokeStyle = withAlpha(kit.pal.bg, 0.9); c.lineWidth = 1.6; c.stroke();

    read.set([
      { label: 'التردد الطبيعي', value: `${fn.toFixed(1)} Hz`, color: kit.pal.water },
      { label: 'السرعة الحرجة', value: `${Math.round(fc)} RPM`, color: kit.pal.bad },
      { label: 'التضخيم', value: `×${M.toFixed(2)}`, color: hot ? kit.pal.bad : kit.pal.amber },
      { label: 'فرق الطور', value: `${Math.round(ph)}°`, color: kit.pal.badge },
      { label: '<span class="ltr">r = f ÷ fn</span>', value: r.toFixed(2), color: kit.pal.text2 },
    ]);
  });

  return { destroy() { kit.destroy(); } };
}

// ═════ عناصر الرسم ═════
function spring(c, x, yTop, yBot, color) {
  const n = 6, h = yBot - yTop, w = 11;
  c.save(); c.strokeStyle = color; c.lineWidth = 2.2; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x, yTop);
  for (let i = 0; i < n; i++) {
    c.lineTo(x + (i % 2 ? -w : w), yTop + h * (i + 0.5) / n);
  }
  c.lineTo(x, yBot); c.stroke(); c.restore();
}

function damper(c, x, yTop, yBot, color, dy) {
  const midY = (yTop + yBot) / 2;
  c.save(); c.strokeStyle = color; c.fillStyle = withAlpha(color, 0.22); c.lineWidth = 2;
  c.beginPath(); c.rect(x - 9, midY - 4, 18, yBot - midY + 4); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x, yTop); c.lineTo(x, midY + 6 + Math.max(-6, Math.min(6, dy * 0.3))); c.stroke();
  c.beginPath(); c.moveTo(x - 7, midY + 6 + Math.max(-6, Math.min(6, dy * 0.3)));
  c.lineTo(x + 7, midY + 6 + Math.max(-6, Math.min(6, dy * 0.3))); c.lineWidth = 3.4; c.stroke();
  c.restore();
}

// صندوق إدخال رقمي مضغوط — onCheck(v) يرجع {ok, msg}
function numBox(host, lab, unit, onCheck) {
  const input = el('input', {
    type: 'number', step: 'any', inputmode: 'decimal', placeholder: '؟',
    style: 'direction:ltr; text-align:center; width:104px; padding:8px; border-radius:10px;' +
      'border:1px solid var(--c-border2); background:transparent; color:var(--c-text); font:inherit',
  });
  const out = el('span', { class: 'chip', style: 'display:none' });
  const btn = el('button', { class: 'btn sm secondary' }, 'تحقّق');
  btn.addEventListener('click', () => {
    const v = parseFloat(input.value);
    if (!isFinite(v)) return;
    const res = onCheck(v);
    out.style.display = '';
    out.style.color = res.ok ? 'var(--c-ok)' : 'var(--c-bad)';
    out.textContent = res.msg;
  });
  host.append(el('div', { class: 'sim-row', style: 'flex-wrap:wrap; gap:8px' },
    el('label', { style: 'min-width:auto' }, lab),
    input, el('span', { class: 'ltr muted' }, unit), btn, out));
}
