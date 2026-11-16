# 中文化验收记录

日期：2026-11-16  
构建版本：`3acfd8b`（Task 14 完成后的提交；Task 15 验收变更随后单独提交）  
规范：`docs/superpowers/specs/2026-11-16-frontend-chinese-localization-design.md`  
计划：`docs/superpowers/plans/2026-11-16-frontend-chinese-localization.md`

## 验收结论

通过。所有前台可见文本、辅助文本、原生弹窗、应用元数据与 README 已完成简体中文化；持久化值、渲染算法和导出格式保持原样。

## 自动化验证

| 命令 | 结果 |
|---|---|
| `npx tsc --noEmit` | 通过 |
| `npm run i18n:audit` | 通过：`i18n 审计通过：未发现已知路径中的英文前台文案。` |
| `npm run build` | 通过（Vite 生产构建） |
| `npm run build:desktop` | 通过（`--base=./`） |
| `node scripts/i18n-smoke.cjs` | 通过：`运行时冒烟通过` |

冒烟脚本断言内容：

- `html[lang="zh-CN"]`；
- 主页包含“图层 / 检查器 / 导出 / 背景 / 画布 / 未命名”，且不含对应英文；
- 新增图层名为“图层 1”，新增组名为“组 1”；
- 检查器包含“构图 / 颜色 / 不透明度 / 混合 / 填充 / 折射 / 模糊 / 半透明”；
- 右键菜单包含“重命名 / 隐藏 / 剪切 / 复制 / 粘贴 / 移到最前 / 删除”，且不含英文；
- 导出菜单包含“复制 PNG / 所有外观 / Apple 平台图集 / 导出 .icon / 打开 .icon…”；
- 光照菜单八个方向全部中文；
- 960×600 无横向溢出；
- 375×812 移动端标签为“画布 / 图层 / 检查器”。

## 手工与专项验证

| 项目 | 结果 |
|---|---|
| 顶部工具栏与文档名 | 通过：`未命名`、`背景`、`0°`、`100%`、`iOS + Mac`、`导出` |
| 背景弹层：纯色模式 | 通过：14 个预设色名、色相/着色量/亮度、自定义颜色 |
| 背景弹层：渐变模式 | 通过：色标、添加渐变停靠点、渐变方向、方向性背景光、方向、强度 |
| 光照 / 缩放 / 平台 / 导出菜单 | 通过 |
| 图层面板、行内按钮与右键菜单 | 通过 |
| 重置确认弹窗 | 通过：`重置文档及所有已保存的数据？此操作无法撤销。` |
| 非法 `.icon` 导入弹窗 | 通过：`导入失败：invalid zip data`（底层技术细节保留） |
| 形状库 | 通过：九个形状、吸附开关、SF Symbols 说明、分页与字体错误提示 |
| 检查器构图 / 颜色 | 通过 |
| Liquid Glass / 折射 / 高级面板 | 通过；折射二维滑块的 ARIA 与提示为中文 |
| 画布网格 | 通过：`网格`、`浅色`、`网格样式：浅色` |
| WebGL2 降级文案 | 通过：字典为 `WebGL2 不可用：{detail}。Liquid Glass 将在无折射模式下渲染。`；未知错误为“未知错误” |
| 浏览器标题 | 通过：`Liquid Composer：浏览器中的 Liquid Glass 应用图标设计工具` |
| PWA manifest | 通过：`lang: zh-CN`，中文描述 |
| Electron 窗口标题 | 通过：`Liquid Composer：浏览器中的 Liquid Glass 应用图标设计工具` |
| Electron 菜单 | 通过：文件 / 编辑 / 视图 / 窗口及各子项均为中文 |
| 字体与排版 | 通过：中文字体回退生效；1440×900、960×600、375×812 无横向溢出 |
| README | 已整篇中文化；命令、URL、徽章与导出目录名保持原样 |

## 截图

- 1440×900：`screenshots/i18n-desktop.png`
- 960×600：`screenshots/i18n-compact.png`
- 375×812：`screenshots/i18n-mobile.png`
- 过程截图：`task3-mobile.png`、`task4-export-menu.png`、`task4-light-menu.png`、`task5-layer-menu.png`、`task6-shape-library.png`、`task7-inspector.png`、`task8-glass.png`、`task9-background.png`、`task10-grid.png`、`task14-1440.png`、`task14-960.png`

## 数据与技术边界

以下内容有意保持英文，不计为遗漏：

- 持久化值：`normal`、`multiply`、`inside`、`outside`、`tintedLight`、`linear`、`radial` 等；
- 存储键：`liquid-composer-recent-colors`、localStorage / IndexedDB 键；
- `.icon` 包资产名与 ZIP 目录：`Default/`、`Dark/`、`ClearLight/`、`ClearDark/`、`TintedLight/`、`TintedDark/`、`Radial Background.png`；
- 剪贴板协议前缀：`liquid-composer-layer:`；
- 底层错误与调试日志：`invalid zip data`、`WebGL2 error:`、Shader 编译详情、`Export failed for image/...`；
- 代理 JSON API 的错误码与英文 `message` 字段（供代理消费，不进入界面弹窗）；
- 品牌与技术专名：`Liquid Composer`、`Liquid Glass`、`Icon Composer`、`SF Symbols`、`iOS`、`macOS`、`Apple Watch`、`PNG`、`JPEG`、`ZIP`、`WebGL2`、`TTF`、`OTF`。

## 遗留问题

无阻塞遗留问题。

说明：

1. 当前运行环境设置了 `ELECTRON_RUN_AS_NODE=1`，直接运行 Electron 会进入 Node 模式；验收时通过 `env -u ELECTRON_RUN_AS_NODE` 启动，并确认窗口标题、页面语言与菜单均为中文。该环境变量不影响打包后的桌面应用。
2. 开发服务器在 README 原子写入期间曾因 Windows 文件监听 `EBUSY` 退出一次；随后改用 `vite preview` 验证生产构建，构建与运行均正常。
