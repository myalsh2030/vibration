// جهاز قياس الاهتزازات المحمول — المكوّن المشترك الذي تركّبه كل محطات القياس.
// مستوحى من تسلسل تشغيل Fluke 810: تُدخل بيانات الآلة، ثم تختار نقطة واتجاهًا وتثبيتًا
// ونطاقًا، ثم تضغط «قياس» فيعطيك قراءات الكميات الثلاث وطيفها وحكم المعيار.
//
// لا محطةَ تكتب رسم آلة ولا شاشة جهاز — كلها تُركّب هذا الملف وتمرّر إعدادها فقط.
import { el } from '../ui.js';
import { synth, spectrum, integrateWave, metrics, bandRms, lowpass, shaftHz, G } from './vibkit.js';
import { isoZone, bearingZone, crestVerdict, MOUNTS, DIRECTIONS, BANDS } from './vibstd.js';
import { drawMachine, drawPoints, drawSensor } from './machinedraw.js';

export const QUANTITIES = [
  { id: 'a', label: 'تسارع', term: 'Acceleration', unit: 'm/s²', digits: 3 },
  { id: 'v', label: 'سرعة', term: 'Velocity', unit: 'mm/s', digits: 2 },
  { id: 'd', label: 'إزاحة', term: 'Displacement', unit: 'µm', digits: 1 },
];

// شريط اختيار مجزّأ — الخيار النشط **ممتلئ** لا باهت
export function segment(container, { label: lab, items, value, onchange, sub }) {
  const btns = [];
  const row = el('div', { class: 'sim-row', style: 'flex-wrap:wrap; gap:6px' });
  if (lab) row.append(el('label', {}, lab));
  const wrap = el('div', { style: 'display:flex; flex-wrap:wrap; gap:6px; flex:1' });
  let cur = value;
  items.forEach(it => {
    const b = el('button', { class: 'btn sm secondary', type: 'button', style: 'min-height:36px; padding:6px 12px; font-size:13px' }, it.label);
    b.addEventListener('click', () => { cur = it.id; paint(); onchange?.(it.id, it); });
    btns.push([b, it]);
    wrap.append(b);
  });
  const hint = sub ? el('div', { style: 'font-size:12px; color:var(--c-text2); margin:-2px 0 2px' }) : null;
  function paint() {
    btns.forEach(([b, it]) => {
      const on = it.id === cur;
      b.style.background = on ? 'var(--c-amber)' : '';
      b.style.color = on ? 'var(--c-bg)' : '';
      b.style.borderColor = on ? 'var(--c-amber)' : '';
      b.style.fontWeight = on ? '800' : '';
    });
    if (hint) { const it = items.find(i => i.id === cur); hint.textContent = it?.hint || ''; }
  }
  paint();
  row.append(wrap);
  container.append(row);
  if (hint) container.append(hint);
  return { get value() { return cur; }, set(v) { cur = v; paint(); }, row };
}

export class Analyzer {
  // cfg: { machine, faults:[{type,sev,at}], seed, bands?, dirs?, mounts?, points?, onMeasure? }
  constructor(kit, cfg) {
    this.kit = kit;
    this.cfg = cfg;
    this.m = cfg.machine;
    this.rot = 0;
    this.running = true;
    this.readings = [];                       // سجل كل قياس أُخذ في الجلسة
    this.sel = {
      point: (cfg.points || this.m.points)[0].id,
      dir: (cfg.dirs || ['H', 'V', 'A'])[0],
      mount: (cfg.mounts || ['magnet', 'probe'])[0],
      band: (cfg.bands || [5000, 10000, 20000])[0],
      quantity: 'v',
    };
    this._cache = new Map();
  }

  get points() { return this.cfg.points || this.m.points; }
  get point() { return this.points.find(p => p.id === this.sel.point); }
  get mount() { return MOUNTS.find(x => x.id === this.sel.mount); }

