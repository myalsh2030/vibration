// مصفوفة مواءمة المقرر — تربط منتجات المقرر كلها بعقد المفاهيم الواحد (data/concepts.js)
// وتكشف الفجوات في سلسلة: المخرَج ← المفهوم ← يُدرَّس ← يُعرَض ← يُتمرَّن ← يُقاس ← يُطبَّق عمليًا.
//
// عام — يعمل على أي مقرر مبني على هذا القالب. حقيبة القاعة اختيارية:
// إن وُجد مجلد classroom/ بجوار website/ أُدرجت حصصه وجلساته العملية في المصفوفة،
// وإلا فُحصت المنصة وحدها (عمودا «يُعرَض» و«يُطبَّق» يظهران «—»).
//
// الاستخدام:
//   node tools/validate-course.mjs                 # فحص + مصفوفة على الطرفية
//   node tools/validate-course.mjs --md تقرير.md   # + تقرير Markdown كامل
//   node tools/validate-course.mjs <جذر الموقع> --md <ملف>
//
// رمز الخروج: 1 عند وجود خطأ واحد على الأقل (صالح لبوابة نشر).

import { pathToFileURL } from 'url';
import { resolve, join, dirname, basename } from 'path';
import { readdirSync, existsSync, writeFileSync } from 'fs';

// ───────────────────────── وسائط السطر ─────────────────────────
const argv = process.argv.slice(2);
const mdAt = argv.indexOf('--md');
const MD_OUT = mdAt >= 0 ? argv[mdAt + 1] : null;
const sibAt = argv.indexOf('--sibling');
const SIB_ROOT = sibAt >= 0 ? resolve(argv[sibAt + 1]) : null;
const positional = argv.filter((a, i) => !a.startsWith('--') && i !== mdAt + 1 && i !== sibAt + 1);
const ROOT = resolve(positional[0] || '.');
const KIT = resolve(ROOT, '..', 'classroom');
const HAS_KIT = existsSync(join(KIT, 'sessions'));

const u = p => pathToFileURL(resolve(ROOT, p)).href + '?t=' + Date.now();
const uAbs = p => pathToFileURL(p).href + '?t=' + Date.now();

// ───────────────────────── تحميل المصادر ─────────────────────────
const { COURSE } = await import(u('data/course.js'));
const { QUIZZES } = await import(u('data/quizzes.js'));
const { GLOSSARY } = await import(u('data/glossary.js'));
const { SIMS } = await import(u('js/sims/registry.js'));
const { OUTCOMES, CONCEPTS } = await import(u('data/concepts.js'));

const sessions = [], labs = [];
if (HAS_KIT) {
  for (const d of readdirSync(join(KIT, 'sessions')).sort()) {
    const f = join(KIT, 'sessions', d, 'session.js');
    if (existsSync(f)) sessions.push((await import(uAbs(f))).SESSION);
  }
  const labDir = join(KIT, 'lab');
  if (existsSync(labDir)) {
    for (const f of readdirSync(labDir).filter(x => /^w\d+\.js$/.test(x)).sort()) {
      labs.push((await import(uAbs(join(labDir, f)))).LAB);
    }
  }
}

const errors = [], warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

// ───────────────────────── فهرسة العقد ─────────────────────────
const DEPTHS = new Set(['core', 'support', 'aware']);
const byId = new Map();
const outcomeIds = new Set(OUTCOMES.map(o => o.id));

for (const c of CONCEPTS) {
  if (byId.has(c.id)) err(`العقد: معرّف مفهوم مكرر «${c.id}»`);
  byId.set(c.id, c);
  if (!c.label) err(`العقد: «${c.id}» بلا label عربي`);
  if (!DEPTHS.has(c.depth)) err(`العقد: «${c.id}» عمق غير معروف «${c.depth}» (core|support|aware)`);
  if (!outcomeIds.has(c.outcome)) err(`العقد: «${c.id}» يشير إلى مخرَج غير معرّف «${c.outcome}»`);
  for (const n of c.needs || []) {
    if (n === c.id) err(`العقد: «${c.id}» يعتمد على نفسه`);
  }
}
for (const c of CONCEPTS) for (const n of c.needs || []) {
  if (!byId.has(n)) err(`العقد: «${c.id}» يعتمد على مفهوم غير معرّف «${n}»`);
}

