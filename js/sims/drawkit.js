// عدة لوحة الرسم — طبقة فوق SimKit خاصة بمقرر الرسم الهندسي.
//
// لماذا توجد؟ لأن أدوات هذا المقرر الأربع عشرة كلها ترسم الشيء نفسه: ورقة عليها
// شبكة، وخطوط اصطلاحية لكل منها معنى (متصل مرئي، متقطع مخفي، محور، إنشاء)، وتهشير،
// وخطوط أبعاد، وإسقاط أيزومتري. لو تركنا كل أداة تعيد اختراعها لاختلفت سُمك الخطوط
// ومعانيها بين أداة وأخرى — وذلك بالضبط ما يُربك المتدرب في مقرر مادته الاصطلاحات.
//
// عقد الألوان: كلها من متغيرات CSS (تتجدد مع تبديل الثيم) — ممنوع hex صلب في أي أداة.
//   --c-paper  أرضية اللوحة    --c-graph  الشبكة
//   --c-lead   المتصل السميك   --c-lead2  الرفيع والإنشاء
//   --c-hidden المتقطع المخفي  --c-center خط المحور والقطع
import { label } from './simkit.js';
import { on } from '../store.js';

// ───────────────────── لوحة ألوان الورقة ─────────────────────
export function drawPal() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n, fb) => (cs.getPropertyValue(n) || fb).trim() || fb;
  return {
    paper:  v('--c-paper',  '#111c33'),
    graph:  v('--c-graph',  'rgba(129,140,248,.13)'),
    lead:   v('--c-lead',   '#e2e8f0'),
    lead2:  v('--c-lead2',  '#94a3b8'),
    hidden: v('--c-hidden', '#fbbf24'),
    center: v('--c-center', '#34d399'),
  };
}

// ───────────────────── أنماط الخطوط الاصطلاحية ─────────────────────
// key: مفتاح اللون (في dp أو في kit.pal) — w: السُمك — dash: نمط التقطيع
export const LS = {
  visible:      { key: 'lead',   w: 2.2, dash: [] },              // متصل سميك: الحواف المرئية
  thin:         { key: 'lead2',  w: 1.0, dash: [] },              // متصل رفيع
  hidden:       { key: 'hidden', w: 1.6, dash: [7, 4] },          // متقطع: الحواف المخفية
  center:       { key: 'center', w: 1.2, dash: [14, 3, 3, 3] },   // خط المحور
  cut:          { key: 'center', w: 2.4, dash: [16, 3, 4, 3] },   // رمز مستوى القطع
  construction: { key: 'lead2',  w: 1.0, dash: [4, 4] },          // خطوط الإنشاء المؤقتة
  projection:   { key: 'lead2',  w: 0.9, dash: [3, 3] },          // خطوط الإسقاط الرابطة
  dim:          { key: 'lead2',  w: 1.1, dash: [] },              // خط البُعد وخط الإسناد
  arc:          { key: 'water',  w: 1.7, dash: [5, 4] },          // أقواس الفرجار
  accent:       { key: 'water',  w: 2.4, dash: [] },              // تمييز
  ok:           { key: 'ok',     w: 2.4, dash: [] },
  bad:          { key: 'bad',    w: 2.4, dash: [] },
  hatch:        { key: 'water',  w: 1.0, dash: [] },              // خطوط التهشير
};

/**
 * لوحة رسم فوق canvas الخاص بـ SimKit.
 * @param {SimKit} kit
 */
export class Board {
  constructor(kit) {
    this.kit = kit;
    this.dp = drawPal();
    this._off = on('theme', () => { this.dp = drawPal(); });
  }

  destroy() { this._off?.(); }

  /** لون النمط: يبحث في لوحة الورقة أولًا ثم في لوحة الواجهة */
  color(style) {
    const s = typeof style === 'string' ? LS[style] : style;
    const k = s?.key || 'lead';
    return this.dp[k] || this.kit.pal[k] || this.dp.lead;
  }

  /** يطبّق النمط على السياق ويعيد مقاس السُمك المطبَّق */
  apply(c, style, { width, color } = {}) {
    const s = (typeof style === 'string' ? LS[style] : style) || LS.visible;
    c.strokeStyle = color || this.color(s);
    c.lineWidth = width ?? s.w;
    c.setLineDash(s.dash || []);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    return c.lineWidth;
  }

