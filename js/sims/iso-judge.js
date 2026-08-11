// الحكم بمعيار ISO — سلّم الفئات الأربع بمناطقه، والقراءة الواحدة تُحكم أربعة أحكام.
// القيم كلها من vibstd (ISO_CLASSES وISO_LADDER) — لا رقم مكتوب باليد في هذا الملف.
import { SimKit, label, withAlpha } from './simkit.js';
import { segment } from './analyzer.js';
import { el } from '../ui.js';
import { ISO_CLASSES, ISO_ZONES, ISO_LADDER, isoZone } from './vibstd.js';

const CLS = ['I', 'II', 'III', 'IV'];
const VMIN = ISO_LADDER[0].mms, VMAX = ISO_LADDER[ISO_LADDER.length - 1].mms;
const P = { l: 52, r: 14, t: 28, b: 30 };

// آلات التصنيف: القدرة ونوع الأساس هما ما يحدّد الفئة
const RIGS = [
  { t: 'مضخة طرد مركزي — <span class="ltr">22 kW</span> على قاعدة صلبة', a: 'II' },
  { t: 'توربين بخاري — <span class="ltr">850 kW</span> على أساس صلب', a: 'III' },
  { t: 'مروحة صغيرة — <span class="ltr">7 kW</span>', a: 'I' },
];
// ثلاث قراءات عبر ثلاثة أشهر: كلها «مرضٍ» على الفئة الثالثة، لكنها تصعد بثبات
const TREND = { cls: 'III', v: [1.9, 3.0, 4.4], months: ['الشهر 1', 'الشهر 2', 'الشهر 3'] };
const CALLS = [
  { id: 'go', label: 'استمر بلا إجراء' },
  { id: 'plan', label: 'خطّط للإصلاح' },
  { id: 'stop', label: 'أوقف فورًا' },
];

