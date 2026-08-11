// balancekit — رياضيات الاتزان: متجهات مركّبة، معامل التأثير بمستوى ومستويين،
// درجات جودة الاتزان ISO 1940، القوة الطاردة المركزية، وقوى القصور في الآلات الترددية.
// وحدة حسابية خالصة: لا DOM. كل دالة قابلة للاختبار من node.

// ═══════════════ متجهات مركّبة ═══════════════
// السعة والطور معًا متجه واحد. هذه هي الفكرة التي بدونها لا يُفهم الاتزان إطلاقًا:
// لا يكفي أن تعرف «كم» يهتز، بل «في أي اتجاه» — والزاوية هي الاتجاه.
export const C = {
  polar: (mag, deg) => ({ re: mag * Math.cos(deg * Math.PI / 180), im: mag * Math.sin(deg * Math.PI / 180) }),
  add: (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
  sub: (a, b) => ({ re: a.re - b.re, im: a.im - b.im }),
  mul: (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }),
  div: (a, b) => {
    const d = b.re * b.re + b.im * b.im;
    if (d < 1e-15) return { re: 0, im: 0 };
    return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
  },
  neg: a => ({ re: -a.re, im: -a.im }),
  scale: (a, k) => ({ re: a.re * k, im: a.im * k }),
  mag: a => Math.hypot(a.re, a.im),
  deg: a => { const d = Math.atan2(a.im, a.re) * 180 / Math.PI; return d < 0 ? d + 360 : d; },
  toPolar: a => ({ mag: C.mag(a), deg: C.deg(a) }),
};

// ═══════════════ الاتزان بمستوى واحد — طريقة معامل التأثير ═══════════════
// الفكرة كلها في ثلاث خطوات:
//   1) قِس الاهتزاز الأصلي  V0 (سعة وزاوية).
//   2) ضع كتلة اختبار معلومة mt عند زاوية معلومة، وقِس V1.
//   3) أثر الكتلة وحدها هو V1 − V0. اقسمه على الكتلة تحصل على «معامل التأثير» α:
//      كم وحدة اهتزاز يُحدثها كل جرام، وبأي انزياح زاوي.
//   ثم كتلة التصحيح هي ما يُلغي V0 تمامًا:  mc = −V0 / α.
//
// vecUnbal: {mag, deg} الاهتزاز الأصلي — mag بأي وحدة سعة، deg بالدرجات.
// trial:    {mass, deg} كتلة الاختبار وزاويتها.
// vecTrial: {mag, deg} الاهتزاز بعد وضع كتلة الاختبار.
// المخرج: معامل التأثير، وكتلة التصحيح وزاويتها، والاهتزاز المتبقي المتوقّع.
export function balanceOnePlane(vecUnbal, trial, vecTrial) {
  const V0 = C.polar(vecUnbal.mag, vecUnbal.deg);
  const V1 = C.polar(vecTrial.mag, vecTrial.deg);
  const T = C.polar(trial.mass, trial.deg);
  const effect = C.sub(V1, V0);                 // أثر كتلة الاختبار وحدها
  const alpha = C.div(effect, T);               // وحدة السعة لكل غرام
  const mc = C.neg(C.div(V0, alpha));           // كتلة التصحيح
  const p = C.toPolar(mc);
  return {
    effect: C.toPolar(effect),
    alpha: C.toPolar(alpha),
    correction: { mass: p.mag, deg: p.deg },
    // إن أُبقيت كتلة الاختبار مكانها فالتصحيح المطلوب يُحسب من فرق المتجهين
    correctionKeepingTrial: (() => {
      const m = C.sub(mc, T); const q = C.toPolar(m);
      return { mass: q.mag, deg: q.deg };
    })(),
    residualIdeal: 0,
  };
}

// الاهتزاز المتوقّع بعد وضع كتلة تصحيح فعلية (قد تختلف عن المثالية لأن المتدرب قرّبها)
export function residualAfter(vecUnbal, alphaPolar, applied) {
  const V0 = C.polar(vecUnbal.mag, vecUnbal.deg);
  const a = C.polar(alphaPolar.mag, alphaPolar.deg);
  const m = C.polar(applied.mass, applied.deg);
  const V = C.add(V0, C.mul(a, m));
  return C.toPolar(V);
}

