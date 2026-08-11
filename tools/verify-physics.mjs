// فحص فيزيائي لمحرّك الإشارة والاتزان — يُشتق كل رقم من معادلته ويُقارن بمخرج الشيفرة.
// شرط بوابة: `node tools/verify-physics.mjs` بصفر إخفاقات قبل أي بناء فوق المحرّك.
import {
  synth, spectrum, integrateWave, metrics, bandRms, topPeaks, ampAt,
  bearingFreqs, phaseAt, shaftHz, envelope, G, WINDOWS,
} from '../js/sims/vibkit.js';
import { isoZone, bearingZone, toDb, fromDb, ISO_CLASSES } from '../js/sims/vibstd.js';
import {
  C, balanceOnePlane, balanceTwoPlane, residualTwoPlane, residualAfter,
  centrifugalForce, reciprocatingPeaks, recipResidual, ENGINE_CONFIGS,
  permissibleUnbalance, planesNeeded,
} from '../js/sims/balancekit.js';

let pass = 0, fail = 0;
const near = (a, b, tolPct, what) => {
  const err = Math.abs(a - b) / (Math.abs(b) || 1) * 100;
  if (err <= tolPct) { pass++; console.log(`  ✅ ${what}  (${fmt(a)} ≈ ${fmt(b)}، خطأ ${err.toFixed(2)}%)`); }
  else { fail++; console.log(`  ❌ ${what}  (حصلنا ${fmt(a)}، والمتوقّع ${fmt(b)}، خطأ ${err.toFixed(2)}%)`); }
};
const ok = (cond, what) => { if (cond) { pass++; console.log(`  ✅ ${what}`); } else { fail++; console.log(`  ❌ ${what}`); } };
const fmt = x => Math.abs(x) >= 1000 || (Math.abs(x) < 0.01 && x !== 0) ? x.toExponential(3) : x.toFixed(4);
const head = t => console.log(`\n── ${t} ──`);

// آلة اختبار: مضخة بسرعة 2950 RPM (49.1667 Hz)
const PUMP = {
  rpm: 2950, vanes: 6, natHz: 210, floorG: 0.004,
  bearing: { n: 9, bd: 7.94, pd: 38.5, phi: 0, resHz: 3200 },
};

// ═══ 1) الأساسيات: جيب نقي ═══
head('1) موجة جيبية نقية: RMS و Peak وعامل القمة');
{
  const fs = 25600, n = 8192, f0 = 50, A = 3;   // m/s²
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = A * Math.sin(2 * Math.PI * f0 * i / fs);
  const m = metrics(x);
  near(m.rms, A / Math.SQRT2, 0.5, 'RMS = القمة ÷ √2');
  near(m.peak, A, 0.5, 'القمة = السعة');
  near(m.crest, Math.SQRT2, 0.5, 'عامل القمة = √2 للجيب النقي');
  near(m.p2p, 2 * A, 0.5, 'من قمة إلى قمة = ضعف السعة');

  const sp = spectrum(x, fs, { win: 'hann' });
  const pk = topPeaks(sp, { count: 1 })[0];
  near(pk.f, f0, 0.5, 'الطيف يضع القمة عند 50 Hz');
  near(pk.amp, A, 2, 'سعة القمة في الطيف = سعة القمة الزمنية (تصحيح نافذة هانّ)');
}

// ═══ 2) التكامل الترددي: تسارع → سرعة → إزاحة ═══
head('2) التكامل: a → v → d بالعلاقات v=a/ω و d=a/ω²');
{
  const fs = 25600, n = 8192, f0 = 50, A = 3;
  const w = 2 * Math.PI * f0;
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = A * Math.sin(w * i / fs);
  const v = integrateWave(x, fs, 1);            // mm/s
  const d = integrateWave(x, fs, 2);            // µm
  near(metrics(v).peak, A / w * 1000, 1.5, 'سعة السرعة = A/ω  (mm/s)');
  near(metrics(d).peak, A / (w * w) * 1e6, 1.5, 'سعة الإزاحة = A/ω²  (µm)');
}

