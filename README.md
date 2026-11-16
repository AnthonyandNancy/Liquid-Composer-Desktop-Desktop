<p align="center">
  <img src="public/icon-512.png" width="110" alt="Liquid Composer 图标" />
</p>

<h1 align="center">Liquid Composer</h1>

<p align="center">在浏览器或桌面端设计 Liquid Glass 应用图标。</p>

<p align="center"><a href="https://liquid-composer-new.vercel.app/"><b>liquid-composer-new.vercel.app</b></a></p>

<p align="center"><img alt="静态构建通过徽章" src="https://img.shields.io/badge/Build-Passing-brightgreen"> <img alt="支持的桌面系统徽章" src="https://img.shields.io/badge/Supported%20OS-Windows-blue"> <img alt="支持状态徽章" src="https://img.shields.io/badge/Supported%3B%20No%20release-macOS%2C%20Linux-orange">
 <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript 图标"> <img alt="网站状态徽章" src="https://img.shields.io/badge/Web-Live-green"> </p>

<h3 align="center" > 感谢 <a href="https://github.com/frontedu"><b>@Frontedu</b> </a> 的原始实现</h3>

## Star 历史

<a href="https://www.star-history.com/?repos=mayibane10%2Fliquid-composer-desktop&type=timeline&releases=&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=mayibane10/liquid-composer-desktop&type=timeline&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=mayibane10/liquid-composer-desktop&type=timeline&legend=bottom-right" />
   <img alt="Star 历史图表" src="https://api.star-history.com/chart?repos=mayibane10/liquid-composer-desktop&type=timeline&legend=bottom-right" />
 </picture>
</a>

---

---

Liquid Composer 是 Apple Icon Composer 的 Web 应用复刻版，重现 iOS 27 与 Icon Composer 2 的 Liquid Glass 图标材质。导入你的素材，将其堆叠成图层，引擎会实时渲染玻璃效果：来自上方的光照、勾勒每个形状的高光与暗边、图层之间的折射、背景模糊、半透明以及图层阴影，最终在 iOS 圆角矩形内完成合成。

渲染基于 WebGL2 管线。每个图层轮廓的距离场驱动折射和边缘光照；开启模糊时，两遍可分离高斯模糊会处理该图层下方的所有内容，玻璃合成着色器则在伽马编码的 sRGB 空间中工作，与 Icon Composer 一致。没有 WebGL2 时，应用回退到 Canvas 2D：图层仍保留阴影、半透明与边缘光照，但会失去折射和模糊。

## iOS/watchOS 27 新特性

- 光线从正上方照射。工具栏中的光照角度控件仅用于预览，不会随文档保存
- 顶部和底部边缘的高光，以及定义形状的暗边
- 高光位置：关闭、自动、内部或外部。自动模式在明亮图标背景上选择内部，在深色背景和透明外观中选择外部
- 支持强度和高度可调的折射；强度为负时图像向相反方向弯曲（反向折射）

高光、折射、半透明、模糊和阴影均遵循 Icon Composer 27 的公式与数值。高级面板可缩放高光，并额外提供色散与磨砂感。

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

## 快捷键

`⌘` 在 Windows 和 Linux 上对应 `Ctrl`。

- `⌘Z` / `⇧⌘Z` 撤销和重做
- `⌘D` 复制，`Delete` 删除，`F2` 重命名当前聚焦图层
- `⌘C` / `⌘X` / `⌘V` 复制、剪切和粘贴图层（或粘贴图像）
- 方向键以 1 pt 移动选中图层，按住 `⇧` 为 10 pt
- `⌘]` / `⌘[` 上移一层或下移一层；`⌥⇧⌘F` / `⌥⇧⌘B` 移到最前或移到最后
- `⌥⌘C` / `⌥⌘V` 复制和粘贴样式：玻璃、填充、不透明度和混合模式
- `⌥⌘G` 切换图标网格

## 开始使用（Web 构建）

需要 Node 20.19+ 或 22.12+。

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # 生产构建输出到 dist/
```

## 桌面构建（调试）

```sh
npm install
npm run desktop # 可在任意操作系统运行（仅用于调试）
```

## Windows 构建（发布）

```sh
npm install        # 如尚未安装
npm run dist:win   # NSIS 安装包 + 便携版 .exe
# 输出到 release/
```

## macOS 构建（安装包）

```sh
npm install        # 如尚未安装
npm run dist:mac   # .dmg
# 输出到 release/
```

# Linux 构建（发布）

```sh
npm install        # 如尚未安装
npm run dist:linux # AppImage + .deb
# 输出到 release/
```

## 与 AI 代理配合使用

代理操作与编辑器相同的应用和引擎。一个图标就是一份 JSON 配方：背景、自上而下的图层、玻璃设置和输出。应用配方会替换当前文档，渲染由无头 Chrome 中的 WebGL2 引擎完成。

```sh
npm run build
npm run -s agent -- apply icon.json --out out/       # 按配方输出 PNG、所有外观 ZIP 或 .icon
npm run -s agent -- render icon.json --size 512 --mode dark
npm run -s agent -- import App.icon --render 512
npm run -s agent -- validate icon.json
npm run -s agent -- schema
```

每条命令输出一个 JSON 对象，包含写入的文件、文档状态和所有警告。渲染通过 playwright-core 使用你已安装的 Google Chrome，默认使用 SwiftShader；传入 `--gpu` 可使用 GPU。

- **本地 MCP 服务器。** `node scripts/agent/cli.mjs mcp` 提供 `liquid_apply`、`liquid_update`、`liquid_render`、`liquid_export`、`liquid_import_icon`、`liquid_state` 和 `liquid_schema`，并将预览作为图像返回。配合 Claude Code 使用：`claude mcp add liquid-composer -- node /path/to/liquid-composer/scripts/agent/cli.mjs mcp`
- **远程 MCP 服务器。** `https://liquid-composer.vercel.app/mcp` 会校验配方并返回一个在浏览器中打开图标的链接。配方通过 URL 片段传输，因此不会到达服务器。该服务器不执行渲染
- **技能。** `npx skills add frontedu/liquid-composer` 会教会代理配方格式和工作流程
- **在浏览器中。** 所有构建都会暴露 `window.liquidComposer`（`apply`、`update`、`render`、`export`、`state`、`schema`）。在 URL 后添加 `?agent` 可关闭自动保存

## 工作原理

编辑器使用 Vite、React 19、Tailwind 和 Nanostores。引擎位于 `src/engine/`：

- `IconRenderer.ts` 负责编排合成。它栅格化每个图层、绘制其阴影、解析高光位置，并将下方所有已绘制内容交给每个玻璃图层
- `LiquidGlass.ts` 是 WebGL2 渲染器：为图层轮廓构建跳跃洪泛距离场，用乒乓帧缓冲完成模糊（支持时使用 RGBA16F，关闭模糊时跳过），然后执行玻璃合成通道
- `shaders/` 存放 GLSL ES 3.00 源码。合成通道计算折射、色散、半透明、边缘高光与暗边
- `glassContract.ts` 存放材质常量：高光表、折射与模糊限制、图层阴影
- `IconDocument.ts` 读写 Icon Composer `.icon` 文档

代理 API 位于 `src/agent/`，CLI 与本地 MCP 服务器位于 `scripts/agent/`，远程 MCP 端点位于 `api/mcp.ts`。
