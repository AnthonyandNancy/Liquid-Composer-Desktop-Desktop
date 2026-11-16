# Liquid Composer 前台文本中文化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Liquid Composer 所有前台英文文本、辅助文本、原生弹窗、应用元数据与 README 改为简体中文，同时保持持久化值、导出格式和渲染逻辑不变。

**Architecture:** 新建 `src/i18n/`，以单一中文消息字典和参数化 `t()` 作为文案事实源；组件只保留显示键，不翻译数据值。底层错误保持原文，UI 层通过映射生成中文提示；导出 ZIP 路径等兼容性字符串保持英文。

**Tech Stack:** React 19、TypeScript 7、Vite 8、Tailwind CSS 4、Nanostores、Electron、Playwright（仅用于运行时检查）

**Spec:** `docs/superpowers/specs/2026-11-16-frontend-chinese-localization-design.md`

## Global Constraints

- 目标语言：简体中文（`zh-CN`）。
- 品牌名 `Liquid Composer`、材质名 `Liquid Glass`、产品名 `Icon Composer`、`SF Symbols`、`PNG`、`JPEG`、`ZIP` 保持原文。
- 不翻译联合类型值、存储键、CSS 类名、`icon.json` 字段、剪贴板协议前缀。
- `RENDITION_NAMES` 继续用于 ZIP 目录名，保持英文。
- `PlatformProfile.id`、`.previewClass` 保持英文；只翻译显示用的 `label` / `shortLabel`。
- 所有 `aria-label`、`title`、`placeholder`、`aria-roledescription` 必须中文化。
- 自动生成的文档名、图层名、组名、形状名必须中文化。
- 不得改变 `src/engine/` 的渲染算法与 WebGL 行为。
- 项目当前无 Git 仓库；每个任务末尾的“提交”步骤在建立 Git 仓库后执行。若仍未建立，则用 `cp -r` 备份并在任务记录中注明。
- 所有命令在 `Liquid-Composer-Desktop-Desktop/` 目录执行。

---

### Task 1: 建立 i18n 基础设施

**Files:**
- Create: `src/i18n/messages.ts`
- Create: `src/i18n/index.ts`
- Create: `scripts/i18n-audit.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces:
  - `export const LOCALE = 'zh-CN'`
  - `export function t(key: string, params?: Record<string, string | number>): string`
  - `export type MessageKey`
  - `export const zhCN`（消息字典）
- Consumes: 无。

- [ ] **Step 1: 创建消息字典骨架**

创建 `src/i18n/messages.ts`，先放入本计划各任务会使用的全部键。此步骤必须一次性建立完整键集，避免后续任务反复改字典结构。

```ts
export const zhCN = {
  app: {
    title: 'Liquid Composer：浏览器中的 Liquid Glass 应用图标设计工具',
    description:
      '在浏览器中设计 Liquid Glass 应用图标，支持实时 WebGL 渲染、图层、外观变体、平台预览以及 PNG 或 .icon 导出。',
    shortDescription: '在浏览器中设计 Liquid Glass 应用图标。',
  },
  common: {
    dragToChange: '拖动以更改',
    slider: '滑块',
    numberInput: '数值输入',
    value: '{label}数值',
    on: '开',
    off: '关',
    none: '无',
    all: '全部',
    cancel: '取消',
    close: '关闭',
    reset: '重置',
    delete: '删除',
    remove: '移除',
    add: '添加',
    edit: '编辑',
    copy: '复制',
    paste: '粘贴',
    cut: '剪切',
    duplicate: '复制',
    rename: '重命名',
    open: '打开',
    export: '导出',
    import: '导入',
    apply: '应用',
    previous: '上一页',
    next: '下一页',
    noMatches: '没有匹配项',
    light: '浅色',
    dark: '深色',
    color: '颜色',
    position: '位置',
    scale: '缩放',
    opacity: '不透明度',
    position: '位置',
    fill: '填充',
    style: '样式',
    direction: '方向',
    intensity: '强度',
    preset: '预设',
    customColor: '自定义颜色',
    hexColor: '{label}十六进制颜色',
    removeStop: '移除色标',
    addGradientStop: '添加渐变停靠点（{count}/{max}）',
  },
  tooltip: {
    undo: '撤销',
    redo: '重做',
  },
  toolbar: {
    documentName: '文档名称',
    renameDocument: '重命名文档：{name}',
    clickToRename: '点击重命名',
    unsavedChanges: '未保存的更改',
    background: '背景',
    backgroundPopover: '背景颜色',
    lightAngle: '光照角度',
    lightAngleValue: '光照角度：{angle} 度',
    zoom: '缩放',
    zoomValue: '缩放：{zoom}%',
    platformPreview: '平台预览与覆盖',
    platformMenu: '平台预览',
    platformVariants: '平台变体',
    platformCaption: '共享素材 · 独立位置与缩放',
    exportPng: '导出 PNG · 1024 × 1024',
    moreExportOptions: '更多导出选项',
    export: '导出',
    copyPng: '复制 PNG',
    allAppearances: '所有外观',
    noBackground: 'PNG · 无背景',
    applePlatformSet: 'Apple 平台图集',
    exportIcon: '导出 .icon',
    openIcon: '打开 .icon…',
    zipFourPngs: 'ZIP · 4 个 PNG',
    zip: 'ZIP',
  },
  light: {
    top: '顶部',
    topRight: '右上',
    right: '右侧',
    bottomRight: '右下',
    bottom: '底部',
    bottomLeft: '左下',
    left: '左侧',
    topLeft: '左上',
  },
  platform: {
    iosMacos: 'iOS + macOS',
    iosMac: 'iOS + Mac',
    appleWatch: 'Apple Watch',
    watch: 'Watch',
  },
  layers: {
    title: '图层',
    ariaLabel: '图层',
    importArtwork: '导入素材…',
    dropHint: '拖入 SVG、PNG 或 JPEG',
    importTitle: '导入 SVG、PNG 或 JPEG',
    resetAndAutoSave: '重置与自动保存',
    resetDocument: '重置文档…',
    resetConfirm: '重置文档及所有已保存的数据？此操作无法撤销。',
    autoSave: '自动保存',
    keepAfterReload: '重新加载后保留此图标',
    addGroup: '添加组',
    addLayer: '添加图层',
    noLayers: '没有图层',
    canvas: '画布',
    expand: '展开 {name}',
    collapse: '折叠 {name}',
    layerName: '图层名称',
    doubleClickRename: '双击重命名',
    duplicateLayer: '复制图层',
    duplicateNamed: '复制 {name}',
    hideLayer: '隐藏图层',
    hideNamed: '隐藏 {name}',
    showLayer: '显示图层',
    showNamed: '显示 {name}',
    removeLayer: '删除图层',
    removeNamed: '删除 {name}',
    actions: '{name} 操作',
    menu: {
      rename: '重命名',
      hide: '隐藏',
      show: '显示',
      cut: '剪切',
      copy: '复制',
      paste: '粘贴',
      duplicate: '复制',
      copyStyle: '复制样式',
      pasteStyle: '粘贴样式',
      bringToFront: '移到最前',
      bringForward: '上移一层',
      sendBackward: '下移一层',
      sendToBack: '移到最后',
      selectParent: '选择父级',
      delete: '删除',
    },
  },
  shapeLibrary: {
    trigger: '基础形状与吸附',
    dialog: '形状库',
    heading: '形状库',
    basicShapes: '基础形状',
    snapToCenter: '吸附到中心',
    customFont: '自定义符号字体',
    bundledSymbols: '自定义 SF Symbols',
    bundledDescription:
      '全部 6,404 个已映射字符均可使用。可按码位搜索或浏览字形页面。',
    customDescription: '所选字体仅在本地使用；所选字形将转换为图像图层。',
    useAnotherFont: '使用其他字体',
    fontLoadError: '无法加载该字体。请选择有效的 TTF 或 OTF 符号字体。',
    bundledFontError: '无法加载内置的自定义 SF Symbols 字体。',
    glyphMissing: '该字体在 U+{codepoint} 处没有可见字形。',
    searchPlaceholder: '按码位查找，例如 E900',
    searchAria: '搜索 SF Symbols 字形',
    glyphGrid: 'SF Symbols 字形',
    addGlyph: '添加字形 U+{codepoint}',
    range: '{start}–{end}，共 {total} 个',
    page: '第 {page}/{total} 页',
    shapes: {
      rectangle: '矩形',
      circle: '圆形',
      triangle: '三角形',
      square: '方形',
      diamond: '菱形',
      hexagon: '六边形',
      star: '星形',
      plus: '加号',
      line: '直线',
    },
  },
  inspector: {
    title: '检查器',
    selectLayer: '选择一个图层以检查其属性',
    canvas: '画布',
    color: '颜色',
    appearanceNote:
      '颜色仅应用于默认外观。深色、单色、透明和着色模式使用各自的外观背景与处理方式。',
    composition: '构图',
    visible: '可见',
    layerVisibility: '图层可见性',
    name: '名称',
    position: '位置',
    scale: '缩放',
    positionX: '位置 X',
    positionY: '位置 Y',
    group: '组',
    layerCount: '{count} 个图层',
    blend: '混合',
    groupBlendMode: '组混合模式',
    layerBlendMode: '图层混合模式',
    fillType: '填充类型',
    fillColor: '填充颜色',
    fillHex: '填充十六进制颜色',
    gradientStyle: '渐变样式',
    gradientColor: '渐变颜色 {index}',
    gradientHexColor: '渐变十六进制颜色 {index}',
    blendModes: {
      normal: '正常',
      multiply: '正片叠底',
      screen: '滤色',
      overlay: '叠加',
      darken: '变暗',
      lighten: '变亮',
      colorDodge: '颜色减淡',
      colorBurn: '颜色加深',
      hardLight: '强光',
      softLight: '柔光',
      difference: '差值',
      exclusion: '排除',
      plusLighter: '线性减淡（添加）',
    },
    fillTypes: {
      none: '无',
      solid: '纯色',
      gradient: '渐变',
    },
    gradientTypes: {
      linear: '线性',
      radial: '径向',
    },
  },
  glass: {
    title: 'Liquid Glass',
    allLayers: '所有图层',
    thisLayer: '当前图层',
    applyChangesTo: '将更改应用于',
    specular: '高光',
    specularOptions: {
      off: '关闭',
      automatic: '自动',
      inside: '内部',
      outside: '外部',
    },
    refraction: '折射',
    refractionPadAria: '折射强度 {strength}%，高度 {height}%',
    refractionPadHint: '拖动以设置强度与高度。双击或按 Home 重置。',
    twoDSlider: '二维滑块',
    refractionStrength: '折射强度',
    refractionHeight: '折射高度',
    strength: '强度',
    height: '高度',
    blur: '模糊',
    translucency: '半透明',
    gradientTranslucency: '渐变半透明',
    angle: '角度 · {value}°',
    startPosition: '起始位置 · {value}%',
    endPosition: '结束位置 · {value}%',
    startOpacity: '起始不透明度 · {value}%',
    endOpacity: '结束不透明度 · {value}%',
    gradientOpacityNote: '不透明度控制素材在渐变两端各自的可见程度。',
    shadow: '阴影',
    advanced: '高级',
    resetAdvanced: '重置高级玻璃设置',
    resetAdvancedTitle: '重置高级设置',
    lens: '镜头',
    lensDescription: '玻璃折射下方图层时产生的颜色分离。',
    dispersion: '色散',
    highlights: '高光',
    highlightsDescription: '玻璃边缘的亮边与暗边。',
    surface: '表面',
    surfaceDescription: '玻璃内部的柔化程度。',
    lightIntensity: '光照强度',
    top: '顶部',
    bottom: '底部',
    edgeDefinition: '边缘清晰度',
    frostiness: '磨砂感',
  },
  background: {
    background: '背景',
    gradientStyle: '渐变样式',
    solid: '纯色',
    gradient: '渐变',
    presets: '预设',
    hue: '色相',
    tint: '着色量',
    brightness: '亮度',
    backgroundLight: '方向性背景光',
    direction: '方向',
    lightDirection: '光照方向',
    intensity: '强度',
    lightIntensity: '光照强度',
    orientation: '渐变方向',
    gradientStopColor: '渐变停靠点 {index} 颜色',
    gradientStopHex: '渐变停靠点 {index} 十六进制颜色',
    removeGradientStop: '移除渐变停靠点 {index}',
    gradientStopPosition: '渐变停靠点 {index} 位置',
    colors: {
      red: '红色',
      orange: '橙色',
      yellow: '黄色',
      green: '绿色',
      mint: '薄荷色',
      teal: '蓝绿色',
      cyan: '青色',
      blue: '蓝色',
      indigo: '靛蓝色',
      purple: '紫色',
      pink: '粉色',
      brown: '棕色',
      white: '白色',
      nearBlack: '近黑色',
      gray: '灰色',
    },
    presetsLabels: {
      systemLight: '系统浅色',
      systemDark: '系统深色',
    },
  },
  colorPicker: {
    standard: '标准',
    recent: '最近',
    pickFromScreen: '从屏幕取色',
    noRecent: '没有最近使用的颜色',
    systemColors: '系统颜色',
    recentColors: '最近使用的颜色',
  },
  appearance: {
    groupAria: '图标外观',
    default: '默认',
    dark: '深色',
    clear: '透明',
    tinted: '着色',
    light: '浅色',
    tintSliders: '着色滑块',
    hue: '色相',
    tint: '着色量',
    brightness: '亮度',
    tintAria: '着色{label}',
  },
  canvas: {
    grid: '网格',
    webglUnavailable: 'WebGL2 不可用：{detail}。Liquid Glass 将在无折射模式下渲染。',
    unknownError: '未知错误',
    dropToAddLayer: '拖放图像以添加图层',
    gridGroup: '图标网格',
    toggleGrid: '切换图标网格',
    gridStyle: '网格样式',
    gridStyleValue: '网格样式：{style}',
  },
  panels: {
    ariaLabel: '面板',
    canvas: '画布',
    layers: '图层',
    inspector: '检查器',
  },
  persistence: {
    untitled: '未命名',
    layerDefault: '图层 {index}',
    groupDefault: '组 {index}',
    copySuffix: '{name} 副本',
  },
  importExport: {
    importError: '导入失败：{detail}',
    invalidIconLink: '此链接不包含有效的图标。{detail}',
    replaceConfirm: '要用此链接中的图标替换当前图标吗？',
    noIconJson: '压缩包中未找到 icon.json。',
    invalidIconJson: 'icon.json 不是有效的 Icon Composer 文档。',
    newerFeatures: '该文档使用了较新版本 Icon Composer 的功能，当前版本无法打开。',
    encodeRadialFill: '无法编码径向填充素材。',
    createRadialFillCanvas: '无法为径向填充素材创建画布。',
    encodeRadialBackground: '无法编码径向背景素材。',
    exportFailed: '图像导出失败：image/{format}',
    webgl2NotSupported: '不支持 WebGL2',
  },
} as const;
```

- [ ] **Step 2: 实现 `t()` 与类型**

创建 `src/i18n/index.ts`：

```ts
import { zhCN } from './messages';

