// عدة المختبر المشتركة: شريط مراحل التجربة + جدول القراءات + إدخال الحسابات بمناطق الدقة
// تُستخدم مع SimKit في كل محاكيات المحطات — الألوان من متغيرات CSS حصرًا (الوضعان فاتح/داكن).
import { el } from '../ui.js';

export const PHASES = ['تجهيز', 'قياس', 'جدول', 'حساب', 'تحقق'];

// شريط مراحل الجلسة المعملية الخمس — kit: PhaseBar(kit.controls) قبل بقية التحكمات
export class PhaseBar {
  constructor(container, phases = PHASES) {
    this.phases = phases;
    this.index = 0;
    this.root = el('div', { class: 'sim-row', style: 'flex-wrap:wrap; gap:6px; justify-content:center' });
    this._chips = phases.map((p, i) =>
      el('span', { class: 'chip', style: 'transition:all .25s' }, `${i + 1}. ${p}`));
    this.root.append(...this._chips);
    container.prepend(this.root);
    this.set(0);
  }
  set(i) {
    this.index = Math.max(0, Math.min(i, this.phases.length - 1));
    this._chips.forEach((c, j) => {
      c.style.opacity = j <= this.index ? '1' : '.45';
      c.style.borderColor = j === this.index ? 'var(--c-amber)' : (j < this.index ? 'var(--c-ok)' : '');
      c.style.color = j === this.index ? 'var(--c-amber)' : (j < this.index ? 'var(--c-ok)' : '');
      c.textContent = `${j < this.index ? '✓' : j + 1}. ${this.phases[j]}`;
    });
  }
  next() { this.set(this.index + 1); }
}

// جدول تسجيل القراءات — cols: [{key, label, unit?}], rows: مصفوفة تسميات صفوف أو عدد
export class DataTable {
  constructor(container, { cols, rows }) {
    this.cols = cols;
    const labels = Array.isArray(rows) ? rows : Array.from({ length: rows }, (_, i) => String(i + 1));
    this.rowCount = labels.length;
    this._cells = {}; // `${r}:${key}` → td
    const thead = el('tr', {},
      el('th', { style: TH }, '#'),
      ...cols.map(c => el('th', { style: TH, html: c.unit ? `${c.label}<br><span class="ltr" style="font-weight:400">${c.unit}</span>` : c.label })));
    const body = labels.map((lab, r) =>
      el('tr', {},
        el('td', { style: TD + 'font-weight:700' }, lab),
        ...cols.map(c => {
          const td = el('td', { style: TD, class: 'ltr' }, '—');
          this._cells[`${r}:${c.key}`] = td;
          return td;
        })));
    this.root = el('div', { style: 'overflow-x:auto; margin:8px 0' },
      el('table', { style: 'width:100%; border-collapse:collapse; font-size:.82rem; text-align:center' }, thead, ...body));
    container.append(this.root);
  }
  setCell(r, key, text, state = '') {
    const td = this._cells[`${r}:${key}`];
    if (!td) return;
    td.textContent = text;
    td.style.color = state === 'ok' ? 'var(--c-ok)' : state === 'bad' ? 'var(--c-bad)' : '';
    td.style.fontWeight = state ? '700' : '';
  }
  getCell(r, key) {
    const t = this._cells[`${r}:${key}`]?.textContent;
    return t === '—' ? '' : t;
  }
  isComplete() { return Object.values(this._cells).every(td => td.textContent !== '—'); }
  filledCount() { return Object.values(this._cells).filter(td => td.textContent !== '—').length; }
}
const TH = 'padding:5px 7px; border-bottom:2px solid var(--c-border2); color:var(--c-text2); font-size:.75rem;';
const TD = 'padding:5px 7px; border-bottom:1px solid var(--c-border2);';

// مناطق دقة القياس — حاكم موحد لكل المحطات
export function accuracyZone(errPct) {
  if (errPct <= 2) return { cls: 'gold', emoji: '✅', label: 'قراءة ذهبية!', pass: true, score: 1 };
  if (errPct <= 5) return { cls: 'ok', emoji: '⭐', label: 'جيد', pass: true, score: 0.7 };
  if (errPct <= 10) return { cls: 'warn', emoji: '🔶', label: 'مقبول', pass: true, score: 0.4 };
  return { cls: 'bad', emoji: '🔴', label: 'خطأ كبير — أعد المحاولة', pass: false, score: 0 };
}

// إدخال حساب يقارن بالمرجع ويعرض منطقة الدقة — onResult(errPct, zone, value)
export class CalcInput {
  constructor(container, { label, unit = '', ref, placeholder = '؟', onResult }) {
    this.ref = ref;
    const input = el('input', {
      type: 'number', step: 'any', inputmode: 'decimal', placeholder,
      style: 'direction:ltr; text-align:center; width:110px; padding:8px; border-radius:10px;' +
        'border:1px solid var(--c-border2); background:transparent; color:var(--c-text); font:inherit',
    });
    const btn = el('button', { class: 'btn sm secondary' }, 'تحقّق');
    this.verdict = el('span', { class: 'chip', style: 'display:none' });
    btn.addEventListener('click', () => {
      const v = parseFloat(input.value);
      if (!isFinite(v)) return;
      const err = Math.abs(v - this.ref) / Math.abs(this.ref) * 100;
      const zone = accuracyZone(err);
      this.verdict.style.display = '';
      this.verdict.style.color = zone.pass ? (zone.cls === 'gold' ? 'var(--c-ok)' : 'var(--c-amber)') : 'var(--c-bad)';
      this.verdict.textContent = `${zone.emoji} ${zone.label} (خطأ ${err.toFixed(1)}%)`;
      onResult?.(err, zone, v);
    });
    this.input = input;
    this.root = el('div', { class: 'sim-row', style: 'flex-wrap:wrap; gap:8px' },
      el('label', {}, label), input,
      unit ? el('span', { class: 'ltr', style: 'color:var(--c-text2)' }, unit) : null,
      btn, this.verdict);
    container.append(this.root);
  }
  reset(newRef) {
    if (newRef !== undefined) this.ref = newRef;
    this.input.value = '';
    this.verdict.style.display = 'none';
  }
}
