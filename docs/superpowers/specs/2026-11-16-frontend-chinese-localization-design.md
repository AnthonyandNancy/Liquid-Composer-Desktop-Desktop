# Liquid Composer 前台文本中文化解决方案

**日期：** 2026-11-16  
**状态：** 待审阅  
**适用范围：** Web 版、桌面版（Electron）中由本项目提供的前台文本

## 1. 目标与成功标准

### 1.1 目标

将 Liquid Composer 中所有终端用户可直接看到、听到或读到的英文文本改为简体中文，包括：

- 页面与面板中的按钮、标签、菜单、选项、提示和空状态；
- 控件的 `title`、`placeholder`、`aria-label`、`aria-roledescription` 等辅助文本；
- `window.alert`、`window.confirm` 等浏览器原生弹窗；
- WebGL2 降级、导入失败、字体加载失败等状态与错误提示；
- 新建文档、图层、组、形状等自动生成的英文默认名称；
- `index.html`、PWA manifest、Electron 窗口标题等应用外壳文本；
- 项目 README 中的用户使用说明。

### 1.2 非目标

- 不翻译源代码标识符、类型值、枚举值、CSS 类名、存储键和内部日志；
- 不改变在 `icon.json`、ZIP 路径、剪贴板协议中作为数据交换格式的英文值；
- 不翻译第三方库自带的浏览器原生 UI（例如系统字体选择器、浏览器下载栏）；
- 不建设多语言切换 UI；本次为中文单语发布；
- 不重构渲染引擎、状态管理或交互逻辑。

### 1.3 成功标准

1. 正常启动与全部主要交互路径中，不再出现英文界面文案。
2. 打开颜色选择器、形状库、背景面板、玻璃高级设置、导入导出菜单、移动端标签栏时，文字均为中文。
3. 触发删除确认、重置确认、非法 `.icon` 导入、字体加载失败、WebGL2 不可用时，提示均为中文。
4. 屏幕阅读器朗读的中文控件名称完整、可理解。
5. `document.documentElement.lang` 为 `zh-CN`，浏览器标签页标题与 PWA 安装信息为中文。
6. `npm run build` 通过；桌面版构建通过。
7. 自动化审计脚本对已知 UI 路径不再报告英文可见字面量。

## 2. 现状审计

### 2.1 技术栈与约束

- React 19 + TypeScript 7 + Vite 8 + Tailwind CSS 4 + Nanostores。
- 当前没有 i18n 库、没有语言资源文件、没有 `lang` 切换逻辑。
- 项目没有 Git 元数据，也没有测试框架和 `test` 脚本。
- 文案高度分散，下列文件均包含前台英文：
  - `src/components/layout/`：`TopToolbar.tsx`、`BottomBar.tsx`、`AppLayout.tsx`、`LeftPanel.tsx`
  - `src/components/layers/`：`LayerTree.tsx`、`LayerItem.tsx`、`ShapeLibrary.tsx`
  - `src/components/inspector/`：`InspectorPanel.tsx`、`CompositionSection.tsx`、`ColorSection.tsx`、`LiquidGlassSection.tsx`、`BackgroundControls.tsx`、`RefractionPad.tsx`
  - `src/components/canvas/IconCanvas.tsx`
  - `src/components/ui/`：`ColorPicker.tsx`、`NumberInput.tsx`、`Slider.tsx`
  - `src/store/uiStore.ts`、`src/store/iconStore.ts`
  - `src/engine/IconDocument.ts`、`src/engine/platforms.ts`
  - `src/agent/api.ts` 中的浏览器弹窗
  - `index.html`、`public/manifest.webmanifest`、`electron/main.cjs`、`README.md`
- UI 控件大量复用 `label`、`ariaLabel`、`title` 字符串；直接散点替换会重复翻译同一术语，后续维护困难。

### 2.2 文案分类