export const LOCALE = 'zh-CN';

type ParamValue = string | number;
type Params = Record<string, ParamValue>;

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<typeof zhCN>;

function lookup(key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => {
      if (node && typeof node === 'object' && part in node) {
        return (node as Record<string, unknown>)[part];
      }
      return undefined;
    }, zhCN);

  return typeof value === 'string' ? value : undefined;
}

export function t(key: MessageKey, params?: Params): string {
  const template = lookup(key);
  if (!template) {
    if (import.meta.env.DEV) console.warn(`[i18n] 缺少文案键：${key}`);
    return key;
  }

  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params && name in params ? String(params[name]) : `{${name}}`,
  );
}

export function setDocumentLanguage(): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = LOCALE;
  }
}
```

- [ ] **Step 3: 在入口设置语言并验证类型**

修改 `src/main.tsx`，在 `createRoot` 前调用：

```ts
import { setDocumentLanguage } from './i18n';

setDocumentLanguage();
```

运行：

```bash
npx tsc --noEmit
```

预期：通过，无 `MessageKey` 相关错误。

- [ ] **Step 4: 添加上下文复核**

运行：

```bash
rg -n "from ['\"](\.\./)+i18n|from ['\"]@/i18n" src
```

预期：至少 `src/main.tsx` 命中。

- [ ] **Step 5: 创建审计脚本**

创建 `scripts/i18n-audit.mjs`：

```js
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
```

> 注：`fs.globSync` 需要 Node 22+。项目 engines 允许 Node 24；若执行环境为 Node 20，改为 `fast-glob` 或手写递归 `readdirSync`，计划执行时以实际 Node 版本为准。

- [ ] **Step 6: 添加 npm 脚本**

修改 `package.json` 的 `scripts`：

```json
"i18n:audit": "node scripts/i18n-audit.mjs"
```

- [ ] **Step 7: 运行审计基线**

```bash
npm run i18n:audit
```

预期：失败，并列出当前英文文案。记录数量作为迁移基线。

- [ ] **Step 8: 提交**

```bash
git add src/i18n scripts/i18n-audit.mjs package.json src/main.tsx
git commit -m "feat(i18n): add Chinese message dictionary and audit script"
```

若无 Git：`cp -r . ../liquid-composer-baseline-task1` 并在任务记录中注明。

---

### Task 2: 中文化通用 UI 控件

**Files:**
- Modify: `src/components/ui/ColorPicker.tsx`
- Modify: `src/components/ui/NumberInput.tsx`
- Modify: `src/components/ui/Slider.tsx`
- Modify: `src/components/ui/Toggle.tsx`
- Modify: `src/components/ui/Select.tsx`

**Interfaces:**
- Consumes: `t`、`MessageKey`（Task 1）
- Produces: 控件内部辅助文案全部中文；调用方仍传中文 `label` / `ariaLabel`。

- [ ] **Step 1: 修改 `ColorPicker`**

将 `SYSTEM_COLORS` 的 `label` 改为消息键：

```ts
const SYSTEM_COLORS = [
  { hex: '#FF383C', label: 'background.colors.red' },
  { hex: '#FF8D28', label: 'background.colors.orange' },
  { hex: '#FFCC00', label: 'background.colors.yellow' },
  { hex: '#34C759', label: 'background.colors.green' },
  { hex: '#00C8B3', label: 'background.colors.mint' },
  { hex: '#00C3D0', label: 'background.colors.teal' },
  { hex: '#00C0E8', label: 'background.colors.cyan' },
  { hex: '#0088FF', label: 'background.colors.blue' },
  { hex: '#6155F5', label: 'background.colors.indigo' },
  { hex: '#CB30E0', label: 'background.colors.purple' },
  { hex: '#FF2D55', label: 'background.colors.pink' },
  { hex: '#AC7F5E', label: 'background.colors.brown' },
  { hex: '#8E8E93', label: 'background.colors.gray' },
] as const;
```

渲染处：

```tsx
const swatches =
  tab === 'standard'
    ? SYSTEM_COLORS.map((color) => ({
        hex: color.hex,
        label: t(color.label),
      }))
    : recent.map((hex) => ({ hex, label: hex.toUpperCase() }));
```

替换：

```tsx
<button type="button" onClick={pickScreenColor}>
  {t('colorPicker.pickFromScreen')}
</button>
...
aria-label={t(tab === 'standard' ? 'colorPicker.systemColors' : 'colorPicker.recentColors')}
...
<span className="color-swatches-empty">{t('colorPicker.noRecent')}</span>
...
<button ...>{t('colorPicker.standard')}</button>
<button ...>{t('colorPicker.recent')}</button>
```

同时把 `${label} hex` 改为：

```tsx
aria-label={t('common.hexColor', { label })}
```

- [ ] **Step 2: 修改 `NumberInput`**

`title="Drag to change"` 改为：

```tsx
title={t('common.dragToChange')}
```

两处都要改。

`aria-label` 回退：

```tsx
aria-label={ariaLabel ?? label ?? t('common.numberInput')}
```

并在字典补：

```ts
numberInput: '数值输入',
```

- [ ] **Step 3: 修改 `Slider`**

`aria-label={`${ariaLabel ?? label ?? "Slider"} value`}` 改为：

```tsx
aria-label={t('common.value', {
  label: ariaLabel ?? label ?? t('common.slider'),
})}
```

- [ ] **Step 4: 修改 `Toggle` 与 `Select`**

`Toggle` 无内置文案，仅确保 `label` / `ariaLabel` 由调用方中文提供；不改逻辑。

`Select` 无内置文案；检查 `findByText` 仍按中文 `label` 匹配，不修改。

- [ ] **Step 5: 类型检查**

```bash
npx tsc --noEmit
```

预期：通过。若 `t(color.label)` 因字面量联合类型报错，将 `SYSTEM_COLORS` 标注为：

```ts
const SYSTEM_COLORS: { hex: string; label: MessageKey }[] = [...]
```

- [ ] **Step 6: 审计**

```bash
npm run i18n:audit
```

预期：`src/components/ui/` 下不再出现 `Drag to change`、`Standard`、`Recent`、`No recent colors`、`Pick color from screen`。

- [ ] **Step 7: 提交**

```bash
git add src/components/ui src/i18n/messages.ts
git commit -m "feat(i18n): localize shared UI controls"
```

---

### Task 3: 中文化应用布局、底部外观栏与移动端标签

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`
- Modify: `src/components/layout/LeftPanel.tsx`
- Modify: `src/components/layout/BottomBar.tsx`

**Interfaces:**
- Consumes: `t`（Task 1）
- Produces: 面板导航、图层侧栏标题、外观模式与着色滑块全部中文。

