// عارض الإشارة: الموجة الزمنية والطيف الترددي، بمؤشّر يقرأ القيمة عند أي تردد.
// لوحة مستقلة عن لوحة الآلة، تُرسم عند الطلب لا في حلقة — فلا تستهلك بطارية.
import { el } from '../ui.js';
import { readPalette, withAlpha } from './simkit.js';
import { topPeaks } from './vibkit.js';
import { roundRect } from './machinedraw.js';

export class Scope {
  constructor(container, { height = 158, title = '' } = {}) {
    this.h = height;
    this.title = title;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%; display:block; touch-action:pan-y; border-radius:12px';
    this.root = el('div', { style: 'margin:8px 0' }, this.canvas);
    this.caption = el('div', {
      class: 'ltr',
      style: 'font-size:12px; color:var(--c-text2); text-align:center; margin-top:4px; min-height:17px; direction:ltr',
    });
    this.root.append(this.caption);
    container.append(this.root);
    this.ctx = this.canvas.getContext('2d');
    this._last = null;
    this._cursor = null;
    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._pick = e => {
      const r = this.canvas.getBoundingClientRect();
      this._cursor = (e.clientX - r.left) / r.width;
      this.redraw();
    };
    this.canvas.addEventListener('pointerdown', this._pick);
    this.canvas.addEventListener('pointermove', e => { if (e.buttons) this._pick(e); });
    this._resize();
  }

  _resize() {
    const w = this.root.clientWidth || 320;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w; this.H = this.h;
    this.redraw();
  }

  // الموجة الزمنية — هنا يُرى شكل الإشارة: جيبية أم نبضية أم عشوائية
  wave(x, fs, { unit = '', label = 'الموجة الزمنية', ms = 0, color } = {}) {
    this._last = { kind: 'wave', x, fs, unit, label, ms, color };
    this._cursor = null;
    this.redraw();
    return this;
  }

  // الطيف — هنا يُرى **سبب** الاهتزاز: أي تردد يحمل الطاقة
  spectrum(spec, { unit = '', label = 'الطيف الترددي', fMax, marks = [], peaks = 5, logY = false, color } = {}) {
    this._last = { kind: 'spec', spec, unit, label, fMax, marks, peaks, logY, color };
    this._cursor = null;
    this.redraw();
    return this;
  }

  clear() { this._last = null; this._cursor = null; this.redraw(); return this; }