// ═══ 3) ترددات المحمل ═══
head('3) ترددات أعطال المحمل — الصيغ القياسية');
{
  const bf = bearingFreqs(PUMP.bearing, PUMP.rpm);
  const S = shaftHz(PUMP.rpm);
  const r = PUMP.bearing.bd / PUMP.bearing.pd;
  near(bf.bpfo, 9 / 2 * S * (1 - r), 0.01, 'BPFO = (n/2)·S·(1 − Bd/Pd)');
  near(bf.bpfi, 9 / 2 * S * (1 + r), 0.01, 'BPFI = (n/2)·S·(1 + Bd/Pd)');
  near(bf.ftf, S / 2 * (1 - r), 0.01, 'FTF = (S/2)·(1 − Bd/Pd)');
  near(bf.bpfo + bf.bpfi, 9 * S, 0.01, 'BPFO + BPFI = n × سرعة العمود (خاصية معروفة)');
  ok(bf.bpfo % S > 1e-6, 'BPFO ليس مضاعفًا صحيحًا لسرعة الدوران (لا-توافقي) — وهذا ما يميّزه');
}

// ═══ 4) بصمة عدم الاتزان ═══
head('4) بصمة عدم الاتزان: 1× مهيمن، شعاعي، والطور مستقر');
{
  const opt = { fs: 25600, n: 16384, seed: 42 };
  const S = shaftHz(PUMP.rpm);
  const read = dir => {
    const w = synth(PUMP, [{ type: 'unbalance', sev: 0.7 }], { ...opt, dir });
    const v = integrateWave(w.a, w.fs, 1);
    return spectrum(v, w.fs, { win: 'hann' });
  };
  const H = read('H'), V = read('V'), A = read('A');
  const h1 = ampAt(H, S).amp, h2 = ampAt(H, 2 * S).amp, a1 = ampAt(A, S).amp, v1 = ampAt(V, S).amp;
  ok(h1 / h2 > 5, `1× يعلو على 2× بأكثر من 5 أضعاف (النسبة ${(h1 / h2).toFixed(1)})`);
  ok(a1 / h1 < 0.25, `المحوري أقل من ربع الأفقي (النسبة ${(a1 / h1).toFixed(2)})`);
  ok(v1 / h1 > 0.6 && v1 / h1 < 1.0, `الرأسي قريب من الأفقي دونه (النسبة ${(v1 / h1).toFixed(2)})`);
  near(h1, 8.0 * 0.7, 8, 'سعة 1× الأفقية تطابق الشدة المطلوبة (8 mm/s × 0.7)');
}

// ═══ 5) بصمة عدم الاصطفاف ═══
head('5) بصمتا عدم الاصطفاف: المتوازي 2× شعاعي، والزاوي 1× محوري');
{
  const opt = { fs: 25600, n: 16384, seed: 7 };
  const S = shaftHz(PUMP.rpm);
  const spec = (faults, dir) => {
    const w = synth(PUMP, faults, { ...opt, dir });
    return spectrum(integrateWave(w.a, w.fs, 1), w.fs, { win: 'hann' });
  };
  const par = [{ type: 'misalignParallel', sev: 0.7 }];
  const pH = spec(par, 'H'), pA = spec(par, 'A');
  ok(ampAt(pH, 2 * S).amp > ampAt(pH, S).amp, 'المتوازي: 2× يعلو على 1× في الاتجاه الشعاعي');
  ok(ampAt(pA, S).amp / ampAt(pH, S).amp < 0.6, 'المتوازي: المحوري أقل من 60% من الشعاعي');

  const ang = [{ type: 'misalignAngular', sev: 0.7 }];
  const aH = spec(ang, 'H'), aA = spec(ang, 'A');
  ok(ampAt(aA, S).amp / ampAt(aH, S).amp > 1.5, 'الزاوي: المحوري يعلو على الشعاعي — الفارق الحاسم بين النوعين');
}