- [ ] **Step 1: 修改 `AppLayout`**

```tsx
const PANES: { value: MobilePane; labelKey: MessageKey; icon: Icon }[] = [
  { value: 'canvas', labelKey: 'panels.canvas', icon: Square },
  { value: 'layers', labelKey: 'panels.layers', icon: Stack },
  { value: 'inspector', labelKey: 'panels.inspector', icon: SlidersHorizontal },
];
```

渲染：

```tsx
<nav className="editor-tabbar" aria-label={t('panels.ariaLabel')}>
  ...
  {PANES.map(({ value, labelKey, icon: PaneIcon }) => (
    <button ...>
      ...
      {t(labelKey)}
    </button>
  ))}
</nav>
```

- [ ] **Step 2: 修改 `LeftPanel`**

```tsx
<aside aria-label={t('layers.title')} ...>
```

- [ ] **Step 3: 修改 `BottomBar` 模式表**

```tsx
const MODES: { value: AppearanceMode; labelKey: MessageKey }[] = [
  { value: 'default', labelKey: 'appearance.default' },
  { value: 'dark', labelKey: 'appearance.dark' },
  { value: 'clear', labelKey: 'appearance.clear' },
  { value: 'tintedLight', labelKey: 'appearance.tinted' },
];
```

渲染 `{t(m.labelKey)}`。

- [ ] **Step 4: 修改 `BottomBar` 其余文本**

- `aria-label="Icon appearance"` → `t('appearance.groupAria')`
- `Light` → `t('appearance.light')`
- `Dark` → `t('appearance.dark')`
- `aria-label="Tint color sliders"` → `t('appearance.tintSliders')`
- `label="Hue"` → `t('appearance.hue')`
- `label="Tint"` → `t('appearance.tint')`
- `label="Brightness"` → `t('appearance.brightness')`
- `aria-label={`Tint ${label}`}` → `t('appearance.tintAria', { label })`

- [ ] **Step 5: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：`src/components/layout/AppLayout.tsx`、`LeftPanel.tsx`、`BottomBar.tsx` 无英文 UI 文案；TypeScript 通过。

- [ ] **Step 6: 浏览器检查**

```bash
npm run dev
```

打开 `http://localhost:5173`，检查底部栏与移动端宽度（<768px）标签：

- 默认 / 深色 / 透明 / 着色
- 浅色 / 深色
- 色相 / 着色量 / 亮度
- 画布 / 图层 / 检查器

- [ ] **Step 7: 提交**

```bash
git add src/components/layout/AppLayout.tsx src/components/layout/LeftPanel.tsx src/components/layout/BottomBar.tsx
git commit -m "feat(i18n): localize layout and appearance bar"
```

---

### Task 4: 中文化顶部工具栏

**Files:**
- Modify: `src/components/layout/TopToolbar.tsx`
- Modify: `src/store/uiStore.ts`
- Modify: `src/engine/platforms.ts`

**Interfaces:**
- Consumes: `t`、`MessageKey`
- Produces:
  - `LIGHT_ANGLE_KEYS: Record<number, MessageKey>`
  - `platformLabelKey(id: IconPlatform): MessageKey`
  - `platformShortLabelKey(id: IconPlatform): MessageKey`

- [ ] **Step 1: 改造光照方向标签**

`src/store/uiStore.ts`：

```ts
import type { MessageKey } from '../i18n';

export const LIGHT_ANGLE_KEYS: Record<number, MessageKey> = {
  90: 'light.top',
  45: 'light.topRight',
  0: 'light.right',
  315: 'light.bottomRight',
  270: 'light.bottom',
  225: 'light.bottomLeft',
  180: 'light.left',
  135: 'light.topLeft',
};
```

删除 `LIGHT_ANGLE_LABELS`，并全局替换引用。

- [ ] **Step 2: 改造平台标签**

`src/engine/platforms.ts`：

```ts
import type { MessageKey } from '../i18n';

export const platformLabelKey = (id: IconPlatform): MessageKey =>
  id === 'watchos' ? 'platform.appleWatch' : 'platform.iosMacos';

export const platformShortLabelKey = (id: IconPlatform): MessageKey =>
  id === 'watchos' ? 'platform.watch' : 'platform.iosMac';
```

`PlatformProfile` 保留 `label` / `shortLabel` 字段会被导出 ZIP 使用；不要在 `IconRenderer.ts` 中调用翻译。仅 UI 使用 `platformLabelKey` / `platformShortLabelKey`。

- [ ] **Step 3: 修改导出标签函数**

`TopToolbar.tsx`：

```ts
function exportLabel(opt: ExportOptions): string {
  if (opt.clipboard) return t('toolbar.copyPng');
  if (opt.allModes) return t('toolbar.allAppearances');
  if (opt.bare) return t('toolbar.noBackground');
  return `${FORMAT_LABEL[opt.format]}${opt.size === 4096 ? ' · 4K' : opt.size === 2048 ? ' · 2K' : ''}`;
}
```

`FORMAT_LABEL` 保持 `PNG` / `JPEG`。

- [ ] **Step 4: 替换工具栏可见与辅助文本**

按下表逐项替换：

| 原值 | 新值 |
|---|---|
| `aria-label="Document name"` | `t('toolbar.documentName')` |
| `title="Click to rename"` | `t('toolbar.clickToRename')` |
| `aria-label={`Rename document: ${name}`}` | `t('toolbar.renameDocument', { name })` |
| `title="Unsaved changes"` | `t('toolbar.unsavedChanges')` |
| `title="Background color"` | `t('toolbar.backgroundPopover')` |
| `<span>Background</span>` | `{t('toolbar.background')}` |
| `aria-label="Background color"` | `t('toolbar.backgroundPopover')` |
| `title="Light angle"` | `t('toolbar.lightAngle')` |
| `aria-label={`Light angle: ${...} degrees`}` | `t('toolbar.lightAngleValue', { angle: toDisplayAngle(lightAngle) })` |
| `aria-label="Light angle"` | `t('toolbar.lightAngle')` |
| `title="Zoom"` | `t('toolbar.zoom')` |
| `aria-label={`Zoom: ${zoom} percent`}` | `t('toolbar.zoomValue', { zoom })` |
| `aria-label="Zoom"` | `t('toolbar.zoom')` |
| `title="Platform preview and overrides"` | `t('toolbar.platformPreview')` |
| `aria-label="Platform preview"` | `t('toolbar.platformMenu')` |
| `Platform variants` | `{t('toolbar.platformVariants')}` |
| `Shared artwork · independent position and scale` | `{t('toolbar.platformCaption')}` |
| `activePlatform.shortLabel` | `{t(platformShortLabelKey(platform))}` |
| `title="Export PNG · 1024 × 1024"` | `t('toolbar.exportPng')` |
| `aria-label="More export options"` | `t('toolbar.moreExportOptions')` |
| `aria-label="Export"` | `t('toolbar.export')` |
| `Export` 可见文本 | `{t('toolbar.export')}` |
| `Apple platform set` | `{t('toolbar.applePlatformSet')}` |
| `ZIP · 4 PNGs` | `{t('toolbar.zipFourPngs')}` |
| `Export .icon` | `{t('toolbar.exportIcon')}` |
| `Open .icon…` | `{t('toolbar.openIcon')}` |
| `ZIP` | `{t('toolbar.zip')}` |
| 光照菜单 `LIGHT_ANGLE_LABELS[a]` | `{t(LIGHT_ANGLE_KEYS[a])}` |
| 平台菜单 `profile.label` | `{t(platformLabelKey(profile.id))}` |

- [ ] **Step 5: 保持导出菜单的“所有外观”逻辑**

`All Appearances` 只改显示文案，不改变 `{ format: "png", size: 1024, allModes: true }`。

- [ ] **Step 6: 类型检查**

```bash
npx tsc --noEmit
```

预期：通过。若 `LIGHT_ANGLE_KEYS[a]` 可能为 `undefined`，使用：

```tsx
{t(LIGHT_ANGLE_KEYS[a] ?? 'light.top')}
```

- [ ] **Step 7: 浏览器检查**

打开顶部每个弹层，确认：

- 文档名、背景、光照、缩放、平台、导出均中文；
- 八个方向名正确；
- 导出菜单显示 `复制 PNG`、`所有外观`、`PNG · 无背景`、`Apple 平台图集`、`导出 .icon`、`打开 .icon…`；
- `.icon` 导出的文件名仍为 `<文档名>.icon.zip`。

- [ ] **Step 8: 提交**

```bash
git add src/components/layout/TopToolbar.tsx src/store/uiStore.ts src/engine/platforms.ts
git commit -m "feat(i18n): localize top toolbar"
```

---

### Task 5: 中文化图层面板与右键菜单

**Files:**
- Modify: `src/components/layers/LayerTree.tsx`
- Modify: `src/components/layers/LayerItem.tsx`
- Modify: `src/components/layers/LayerMenu.tsx`

**Interfaces:**
- Consumes: `t`
- Produces: 图层相关 UI 全部中文；`MenuEntry.label` 仍为 `string`，由调用方传入中文。

- [ ] **Step 1: 修改 `LayerTree` 导入区**

```tsx
<button
  type="button"
  onClick={() => inputRef.current?.click()}
  title={t('layers.importTitle')}
>
  <Plus size={compact ? 14 : 18} />
  <span>
    {t('layers.importArtwork')}
    <span className="layer-import-caption">{t('layers.dropHint')}</span>
  </span>
</button>
```

- [ ] **Step 2: 修改 `SettingsDropdown`**

- `title` / `aria-label` / 弹层 `aria-label` → `t('layers.resetAndAutoSave')`
- 确认框 → `t('layers.resetConfirm')`
- `Reset Document…` → `{t('layers.resetDocument')}`
- `Auto-save` → `{t('layers.autoSave')}`
- `Keep this icon after reload` → `{t('layers.keepAfterReload')}`
- `Toggle ariaLabel="Auto-save"` → `ariaLabel={t('layers.autoSave')}`

- [ ] **Step 3: 修改 `LayerTree` 头部与空态**

- `Layers` → `{t('layers.title')}`
- `title="Add group"` / `aria-label="Add group"` → `t('layers.addGroup')`
- `title="Add layer"` / `aria-label="Add layer"` → `t('layers.addLayer')`
- `aria-label="Layers"` → `t('layers.ariaLabel')`
- `No layers` → `{t('layers.noLayers')}`
- `Canvas` → `{t('layers.canvas')}`

- [ ] **Step 4: 修改 `LayerItem` 菜单**

`menuEntries` 全部替换：