// دورات في شجرة الاعتماد
{
  const state = new Map(); // 0=قيد الزيارة 1=منتهٍ
  const walk = (id, path) => {
    if (state.get(id) === 1) return;
    if (state.get(id) === 0) { err(`العقد: دورة اعتماد ← ${[...path, id].join(' ← ')}`); return; }
    state.set(id, 0);
    for (const n of byId.get(id)?.needs || []) if (byId.has(n)) walk(n, [...path, id]);
    state.set(id, 1);
  };
  for (const c of CONCEPTS) walk(c.id, []);
}

// ───────────────── اشتقاق الحلقات من المنتجات نفسها ─────────────────
// المبدأ: العقد يعلن المفردات والمخرجات والاعتمادات فقط. أما «أين يُدرَّس» و«أين يُقاس»
// و«أين يُتمرَّن» فتُشتق من المنتجات ذاتها — فلا يوجد مصدر حقيقة ثانٍ يمكن أن ينحرف.

const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
const taught = new Map();   // مفهوم ← [درس]      من data/unitN.js
const asked = new Map();    // مفهوم ← [بنك]      من بنوك الأسئلة
const simmed = new Map();   // مفهوم ← [محاكاة]   من js/sims/registry.js
const staged = new Map();   // مفهوم ← [حصة]      من classroom/sessions
const applied = new Map();  // مفهوم ← [جلسة]     من classroom/lab
const defined = new Map();  // مفهوم ← مدخل مسرد  من data/glossary.js

const lessons = [];                       // مسطَّحة بترتيب المقرر
for (const unit of COURSE.units || []) for (const l of unit.lessons || []) lessons.push({ ...l, unit: unit.id });
const lessonById = new Map(lessons.map(l => [l.id, l]));
const orderOf = new Map(lessons.map((l, i) => [l.id, i]));

for (const l of lessons) {
  if (!(l.concepts || []).length) warn(`الدرس «${l.id}» بلا وسوم مفاهيم`);
  for (const c of l.concepts || []) {
    if (!byId.has(c)) err(`الدرس «${l.id}» يستعمل مفهومًا غير معرّف في العقد: «${c}»`);
    push(taught, c, l.id);
  }
}

for (const [bank, q] of Object.entries(QUIZZES)) {
  for (const it of q.questions || []) {
    if (!it.concept) { warn(`سؤال بلا وسم مفهوم في بنك «${bank}»: ${String(it.q).slice(0, 46)}…`); continue; }
    if (!byId.has(it.concept)) err(`بنك «${bank}» يسأل عن مفهوم غير معرّف: «${it.concept}»`);
    push(asked, it.concept, bank);
  }
}

for (const s of SIMS) {
  if (!(s.concepts || []).length) { warn(`المحاكاة «${s.id}» غير مربوطة بأي مفهوم`); continue; }
  for (const c of s.concepts) {
    if (!byId.has(c)) err(`المحاكاة «${s.id}» مربوطة بمفهوم غير معرّف: «${c}»`);
    push(simmed, c, s.id);
  }
}

for (const g of GLOSSARY) {
  if (!g.id) { warn(`مدخل مسرد غير مربوط بمفهوم: «${g.ar}»`); continue; }
  if (!byId.has(g.id)) err(`مدخل المسرد «${g.ar}» مربوط بمفهوم غير معرّف: «${g.id}»`);
  // مفهوم واحد قد تخدمه عدة مداخل (مثل «توربين» و«مروحة» و«ضاغط» لمفهوم أسرة الآلات) — هذا مقبول
  if (!defined.has(g.id)) defined.set(g.id, g);
}