// ═══════════════ الاتزان بمستويين ═══════════════
// دوّار طويل (نسبة الطول إلى القطر > 0.5 تقريبًا) لا يكفيه مستوى واحد: كتلة التصحيح
// في مستوى تُصلح القوة وتُفسد العزم. فنحتاج أربع قراءات لبناء أربعة معاملات تأثير:
//   α11 α12        أثر كتلة المستوى 1 على المستوى 1 وعلى المستوى 2
//   α21 α22        وأثر كتلة المستوى 2 عليهما
// ثم نحل نظامين خطّيين مركّبين:  α·mc = −V0
//
// runs: {
//   base:   [{mag,deg}, {mag,deg}]      قراءتا المستويين قبل أي كتلة
//   trial1: { mass, deg, read: [{},{}] } كتلة اختبار في المستوى 1 وقراءتاها
//   trial2: { mass, deg, read: [{},{}] } كتلة اختبار في المستوى 2 وقراءتاها
// }
export function balanceTwoPlane(runs) {
  const V01 = C.polar(runs.base[0].mag, runs.base[0].deg);
  const V02 = C.polar(runs.base[1].mag, runs.base[1].deg);
  const T1 = C.polar(runs.trial1.mass, runs.trial1.deg);
  const T2 = C.polar(runs.trial2.mass, runs.trial2.deg);

  const a11 = C.div(C.sub(C.polar(runs.trial1.read[0].mag, runs.trial1.read[0].deg), V01), T1);
  const a21 = C.div(C.sub(C.polar(runs.trial1.read[1].mag, runs.trial1.read[1].deg), V02), T1);
  const a12 = C.div(C.sub(C.polar(runs.trial2.read[0].mag, runs.trial2.read[0].deg), V01), T2);
  const a22 = C.div(C.sub(C.polar(runs.trial2.read[1].mag, runs.trial2.read[1].deg), V02), T2);

  // حل بقاعدة كرامر: det = a11·a22 − a12·a21
  const det = C.sub(C.mul(a11, a22), C.mul(a12, a21));
  const b1 = C.neg(V01), b2 = C.neg(V02);
  const m1 = C.div(C.sub(C.mul(b1, a22), C.mul(a12, b2)), det);
  const m2 = C.div(C.sub(C.mul(a11, b2), C.mul(b1, a21)), det);
  const p1 = C.toPolar(m1), p2 = C.toPolar(m2);

  return {
    alpha: { a11: C.toPolar(a11), a12: C.toPolar(a12), a21: C.toPolar(a21), a22: C.toPolar(a22) },
    det: C.toPolar(det),
    correction: [{ mass: p1.mag, deg: p1.deg }, { mass: p2.mag, deg: p2.deg }],
    // متجهات معامل التأثير الخام — يحتاجها المحاكي لحساب الاهتزاز بعد أي كتلة يضعها المتدرب
    raw: { a11, a12, a21, a22, V01, V02 },
  };
}

// الاهتزاز المتوقّع في المستويين بعد وضع كتلتي تصحيح فعليتين
export function residualTwoPlane(raw, applied) {
  const m1 = C.polar(applied[0].mass, applied[0].deg);
  const m2 = C.polar(applied[1].mass, applied[1].deg);
  const R1 = C.add(raw.V01, C.add(C.mul(raw.a11, m1), C.mul(raw.a12, m2)));
  const R2 = C.add(raw.V02, C.add(C.mul(raw.a21, m1), C.mul(raw.a22, m2)));
  return [C.toPolar(R1), C.toPolar(R2)];
}

// ═══════════════ متى مستوى واحد ومتى مستويان؟ ═══════════════
// منقول حرفيًا من الجدول 4-1 في الحقيبة العملية (`PR04.md`، صفحة 52):
//   L/d أقل من 0.5 (دوّار قرصي): سرعة < 1000 لفة/دقيقة → مستوى واحد، وإلا → مستويان.
//   L/d أكبر من 0.5 (دوّار ممتدّ): سرعة <  150 لفة/دقيقة → مستوى واحد، وإلا → مستويان.
// لاحظ أن **السرعة وحدها** قد تفرض مستويين على قرص رفيع: فوق 1000 لفة/دقيقة يصير
// أدنى انحراف بين مستوى الكتلة ومستوى التصحيح عزمًا محسوسًا.
export const PLANE_RULE = { discLD: 0.5, discRpm: 1000, longRpm: 150 };