| 类别 | 示例 | 处理原则 |
|---|---|---|
| 静态界面文案 | `Layers`、`Inspector`、`Export` | 资源字典 + `t()` |
| 动态插值文案 | `Duplicate ${layer.name}`、`Gradient stop ${i + 1}` | 参数化消息 |
| 枚举显示标签 | `Normal`、`Inside`、`Linear` | 值保持英文，显示走字典 |
| 原生弹窗 | `Reset the document...` | `t()` 后传给 `confirm/alert` |
| 状态/错误 | `WebGL2 unavailable...`、导入异常 | 资源字典；底层错误保留技术细节 |
| 自动命名 | `Untitled`、`Layer 1`、`Group 2`、`Rectangle` | 显示中文；文件名策略单独定义 |
| 无障碍文本 | `aria-label="Panels"`、`title="Zoom"` | 与可见文案同级翻译 |
| 应用外壳 | `<title>`、manifest 描述、Electron 标题 | 直接改为中文常量 |
| 文档 | README、命令说明 | 中文重写，命令与品牌名保留 |

### 2.3 关键风险

1. **数据与显示混用**：`RENDITION_NAMES` 同时决定 ZIP 目录名；若直接翻译，会破坏与 README、Icon Composer 工作流的兼容性。
2. **内部值被误翻译**：`"normal"`、`"inside"`、`"tintedLight"` 等是持久化值，只能翻译 `label`，不能改值。
3. **自动名称进入文档**：图层名、文档名会持久化和导出。中文默认名可接受，但若用户依赖英文文件名，需要保留导出时的 ASCII 兜底。
4. **模板字符串遗漏**：现有审计中大量动态消息并非纯 JSX 文本，单纯搜索标签会漏掉。
5. **字体与排版**：当前字体栈以 SF Pro / Helvetica 为主，未显式包含中文字体；中文回退字体可能造成字重和行高差异。
6. **长文案溢出**：中文通常更短，但英文专名混排、窄侧栏、10–11px 字号仍需截图核对。
7. **Electron 原生菜单**：目前使用 `role` 自动生成系统菜单，语言由 Electron/系统决定；若要求全中文菜单，需要自定义 `label`。
8. **对话式识别**：`title` 与 `aria-label` 是“前台文本”，不能只改可见 JSX。

## 3. 方案比较

### 方案 A：直接替换 JSX 字面量

- 改动文件多、速度快。
- 复用标签会重复出现，术语不一致风险高。
- 动态消息与 ARIA 容易漏改。
- 后续增加语言或统一修改成本高。

### 方案 B：轻量自有 i18n 字典 + `t()`（推荐）

- 新建 `src/i18n/`：`messages.ts` 中文单语字典、`index.ts` 极简 `t()` 实现，按需增加 `errors.ts` 错误映射。
- 组件通过 `t('toolbar.export')` 或 `t('layer.duplicate', { name })` 获取文案。
- 字典集中管理、可审计、可类型检查；不增加运行时依赖。
- 适合“当前只需中文、未来可能扩展”的场景。

### 方案 C：引入 i18next/react-i18next

- 生态成熟，支持复数、语言切换、懒加载。
- 对单语诉求偏重，增加依赖、Provider 与初始化复杂度。
- 当前项目没有测试框架，引入后还需要补测试基建。

### 结论

采用 **方案 B**。以“资源字典 + 参数化消息 + 类型键”实现，保留将来接入 i18next 的迁移空间。

## 4. 目标架构

### 4.1 目录结构

```text
src/i18n/
  messages.ts      # 中文消息字典（唯一文案事实源）
  index.ts         # t()、类型、参数插值、locale 常量
  errors.ts        # 底层错误到中文提示的映射（实施时创建）
docs/superpowers/
  specs/2026-11-16-frontend-chinese-localization-design.md
  plans/2026-11-16-frontend-chinese-localization.md
```

### 4.2 消息模型

```ts
// src/i18n/messages.ts
export const zhCN = {
  app: {
    title: 'Liquid Composer：浏览器中的 Liquid Glass 应用图标设计工具',
    panels: '面板',
  },
  toolbar: {
    documentName: '文档名称',
    renameDocument: '重命名文档：{name}',
    background: '背景',
    lightAngle: '光照角度',
    zoom: '缩放',
    export: '导出',
    copyPng: '复制 PNG',
    allAppearances: '所有外观',
    noBackground: 'PNG · 无背景',
  },
  layer: {
    title: '图层',
    actions: '{name} 操作',
    duplicateNamed: '复制 {name}',
    hideNamed: '隐藏 {name}',
    showNamed: '显示 {name}',
    removeNamed: '移除 {name}',
    defaultName: '图层 {index}',
    groupDefaultName: '组 {index}',
    copySuffix: '{name} 副本',
  },
  // ...
} as const;
```