  /** أرضية الورقة + شبكة اختيارية */
  paper(c, { grid = 20, margin = 0 } = {}) {
    const { W, H } = this.kit;
    c.save();
    c.fillStyle = this.dp.paper;
    c.fillRect(0, 0, W, H);
    if (grid > 0) {
      c.strokeStyle = this.dp.graph;
      c.lineWidth = 1;
      c.setLineDash([]);
      c.beginPath();
      for (let x = margin; x <= W - margin; x += grid) { c.moveTo(x + .5, margin); c.lineTo(x + .5, H - margin); }
      for (let y = margin; y <= H - margin; y += grid) { c.moveTo(margin, y + .5); c.lineTo(W - margin, y + .5); }
      c.stroke();
    }
    c.restore();
  }

  line(c, x1, y1, x2, y2, style = 'visible', opts) {
    c.save(); this.apply(c, style, opts);
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.restore();
  }

  /** pts: [[x,y], …] */
  poly(c, pts, style = 'visible', { close = true, fill, ...opts } = {}) {
    if (!pts?.length) return;
    c.save(); this.apply(c, style, opts);
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    if (close) c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    c.stroke();
    c.restore();
  }

  circle(c, cx, cy, r, style = 'visible', { fill, ...opts } = {}) {
    c.save(); this.apply(c, style, opts);
    c.beginPath(); c.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    c.stroke();
    c.restore();
  }

  arc(c, cx, cy, r, a0, a1, style = 'arc', opts) {
    c.save(); this.apply(c, style, opts);
    c.beginPath(); c.arc(cx, cy, Math.max(0, r), a0, a1);
    c.stroke();
    c.restore();
  }

  /** قطع ناقص — الدائرة في الإسقاط الأيزومتري */
  ellipse(c, cx, cy, rx, ry, rot = 0, style = 'visible', opts) {
    c.save(); this.apply(c, style, opts);
    c.beginPath(); c.ellipse(cx, cy, Math.max(0, rx), Math.max(0, ry), rot, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  /** نقطة إنشاء مُعلَّمة (تقاطع أقواس، مركز قوس…) */
  dot(c, x, y, { r = 3.2, color, tag, style = 'accent' } = {}) {
    c.save();
    c.fillStyle = color || this.color(style);
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.restore();
    if (tag) label(c, tag, x + 7, y - 8, { size: 12, color: color || this.color(style), align: 'left' });
  }

  /**
   * تهشير مضلع بخطوط متوازية — بخوارزمية المسح (scanline) لا بنمط، فينضبط
   * انقطاعه عند حدود الشكل تمامًا كما يُهشَّر باليد.
   * @param {Array<[number,number]>} pts المضلع
   * @param {{angle?:number, gap?:number, style?:string, color?:string, width?:number}} o
   */
  hatch(c, pts, { angle = 45, gap = 7, style = 'hatch', color, width } = {}) {
    if (!pts || pts.length < 3) return;
    const a = angle * Math.PI / 180;
    const ca = Math.cos(a), sa = Math.sin(a);
    // إسقاط رؤوس المضلع على المحور العمودي على اتجاه التهشير
    let lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) {
      const t = -x * sa + y * ca;
      if (t < lo) lo = t; if (t > hi) hi = t;
    }
    c.save();
    this.apply(c, style, { color, width });
    c.beginPath();
    for (let t = Math.ceil(lo / gap) * gap; t <= hi; t += gap) {
      // تقاطعات الخط (u·(ca,sa) + t·(-sa,ca)) مع أضلاع المضلع
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        const t1 = -x1 * sa + y1 * ca, t2 = -x2 * sa + y2 * ca;
        if ((t1 <= t && t2 > t) || (t2 <= t && t1 > t)) {
          const k = (t - t1) / (t2 - t1);
          const px = x1 + (x2 - x1) * k, py = y1 + (y2 - y1) * k;
          xs.push(px * ca + py * sa);          // الإحداثي على اتجاه التهشير
        }
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        c.moveTo(xs[i] * ca - t * sa, xs[i] * sa + t * ca);
        c.lineTo(xs[i + 1] * ca - t * sa, xs[i + 1] * sa + t * ca);
      }
    }
    c.stroke();
    c.restore();
  }

