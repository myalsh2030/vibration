// رسم الآلات الافتراضية على اللوحة من قائمة أجزاء تصريحية.
// الإحداثيات نسبية: x و w كسور من العرض، y و h كسور من الارتفاع، و r نصف قطر بكسور العرض.
// الألوان **مشتقّة من kit.pal حصرًا** فتتبع الوضعين فاتح/داكن بلا متغيّرات CSS جديدة.
import { withAlpha, label } from './simkit.js';

export function partColors(pal) {
  return {
    body: withAlpha(pal.text2, 0.26),
    bodyEdge: withAlpha(pal.text2, 0.55),
    base: withAlpha(pal.text2, 0.42),
    shaft: withAlpha(pal.text2, 0.72),
    rotor: withAlpha(pal.water, 0.72),
    rotorEdge: pal.water,
    pipe: withAlpha(pal.water2, 0.32),
    accent: pal.amber,
  };
}

// رسم الآلة كاملة. rot: زاوية الدوران بالراديان (لتحريك الدوّار)
export function drawMachine(ctx, W, H, pal, machine, { rot = 0, showLabels = false } = {}) {
  const c = partColors(pal);
  for (const p of machine.parts || []) drawPart(ctx, W, H, c, pal, p, rot, showLabels);
}

function drawPart(ctx, W, H, c, pal, p, rot, showLabels) {
  const fill = c[p.fill] || c.body;
  ctx.save();
  ctx.lineWidth = 1.4;
  switch (p.t) {
    case 'rect': {
      const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H, r = (p.r || 0) * W;
      roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = c.bodyEdge; ctx.stroke();
      if (showLabels && p.label) label(ctx, p.label, x + w / 2, y + h / 2, { size: 10, align: 'center', color: pal.text2 });
      break;
    }
    case 'circle': {
      ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r * W, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = p.fill === 'rotor' ? c.rotorEdge : c.bodyEdge; ctx.stroke();
      break;
    }
    case 'lines': {
      ctx.strokeStyle = fill; ctx.lineWidth = 2;
      for (const [x1, y1, x2, y2] of p.pts) {
        ctx.beginPath(); ctx.moveTo(x1 * W, y1 * H); ctx.lineTo(x2 * W, y2 * H); ctx.stroke();
      }
      break;
    }
    case 'tri': {
      ctx.beginPath();
      p.pts.forEach(([x, y], i) => i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H));
      ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = c.rotorEdge; ctx.stroke();
      break;
    }
    case 'blades': {           // مروحة: شفرات تدور فعلًا
      const cx = p.x * W, cy = p.y * H, r = p.r * W;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = c.shaft; ctx.fill();
      ctx.strokeStyle = c.rotorEdge; ctx.lineWidth = 2.2;
      for (let i = 0; i < p.n; i++) {
        const a = rot + i * 2 * Math.PI / p.n;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3);
        ctx.quadraticCurveTo(
          cx + Math.cos(a + 0.35) * r * 0.75, cy + Math.sin(a + 0.35) * r * 0.75,
          cx + Math.cos(a + 0.15) * r, cy + Math.sin(a + 0.15) * r);
        ctx.stroke();
      }
      break;
    }
    case 'disc': {             // قرص تصحيح بثقوب مرقّمة على محيطه
      const cx = p.x * W, cy = p.y * H, r = p.r * W;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = c.rotorEdge; ctx.lineWidth = 1.6; ctx.stroke();
      for (let i = 0; i < (p.holes || 12); i++) {
        const a = rot + i * 2 * Math.PI / (p.holes || 12);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74, Math.max(1.6, r * 0.09), 0, Math.PI * 2);
        ctx.fillStyle = withAlpha(pal.bg, 0.85); ctx.fill();
        ctx.strokeStyle = withAlpha(pal.text2, 0.5); ctx.lineWidth = 0.9; ctx.stroke();
      }
      // علامة الصفر: مرجع كل الزوايا
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rot) * r * 0.3, cy + Math.sin(rot) * r * 0.3);
      ctx.lineTo(cx + Math.cos(rot) * r, cy + Math.sin(rot) * r);
      ctx.stroke();
      break;
    }
    case 'piston': {           // مكبس وكرنك متحركان
      const cx = p.x * W, cy = p.y * H, r = p.r * W;
      const L = r * 3.1;
      const px = cx + Math.cos(rot) * r, py = cy + Math.sin(rot) * r;
      const topY = cy - Math.sqrt(Math.max(0, L * L - (px - cx) * (px - cx))) + (py - cy) * 0;
      ctx.strokeStyle = c.shaft; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, topY); ctx.stroke();
      ctx.fillStyle = c.rotor; ctx.strokeStyle = c.rotorEdge; ctx.lineWidth = 1.4;
      roundRect(ctx, cx - r * 0.55, topY - r * 0.5, r * 1.1, r * 0.7, r * 0.12);
      ctx.fill(); ctx.stroke();
      break;
    }
    case 'arm': {              // ذراع دوّار بكتلة على طرفه
      const cx = p.x * W, cy = p.y * H, r = 0.13 * W;
      ctx.strokeStyle = c.shaft; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(rot) * r, cy + Math.sin(rot) * r); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + Math.cos(rot) * r, cy + Math.sin(rot) * r, r * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = c.accent; ctx.fill();
      break;
    }
    case 'tacho': {            // مستشعر الطور: يرى علامة العاكس مرة كل دورة
      const x = p.x * W, y = p.y * H;
      ctx.fillStyle = c.accent;
      roundRect(ctx, x - 5, y - 9, 10, 18, 3); ctx.fill();
      ctx.strokeStyle = withAlpha(pal.amber, 0.55); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 22, y); ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