### 4.3 `t()` 接口

```ts
// src/i18n/index.ts
import { zhCN } from './messages';

export const LOCALE = 'zh-CN';

export function t(key: string, params?: Record<string, string | number>): string {
  const template = key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, zhCN);

  if (typeof template !== 'string') {
    if (import.meta.env.DEV) console.warn(`[i18n] 缺少文案键：${key}`);
    return key;
  }

  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params && name in params ? String(params[name]) : `{${name}}`,
  );
}
```

### 4.4 为什么用扁平键而非 React Context

- 编辑器只有一种语言，无需订阅语言变化；
- `t()` 在事件处理器、非组件函数、引擎错误映射中同样可用；
- 不引入 Provider 层级，不改变现有组件树；
- 字典键集中，仍可由 TypeScript 约束。

### 4.5 类型安全

为 `t()` 增加字面量键约束：

```ts
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<typeof zhCN>;
```

实现可用 `MessageKey` 作为参数类型；若初始迁移工作量过大，可先允许 `string`，在 `t()` 内开发态告警，迁移完成后再收紧。

## 5. 翻译规范

### 5.1 术语表（必须统一）

| 英文 | 中文 | 说明 |
|---|---|---|
| Liquid Composer | Liquid Composer | 产品名不译 |
| Liquid Glass | Liquid Glass | Apple 材质名不译 |
| Icon Composer | Icon Composer | Apple 产品名不译 |
| Canvas | 画布 | |
| Layers | 图层 | |
| Inspector | 检查器 | |
| Composition | 构图 | |
| Opacity | 不透明度 | |
| Blend / Blend Mode | 混合 / 混合模式 | |
| Fill | 填充 | |
| Gradient | 渐变 | |
| Solid | 纯色 | |
| Position | 位置 | |
| Scale | 缩放 | |
| Visible | 可见 | |
| Specular | 高光 | |
| Refraction | 折射 | |
| Strength | 强度 | |
| Height | 高度 | |
| Blur | 模糊 | |
| Translucency | 半透明 | |
| Shadow | 阴影 | |
| Highlights | 高光 | 高级面板分组名 |
| Light intensity | 光照强度 | |
| Edge definition | 边缘清晰度 | |
| Frostiness | 磨砂感 | |
| Dispersion | 色散 | |
| Appearance | 外观 | |
| Default | 默认 | |
| Dark | 深色 | |
| Clear | 透明 | |
| Tinted | 着色 | |
| Light | 浅色 | |
| Background | 背景 | |
| Presets | 预设 | |
| Hue | 色相 | |
| Tint | 着色量 | 背景参数上下文 |
| Brightness | 亮度 | |
| Direction | 方向 | |
| Intensity | 强度 | |
| Snap to center | 吸附到中心 | |
| Shape Library | 形状库 | |
| SF Symbols | SF Symbols | Apple 符号集名不译 |
| Export | 导出 | |
| Open | 打开 | |
| Rename | 重命名 | |
| Duplicate | 复制 | 图层命令用“复制”；副本名称用“副本” |
| Remove / Delete | 删除 | 统一用“删除” |
| Bring Forward | 上移一层 | |
| Send Backward | 下移一层 | |
| Bring to Front | 移到最前 | |
| Send to Back | 移到最后 | |
| Copy Style | 复制样式 | |
| Paste Style | 粘贴样式 | |
| Auto-save | 自动保存 | |
| Platform variants | 平台变体 | |
| Apple platform set | Apple 平台图集 | |
| All Appearances | 所有外观 | |
| No Background | 无背景 | |
| ZIP | ZIP | 格式名不译 |
| PNG / JPEG | PNG / JPEG | 格式名不译 |

### 5.2 风格规则

1. 采用简体中文、界面用词简洁，避免“您/请”等冗余敬语。
2. 菜单项使用动宾结构：`复制样式`、`重置文档`。
3. 设置项使用名词：`不透明度`、`折射`、`着色量`。
4. 中英文混排时，英文与数字两侧各留一个半角空格：`导出 PNG`、`1024 px`。
5. 单位保留惯例：`%`、`°`、`px` 不译。
6. 省略号使用中文场景下的 `…`，例如 `打开 .icon…`。
7. 动态名称不强制加引号；错误消息中的图层名使用中文引号 `「」` 以避免嵌套冲突。
8. 技术错误保留原始错误码或英文底层信息时，用中文前缀说明：`无法导入 .icon：{detail}`。

