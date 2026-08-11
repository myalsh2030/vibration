// مزامنة قائمة ASSETS في sw.js مع ما هو موجود فعلًا على القرص.
// كُتب لأن نسيان ملف واحد في القائمة يعني أن المتدرب يفتح المنصة دون اتصال فتنكسر عليه
// شاشة واحدة بلا سبب ظاهر — وهو عطل يصعب تشخيصه ويسهل منعه.
//
// الاستعمال:  node tools/sync-assets.mjs          (فحص فقط — يُرجع 1 إن وُجد فرق)
//             node tools/sync-assets.mjs --write  (يكتب القائمة المصحّحة ويرفع رقم الكاش)
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath لا غنى عنه: مسار المشروع فيه مسافات، و‎URL.pathname‎ يعيدها ‎%20‎
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SW = join(ROOT, 'sw.js');
const SKIP_DIRS = new Set(['tools', 'node_modules', '.git', 'pages', 'content']);
const KEEP_EXT = new Set(['.html', '.css', '.js', '.svg', '.webmanifest', '.woff2', '.woff', '.png', '.ico', '.json']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(ROOT, full).split(sep).join('/');
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, out);
    } else {
      if (name === 'sw.js' || name === 'package.json' || name === 'package-lock.json') continue;
      if (name.startsWith('.')) continue;
      const ext = name.slice(name.lastIndexOf('.'));
      if (!KEEP_EXT.has(ext)) continue;
      out.push(rel);
    }
  }
  return out;
}

const onDisk = walk(ROOT).sort();
const src = readFileSync(SW, 'utf8');

const m = src.match(/const\s+ASSETS\s*=\s*\[([\s\S]*?)\]/);
if (!m) { console.error('❌ لم أجد مصفوفة ASSETS في sw.js'); process.exit(2); }
const listed = [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1])
  .map(p => p.replace(/^\.\//, '')).filter(p => p && p !== './');

const norm = p => p === './' || p === '.' ? 'index.html' : p.replace(/^\.\//, '');
const listedSet = new Set(listed.map(norm));
const missing = onDisk.filter(p => !listedSet.has(p));
const stale = listed.map(norm).filter(p => p !== 'index.html' && !onDisk.includes(p));

console.log(`ملفات على القرص: ${onDisk.length}  ·  مُدرَجة في sw.js: ${listedSet.size}`);
if (missing.length) console.log(`\n⚠️ غير مُدرَجة (${missing.length}):\n  ` + missing.join('\n  '));
if (stale.length) console.log(`\n⚠️ مُدرَجة وغير موجودة (${stale.length}):\n  ` + stale.join('\n  '));

if (!process.argv.includes('--write')) {
  if (!missing.length && !stale.length) { console.log('\n✅ القائمة مطابقة'); process.exit(0); }
  console.log('\nشغّل مع ‎--write‎ للإصلاح.');
  process.exit(1);
}

const body = ['  \'./\',', ...onDisk.filter(p => p !== 'index.html').map(p => `  './${p}',`)].join('\n');
let out = src.replace(/const\s+ASSETS\s*=\s*\[[\s\S]*?\]/, `const ASSETS = [\n${body}\n]`);
// رفع رقم الكاش إلزامي مع أي تغيير في القائمة، وإلا خدم العامل النسخة القديمة
out = out.replace(/(CACHE_VERSION\s*=\s*['"][a-z-]*?)(\d+)(['"])/, (_, a, n, z) => a + (Number(n) + 1) + z);
writeFileSync(SW, out, 'utf8');
const v = out.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
console.log(`\n✅ كُتبت ${onDisk.length} مسارًا، ورقم الكاش الآن: ${v?.[1]}`);
