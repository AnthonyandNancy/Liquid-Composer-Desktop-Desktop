import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url);
const TARGETS = [
  'src/components/**/*.tsx',
  'src/components/**/*.ts',
  'src/store/*.ts',
  'src/engine/IconDocument.ts',
  'src/engine/platforms.ts',
  'src/agent/api.ts',
  'index.html',
  'public/manifest.webmanifest',
  'electron/main.cjs',
];

// 只放行产品名、格式名与技术值；不要使用 /aria-/、/className/ 这类宽泛规则，
// 否则会掩盖真正的英文界面文案。
const ALLOW = [
  /Liquid Composer/,
  /Liquid Glass/,
  /Icon Composer/,
  /SF Symbols/,
  /\bPNG\b/,
  /\bJPEG\b/,
  /\bZIP\b/,
  /\bWebGL2\b/,
  /\bTTF\b/,
  /\bOTF\b/,
  /\bE900\b/,
  /image\//,
  /^[\d\s.,:;%×°·–—/+=()[\]{}<>#$&*_|\'"`~-]+$/,
];

// 明确保留为数据/技术名的行，逐文件放行。
const FILE_ALLOW = new Map([
  ['src/engine/IconRenderer.ts', [/RENDITION_NAMES/, /^\s*(default|dark|clear|clearDark|tintedLight|tintedDark): /]],
  ['src/engine/IconDocument.ts', [/Radial Background/]],
  ['src/engine/platforms.ts', [/id: 'watchos'/, /previewClass/]],
]);

const files = TARGETS.flatMap((pattern) => globSync(pattern, { cwd: ROOT }));
const findings = [];

for (const file of files) {
  const fileAllow = FILE_ALLOW.get(file) ?? [];
  const source = readFileSync(new URL(file, ROOT), 'utf8');
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    // 已中文化的行直接跳过；白名单只放行不含中文的技术行。
    if (/[\u4e00-\u9fff]/.test(line)) return;
    if (ALLOW.some((re) => re.test(line))) return;
    if (fileAllow.some((re) => re.test(line))) return;

    const checks = [
      />\s*[A-Za-z][^<>{]*</,
      /\b(aria-label|aria-roledescription|title|placeholder|alt)\s*=\s*["'`][A-Za-z]/,
      /\b(window\.)?(alert|confirm|prompt)\(\s*["'`][A-Za-z]/,
      /\.(label|description|message)\s*[:=]\s*["'`][A-Za-z]/,
    ];

    if (checks.some((re) => re.test(line))) {
      findings.push(`${file}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (findings.length) {
  console.error(`发现 ${findings.length} 处疑似英文前台文案：\n`);
  console.error(findings.join('\n'));
  process.exitCode = 1;
} else {
  console.log('i18n 审计通过：未发现已知路径中的英文前台文案。');
}