### 5.3 复数与量词

中文无复数变化。英文的 `layer/layers` 统一为：

```ts
layerCount: '{count} 个图层'
```

`Showing 1–56 of 6,404` 处理为：

```ts
glyphRange: '{start}–{end}，共 {total} 个字符'
```

## 6. 数据边界与特殊处理

### 6.1 保持英文的值

以下值不得翻译：

- `AppearanceMode`、`BlendMode`、`IconPlatform` 等联合类型值；
- `PlatformProfile.id`、`.previewClass`；
- `gradientType: "linear" | "radial"`；
- `src/agent/recipe.ts` 中的 schema 键；
- `liquid-composer-layer:` 剪贴板前缀；
- localStorage / IndexedDB 键；
- `.icon` 包内 `icon.json` 的字段与资产路径。

### 6.2 需要显示翻译的值

- `PLATFORM_PROFILES[].label`、`.shortLabel`：显示层用 `t()` 映射；`id` 保持英文。
- `LIGHT_ANGLE_LABELS`：值改为中文，或改为键名 + `t()`。推荐键名方案：
  ```ts
  export const LIGHT_ANGLE_KEYS = {
    90: 'light.top',
    45: 'light.topRight',
    // ...
  } as const;
  ```
- `SYSTEM_COLORS` / `PRESET_COLORS`：`label` 作为消息键，渲染时 `t(labelKey)`。
- `BLEND_MODES`：`value` 保持英文，`label` 改为消息键。
- `RENDITION_NAMES`：保留英文 ZIP 目录名。UI 的“所有外观”菜单如需列出外观名，另设显示映射。

### 6.3 导出文件名

- 文档导出 `.icon` 的用户可见基名可保留用户输入的中文；`safeName()` 只替换非法文件名字符，不强制 ASCII。
- 为兼容部分工具，ZIP 内资产文件名可继续使用 `Layer`、`Radial Background` 等英文；这些是包内技术名称，不属于前台 UI。若产品要求 ZIP 内也中文，应单独立项并验证 Icon Composer 兼容性。
- 单张导出的 `icon-1024.png` 等保持英文文件名，避免破坏脚本与用户既有流程。

### 6.4 自动名称

- 新文档：`未命名`
- 新图层：`图层 {n}`
- 新组：`组 {n}`
- 形状库生成图层名：`矩形`、`圆形`、`三角形`、`方形`、`菱形`、`六边形`、`星形`、`加号`、`直线`
- 复制图层：`{name} 副本`
- 导入时缺失名称：`图层 {n}`、`组 {n}`

注意：自动名称会进入文档历史与导出。若用户从英文版升级，旧文档中的英文名称保持不变，不自动迁移。

### 6.5 错误与状态

底层错误对象保持英文，UI 层做映射：

```ts
const IMPORT_ERROR_MAP: Record<string, string> = {
  'No icon.json found in the archive.': '压缩包中未找到 icon.json。',
  'icon.json is not a valid Icon Composer document.': 'icon.json 不是有效的 Icon Composer 文档。',
  'This document uses features from a newer version of Icon Composer':
    '该文档使用了较新版本 Icon Composer 的功能，当前版本无法打开。',
};
```

无法映射的错误统一：

```ts
notify(`无法打开 .icon：${detail}`);
```

其中 WebGL2 错误提示拆成两部分：

```ts
webglUnavailable: 'WebGL2 不可用：{detail}。Liquid Glass 将在无折射模式下渲染。'
unknownError: '未知错误'
```

`detail` 可能来自 GPU 驱动英文日志，保留原文有助于排障；外层说明必须中文。

## 7. 组件改造策略

### 7.1 通用控件

- `ColorPicker`：`label` 调用方传中文；内部 `Standard`、`Recent`、`Pick color from screen`、`No recent colors`、系统色名全部走 `t()`。
- `NumberInput`：`Drag to change` 走 `t('common.dragToChange')`。
- `Slider`：默认 `"Slider"` 回退改为 `t('common.slider')`；`value` 后缀改为参数化消息。
- `Select`：不改逻辑，仅翻译调用方 `label`。
- `Toggle`：`ariaLabel` 由调用方保证中文。

