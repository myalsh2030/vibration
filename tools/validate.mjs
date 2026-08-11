// تحقق تكامل بيانات موقع المقرر (عام — يعمل على أي مقرر مبني على هذا القالب)
// الاستخدام: node tools/validate.mjs [مسار جذر الموقع]   — الافتراضي: المجلد الحالي
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { readFile } from 'fs/promises';

const ROOT = resolve(process.argv[2] || '.');
const u = (p) => pathToFileURL(resolve(ROOT, p)).href + '?t=' + Date.now();

const { COURSE } = await import(u('data/course.js'));
const { QUIZZES } = await import(u('data/quizzes.js'));
const { GLOSSARY } = await import(u('data/glossary.js'));
const { SIMS } = await import(u('js/sims/registry.js'));

const errors = [], warns = [];
const BLOCK_TYPES = new Set(['concept', 'figure', 'formula', 'example', 'tip', 'flip', 'match', 'order', 'sim', 'quiz']);
const simById = Object.fromEntries(SIMS.map(s => [s.id, s]));

// ---- الوحدات والدروس ----
// فحص بنيوي عام: لا يفترض عدد وحدات أو دروس محددًا (يختلف من مقرر لآخر)،
// فقط يتحقق أن كل وحدة/درس متماسك داخليًا.
const allConcepts = {};
const seenUnitIds = new Set(), seenLessonIds = new Set();

if (!COURSE.units?.length) errors.push('COURSE.units فارغة — أضف وحدة واحدة على الأقل');

for (const unit of COURSE.units || []) {
  if (seenUnitIds.has(unit.id)) errors.push(`unit id مكرر: ${unit.id}`);
  seenUnitIds.add(unit.id);
  if (!unit.lessons?.length) { errors.push(`${unit.id}: لا يحتوي على دروس`); continue; }

  allConcepts[unit.id] = allConcepts[unit.id] || new Set();
  for (const l of unit.lessons) {
    if (seenLessonIds.has(l.id)) errors.push(`lesson id مكرر: ${l.id}`);
    seenLessonIds.add(l.id);
    (l.concepts || []).forEach(c => allConcepts[unit.id].add(c));

    if (!l.blocks?.length) { errors.push(`${l.id}: no blocks`); continue; }
    if (l.blocks.length < 6) warns.push(`${l.id}: only ${l.blocks.length} blocks`);
    const last = l.blocks[l.blocks.length - 1];
    if (last.t !== 'quiz') errors.push(`${l.id}: last block is ${last.t}, expected quiz`);

    let interactive = 0;
    l.blocks.forEach((b, i) => {
      if (!BLOCK_TYPES.has(b.t)) errors.push(`${l.id}[${i}]: unknown block type ${b.t}`);
      if (['flip', 'match', 'order', 'sim'].includes(b.t)) interactive++;
      if (b.t === 'quiz' && !QUIZZES[b.ref]) errors.push(`${l.id}[${i}]: quiz ref ${b.ref} missing`);
      if (b.t === 'sim') {
        const reg = simById[b.sim];
        if (!reg) { errors.push(`${l.id}[${i}]: sim '${b.sim}' not in registry`); return; }
        const regIds = new Set(reg.missions.map(m => m.id));
        (b.missions || []).forEach(m => {
          if (!regIds.has(m.id)) errors.push(`${l.id}[${i}]: mission '${m.id}' not in registry for sim ${b.sim}`);
        });
        if (!b.missions?.length) warns.push(`${l.id}[${i}]: sim ${b.sim} embedded without missions`);
      }
      if (b.t === 'flip' && !(b.cards?.length >= 2)) errors.push(`${l.id}[${i}]: flip needs >=2 cards`);
      if (b.t === 'match' && !(b.pairs?.length >= 3)) warns.push(`${l.id}[${i}]: match has ${(b.pairs || []).length} pairs`);
      if (b.t === 'order' && !(b.items?.length >= 3)) errors.push(`${l.id}[${i}]: order needs >=3 items`);
      if (b.t === 'formula' && (!b.expr || !b.terms?.length)) errors.push(`${l.id}[${i}]: formula incomplete`);
    });
    if (!interactive) warns.push(`${l.id}: no interactive activity`);
  }
}

// ---- الاختبارات ----
// نمط اسم بنك الأسئلة: uN pre | uN lM check (N وM أرقام بأي طول)
const QUIZ_ID_RE = /^(u\d+)(pre|l\d+check)$/;

function checkQ(qid, q, i, unitId) {
  if (!['mc', 'tf'].includes(q.t)) errors.push(`${qid}[${i}]: bad type ${q.t}`);
  if (q.t === 'mc') {
    if (!(q.opts?.length >= 3)) errors.push(`${qid}[${i}]: mc needs >=3 opts`);
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= (q.opts || []).length)
      errors.push(`${qid}[${i}]: bad correct index`);
  }
  if (q.t === 'tf' && typeof q.correct !== 'boolean') errors.push(`${qid}[${i}]: tf correct must be boolean`);
  if (!q.why) warns.push(`${qid}[${i}]: missing why`);
  if (!q.unit) errors.push(`${qid}[${i}]: missing unit tag`);
  if (unitId && q.unit !== unitId) errors.push(`${qid}[${i}]: unit tag ${q.unit} != ${unitId}`);
  if (!q.concept) warns.push(`${qid}[${i}]: missing concept tag`);
  else if (q.unit && allConcepts[q.unit] && !allConcepts[q.unit].has(q.concept))
    errors.push(`${qid}[${i}]: concept '${q.concept}' not among ${q.unit} lesson concepts`);
}