  // ── لوحة التحكم ──
  controls(container, { showQuantity = true, showMount = true, showBand = true } = {}) {
    const c = container || this.kit.controls;
    this.selPoint = segment(c, {
      label: 'نقطة القياس',
      items: this.points.map((p, i) => ({ id: p.id, label: `${i + 1}. ${p.label.replace(/^ن\d+\s*/, '')}`, hint: p.hint })),
      value: this.sel.point, sub: true,
      onchange: id => { this.sel.point = id; this.cfg.onSelect?.(this.sel); },
    });
    this.selDir = segment(c, {
      label: 'الاتجاه',
      items: DIRECTIONS.filter(d => (this.cfg.dirs || this.point.dirs || ['H', 'V', 'A']).includes(d.id))
        .map(d => ({ id: d.id, label: `${d.label} ${d.id}`, hint: d.note })),
      value: this.sel.dir, sub: true,
      onchange: id => { this.sel.dir = id; this.cfg.onSelect?.(this.sel); },
    });
    if (showMount) this.selMount = segment(c, {
      label: 'التثبيت',
      items: MOUNTS.filter(x => (this.cfg.mounts || ['magnet', 'probe']).includes(x.id))
        .map(x => ({ id: x.id, label: x.label, hint: `${x.note}  —  سقف التردد ${x.fMax.toLocaleString('en')} Hz` })),
      value: this.sel.mount, sub: true,
      onchange: id => { this.sel.mount = id; this.cfg.onSelect?.(this.sel); },
    });
    if (showBand) this.selBand = segment(c, {
      label: 'نطاق القياس',
      items: BANDS.filter(b => (this.cfg.bands || [5000, 10000, 20000]).includes(b.hz))
        .map(b => ({ id: b.hz, label: b.label, hint: b.use })),
      value: this.sel.band, sub: true,
      onchange: id => { this.sel.band = +id; this.cfg.onSelect?.(this.sel); },
    });
    if (showQuantity) this.selQty = segment(c, {
      label: 'الكمية المعروضة',
      items: QUANTITIES.map(q => ({ id: q.id, label: `${q.label} (${q.unit})` })),
      value: this.sel.quantity,
      onchange: id => { this.sel.quantity = id; this.cfg.onQuantity?.(id); },
    });
    return this;
  }

  // ── القياس: قلب الجهاز ──
  // يُرجع الكميات الثلاث معًا (كما تفعل أجهزة القياس الحقيقية وكما تطلب جداول الحقيبة)،
  // ومعها الطيف والحكم بالمعيار. كل رقم مشتقّ من الموجة نفسها فلا تتناقض شاشتان.
  measure(overrides = {}) {
    const s = { ...this.sel, ...overrides };
    const key = `${s.point}|${s.dir}|${s.mount}|${s.band}`;
    if (this._cache.has(key)) return this._cache.get(key);

    const pt = this.points.find(p => p.id === s.point);
    const mount = MOUNTS.find(x => x.id === s.mount);
    const fMax = Math.min(s.band, mount.fMax);
    const fs = Math.round(2.56 * s.band);          // اصطلاح المحلّلات: fs = 2.56 × سقف النطاق
    const n = s.band >= 20000 ? 16384 : 8192;

    // شدة كل عطل تُقاس **عند هذه النقطة**: عطل في المحرك يُقرأ أعلى عند محمل المحرك
    const faults = (this.cfg.faults || []).map(f => ({
      type: f.type,
      sev: f.sev * (pt.resp?.[f.at] ?? 1),
    })).filter(f => f.sev > 0.001);

    const seed = (this.cfg.seed || 1) + hash(`${s.point}${s.dir}${s.band}`);
    const raw = synth(this.m, faults, { dir: s.dir, fs, n, seed });
    const a = lowpass(raw.a, fs, fMax);
    const v = integrateWave(a, fs, 1);
    const d = integrateWave(a, fs, 2);

    const spec = {
      a: spectrum(a, fs, { win: 'hann' }),
      v: spectrum(v, fs, { win: 'hann' }),
      d: spectrum(d, fs, { win: 'hann' }),
    };
    const vIso = bandRms(spec.v, 10, 1000);        // المجال الذي يفرضه المعيار
    const ma = metrics(a), mv = metrics(v), md = metrics(d);

    const r = {
      sel: s, point: pt, mount, fs, n, fMax, df: fs / n,
      waves: { a, v, d }, spec,
      a: ma, v: mv, d: md,
      vIsoRms: vIso,
      iso: isoZone(vIso, this.cfg.isoClass || this.m.isoClass),
      bearing: bearingZone(ma.rms, ma.peak),
      crest: crestVerdict(ma.crest),
      shaftHz: shaftHz(this.m.rpm),
      // تحذير صريح حين يقطع التثبيت جزءًا من النطاق المطلوب — الدرس الأهم في المحطة
      clipped: mount.fMax < s.band ? { by: mount.label, at: mount.fMax } : null,
    };
    this._cache.set(key, r);
    this.readings.push(r);
    this.cfg.onMeasure?.(r);
    return r;
  }