const tone = (pal, t) => ({ ok: pal.ok, ok2: pal.water, warn: pal.amber, bad: pal.bad }[t] || pal.text2);
const bounds = c => [VMIN, ISO_CLASSES[c].good, ISO_CLASSES[c].satisfactory, ISO_CLASSES[c].unsatisfactory, VMAX];

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.8 });
  const read = kit.readout();
  const done = new Set();
  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); ctx.completeMission(id);
  };

  let cls = 'II', v = 2.0, showTrend = false, lastKey = '';
  const seen6 = new Set();                       // الفئات التي رآها المتدرب عند 6.0 mm/s
  const picks = [null, null, null];

  const check6 = () => {
    if (Math.abs(v - 6.0) < 0.051) {
      seen6.add(cls);
      if (seen6.has('II') && seen6.has('IV')) complete('same-value');
    }
  };

  const rtl = html => el('span', { html });
  const clsHint = el('div', { style: 'font-size:12px; color:var(--c-text2); margin:-2px 0 2px' });
  const showHint = k => {
    clsHint.innerHTML = `${ISO_CLASSES[k].label} — ${ISO_CLASSES[k].hint}`
      .replace(/(\d[\d–\-]*\s?kW)/g, '<span class="ltr">$1</span>');
  };
  const clsSeg = segment(kit.controls, {
    label: 'فئة الآلة', value: cls,
    items: CLS.map(k => ({ id: k, label: rtl(`الفئة <span class="ltr">${k}</span>`) })),
    onchange: id => { cls = id; showHint(id); check6(); },
  });
  kit.controls.append(clsHint);
  showHint(cls);
  const vSl = kit.slider({
    label: 'القراءة (فعّالة)', min: 0.1, max: 30, step: 0.1, value: v, unit: 'mm/s',
    fmt: x => x.toFixed(1), oninput: x => { v = x; check6(); },
  });
  kit.buttons([
    { label: rtl('اضبط على <span class="ltr">6.0 mm/s</span>'), cls: 'ghost', onclick: () => vSl.set(6.0) },
  ]);

  // ═══ بطاقة التصنيف ═══
  const card = (title, ...kids) => {
    const box = el('div', {
      style: 'border:1px solid var(--c-border2); border-radius:14px; padding:10px 12px; margin-top:10px; background:var(--c-surface2)',
    }, el('div', { style: 'font-weight:800; font-size:13.5px; margin-bottom:8px' }, title), ...kids);
    kit.controls.append(box);
    return box;
  };

  const rigRows = RIGS.map((r, i) => {
    const st = el('span', { class: 'chip', style: 'display:none' });
    const btns = CLS.map(k => el('button', { class: 'btn sm secondary ltr', type: 'button', style: 'padding:5px 10px; min-height:32px; font-size:12.5px' }, k));
    btns.forEach((b, j) => b.addEventListener('click', () => {
      picks[i] = CLS[j];
      btns.forEach((x, q) => {
        const on = q === j;
        x.style.background = on ? 'var(--c-water)' : '';
        x.style.color = on ? 'var(--c-bg)' : '';
        x.style.borderColor = on ? 'var(--c-water)' : '';
      });
      const ok = picks[i] === r.a;
      st.style.display = '';
      st.style.color = ok ? 'var(--c-ok)' : 'var(--c-bad)';
      st.style.borderColor = ok ? 'var(--c-ok)' : 'var(--c-bad)';
      st.textContent = ok ? 'صحيح' : 'أعد النظر في القدرة ونوع الأساس';
      if (picks.every((p, q) => p === RIGS[q].a)) complete('classify');
    }));
    return el('div', { style: 'display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-bottom:7px' },
      el('span', { style: 'flex:1; min-width:180px; font-size:13px', html: r.t }), ...btns, st);
  });
  card('صنّف قبل أن تحكم', ...rigRows);

  // ═══ بطاقة الاتجاه ═══
  const trendMsg = el('div', { style: 'font-size:12.5px; color:var(--c-text2); line-height:1.75; margin-top:6px' });
  const callBtns = CALLS.map(c => el('button', { class: 'btn sm secondary', type: 'button' }, c.label));
  callBtns.forEach((b, i) => b.addEventListener('click', () => {
    const ok = CALLS[i].id === 'plan';
    b.style.background = ok ? 'var(--c-ok)' : 'var(--c-bad)';
    b.style.color = 'var(--c-bg)';
    b.style.borderColor = ok ? 'var(--c-ok)' : 'var(--c-bad)';
    trendMsg.innerHTML = ok
      ? 'صحيح. القراءات الثلاث كلها «مرضٍ» على الفئة الثالثة، لكنها تضاعفت أكثر من مرتين في ثلاثة أشهر — و<b>الاتجاه أخطر من القيمة المطلقة</b>: قراءة صاعدة داخل المنطقة المرضية أخطر من قراءة ثابتة أعلى منها.'
      : 'ليس هذا. القيم كلها داخل «مرضٍ» فلا موجب للإيقاف، لكن صعودها المطّرد لا يُترك بلا خطة — أعد الاختيار.';
    if (ok) complete('trend-call');
  }));
  card('ثلاث قراءات عبر ثلاثة أشهر',
    el('div', { class: 'ltr', style: 'font-size:13px; margin-bottom:8px' },
      TREND.v.map((x, i) => `${TREND.months[i]}: ${x.toFixed(1)} mm/s`).join('   ←   ')),
    el('div', { class: 'sim-btns' },
      el('button', {
        class: 'btn sm ghost', type: 'button',
        onclick: () => { showTrend = true; clsSeg.set(TREND.cls); cls = TREND.cls; },
      }, 'أظهر القراءات على السلّم'), ...callBtns),
    trendMsg);

  kit.loop((g) => {
    const pal = kit.pal, W = kit.W, H = kit.H;
    const gw = W - P.l - P.r, gh = H - P.t - P.b, top = P.t, base = P.t + gh;
    const Y = x => top + gh * (1 - Math.log(Math.max(VMIN, Math.min(VMAX, x)) / VMIN) / Math.log(VMAX / VMIN));

    // تدريج السلّم على المحور الأيسر بقيم ISO_LADDER الحقيقية
    g.save(); g.strokeStyle = withAlpha(pal.text2, 0.16); g.lineWidth = 1;
    for (const t of ISO_LADDER) {
      const y = Y(t.mms);
      g.beginPath(); g.moveTo(P.l - 4, y); g.lineTo(P.l + gw, y); g.stroke();
    }
    g.restore();
    for (const t of ISO_LADDER) label(g, t.mms.toFixed(2), P.l - 7, Y(t.mms), { size: 9.5, color: pal.text2 });
    label(g, 'mm/s فعّالة', P.l - 7, top - 14, { size: 10, color: pal.text2 });

    // الأعمدة الأربعة بمناطقها
    const colW = gw / 4 * 0.58;
    CLS.forEach((k, i) => {
      const cx = P.l + gw * (i + 0.5) / 4;
      const b = bounds(k), on = k === cls;
      for (let z = 0; z < 4; z++) {
        const y0 = Y(b[z + 1]), y1 = Y(b[z]);
        g.fillStyle = withAlpha(tone(pal, ISO_ZONES[z].tone), on ? 0.62 : 0.2);
        g.fillRect(cx - colW / 2, y0, colW, y1 - y0);
        if (on && y1 - y0 > 15)
          label(g, ISO_ZONES[z].label, cx, (y0 + y1) / 2, { size: 11, color: pal.bg, align: 'center', weight: 800 });
      }
      g.save();
      g.strokeStyle = on ? pal.text : withAlpha(pal.text2, 0.4);
      g.lineWidth = on ? 2 : 1;
      g.strokeRect(cx - colW / 2, Y(VMAX), colW, Y(VMIN) - Y(VMAX));
      g.restore();
      label(g, `الفئة ${k}`, cx, base + 13, { size: 11.5, color: on ? pal.text : pal.text2, align: 'center', weight: 800 });
    });

    // خط القراءة الحالية عبر السلّم كله
    const yv = Y(v);
    g.save();
    g.strokeStyle = pal.text; g.lineWidth = 1.8; g.setLineDash([6, 4]);
    g.beginPath(); g.moveTo(P.l, yv); g.lineTo(P.l + gw, yv); g.stroke();
    g.restore();
    const zn = isoZone(v, cls);
    label(g, `${v.toFixed(1)}`, P.l + gw + 2, yv, { size: 11, color: pal.text, align: 'right' });
    label(g, `الفئة ${cls} عند ${v.toFixed(1)} mm/s ← ${zn.label}`, W - 8, 12,
      { size: 12.5, color: tone(pal, zn.tone), align: 'right', weight: 800 });

    // نقاط الاتجاه الثلاث على عمود فئتها
    if (showTrend) {
      const cx = P.l + gw * (CLS.indexOf(TREND.cls) + 0.5) / 4;
      let px = cx - colW / 2 + colW * 0.2;
      TREND.v.forEach((x, i) => {
        const y = Y(x), qx = px + colW * 0.3 * i;
        g.save(); g.fillStyle = pal.bad; g.strokeStyle = pal.bad; g.lineWidth = 1.6;
        if (i) { g.beginPath(); g.moveTo(qx - colW * 0.3, Y(TREND.v[i - 1])); g.lineTo(qx, y); g.stroke(); }
        g.beginPath(); g.arc(qx, y, 3.6, 0, Math.PI * 2); g.fill(); g.restore();
      });
      label(g, 'اتجاه صاعد', cx, Y(TREND.v[2]) - 12, { size: 10.5, color: pal.bad, align: 'center' });
    }

    const key = `${cls}|${v.toFixed(1)}|${showTrend}`;
    if (key !== lastKey) {
      lastKey = key;
      const c = ISO_CLASSES[cls];
      read.set([
        { label: 'الحكم', value: zn.label, color: 'var(--c-text)' },
        { label: 'حدّ «جيد»', value: `${c.good} mm/s`, color: 'var(--c-ok)' },
        { label: 'حدّ «مرضٍ»', value: `${c.satisfactory} mm/s`, color: 'var(--c-water)' },
        { label: 'حدّ «غير مرضٍ»', value: `${c.unsatisfactory} mm/s`, color: 'var(--c-amber)' },
      ]);
    }
  });

  return { destroy() { kit.destroy(); } };
}