// ═══ 6) بصمة الرخاوة ═══
head('6) بصمة الرخاوة: توافقيات طويلة + نصف توافقيات');
{
  const w = synth(PUMP, [{ type: 'looseness', sev: 0.7 }], { fs: 25600, n: 16384, seed: 11, dir: 'V' });
  const sp = spectrum(integrateWave(w.a, w.fs, 1), w.fs, { win: 'hann' });
  const S = shaftHz(PUMP.rpm);
  const a = k => ampAt(sp, k * S).amp;
  ok(a(4) / a(1) > 0.15, `4× ما زال ملموسًا أمام 1× (النسبة ${(a(4) / a(1)).toFixed(2)}) — سلسلة توافقيات`);
  ok(a(0.5) / a(1) > 0.10, `نصف توافقي 0.5× حاضر (النسبة ${(a(0.5) / a(1)).toFixed(2)}) — بصمة الرخاوة`);
  const w2 = synth(PUMP, [{ type: 'unbalance', sev: 0.7 }], { fs: 25600, n: 16384, seed: 11, dir: 'V' });
  const sp2 = spectrum(integrateWave(w2.a, w2.fs, 1), w2.fs, { win: 'hann' });
  ok(ampAt(sp2, 0.5 * S).amp / ampAt(sp2, S).amp < 0.05, 'عدم الاتزان بلا نصف توافقي — البصمتان قابلتان للتمييز');
}

// ═══ 7) عيب المحمل: القمة عند BPFO وعامل قمة مرتفع ═══
head('7) عيب المسار الخارجي: قمة عند BPFO وعامل قمة مرتفع');
{
  const bf = bearingFreqs(PUMP.bearing, PUMP.rpm);
  const good = synth(PUMP, [{ type: 'unbalance', sev: 0.3 }], { fs: 51200, n: 16384, seed: 3 });
  const bad = synth(PUMP, [{ type: 'unbalance', sev: 0.3 }, { type: 'bearingOuter', sev: 0.8 }], { fs: 51200, n: 16384, seed: 3 });
  const spBad = spectrum(bad.a, bad.fs, { win: 'hann' });
  const atB = ampAt(spBad, bf.bpfo, 8).amp;
  const atNoise = ampAt(spBad, bf.bpfo * 0.63, 8).amp;
  ok(atB > 3 * atNoise, `قمة BPFO (${bf.bpfo.toFixed(1)} Hz) تعلو على جوارها بأكثر من ٣ أضعاف`);
  const cGood = metrics(good.a).crest, cBad = metrics(bad.a).crest;
  ok(cBad > cGood * 1.5, `عامل القمة يرتفع مع العيب (${cGood.toFixed(2)} → ${cBad.toFixed(2)})`);
  ok(cBad > 4, `عامل القمة تجاوز 4 — الحد الذي تعتبره الحقيبة نبضات عشوائية (${cBad.toFixed(2)})`);
}

// ═══ 8) التكهّف: ضجيج عريض بلا قمم ═══
head('8) التكهّف: طاقة عريضة النطاق بلا قمم منفصلة');
{
  const cav = synth(PUMP, [{ type: 'cavitation', sev: 0.8 }], { fs: 51200, n: 16384, seed: 5 });
  const unb = synth(PUMP, [{ type: 'unbalance', sev: 0.8 }], { fs: 51200, n: 16384, seed: 5 });
  const sc = spectrum(cav.a, cav.fs), su = spectrum(unb.a, unb.fs);
  const rel = sp => { const p = topPeaks(sp, { count: 1, fMin: 5 })[0]; return p.amp / Math.sqrt(2) / (bandRms(sp, 5, 20000) || 1e-9); };
  ok(rel(sc) < 0.35, `التكهّف: أعلى قمة تحمل أقل من 35% من الطاقة (${(rel(sc) * 100).toFixed(0)}%)`);
  ok(rel(su) > 0.7, `عدم الاتزان: أعلى قمة تحمل أكثر من 70% من الطاقة (${(rel(su) * 100).toFixed(0)}%)`);
}

