// عقد المفاهيم — مصدر الحقيقة الوحيد لمفردات مقرر «الاهتزازات والاتزان» (264 مصيم).
// ⚠️ هذا الملف **نسخة واحدة متطابقة** في المنصتين النظرية والعملية: المقرر واحد وعقده واحد.
//    أي تعديل هنا يُنسخ إلى المنصة الأخرى فورًا، وإلا انكسرت مصفوفة المواءمة.
//
// يستهلكه: الدروس والأسئلة والمحاكيات والمسرد ومحرك الاستحضار المتباعد ومحطات المعمل.
// يفحصه:   node tools/validate-course.mjs
//
// depth:  core    = يُدرَّس + يُقاس + يُتمرَّن + يُعرَّف   (نقص أيٍّ منها خطأ يوقف البوابة)
//         support = يُدرَّس + يُقاس                      (ما فوقه تحذير)
//         aware   = يُدرَّس فقط
//
// needs: مفاهيم سابقة لازمة معرفيًا. المحقق يرفض الدورات ويرفض التبعية على درس لاحق.

export const OUTCOMES = [
  { id: 'O1', text: 'يفسّر ما الاهتزاز الميكانيكي وأسبابه، ويربطه ببرنامج الصيانة التنبؤية في الورشة.' },
  { id: 'O2', text: 'يقرأ خصائص الاهتزاز — التردد والسعة والطور — ويحوّل بين وحداتها وكمياتها الثلاث.' },
  { id: 'O3', text: 'يختار جهاز قياس الاهتزاز المناسب ويثبّته في الموضع والاتجاه الصحيحين.' },
  { id: 'O4', text: 'يقيس الاهتزاز ويحكم على حالة الآلة بمعيار ISO ومخطط شدة اهتزاز المحمل.' },
  { id: 'O5', text: 'يشخّص العطل من الطيف والموجة الزمنية، ويميّز بصمات الأعطال الرئيسية.' },
  { id: 'O6', text: 'يوازن آلة دوّارة بمستوى واحد وبمستويين، ويفسّر اتزان المكائن الترددية.' },
];