  // مسح الذاكرة المؤقتة (عند تغيّر الأعطال — مثل وضع كتلة تصحيح)
  invalidate(newFaults) {
    if (newFaults) this.cfg.faults = newFaults;
    this._cache.clear();
  }

  // ── الرسم على اللوحة ──
  drawStage(ctx, dt) {
    const { W, H } = this.kit, pal = this.kit.pal;
    if (this.running) this.rot += dt * (this.m.rpm / 60) * 0.35;   // دوران مرئي مبطّأ
    drawMachine(ctx, W, H, pal, this.m, { rot: this.rot });
    drawPoints(ctx, W, H, pal, this.points, this.sel.point);
    drawSensor(ctx, W, H, pal, this.point, this.sel.dir, this.sel.mount);
  }

  // نقر اللوحة يختار أقرب نقطة قياس — أسرع من قوائم الاختيار وأقرب للواقع
  bindStageTaps() {
    const cv = this.kit.canvas;
    this._tap = e => {
      const r = cv.getBoundingClientRect();
      const x = (e.touches?.[0]?.clientX ?? e.clientX) - r.left;
      const y = (e.touches?.[0]?.clientY ?? e.clientY) - r.top;
      let best = null, bd = 1e9;
      for (const p of this.points) {
        const dx = p.x * this.kit.W - x, dy = p.y * this.kit.H - y;
        const dist = Math.hypot(dx, dy);
        if (dist < bd) { bd = dist; best = p; }
      }
      if (best && bd < 40) { this.sel.point = best.id; this.selPoint?.set(best.id); this.cfg.onSelect?.(this.sel); }
    };
    cv.addEventListener('pointerdown', this._tap);
    return this;
  }

  destroy() {
    this.running = false;
    this._cache.clear();
    this.kit.canvas?.removeEventListener('pointerdown', this._tap);
  }
}

// شاشة الجهاز: بطاقة قراءات مقروءة من مسافة — أرقام كبيرة ووحدات ظاهرة
export function screen(container) {
  const box = el('div', {
    style: 'border:1px solid var(--c-border2); border-radius:14px; padding:10px 12px; margin:8px 0;' +
      'background:var(--c-surface2); display:grid; grid-template-columns:repeat(auto-fit,minmax(96px,1fr)); gap:8px',
  });
  container.append(box);
  return {
    set(items) {
      box.innerHTML = items.map(i => `
        <div style="text-align:center">
          <div style="font-size:11px;color:var(--c-text2)">${i.label}</div>
          <div class="ltr" style="font-size:1.05rem;font-weight:800;color:${i.color || 'var(--c-text)'}">${i.value}</div>
          <div class="ltr" style="font-size:10px;color:var(--c-text2)">${i.unit || ''}</div>
        </div>`).join('');
    },
    node: box,
  };
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100000;
}