  /** رأس سهم بُعد ممتلئ — طوله 3-5mm وعرض قاعدته ثلث طوله (قاعدة الحقيبة) */
  arrowHead(c, x, y, ang, { len = 10, color } = {}) {
    const w = len / 3;
    c.save();
    c.fillStyle = color || this.color('dim');
    c.setLineDash([]);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - len * Math.cos(ang) + w * Math.sin(ang), y - len * Math.sin(ang) - w * Math.cos(ang));
    c.lineTo(x - len * Math.cos(ang) - w * Math.sin(ang), y - len * Math.sin(ang) + w * Math.cos(ang));
    c.closePath(); c.fill();
    c.restore();
  }

  /**
   * بُعد كامل: خطا إسناد + خط بُعد برأسَي سهم + الرقم فوقه.
   * الفجوة 2px عن الجسم والبروز 2px بعد خط البُعد — نسبة الحقيبة نفسها.
   */
  dim(c, x1, y1, x2, y2, text, { off = 26, color, gap = 4, over = 5, size = 12.5 } = {}) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const nx = -Math.sin(ang), ny = Math.cos(ang);   // العمودي على الاتجاه
    const dx = nx * off, dy = ny * off;
    const col = color || this.color('dim');
    // خطا الإسناد: يبدآن بفجوة عن الجسم ويبرزان قليلًا بعد خط البُعد
    this.line(c, x1 + nx * gap, y1 + ny * gap, x1 + dx + nx * over, y1 + dy + ny * over, 'dim', { color: col });
    this.line(c, x2 + nx * gap, y2 + ny * gap, x2 + dx + nx * over, y2 + dy + ny * over, 'dim', { color: col });
    // خط البُعد
    this.line(c, x1 + dx, y1 + dy, x2 + dx, y2 + dy, 'dim', { color: col });
    this.arrowHead(c, x1 + dx, y1 + dy, ang + Math.PI, { color: col });
    this.arrowHead(c, x2 + dx, y2 + dy, ang, { color: col });
    // الرقم: فوق منتصف خط البُعد، ومقلوب إن انقلب النص رأسًا على عقب
    if (text != null) {
      const mx = (x1 + x2) / 2 + dx, my = (y1 + y2) / 2 + dy;
      let a = ang;
      if (a > Math.PI / 2 || a < -Math.PI / 2) a += Math.PI;
      c.save();
      c.translate(mx, my); c.rotate(a);
      c.font = `700 ${size}px Cairo, sans-serif`;
      c.fillStyle = col;
      c.textAlign = 'center'; c.textBaseline = 'bottom';
      c.direction = 'ltr';
      c.fillText(String(text), 0, -4);
      c.restore();
    }
  }

  /** وسم عربي مختصر (تمريرة إلى simkit.label بلون اللوحة) */
  text(c, t, x, y, o = {}) {
    label(c, t, x, y, { color: this.dp.lead2, ...o });
  }
}

// ───────────────────── الإسقاط الأيزومتري ─────────────────────
// المحوران الأفقيان يميلان 30° عن الأفقي، والارتفاع رأسي — أي 120° بين كل محورين.
const C30 = Math.cos(Math.PI / 6);   // 0.8660
const S30 = Math.sin(Math.PI / 6);   // 0.5

/**
 * (x,y,z) في فضاء القطعة ← (px,py) على الشاشة، بإسقاط أيزومتري حقيقي.
 * x يمينًا-خلفًا، y يسارًا-خلفًا، z لأعلى.
 */
export function iso(x, y, z, { ox = 0, oy = 0, s = 1 } = {}) {
  return [ox + (x - y) * C30 * s, oy - z * s + (x + y) * S30 * s];
}

/**
 * إسقاط ثنائي التقايس (ديمتري) — للمقارنة مع الأيزومتري:
 * الوجه الأمامي بلا ميل، والعمق بميل زاوية واحدة واختصار نصف المقياس.
 */
export function dimetric(x, y, z, { ox = 0, oy = 0, s = 1, ang = 30, fore = 0.5 } = {}) {
  const a = ang * Math.PI / 180;
  return [ox + (x - y * Math.cos(a) * fore) * s, oy - (z - y * Math.sin(a) * fore) * s];
}

/** أوجه مكعّب مصمَّت بالترتيب الصحيح للرسم (خلف ← أمام) */
export function boxFaces(w, d, h, o) {
  const P = (x, y, z) => iso(x, y, z, o);
  return {
    top:   [P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)],
    left:  [P(0, 0, 0), P(0, 0, h), P(0, d, h), P(0, d, 0)],
    front: [P(0, 0, 0), P(w, 0, 0), P(w, 0, h), P(0, 0, h)],
    right: [P(w, 0, 0), P(w, d, 0), P(w, d, h), P(w, 0, h)],
  };
}
