// قوى القصور في المكائن الترددية — مكبس وكرنك يدوران، ومتجها القوة الابتدائية والثانوية،
// ومنحنى القوة مقابل زاوية الكرنك. القيم كلها من balancekit: لا رقم يُكتب باليد.
//   F_p = m ω² r cos θ        (بتردد الدوران 1×)
//   F_s = m ω² r cos 2θ ÷ n   (بضعف التردد 2×، حيث n = L ÷ r)
import { SimKit, label, arrow, withAlpha } from './simkit.js';
import { segment, screen } from './analyzer.js';
import { DataTable } from './labkit.js';
import { el } from '../ui.js';
import { reciprocatingForces, reciprocatingPeaks, ENGINE_CONFIGS } from './balancekit.js';
import { MACHINES } from './machines.js';

const CK = MACHINES.recip.crank;      // كتلة 500 g · نصف قطر 50 mm · ذراع 200 mm
const RPM = 1500;
const IDS = ['one', 'two', 'four', 'fourWithExtra'];
const SHORT = { one: 'أسطوانة', two: 'أسطوانتان', four: 'أربع', fourWithExtra: 'أربع + كتلة' };
const DESC = {
  one: 'أسطوانة واحدة',
  two: 'أسطوانتان بكرنك <span class="ltr">180°</span>',
  four: 'أربع أسطوانات بترتيب إشعال <span class="ltr">1-3-4-2</span>',
  fourWithExtra: 'أربع أسطوانات مع كتلة زائدة على المكبس الثاني',
};
const bold = s => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

const CACHE = new Map();
function caseOf(id) {
  if (CACHE.has(id)) return CACHE.get(id);
  const cfg = { massRecG: CK.massRecG, crankRmm: CK.crankRmm, rodLmm: CK.rodLmm, rpm: RPM, cylinders: ENGINE_CONFIGS[id].cylinders };
  const peaks = reciprocatingPeaks(cfg);
  const curve = [];
  for (let t = 0; t <= 360; t += 2) { const r = reciprocatingForces(cfg, t); curve.push([r.Fp, r.Fs]); }
  const c = { cfg, peaks, curve, n: cfg.rodLmm / cfg.crankRmm, def: ENGINE_CONFIGS[id] };
  CACHE.set(id, c);
  return c;
}