### 7.2 布局

- `TopToolbar`：最复杂，按区域迁移：文档名 → 背景 → 光照 → 缩放 → 平台 → 导出。
- `BottomBar`：外观模式、浅色/深色、色相/着色量/亮度、`aria-label`。
- `AppLayout`：移动端标签与 `Panels`。
- `LeftPanel`：`Layers`。

### 7.3 图层

- `LayerTree`：导入区、重置区、自动保存、空组、头部按钮、画布按钮。
- `LayerItem`：右键菜单、折叠/展开、复制/隐藏/删除的 ARIA、重命名提示。
- `LayerMenu`：不内置文案，使用 `items[].label` 传入。
- `ShapeLibrary`：形状名、吸附、字体状态、分页、搜索 placeholder、错误消息。

### 7.4 检查器

- `InspectorPanel`：标题、空状态、外观提示。
- `CompositionSection`：`Composition`、`Visible`、`Name`、`Position`、`Scale`、ARIA。
- `ColorSection`：混合模式、填充类型、渐变样式、颜色相关 ARIA。
- `LiquidGlassSection`：所有玻璃参数、分段按钮、高级分组、说明文字、重置。
- `BackgroundControls`：渐变样式、纯色/渐变、预设色名、色相/着色量/亮度、渐变停靠点、光照。
- `RefractionPad`：2D 滑块 ARIA、拖动提示、Strength/Height。

### 7.5 画布

- `IconCanvas`：WebGL2 提示、拖放提示、Grid、Light/Dark、`aria-label`。

### 7.6 应用外壳

- `index.html`：`lang="zh-CN"`、`<title>`、`description`、`og:description`。
- `public/manifest.webmanifest`：`description` 中文；`name`/`short_name` 保留产品名。
- `electron/main.cjs`：窗口标题中文；原生菜单使用显式中文 `label`，不再仅依赖 `role` 的自动文案。
- `src/pages/index.astro`：该文件当前未被 Vite 入口使用，但属于项目内可构建页面，若保留则同步修改 `lang` 与描述；若确认废弃，在方案落地时删除或标注，不在本轮扩大范围。

## 8. 无障碍与语言属性

1. `index.html` 设置 `<html lang="zh-CN">`。
2. 若存在 `src/pages/index.astro`，同步设置为 `zh-CN`。
3. 所有 `aria-label`、`aria-roledescription`、`title`、`placeholder` 使用中文。
4. 动态 ARIA 采用参数化消息，避免出现 `复制 ${name}` 这类半中文半英文。
5. `select` 的选项值保持英文，仅标签中文，键盘 typeahead 仍按中文标签匹配（`Select` 已按 `label` 匹配，无需改逻辑）。
6. 颜色名、方向名等短标签翻译后仍应可通过首字快速定位。

## 9. 字体与排版

### 9.1 字体栈调整

在 `src/styles/global.css` 的 `:root` 与 `--font-system` 中补充中文字体：

```css
font-family:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
    "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", sans-serif;
```

顺序原则：Apple 平台优先 `PingFang SC`，Windows 回退 `Microsoft YaHei`，Linux 回退 `Noto Sans SC`。

### 9.2 排版检查点

- 280px 检查器宽度下，最长标签（如 `渐变半透明度`、`边缘清晰度`）不换行溢出。
- 10px/11px 小字号下中文仍清晰；必要时将 `text-2xs` 从 10px 调整到 11px，但需单独评估布局。
- 导出菜单、平台菜单、右键菜单不出现截断。
- 按钮内图标与中文之间保留间距。

## 10. 测试与验收策略

### 10.1 自动化

由于项目当前无测试框架，采用 **审计脚本 + 构建 + 浏览器截图** 三层验证，不引入重型测试依赖：

1. **构建**
   - `npm run build`
   - `npm run build:desktop`