```ts
return [
  { label: t('layers.menu.rename'), onSelect: rename },
  { label: layer.visible ? t('layers.menu.hide') : t('layers.menu.show'), onSelect: () => toggleLayerVisibility(layer.id) },
  { label: t('layers.menu.cut'), separated: true, onSelect: () => { toClipboard(cutLayer(layer.id)); selectLayer(null); } },
  { label: t('layers.menu.copy'), onSelect: () => toClipboard(copyLayer(layer.id)) },
  { label: t('layers.menu.paste'), disabled: !copiedLayerMarker(), onSelect: () => { pasteLayers().catch(console.error); } },
  { label: t('layers.menu.duplicate'), onSelect: () => { duplicateLayer(layer.id).catch(console.error); } },
  { label: t('layers.menu.copyStyle'), separated: true, onSelect: () => copyLayerStyle(layer.id) },
  { label: t('layers.menu.pasteStyle'), onSelect: () => { pasteLayerStyle(layer.id); } },
  { label: t('layers.menu.bringToFront'), separated: true, disabled: index <= 0, onSelect: () => arrangeLayer(layer.id, 'front') },
  { label: t('layers.menu.bringForward'), disabled: index <= 0, onSelect: () => arrangeLayer(layer.id, 'forward') },
  { label: t('layers.menu.sendBackward'), disabled: index >= siblings.length - 1, onSelect: () => arrangeLayer(layer.id, 'backward') },
  { label: t('layers.menu.sendToBack'), disabled: index >= siblings.length - 1, onSelect: () => arrangeLayer(layer.id, 'back') },
  ...(layer.parentId ? [{ label: t('layers.menu.selectParent'), separated: true, onSelect: () => selectLayer(layer.parentId) }] : []),
  { label: t('layers.menu.delete'), separated: true, danger: true, onSelect: () => { removeLayer(layer.id); selectLayer(null); } },
];
```

- [ ] **Step 5: 修改 `LayerItem` 行内辅助文本**

| 原值 | 新值 |
|---|---|
| `aria-label={layer.collapsed ? `Expand ${layer.name}` : `Collapse ${layer.name}`}` | `aria-label={t(layer.collapsed ? 'layers.expand' : 'layers.collapse', { name: layer.name })}` |
| `aria-label="Layer name"` | `t('layers.layerName')` |
| `title="Double-click to rename"` | `t('layers.doubleClickRename')` |
| `aria-label={`Duplicate ${layer.name}`}` | `t('layers.duplicateNamed', { name: layer.name })` |
| `title="Duplicate layer"` | `t('layers.duplicateLayer')` |
| `aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}` | `t(layer.visible ? 'layers.hideNamed' : 'layers.showNamed', { name: layer.name })` |
| `title={layer.visible ? 'Hide layer' : 'Show layer'}` | `t(layer.visible ? 'layers.hideLayer' : 'layers.showLayer')` |
| `aria-label={`Remove ${layer.name}`}` | `t('layers.removeNamed', { name: layer.name })` |
| `title="Remove layer"` | `t('layers.removeLayer')` |
| `label={`${layer.name} actions`}` | `t('layers.actions', { name: layer.name })` |

- [ ] **Step 6: 检查 `LayerMenu`**

`LayerMenu` 无硬编码文案；确认 `key={item.label}` 仍唯一。中文菜单项没有重复即可。

- [ ] **Step 7: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：图层路径无英文 UI 文案。

- [ ] **Step 8: 浏览器检查**

- 空文档显示“导入素材…”与“拖入 SVG、PNG 或 JPEG”；
- 新建图层/组后名称中文；
- 右键菜单 14 项中文；
- 重置确认框中文；
- 自动保存开关与说明中文。

- [ ] **Step 9: 提交**

```bash
git add src/components/layers/LayerTree.tsx src/components/layers/LayerItem.tsx src/components/layers/LayerMenu.tsx
git commit -m "feat(i18n): localize layer panel and context menu"
```

---

### Task 6: 中文化形状库与 SF Symbols

**Files:**
- Modify: `src/components/layers/ShapeLibrary.tsx`

**Interfaces:**
- Consumes: `t`
- Produces: 形状库、字体状态、分页、错误提示全部中文；形状 `svg` 数据不变。

- [ ] **Step 1: 改造内置形状名**

将 `BUILT_IN_SHAPES` 的 `name` 改为 `nameKey`：

```ts
const BUILT_IN_SHAPES: {
  nameKey: MessageKey;
  fileName: string;
  icon: Icon;
  svg: string;
}[] = [
  { nameKey: 'shapeLibrary.shapes.rectangle', fileName: 'rectangle.svg', icon: Rectangle, svg: '...' },
  { nameKey: 'shapeLibrary.shapes.circle', fileName: 'circle.svg', icon: Circle, svg: '...' },
  // ...
];
```

渲染：

```tsx
<button
  key={shape.nameKey}
  onClick={() => {
    ...
    addLayer(URL.createObjectURL(blob), shape.fileName);
  }}
>
  <Icon size={18} /> {t(shape.nameKey)}
</button>
```

保留英文 `fileName`，确保导出资产路径稳定；图层显示名由 `addLayer` 的第二参数决定，后续 Task 11 会处理自动命名。

- [ ] **Step 2: 修改触发按钮与弹层**

- `title="Basic shapes and snapping"` → `t('shapeLibrary.trigger')`
- `aria-label="Basic shapes and snapping"` → `t('shapeLibrary.trigger')`
- `aria-label="Shape library"` → `t('shapeLibrary.dialog')`
- `Shape Library` → `{t('shapeLibrary.heading')}`
- `aria-label="Basic shapes"` → `t('shapeLibrary.basicShapes')`

- [ ] **Step 3: 修改吸附开关**

```tsx
<Magnet size={16} /> {t('shapeLibrary.snapToCenter')}{' '}
<span>{snapEnabled ? t('common.on') : t('common.off')}</span>
```

- [ ] **Step 4: 修改字体区**

```tsx
<div className="shape-library-section-title">
  {fontName ?? t('shapeLibrary.bundledSymbols')}
</div>
<p>
  {isBundledFont
    ? t('shapeLibrary.bundledDescription')
    : t('shapeLibrary.customDescription')}
</p>
<button ...>
  <UploadSimple size={16} /> {t('shapeLibrary.useAnotherFont')}
</button>
```

注意：`fontName` 来自用户文件名或 `installFont` 的 label。将内置安装 label 改为 `t('shapeLibrary.bundledSymbols')`，但比较逻辑建议改用独立布尔状态 `isBundledFont`，避免依赖本地化字符串比较：

```ts
const [isBundledFont, setIsBundledFont] = useState(false);
// installFont(face, null, t('shapeLibrary.bundledSymbols')); setIsBundledFont(true);
// loadFont 成功后 setIsBundledFont(false);
```

- [ ] **Step 5: 修改错误与分页**

- 字体加载失败 → `setFontError(t('shapeLibrary.fontLoadError'))`
- 内置字体失败 → `setFontError(t('shapeLibrary.bundledFontError'))`
- 缺字形 → `t('shapeLibrary.glyphMissing', { codepoint: codepoint.toString(16).toUpperCase() })`
- `Previous` → `{t('common.previous')}`
- `Next` → `{t('common.next')}`
- 分页文本：
  ```tsx
  {matchingGlyphs.length
    ? t('shapeLibrary.range', {
        start: page * PAGE_SIZE + 1,
        end: Math.min((page + 1) * PAGE_SIZE, matchingGlyphs.length),
        total: matchingGlyphs.length,
      })
    : t('common.noMatches')}{' '}
  · {t('shapeLibrary.page', { page: pageCount ? page + 1 : 0, total: pageCount })}
  ```
- `placeholder="Find by codepoint, e.g. E900"` → `t('shapeLibrary.searchPlaceholder')`
- `aria-label="Search SF Symbols glyphs"` → `t('shapeLibrary.searchAria')`
- `aria-label="SF Symbols glyphs"` → `t('shapeLibrary.glyphGrid')`
- `title` / `aria-label` → `t('shapeLibrary.addGlyph', { codepoint: ... })`

- [ ] **Step 6: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：形状库无英文 UI 文案；TypeScript 通过。

- [ ] **Step 7: 浏览器检查**

- 打开形状库，九个形状名中文；
- 点击形状后图层面板出现对应中文名；
- SF Symbols 分页、搜索、字体错误均中文；
- 切换自定义字体后说明文案正确。

- [ ] **Step 8: 提交**

```bash
git add src/components/layers/ShapeLibrary.tsx
git commit -m "feat(i18n): localize shape library and symbols"
```

---

### Task 7: 中文化检查器基础区块

**Files:**
- Create: `src/components/inspector/options.ts`
- Modify: `src/components/inspector/InspectorPanel.tsx`
- Modify: `src/components/inspector/CompositionSection.tsx`
- Modify: `src/components/inspector/ColorSection.tsx`

**Interfaces:**
- Consumes: `t`
- Produces: 检查器空态、构图、颜色三块全中文；混合模式/填充类型/渐变类型值不变。

- [ ] **Step 1: 改造混合模式常量**

三个文件目前各自维护 `BLEND_MODES`。按 DRY 原则合并到 `src/components/inspector/options.ts`：

创建 `src/components/inspector/options.ts`：

```ts
import type { MessageKey } from '../../i18n';
import type { BlendMode } from '../../types';

export const BLEND_MODE_OPTIONS: { value: BlendMode; labelKey: MessageKey }[] = [
  { value: 'normal', labelKey: 'inspector.blendModes.normal' },
  { value: 'multiply', labelKey: 'inspector.blendModes.multiply' },
  { value: 'screen', labelKey: 'inspector.blendModes.screen' },
  { value: 'overlay', labelKey: 'inspector.blendModes.overlay' },
  { value: 'darken', labelKey: 'inspector.blendModes.darken' },
  { value: 'lighten', labelKey: 'inspector.blendModes.lighten' },
  { value: 'color-dodge', labelKey: 'inspector.blendModes.colorDodge' },
  { value: 'color-burn', labelKey: 'inspector.blendModes.colorBurn' },
  { value: 'hard-light', labelKey: 'inspector.blendModes.hardLight' },
  { value: 'soft-light', labelKey: 'inspector.blendModes.softLight' },
  { value: 'difference', labelKey: 'inspector.blendModes.difference' },
  { value: 'exclusion', labelKey: 'inspector.blendModes.exclusion' },
  { value: 'plus-lighter', labelKey: 'inspector.blendModes.plusLighter' },
];
```

> 注意 `src/types/index.ts` 的 `BlendMode` 还包含 `hue`、`saturation`、`color`、`luminosity`，但 UI 下拉没有列出它们。本任务不扩大功能范围，保持与现有 UI 一致。

- [ ] **Step 2: 修改 `InspectorPanel`**

- `aria-label="Inspector"` → `t('inspector.title')`
- 标题：`isCanvas ? t('inspector.canvas') : layer ? layer.name : t('inspector.title')`
- `Color` → `{t('inspector.color')}`
- 外观提示 → `{t('inspector.appearanceNote')}`
- 空状态 → `{t('inspector.selectLayer')}`

- [ ] **Step 3: 修改 `CompositionSection`**