export function planesNeeded(lengthMm, diameterMm, rpm) {
  const ld = lengthMm / diameterMm;
  const disc = ld < PLANE_RULE.discLD;
  const limit = disc ? PLANE_RULE.discRpm : PLANE_RULE.longRpm;
  const planes = rpm < limit ? 1 : 2;
  const shape = disc
    ? `دوّار قرصي (L/d = ${ld.toFixed(2)} أقل من 0.5)`
    : `دوّار ممتدّ (L/d = ${ld.toFixed(2)} أكبر من 0.5)`;
  return {
    planes, ld, limit, disc,
    why: planes === 1
      ? `${shape} وسرعته ${rpm} لفة/دقيقة أقل من حدّ ${limit} — يكفيه مستوى تصحيح واحد.`
      : `${shape} وسرعته ${rpm} لفة/دقيقة بلغت حدّ ${limit} أو تجاوزته — عدم الاتزان يولّد عزمًا لا تُلغيه كتلة واحدة، فلا بدّ من مستويين.`,
  };
}

// ═══════════════ ISO 1940 — درجات جودة الاتزان ═══════════════
// e_per (µm أو g·mm لكل kg من كتلة الدوّار) = 9549 × G / n
// حيث G درجة الجودة بـ mm/s و n سرعة الدوران بـ RPM.
export const ISO1940_GRADES = [
  { g: 0.4, use: 'مغازل ومحرّكات دقيقة، جلّاخات دقيقة' },
  { g: 1, use: 'محرّكات الجلّاخات، أعمدة إدارة دقيقة' },
  { g: 2.5, use: 'توربينات بخارية وغازية، منافيخ، دوّارات مولّدات، مضخات توربينية' },
  { g: 6.3, use: 'مراوح ومضخات ودولاب طيران وأجزاء آلات عامة — الأشيع في الصيانة' },
  { g: 16, use: 'أعمدة إدارة، أجزاء مكائن ترددية بمتطلبات خاصة' },
  { g: 40, use: 'إطارات وجنوط عجلات السيارات، أعمدة كردان' },
  { g: 100, use: 'أجزاء محرّكات ترددية على تعليق مرن' },
];

export function permissibleUnbalance(gradeG, rpm, rotorMassKg) {
  const ePer = 9549 * gradeG / rpm;            // µm (= g·mm/kg)
  return { ePerUm: ePer, uPerGmm: ePer * rotorMassKg };
}

// ═══════════════ القوة الطاردة المركزية ═══════════════
// F = M ω² r — أساس كل شيء: عدم الاتزان قوة دوّارة تنمو مع **مربع** السرعة.
// M بالغرام، r بالمليمتر، rpm — والمخرج بالنيوتن.
export function centrifugalForce(massG, radiusMm, rpm) {
  const w = 2 * Math.PI * rpm / 60;
  return (massG / 1000) * w * w * (radiusMm / 1000);
}

// ═══════════════ الآلات الترددية — قوى القصور وعزومها ═══════════════
// القوة الابتدائية لكل أسطوانة: F_p = m·ω²·r·cos θ            (بتردد الدوران 1×)
// القوة الثانوية:               F_s = m·ω²·r·cos(2θ)/n        (بضعف تردد الدوران 2×)
// حيث n = L/r نسبة طول ذراع التوصيل إلى نصف قطر الكرنك.
// العزوم تُؤخذ حول مستوى مرجعي: T = Σ F_i · x_i
//
// cfg: { cylinders:[{crankDeg, xMm, massG?}], massRecG, crankRmm, rodLmm, rpm, refXmm }
// `massG` لكل أسطوانة اختيارية: بها تُحاكى الخطوة الرابعة من تجربة الحقيبة —
// «أضف كتلة إضافية إلى أحد البساتم» — فينكسر اتزان التكوين الرباعي ويظهر 1× في الطيف.
export function reciprocatingForces(cfg, thetaDeg) {
  const w = 2 * Math.PI * cfg.rpm / 60;
  const r = cfg.crankRmm / 1000;
  const n = cfg.rodLmm / cfg.crankRmm;
  const th = thetaDeg * Math.PI / 180;
  const ref = (cfg.refXmm ?? avg(cfg.cylinders.map(c => c.xMm))) / 1000;

  let Fp = 0, Fs = 0, Tp = 0, Ts = 0;
  for (const c of cfg.cylinders) {
    const m = (c.massG ?? cfg.massRecG) / 1000;
    const base = m * w * w * r;                 // N لهذه الأسطوانة وحدها
    const a = th + c.crankDeg * Math.PI / 180;
    const fp = base * Math.cos(a);
    const fs = base * Math.cos(2 * a) / n;
    const x = c.xMm / 1000 - ref;
    Fp += fp; Fs += fs; Tp += fp * x; Ts += fs * x;
  }
  const base = (cfg.massRecG / 1000) * w * w * r;
  return { Fp, Fs, TM1: Tp, TM2: Ts, base, n };
}

