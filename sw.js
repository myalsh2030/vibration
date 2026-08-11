// عامل الخدمة: كاش كامل للعمل دون اتصال
const CACHE_VERSION = 'vb-v4';

const ASSETS = [
  './',
  './css/main.css',
  './data/concepts.js',
  './data/course.js',
  './data/glossary-figs.js',
  './data/glossary.js',
  './data/predict.js',
  './data/quizzes.js',
  './data/unit1.js',
  './data/unit2.js',
  './data/unit3.js',
  './data/unit4.js',
  './data/unit5.js',
  './fonts/cairo-arabic.woff2',
  './fonts/cairo-latin.woff2',
  './icons.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './js/app.js',
  './js/game.js',
  './js/personalize.js',
  './js/quiz.js',
  './js/recall.js',
  './js/screens/diag.js',
  './js/screens/glossary.js',
  './js/screens/home.js',
  './js/screens/labs.js',
  './js/screens/lesson.js',
  './js/screens/me.js',
  './js/screens/review.js',
  './js/screens/unit.js',
  './js/screens/welcome.js',
  './js/simhost.js',
  './js/sims/amplitude-three.js',
  './js/sims/analyzer.js',
  './js/sims/balance-polygon.js',
  './js/sims/balancekit.js',
  './js/sims/dof.js',
  './js/sims/drawkit.js',
  './js/sims/dva-triangle.js',
  './js/sims/example.js',
  './js/sims/fft-lab.js',
  './js/sims/free-forced.js',
  './js/sims/iso-judge.js',
  './js/sims/labkit.js',
  './js/sims/machinedraw.js',
  './js/sims/machines.js',
  './js/sims/mounting.js',
  './js/sims/polarplot.js',
  './js/sims/recip-forces.js',
  './js/sims/registry.js',
  './js/sims/resonance.js',
  './js/sims/scope.js',
  './js/sims/sensors.js',
  './js/sims/simkit.js',
  './js/sims/spectrum-read.js',
  './js/sims/vibkit.js',
  './js/sims/vibstd.js',
  './js/sims/wave-anatomy.js',
  './js/store.js',
  './js/ui.js',
  './manifest.webmanifest',
];

// تحديث ذري: skipWaiting بعد اكتمال التخزين كاملًا، والتطبيق يعيد التحميل
// مرة واحدة عند تغيّر المتحكم (controllerchange) — فلا تختلط نسختان أبدًا.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// شبكة أولًا للتنقل (لالتقاط التحديثات)، كاش أولًا للأصول
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