// ═══ 9) جداول ISO ═══
head('9) جدول ISO 2372 (10816) — حدود الفئات الأربع');
{
  ok(isoZone(0.6, 'I').key === 'good', 'فئة I: 0.60 mm/s → جيد');
  ok(isoZone(1.5, 'I').key === 'satisfactory', 'فئة I: 1.50 mm/s → مرضٍ');
  ok(isoZone(3.0, 'I').key === 'unsatisfactory', 'فئة I: 3.00 mm/s → غير مرضٍ');
  ok(isoZone(6.0, 'I').key === 'unacceptable', 'فئة I: 6.00 mm/s → مرفوض');
  ok(isoZone(6.0, 'II').key === 'unsatisfactory', 'فئة II: القيمة نفسها 6.00 → غير مرضٍ (الفئة تغيّر الحكم)');
  ok(isoZone(6.0, 'IV').key === 'satisfactory', 'فئة IV: القيمة نفسها 6.00 → مرضٍ');
  ok(ISO_CLASSES.III.unsatisfactory === 11.2, 'حدّ فئة III العلوي = 11.2 mm/s كما في الحقيبة');
  near(toDb(1), 120, 0.01, 'تحويل الديسيبل: 1 m/s² = 120 dB مرجع 10⁻⁶');
  ok(bearingZone(0.5, 1.5).key !== bearingZone(50, 200).key, 'مخطط المحمل يفرّق بين محمل هادئ وآخر عالي الطاقة');
}

// ═══ 9-ب) مخطط شدة المحمل مقابل صفّي الحقيبة الصحيحين ═══
head('9-ب) مخطط شدة المحمل: مطابقة أمثلة الحقيبة الصالحة');
{
  // الحقيبة (الجدولان 2-6 و3-5). الصف الأول ساقط: قمة 140 dB أصغر من فعّالة 145 dB
  // وهو مستحيل فيزيائيًا (عامل القمة لا يقلّ عن 1) — موثّق في course-map.md.
  const z2 = bearingZone(fromDb(155), fromDb(165));
  ok(z2.key === 'critical', `فعّالة 155 dB وقمة 165 dB → حرج جدًا (حصلنا «${z2.label}»، السبب: ${z2.driver})`);
  const z3 = bearingZone(fromDb(130), fromDb(150));
  ok(z3.key === 'hard', `فعّالة 130 dB وقمة 150 dB → حرج (حصلنا «${z3.label}»، السبب: ${z3.driver})`);
  ok(z3.driver === 'crest', 'الحكم في الصف الثالث جاء من **الصدمية** لا من مستوى الطاقة — وهذا جوهر المخطط');
  const quiet = bearingZone(fromDb(125), fromDb(131));
  ok(quiet.key === 'excellent', 'فعّالة 125 dB وقمة 131 dB → ممتاز');
  // اختبار مضاد للنموذج القديم: المتوسط كان يعطي الصف الثالث «جيد»
  ok(bearingZone(fromDb(130), fromDb(150)).key !== 'good', 'محمل منخفض الطاقة عالي الصدمية لا يُصنّف «جيد» أبدًا');
}