2. **静态文案审计**
   - 新增 `scripts/i18n-audit.mjs`：
     - 扫描 `src/components/**/*.tsx`、`src/components/**/*.ts`、`src/store/*.ts`、`src/engine/IconDocument.ts`、`index.html`、`public/manifest.webmanifest`、`electron/main.cjs`；
     - 匹配 JSX 文本、`aria-label`、`title`、`placeholder`、`alert/confirm`、常见英文句子；
     - 允许白名单：品牌名、技术专名、数据值、CSS/SVG 属性、日志。
   - 命令：`node scripts/i18n-audit.mjs`，退出码 0 表示通过。
3. **运行时冒烟**
   - 启动 `npm run dev`；
   - 使用 Playwright 打开页面，依次切换：画布、图层、检查器、背景、玻璃高级、形状库、颜色选择器、导出菜单、平台菜单、移动端宽度；
   - 截图并人工核对；
   - 断言 `document.documentElement.lang === 'zh-CN'`；
   - 断言关键按钮文本为中文。

### 10.2 手工验收清单

- [ ] 顶部工具栏所有文本与 tooltip
- [ ] 文档名重命名、未保存提示
- [ ] 背景弹层全部控件
- [ ] 光照角度菜单八方向
- [ ] 缩放菜单
- [ ] 平台变体菜单
- [ ] 导出菜单（含 `.icon`、平台图集、所有外观）
- [ ] 图层面板头部、导入区、设置弹层、右键菜单、空组提示
- [ ] 形状库与 SF Symbols 分页、搜索、字体错误
- [ ] 检查器：构图、颜色、玻璃、折射、高级
- [ ] 底部外观模式、浅色/深色、着色滑块
- [ ] 画布 Grid、拖放提示、WebGL2 错误
- [ ] 重置确认、非法导入弹窗
- [ ] 浏览器标签标题、PWA 安装信息、Electron 窗口标题
- [ ] 屏幕阅读器抽查 5 个控件
- [ ] 280px 侧栏与 960px 最小桌面窗口无溢出

## 11. 分阶段实施

| 阶段 | 内容 | 退出条件 |
|---|---|---|
| 0 | 建立 `src/i18n`、术语表、审计脚本 | `t()` 可用，审计脚本能跑 |
| 1 | 通用控件与布局 | 顶部/底部/标签栏中文 |
| 2 | 图层与形状库 | 图层、右键菜单、形状库中文 |
| 3 | 检查器与画布 | 所有参数与状态中文 |
| 4 | 存储、引擎错误、动态名称 | 弹窗与默认名中文 |
| 5 | 应用外壳与 README | 元数据、Electron、文档中文 |
| 6 | 字体、截图、回归 | 构建通过，验收清单完成 |

## 12. 风险与回滚

| 风险 | 缓解 |
|---|---|
| 翻译破坏数据值 | 只改显示标签；对 `RENDITION_NAMES`、`PlatformProfile.id` 加注释与审计白名单 |
| 漏掉动态字符串 | 参数化消息统一进字典；审计脚本覆盖 `alert/confirm` 与模板字符串 |
| 中文导致布局溢出 | 280px/960px 截图；必要时缩短文案 |
| 字体回退不一致 | 显式中文字体栈；Windows/macOS 各截图一次 |
| Electron 菜单仍英文 | 自定义 `label`，不依赖 `role` 自动文案 |
| 无 Git 无法回滚 | 修改前复制项目目录或建立本地 Git 仓库；文档中记录基线 |

## 13. 交付物

1. `docs/superpowers/specs/2026-11-16-frontend-chinese-localization-design.md`（本文件）
2. `docs/superpowers/plans/2026-11-16-frontend-chinese-localization.md`（实施计划）
3. 后续代码改动与审计脚本（按计划执行）

## 14. 待确认事项

以下事项已在本次会话中确认：

- [x] 全中文单语，仅保留品牌/技术专名
- [x] 使用轻量自有 i18n 字典 + `t()`
- [x] 同步处理 ARIA、PWA、Electron、README

实施时的默认决策（已在计划中锁定，如需变更应回写本节）：

- ZIP 内目录名保持英文（`Default/`、`Dark/`、`ClearLight/`、`ClearDark/` 等），以保证 Icon Composer 与既有脚本兼容。
- `src/pages/index.astro` 当前不是 Vite 入口，但属于项目内页面，计划中同步中文化；若确认废弃，应在独立任务中删除，而不是保留英文。
- Electron 原生菜单按“全部中文”实施，通过显式 `label` 覆盖系统默认文案。