for (const [qid, quiz] of Object.entries(QUIZZES)) {
  if (!quiz.questions?.length) { errors.push(`${qid}: empty`); continue; }
  const m = qid.match(QUIZ_ID_RE);
  quiz.questions.forEach((q, i) => checkQ(qid, q, i, m ? m[1] : null));
}
if (!QUIZZES.diag) errors.push('QUIZZES.diag مفقود');
else if (!QUIZZES.diag.questions?.length) warns.push('diag لا يحتوي على أسئلة');

// كل وحدة لها اختبار قبلي، وكل درس فيها مغطّى بمفهوم واحد على الأقل من القبلي؟
for (const unit of COURSE.units || []) {
  const pre = QUIZZES[`${unit.id}pre`];
  if (!pre) { errors.push(`${unit.id}pre missing`); continue; }
  const covered = new Set(pre.questions.map(q => q.concept));
  for (const l of unit.lessons) {
    if (!(l.concepts || []).some(c => covered.has(c)))
      warns.push(`${unit.id}pre: lesson ${l.id} has no concept covered (${l.concepts})`);
  }
}

// ---- المسرد ----
if (GLOSSARY.length < 3) warns.push(`glossary only ${GLOSSARY.length} entries`);
GLOSSARY.forEach((g, i) => { if (!g.ar || !g.en) errors.push(`glossary[${i}] incomplete`); });

// ---- مفتاح التخزين: فريد لكل مقرر ----
// المنصات كلها تُنشر تحت أصل واحد فتتشارك localStorage؛ مفتاحان متطابقان
// يعني أن مقررًا يمحو تقدّم المتدرب في مقرر آخر. خطأ صامت لا يظهر إلا بعد النشر.
{
  const RESERVED = new Set(['course.v1', 'fm.v1', 'fmlab.v1', 'rm1.v1']);
  const src = await readFile(resolve(ROOT, 'js/store.js'), 'utf8');
  const key = src.match(/const\s+KEY\s*=\s*['"]([^'"]+)['"]/)?.[1];
  const isTemplate = /\{\{/.test(COURSE.title || '');
  if (!key) errors.push('js/store.js: تعذّر العثور على ثابت KEY');
  else if (!isTemplate && RESERVED.has(key))
    errors.push(`js/store.js: مفتاح التخزين «${key}» محجوز أو افتراضي — اختر مفتاحًا فريدًا لهذا المقرر قبل النشر`);
}

// ---- اكتمال قائمة كاش عامل الخدمة ----
// PWA يعمل دون إنترنت فقط إذا كان كل ملف js/mjs مُدرجًا في ASSETS. ملف غير مدرج
// يعمل متصلًا ويفشل دون اتصال — خطأ صامت لا يظهر إلا على جوال متدرب بلا شبكة.
try {
  const sw = await readFile(resolve(ROOT, 'sw.js'), 'utf8');
  const listed = new Set([...sw.matchAll(/['"]\.\/([^'"]+)['"]/g)].map(m => m[1]));
  const { readdirSync } = await import('fs');
  const walk = (d, base) => readdirSync(resolve(ROOT, d), { withFileTypes: true }).flatMap(e => {
    const rel = `${base}${e.name}`;
    if (e.isDirectory()) return walk(`${d}/${e.name}`, `${rel}/`);
    return /\.(js|mjs)$/.test(e.name) ? [rel] : [];
  });
  const onDisk = [...walk('js', 'js/'), ...walk('data', 'data/')];
  const notCached = onDisk.filter(f => !listed.has(f));
  if (notCached.length) errors.push(`sw.js: ملفات غير مدرجة في ASSETS (تفشل دون إنترنت): ${notCached.join('، ')}`);
  const dangling = [...listed].filter(a => /\.(js|mjs)$/.test(a) && !onDisk.includes(a));
  if (dangling.length) warns.push(`sw.js: أصول مدرجة غير موجودة على القرص: ${dangling.join('، ')}`);
} catch { warns.push('sw.js: تعذّرت قراءته للتحقق من اكتمال الكاش'); }

// ---- النتيجة ----
console.log(`Root: ${ROOT}`);
console.log(`Units: ${COURSE.units.length}, lessons: ${COURSE.units.reduce((n, x) => n + x.lessons.length, 0)}, quizzes: ${Object.keys(QUIZZES).length}, questions: ${Object.values(QUIZZES).reduce((n, q) => n + q.questions.length, 0)}, glossary: ${GLOSSARY.length}, sims: ${SIMS.length}`);
console.log(`\nERRORS (${errors.length}):`); errors.forEach(e => console.log('  ✗ ' + e));
console.log(`\nWARNINGS (${warns.length}):`); warns.forEach(w => console.log('  ⚠ ' + w));
process.exit(errors.length ? 1 : 0);
