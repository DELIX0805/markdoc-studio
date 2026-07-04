# MarkDoc Studio

中文 | [English](#english)

MarkDoc Studio 是一款面向 Windows 的本地离线 Markdown 排版工具。它用于打开单个 Markdown 文件，进行左右分栏预览和排版配置，并导出为 PDF 或 DOCX，适合个人和小团队处理技术方案、学习笔记、交付文档和内部报告。

## 功能特性

- 打开单个 `.md`、`.markdown` 或 `.txt` 文件。
- 左侧 Markdown 源码可编辑，右侧为分页预览。
- 支持标题、段落、列表、表格、引用、代码块、图片、数学公式和 Mermaid 图表。
- 支持代码高亮、目录、页眉、页脚和页码。
- 支持字体、字号、页边距、标题缩放、代码主题、表格样式等排版配置。
- 支持本地离线导出 PDF，输出效果尽量贴近预览。
- 支持结构化导出 DOCX，保留标题、列表、表格、图片、代码块、目录和 Mermaid 图表，方便在 Word / WPS 中继续编辑。
- 支持相对路径图片检查、缺失图片提示、最近文件重开、阅读视图和内容感知同步滚动。
- 样式配置保存到本地，下次打开仍然保留。

## 技术栈

- Tauri 2
- React 19
- Vite 6
- Markdown-it
- Mermaid
- KaTeX
- Highlight.js
- jsPDF / html2canvas
- docx

## 开发环境

需要安装：

- Node.js
- Rust / Cargo
- Microsoft C++ Build Tools

安装依赖：

```powershell
npm install
```

启动前端开发服务：

```powershell
npm run dev
```

启动 Tauri 开发版：

```powershell
npm run tauri:dev
```

构建前端：

```powershell
npm run build
```

构建 Windows 单文件运行版：

```powershell
npm run tauri:build -- --no-bundle
```

构建后的主程序通常位于：

```text
src-tauri/target/release/markdoc-studio.exe
```

## 当前范围

- 首版聚焦单文件 Markdown 转换，不做批量转换、知识库发布或云同步。
- PDF 导出优先保证与预览的视觉一致性。
- DOCX 导出优先保留可编辑结构；复杂数学公式会以可读文本形式保留，后续可继续增强为 Word 原生公式。
- 应用以本地离线和绿色便携为主要目标。

## 作者

- 作者：童Sir无欺
- 邮箱：delix_t@foxmail.com

## License

This project is source-available under the PolyForm Noncommercial License 1.0.0. You may use, copy, modify, and share it for noncommercial purposes. Commercial use requires prior written permission from the author. See [LICENSE](./LICENSE).

本项目采用 PolyForm Noncommercial License 1.0.0 公开源码。你可以将本项目用于学习、研究、个人使用和其他非商业用途；如需商业使用，请先获得作者书面授权。详见 [LICENSE](./LICENSE)。

---

## English

MarkDoc Studio is a local offline Markdown formatting tool for Windows. It opens a single Markdown file, provides a split source/preview workspace, allows layout customization, and exports to PDF or DOCX. It is designed for personal and small-team technical proposals, study notes, delivery documents, and internal reports.

## Features

- Open a single `.md`, `.markdown`, or `.txt` file.
- Edit Markdown source on the left and preview paginated output on the right.
- Support headings, paragraphs, lists, tables, blockquotes, code blocks, images, math formulas, and Mermaid diagrams.
- Support code highlighting, table of contents, headers, footers, and page numbers.
- Configure fonts, body size, margins, heading scale, code theme, table style, and related layout settings.
- Export PDF locally and offline, with output kept as close to the preview as possible.
- Export structured DOCX with editable headings, lists, tables, images, code blocks, table of contents, and Mermaid diagrams for further editing in Word / WPS.
- Support relative image path checks, missing image hints, recent file reopening, reading view, and content-aware synchronized scrolling.
- Persist style settings locally for future sessions.

## Tech Stack

- Tauri 2
- React 19
- Vite 6
- Markdown-it
- Mermaid
- KaTeX
- Highlight.js
- jsPDF / html2canvas
- docx

## Development

Requirements:

- Node.js
- Rust / Cargo
- Microsoft C++ Build Tools

Install dependencies:

```powershell
npm install
```

Run the frontend dev server:

```powershell
npm run dev
```

Run the Tauri development app:

```powershell
npm run tauri:dev
```

Build the frontend:

```powershell
npm run build
```

Build a Windows single-file executable:

```powershell
npm run tauri:build -- --no-bundle
```

The executable is usually generated at:

```text
src-tauri/target/release/markdoc-studio.exe
```

## Current Scope

- The first version focuses on single-file Markdown conversion, not batch conversion, knowledge-base publishing, or cloud sync.
- PDF export prioritizes visual consistency with the preview.
- DOCX export prioritizes editable document structures. Complex math formulas are currently preserved as readable text and can be enhanced into native Word equations later.
- The app is designed primarily for local offline and portable usage.

## Author

- Author: 童Sir无欺
- Email: delix_t@foxmail.com

## License

This project is source-available under the PolyForm Noncommercial License 1.0.0. You may use, copy, modify, and share it for noncommercial purposes. Commercial use requires prior written permission from the author. See [LICENSE](./LICENSE).