- `Composition` → `{t('inspector.composition')}`
- `{platformProfile(platform).shortLabel}` → `{t(platformShortLabelKey(platform))}`
- `Visible` → `{t('inspector.visible')}`
- `ariaLabel="Layer visibility"` → `t('inspector.layerVisibility')`
- `Name` → `{t('inspector.name')}`
- `Position` → `{t('inspector.position')}`
- `NumberInput` 的 `unit="X"` / `unit="Y"` 保持字母单位，不翻译；读屏通过 `ariaLabel` 识别中文语义
- `ariaLabel="Position X"` → `t('inspector.positionX')`
- `ariaLabel="Position Y"` → `t('inspector.positionY')`
- `label="Scale"` → `t('inspector.scale')`

- [ ] **Step 4: 修改 `ColorSection`**

- `Color` → `{t('inspector.color')}`
- `All` → `{t('common.all')}`
- `label="Opacity"` → `t('common.opacity')`
- `Blend` → `{t('inspector.blend')}`
- `ariaLabel="Layer blend mode"` → `t('inspector.layerBlendMode')`
- `Fill` → `{t('common.fill')}`
- `ariaLabel="Fill type"` → `t('inspector.fillType')`
- `Color` 填充行 → `{t('common.color')}`
- `label="Fill color"` → `t('inspector.fillColor')`
- `aria-label="Fill hex color"` → `t('inspector.fillHex')`
- `Style` → `{t('common.style')}`
- `ariaLabel="Gradient style"` → `t('inspector.gradientStyle')`
- `Linear` / `Radial` → `t('inspector.gradientTypes.linear')` / `t('inspector.gradientTypes.radial')`
- `label={`Gradient color ${i + 1}`}` → `t('inspector.gradientColor', { index: i + 1 })`
- `aria-label={`Gradient hex color ${i + 1}`}` → `t('inspector.gradientHexColor', { index: i + 1 })`

使用常量：

```tsx
options={BLEND_MODE_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
```

- [ ] **Step 5: 修改 `InspectorPanel` 中组区块**

- `Group` → `{t('inspector.group')}`
- `{childCount} {childCount === 1 ? "layer" : "layers"}` → `{t('inspector.layerCount', { count: childCount })}`
- `label="Opacity"` → `t('common.opacity')`
- `Blend` → `{t('inspector.blend')}`
- `ariaLabel="Group blend mode"` → `t('inspector.groupBlendMode')`
- 组混合模式选项同样使用 `BLEND_MODE_OPTIONS`

- [ ] **Step 6: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：检查器基础区块无英文 UI 文案。

- [ ] **Step 7: 浏览器检查**

- 选择图层：构图、颜色、位置、缩放、混合、填充中文；
- 切换纯色/渐变：样式、颜色、十六进制输入中文；
- 选择组：`1 个图层` 等量词正确；
- 未选图层：空态中文；
- 移动端 280px 宽度无溢出。

- [ ] **Step 8: 提交**

```bash
git add src/components/inspector/InspectorPanel.tsx src/components/inspector/CompositionSection.tsx src/components/inspector/ColorSection.tsx src/components/inspector/options.ts
git commit -m "feat(i18n): localize inspector composition and color sections"
```

---

### Task 8: 中文化 Liquid Glass 与折射控件

**Files:**
- Modify: `src/components/inspector/LiquidGlassSection.tsx`
- Modify: `src/components/inspector/RefractionPad.tsx`

**Interfaces:**
- Consumes: `t`
- Produces: 玻璃、折射、高级设置全部中文；`keyHighlight`、`fillHighlight` 等值不变。

- [ ] **Step 1: 改造 `SPECULAR_OPTIONS`**

```ts
const SPECULAR_OPTIONS = [
  { value: 'off', labelKey: 'glass.specularOptions.off' },
  { value: 'automatic', labelKey: 'glass.specularOptions.automatic' },
  { value: 'inside', labelKey: 'glass.specularOptions.inside' },
  { value: 'outside', labelKey: 'glass.specularOptions.outside' },
] as const;
```

渲染前：

```tsx
options={SPECULAR_OPTIONS.map(({ value, labelKey }) => ({
  value,
  label: t(labelKey),
}))}
```

- [ ] **Step 2: 改造 `EFFECT_GROUPS`**

```ts
const EFFECT_GROUPS: {
  id: 'highlights' | 'surface';
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  controls: { key: keyof LayerEffects; labelKey: MessageKey }[];
}[] = [
  {
    id: 'highlights',
    titleKey: 'glass.highlights',
    descriptionKey: 'glass.highlightsDescription',
    controls: [
      { key: 'keyHighlight', labelKey: 'glass.top' },
      { key: 'fillHighlight', labelKey: 'glass.bottom' },
      { key: 'darklight', labelKey: 'glass.edgeDefinition' },
    ],
  },
  {
    id: 'surface',
    titleKey: 'glass.surface',
    descriptionKey: 'glass.surfaceDescription',
    controls: [{ key: 'frostiness', labelKey: 'glass.frostiness' }],
  },
];
```

渲染时使用 `t(group.titleKey)`、`t(group.descriptionKey)`、`t(c.labelKey)`。

- [ ] **Step 3: 替换玻璃主区块文本**

| 原值 | 新值 |
|---|---|
| `Liquid Glass` | `{t('glass.title')}` |
| `ariaLabel="Liquid Glass"` | `t('glass.title')` |
| `{lg.mode === "all" ? "All layers" : "This layer"}` | `t(lg.mode === 'all' ? 'glass.allLayers' : 'glass.thisLayer')` |
| `Apply changes to` | `{t('glass.applyChangesTo')}` |
| `aria-label="Apply glass changes to"` | `t('glass.applyChangesTo')` |
| `This layer` | `{t('glass.thisLayer')}` |
| `All layers` | `{t('glass.allLayers')}` |
| `Specular` | `{t('glass.specular')}` |
| `ariaLabel="Specular"` | `t('glass.specular')` |
| `Refraction` | `{t('glass.refraction')}` |
| `ariaLabel="Refraction"` | `t('glass.refraction')` |
| `label="Blur"` | `t('glass.blur')` |
| `label="Translucency"` | `t('glass.translucency')` |
| `Gradient translucency` | `{t('glass.gradientTranslucency')}` |
| `ariaLabel="Gradient translucency"` | `t('glass.gradientTranslucency')` |
| `label="Shadow"` | `t('glass.shadow')` |
| `Advanced` | `{t('glass.advanced')}` |
| `aria-label="Reset advanced glass settings"` | `t('glass.resetAdvanced')` |
| `title="Reset advanced settings"` | `t('glass.resetAdvancedTitle')` |

- [ ] **Step 4: 替换渐变半透明滑块标签**

```tsx
label={t('glass.angle', { value: gradient.angle })}
label={t('glass.startPosition', { value: gradient.start })}
label={t('glass.endPosition', { value: gradient.end })}
label={t('glass.startOpacity', { value: gradient.startOpacity })}
label={t('glass.endOpacity', { value: gradient.endOpacity })}
```

说明文字：

```tsx
<p ...>{t('glass.gradientOpacityNote')}</p>
```

`AdjustmentRow` 的 `ariaLabel` 与会话内可见的 `label` 都来自调用方，调用方需传 `t()`：
`Blur`、`Translucency`、`Shadow` 三处均为中文。

- [ ] **Step 5: 替换高级区块**

- `Lens` → `{t('glass.lens')}`
- `Color split where the glass bends the layers below.` → `{t('glass.lensDescription')}`
- `label="Dispersion"` → `t('glass.dispersion')`
- `group.title` 渲染 → `{t(group.titleKey)}`
- `group.description` 渲染 → `{t(group.descriptionKey)}`
- `group.title === "Highlights"` 条件改为 `group.id === 'highlights'`
- `label="Light intensity"` → `t('glass.lightIntensity')`
- `label={c.label}` → `label={t(c.labelKey)}`
- `ariaLabel={`${group.title}: ${c.label}`}` → `ariaLabel={`${t(group.titleKey)}：${t(c.labelKey)}`}`

> 中文冒号统一用全角 `：`；如果保留半角冒号，需确认读屏停顿。推荐全角。

- [ ] **Step 6: 修改 `RefractionPad`**

- `aria-roledescription="2D slider"` → `aria-roledescription={t('glass.twoDSlider')}`
- `aria-label={`Refraction strength ${strength} %, height ${height} %`}` → `t('glass.refractionPadAria', { strength, height })`
- `title="Drag to set strength and height. Double-click or Home resets."` → `t('glass.refractionPadHint')`
- `Strength` → `{t('glass.strength')}`
- `Height` → `{t('glass.height')}`
- `ariaLabel="Refraction strength"` → `t('glass.refractionStrength')`
- `ariaLabel="Refraction height"` → `t('glass.refractionHeight')`

- [ ] **Step 7: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：玻璃与折射路径无英文 UI 文案。

- [ ] **Step 8: 浏览器检查**

- 玻璃开关、应用到当前/所有图层、高光下拉中文；
- 折射二维滑块可拖动，ARIA 中文；
- 高级面板展开，镜头/高光/表面三组及参数中文；
- 重置按钮 tooltip 中文；
- 渐变半透明开关与滑块中文。

- [ ] **Step 9: 提交**

```bash
git add src/components/inspector/LiquidGlassSection.tsx src/components/inspector/RefractionPad.tsx src/i18n/messages.ts
git commit -m "feat(i18n): localize liquid glass and refraction controls"
```

---

### Task 9: 中文化背景控件

**Files:**
- Modify: `src/components/inspector/BackgroundControls.tsx`

**Interfaces:**
- Consumes: `t`
- Produces: 背景色、渐变、预设、光照控件全部中文；颜色十六进制值不变。

- [ ] **Step 1: 改造预设颜色**

```ts
const PRESET_COLORS: { hex: string; labelKey: MessageKey }[] = [
  { hex: '#FF383C', labelKey: 'background.colors.red' },
  { hex: '#FF8D28', labelKey: 'background.colors.orange' },
  { hex: '#FFCC00', labelKey: 'background.colors.yellow' },
  { hex: '#34C759', labelKey: 'background.colors.green' },
  { hex: '#00C8B3', labelKey: 'background.colors.mint' },
  { hex: '#00C3D0', labelKey: 'background.colors.teal' },
  { hex: '#00C0E8', labelKey: 'background.colors.cyan' },
  { hex: '#0088FF', labelKey: 'background.colors.blue' },
  { hex: '#6155F5', labelKey: 'background.colors.indigo' },
  { hex: '#CB30E0', labelKey: 'background.colors.purple' },
  { hex: '#FF2D55', labelKey: 'background.colors.pink' },
  { hex: '#AC7F5E', labelKey: 'background.colors.brown' },
  { hex: '#F2F2F7', labelKey: 'background.colors.white' },
  { hex: '#1C1C1E', labelKey: 'background.colors.nearBlack' },
];
```

