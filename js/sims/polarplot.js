// المخطط القطبي — لغة الاتزان البصرية: كل قراءة سهمٌ له طول (سعة) وزاوية (طور).
// بدون هذا المخطط يبقى الاتزان أرقامًا؛ ومعه يرى المتدرب لماذا تُلغي كتلةُ التصحيح الاهتزازَ.
import { el } from '../ui.js';
import { readPalette, withAlpha } from './simkit.js';

export class PolarPlot {
  constructor(container, { height = 230, title = '' } = {}) {
    this.h = height;
    this.title = title;
    this.vectors = [];
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%; display:block; border-radius:12px';
    this.root = el('div', { style: 'margin:8px 0' }, this.canvas);
    this.legend = el('div', { style: 'display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:6px; font-size:12px' });
    this.root.append(this.legend);
    container.append(this.root);
    this.ctx = this.canvas.getContext('2d');
    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _resize() {
    const w = this.root.clientWidth || 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w; this.H = this.h;
    this.redraw();
  }

  // vectors: [{mag, deg, label, color:'water'|'amber'|'ok'|'bad'|'badge', dashed?, dot?}]
  set(vectors, { maxMag } = {}) {
    this.vectors = vectors.filter(Boolean);
    this.maxMag = maxMag;
    this.redraw();
    return this;
  }

  redraw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    if (!ctx || !W) return;
    const pal = readPalette();
    const COL = { water: pal.water, amber: pal.amber, ok: pal.ok, bad: pal.bad, badge: pal.badge, text2: pal.text2 };
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 22;

    // شبكة قطبية: دوائر بمقادير متساوية وأشعة كل 30°
    ctx.save();
    ctx.strokeStyle = withAlpha(pal.text2, 0.22); ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(cx, cy, R * i / 4, 0, Math.PI * 2); ctx.stroke(); }
    for (let a = 0; a < 360; a += 30) {
      const r = a * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(r) * R, cy - Math.sin(r) * R);
      ctx.stroke();
    }
    ctx.restore();

    // تدريج الزوايا — 0° يمينًا والزاوية تنمو عكس عقارب الساعة (اصطلاح أجهزة الاتزان)
    ctx.save();
    ctx.font = '700 10px Cairo, sans-serif';
    ctx.fillStyle = pal.text2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let a = 0; a < 360; a += 45) {
      const r = a * Math.PI / 180;
      ctx.fillText(`${a}°`, cx + Math.cos(r) * (R + 13), cy - Math.sin(r) * (R + 13));
    }
    ctx.restore();

    const max = this.maxMag || Math.max(1e-9, ...this.vectors.map(v => v.mag)) * 1.12;

    for (const v of this.vectors) {
      const r = v.deg * Math.PI / 180;
      const len = R * Math.min(1, v.mag / max);
      const x = cx + Math.cos(r) * len, y = cy - Math.sin(r) * len;
      const col = COL[v.color] || pal.water;
      ctx.save();
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      if (v.dashed) ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      ctx.setLineDash([]);
      if (v.dot) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
      else {
        const a2 = Math.atan2(y - cy, x - cx);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 9 * Math.cos(a2 - 0.42), y - 9 * Math.sin(a2 - 0.42));
        ctx.lineTo(x - 9 * Math.cos(a2 + 0.42), y - 9 * Math.sin(a2 + 0.42));
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = pal.text2;
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    this.legend.innerHTML = this.vectors.map(v => {
      const c = ({ water: 'var(--c-water)', amber: 'var(--c-amber)', ok: 'var(--c-ok)', bad: 'var(--c-bad)', badge: 'var(--c-badge)' })[v.color] || 'var(--c-water)';
      return `<span class="chip" style="color:${c};border-color:${c}">${v.label}: ` +
        `<b class="ltr">${fmt(v.mag)} ∠ ${v.deg.toFixed(1)}°</b></span>`;
    }).join('');
  }

  destroy() {
    window.removeEventListener('resize', this._resize);
    this.root.remove();
  }
}

function fmt(v) {
  const a = Math.abs(v);
  return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : a >= 1 ? v.toFixed(2) : v.toFixed(3);
}