// ═══ 10) الاتزان بمستوى واحد ═══
head('10) الاتزان بمستوى واحد: استرجاع معامل تأثير معلوم');
{
  // نظام مصطنع: α معلوم مسبقًا، فنولّد القراءات منه ثم نطالب الشيفرة باستنتاجه
  const alphaTrue = C.polar(0.042, 118);         // (mm/s) لكل غرام، بانزياح 118°
  const V0 = C.polar(6.4, 35);                   // الاهتزاز الأصلي
  const trial = { mass: 12, deg: 0 };
  const V1 = C.add(V0, C.mul(alphaTrue, C.polar(trial.mass, trial.deg)));
  const r = balanceOnePlane(C.toPolar(V0), trial, C.toPolar(V1));
  near(r.alpha.mag, 0.042, 0.01, 'مقدار معامل التأثير مستَرجَع');
  near(r.alpha.deg, 118, 0.01, 'زاوية معامل التأثير مستَرجَعة');

  // الاختبار الحاسم: هل كتلة التصحيح تُصفّر الاهتزاز فعلًا؟
  const res = residualAfter(C.toPolar(V0), r.alpha, r.correction);
  ok(res.mag < 0.001, `الاهتزاز المتبقي بعد التصحيح ≈ صفر (${res.mag.toExponential(2)} mm/s)`);
  // وتصحيح ناقص يترك بقيّة متناسبة
  const half = residualAfter(C.toPolar(V0), r.alpha, { mass: r.correction.mass / 2, deg: r.correction.deg });
  near(half.mag, 6.4 / 2, 0.5, 'نصف كتلة التصحيح تترك نصف الاهتزاز — العلاقة خطّية');
}

// ═══ 11) الاتزان بمستويين ═══
head('11) الاتزان بمستويين: حل النظام المركّب 2×2');
{
  const A = {
    a11: C.polar(0.050, 100), a12: C.polar(0.018, 250),
    a21: C.polar(0.021, 310), a22: C.polar(0.046, 70),
  };
  const V01 = C.polar(5.0, 90), V02 = C.polar(7.0, 180);   // أرقام الحقيبة: 0.500 و0.700 عند 90° و180°
  const T1 = { mass: 10, deg: 0 }, T2 = { mass: 10, deg: 0 };
  const mk = (base, a, T) => C.toPolar(C.add(base, C.mul(a, C.polar(T.mass, T.deg))));
  const runs = {
    base: [C.toPolar(V01), C.toPolar(V02)],
    trial1: { ...T1, read: [mk(V01, A.a11, T1), mk(V02, A.a21, T1)] },
    trial2: { ...T2, read: [mk(V01, A.a12, T2), mk(V02, A.a22, T2)] },
  };
  const r = balanceTwoPlane(runs);
  near(r.alpha.a11.mag, 0.050, 0.01, 'α11 مستَرجَع');
  near(r.alpha.a22.deg, 70, 0.01, 'زاوية α22 مستَرجَعة');
  const res = residualTwoPlane(r.raw, r.correction);
  ok(res[0].mag < 1e-9 && res[1].mag < 1e-9,
    `كتلتا التصحيح تُصفّران المستويين معًا (${res[0].mag.toExponential(1)}، ${res[1].mag.toExponential(1)})`);
  // اختبار مضاد: تصحيح مستوى واحد فقط لا يكفي — هذا هو درس المستويين كله
  const oneOnly = residualTwoPlane(r.raw, [r.correction[0], { mass: 0, deg: 0 }]);
  ok(oneOnly[1].mag > 1, `تصحيح مستوى واحد يترك المستوى الآخر مهتزًا (${oneOnly[1].mag.toFixed(2)}) — لهذا نحتاج مستويين`);
}

// ═══ 12) القوة الطاردة المركزية ═══
head('12) القوة الطاردة المركزية F = M ω² r');
{
  // من الحقيبة: M = 79 g، r = 100 mm، عند سرعات مختلفة
  const f200 = centrifugalForce(79, 100, 200);
  near(f200, 0.079 * Math.pow(2 * Math.PI * 200 / 60, 2) * 0.1, 0.01, 'الحساب المباشر بالمعادلة');
  near(centrifugalForce(79, 100, 400) / f200, 4, 0.01, 'مضاعفة السرعة تُربّع القوة (×4)');
  near(centrifugalForce(158, 100, 200) / f200, 2, 0.01, 'مضاعفة الكتلة تضاعف القوة (×2)');
  near(centrifugalForce(79, 200, 200) / f200, 2, 0.01, 'مضاعفة نصف القطر تضاعف القوة (×2)');
  console.log(`     ℹ️ عند 79 g و100 mm و200 RPM: F = ${f200.toFixed(3)} N`);
}