渲染时解构 `labelKey` 并翻译：

```tsx
{PRESET_COLORS.map(({ hex, labelKey }) => (
  <button
    type="button"
    key={hex}
    title={t(labelKey)}
    aria-label={t(labelKey)}
    onClick={() => handleCustomColor(hex)}
    ...
  />
))}
```

- [ ] **Step 2: 改造渐变预设**

```ts
const GRADIENT_PRESETS: { labelKey: MessageKey; stops: Stop[] }[] = [
  {
    labelKey: 'background.presetsLabels.systemLight',
    stops: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 1, color: '#F5F5F5' },
    ],
  },
  {
    labelKey: 'background.presetsLabels.systemDark',
    stops: [
      { offset: 0, color: '#1F1F1F' },
      { offset: 1, color: '#0F0F0F' },
    ],
  },
];
```

渲染时解构 `labelKey`：

```tsx
{GRADIENT_PRESETS.map(({ labelKey, stops }) => (
  <button
    type="button"
    key={labelKey}
    title={t(labelKey)}
    aria-label={t(labelKey)}
    onClick={() => commitStops(stops)}
    ...
  />
))}
```

- [ ] **Step 3: 替换分段控件**

- `Gradient style` → `{t('background.gradientStyle')}`
- `Linear` / `Radial` → `t('inspector.gradientTypes.linear')` / `t('inspector.gradientTypes.radial')`
- `Solid` / `Gradient` → `t('background.solid')` / `t('background.gradient')`

- [ ] **Step 4: 替换纯色区**

- `Custom color` → `{t('common.customColor')}`
- `Presets` → `{t('background.presets')}`
- `title={label}` / `aria-label={label}` → 按上方解构示例改为 `t(labelKey)`。
- `Hue` → `{t('background.hue')}`
- `Tint` → `{t('background.tint')}`
- `Brightness` → `{t('background.brightness')}`
- `label="Background color"` → `t('background.background')`。字典已定义该键；不要复用 `common.color`，以免读屏歧义。

推荐复用：

```tsx
label={t('background.background')}
```

- [ ] **Step 5: 替换自定义渐变区**

- `Gradient stop {i+1} color` → `t('background.gradientStopColor', { index: i + 1 })`
- `Gradient stop {i+1} hex color` → `t('background.gradientStopHex', { index: i + 1 })`
- `Remove gradient stop {i+1}` / `title="Remove stop"` → `t('background.removeGradientStop', { index: i + 1 })` / `t('common.removeStop')`
- `label="Position"` → `t('common.position')`
- `ariaLabel={`Gradient stop ${i+1} position`}` → `t('background.gradientStopPosition', { index: i + 1 })`
- `+ Add gradient stop ({count}/{max})` → `+ {t('common.addGradientStop', { count: localStops.length, max: MAX_STOPS })}`
- `Presets` → `{t('background.presets')}`
- `title={label}` / `aria-label={label}` → 按上方解构示例改为 `t(labelKey)`。

- [ ] **Step 6: 替换光照区**

- `Gradient orientation` → `{t('background.orientation')}`
- `Directional background light` → `{t('background.backgroundLight')}`
- `label="Direction"` / `ariaLabel="Light direction"` → `t('background.direction')` / `t('background.lightDirection')`
- `label="Intensity"` / `ariaLabel="Light intensity"` → `t('background.intensity')` / `t('background.lightIntensity')`

- [ ] **Step 7: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：背景控件无英文 UI 文案。

- [ ] **Step 8: 浏览器检查**

- 顶部背景弹层与检查器背景区一致；
- 纯色模式：预设色名、色相/着色量/亮度中文；
- 渐变模式：纯色/渐变切换、色标、添加/删除、方向、光照中文；
- 280px 宽度下无溢出。

- [ ] **Step 9: 提交**

```bash
git add src/components/inspector/BackgroundControls.tsx
git commit -m "feat(i18n): localize background controls"
```

---

### Task 10: 中文化画布状态与网格

**Files:**
- Modify: `src/components/canvas/IconCanvas.tsx`

**Interfaces:**
- Consumes: `t`
- Produces: WebGL2 错误提示、拖放提示、网格控件全部中文。

- [ ] **Step 1: 替换 WebGL2 提示**

```tsx
{webgl2Status === 'error' && (
  <div ...>
    {t('canvas.webglUnavailable', {
      detail: webgl2Error || t('canvas.unknownError'),
    })}
  </div>
)}
```

- [ ] **Step 2: 替换拖放提示**

```tsx
<div className="text-white font-medium text-lg">
  {t('canvas.dropToAddLayer')}
</div>
```

- [ ] **Step 3: 替换网格控件**

- `aria-label="Icon grid"` → `t('canvas.gridGroup')`
- `title="Toggle icon grid"` → `t('canvas.toggleGrid')`
- `Grid` → `{t('canvas.grid')}`
- `title="Grid style"` → `t('canvas.gridStyle')`
- `aria-label={`Grid style: ${gridStyle}`}` → `t('canvas.gridStyleValue', { style: t(gridStyle === 'light' ? 'common.light' : 'common.dark') })`
- `{gridStyle === "light" ? "Light" : "Dark"}` → `{t(gridStyle === 'light' ? 'common.light' : 'common.dark')}`

- [ ] **Step 4: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：画布路径无英文 UI 文案。

- [ ] **Step 5: 浏览器检查**

- 开启网格，按钮显示“网格”“浅色/深色”；
- 拖入图片时提示“拖放图像以添加图层”；
- 强制 WebGL2 失败（Chrome DevTools 禁用 WebGL）时提示中文。

- [ ] **Step 6: 提交**

```bash
git add src/components/canvas/IconCanvas.tsx
git commit -m "feat(i18n): localize canvas status and grid controls"
```

---

### Task 11: 中文化自动名称与文档默认值

**Files:**
- Modify: `src/store/iconStore.ts`
- Modify: `src/engine/IconDocument.ts`
- Modify: `src/agent/api.ts`

**Interfaces:**
- Consumes: `t`
- Produces:
  - `DEFAULT_ICON_NAME = t('persistence.untitled')`
  - `defaultLayerName(index)`
  - `defaultGroupName(index)`
  - 导入/复制默认名中文。

- [ ] **Step 1: 增加命名辅助函数**

在 `src/store/iconStore.ts` 顶部：

```ts
import { t } from '../i18n';

const UNTITLED = () => t('persistence.untitled');
const defaultLayerName = (index: number) => t('persistence.layerDefault', { index });
const defaultGroupName = (index: number) => t('persistence.groupDefault', { index });
```

- [ ] **Step 2: 替换文档名**

所有 `"Untitled"`：

```ts
export const $iconName = atom<string>(UNTITLED());
...
$iconName.set(name.trim() || UNTITLED());
...
$iconName.set(UNTITLED());
...
$iconName.set(doc.name.trim() || UNTITLED());
```

- [ ] **Step 3: 替换图层/组默认名**

```ts
const layer = createLayer(
  sourceFile?.replace(/\.[^.]+$/, '') || defaultLayerName(layers.length + 1),
  parentId,
);
...
const group = createGroup(
  defaultGroupName(layers.filter(l => l.type === 'group').length + 1),
);
```

- [ ] **Step 4: 替换复制图层后缀**

```ts
copy.name = t('persistence.copySuffix', { name: live.name });
```

- [ ] **Step 5: 修改 `IconDocument` 导入默认名**

- `safeName()` 的 `"Untitled"` 回退 → `t('persistence.untitled')`
  ```ts
  s.replace(/[\\/:*?"<>|]/g, '-').trim() || t('persistence.untitled');
  ```
- 导入缺失组名：
  ```ts
  t('persistence.groupDefault', { index: gi + 1 })
  ```
- 导入缺失图层名：
  ```ts
  t('persistence.layerDefault', { index: layers.length + 1 })
  ```

- [ ] **Step 6: 修改 `src/agent/api.ts` 默认名**

- `name = 'Untitled.icon'` → `name = `${t('persistence.untitled')}.icon``
- 生成图层名：
  ```ts
  while (!name || (!layer.name && taken.has(name))) {
    name = layer.type === 'group'
      ? t('persistence.groupDefault', { index: ++n })
      : t('persistence.layerDefault', { index: ++n });
  }
  ```

- [ ] **Step 7: 保留 `Radial Background` 技术名**

`src/engine/IconDocument.ts` 中 `Radial Background.png`、`"Radial Background"` 是 `.icon` 包内技术资产名，保持英文，不替换。添加注释：

```ts
// Icon Composer asset names stay English for package compatibility.
```

- [ ] **Step 8: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：自动名称路径无 `Untitled`、`Layer 1`、`Group 1` 等英文 UI 默认值（技术资产名除外）。

- [ ] **Step 9: 浏览器检查**

- 新开页面文档名为“未命名”；
- 添加图层显示“图层 1”；
- 添加组显示“组 1”；
- 复制图层显示“XXX 副本”；
- 导入缺失名称的 `.icon` 后显示中文默认名。

- [ ] **Step 10: 提交**

```bash
git add src/store/iconStore.ts src/engine/IconDocument.ts src/agent/api.ts
git commit -m "feat(i18n): localize generated document and layer names"
```

---

### Task 12: 中文化动态弹窗与错误提示

**Files:**
- Create: `src/i18n/errors.ts`
- Modify: `src/agent/api.ts`
- Modify: `src/components/layout/TopToolbar.tsx`
- Modify: `src/engine/IconDocument.ts`
- Modify: `src/engine/IconRenderer.ts`
- Modify: `src/engine/LiquidGlass.ts`
- Modify: `src/components/canvas/IconCanvas.tsx`

**Interfaces:**
- Consumes: `t`、`IMPORT_ERROR_MAP`
- Produces:
  - `src/i18n/errors.ts`：`translateImportError(detail: string): string`
  - 所有用户可见 `alert/confirm` 与状态错误中文。

- [ ] **Step 1: 创建错误映射**

创建 `src/i18n/errors.ts`：

```ts
import { t } from './index';

const IMPORT_ERROR_MAP: Record<string, string> = {
  'No icon.json found in the archive.': t('importExport.noIconJson'),
  'icon.json is not a valid Icon Composer document.': t('importExport.invalidIconJson'),
  'This document uses features from a newer version of Icon Composer':
    t('importExport.newerFeatures'),
  'Could not create a canvas for the radial fill asset.':
    t('importExport.createRadialFillCanvas'),
  'Could not encode the radial fill asset.': t('importExport.encodeRadialFill'),
  'Could not encode the radial background asset.':
    t('importExport.encodeRadialBackground'),
  'WebGL2 not supported': t('importExport.webgl2NotSupported'),
};

export function translateImportError(detail: string): string {
  return IMPORT_ERROR_MAP[detail] ?? detail;
}

export function importErrorMessage(detail: string): string {
  return t('importExport.importError', { detail: translateImportError(detail) });
}
```

