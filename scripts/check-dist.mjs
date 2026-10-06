// ビルド結果の点検。一つでも満たさなければ公開しない（設計書 10-3）
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const errors = [];
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

for (const f of walk('dist')) {
  if (f.endsWith('.html') && !readFileSync(f, 'utf8').includes('公式サイトではありません')) {
    errors.push(`「公式サイトではありません」がない: ${f}`);
  }
  if (/下書き|メモ|draft/i.test(f)) errors.push(`下書きらしいファイルがある: ${f}`);
  if (/署名簿/.test(f)) errors.push(`署名簿らしいファイルがある: ${f}`);
}
for (const f of walk('src')) {
  const s = readFileSync(f, 'utf8');
  if (/innerHTML/.test(s)) errors.push(`innerHTML を使っている: ${f}`);
  const setHtml = s.match(/set:html=\{[^}]*\}/g) ?? [];
  if (setHtml.some((m) => !m.includes('JSON.stringify(jsonld)'))) errors.push(`set:html を使っている: ${f}`);
}
for (const d of ['src/pages/data', 'src/pages/preview']) {
  try { statSync(d); errors.push(`予約済みのパスにページがある: ${d}`); } catch {}
}

if (errors.length) {
  console.error('点検で止めました:\n' + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log('点検OK');
