// قياس تسريب الطول: كم سؤالًا تكون إجابته الصحيحة هي الخيار الأطول؟ (مؤشر على تحيّز تخمين سهل)
// الاستخدام: node tools/length-audit.mjs [مسار جذر الموقع] [-v]
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const args = process.argv.slice(2);
const verbose = args.includes('-v');
const ROOT = resolve(args.find(a => a !== '-v') || '.');
const u = (p) => pathToFileURL(resolve(ROOT, p)).href;

const strip = (s) => String(s).replace(/<[^>]*>/g, '');

const { COURSE } = await import(u('data/course.js') + '?t=' + Math.random());

let grandMc = 0, grandLongest = 0;
for (const unit of COURSE.units) {
  const n = unit.id.replace(/^u/, ''); // 'u1' -> '1' — يطابق اصطلاح data/unitN.js
  const mod = await import(u(`data/unit${n}.js`) + '?t=' + Math.random());
  const quizzes = { ...mod[`U${n}_QUIZZES`], diag: { questions: mod[`U${n}_DIAG`] || [] } };
  let mc = 0, longest = 0, shortest = 0;
  const offenders = [];
  for (const [qid, quiz] of Object.entries(quizzes)) {
    (quiz.questions || []).forEach((q, i) => {
      if (q.t !== 'mc') return;
      mc++;
      const lens = q.opts.map(o => strip(o).length);
      const c = lens[q.correct];
      if (c === Math.max(...lens) && lens.filter(l => l === c).length === 1) {
        longest++;
        offenders.push(`${qid}[${i}] (${lens.join(',')}→correct ${q.correct})`);
      }
      if (c === Math.min(...lens) && lens.filter(l => l === c).length === 1) shortest++;
    });
  }
  grandMc += mc; grandLongest += longest;
  console.log(`${unit.id}: MC=${mc}  correct-is-longest=${longest} (${mc ? Math.round(longest / mc * 100) : 0}%)  correct-is-shortest=${shortest}`);
  if (verbose) offenders.forEach(o => console.log('   ' + o));
}
console.log(`\nTOTAL: ${grandLongest}/${grandMc} = ${grandMc ? Math.round(grandLongest / grandMc * 100) : 0}% (chance level ≈ 25%)`);