// حصص القاعة: مفاهيمها = اتحاد مفاهيم دروسها (معرّف الدرس هو صدر نص lessons)
const sessionOfLesson = new Map();
for (const S of sessions) {
  const ids = (S.lessons || []).map(t => String(t).trim().match(/^([a-z]\d+l\d+)/)?.[1]).filter(Boolean);
  if (ids.length !== (S.lessons || []).length) err(`الحصة ${S.no}: صيغة lessons لا تبدأ بمعرّف درس صالح`);
  let n = 0;
  for (const id of ids) {
    const l = lessonById.get(id);
    if (!l) { err(`الحصة ${S.no} تشير إلى درس غير موجود: «${id}»`); continue; }
    if (!sessionOfLesson.has(id)) sessionOfLesson.set(id, S.no);
    for (const c of l.concepts || []) { push(staged, c, S.no); n++; }
  }
  for (const c of S.concepts || []) { if (byId.has(c)) { push(staged, c, S.no); n++; } else err(`الحصة ${S.no} تعلن مفهومًا غير معرّف: «${c}»`); }
  if (!n) warn(`الحصة ${S.no} لا تغطي أي مفهوم`);
}

// ── المنصة الشقيقة (--sibling): مقرر بمنصتين نظري/عملي يتشاركان العقد نفسه ──
// دروسها تُحسب تدريسًا (بمعرف موسوم sib: خارج ترتيب المنصة الحالية)، وأسئلتها قياسًا،
// ومحاكياتها تمرينًا، ومسردها تعريفًا — فتكتمل سلسلة المفاهيم المشتركة بين المنصتين.
const sibTaught = new Set();
if (SIB_ROOT) {
  const su = p => pathToFileURL(resolve(SIB_ROOT, p)).href + '?t=' + Date.now();
  const sib = {
    COURSE: (await import(su('data/course.js'))).COURSE,
    QUIZZES: (await import(su('data/quizzes.js'))).QUIZZES,
    GLOSSARY: (await import(su('data/glossary.js'))).GLOSSARY,
    SIMS: (await import(su('js/sims/registry.js'))).SIMS,
  };
  for (const unit of sib.COURSE.units || []) for (const l of unit.lessons || [])
    for (const c of l.concepts || []) if (byId.has(c)) { push(taught, c, 'sib:' + l.id); sibTaught.add(c); }
  for (const q of Object.values(sib.QUIZZES)) for (const it of q.questions || [])
    if (it.concept && byId.has(it.concept)) push(asked, it.concept, 'sib');
  for (const s of sib.SIMS) for (const c of s.concepts || []) if (byId.has(c)) push(simmed, c, s.id);
  for (const g of sib.GLOSSARY) if (g.id && byId.has(g.id) && !defined.has(g.id)) defined.set(g.id, g);
}

for (const L of labs) {
  if (!(L.concepts || []).length) { warn(`الجلسة العملية ${L.no} غير مربوطة بأي مفهوم`); continue; }
  for (const c of L.concepts) {
    if (!byId.has(c)) err(`الجلسة العملية ${L.no} مربوطة بمفهوم غير معرّف: «${c}»`);
    push(applied, c, L.no);
  }
}

// ───────────────────────── بوابات المواءمة ─────────────────────────
// core: يُدرَّس + يُقاس + يُتمرَّن (محاكاة أو عملي) + يُعرَّف في المسرد — كلها إلزامية
// support: يُدرَّس + يُقاس
// aware: يُدرَّس فقط
const gate = (cond, depth, msg) => { if (!cond) (depth === 'core' ? err : warn)(msg); };