- [ ] **Step 2: 修改 `TopToolbar.openIconFile`**

```ts
} catch (err) {
  console.error(err);
  window.alert(
    importErrorMessage(err instanceof Error ? err.message : String(err)),
  );
}
```

- [ ] **Step 3: 修改 `src/agent/api.ts` 的链接导入弹窗**

```ts
if (
  $persistenceEnabled.get() &&
  $layers.get().length &&
  !window.confirm(t('importExport.replaceConfirm'))
) return;
...
window.alert(
  t('importExport.invalidIconLink', {
    detail: translateImportError(err instanceof Error ? err.message : String(err)),
  }),
);
```

- [ ] **Step 4: 修改 `IconRenderer.reportWebglError`**

```ts
setWebgl2Error(short || t('canvas.unknownError'));
```

保留 `console.error("WebGL2 error:", raw)` 为英文调试日志，不做用户界面展示。

- [ ] **Step 5: 修改 `LiquidGlass` 的底层错误**

底层 `throw new Error('WebGL2 not supported')` 保持英文，供错误映射使用；`IconRenderer` 翻译后展示。Shader 编译错误等技术细节保留原文。

- [ ] **Step 6: 修改 `IconDocument` 导出失败错误**

`canvasToBlob` 的 `Export failed for image/${format}` 保留底层英文，UI 捕获后通过 `t('importExport.exportFailed', { format })` 展示。当前 `IconCanvas` 导出失败只 `console.error`，本任务不新增 toast，避免范围扩大；如后续需要用户可见提示，另立任务。

- [ ] **Step 7: 验证**

```bash
npx tsc --noEmit
npm run i18n:audit
```

预期：用户可见弹窗无英文；技术日志可保留英文。

- [ ] **Step 8: 手工触发**

- 打开非法 `.icon` 文件 → 中文错误；
- 通过带 `#r=` 的无效链接打开 → 中文确认与错误；
- 禁用 WebGL2 → 中文降级提示；
- 重置文档 → 中文确认。

- [ ] **Step 9: 提交**

```bash
git add src/i18n/errors.ts src/agent/api.ts src/components/layout/TopToolbar.tsx src/engine/IconRenderer.ts src/engine/LiquidGlass.ts src/engine/IconDocument.ts src/components/canvas/IconCanvas.tsx
git commit -m "feat(i18n): localize dialogs and runtime errors"
```

---

### Task 13: 中文化应用外壳与 README

**Files:**
- Modify: `index.html`
- Modify: `public/manifest.webmanifest`
- Modify: `electron/main.cjs`
- Modify: `src/pages/index.astro`
- Modify: `README.md`

**Interfaces:**
- Consumes: 无（纯静态文本）
- Produces: 浏览器标题/描述、PWA 描述、Electron 窗口与菜单、README 中文。

- [ ] **Step 1: 修改 `index.html`**

```html
<html lang="zh-CN">
...
<meta
  name="description"
  content="在浏览器中设计 Liquid Glass 应用图标，支持实时 WebGL 渲染、图层、外观变体、平台预览以及 PNG 或 .icon 导出。" />
<meta property="og:title" content="Liquid Composer" />
<meta
  property="og:description"
  content="在浏览器中设计 Liquid Glass 应用图标。支持实时 WebGL 渲染、图层和 1024px PNG 导出。" />
...
<title>Liquid Composer：浏览器中的 Liquid Glass 应用图标设计工具</title>
```

- [ ] **Step 2: 修改 `public/manifest.webmanifest`**

```json
{
  "id": "/",
  "name": "Liquid Composer",
  "short_name": "Liquid Composer",
  "description": "在浏览器中设计 Liquid Glass 应用图标。",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#171719",
  "theme_color": "#171719",
  "lang": "zh-CN",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-1024.png", "sizes": "1024x1024", "type": "image/png" }
  ]
}
```

- [ ] **Step 3: 修改 `src/pages/index.astro`**

```astro
<html lang="zh-CN">
  <head>
    ...
    <meta name="description" content="Liquid Composer：创建 iOS 26 Liquid Glass 图标" />
    ...
    <title>Liquid Composer</title>
  </head>
```

- [ ] **Step 4: 修改 `electron/main.cjs` 窗口标题**

将窗口标题与 HTML 标题区分：窗口标题用简短产品名加中文功能描述，避免任务栏截断。

```js
title: 'Liquid Composer - Liquid Glass 图标设计工具',
```

- [ ] **Step 5: 自定义 Electron 菜单中文标签**

```js
const isMac = process.platform === 'darwin';

const template = [
  ...(isMac
    ? [{
        label: 'Liquid Composer',
        submenu: [
          { role: 'about', label: '关于 Liquid Composer' },
          { type: 'separator' },
          { role: 'services', label: '服务' },
          { type: 'separator' },
          { role: 'hide', label: '隐藏 Liquid Composer' },
          { role: 'hideOthers', label: '隐藏其他' },
          { role: 'unhide', label: '全部显示' },
          { type: 'separator' },
          { role: 'quit', label: '退出 Liquid Composer' },
        ],
      }]
    : []),
  {
    label: '文件',
    submenu: [
      { role: 'close', label: '关闭窗口' },
      ...(isMac ? [] : [{ role: 'quit', label: '退出' }]),
    ],
  },
  {
    label: '编辑',
    submenu: [
      { role: 'undo', label: '撤销' },
      { role: 'redo', label: '重做' },
      { type: 'separator' },
      { role: 'cut', label: '剪切' },
      { role: 'copy', label: '复制' },
      { role: 'paste', label: '粘贴' },
      { role: 'selectAll', label: '全选' },
    ],
  },
  {
    label: '视图',
    submenu: [
      { role: 'reload', label: '重新加载' },
      { role: 'forceReload', label: '强制重新加载' },
      { role: 'toggleDevTools', label: '开发者工具' },
      { type: 'separator' },
      { role: 'resetZoom', label: '实际大小' },
      { role: 'zoomIn', label: '放大' },
      { role: 'zoomOut', label: '缩小' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: '全屏' },
    ],
  },
  {
    label: '窗口',
    submenu: [
      { role: 'minimize', label: '最小化' },
      ...(isMac
        ? [
            { role: 'zoom', label: '缩放' },
            { type: 'separator' },
            { role: 'front', label: '前置全部窗口' },
          ]
        : [{ role: 'close', label: '关闭' }]),
    ],
  },
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
```

注意：`role` 与 `label` 同时存在时，`label` 覆盖系统默认文案；不同 Electron 版本对部分 role 的 label 支持略有差异，需在 Windows 构建上实际验证。

- [ ] **Step 6: 翻译 README**

保留代码块、命令、URL、徽章图片链接和产品名，正文改为中文。核心改动：

```md
<p align="center">在浏览器或桌面端设计 Liquid Glass 应用图标。</p>
```

```md
## iOS/watchOS 27 新特性

- 光线从正上方照射。工具栏中的光照角度控件仅用于预览，不会随文档保存
- 顶部和底部边缘的高光，以及定义形状的暗边
- 高光位置：关闭、自动、内部或外部。自动模式在明亮图标背景上选择内部，在深色背景和透明外观中选择外部
- 支持强度和高度可调的折射；强度为负时图像向相反方向弯曲（反向折射）
```

```md
## 功能

- 基于图层的编辑，支持一层分组、拖放排序、行内重命名、复制和撤销/重做
- 导入 SVG、PNG 和 JPEG。SVG 会按渲染分辨率重新栅格化，边缘保持清晰
- 每图层或全部图层的玻璃控件：高光位置、折射（强度、高度）、模糊、半透明和阴影
- 高级面板：镜头（色散）、高光（光照强度、顶部、底部、边缘清晰度）和表面（磨砂感），支持重置
- 每图层不透明度、混合模式，以及纯色或双色标渐变填充
- 默认、深色、透明浅色和透明深色外观，以及 iOS 27/watchOS 27 的浅色和深色着色变体
- 玻璃叠玻璃合成：每个玻璃图层折射背景及其下方所有已绘制图层
- 背景编辑器支持色相、着色量和亮度，或自定义渐变色标
- Apple 图标网格叠加（浅色或深色线条）、中心吸附参考线、画布上基于 Alpha 的图层拾取
- 以 4096、2048、1024、512 或 256 px 导出 PNG，或以 1024 px 导出 JPEG；1024 及以下尺寸会超采样。PNG · 无背景会省略背景板。可复制 1024 PNG 到剪贴板，或将所有外观下载为 ZIP，包含 `Default/`、`Dark/`、`ClearLight/` 和 `ClearDark/` 文件夹，每个文件夹含 4096 到 256 px 的 PNG
- Icon Composer 文档：在导出菜单中导出 .icon 和打开 .icon，以压缩的 `.icon` 包形式提供，可在 Icon Composer 和 Xcode 中打开。开启折射或将高光设为内部/外部的文档需要 Xcode 27（与 Icon Composer 2 写入格式一致）；否则也可在 Xcode 26 中打开
- 工作内容自动保存到本地 localStorage 和 IndexedDB
```