// ═══ 13) الآلات الترددية ═══
head('13) قوى القصور: أسطوانة واحدة واثنتان وأربع');
{
  const base = { massRecG: 500, crankRmm: 50, rodLmm: 200, rpm: 1500 };
  const w = 2 * Math.PI * 1500 / 60, F0 = 0.5 * w * w * 0.05, n = 4;
  const one = reciprocatingPeaks({ ...base, ...ENGINE_CONFIGS.one });
  near(one.Fp, F0, 0.5, 'أسطوانة واحدة: القوة الابتدائية = m·ω²·r');
  near(one.Fs, F0 / n, 0.5, 'أسطوانة واحدة: الثانوية = m·ω²·r / n');

  const two = reciprocatingPeaks({ ...base, ...ENGINE_CONFIGS.two });
  ok(two.Fp < F0 * 0.01, `أسطوانتان: الابتدائية متزنة (${two.Fp.toExponential(1)} N ≈ 0)`);
  near(two.Fs, 2 * F0 / n, 0.5, 'أسطوانتان: الثانوية تتضاعف بدل أن تُلغى');
  ok(two.TM1 > 1, `أسطوانتان: عزم الابتدائية غير متزن (${two.TM1.toFixed(1)} N·m) — القوة اتزنت والعزم لا`);

  const four = reciprocatingPeaks({ ...base, ...ENGINE_CONFIGS.four });
  ok(four.Fp < F0 * 0.01, `أربع أسطوانات: الابتدائية متزنة (${four.Fp.toExponential(1)} N)`);
  near(four.Fs, 4 * F0 / n, 0.5, 'أربع أسطوانات: الثانوية ×4 — عيب المحرك الرباعي الشهير');
  ok(four.TM1 < 0.01 && four.TM2 < 0.01, 'أربع أسطوانات: العزمان الابتدائي والثانوي متزنان');
}

// ═══ 14) ISO 1940 وعدد مستويات الاتزان ═══
head('14) ISO 1940 وقرار عدد مستويات الاتزان');
{
  const p = permissibleUnbalance(6.3, 1500, 20);
  near(p.ePerUm, 9549 * 6.3 / 1500, 0.01, 'الانحراف المسموح e = 9549·G/n');
  near(p.uPerGmm, p.ePerUm * 20, 0.01, 'عدم الاتزان المسموح = e × كتلة الدوّار');
  // جدول 4-1 في الحقيبة: القرصي حدّه 1000 لفة/دقيقة، والممتدّ حدّه 150 لفة/دقيقة
  ok(planesNeeded(60, 300, 800).planes === 1, 'قرصي (L/d=0.2) عند 800 لفة → مستوى واحد');
  ok(planesNeeded(60, 300, 1500).planes === 2, 'قرصي (L/d=0.2) عند 1500 لفة → مستويان (السرعة وحدها فرضتهما)');
  ok(planesNeeded(300, 200, 120).planes === 1, 'ممتدّ (L/d=1.5) عند 120 لفة → مستوى واحد');
  ok(planesNeeded(300, 200, 500).planes === 2, 'ممتدّ (L/d=1.5) عند 500 لفة → مستويان');
  ok(planesNeeded(420, 160, 1500).planes === 2, 'منصة الاتزان (L/d=2.6 عند 1500 لفة) → مستويان');
}