for (const c of CONCEPTS) {
  const t = taught.get(c.id) || [], a = asked.get(c.id) || [];
  const sm = simmed.get(c.id) || [], ap = applied.get(c.id) || [], st = staged.get(c.id) || [];

  if (!t.length) err(`«${c.id}» معلن في العقد ولا يُدرَّس في أي درس`);
  if (c.depth !== 'aware') gate(a.length > 0, c.depth, `«${c.id}» (${c.depth}) لا يُقاس بأي سؤال`);
  if (c.depth === 'core') {
    gate(sm.length + ap.length > 0, 'core', `«${c.id}» (core) لا يُتمرَّن: لا محاكاة ولا جلسة عملية`);
    gate(defined.has(c.id), 'core', `«${c.id}» (core) بلا مدخل في المسرد`);
    // العرض أمام المتدرب يقع في حصة قاعة أو في جلسة عملية — المفاهيم العملية تُعرَض في جلستها
    if (HAS_KIT) gate(st.length + ap.length > 0, 'core', `«${c.id}» (core) لا يُعرَض في أي حصة قاعة ولا جلسة عملية`);
  }

  // ترتيب المتطلبات: لا يُدرَّس مفهوم قبل ما يعتمد عليه
  const mine = Math.min(...t.map(id => orderOf.get(id) ?? Infinity));
  for (const n of c.needs || []) {
    const nt = taught.get(n) || [];
    if (!nt.length) continue;
    const his = Math.min(...nt.map(id => orderOf.get(id) ?? Infinity));
    if (his === Infinity) continue; // المتطلب يُدرَّس في المنصة الشقيقة فقط — الترتيب عبر المنصتين ليس خطيًا
    if (his <= mine) continue;
    // المتطلب مُدرَّس في المنصة الشقيقة أيضًا: المتدرب قابله هناك، فالخلل ترتيبٌ داخلي
    // يستحق الانتباه لا بوابةً تُغلق. (مقرر عملي يُرتَّب بنوع الآلة لا بتسلسل المفاهيم،
    // فيسبق فيه استعمالُ المفهوم موضعَه النظري — وهذا مقصود ما دام النظري يسبقه زمنًا.)
    const msg = `ترتيب: «${c.id}» يُدرَّس في ${t[0]} قبل متطلبه «${n}» في ${nt[0]}`;
    if (sibTaught.has(n)) warn(`${msg} — والمتطلب مُغطّى في المنصة الشقيقة`);
    else err(msg);
  }
}

// لا يُقاس مفهوم في نقطة تفتيش قبل أن يُدرَّس (القبلي والتشخيصي مستثنيان — غرضهما الاستكشاف)
for (const [bank, q] of Object.entries(QUIZZES)) {
  if (/pre$|^diag$/.test(bank)) continue;
  const home = bank.match(/^(u\d+l\d+)/)?.[1];
  if (!home || !orderOf.has(home)) continue;
  for (const it of q.questions || []) {
    const t = (taught.get(it.concept) || []).filter(id => orderOf.has(id));
    if (!t.length) continue;
    const first = Math.min(...t.map(id => orderOf.get(id)));
    if (first > orderOf.get(home)) err(`نقطة التفتيش «${bank}» تقيس «${it.concept}» قبل تدريسه في ${t[0]}`);
  }
}

for (const o of OUTCOMES) {
  const n = CONCEPTS.filter(c => c.outcome === o.id);
  if (!n.length) err(`المخرَج «${o.id}» لا يخدمه أي مفهوم`);
  else if (!n.some(c => c.depth === 'core')) warn(`المخرَج «${o.id}» لا يخدمه أي مفهوم جوهري (core)`);
}

if (HAS_KIT) {
  const uncovered = lessons.filter(l => !sessionOfLesson.has(l.id));
  if (uncovered.length) warn(`دروس لا تظهر في أي حصة قاعة: ${uncovered.map(l => l.id).join('، ')}`);
  let prev = -1;
  for (const S of sessions) for (const t of S.lessons || []) {
    const id = String(t).match(/^([a-z]\d+l\d+)/)?.[1];
    const o = orderOf.get(id);
    if (o == null) continue;
    if (o < prev) warn(`ترتيب الحصص: الحصة ${S.no} تعود إلى ${id} بعد درس متأخر عنه`);
    prev = Math.max(prev, o);
  }
}

// ───────────────────────── الإخراج ─────────────────────────
const cell = (arr, f = x => x) => arr.length ? arr.map(f).join('،') : '—';
const rows = CONCEPTS.map(c => ({
  id: c.id, label: c.label, depth: c.depth, outcome: c.outcome,
  taught: cell(taught.get(c.id) || []),
  staged: HAS_KIT ? cell([...new Set(staged.get(c.id) || [])], n => 'س' + n) : '—',
  simmed: cell(simmed.get(c.id) || []),
  asked: String((asked.get(c.id) || []).length),
  applied: HAS_KIT ? cell([...new Set(applied.get(c.id) || [])], n => 'ع' + n) : '—',
  gloss: defined.has(c.id) ? '✓' : '—',
}));