```md
## 快捷键

`⌘` 在 Windows 和 Linux 上对应 `Ctrl`。

- `⌘Z` / `⇧⌘Z` 撤销和重做
- `⌘D` 复制，`Delete` 删除，`F2` 重命名当前聚焦图层
- `⌘C` / `⌘X` / `⌘V` 复制、剪切和粘贴图层（或粘贴图像）
- 方向键以 1 pt 移动选中图层，按住 `⇧` 为 10 pt
- `⌘]` / `⌘[` 上移一层或下移一层；`⌥⇧⌘F` / `⌥⇧⌘B` 移到最前或移到最后
- `⌥⌘C` / `⌥⌘V` 复制和粘贴样式：玻璃、填充、不透明度和混合模式
- `⌥⌘G` 切换图标网格
```

其余构建、桌面、AI 代理、工作原理章节按同样口径翻译，命令与代码块保持原样。README 中的 `Default/`、`Dark/`、`ClearLight/`、`ClearDark/` 是导出目录名，保持英文。

- [ ] **Step 7: 验证**

```bash
npm run build
npm run build:desktop
```

预期：两者均成功。

检查产物：

```bash
rg -n 'lang="zh-CN"|浏览器中的 Liquid Glass|在浏览器中设计' dist/index.html dist/manifest.webmanifest
```

预期：命中中文标题与描述。

- [ ] **Step 8: Electron 冒烟**

```bash
npm run desktop
```

检查：

- 窗口标题中文；
- 菜单栏为中文；
- 页面标题与内容中文。

- [ ] **Step 9: 提交**

```bash
git add index.html public/manifest.webmanifest electron/main.cjs src/pages/index.astro README.md
git commit -m "feat(i18n): localize app shell, metadata and README"
```

---

### Task 14: 中文字体栈与排版验证

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: 无
- Produces: 中文字体回退链；280px 侧栏与 960px 窗口排版不回退。

- [ ] **Step 1: 修改字体栈**

```css
@theme {
  --font-system:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
    "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", sans-serif;
  --text-2xs: 10px;
  --text-2xs--line-height: 1.2;
  --text-xs: 11px;
  --text-xs--line-height: normal;
}

:root {
  color-scheme: dark;
  font-family:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
    "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", sans-serif;
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 2: 构建**

```bash
npm run build
```

预期：通过。

- [ ] **Step 3: 截图核对**

启动：

```bash
npm run dev
```

在 1440×900 与 960×600 两个窗口下截图，重点检查：

- 顶部工具栏按钮；
- 280px 检查器；
- 导出菜单；
- 高级玻璃面板；
- 背景渐变色标；
- 形状库分页。

- [ ] **Step 4: 若溢出，缩短文案而不是缩小字体**

优先替换：

| 过长 | 备选 |
|---|---|
| `线性减淡（添加）` | `线性减淡` |
| `方向性背景光` | `背景光` |
| `重新加载后保留此图标` | `重载后保留` |
| `玻璃折射下方图层时产生的颜色分离。` | `折射下方图层产生的颜色分离。` |

记录最终选择到 `messages.ts`，不要在两处维护。

- [ ] **Step 5: 提交**

```bash
git add src/styles/global.css src/i18n/messages.ts
git commit -m "style(i18n): add Chinese font fallbacks and fix text overflow"
```

---

### Task 15: 完整审计与验收

**Files:**
- Modify: `scripts/i18n-audit.mjs`
- Create: `scripts/i18n-smoke.cjs`
- Create: `docs/superpowers/plans/2026-11-16-frontend-chinese-localization-acceptance.md`
- Modify: `docs/superpowers/specs/2026-11-16-frontend-chinese-localization-design.md`（仅在发现遗漏时更新）

**Interfaces:**
- Consumes: 所有前序任务
- Produces: 可重复执行的验收记录与最终结论。

- [ ] **Step 1: 收紧审计白名单**

检查 `scripts/i18n-audit.mjs`，确保以下内容不被误报：

- `Liquid Composer`、`Liquid Glass`、`Icon Composer`、`SF Symbols`；
- `PNG`、`JPEG`、`ZIP`、`WebGL2`；
- `radial`、`linear`、`normal` 等数据值；
- `RENDITION_NAMES` 的英文目录名；
- SVG 属性 `in`、`SourceAlpha`；
- `console.*` 调试日志；
- `.icon` 包内资产名 `Radial Background`。

为 `IconRenderer.ts` 的 `RENDITION_NAMES` 添加显式允许规则：

```js
const FILE_ALLOW = new Map([
  ['src/engine/IconRenderer.ts', [/RENDITION_NAMES/, /default: "Default"/, /dark: "Dark"/, /clear:/, /tinted/]],
  ['src/engine/IconDocument.ts', [/Radial Background/, /radial fill asset/]],
]);
```

- [ ] **Step 2: 运行全量审计与遗留搜索**

```bash
npm run i18n:audit
rg -n --glob '*.tsx' '(title|placeholder|aria-label)="[A-Za-z]|>[[:space:]]*[A-Za-z][^<>{]*<' src/components
rg -n "window\.(alert|confirm)\(\s*[\"'`][A-Za-z]" src
```

预期：`npm run i18n:audit` 退出码 0 并输出 `i18n 审计通过`；两条 `rg` 均无输出。若有命中，逐条判断：

- 用户可见 → 加入字典并替换；
- 数据/日志/技术名 → 加入白名单并注释原因。

- [ ] **Step 3: 构建验证**

```bash
npm run build
npm run build:desktop
```

预期：均成功，无 TypeScript 错误。

- [ ] **Step 4: 运行时冒烟脚本**

使用 Playwright 打开页面并断言：

```js
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  const lang = await page.getAttribute('html', 'lang');
  if (lang !== 'zh-CN') throw new Error(`lang=${lang}`);

  for (const text of ['图层', '检查器', '导出', '背景']) {
    const count = await page.getByText(text, { exact: true }).count();
    if (!count) throw new Error(`缺少中文文案：${text}`);
  }

  await page.screenshot({ path: 'i18n-home.png', fullPage: true });
  await browser.close();
  console.log('运行时冒烟通过');
})();
```

运行：

```bash
npm run dev
node scripts/i18n-smoke.cjs
```

`playwright-core` 已在 `devDependencies` 中；脚本使用系统 Chrome 路径。若 macOS/Linux 执行，将 `executablePath` 改为对应 Chrome 路径或删除该字段使用 Playwright 自带浏览器。

预期：输出 `运行时冒烟通过`，生成 `i18n-home.png`。

- [ ] **Step 5: 手工验收清单**

逐项勾选 Spec 第 10.2 节清单，并将结果写入 `docs/superpowers/plans/2026-11-16-frontend-chinese-localization-acceptance.md`：

```md
# 中文化验收记录

日期：YYYY-MM-DD
构建版本：<commit 或时间戳>
审计命令：`npm run i18n:audit` → 通过
构建：`npm run build` → 通过
桌面构建：`npm run build:desktop` → 通过
运行时冒烟：`node scripts/i18n-smoke.cjs` → 通过

## 截图

- 1440×900：`screenshots/i18n-desktop.png`
- 960×600：`screenshots/i18n-compact.png`
- 375×812：`screenshots/i18n-mobile.png`

## 清单

- [x] 顶部工具栏
- [x] 背景弹层
- [x] 光照/缩放/平台/导出菜单
- [x] 图层面板与右键菜单
- [x] 形状库与 SF Symbols
- [x] 检查器构图/颜色/玻璃/折射/高级
- [x] 底部外观栏
- [x] 画布网格与拖放提示
- [x] WebGL2 降级提示
- [x] 重置确认与非法导入弹窗
- [x] 浏览器标题/PWA/Electron 标题
- [x] 屏幕阅读器抽查
- [x] 280px 侧栏无溢出
```

- [ ] **Step 6: 清理验收临时截图**

将核对完成的截图移入 `docs/superpowers/plans/screenshots/`，并删除根目录临时文件：

```bash
mkdir -p docs/superpowers/plans/screenshots
mv i18n-home.png docs/superpowers/plans/screenshots/i18n-home.png
```

若截图含用户素材，不要提交到仓库；仅保留空白图标状态截图。

- [ ] **Step 7: 记录遗留问题**

若发现仍为英文但不属于前台（例如 GPU 驱动日志、`icon.json` 字段），在验收记录中列出并说明原因，不计为失败。

- [ ] **Step 8: 最终提交**

```bash
git add scripts/i18n-audit.mjs scripts/i18n-smoke.cjs docs/superpowers/plans/2026-11-16-frontend-chinese-localization-acceptance.md
git commit -m "test(i18n): add full audit and acceptance record"
```

---

## 文件改动总览

| 文件 | 任务 | 职责 |
|---|---|---|
| `src/i18n/messages.ts` | 1, 8 | 中文文案唯一事实源 |
| `src/i18n/index.ts` | 1 | `t()`、`MessageKey`、语言设置 |
| `src/i18n/errors.ts` | 12 | 底层错误到中文的映射 |
| `scripts/i18n-audit.mjs` | 1, 15 | 静态英文文案审计 |
| `scripts/i18n-smoke.cjs` | 15 | 运行时冒烟 |
| `src/components/ui/*` | 2 | 通用控件 |
| `src/components/layout/AppLayout.tsx` | 3 | 面板导航 |
| `src/components/layout/LeftPanel.tsx` | 3 | 图层侧栏 ARIA |
| `src/components/layout/BottomBar.tsx` | 3 | 外观模式与着色 |
| `src/components/layout/TopToolbar.tsx` | 4, 12 | 顶部工具栏与导入错误 |
| `src/store/uiStore.ts` | 4 | 光照方向消息键 |
| `src/engine/platforms.ts` | 4 | 平台显示消息键 |
| `src/components/layers/LayerTree.tsx` | 5 | 图层树与设置弹层 |
| `src/components/layers/LayerItem.tsx` | 5 | 图层行与右键菜单 |
| `src/components/layers/LayerMenu.tsx` | 5 | 菜单容器（无文案改动） |
| `src/components/layers/ShapeLibrary.tsx` | 6 | 形状库与字体 |
| `src/components/inspector/options.ts` | 7 | 混合模式共享选项 |
| `src/components/inspector/InspectorPanel.tsx` | 7 | 检查器容器 |
| `src/components/inspector/CompositionSection.tsx` | 7 | 构图 |
| `src/components/inspector/ColorSection.tsx` | 7 | 颜色与填充 |
| `src/components/inspector/LiquidGlassSection.tsx` | 8 | 玻璃参数 |
| `src/components/inspector/RefractionPad.tsx` | 8 | 二维折射滑块 |
| `src/components/inspector/BackgroundControls.tsx` | 9 | 背景编辑 |
| `src/components/canvas/IconCanvas.tsx` | 10, 12 | 画布状态与导出 |
| `src/store/iconStore.ts` | 11 | 默认名称 |
| `src/engine/IconDocument.ts` | 11, 12 | 导入导出名称与错误 |
| `src/agent/api.ts` | 11, 12 | 代理入口与弹窗 |
| `src/engine/IconRenderer.ts` | 12 | WebGL 错误映射 |
| `src/engine/LiquidGlass.ts` | 12 | 底层错误保留 |
| `index.html` | 13 | 页面元数据 |
| `public/manifest.webmanifest` | 13 | PWA 元数据 |
| `src/pages/index.astro` | 13 | 备用页面 |
| `electron/main.cjs` | 13 | 窗口与菜单 |
| `README.md` | 13 | 用户文档 |
| `src/styles/global.css` | 14 | 中文字体栈 |
| `src/main.tsx` | 1 | 设置 `lang=zh-CN` |

## 验收映射

| Spec 要求 | 对应任务 |
|---|---|
| 静态界面文案中文化 | 2–10 |
| 参数化动态文案 | 1, 4, 5, 6, 9, 11 |
| 枚举显示标签中文化 | 4, 7, 8, 9 |
| 原生弹窗与错误中文化 | 12 |
| 自动名称中文化 | 6, 11 |
| 无障碍文本中文化 | 2–10 |
| `lang="zh-CN"` | 1, 13 |
| 应用外壳与 README | 13 |
| 字体与排版 | 14 |
| 审计与验收 | 15 |
| 保持数据/导出兼容 | 4, 11, 12, 15 |

## 自检记录

- [x] Spec 每个目标都有至少一个任务覆盖。
- [x] 每个任务包含精确文件路径、接口、代码片段与验证命令。
- [x] 无 `TBD`、`TODO`、`类似上文` 等占位符。
- [x] `MessageKey`、`t()`、`BLEND_MODE_OPTIONS`、`platformShortLabelKey` 等名称前后一致。
- [x] 明确区分显示标签与数据值，避免破坏 `icon.json`、ZIP 路径与持久化。