// نقاط القياس على الآلة: دوائر مرقّمة، والمختارة منها بارزة
export function drawPoints(ctx, W, H, pal, points, selectedId) {
  points.forEach((p, i) => {
    const x = p.x * W, y = p.y * H;
    const on = p.id === selectedId;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, on ? 11 : 8, 0, Math.PI * 2);
    ctx.fillStyle = on ? pal.amber : withAlpha(pal.bg, 0.9);
    ctx.fill();
    ctx.lineWidth = on ? 2.4 : 1.6;
    ctx.strokeStyle = on ? pal.amber : withAlpha(pal.text2, 0.75);
    ctx.stroke();
    label(ctx, String(i + 1), x, y + 0.5, {
      size: on ? 12 : 10, align: 'center',
      color: on ? withAlpha(pal.bg, 1) : pal.text2, weight: 800,
    });
    ctx.restore();
  });
}

// الحسّاس مثبّتًا على النقطة المختارة، وسهم يبيّن اتجاه القياس
export function drawSensor(ctx, W, H, pal, point, dir, mountId) {
  if (!point) return;
  const x = point.x * W, y = point.y * H;
  const v = dir === 'V' ? [0, -1] : dir === 'A' ? [-0.85, -0.5] : [1, 0];
  const len = 30;
  ctx.save();
  // جسم الحسّاس
  const sx = x + v[0] * 17, sy = y + v[1] * 17;
  ctx.translate(sx, sy);
  ctx.rotate(Math.atan2(v[1], v[0]));
  ctx.fillStyle = pal.badge;
  ctx.strokeStyle = withAlpha(pal.badge, 0.6);
  roundRect(ctx, -9, -6, 18, 12, 3); ctx.fill();
  if (mountId === 'magnet') { roundRect(ctx, -11, -7.5, 4, 15, 1.5); ctx.fill(); }
  if (mountId === 'probe') { ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-24, 0); ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
  // سهم الاتجاه
  ctx.save();
  ctx.strokeStyle = pal.amber; ctx.fillStyle = pal.amber; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + v[0] * len, y + v[1] * len); ctx.stroke();
  const a = Math.atan2(v[1], v[0]), hx = x + v[0] * len, hy = y + v[1] * len;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx - 7 * Math.cos(a - 0.45), hy - 7 * Math.sin(a - 0.45));
  ctx.lineTo(hx - 7 * Math.cos(a + 0.45), hy - 7 * Math.sin(a + 0.45));
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r || 0, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