export function mount(container, ctx) {
  const kit = new SimKit(container, { ratio: 0.82 });
  const done = new Set();
  const complete = id => {
    if (done.has(id) || ctx.isMissionDone?.(id)) return;
    done.add(id); ctx.completeMission(id);
  };

  let id = 'one', th = 0, spd = 0.5, shown = '';
  const rec = {};                    // ما سُجِّل في الجدول
  const scr = screen(kit.controls);
  const note = el('div', { style: 'font-size:12.5px; color:var(--c-text2); line-height:1.8' });

  const setNote = k => { note.innerHTML = `<b>${DESC[k]}</b> — ${bold(ENGINE_CONFIGS[k].verdict)}`; };
  segment(kit.controls, {
    label: 'التكوين', value: id,
    items: IDS.map(k => ({ id: k, label: SHORT[k] })),
    onchange: k => { id = k; setNote(k); },
  });
  kit.controls.append(note);
  setNote(id);
  kit.slider({ label: 'سرعة العرض', min: 0, max: 1.2, step: 0.1, value: spd, fmt: x => x.toFixed(1), unit: 'دورة/ث', oninput: x => { spd = x; } });

  const table = new DataTable(kit.controls, {
    cols: [{ key: 'Fp', label: 'الابتدائية <span class="ltr">Fp</span>', unit: 'N' },
    { key: 'Fs', label: 'الثانوية <span class="ltr">Fs</span>', unit: 'N' },
    { key: 'TM1', label: 'عزم الابتدائية', unit: 'N·m' }, { key: 'TM2', label: 'عزم الثانوية', unit: 'N·m' }],
    rows: IDS.map(k => SHORT[k]),
  });

  const msg = el('span', { class: 'chip', style: 'display:none' });
  kit.buttons([{
    label: 'سجّل قراءة هذا التكوين', cls: 'ghost',
    onclick: () => {
      const c = caseOf(id), i = IDS.indexOf(id), p = c.peaks;
      rec[id] = p;
      const small = v => v < 1;
      table.setCell(i, 'Fp', p.Fp.toFixed(1), small(p.Fp) ? 'ok' : '');
      table.setCell(i, 'Fs', p.Fs.toFixed(1), small(p.Fs) ? 'ok' : '');
      table.setCell(i, 'TM1', p.TM1.toFixed(2), small(p.TM1) ? 'ok' : 'bad');
      table.setCell(i, 'TM2', p.TM2.toFixed(2), small(p.TM2) ? 'ok' : 'bad');
      msg.style.display = ''; msg.style.color = 'var(--c-ok)'; msg.style.borderColor = 'var(--c-ok)';
      msg.innerHTML = 'سُجّلت في الجدول';
      if (id === 'two' && p.Fp < 1 && p.TM1 > 1) {
        complete('two-cancel');
        msg.innerHTML = `الابتدائية اتزنت تمامًا <span class="ltr">Fp = 0</span>، لكن عزمها باقٍ ` +
          `<span class="ltr">TM1 = ${p.TM1.toFixed(1)} N·m</span> — القوّتان متعاكستان لكن بينهما بُعد.`;
      }
      if (id === 'four') {
        if (!rec.one) { msg.style.color = 'var(--c-amber)'; msg.innerHTML = 'سجّل الأسطوانة الواحدة أولًا لتقارن ثانويتها بالرباعي.'; }
        else if (Math.abs(p.Fs / rec.one.Fs - 4) < 0.05) {
          complete('four-secondary');
          msg.innerHTML = `الثانوية <span class="ltr">${p.Fs.toFixed(0)} N</span> = أربعة أضعاف ثانوية الأسطوانة الواحدة ` +
            `<span class="ltr">${rec.one.Fs.toFixed(0)} N</span>.`;
        }
      }
      if (id === 'fourWithExtra' && p.Fp > 10) {
        complete('add-mass');
        msg.innerHTML = `الابتدائية عادت <span class="ltr">${p.Fp.toFixed(0)} N</span> بعد أن كانت صفرًا — كتلة واحدة زائدة كسرت الاتزان.`;
      }
    },
  }]);

  // إدخال القوة الابتدائية العظمى للأسطوانة الواحدة
  const inp = el('input', {
    type: 'number', step: 'any', inputmode: 'decimal', placeholder: '؟',
    style: 'direction:ltr; text-align:center; width:104px; padding:7px; border-radius:10px;' +
      'border:1px solid var(--c-border2); background:transparent; color:var(--c-text); font:inherit',
  });
  const ans = el('span', { class: 'chip', style: 'display:none' });
  const go = () => {
    const v = parseFloat(inp.value);
    if (!isFinite(v)) return;
    const ok = id === 'one', p = caseOf('one').peaks.Fp;
    ans.style.display = '';
    if (!ok) { ans.style.color = 'var(--c-amber)'; ans.style.borderColor = 'var(--c-amber)'; ans.textContent = 'انتقل إلى تكوين الأسطوانة الواحدة أولًا'; return; }
    const err = Math.abs(v - p) / p * 100;
    const pass = err <= 5;
    ans.style.color = pass ? 'var(--c-ok)' : 'var(--c-bad)';
    ans.style.borderColor = pass ? 'var(--c-ok)' : 'var(--c-bad)';
    ans.innerHTML = pass
      ? `صحيح — الفرق <span class="ltr">${err.toFixed(1)}%</span>`
      : `خطأ <span class="ltr">${err.toFixed(0)}%</span> — اقرأ <span class="ltr">Fp</span> من الشاشة`;
    if (pass) complete('one-cyl');
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  kit.controls.append(el('div', { class: 'sim-row', style: 'flex-wrap:wrap; gap:8px' },
    el('label', { style: 'min-width:auto' }, 'القوة الابتدائية العظمى للأسطوانة الواحدة'), inp,
    el('span', { class: 'ltr', style: 'color:var(--c-text2); font-size:12px' }, 'N'),
    el('button', { class: 'btn sm secondary', type: 'button', onclick: go }, 'تحقّق'), ans));
  kit.controls.append(msg);

  kit.controls.append(el('div', {
    style: 'border:1px solid var(--c-border2); border-radius:14px; padding:10px 12px; margin-top:10px;' +
      'background:var(--c-surface2); font-size:13px; line-height:1.9',
    html: '<b>خلاصة التكوينات</b><br>' +
      '<b>أسطوانة واحدة:</b> الابتدائية والثانوية غير متزنتين معًا — أشدّها اهتزازًا، ولذلك تُعلَّق على مساند مطاطية.<br>' +
      '<b>أسطوانتان بكرنك <span class="ltr">180°</span>:</b> الابتدائية تُلغى تمامًا، لكن يبقى عزمها لأن القوّتين على بعدٍ بينهما، والثانوية تتضاعف.<br>' +
      '<b>أربع أسطوانات <span class="ltr">1-3-4-2</span>:</b> الابتدائية وعزمها وعزم الثانوية كلها متزنة، لكن <b>الثانوية تتضاعف أربع مرات</b> — عيب المحرك الرباعي المعروف.',
  }));

  kit.loop((g, dt) => {
    const pal = kit.pal, W = kit.W, H = kit.H;
    const c = caseOf(id);
    th = (th + Math.max(0, dt) * spd * 360) % 360;
    const cv = c.curve[Math.round(th / 2)] || c.curve[0];      // من المنحنى المخزَّن — لا حساب في الحلقة
    const f = { Fp: cv[0], Fs: cv[1] };
    const cyl = c.cfg.cylinders;

    // ═══ المكابس والكرنك ═══
    const ecy = H * 0.40, sp = Math.min(W * 0.70 / cyl.length, 86), ecx = W * 0.58;
    const rp = Math.min(15, sp * 0.20), lp = rp * c.n;
    g.save(); g.strokeStyle = withAlpha(pal.text2, 0.7); g.lineWidth = 2;
    g.beginPath(); g.moveTo(ecx - sp * cyl.length / 2, ecy); g.lineTo(ecx + sp * cyl.length / 2, ecy); g.stroke(); g.restore();
    cyl.forEach((cy, i) => {
      const x = ecx + (i - (cyl.length - 1) / 2) * sp;
      const a = (th + cy.crankDeg) * Math.PI / 180;
      const s = rp * Math.cos(a) + Math.sqrt(lp * lp - rp * rp * Math.sin(a) * Math.sin(a));
      const py = ecy - s;
      const heavy = cy.massG != null;
      const col = heavy ? pal.bad : pal.water;
      g.save();
      g.strokeStyle = withAlpha(pal.text2, 0.45); g.lineWidth = 1.4;
      g.strokeRect(x - rp * 1.1, ecy - (rp + lp) - 14, rp * 2.2, lp + rp + 8);   // الأسطوانة
      g.fillStyle = withAlpha(col, 0.85);
      g.fillRect(x - rp * 0.95, py - 7, rp * 1.9, 14);                            // المكبس
      g.strokeStyle = pal.text2; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, py); g.lineTo(x + rp * Math.cos(a), ecy - rp * Math.sin(a)); g.stroke();
      g.fillStyle = pal.amber;
      g.beginPath(); g.arc(x + rp * Math.cos(a), ecy - rp * Math.sin(a), 3.2, 0, Math.PI * 2); g.fill();
      g.restore();
      label(g, heavy ? `${i + 1} +كتلة` : `${i + 1}`, x, ecy + 14, { size: 10, color: heavy ? pal.bad : pal.text2, align: 'center' });
    });

    // ═══ متجها القوة الابتدائية والثانوية ═══
    const pk = Math.max(c.peaks.Fp, c.peaks.Fs, 1);
    const L = Math.min(H * 0.22, 70), vx = W * 0.12;
    const vec = (x, val, col, tag) => {
      const len = L * val / pk;
      if (Math.abs(len) > 1.5) arrow(g, x, ecy, x, ecy - len, { color: col, width: 3, head: 8 });
      else { g.save(); g.fillStyle = col; g.beginPath(); g.arc(x, ecy, 3, 0, Math.PI * 2); g.fill(); g.restore(); }
      label(g, tag, x, ecy + 16, { size: 10.5, color: col, align: 'center' });
      label(g, `${val.toFixed(0)} N`, x, ecy + 30, { size: 10, color: col, align: 'center' });
    };
    g.save(); g.strokeStyle = withAlpha(pal.text2, 0.35); g.lineWidth = 1;
    g.beginPath(); g.moveTo(vx - 22, ecy); g.lineTo(vx + 34, ecy); g.stroke(); g.restore();
    vec(vx, f.Fp, pal.water, 'الابتدائية');
    vec(vx + 26, f.Fs, pal.amber, 'الثانوية');

    // ═══ منحنى القوة مقابل زاوية الكرنك ═══
    const cy0 = H * 0.60, ch = H * 0.34, mid = cy0 + ch / 2;
    const cx0 = 40, cw = W - cx0 - 14;
    g.save(); g.strokeStyle = withAlpha(pal.text2, 0.22); g.lineWidth = 1;
    g.beginPath(); g.moveTo(cx0, mid); g.lineTo(cx0 + cw, mid); g.stroke();
    g.beginPath(); g.moveTo(cx0, cy0); g.lineTo(cx0, cy0 + ch); g.stroke(); g.restore();
    const trace = (idx, col) => {
      g.save(); g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
      c.curve.forEach((p, i) => {
        const x = cx0 + cw * i / (c.curve.length - 1), y = mid - (ch / 2) * 0.9 * p[idx] / pk;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      });
      g.stroke(); g.restore();
    };
    trace(0, pal.water); trace(1, pal.amber);
    const mx = cx0 + cw * th / 360;
    g.save(); g.strokeStyle = pal.ok; g.lineWidth = 1.4; g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(mx, cy0); g.lineTo(mx, cy0 + ch); g.stroke(); g.restore();
    label(g, `زاوية الكرنك ${th.toFixed(0)}°`, W - 8, cy0 - 6, { size: 11, color: pal.text2, align: 'right' });
    label(g, `±${pk.toFixed(0)} N`, cx0 - 5, cy0 + 6, { size: 10, color: pal.text2 });
    label(g, '0', cx0 - 5, mid, { size: 10, color: pal.text2 });
    label(g, '360°', cx0 + cw, cy0 + ch + 10, { size: 10, color: pal.text2, align: 'right' });

    if (id !== shown) {                                        // الشاشة تُكتب عند تغيّر التكوين فقط
      shown = id;
      scr.set([
        { label: '<span class="ltr">Fp</span> العظمى', value: c.peaks.Fp.toFixed(1), unit: 'N', color: 'var(--c-water)' },
        { label: '<span class="ltr">Fs</span> العظمى', value: c.peaks.Fs.toFixed(1), unit: 'N', color: 'var(--c-amber)' },
        { label: '<span class="ltr">TM1</span> العظمى', value: c.peaks.TM1.toFixed(2), unit: 'N·m', color: 'var(--c-badge)' },
        { label: '<span class="ltr">TM2</span> العظمى', value: c.peaks.TM2.toFixed(2), unit: 'N·m', color: 'var(--c-ok)' },
      ]);
    }
  });

  return { destroy() { CACHE.clear(); kit.destroy(); } };
}