export const CONCEPTS = [
  // ═══════════════ u1 — عالم الاهتزاز ═══════════════

  // u1l1 — ما الاهتزاز ولماذا يهمّ فنّي الصيانة
  // تعريفٌ يُدرَّس ويُقاس بالأسئلة؛ ليس مهارةً تُتمرَّن، فعمقه support لا core.
  { id: 'vibration-def', label: 'الاهتزاز الميكانيكي', term: 'Mechanical Vibration', outcome: 'O1', depth: 'support', needs: [] },
  { id: 'maintenance-types', label: 'أنظمة الصيانة', term: 'Maintenance Systems', outcome: 'O1', depth: 'support', needs: [] },
  { id: 'predictive-maintenance', label: 'الصيانة التنبؤية', term: 'Predictive Maintenance', outcome: 'O1', depth: 'core', needs: ['maintenance-types', 'vibration-def'] },
  { id: 'vibration-cost', label: 'كلفة الاهتزاز على الآلة', term: 'Cost of Vibration', outcome: 'O1', depth: 'aware', needs: ['vibration-def'] },

  // u1l2 — لغة الاهتزاز
  { id: 'cycle-period', label: 'الدورة والزمن الدوري', term: 'Cycle & Period', outcome: 'O2', depth: 'support', needs: ['vibration-def'] },
  { id: 'frequency', label: 'التردد', term: 'Frequency', outcome: 'O2', depth: 'core', needs: ['cycle-period'] },
  { id: 'rpm-hz', label: 'التحويل بين RPM و Hz', term: 'RPM ↔ Hz', outcome: 'O2', depth: 'core', needs: ['frequency'] },
  { id: 'angular-frequency', label: 'التردد الدائري', term: 'Angular Frequency ω', outcome: 'O2', depth: 'support', needs: ['frequency'] },

  // u1l3 — سعة الاهتزاز والطور
  { id: 'amplitude', label: 'سعة الاهتزاز', term: 'Amplitude', outcome: 'O2', depth: 'support', needs: ['vibration-def'] },
  { id: 'peak-p2p-rms', label: 'القمة ومن قمة لقمة والقيمة الفعّالة', term: 'Peak, Peak-to-Peak, RMS', outcome: 'O2', depth: 'core', needs: ['amplitude'] },
  { id: 'phase', label: 'الطور', term: 'Phase', outcome: 'O2', depth: 'core', needs: ['frequency', 'cycle-period'] },

  // ═══════════════ u2 — مبادئ الاهتزاز ═══════════════

  // u2l1 — الحر والجبري والتخميد
  { id: 'free-vibration', label: 'الاهتزاز الحر', term: 'Free Vibration', outcome: 'O1', depth: 'support', needs: ['vibration-def'] },
  { id: 'forced-vibration', label: 'الاهتزاز الجبري', term: 'Forced Vibration', outcome: 'O1', depth: 'support', needs: ['free-vibration'] },
  { id: 'damping', label: 'التخميد', term: 'Damping', outcome: 'O1', depth: 'support', needs: ['free-vibration'] },
  { id: 'waveform-types', label: 'أشكال إشارة الاهتزاز', term: 'Waveform Types', outcome: 'O5', depth: 'support', needs: ['amplitude', 'cycle-period'] },

  // u2l2 — درجة الحرية والتردد الطبيعي
  { id: 'dof', label: 'درجة الحرية', term: 'Degree of Freedom', outcome: 'O1', depth: 'support', needs: ['free-vibration'] },
  { id: 'natural-frequency', label: 'التردد الطبيعي', term: 'Natural Frequency', outcome: 'O1', depth: 'support', needs: ['free-vibration', 'frequency'] },
  { id: 'stiffness-mass', label: 'أثر الصلابة والكتلة', term: 'Stiffness & Mass Effect', outcome: 'O1', depth: 'support', needs: ['natural-frequency'] },

  // u2l3 — الرنين والسرعات الحرجة
  { id: 'resonance', label: 'الرنين', term: 'Resonance', outcome: 'O1', depth: 'core', needs: ['natural-frequency', 'forced-vibration'] },
  { id: 'critical-speed', label: 'السرعة الحرجة', term: 'Critical Speed', outcome: 'O1', depth: 'support', needs: ['resonance', 'rpm-hz'] },
  { id: 'resonance-remedy', label: 'علاج الرنين', term: 'Resonance Remedy', outcome: 'O1', depth: 'support', needs: ['resonance', 'stiffness-mass'] },

  // u2l4 — الأسباب والكميات الثلاث
  { id: 'repeated-forces', label: 'القوى المتكررة', term: 'Repeated Forces', outcome: 'O1', depth: 'support', needs: ['forced-vibration'] },
  { id: 'looseness-cause', label: 'الارتخاء في أجزاء الآلة', term: 'Mechanical Looseness', outcome: 'O1', depth: 'support', needs: ['repeated-forces'] },
  { id: 'dva', label: 'الإزاحة والسرعة والتسارع', term: 'Displacement, Velocity, Acceleration', outcome: 'O2', depth: 'support', needs: ['amplitude', 'frequency'] },
  { id: 'quantity-selection', label: 'اختيار الكمية بحسب التردد', term: 'Quantity Selection', outcome: 'O2', depth: 'core', needs: ['dva'] },
  { id: 'unit-conversion', label: 'وحدات الاهتزاز وتحويلاتها', term: 'Units: mils, µm, mm/s, g', outcome: 'O2', depth: 'support', needs: ['dva'] },

  // ═══════════════ u3 — أجهزة القياس ═══════════════

  // u3l1 — اللواقط الثلاثة
  { id: 'transducer', label: 'لاقط الاهتزاز', term: 'Transducer', outcome: 'O3', depth: 'support', needs: ['vibration-def'] },
  { id: 'displacement-sensor', label: 'لاقط الإزاحة (تيار دوامي)', term: 'Eddy Current Probe', outcome: 'O3', depth: 'support', needs: ['transducer', 'dva'] },
  { id: 'velocity-sensor', label: 'لاقط السرعة', term: 'Velocity Sensor', outcome: 'O3', depth: 'support', needs: ['transducer', 'dva'] },
  { id: 'accelerometer', label: 'لاقط التسارع الكهروضغطي', term: 'Piezoelectric Accelerometer', outcome: 'O3', depth: 'core', needs: ['transducer', 'dva'] },
  { id: 'sensor-selection', label: 'معيار اختيار اللاقط', term: 'Sensor Selection Criteria', outcome: 'O3', depth: 'support', needs: ['accelerometer', 'quantity-selection'] },
  { id: 'sensor-sensitivity', label: 'الحساسية والنطاق الديناميكي', term: 'Sensitivity & Dynamic Range', outcome: 'O3', depth: 'support', needs: ['accelerometer'] },
  { id: 'linearity', label: 'الخطّية', term: 'Linearity', outcome: 'O3', depth: 'aware', needs: ['sensor-sensitivity'] },
  { id: 'charge-amplifier', label: 'مكبّرات الشحنة والجهد', term: 'Charge & Voltage Amplifiers', outcome: 'O3', depth: 'aware', needs: ['accelerometer'] },
  { id: 'shaft-vs-casing', label: 'اهتزاز العمود واهتزاز الغلاف', term: 'Shaft vs Casing Vibration', outcome: 'O3', depth: 'aware', needs: ['displacement-sensor', 'accelerometer'] },

  // u3l2 — أين تقيس وكيف تُثبّت
  { id: 'measurement-point', label: 'نقطة القياس على المحمل', term: 'Measurement Point', outcome: 'O3', depth: 'core', needs: ['transducer'] },
  { id: 'measurement-direction', label: 'الاتجاهات: أفقي ورأسي ومحوري', term: 'Measurement Directions H/V/A', outcome: 'O3', depth: 'core', needs: ['measurement-point'] },
  { id: 'mounting-method', label: 'طريقة التثبيت وسقف التردد', term: 'Mounting & Frequency Limit', outcome: 'O3', depth: 'core', needs: ['accelerometer', 'measurement-point'] },
  { id: 'measurement-safety', label: 'سلامة القياس على آلة دائرة', term: 'Measurement Safety', outcome: 'O3', depth: 'core', needs: ['measurement-point'] },
  { id: 'energy-isolation', label: 'عزل الطاقة قبل لمس الدوّار', term: 'Energy Isolation / LOTO', outcome: 'O3', depth: 'core', needs: ['measurement-safety'] },
  { id: 'cables-connections', label: 'التوصيلات والكابلات', term: 'Attachment & Cables', outcome: 'O3', depth: 'aware', needs: ['accelerometer'] },

  // u3l3 — محلل الاهتزازات
  { id: 'analyzer', label: 'محلل الاهتزازات', term: 'Vibration Analyzer', outcome: 'O3', depth: 'support', needs: ['transducer'] },
  { id: 'fft', label: 'تحويل فورييه السريع', term: 'FFT', outcome: 'O5', depth: 'core', needs: ['frequency', 'amplitude', 'analyzer'] },
  { id: 'time-vs-frequency', label: 'المجال الزمني والمجال الترددي', term: 'Time vs Frequency Domain', outcome: 'O5', depth: 'support', needs: ['fft', 'waveform-types'] },
  { id: 'orbit-domain', label: 'مجال المدار', term: 'Orbital Domain', outcome: 'O5', depth: 'aware', needs: ['time-vs-frequency', 'phase'] },
  { id: 'sampling-rate', label: 'معدل أخذ العينات', term: 'Sampling Rate', outcome: 'O5', depth: 'support', needs: ['fft'] },
  { id: 'frequency-resolution', label: 'دقة التردد', term: 'Frequency Resolution', outcome: 'O5', depth: 'support', needs: ['fft', 'sampling-rate'] },
  { id: 'leakage-window', label: 'التسرّب والنوافذ', term: 'Leakage & Windowing', outcome: 'O5', depth: 'support', needs: ['fft'] },

  // ═══════════════ u4 — المراقبة والتشخيص ═══════════════

  // u4l1 — أنظمة المراقبة
  { id: 'monitoring-manual', label: 'المراقبة اليدوية', term: 'Manual Monitoring', outcome: 'O4', depth: 'aware', needs: ['analyzer'] },
  { id: 'monitoring-portable', label: 'المراقبة بأجهزة محمولة', term: 'Portable Data Collectors', outcome: 'O4', depth: 'support', needs: ['analyzer'] },
  { id: 'monitoring-online', label: 'المراقبة المستمرة الآلية', term: 'Online Monitoring', outcome: 'O4', depth: 'aware', needs: ['analyzer'] },
  { id: 'trend-analysis', label: 'تحليل الاتجاه العام', term: 'Trend Analysis', outcome: 'O4', depth: 'support', needs: ['predictive-maintenance', 'peak-p2p-rms'] },

  // u4l2 — قراءة الطيف
  { id: 'spectrum-reading', label: 'قراءة الطيف', term: 'Spectrum Reading', outcome: 'O5', depth: 'support', needs: ['fft', 'time-vs-frequency'] },
  { id: 'orders-1x-2x', label: 'مضاعفات سرعة الدوران 1× و2×', term: 'Orders 1× and 2×', outcome: 'O5', depth: 'core', needs: ['spectrum-reading', 'rpm-hz'] },
  { id: 'harmonics', label: 'التوافقيات', term: 'Harmonics', outcome: 'O5', depth: 'support', needs: ['orders-1x-2x'] },
  { id: 'sidebands', label: 'الجوانب', term: 'Sidebands', outcome: 'O5', depth: 'support', needs: ['harmonics'] },
  { id: 'noise-floor', label: 'أرضية الضجيج', term: 'Noise Floor', outcome: 'O5', depth: 'support', needs: ['spectrum-reading'] },
  { id: 'blade-pass', label: 'تردد مرور الريش', term: 'Blade Pass Frequency', outcome: 'O5', depth: 'support', needs: ['orders-1x-2x'] },
  { id: 'bearing-frequencies', label: 'ترددات أعطال المحامل', term: 'Bearing Fault Frequencies', outcome: 'O5', depth: 'support', needs: ['orders-1x-2x'] },

  // u4l3 — البصمات والمعيار
  { id: 'fault-severity', label: 'تحديد شدة العطل', term: 'Fault Severity Determination', outcome: 'O4', depth: 'support', needs: ['peak-p2p-rms', 'trend-analysis'] },
  { id: 'iso-10816', label: 'معيار ISO 2372 (10816)', term: 'ISO 2372 / 10816', outcome: 'O4', depth: 'core', needs: ['peak-p2p-rms', 'fault-severity'] },
  { id: 'machine-class', label: 'فئة الآلة ونوع التأسيس', term: 'Machine Class & Foundation', outcome: 'O4', depth: 'support', needs: ['iso-10816'] },
  { id: 'crest-factor', label: 'عامل القمة', term: 'Crest Factor', outcome: 'O4', depth: 'core', needs: ['peak-p2p-rms'] },
  { id: 'bearing-severity-chart', label: 'مخطط شدة اهتزاز المحمل', term: 'Bearing Vibration Severity Chart', outcome: 'O4', depth: 'core', needs: ['crest-factor', 'fault-severity'] },
  { id: 'unbalance-signature', label: 'بصمة عدم الاتزان', term: 'Unbalance Signature', outcome: 'O5', depth: 'core', needs: ['orders-1x-2x', 'measurement-direction'] },
  { id: 'misalignment-signature', label: 'بصمة عدم الاصطفاف', term: 'Misalignment Signature', outcome: 'O5', depth: 'core', needs: ['orders-1x-2x', 'measurement-direction', 'phase'] },
  { id: 'looseness-signature', label: 'بصمة الرخاوة الميكانيكية', term: 'Looseness Signature', outcome: 'O5', depth: 'support', needs: ['harmonics', 'looseness-cause'] },
  { id: 'bearing-signature', label: 'بصمة عيب المحمل', term: 'Bearing Defect Signature', outcome: 'O5', depth: 'support', needs: ['bearing-frequencies', 'sidebands', 'crest-factor'] },
  { id: 'cavitation-signature', label: 'بصمة التكهّف', term: 'Cavitation Signature', outcome: 'O5', depth: 'support', needs: ['noise-floor'] },
  { id: 'envelope-detection', label: 'كشف المغلّف', term: 'Envelope Detection', outcome: 'O5', depth: 'support', needs: ['bearing-signature'] },
  { id: 'diagnosis-method', label: 'منهجية التشخيص', term: 'Diagnostic Method', outcome: 'O5', depth: 'support', needs: ['unbalance-signature', 'misalignment-signature', 'looseness-signature'] },

  // ═══════════════ u5 — الاتزان ═══════════════

  // u5l1 — القوى والقوة الطاردة
  { id: 'static-force', label: 'القوى الاستاتيكية', term: 'Static Forces', outcome: 'O6', depth: 'aware', needs: [] },
  { id: 'dynamic-force', label: 'القوى الديناميكية', term: 'Dynamic Forces', outcome: 'O6', depth: 'support', needs: ['static-force'] },
  { id: 'centrifugal-force', label: 'القوة الطاردة المركزية', term: 'Centrifugal Force F = M ω² r', outcome: 'O6', depth: 'core', needs: ['dynamic-force', 'angular-frequency'] },
  { id: 'unbalance-def', label: 'عدم الاتزان', term: 'Unbalance', outcome: 'O6', depth: 'support', needs: ['centrifugal-force', 'unbalance-signature'] },

  // u5l2 — الاستاتيكي والديناميكي وقرار المستويات
  { id: 'static-dynamic-balance', label: 'الاتزان الاستاتيكي والديناميكي', term: 'Static & Dynamic Balance', outcome: 'O6', depth: 'core', needs: ['unbalance-def'] },
  { id: 'planes-decision', label: 'قرار عدد مستويات الاتزان', term: 'Number of Correction Planes', outcome: 'O6', depth: 'support', needs: ['static-dynamic-balance'] },
  { id: 'iso-1940', label: 'درجات جودة الاتزان', term: 'ISO 1940 Balance Quality', outcome: 'O6', depth: 'aware', needs: ['unbalance-def'] },

  // u5l3 — الاتزان في مستوى وفي مستويات
  { id: 'one-plane-balancing', label: 'الاتزان في مستوى واحد', term: 'Single-Plane Balancing', outcome: 'O6', depth: 'core', needs: ['static-dynamic-balance', 'phase'] },
  { id: 'vector-polygon', label: 'مضلّع القوى المتجهي', term: 'Vector Polygon', outcome: 'O6', depth: 'support', needs: ['one-plane-balancing', 'centrifugal-force'] },
  { id: 'trial-mass', label: 'كتلة الاختبار', term: 'Trial Mass', outcome: 'O6', depth: 'support', needs: ['one-plane-balancing'] },
  { id: 'influence-coefficient', label: 'معامل التأثير', term: 'Influence Coefficient', outcome: 'O6', depth: 'core', needs: ['trial-mass', 'phase'] },
  { id: 'two-plane-balancing', label: 'الاتزان بمستويين', term: 'Two-Plane Balancing', outcome: 'O6', depth: 'core', needs: ['influence-coefficient', 'planes-decision'] },
  { id: 'residual-check', label: 'التحقّق من الاتزان المتبقّي', term: 'Residual Check', outcome: 'O6', depth: 'support', needs: ['one-plane-balancing', 'iso-10816'] },

  // u5l4 — الترددية والتوربينات
  { id: 'reciprocating-balance', label: 'اتزان المكائن الترددية', term: 'Reciprocating Machine Balance', outcome: 'O6', depth: 'core', needs: ['static-dynamic-balance', 'orders-1x-2x'] },
  { id: 'primary-force', label: 'قوة القصور الابتدائية', term: 'Primary Inertia Force', outcome: 'O6', depth: 'support', needs: ['reciprocating-balance', 'centrifugal-force'] },
  { id: 'secondary-force', label: 'قوة القصور الثانوية', term: 'Secondary Inertia Force', outcome: 'O6', depth: 'support', needs: ['primary-force'] },
  { id: 'inertia-moment', label: 'عزوم قوى القصور', term: 'Inertia Moments', outcome: 'O6', depth: 'support', needs: ['primary-force'] },
  { id: 'turbine-balance', label: 'اتزان التوربينات البخارية', term: 'Steam Turbine Balancing', outcome: 'O6', depth: 'support', needs: ['one-plane-balancing', 'iso-10816'] },
];