// ═══ 14-ب) كتلة زائدة على مكبس واحد تكسر اتزان التكوين الرباعي ═══
head('14-ب) الخطوة الرابعة في تجربة الحقيبة: كتلة إضافية على مكبس واحد');
{
  const base = { massRecG: 500, crankRmm: 50, rodLmm: 200, rpm: 1500 };
  const clean = reciprocatingPeaks({ ...base, ...ENGINE_CONFIGS.four });
  const dirty = reciprocatingPeaks({ ...base, ...ENGINE_CONFIGS.fourWithExtra });
  const w = 2 * Math.PI * 1500 / 60;
  const expected = (0.120) * w * w * 0.05;         // 620 g − 500 g = 120 g زائدة
  ok(clean.Fp < 1, `الرباعي النظيف: الابتدائية صفر (${clean.Fp.toExponential(1)} N)`);
  near(dirty.Fp, expected, 1, 'بعد الكتلة الزائدة: الابتدائية = كتلة الزيادة × ω² × r');
  ok(dirty.TM1 > 1, `وعزم الابتدائية عاد كذلك (${dirty.TM1.toFixed(1)} N·m)`);
  const r = recipResidual({ ...base, ...ENGINE_CONFIGS.fourWithExtra });
  ok(r.fp > 0 && r.fs > 0, 'recipResidual يُرجع القوّتين لتغذية نموذج العطل الترددي');
}

// ═══ 14-ج) بصمة المكينة الترددية في الطيف ═══
head('14-ج) الطيف يكشف المكبس المختلّ: غياب 1× ثم عودته');
{
  const base = { massRecG: 500, crankRmm: 50, rodLmm: 200, rpm: 1500 };
  const RECIP = { rpm: 1500, natHz: 88, floorG: 0.008, mobility: 0.006, bearing: { n: 10, bd: 8.73, pd: 50, phi: 0, resHz: 2600 } };
  const S = 1500 / 60;
  const read = cfg => {
    const m = { ...RECIP, recipResidual: recipResidual({ ...base, ...cfg }) };
    const w = synth(m, [{ type: 'recipUnbalance', sev: 1 }], { fs: 12800, n: 16384, seed: 31, dir: 'V' });
    return spectrum(integrateWave(w.a, w.fs, 1), w.fs, { win: 'hann' });
  };
  const clean = read(ENGINE_CONFIGS.four), dirty = read(ENGINE_CONFIGS.fourWithExtra);
  const c1 = ampAt(clean, S).amp, c2 = ampAt(clean, 2 * S).amp;
  const d1 = ampAt(dirty, S).amp, d2 = ampAt(dirty, 2 * S).amp;
  ok(c1 / c2 < 0.15, `الرباعي المتزن: 1× ضئيل أمام 2× (النسبة ${(c1 / c2).toFixed(3)}) — الثانوية وحدها الباقية`);
  ok(d1 > c1 * 5, `بعد الكتلة الزائدة: 1× ارتفع (${c1.toFixed(3)} ← ${d1.toFixed(3)} mm/s)`);
  const one = read(ENGINE_CONFIGS.one);
  ok(ampAt(one, S).amp > ampAt(one, 2 * S).amp * 3, 'الأسطوانة الواحدة: 1× يهيمن كما تفرض المعادلة');
}

// ═══ 15) الحكم بمعيار ISO على إشارة مولَّدة فعلًا ═══
head('15) السلسلة كاملة: عطل مولَّد → طيف → RMS بالنطاق → حكم ISO');
{
  for (const sev of [0.15, 0.45, 0.9]) {
    const w = synth(PUMP, [{ type: 'unbalance', sev }], { fs: 25600, n: 16384, seed: 99, dir: 'H' });
    const v = integrateWave(w.a, w.fs, 1);
    const sp = spectrum(v, w.fs, { win: 'hann' });
    const rms = bandRms(sp, 10, 1000);
    const z = isoZone(rms, 'II');
    console.log(`     شدة ${sev}: RMS(10–1000Hz) = ${rms.toFixed(2)} mm/s → فئة II: ${z.label}`);
    ok(rms > 0.05 && rms < 40, `القيمة ضمن مدى واقعي لآلة صناعية`);
  }
  const wLow = synth(PUMP, [{ type: 'unbalance', sev: 0.15 }], { fs: 25600, n: 16384, seed: 99, dir: 'H' });
  const wHigh = synth(PUMP, [{ type: 'unbalance', sev: 0.9 }], { fs: 25600, n: 16384, seed: 99, dir: 'H' });
  const r = x => bandRms(spectrum(integrateWave(x.a, x.fs, 1), x.fs, { win: 'hann' }), 10, 1000);
  ok(r(wHigh) > r(wLow) * 3, 'شدة العطل تنعكس على القراءة تناسبيًا');
}