// الكتلة الترددية غير المتوازنة الصافية عند 1× و2× — يستهلكها نموذج العطل الترددي
// في vibkit ليولّد طيفًا يميّز أي مكبس هو المختلّ.
export function recipResidual(cfg) {
  const p = reciprocatingPeaks(cfg);
  return { fp: p.Fp, fs: p.Fs, tm1: p.TM1, tm2: p.TM2 };
}

// أقصى قيمة على مدار دورة كاملة — هذا ما يُسجَّل في جدول النتائج
export function reciprocatingPeaks(cfg, stepDeg = 1) {
  let Fp = 0, Fs = 0, TM1 = 0, TM2 = 0;
  for (let t = 0; t < 360; t += stepDeg) {
    const r = reciprocatingForces(cfg, t);
    Fp = Math.max(Fp, Math.abs(r.Fp));
    Fs = Math.max(Fs, Math.abs(r.Fs));
    TM1 = Math.max(TM1, Math.abs(r.TM1));
    TM2 = Math.max(TM2, Math.abs(r.TM2));
  }
  return { Fp, Fs, TM1, TM2 };
}

// التكوينات الثلاثة التي تطلبها الحقيبة، بترتيب إشعال قياسي
export const ENGINE_CONFIGS = {
  one: {
    label: 'أسطوانة واحدة', term: 'Single cylinder',
    cylinders: [{ crankDeg: 0, xMm: 0 }],
    verdict: 'القوة الابتدائية والثانوية غير متزنتين معًا — أشد التكوينات اهتزازًا، ولذلك يُعلَّق على مساند مطاطية.',
  },
  two: {
    label: 'أسطوانتان (كرنك 180°)', term: 'Two cylinders, 180° crank',
    cylinders: [{ crankDeg: 0, xMm: 0 }, { crankDeg: 180, xMm: 100 }],
    verdict: 'الابتدائية متزنة (تلغي كل منهما الأخرى) لكن **عزمها** غير متزن، والثانوية تتضاعف بدل أن تُلغى.',
  },
  four: {
    label: 'أربع أسطوانات (1-3-4-2)', term: 'Inline four, 1-3-4-2',
    cylinders: [{ crankDeg: 0, xMm: 0 }, { crankDeg: 180, xMm: 100 }, { crankDeg: 180, xMm: 200 }, { crankDeg: 0, xMm: 300 }],
    verdict: 'الابتدائية وعزمها متزنان، وعزم الثانوية متزن — لكن **القوة الثانوية تتضاعف أربع مرات**: عيب المحرك الرباعي الشهير.',
  },
  // الخطوة الرابعة في تجربة الحقيبة: كتلة إضافية على مكبس واحد تكسر الاتزان الابتدائي.
  // المكبس المختلّ يُحدَّد لاحقًا من الطيف — وهذا هو مقصد التجربة العاشرة.
  fourWithExtra: {
    label: 'أربع أسطوانات + كتلة زائدة على المكبس الثاني', term: 'Inline four with added mass',
    cylinders: [
      { crankDeg: 0, xMm: 0 }, { crankDeg: 180, xMm: 100, massG: 620 },
      { crankDeg: 180, xMm: 200 }, { crankDeg: 0, xMm: 300 },
    ],
    verdict: 'كتلة زائدة على مكبس واحد تُعيد ظهور القوة الابتدائية وعزمها — يظهر 1× في الطيف بعد أن كان غائبًا.',
  },
};

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