  redraw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    if (!ctx || !W) return;
    const pal = readPalette();
    ctx.clearRect(0, 0, W, H);
    roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 11);
    ctx.fillStyle = pal.bg; ctx.fill();
    ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.stroke();
    if (!this._last) {
      txt(ctx, 'اضغط «قياس» لعرض الإشارة', W / 2, H / 2, { color: pal.text2, size: 12, align: 'center' });
      this.caption.textContent = '';
      return;
    }
    const P = { l: 40, r: 8, t: 18, b: 20 };
    const gw = W - P.l - P.r, gh = H - P.t - P.b;
    ctx.save();
    ctx.strokeStyle = withAlpha(pal.text2, 0.18); ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = P.t + gh * i / 4;
      ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(P.l + gw, y); ctx.stroke();
    }
    ctx.restore();
    this._last.kind === 'wave' ? this._drawWave(ctx, pal, P, gw, gh) : this._drawSpec(ctx, pal, P, gw, gh);
    txt(ctx, this._last.label, W - 8, 10, { color: pal.text2, size: 11, align: 'right' });
  }

  _drawWave(ctx, pal, P, gw, gh) {
    const { x, fs, unit, ms, color } = this._last;
    const span = ms > 0 ? Math.min(x.length, Math.round(fs * ms / 1000)) : x.length;
    let max = 1e-9;
    for (let i = 0; i < span; i++) max = Math.max(max, Math.abs(x[i]));
    const mid = P.t + gh / 2, sc = (gh / 2) * 0.92 / max;
    ctx.save();
    ctx.strokeStyle = withAlpha(pal.text2, 0.35);
    ctx.beginPath(); ctx.moveTo(P.l, mid); ctx.lineTo(P.l + gw, mid); ctx.stroke();
    ctx.strokeStyle = color || pal.water; ctx.lineWidth = 1.4; ctx.beginPath();
    const step = Math.max(1, Math.floor(span / (gw * 2)));
    for (let i = 0, k = 0; i < span; i += step, k++) {
      const px = P.l + gw * i / span, py = mid - x[i] * sc;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    txt(ctx, fmtNum(max), P.l - 4, P.t + 6, { color: pal.text2, size: 10, align: 'right' });
    txt(ctx, '0', P.l - 4, mid, { color: pal.text2, size: 10, align: 'right' });
    txt(ctx, `${(span / fs * 1000).toFixed(0)} ms`, P.l + gw, P.t + gh + 10, { color: pal.text2, size: 10, align: 'right' });
    this.caption.textContent = `${unit}   —   ${span} sample @ ${fs} Hz`;
  }

  _drawSpec(ctx, pal, P, gw, gh) {
    const { spec, unit, fMax, marks, peaks, color } = this._last;
    const top = fMax || (spec.amp.length * spec.df);
    const kMax = Math.min(spec.amp.length - 1, Math.floor(top / spec.df));
    let max = 1e-12;
    for (let k = 1; k <= kMax; k++) max = Math.max(max, spec.amp[k]);
    const base = P.t + gh;
    ctx.save();
    ctx.strokeStyle = color || pal.amber; ctx.lineWidth = 1;
    for (let px = 0; px < gw; px++) {                    // عمود لكل بكسل = أعلى قمة داخله
      const k0 = Math.max(1, Math.floor(kMax * px / gw));
      const k1 = Math.max(k0, Math.floor(kMax * (px + 1) / gw));
      let m = 0;
      for (let k = k0; k <= k1; k++) m = Math.max(m, spec.amp[k]);
      const h = gh * (m / max) * 0.94;
      if (h < 0.4) continue;
      ctx.beginPath(); ctx.moveTo(P.l + px + 0.5, base); ctx.lineTo(P.l + px + 0.5, base - h); ctx.stroke();
    }
    ctx.restore();

    // علامات مرجعية (1×، 2×، تردد مرور الريش، BPFO…) — يضعها المحاكي لا المتدرب
    for (const mk of marks) {
      if (mk.f > top) continue;
      const px = P.l + gw * mk.f / top;
      ctx.save();
      ctx.strokeStyle = withAlpha(mk.color || pal.badge, 0.75);
      ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, P.t); ctx.lineTo(px, base); ctx.stroke();
      ctx.restore();
      txt(ctx, mk.label, px, P.t + 6, { color: mk.color || pal.badge, size: 10, align: 'center' });
    }

    // أعلى القمم مؤشَّرة بقيمها — هذا ما يقرأه الفنّي فعلًا
    if (peaks) {
      for (const p of topPeaks(spec, { count: peaks, fMin: 2 * spec.df, fMax: top, minRel: 0.08 })) {
        const px = P.l + gw * p.f / top, py = base - gh * (p.amp / max) * 0.94;
        ctx.save();
        ctx.fillStyle = pal.ok;
        ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    if (this._cursor != null) {
      const px = P.l + gw * Math.max(0, Math.min(1, (this._cursor * this.W - P.l) / gw));
      const f = (px - P.l) / gw * top;
      const k = Math.max(1, Math.min(kMax, Math.round(f / spec.df)));
      ctx.save();
      ctx.strokeStyle = pal.ok; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, P.t); ctx.lineTo(px, base); ctx.stroke();
      ctx.restore();
      this.caption.textContent = `${(k * spec.df).toFixed(1)} Hz  ·  ${fmtNum(spec.amp[k])} ${unit}`;
    } else {
      this.caption.textContent = `0 – ${fmtNum(top)} Hz  ·  ${unit}  ·  Δf = ${spec.df.toFixed(2)} Hz`;
    }
    txt(ctx, fmtNum(max), P.l - 4, P.t + 6, { color: pal.text2, size: 10, align: 'right' });
    txt(ctx, '0', P.l - 4, base, { color: pal.text2, size: 10, align: 'right' });
    txt(ctx, `${Math.round(top)} Hz`, P.l + gw, base + 10, { color: pal.text2, size: 10, align: 'right' });
  }

  destroy() {
    window.removeEventListener('resize', this._resize);
    this.root.remove();
  }
}

function txt(ctx, s, x, y, { color, size = 11, align = 'right', weight = 700 } = {}) {
  ctx.save();
  ctx.font = `${weight} ${size}px Cairo, sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText(s, x, y);
  ctx.restore();
}

function fmtNum(v) {
  const a = Math.abs(v);
  if (a >= 1000) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  if (a >= 1) return v.toFixed(2);
  if (a >= 0.01) return v.toFixed(3);
  return v.toExponential(1);
}