// ═══ 16) الطور ═══
head('16) قياس الطور: أساس كل عملية اتزان');
{
  const fs = 25600, n = 16384, f0 = 49.1667, A = 4, phDeg = 137;
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = A * Math.sin(2 * Math.PI * f0 * i / fs + phDeg * Math.PI / 180);
  const p = phaseAt(x, fs, f0);
  near(p.amp, A, 3, 'السعة المستخرجة بالكشف المتزامن');
  near(p.deg, phDeg, 2, 'الزاوية المستخرجة تطابق الزاوية المحقونة');
}

// ═══ 17) كشف المغلّف: إظهار BPFO المختفي في الطيف العادي ═══
head('17) طيف المغلّف يكشف معدّل النبضات حيث يعجز الطيف العادي');
{
  const bf = bearingFreqs(PUMP.bearing, PUMP.rpm);
  const w = synth(PUMP, [{ type: 'unbalance', sev: 0.5 }, { type: 'bearingOuter', sev: 0.5 }],
    { fs: 51200, n: 32768, seed: 21 });
  const env = envelope(w.a, w.fs, { fLow: 1500, fHigh: 6000 });
  const se = spectrum(env, w.fs, { win: 'hann' });
  const pk = topPeaks(se, { count: 4, fMin: 20, fMax: 1200 });
  const hit = pk.find(p => Math.abs(p.f - bf.bpfo) / bf.bpfo < 0.03);
  ok(!!hit, `أعلى قمم طيف المغلّف تحوي BPFO = ${bf.bpfo.toFixed(1)} Hz` +
    (hit ? ` (وُجدت عند ${hit.f.toFixed(1)} Hz)` : ` — وُجد بدلًا منها: ${pk.map(p => p.f.toFixed(0)).join('، ')}`));
  const envRms = metrics(env).rms;
  const clean = synth(PUMP, [{ type: 'unbalance', sev: 0.5 }], { fs: 51200, n: 32768, seed: 21 });
  const envClean = metrics(envelope(clean.a, clean.fs, { fLow: 1500, fHigh: 6000 })).rms;
  ok(envRms > envClean * 2, `طاقة المغلّف ترتفع مع العيب (${envClean.toFixed(3)} → ${envRms.toFixed(3)})`);
}

// ═══ 18) دقة قراءة السعة من الطيف مهما وقع التردد بين الخانات ═══
head('18) تصحيح فقد التحديد: السعة المقروءة صحيحة عند أي تردد');
{
  const fs = 25600, n = 8192, A = 2.5, df = fs / n;
  let worst = 0;
  for (const frac of [0, 0.13, 0.25, 0.37, 0.5]) {
    const f0 = (40 + frac) * df;                 // إزاحة متعمّدة عن مركز الخانة
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = A * Math.sin(2 * Math.PI * f0 * i / fs);
    const r = ampAt(spectrum(x, fs, { win: 'hann' }), f0);
    worst = Math.max(worst, Math.abs(r.amp - A) / A * 100);
  }
  ok(worst < 2, `أسوأ خطأ في السعة عبر كل الإزاحات = ${worst.toFixed(2)}% (كان يبلغ 15% بلا تصحيح)`);
}

console.log(`\n${'═'.repeat(54)}`);
console.log(`النتيجة: ${pass} ناجح، ${fail} فاشل`);
console.log('═'.repeat(54));
process.exit(fail ? 1 : 0);