const W = { id: 34, depth: 8, outcome: 4, taught: 8, staged: 12, simmed: 22, asked: 5, applied: 10, gloss: 5 };
const pad = (s, n) => String(s).length >= n ? String(s).slice(0, n) : String(s) + ' '.repeat(n - String(s).length);
const line = r => [pad(r.id, W.id), pad(r.depth, W.depth), pad(r.outcome, W.outcome), pad(r.taught, W.taught),
  pad(r.staged, W.staged), pad(r.simmed, W.simmed), pad(r.asked, W.asked), pad(r.applied, W.applied), pad(r.gloss, W.gloss)].join(' ');

console.log('\n' + '═'.repeat(112));
console.log(`مصفوفة مواءمة المقرر — ${COURSE.title}`);
console.log('═'.repeat(112));
console.log(line({ id: 'concept', depth: 'depth', outcome: 'out', taught: 'teach', staged: 'session', simmed: 'sim', asked: 'Q', applied: 'lab', gloss: 'gls' }));
console.log('─'.repeat(112));
for (const r of rows) console.log(line(r));
console.log('─'.repeat(112));

const nCore = CONCEPTS.filter(c => c.depth === 'core').length;
console.log(`مفاهيم: ${CONCEPTS.length} (جوهري ${nCore}) · مخرجات: ${OUTCOMES.length} · دروس: ${lessons.length} · `
  + `أسئلة: ${Object.values(QUIZZES).reduce((n, q) => n + (q.questions || []).length, 0)} · محاكيات: ${SIMS.length}`
  + (HAS_KIT ? ` · حصص: ${sessions.length} · جلسات عملي: ${labs.length}` : ' · (بلا حقيبة قاعة)'));

if (warns.length) { console.log(`\n⚠ تحذيرات (${warns.length}):`); warns.forEach(w => console.log('  · ' + w)); }
if (errors.length) { console.log(`\n✗ أخطاء (${errors.length}):`); errors.forEach(e => console.log('  · ' + e)); }
else console.log('\n✔ لا أخطاء — سلسلة المواءمة مكتملة لكل مفهوم جوهري.');

// ───────────────────────── تقرير Markdown ─────────────────────────
if (MD_OUT) {
  const esc = s => String(s).replace(/\|/g, '\\|');
  const md = [];
  md.push(`# مصفوفة مواءمة المقرر — ${COURSE.title}`, '');
  md.push(`مولَّد آليًا بـ \`tools/validate-course.mjs\`. لا يُحرَّر يدويًا.`, '');
  md.push(`| # | المخرَج | يخدمه من المفاهيم |`, `|---|---|---|`);
  OUTCOMES.forEach(o => md.push(`| ${o.id} | ${esc(o.text)} | ${CONCEPTS.filter(c => c.outcome === o.id).length} |`));
  md.push('', '## السلسلة: المخرَج ← المفهوم ← يُدرَّس ← يُعرَض ← يُتمرَّن ← يُقاس ← يُطبَّق', '');
  md.push('| المفهوم | العمق | المخرَج | يُدرَّس | يُعرَض | يُتمرَّن (محاكاة) | يُقاس | يُطبَّق (عملي) | المسرد |');
  md.push('|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) md.push(`| ${esc(r.label)} <br><code>${r.id}</code> | ${r.depth} | ${r.outcome} | ${r.taught} | ${r.staged} | ${esc(r.simmed)} | ${r.asked} | ${r.applied} | ${r.gloss} |`);
  md.push('', `## الفجوات`, '');
  md.push(errors.length ? `### أخطاء (${errors.length})\n\n` + errors.map(e => `- ${e}`).join('\n') : '### أخطاء\n\nلا أخطاء.');
  md.push('', warns.length ? `### تحذيرات (${warns.length})\n\n` + warns.map(w => `- ${w}`).join('\n') : '### تحذيرات\n\nلا تحذيرات.');
  writeFileSync(resolve(MD_OUT), md.join('\n') + '\n', 'utf8');
  console.log(`\n📄 التقرير: ${resolve(MD_OUT)}`);
}

process.exit(errors.length ? 1 : 0);
