import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import mermaid from "mermaid";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
  FolderOpen,
  Image,
  Link2,
  MoreVertical,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Type,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const appVersion = "0.1.0";

const markdownSeed = `# MarkDoc Studio 使用指南

## 1. 软件简介
MarkDoc Studio 是一款 Windows 本地离线 Markdown 排版工具，用于把单个 Markdown 文件预览、排版，并导出为 PDF 或 DOCX。

它适合编写：

- 技术方案和项目交付文档；
- 学习笔记和内部培训材料；
- 接口说明、部署说明和操作手册；
- 需要代码、表格、公式和流程图混排的文档。

> 文档内容只在本机处理，不依赖云服务，也不会上传文件内容。

## 2. 基本使用流程
1. 点击左上角“打开”，选择一个 \`.md\`、\`.markdown\` 或 \`.txt\` 文件。
2. 在左侧源码区查看或编辑 Markdown 内容。
3. 在右侧分页预览区检查排版效果。
4. 在右侧样式面板调整字体、字号、页边距、页眉页脚和代码主题。
5. 点击“导出 PDF”生成交付版文件，或点击“导出 DOCX”生成可继续编辑的 Word 文档。

## 3. 功能一览
| 功能 | 说明 | 适用场景 |
| ---- | ---- | ---- |
| 分页预览 | 按 A4 / Letter 纸张模拟最终效果 | 导出前检查分页 |
| PDF 导出 | 尽量保持与预览一致 | 对外交付、归档 |
| DOCX 导出 | 保留标题、列表、表格等结构 | Word / WPS 二次编辑 |
| Mermaid 图表 | 支持流程图、时序图等 | 技术流程说明 |
| 数学公式 | 支持 KaTeX 公式渲染 | 算法、数据、权限模型 |
| 相对图片 | 解析 Markdown 文件附近的图片路径 | 技术架构图、截图 |

## 4. Markdown 语法示例
### 4.1 列表和引用
- 支持无序列表；
- 支持有序列表；
- 支持嵌套标题生成目录；
- 支持引用块和分隔线。

> 这个引用块用于验证 PDF 和 DOCX 中的引用样式。

---

### 4.2 JavaScript 示例
\`\`\`javascript
function exportDocument(type, pages) {
  const startedAt = Date.now();
  const result = {
    type,
    pages,
    status: "ready",
  };

  return {
    ...result,
    elapsedMs: Date.now() - startedAt,
  };
}
\`\`\`

### 4.3 Python 示例
\`\`\`python
from pathlib import Path

def collect_markdown_files(folder: str):
    root = Path(folder)
    return [item for item in root.glob("*.md") if item.is_file()]

files = collect_markdown_files("./docs")
print(f"发现 {len(files)} 个 Markdown 文件")
\`\`\`

### 4.4 PowerShell 示例
\`\`\`powershell
$Source = "README.md"
$Target = "README.pdf"

if (Test-Path $Source) {
  Write-Host "准备导出 $Source -> $Target"
} else {
  Write-Warning "Markdown 文件不存在"
}
\`\`\`

### 4.5 SQL 示例
\`\`\`sql
CREATE TABLE export_history (
  id INTEGER PRIMARY KEY,
  file_name TEXT NOT NULL,
  export_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

SELECT file_name, export_type
FROM export_history
ORDER BY created_at DESC;
\`\`\`

### 4.6 JSON 配置示例
\`\`\`json
{
  "paperSize": "A4 (210 x 297 mm)",
  "bodyFont": "思源宋体 SC",
  "bodySize": "11 pt",
  "margins": {
    "top": 25.4,
    "bottom": 25.4,
    "left": 31.8,
    "right": 31.8
  }
}
\`\`\`

## 5. Mermaid 流程图示例
\`\`\`mermaid
flowchart TD
  A[打开 Markdown 文件] --> B[解析标题和内容]
  B --> C[生成分页预览]
  C --> D[选择导出格式]
  D --> E[按页面渲染并写入 PDF]
  D --> F[生成可编辑 Word 结构]
  E --> G[保存到本地]
  F --> G
\`\`\`

## 6. Mermaid 模块图示例
\`\`\`mermaid
flowchart TD
  A[Markdown 文件] --> B[解析内容]
  B --> C[分页预览]
  C --> D[样式配置]
  D --> E[导出 PDF]
  D --> F[导出 DOCX]
  E --> G[本地保存]
  F --> G
\`\`\`

## 7. 数学公式示例
当文档页数为 $n$，单页渲染耗时为 $t_i$，总导出耗时可以估算为：

$$
T = \\sum_{i=1}^{n} t_i + t_{write}
$$

如果需要估算平均单页耗时：

$$
\\bar{t} = \\frac{T - t_{write}}{n}
$$

## 8. 图片路径示例
下面的图片用于验证相对路径图片解析。如果本地没有该图片，软件会显示清晰的缺失图片提示。

![示例架构图](./images/markdoc-studio-architecture.png)

## 9. 导出建议
- 如果文档要发给客户或归档，优先导出 PDF。
- 如果文档后续还要在 Word / WPS 中继续修改，优先导出 DOCX。
- 如果包含大量 Mermaid 图表，导出前先等待右侧预览全部渲染完成。
- 如果包含本地图片，请把图片放在 Markdown 文件所在目录或子目录中。

## 10. 常见问题
### 10.1 为什么 DOCX 和 PDF 不完全一样？
PDF 更偏向视觉一致，DOCX 更偏向可编辑结构。两者目标不同，因此复杂图表和公式的表现可能存在差异。

### 10.2 为什么导出 PDF 需要等待？
PDF 导出会逐页把预览页面渲染成高精度图像。页数越多、图表越复杂，耗时越长。导出期间软件会显示进度。

### 10.3 是否可以离线使用？
可以。核心预览、排版和导出能力均在本机完成。`;

const lines = markdownSeed.split("\n");

const marginKeys = [
  ["top", "上"],
  ["bottom", "下"],
  ["left", "左"],
  ["right", "右"],
];

const toggles = [
  ["toc", "生成目录（TOC）"],
  ["pages", "显示页码"],
  ["header", "页眉"],
  ["footer", "页脚"],
  ["mermaid", "渲染 Mermaid 图表"],
  ["math", "渲染数学公式（KaTeX）"],
  ["imageCheck", "图片路径检查"],
  ["codeLines", "代码行号（打印）"],
];

const bodySizeOptions = ["9 pt", "9.5 pt", "10 pt", "10.5 pt", "11 pt", "11.5 pt", "12 pt", "12.5 pt", "13 pt", "14 pt", "15 pt", "16 pt"];
const standardMargins = { top: 25.4, bottom: 25.4, left: 31.8, right: 31.8 };

const defaultStyleConfig = {
  paperSize: "A4 (210 x 297 mm)",
  bodyFont: "思源宋体 SC",
  bodySize: "11 pt",
  codeTheme: "GitHub Light",
  tableStyle: "简洁（绿）",
  margins: standardMargins,
  headingScale: 100,
  toggles: {
    toc: true,
    pages: true,
    header: true,
    footer: true,
    mermaid: true,
    math: true,
    imageCheck: true,
    codeLines: false,
  },
};

const STYLE_CONFIG_FILE = "markdoc-style-config.json";

function mergeStyleConfig(config) {
  const savedMargins = config?.margins;
  const isOldDefaultMargin =
    savedMargins &&
    ["top", "bottom", "left", "right"].every((key) => Number(savedMargins[key]) === 20);

  return config
    ? {
        ...defaultStyleConfig,
        ...config,
        margins: isOldDefaultMargin ? standardMargins : { ...defaultStyleConfig.margins, ...config.margins },
        toggles: { ...defaultStyleConfig.toggles, ...config.toggles },
      }
    : defaultStyleConfig;
}

function loadStyleConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem("markdoc.styleConfig") || "null");
    return mergeStyleConfig(saved);
  } catch {
    return defaultStyleConfig;
  }
}

function bodySizeToPx(size) {
  const pt = Number.parseFloat(size);
  return `${Number.isFinite(pt) ? pt + 0.5 : 11.5}px`;
}

function bodySizeToDocxHalfPoints(size) {
  const pt = Number.parseFloat(size);
  return Math.round((Number.isFinite(pt) ? pt : 11) * 2);
}

function marginMmToCm(value) {
  return Number((Number(value || 0) / 10).toFixed(2));
}

function marginCmToMm(value) {
  const cm = Number.parseFloat(value);
  return Number.isFinite(cm) ? Number((cm * 10).toFixed(1)) : 0;
}

function bodyFontStack(font) {
  if (font === "Microsoft YaHei UI") return '"Microsoft YaHei UI", "Segoe UI", sans-serif';
  if (font === "Noto Serif SC") return '"Noto Serif SC", "Source Han Serif SC", "SimSun", serif';
  return '"Source Han Serif SC", "SimSun", "Microsoft YaHei UI", serif';
}

function paperSpec(paperSize) {
  if (paperSize?.startsWith("Letter")) {
    return { widthPx: 638, heightPx: 825, pdfFormat: "letter", pageWidthMm: 215.9, pageHeightMm: 279.4 };
  }
  return { widthPx: 620, heightPx: 874, pdfFormat: "a4", pageWidthMm: 210, pageHeightMm: 297 };
}

function extractHeadings(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line, lineIndex) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (!match) return null;
      return {
        id: `heading-${lineIndex}`,
        level: match[1].length,
        text: stripMarkdownInline(match[2]),
        line: lineIndex + 1,
        page: 1,
      };
    })
    .filter(Boolean);
}

function stripMarkdownInline(text) {
  return text
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeTextBytes(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (!data.length) return { text: "", encoding: "UTF-8" };

  if (data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
    return { text: new TextDecoder("utf-8").decode(data.slice(3)), encoding: "UTF-8 BOM" };
  }
  if (data[0] === 0xff && data[1] === 0xfe) {
    return { text: new TextDecoder("utf-16le").decode(data.slice(2)), encoding: "UTF-16 LE" };
  }
  if (data[0] === 0xfe && data[1] === 0xff) {
    return { text: new TextDecoder("utf-16be").decode(data.slice(2)), encoding: "UTF-16 BE" };
  }

  const decodeCandidates = [
    ["UTF-8", "utf-8", true],
    ["GB18030", "gb18030", false],
    ["GBK", "gbk", false],
    ["UTF-16 LE", "utf-16le", false],
  ];

  const decoded = [];
  for (const [label, encoding, fatal] of decodeCandidates) {
    try {
      const text = new TextDecoder(encoding, { fatal }).decode(data);
      const replacementCount = (text.match(/\uFFFD/g) || []).length;
      const controlCount = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
      const cjkCount = (text.match(/[\u3400-\u9FFF]/g) || []).length;
      decoded.push({
        text,
        encoding: label,
        score: replacementCount * 1000 + controlCount * 30 - cjkCount,
      });
    } catch {
      // Try the next encoding. UTF-8 with fatal=true is expected to fail for GBK/ANSI files.
    }
  }

  decoded.sort((a, b) => a.score - b.score);
  return decoded[0] || { text: new TextDecoder().decode(data), encoding: "UTF-8" };
}

function relaxMermaidSvg(svg) {
  svg.classList.add("mermaid-relaxed");
  svg.style.overflow = "visible";
  svg.style.maxWidth = "100%";
  svg.style.background = "transparent";
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.querySelectorAll(".node > rect.basic.label-container").forEach((node) => {
    const width = Number(node.getAttribute("width"));
    const x = Number(node.getAttribute("x"));
    const minWidth = 220;
    if (Number.isFinite(width) && Number.isFinite(x) && width < minWidth) {
      const delta = minWidth - width;
      node.setAttribute("x", String(x - delta / 2));
      node.setAttribute("width", String(minWidth));
    }
    node.setAttribute("rx", "10");
    node.setAttribute("ry", "10");
  });
  svg.querySelectorAll(".node g.label > rect").forEach((node) => {
    node.setAttribute("fill", "none");
    node.setAttribute("stroke", "none");
    node.setAttribute("opacity", "0");
    node.setAttribute("filter", "none");
    node.style.display = "none";
    node.style.fill = "none";
    node.style.stroke = "none";
    node.style.filter = "none";
  });
  svg.querySelectorAll(".node polygon").forEach((node) => {
    const points = (node.getAttribute("points") || "")
      .trim()
      .split(/\s+/)
      .map((point) => point.split(",").map(Number))
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
    if (points.length < 3) return;
    const xs = points.map(([x]) => x);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const minHalfWidth = 116;
    const widened = points.map(([x, y]) => {
      const distance = x - centerX;
      const nextX = Math.abs(distance) < 1 ? x : centerX + Math.sign(distance) * Math.max(Math.abs(distance), minHalfWidth);
      return `${nextX},${y}`;
    });
    node.setAttribute("points", widened.join(" "));
  });
  svg.querySelectorAll("foreignObject").forEach((node) => {
    const x = Number(node.getAttribute("x"));
    const width = Number(node.getAttribute("width"));
    const height = Number(node.getAttribute("height"));
    if (Number.isFinite(x) && Number.isFinite(width)) {
      const minWidth = 224;
      const nextWidth = Math.max(width + 92, minWidth);
      node.setAttribute("x", String(x - (nextWidth - width) / 2));
      node.setAttribute("width", String(nextWidth));
    }
    if (Number.isFinite(height)) {
      node.setAttribute("height", String(Math.max(height, 34)));
    }
    node.style.overflow = "visible";
    node.style.background = "transparent";
    node.querySelectorAll("div").forEach((container) => {
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.justifyContent = "center";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.maxWidth = "none";
      container.style.textAlign = "center";
      container.style.lineHeight = "1.25";
      container.style.whiteSpace = "nowrap";
      container.style.background = "transparent";
      container.style.boxShadow = "none";
      container.style.border = "0";
    });
  });
  svg.querySelectorAll(".node g.label").forEach((node) => {
    const labelBox = node.querySelector("foreignObject");
    if (!labelBox) return;

    const labelWidth = Math.max(Number(labelBox.getAttribute("width")) || 0, 224);
    const labelHeight = Math.max(Number(labelBox.getAttribute("height")) || 0, 40);

    node.setAttribute("transform", "translate(0, 0)");
    labelBox.setAttribute("width", String(labelWidth));
    labelBox.setAttribute("height", String(labelHeight));
    labelBox.setAttribute("x", String(-labelWidth / 2));
    labelBox.setAttribute("y", String(-labelHeight / 2));
  });
  svg.querySelectorAll(".nodeLabel").forEach((node) => {
    node.style.display = "flex";
    node.style.alignItems = "center";
    node.style.justifyContent = "center";
    node.style.width = "100%";
    node.style.height = "100%";
    node.style.textAlign = "center";
    node.style.fontFamily = "Microsoft YaHei UI, SimSun, sans-serif";
    node.style.fontSize = "18px";
    node.style.fontWeight = "700";
    node.style.lineHeight = "1.25";
    node.style.background = "transparent";
    node.style.boxShadow = "none";
    node.querySelectorAll("p").forEach((paragraph) => {
      paragraph.style.margin = "0";
      paragraph.style.width = "100%";
      paragraph.style.textAlign = "center";
      paragraph.style.background = "transparent";
    });
  });
  svg.querySelectorAll(".label, .labelBkg, .nodeLabel, foreignObject, foreignObject *").forEach((node) => {
    node.style.background = "transparent";
    node.style.boxShadow = "none";
  });
  svg.querySelectorAll("text, tspan").forEach((node) => {
    node.style.fontFamily = "Microsoft YaHei UI, SimSun, sans-serif";
    node.style.fontSize = "18px";
    node.style.fontWeight = "700";
    node.setAttribute("text-anchor", "middle");
    node.setAttribute("dominant-baseline", "middle");
  });

  try {
    const box = svg.getBBox();
    if (box.width > 0 && box.height > 0) {
      const isTallFlow = box.height / box.width > 1.16;
      const horizontalPadding = isTallFlow ? 150 : 46;
      const verticalPadding = isTallFlow ? 24 : 34;
      svg.setAttribute(
        "viewBox",
        `${box.x - horizontalPadding} ${box.y - verticalPadding} ${box.width + horizontalPadding * 2} ${
          box.height + verticalPadding * 2
        }`,
      );
      svg.classList.toggle("mermaid-tall-flow", isTallFlow);
      svg.closest(".mermaid")?.classList.toggle("mermaid-tall-flow-wrap", isTallFlow);
      if (isTallFlow) {
        svg.style.maxWidth = "none";
      }
    }
  } catch {
    // Some SVGs may not expose a bbox before layout; keep Mermaid's own viewBox in that case.
  }
}

function mermaidOptions() {
  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: "basis",
      padding: 18,
      nodeSpacing: 52,
      rankSpacing: 30,
    },
    themeVariables: {
      primaryColor: "#eef8f4",
      primaryTextColor: "#14362d",
      primaryBorderColor: "#42a078",
      lineColor: "#5c7d75",
      fontFamily: "Microsoft YaHei UI, SimSun, sans-serif",
      fontSize: "18px",
    },
  };
}

async function renderMermaidBlocks(root = document) {
  const nodes = [...(root?.querySelectorAll?.(".mermaid") || [])].filter((node) => {
    const hasSource = node.textContent.trim().length > 0;
    return hasSource && !node.querySelector("svg") && node.getAttribute("data-rendering") !== "true";
  });

  if (!nodes.length) return 0;

  mermaid.initialize(mermaidOptions());
  nodes.forEach((node) => {
    node.removeAttribute("data-processed");
    node.setAttribute("data-rendering", "true");
  });

  try {
    await mermaid.run({ nodes, suppressErrors: false });
  } finally {
    nodes.forEach((node) => {
      node.removeAttribute("data-rendering");
      node.querySelectorAll("svg").forEach(relaxMermaidSvg);
    });
  }

  return nodes.length;
}

async function settleMermaidBlocks(root = document, timeoutMs = 2500) {
  const startedAt = performance.now();
  while (performance.now() - startedAt < timeoutMs) {
    await renderMermaidBlocks(root);
    const pending = [...(root?.querySelectorAll?.(".mermaid") || [])].filter(
      (node) => node.textContent.trim() && !node.querySelector("svg") && !node.querySelector(".error"),
    );
    if (!pending.length) return true;
    await new Promise((resolve) => window.setTimeout(resolve, 120));
  }
  return false;
}

function blockHeightWithMargins(element) {
  const computed = window.getComputedStyle(element);
  return (
    element.getBoundingClientRect().height +
    parseFloat(computed.marginBottom || "0")
  );
}

function paginationUnits(block) {
  const tagName = block.tagName?.toLowerCase();
  const blockHeight = blockHeightWithMargins(block);

  if (block.classList?.contains("doc-toc") && block.children.length > 1) {
    const computed = window.getComputedStyle(block);
    const chromeHeight =
      parseFloat(computed.paddingTop || "0") +
      parseFloat(computed.paddingBottom || "0") +
      parseFloat(computed.borderTopWidth || "0") +
      parseFloat(computed.borderBottomWidth || "0") +
      parseFloat(computed.marginBottom || "0");
    const children = [...block.children];

    return children.map((child, index) => ({
      html: `<nav class="doc-toc doc-toc-fragment${index === 0 ? " doc-toc-title-fragment" : ""}">${child.outerHTML}</nav>`,
      height: blockHeightWithMargins(child) + (chromeHeight / children.length) + (index === children.length - 1 ? 4 : 0),
    }));
  }

  if ((tagName === "ol" || tagName === "ul") && block.children.length > 1) {
    const computed = window.getComputedStyle(block);
    const listBottom = parseFloat(computed.marginBottom || "0");
    const listStart = Number(block.getAttribute("start") || 1);
    const items = [...block.children].filter((child) => child.tagName?.toLowerCase() === "li");

    return items.map((item, index) => {
      const itemHeight = blockHeightWithMargins(item) + (index === items.length - 1 ? listBottom : 0);
      const startAttr = tagName === "ol" ? ` start="${listStart + index}"` : "";
      return {
        html: `<${tagName}${startAttr} class="split-list-fragment">${item.outerHTML}</${tagName}>`,
        height: itemHeight,
      };
    });
  }

  return [{ html: block.outerHTML, height: blockHeight }];
}

function parseMarkdownTable(lines, startIndex) {
  const rows = [];
  let index = startIndex;

  while (index < lines.length && /^\s*\|.+\|\s*$/.test(lines[index])) {
    const row = lines[index]
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => stripMarkdownInline(cell.trim()));

    if (!row.every((cell) => /^:?-{3,}:?$/.test(cell))) {
      rows.push(row);
    }

    index += 1;
  }

  return { rows, nextIndex: index };
}

async function loadImageForDocx(source, baseDir) {
  const resolved = baseDir && !isRemoteOrDataUrl(source) ? resolveLocalPath(baseDir, source) : source;
  const url = window.__TAURI_INTERNALS__ && !isRemoteOrDataUrl(resolved) ? convertFileSrc(resolved) : resolved;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image not found: ${source}`);
  const blob = await response.blob();
  const data = new Uint8Array(await blob.arrayBuffer());
  const mimeType = blob.type || source.match(/^data:([^;,]+)/i)?.[1] || "";
  const type =
    mimeType.includes("jpeg") || mimeType.includes("jpg")
      ? "jpg"
      : mimeType.includes("gif")
        ? "gif"
        : mimeType.includes("bmp")
          ? "bmp"
          : "png";
  const dimensions = await new Promise((resolve) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(blob);
    image.onload = () => {
      const width = Math.min(420, image.naturalWidth || 420);
      const height = Math.round(((image.naturalHeight || 260) / (image.naturalWidth || 420)) * width);
      URL.revokeObjectURL(objectUrl);
      resolve({ width, height: Math.min(height, 280) });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: 420, height: 220 });
    };
    image.src = objectUrl;
  });

  return { data, dimensions, type };
}

async function blobToUint8Array(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

async function canvasToPngBytes(canvas) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Canvas PNG export failed"));
    }, "image/png");
  });
  return blobToUint8Array(blob);
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function transparentPngFallback() {
  return base64ToUint8Array(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  );
}

async function renderMermaidForDocx(source) {
  mermaid.initialize(mermaidOptions());
  const id = `docx_mermaid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const { svg: svgText } = await mermaid.render(id, source);
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-10000px";
  holder.style.top = "0";
  holder.style.width = "900px";
  holder.style.background = "#ffffff";
  holder.innerHTML = svgText;
  document.body.appendChild(holder);

  try {
    const svg = holder.querySelector("svg");
    if (!svg) throw new Error("Mermaid SVG not generated");
    relaxMermaidSvg(svg);
    const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [];
    const sourceWidth = Number.isFinite(viewBox[2]) && viewBox[2] > 0 ? viewBox[2] : svg.getBoundingClientRect().width || 720;
    const sourceHeight = Number.isFinite(viewBox[3]) && viewBox[3] > 0 ? viewBox[3] : svg.getBoundingClientRect().height || 420;
    const docxWidth = Math.min(520, Math.max(300, sourceWidth * 0.72));
    const docxHeight = Math.min(560, Math.max(160, Math.round((sourceHeight / sourceWidth) * docxWidth)));
    const serialized = new XMLSerializer().serializeToString(svg);

    return {
      data: new TextEncoder().encode(serialized),
      dimensions: { width: Math.round(docxWidth), height: Math.round(docxHeight) },
      type: "svg",
      fallback: {
        data: transparentPngFallback(),
        type: "png",
      },
    };
  } finally {
    holder.remove();
  }
}

function normalizeSlashes(path) {
  return path.replace(/\\/g, "/");
}

function dirname(path) {
  const normalized = normalizeSlashes(path);
  const index = normalized.lastIndexOf("/");
  return index >= 0 ? normalized.slice(0, index) : "";
}

function basename(path) {
  const normalized = normalizeSlashes(path);
  return normalized.split("/").filter(Boolean).pop() || path;
}

function isRemoteOrDataUrl(path) {
  return /^(https?:|data:|blob:|asset:|file:)/i.test(path);
}

function isAbsolutePath(path) {
  return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith("/") || path.startsWith("\\\\");
}

function resolveLocalPath(baseDir, source) {
  if (!baseDir || isRemoteOrDataUrl(source)) return source;
  const normalizedSource = normalizeSlashes(source);
  if (isAbsolutePath(normalizedSource)) return normalizedSource;
  const parts = `${normalizeSlashes(baseDir)}/${normalizedSource}`.split("/");
  const resolved = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  return resolved.join("/");
}

function createMarkdownRenderer({ renderMermaid, renderMath, baseDir, missingImages, showCodeLines }) {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight(code, language) {
      const safeLanguage = language && hljs.getLanguage(language) ? language : "plaintext";
      const highlighted = hljs.highlight(code, { language: safeLanguage }).value;
      if (showCodeLines) {
        const rows = highlighted.replace(/\n$/, "").split("\n");
        const numbered = rows
          .map(
            (line, index) =>
              `<span class="code-row"><span class="code-row-number">${index + 1}</span><span class="code-row-content">${line || " "}</span></span>`,
          )
          .join("");
        return `<pre class="hljs code-numbered"><code>${numbered}</code></pre>`;
      }
      return `<pre class="hljs"><code>${highlighted}</code></pre>`;
    },
  });

  if (renderMath) {
    md.use(markdownItKatex);
  }

  md.core.ruler.after("block", "source_line_attrs", (state) => {
    state.tokens.forEach((token) => {
      if (token.nesting === 1 && token.map?.length) {
        token.attrSet("data-source-line", String(token.map[0] + 1));
      }
    });
  });

  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const language = token.info.trim().split(/\s+/)[0];
    const sourceLine = token.map?.length ? ` data-source-line="${token.map[0] + 1}"` : "";

    if (language === "mermaid" && renderMermaid) {
      return `<div class="mermaid"${sourceLine}>${md.utils.escapeHtml(token.content)}</div>`;
    }

    return defaultFence(tokens, index, options, env, self).replace("<pre", `<pre${sourceLine}`);
  };

  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const source = token.attrGet("src") || "";
    const alt = token.content || source;

    if (missingImages.has(source)) {
      return `<span class="missing-image">缺失图片：${md.utils.escapeHtml(source)}</span>`;
    }

    if (baseDir && source && !isRemoteOrDataUrl(source)) {
      const resolved = resolveLocalPath(baseDir, source);
      token.attrSet("src", window.__TAURI_INTERNALS__ ? convertFileSrc(resolved) : resolved);
      token.attrSet("data-local-path", resolved);
      token.attrSet("alt", alt);
    }

    return defaultImage(tokens, index, options, env, self);
  };

  return md;
}

function IconButton({ children, active, label, onClick }) {
  return (
    <button className={active ? "icon-btn active" : "icon-btn"} onClick={onClick} title={label}>
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button className={checked ? "toggle on" : "toggle"} onClick={() => onChange(!checked)} aria-label="toggle">
      <span />
    </button>
  );
}

function SourcePaneReal({
  content,
  setContent,
  selectedTab,
  setSelectedTab,
  outlineItems,
  onJumpPage,
  searchQuery,
  setSearchQuery,
  editorRef,
  onEditorScroll,
}) {
  const lineNumberRef = useRef(null);
  const lineCount = Math.max(1, content.split(/\r?\n/).length);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return content
      .split(/\r?\n/)
      .map((line, index) => ({ line, lineNumber: index + 1 }))
      .filter((item) => item.line.toLowerCase().includes(query))
      .slice(0, 80);
  }, [content, searchQuery]);

  return (
    <section className="source-pane">
      <div className="pane-tabs">
        <button className={selectedTab === "source" ? "tab active" : "tab"} onClick={() => setSelectedTab("source")}>
          源代码
        </button>
        <button className={selectedTab === "outline" ? "tab active" : "tab"} onClick={() => setSelectedTab("outline")}>
          大纲
        </button>
        <button className={selectedTab === "search" ? "tab active" : "tab"} onClick={() => setSelectedTab("search")}>
          <Search size={15} />
          搜索
        </button>
      </div>

      {selectedTab === "outline" ? (
        <div className="outline">
          {outlineItems.length ? (
            outlineItems.map((item) => (
              <button key={`${item.id}-${item.page}`} className={item.level === 1 ? "outline-item root" : "outline-item"} onClick={() => onJumpPage(item.page)}>
                <span style={{ paddingLeft: `${Math.max(0, item.level - 1) * 12}px` }}>{item.text}</span>
                <small>第 {item.page || 1} 页</small>
              </button>
            ))
          ) : (
            <div className="empty-state">当前文档没有标题</div>
          )}
        </div>
      ) : selectedTab === "search" ? (
        <div className="search-pane">
          <label className="search-box">
            <Search size={15} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="搜索当前 Markdown" />
          </label>
          <div className="search-results">
            {searchQuery.trim() ? (
              searchResults.length ? (
                searchResults.map((item) => (
                  <button key={`${item.lineNumber}-${item.line}`} className="search-result" onClick={() => setSelectedTab("source")}>
                    <small>第 {item.lineNumber} 行</small>
                    <span>{item.line || " "}</span>
                  </button>
                ))
              ) : (
                <div className="empty-state">没有找到匹配内容</div>
              )
            ) : (
              <div className="empty-state">输入关键词后显示结果</div>
            )}
          </div>
        </div>
      ) : (
        <div className="code-editor">
          <pre className="line-gutter" ref={lineNumberRef} aria-hidden="true">
            {Array.from({ length: lineCount }, (_, index) => index + 1).join("\n")}
          </pre>
          <textarea
            ref={editorRef}
            className="markdown-editor"
            value={content}
            spellCheck={false}
            onChange={(event) => setContent(event.target.value)}
            onScroll={(event) => {
              if (lineNumberRef.current) lineNumberRef.current.scrollTop = event.currentTarget.scrollTop;
              onEditorScroll?.(event.currentTarget);
            }}
            aria-label="Markdown 源代码编辑器"
          />
        </div>
      )}
    </section>
  );
}

function DocumentPreview({
  content,
  zoom,
  setZoom,
  margins,
  togglesState,
  headingScale,
  paperRef,
  baseDir,
  missingImages,
  styleConfig,
  currentPage,
  setCurrentPage,
  onPreviewMetrics,
  syncScrollEnabled,
  setSyncScrollEnabled,
  readingView,
  setReadingView,
  previewStageRef,
  onPreviewScroll,
}) {
  const paperClass = `paper ${styleConfig.tableStyle === "细线灰" ? "table-gray" : ""} ${togglesState.codeLines ? "code-lines" : ""}`;
  const previewRef = useRef(null);
  const measureRef = useRef(null);
  const fallbackStageRef = useRef(null);
  const stageRef = previewStageRef || fallbackStageRef;
  const [pages, setPages] = useState([]);
  const spec = paperSpec(styleConfig.paperSize);
  const paperStyle = {
    width: `${spec.widthPx}px`,
    height: `${spec.heightPx}px`,
    padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
    "--heading-scale": headingScale / 100,
    "--body-font": bodyFontStack(styleConfig.bodyFont),
    "--body-size": bodySizeToPx(styleConfig.bodySize),
    "--code-theme-bg": styleConfig.codeTheme === "Solarized Light" ? "#fdf6e3" : "#f8faf9",
    "--code-theme-border": styleConfig.codeTheme === "Solarized Light" ? "#eadfbf" : "#dce4e1",
  };
  const exportPaperStyle = { ...paperStyle, minHeight: `${spec.heightPx}px` };
  const pageStackStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
  };
  const pageStyle = paperStyle;

  const renderedHtml = useMemo(() => {
    const md = createMarkdownRenderer({
      renderMermaid: togglesState.mermaid,
      renderMath: togglesState.math,
      baseDir,
      missingImages,
      showCodeLines: togglesState.codeLines,
    });
    const headings = extractHeadings(content);
    const tocHtml =
      togglesState.toc && headings.length
        ? `<nav class="doc-toc"><strong>目录</strong>${headings
            .map((heading) => `<div class="toc-level-${heading.level}">${md.utils.escapeHtml(heading.text)}</div>`)
            .join("")}</nav>`
        : "";
    return DOMPurify.sanitize(`${tocHtml}${md.render(content)}`, {
      ADD_TAGS: ["math", "semantics", "mrow", "mi", "mo", "mn", "msup", "mfrac", "annotation"],
      ADD_ATTR: ["xmlns", "display", "encoding"],
    });
  }, [baseDir, content, missingImages, togglesState.mermaid, togglesState.math, togglesState.codeLines, togglesState.toc]);

  const documentTitle = useMemo(() => {
    const firstHeading = content.match(/^#\s+(.+)$/m);
    return firstHeading?.[1] || "Markdown 文档";
  }, [content]);

  useLayoutEffect(() => {
    let cancelled = false;
    const paginate = async () => {
      const startedAt = performance.now();
      const measure = measureRef.current;
      const markdown = measure?.querySelector(".rendered-markdown");
      if (!measure || !markdown) {
        setPages([renderedHtml]);
        onPreviewMetrics?.({ pageCount: 1, renderMs: 0, outlineItems: extractHeadings(content) });
        return;
      }
      if (togglesState.mermaid) {
        await settleMermaidBlocks(measure, 3000);
        if (cancelled) return;
      }

      const availableHeight = markdown.clientHeight;
      const blocks = [...markdown.children];
      if (!availableHeight || !blocks.length) {
        setPages([renderedHtml]);
        onPreviewMetrics?.({ pageCount: 1, renderMs: Math.round(performance.now() - startedAt), outlineItems: extractHeadings(content) });
        return;
      }

      const nextPages = [];
      let current = [];
      let currentHeight = 0;

      for (const block of blocks) {
        for (const unit of paginationUnits(block)) {
          if (current.length && currentHeight + unit.height > availableHeight) {
            nextPages.push(current.join(""));
            current = [];
            currentHeight = 0;
          }

          current.push(unit.html);
          currentHeight += unit.height;
        }
      }

      if (current.length) nextPages.push(current.join(""));
      const finalPages = nextPages.length ? nextPages : [renderedHtml];
      const headings = extractHeadings(content).map((heading) => {
        const headingPattern = new RegExp(`<h${heading.level}[^>]*>\\s*${escapeRegExp(heading.text)}\\s*</h${heading.level}>`);
        const pageIndex = finalPages.findIndex((pageHtml) => headingPattern.test(pageHtml));
        return { ...heading, page: pageIndex >= 0 ? pageIndex + 1 : 1 };
      });
      setPages(finalPages);
      onPreviewMetrics?.({
        pageCount: finalPages.length,
        renderMs: Math.max(1, Math.round(performance.now() - startedAt)),
        outlineItems: headings,
      });
    };

    const frame = window.requestAnimationFrame(paginate);
    const delayed = window.setTimeout(paginate, togglesState.mermaid ? 650 : 80);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayed);
    };
  }, [
    renderedHtml,
    margins,
    togglesState.header,
    togglesState.footer,
    styleConfig.bodyFont,
    styleConfig.bodySize,
    styleConfig.paperSize,
    styleConfig.tableStyle,
    headingScale,
    content,
    togglesState.mermaid,
    onPreviewMetrics,
  ]);

  useEffect(() => {
    const page = Math.min(Math.max(1, currentPage || 1), pages.length || 1);
    if (page !== currentPage) {
      setCurrentPage(page);
      return;
    }

    const target = previewRef.current?.querySelector(`[data-page="${page}"]`);
    if (target && stageRef.current) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage, pages.length, setCurrentPage]);

  useEffect(() => {
    if (!togglesState.mermaid) return;
    let cancelled = false;
    const render = async () => {
      if (cancelled) return;
      try {
        await settleMermaidBlocks(previewRef.current, 3000);
        if (!cancelled) await settleMermaidBlocks(paperRef.current, 3000);
      } catch (error) {
        console.error(error);
      }
    };

    const timers = [120, 700, 1400].map((delay) => window.setTimeout(render, delay));

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [renderedHtml, pages.length, togglesState.mermaid]);

  return (
    <section className="preview-pane">
      <div className="preview-toolbar">
        <IconButton
          label={readingView ? "退出阅读视图" : "阅读视图"}
          active={readingView}
          onClick={() => setReadingView((enabled) => !enabled)}
        >
          <BookOpen size={17} />
        </IconButton>
        <IconButton
          label={syncScrollEnabled ? "同步滚动已开启" : "同步滚动已关闭"}
          active={syncScrollEnabled}
          onClick={() => setSyncScrollEnabled((enabled) => !enabled)}
        >
          <Link2 size={16} />
        </IconButton>
        <select value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>
          {[80, 90, 100, 110, 120].map((value) => (
            <option key={value} value={value}>{value}%</option>
          ))}
        </select>
        <IconButton label="Zoom out" onClick={() => setZoom((value) => Math.max(80, value - 10))}>
          <ZoomOut size={16} />
        </IconButton>
        <IconButton label="Zoom in" onClick={() => setZoom((value) => Math.min(120, value + 10))}>
          <ZoomIn size={16} />
        </IconButton>
        <div className="page-switch">
          <button className="page-arrow" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
            <ChevronLeft size={15} />
          </button>
          <input value={currentPage} onChange={(event) => setCurrentPage(Math.min(Math.max(1, Number(event.target.value) || 1), pages.length || 1))} />
          <span>/ {pages.length || 1}</span>
          <button className="page-arrow" onClick={() => setCurrentPage((page) => Math.min(pages.length || 1, page + 1))}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="paper-stage" ref={stageRef} onScroll={(event) => onPreviewScroll?.(event.currentTarget)}>
        <div className="paper-pages" ref={previewRef} style={pageStackStyle}>
          {(pages.length ? pages : [renderedHtml]).map((pageHtml, index) => (
            <article className={`${paperClass} paper-page`} style={paperStyle} key={`${index}-${pageHtml.length}`} data-page={index + 1}>
              {togglesState.header && <div className="doc-header">{documentTitle}</div>}
              <div className="rendered-markdown" dangerouslySetInnerHTML={{ __html: pageHtml }} />
              {togglesState.footer && <div className="doc-footer">{togglesState.pages ? `第 ${index + 1} 页 / 共 ${pages.length || 1} 页` : ""}</div>}
            </article>
          ))}
        </div>
        <article className={`${paperClass} paper-measure`} ref={measureRef} style={paperStyle} aria-hidden="true">
          {togglesState.header && <div className="doc-header">{documentTitle}</div>}
          <div className="rendered-markdown" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          {togglesState.footer && <div className="doc-footer">{togglesState.pages ? "第 1 页 / 共 1 页" : ""}</div>}
        </article>
        <article className={paperClass} ref={paperRef} style={exportPaperStyle}>
          {togglesState.header && <div className="doc-header">{documentTitle}</div>}
          <div className="rendered-markdown" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          {togglesState.footer && <div className="doc-footer">{togglesState.pages ? `第 1 页 / 共 ${pages.length || 1} 页` : ""}</div>}
        </article>
      </div>
    </section>
  );
}

function StylePanel({
  margins,
  setMargins,
  headingScale,
  setHeadingScale,
  togglesState,
  setTogglesState,
  styleConfig,
  setStyleConfig,
  resetStyleConfig,
}) {
  return (
    <aside className="style-panel">
      <div className="panel-title">
        <div>
          <Settings2 size={17} />
          <span>样式</span>
        </div>
        <button title="重置" onClick={resetStyleConfig}>
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="setting-group">
        <label>纸张尺寸</label>
        <select value={styleConfig.paperSize} onChange={(event) => setStyleConfig((current) => ({ ...current, paperSize: event.target.value }))}>
          <option>A4 (210 x 297 mm)</option>
          <option>Letter (8.5 x 11 in)</option>
        </select>
      </div>
      <div className="setting-group">
        <label>页边距（cm）</label>
        {marginKeys.map(([key, label]) => (
          <div className="range-row" key={key}>
            <span>{label}</span>
            <input
              className="number"
              type="number"
              min="1.2"
              max="4"
              step="0.01"
              value={marginMmToCm(margins[key])}
              onInput={(event) => {
                const nextMargin = marginCmToMm(event.currentTarget.value);
                setMargins((current) => ({ ...current, [key]: nextMargin }));
              }}
              onChange={(event) => {
                const nextMargin = marginCmToMm(event.currentTarget.value);
                setMargins((current) => ({ ...current, [key]: nextMargin }));
              }}
            />
            <small>cm</small>
            <input
              type="range"
              min="1.2"
              max="4"
              step="0.01"
              value={marginMmToCm(margins[key])}
              onInput={(event) => {
                const nextMargin = marginCmToMm(event.currentTarget.value);
                setMargins((current) => ({ ...current, [key]: nextMargin }));
              }}
              onChange={(event) => {
                const nextMargin = marginCmToMm(event.currentTarget.value);
                setMargins((current) => ({ ...current, [key]: nextMargin }));
              }}
            />
          </div>
        ))}
      </div>
      <div className="setting-grid">
        <label>
          正文字体
          <select value={styleConfig.bodyFont} onChange={(event) => setStyleConfig((current) => ({ ...current, bodyFont: event.target.value }))}>
            <option>思源宋体 SC</option>
            <option>Microsoft YaHei UI</option>
            <option>Noto Serif SC</option>
          </select>
        </label>
        <label>
          正文字号
          <select value={styleConfig.bodySize} onChange={(event) => setStyleConfig((current) => ({ ...current, bodySize: event.target.value }))}>
            {bodySizeOptions.map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="setting-group">
        <label>标题缩放</label>
        <div className="segmented">
          {[90, 100, 110, 120].map((value) => (
            <button key={value} className={headingScale === value ? "selected" : ""} onClick={() => setHeadingScale(value)}>
              {value}%
            </button>
          ))}
        </div>
      </div>
      <div className="setting-grid">
        <label>
          代码主题
          <select value={styleConfig.codeTheme} onChange={(event) => setStyleConfig((current) => ({ ...current, codeTheme: event.target.value }))}>
            <option>GitHub Light</option>
            <option>Solarized Light</option>
          </select>
        </label>
        <label>
          表格样式
          <select value={styleConfig.tableStyle} onChange={(event) => setStyleConfig((current) => ({ ...current, tableStyle: event.target.value }))}>
            <option>简洁（绿）</option>
            <option>细线灰</option>
          </select>
        </label>
      </div>
      <div className="setting-group toggles">
        {toggles.map(([key, label]) => (
          <div className="toggle-row" key={key}>
            <span>{label}</span>
            <Toggle
              checked={togglesState[key]}
              onChange={(checked) => setTogglesState((current) => ({ ...current, [key]: checked }))}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

function AboutDialog({ onClose }) {
  return (
    <div className="about-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="about-header">
          <div className="about-brand">
            <div className="app-logo small">
              <FileText size={22} />
            </div>
            <div>
              <h2 id="about-title">MarkDoc Studio</h2>
              <p>Markdown 转 DOCX / PDF 排版工具</p>
            </div>
          </div>
          <IconButton label="关闭关于" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </header>

        <div className="about-body">
          <dl className="about-meta">
            <div>
              <dt>版本</dt>
              <dd>{appVersion}</dd>
            </div>
            <div>
              <dt>作者</dt>
              <dd>童Sir无欺</dd>
            </div>
            <div>
              <dt>邮箱</dt>
              <dd>delix_t@foxmail.com</dd>
            </div>
            <div>
              <dt>运行方式</dt>
              <dd>Windows 绿色便携版</dd>
            </div>
            <div>
              <dt>文档处理</dt>
              <dd>本地离线渲染，不上传文档内容</dd>
            </div>
            <div>
              <dt>适用场景</dt>
              <dd>技术方案、学习笔记、交付文档和内部报告</dd>
            </div>
          </dl>

          <div className="about-section">
            <h3>核心能力</h3>
            <p>支持 Markdown 预览、代码高亮、表格、图片、数学公式、Mermaid 图表，以及 PDF 和 DOCX 导出。</p>
          </div>

          <div className="about-section">
            <h3>技术信息</h3>
            <p>基于 Tauri、React、Markdown-it、Mermaid、KaTeX、jsPDF 和 docx 构建。</p>
          </div>

          <div className="about-footer">
            <span>Copyright © 2026 MarkDoc Studio</span>
            <span>For personal and small-team document workflows.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function App() {
  const initialStyle = useMemo(loadStyleConfig, []);
  const [sourceTab, setSourceTab] = useState("source");
  const [zoom, setZoom] = useState(100);
  const [styleConfig, setStyleConfig] = useState(initialStyle);
  const [margins, setMargins] = useState(initialStyle.margins);
  const [headingScale, setHeadingScale] = useState(initialStyle.headingScale);
  const [toast, setToast] = useState("");
  const [fileName, setFileName] = useState("MarkDoc Studio 使用指南.md");
  const [filePath, setFilePath] = useState("");
  const [recentFiles, setRecentFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("markdoc.recentFiles") || "[]");
    } catch {
      return [];
    }
  });
  const [missingImages, setMissingImages] = useState(new Set());
  const [imageCheckState, setImageCheckState] = useState({ status: "ready", total: 0, missing: 0 });
  const [content, setContent] = useState(markdownSeed);
  const [togglesState, setTogglesState] = useState(initialStyle.toggles);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [renderMs, setRenderMs] = useState(0);
  const [outlineItems, setOutlineItems] = useState(() => extractHeadings(markdownSeed));
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnsavedStyle, setHasUnsavedStyle] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showOpenMenu, setShowOpenMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [syncScrollEnabled, setSyncScrollEnabled] = useState(false);
  const [readingView, setReadingView] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const inputRef = useRef(null);
  const paperRef = useRef(null);
  const sourceEditorRef = useRef(null);
  const previewStageRef = useRef(null);
  const syncingScrollRef = useRef(false);
  const syncUnlockTimerRef = useRef(null);
  const suppressDirtyRef = useRef(true);
  const lastSavedStyleRef = useRef(JSON.stringify(initialStyle));

  const baseDir = useMemo(() => (filePath ? dirname(filePath) : ""), [filePath]);
  const currentPath = useMemo(() => {
    if (!filePath) return ["示例文档", fileName];
    const normalized = normalizeSlashes(filePath);
    const parts = normalized.split("/").filter(Boolean);
    if (/^[a-zA-Z]:$/.test(parts[0])) return parts;
    return parts.length ? parts : [fileName];
  }, [fileName, filePath]);

  const handlePreviewMetrics = useCallback((metrics) => {
    setPageCount(metrics.pageCount || 1);
    setRenderMs(metrics.renderMs || 0);
    setOutlineItems(metrics.outlineItems?.length ? metrics.outlineItems : extractHeadings(content));
  }, [content]);

  const updateStyleConfig = useCallback((updater) => {
    setHasUnsavedStyle(true);
    setStyleConfig(updater);
  }, []);

  const editorLineHeight = useCallback((editor) => {
    const computed = window.getComputedStyle(editor);
    const lineHeight = Number.parseFloat(computed.lineHeight);
    if (Number.isFinite(lineHeight)) return lineHeight;
    const fontSize = Number.parseFloat(computed.fontSize);
    return Number.isFinite(fontSize) ? fontSize * 1.58 : 22;
  }, []);

  const lockSyncedScroll = useCallback((source) => {
    syncingScrollRef.current = source;
    if (syncUnlockTimerRef.current) {
      window.clearTimeout(syncUnlockTimerRef.current);
    }
    window.requestAnimationFrame(() => {
      syncUnlockTimerRef.current = window.setTimeout(() => {
        if (syncingScrollRef.current === source) {
          syncingScrollRef.current = null;
        }
        syncUnlockTimerRef.current = null;
      }, 220);
    });
  }, []);

  const handleEditorScroll = useCallback(
    (editor) => {
      const preview = previewStageRef.current;
      if (!syncScrollEnabled || syncingScrollRef.current === "preview" || !editor || !preview) return;

      const line = Math.max(1, Math.floor(editor.scrollTop / editorLineHeight(editor)) + 1);
      const blocks = [...preview.querySelectorAll("[data-source-line]")];
      if (!blocks.length) return;

      const target = blocks.find((block) => Number(block.getAttribute("data-source-line")) >= line) || blocks[blocks.length - 1];
      const previewRect = preview.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      lockSyncedScroll("editor");
      preview.scrollTop += targetRect.top - previewRect.top - 16;
    },
    [editorLineHeight, lockSyncedScroll, syncScrollEnabled],
  );

  const handlePreviewScroll = useCallback(
    (preview) => {
      const editor = sourceEditorRef.current;
      if (!syncScrollEnabled || syncingScrollRef.current === "editor" || !editor || !preview) return;

      const previewRect = preview.getBoundingClientRect();
      const scanLine = previewRect.top + previewRect.height * 0.38;
      const seenLines = new Set();
      const visibleBlocks = [...preview.querySelectorAll(".paper-page .rendered-markdown [data-source-line]")]
        .map((block) => {
          const line = Number(block.getAttribute("data-source-line"));
          const rect = block.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const intersectsScanLine = rect.top <= scanLine && rect.bottom >= scanLine;
          const distance = intersectsScanLine ? 0 : Math.min(Math.abs(rect.top - scanLine), Math.abs(rect.bottom - scanLine), Math.abs(center - scanLine));
          return { block, line, rect, distance, intersectsScanLine };
        })
        .filter(({ line, rect }) => (
          Number.isFinite(line) &&
          rect.bottom >= previewRect.top + 8 &&
          rect.top <= previewRect.bottom - 8
        ))
        .filter(({ line }) => {
          if (seenLines.has(line)) return false;
          seenLines.add(line);
          return true;
        })
        .sort((a, b) => {
          if (a.intersectsScanLine !== b.intersectsScanLine) return a.intersectsScanLine ? -1 : 1;
          return a.distance - b.distance;
        });
      const line = visibleBlocks[0]?.line;
      if (!Number.isFinite(line)) return;

      lockSyncedScroll("preview");
      editor.scrollTop = Math.max(0, (line - 1) * editorLineHeight(editor) - editor.clientHeight * 0.24);
    },
    [editorLineHeight, lockSyncedScroll, syncScrollEnabled],
  );

  useEffect(() => {
    localStorage.setItem("markdoc.recentFiles", JSON.stringify(recentFiles.slice(0, 8)));
  }, [recentFiles]);

  useEffect(() => () => {
    if (syncUnlockTimerRef.current) {
      window.clearTimeout(syncUnlockTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!window.__TAURI_INTERNALS__) return;

    let cancelled = false;

    async function hydrateStyleConfig() {
      try {
        const { BaseDirectory, readTextFile } = await import("@tauri-apps/plugin-fs");
        const text = await readTextFile(STYLE_CONFIG_FILE, { baseDir: BaseDirectory.AppConfig });
        const saved = mergeStyleConfig(JSON.parse(text));

        if (!cancelled) {
          suppressDirtyRef.current = true;
          setStyleConfig(saved);
          setMargins(saved.margins);
          setHeadingScale(saved.headingScale);
          setTogglesState(saved.toggles);
          lastSavedStyleRef.current = JSON.stringify(saved);
          setHasUnsavedStyle(false);
          localStorage.setItem("markdoc.styleConfig", JSON.stringify(saved));
        }
      } catch {
        // No config file yet, or the file is unreadable; localStorage/defaults remain usable.
      }
    }

    hydrateStyleConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const nextConfig = { ...styleConfig, margins, headingScale, toggles: togglesState };
    setStyleConfig(nextConfig);
    if (suppressDirtyRef.current) {
      suppressDirtyRef.current = false;
    } else {
      setHasUnsavedStyle(JSON.stringify(nextConfig) !== lastSavedStyleRef.current);
    }
  }, [headingScale, margins, togglesState]);

  useEffect(() => {
    const matches = [...content.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)/g)].map((match) => match[1]);
    const localImages = matches.filter((source) => !isRemoteOrDataUrl(source));

    if (!togglesState.imageCheck) {
      setMissingImages(new Set());
      setImageCheckState({ status: "ready", total: localImages.length, missing: 0 });
      return;
    }

    if (!baseDir || !window.__TAURI_INTERNALS__) {
      setMissingImages(new Set(localImages));
      setImageCheckState({ status: "done", total: localImages.length, missing: localImages.length });
      return;
    }

    let cancelled = false;
    setImageCheckState({ status: "checking", total: localImages.length, missing: 0 });

    async function checkImages() {
      try {
        const { exists } = await import("@tauri-apps/plugin-fs");
        const missing = [];

        for (const source of localImages) {
          const resolved = resolveLocalPath(baseDir, source);
          const ok = await exists(resolved);
          if (!ok) missing.push(source);
        }

        if (!cancelled) {
          setMissingImages(new Set(missing));
          setImageCheckState({ status: "done", total: localImages.length, missing: missing.length });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setMissingImages(new Set());
          setImageCheckState({ status: "error", total: localImages.length, missing: 0 });
        }
      }
    }

    checkImages();
    return () => {
      cancelled = true;
    };
  }, [baseDir, content, togglesState.imageCheck]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2200);
  }

  function saveStyleConfig() {
    const nextConfig = { ...styleConfig, margins, headingScale, toggles: togglesState };
    localStorage.setItem("markdoc.styleConfig", JSON.stringify(nextConfig));
    setStyleConfig(nextConfig);
    lastSavedStyleRef.current = JSON.stringify(nextConfig);
    setHasUnsavedStyle(false);
    if (window.__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-fs")
        .then(({ BaseDirectory, writeTextFile }) =>
          writeTextFile(STYLE_CONFIG_FILE, JSON.stringify(nextConfig, null, 2), {
            baseDir: BaseDirectory.AppConfig,
          }),
        )
        .catch((error) => console.error(error));
    }
    showToast("样式配置已保存");
  }

  function resetStyleConfig() {
    localStorage.removeItem("markdoc.styleConfig");
    setStyleConfig(defaultStyleConfig);
    setMargins(defaultStyleConfig.margins);
    setHeadingScale(defaultStyleConfig.headingScale);
    setTogglesState(defaultStyleConfig.toggles);
    lastSavedStyleRef.current = JSON.stringify(defaultStyleConfig);
    setHasUnsavedStyle(false);
    if (window.__TAURI_INTERNALS__) {
      import("@tauri-apps/plugin-fs")
        .then(({ BaseDirectory, remove }) => remove(STYLE_CONFIG_FILE, { baseDir: BaseDirectory.AppConfig }))
        .catch(() => {});
    }
    showToast("样式已重置为默认");
  }

  async function loadMarkdownFromPath(selected, { rememberDirectory = true } = {}) {
    const { readFile } = await import("@tauri-apps/plugin-fs");
    const fileBytes = await readFile(selected);
    const { text, encoding } = decodeTextBytes(fileBytes);
    const selectedBaseDir = dirname(selected);
    setFileName(basename(selected) || "未命名.md");
    setFilePath(selected);
    setContent(text || markdownSeed);
    setCurrentPage(1);
    setSearchQuery("");
    setSourceTab("source");
    if (rememberDirectory) {
      localStorage.setItem("markdoc.lastDirectory", selectedBaseDir);
    }
    setRecentFiles((current) => [selected, ...current.filter((item) => item !== selected)].slice(0, 8));
    showToast(`Markdown 已从本地文件载入（${encoding}）`);
  }

  async function openRecentFile(selected) {
    setShowOpenMenu(false);
    if (!window.__TAURI_INTERNALS__ || !isAbsolutePath(selected)) {
      showToast("网页预览模式不能直接重开最近文件，请重新选择文件");
      inputRef.current?.click();
      return;
    }

    try {
      await loadMarkdownFromPath(selected, { rememberDirectory: true });
    } catch (error) {
      console.error(error);
      setRecentFiles((current) => current.filter((item) => item !== selected));
      showToast("最近文件无法读取，已从列表移除");
    }
  }

  async function openMarkdownFile() {
    setShowOpenMenu(false);
    if (!window.__TAURI_INTERNALS__) {
      inputRef.current?.click();
      return;
    }

    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        title: "打开 Markdown 文件",
        defaultPath: localStorage.getItem("markdoc.lastDirectory") || undefined,
        multiple: false,
        filters: [
          {
            name: "Markdown",
            extensions: ["md", "markdown", "txt"],
          },
        ],
      });

      if (typeof selected !== "string") return;

      await loadMarkdownFromPath(selected);
    } catch (error) {
      console.error(error);
      showToast("系统文件选择器不可用，已切换到网页打开方式");
      inputRef.current?.click();
    }
  }

  async function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFilePath("");
    try {
      const buffer = await file.arrayBuffer();
      const { text, encoding } = decodeTextBytes(buffer);
      setContent(text || markdownSeed);
      setCurrentPage(1);
      setSearchQuery("");
      setSourceTab("source");
      setRecentFiles((current) => [file.name, ...current.filter((item) => item !== file.name)].slice(0, 8));
      showToast(`Markdown 已载入，预览已刷新（${encoding}）`);
    } catch (error) {
      console.error(error);
      showToast("Markdown 读取失败，请检查文件权限或编码");
    }
  }

  async function saveBytes(path, bytes) {
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    await writeFile(path, bytes);
  }

  function downloadBytes(file, bytes, mimeType) {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function outputBaseName() {
    return fileName.replace(/\.(md|markdown|txt)$/i, "").replace(/[<>:"/\\|?*]/g, "_") || "markdown-document";
  }

  function waitForPaint() {
    return new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
  }

  async function exportPdf() {
    const pageElements = [...document.querySelectorAll(".paper-page")];
    const pageStack = document.querySelector(".paper-pages");
    if (!pageElements.length) {
      showToast("预览页面尚未准备好");
      return;
    }

    const defaultFile = `${outputBaseName()}.pdf`;
    const previousTransform = pageStack?.style.transform || "";
    const previousOrigin = pageStack?.style.transformOrigin || "";
    let selectedPath = "";

    try {
      if (window.__TAURI_INTERNALS__) {
        const { save } = await import("@tauri-apps/plugin-dialog");
        selectedPath = await save({
          title: "导出 PDF",
          defaultPath: defaultFile,
          filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (!selectedPath) {
          showToast("已取消 PDF 导出");
          return;
        }
      }

      setExportProgress({
        title: "正在导出 PDF",
        message: "正在准备页面和字体...",
        current: 0,
        total: pageElements.length,
        unit: "页",
      });
      showToast("正在生成 PDF...");
      await waitForPaint();

      if (pageStack) {
        pageStack.style.transform = "none";
        pageStack.style.transformOrigin = "top center";
      }
      await document.fonts?.ready;
      if (togglesState.mermaid) {
        setExportProgress({
          title: "正在导出 PDF",
          message: "正在等待 Mermaid 图表渲染...",
          current: 0,
          total: pageElements.length,
          unit: "页",
        });
        await waitForPaint();
        const mermaidReady = await settleMermaidBlocks(document.querySelector(".paper-pages"), 4000);
        if (!mermaidReady) {
          showToast("Mermaid 图表仍在渲染，已按当前预览继续导出");
        }
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
      }

      const spec = paperSpec(styleConfig.paperSize);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: spec.pdfFormat });
      const pageWidth = spec.pageWidthMm;
      const pageHeight = spec.pageHeightMm;

      for (const [index, pageElement] of pageElements.entries()) {
        setExportProgress({
          title: "正在导出 PDF",
          message: `正在渲染第 ${index + 1} / ${pageElements.length} 页...`,
          current: index,
          total: pageElements.length,
          unit: "页",
        });
        await waitForPaint();

        const canvas = await html2canvas(pageElement, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        const imageData = canvas.toDataURL("image/png", 1);

        if (index > 0) pdf.addPage(spec.pdfFormat, "portrait");
        pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");

        setExportProgress({
          title: "正在导出 PDF",
          message: `已完成第 ${index + 1} / ${pageElements.length} 页`,
          current: index + 1,
          total: pageElements.length,
          unit: "页",
        });
      }

      setExportProgress({
        title: "正在导出 PDF",
        message: "正在写入 PDF 文件...",
        current: pageElements.length,
        total: pageElements.length,
        unit: "页",
      });
      await waitForPaint();

      const bytes = new Uint8Array(pdf.output("arraybuffer"));

      if (window.__TAURI_INTERNALS__) {
        await saveBytes(selectedPath, bytes);
      } else {
        downloadBytes(defaultFile, bytes, "application/pdf");
      }

      showToast("PDF 已导出");
    } catch (error) {
      console.error(error);
      showToast("PDF 导出失败，请检查图片或图表内容");
    } finally {
      if (pageStack) {
        pageStack.style.transform = previousTransform;
        pageStack.style.transformOrigin = previousOrigin;
      }
      setExportProgress(null);
    }
  }

  async function buildDocxBytes() {
    const {
      AlignmentType,
      BorderStyle,
      Document,
      HeadingLevel,
      ImageRun,
      Packer,
      Paragraph,
      ShadingType,
      Table,
      TableCell,
      TableRow,
      TextRun,
      WidthType,
    } = await import("docx");

    const children = [];
    const bodyFont = styleConfig.bodyFont === "Microsoft YaHei UI" ? "Microsoft YaHei UI" : styleConfig.bodyFont === "Noto Serif SC" ? "Noto Serif SC" : "SimSun";
    const bodySize = bodySizeToDocxHalfPoints(styleConfig.bodySize);
    const docxPageSize = styleConfig.paperSize?.startsWith("Letter")
      ? { width: 12240, height: 15840 }
      : { width: 11906, height: 16838 };
    const markdownLines = content.split(/\r?\n/);
    let index = 0;
    let inCode = false;
    let codeLanguage = "";
    let codeLines = [];

    function inlineRuns(text, extra = {}) {
      const source = text
        .replace(/!\[([^\]]*)]\(([^)]+)\)/g, "$1")
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1");
      const parts = source.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\$[^$]+\$)/g).filter(Boolean);
      return parts.map((part) => {
        if (/^`[^`]+`$/.test(part)) {
          return new TextRun({ text: part.slice(1, -1), font: "Cascadia Mono", size: Math.max(18, bodySize - 1), color: "22513F", ...extra });
        }
        if (/^(\*\*|__)/.test(part)) {
          return new TextRun({ text: stripMarkdownInline(part), bold: true, font: bodyFont, size: bodySize, ...extra });
        }
        if (/^(\*|_)/.test(part)) {
          return new TextRun({ text: stripMarkdownInline(part), italics: true, font: bodyFont, size: bodySize, ...extra });
        }
        if (/^\$[^$]+\$$/.test(part)) {
          return new TextRun({ text: part.slice(1, -1), font: "Cambria Math", size: bodySize, italics: true, ...extra });
        }
        return new TextRun({ text: stripMarkdownInline(part), font: bodyFont, size: bodySize, ...extra });
      });
    }

    function pushTextParagraph(text, options = {}) {
      children.push(
        new Paragraph({
          children: inlineRuns(text, options.run || {}),
          spacing: options.spacing || { after: 80 },
          alignment: options.alignment,
          border: options.border,
          shading: options.shading,
        }),
      );
    }

    function addTocIfNeeded() {
      const headings = extractHeadings(content);
      if (!togglesState.toc || !headings.length) return;
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "目录", bold: true, color: "007B69", font: bodyFont, size: Math.max(26, bodySize + 4) })],
          spacing: { before: 80, after: 80 },
        }),
      );
      headings.forEach((heading) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: heading.text, font: bodyFont, size: bodySize, color: heading.level === 1 ? "1F2926" : "5D6B67" })],
            indent: { left: Math.max(0, heading.level - 1) * 260 },
            spacing: { after: 35 },
            border: { bottom: { style: BorderStyle.DOTTED, size: 2, color: "D9E4E0" } },
          }),
        );
      });
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    }

    async function flushCodeBlock() {
      if (!codeLines.length) return;

      if (codeLanguage.toLowerCase() === "mermaid" && togglesState.mermaid) {
        try {
          const { data, dimensions, type, fallback } = await renderMermaidForDocx(codeLines.join("\n"));
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new ImageRun({ data, transformation: dimensions, type, fallback })],
              spacing: { before: 100, after: 120 },
            }),
          );
        } catch (error) {
          console.error(error);
          pushTextParagraph("Mermaid 图表渲染失败，已保留源码：", { run: { color: "A22B20", italics: true } });
          codeLines.forEach((line) => {
            children.push(new Paragraph({ children: [new TextRun({ text: line || " ", font: "Cascadia Mono", size: 18 })], style: "CodeBlock" }));
          });
        }
        codeLines = [];
        codeLanguage = "";
        return;
      }

      if (codeLanguage) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: codeLanguage, font: "Cascadia Mono", size: 18, color: "66716D" })],
            spacing: { before: 120, after: 60 },
            style: "CodeCaption",
          }),
        );
      }
      for (const line of codeLines) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line || " ", font: "Cascadia Mono", size: 18 })],
            style: "CodeBlock",
          }),
        );
      }
      codeLines = [];
      codeLanguage = "";
    }

    addTocIfNeeded();

    while (index < markdownLines.length) {
      const line = markdownLines[index];
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        if (inCode) {
          await flushCodeBlock();
          inCode = false;
        } else {
          inCode = true;
          codeLanguage = trimmed.replace(/^```/, "").trim();
        }
        index += 1;
        continue;
      }

      if (inCode) {
        codeLines.push(line);
        index += 1;
        continue;
      }

      if (!trimmed) {
        index += 1;
        continue;
      }

      if (trimmed === "$$") {
        const formulaLines = [];
        index += 1;
        while (index < markdownLines.length && markdownLines[index].trim() !== "$$") {
          formulaLines.push(markdownLines[index].trim());
          index += 1;
        }
        if (index < markdownLines.length) index += 1;
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: formulaLines.join(" "), font: "Cambria Math", size: Math.max(bodySize + 2, 24), italics: true })],
            spacing: { before: 100, after: 120 },
          }),
        );
        continue;
      }

      if (/^\s*\|.+\|\s*$/.test(line) && index + 1 < markdownLines.length && /^\s*\|?\s*:?-{3,}/.test(markdownLines[index + 1])) {
        const { rows, nextIndex } = parseMarkdownTable(markdownLines, index);
        if (rows.length) {
          const columnCount = Math.max(...rows.map((row) => row.length));
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: rows.map(
                (row, rowIndex) =>
                  new TableRow({
                    tableHeader: rowIndex === 0,
                    children: Array.from({ length: columnCount }).map(
                      (_, cellIndex) =>
                        new TableCell({
                          width: { size: Math.floor(9000 / columnCount), type: WidthType.DXA },
                          shading:
                            rowIndex === 0
                              ? {
                                  type: ShadingType.CLEAR,
                                  color: "auto",
                                  fill: styleConfig.tableStyle === "细线灰" ? "EEF2F1" : "009B84",
                                }
                              : undefined,
                          borders: {
                            top: { style: BorderStyle.SINGLE, size: 4, color: "CFDAD7" },
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: "CFDAD7" },
                            left: { style: BorderStyle.SINGLE, size: 4, color: "CFDAD7" },
                            right: { style: BorderStyle.SINGLE, size: 4, color: "CFDAD7" },
                          },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: row[cellIndex] || "",
                                  bold: rowIndex === 0,
                                  color: rowIndex === 0 && styleConfig.tableStyle !== "细线灰" ? "FFFFFF" : "1F2926",
                                  font: styleConfig.bodyFont === "Microsoft YaHei UI" ? "Microsoft YaHei UI" : "SimSun",
                                  size: bodySizeToDocxHalfPoints(styleConfig.bodySize),
                                }),
                              ],
                            }),
                          ],
                        }),
                    ),
                  }),
              ),
            }),
          );
        }
        index = nextIndex;
        continue;
      }

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        const headingMap = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
        };
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: stripMarkdownInline(heading[2]),
                bold: true,
                font: bodyFont,
                size: Math.round((level === 1 ? 31 : level === 2 ? 27 : 23) * (headingScale / 100)),
                color: level === 1 ? "17211E" : "1F2926",
              }),
            ],
            heading: headingMap[level] || HeadingLevel.HEADING_3,
            spacing: { before: level === 1 ? 120 : 180, after: 80 },
          }),
        );
        index += 1;
        continue;
      }

      const bullet = trimmed.match(/^[-*+]\s+(.+)$/);
      if (bullet) {
        children.push(
          new Paragraph({
            children: inlineRuns(bullet[1]),
            bullet: { level: 0 },
            spacing: { after: 40 },
          }),
        );
        index += 1;
        continue;
      }

      const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
      if (numbered) {
        children.push(
          new Paragraph({
            children: inlineRuns(numbered[1]),
            numbering: { reference: "ordered-list", level: 0 },
            spacing: { after: 40 },
          }),
        );
        index += 1;
        continue;
      }

      const image = trimmed.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
      if (image) {
        try {
          const { data, dimensions, type } = await loadImageForDocx(image[2], baseDir);
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new ImageRun({ data, transformation: dimensions, type })],
              spacing: { before: 100, after: 100 },
            }),
          );
          if (image[1]) {
            children.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: image[1], italics: true, color: "66716D", size: 18 })],
                spacing: { after: 80 },
              }),
            );
          }
        } catch {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `缺失图片：${image[2]}`, italics: true, color: "A22B20" })],
              spacing: { before: 80, after: 80 },
            }),
          );
        }
        index += 1;
        continue;
      }

      const quote = trimmed.match(/^>\s?(.+)$/);
      if (quote) {
        children.push(
          new Paragraph({
            children: inlineRuns(quote[1], { color: "41514D" }),
            spacing: { before: 60, after: 80 },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: "F6FAF8" },
            border: { left: { color: "009B84", space: 6, style: BorderStyle.SINGLE, size: 12 } },
          }),
        );
        index += 1;
        continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        children.push(
          new Paragraph({
            text: "",
            spacing: { before: 80, after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CDD7D4" } },
          }),
        );
        index += 1;
        continue;
      }

      children.push(
        new Paragraph({
          children: inlineRuns(trimmed),
          spacing: { after: 80 },
        }),
      );
      index += 1;
    }

    await flushCodeBlock();

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "ordered-list",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 520, hanging: 260 } } },
              },
            ],
          },
        ],
      },
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            run: {
              font: bodyFont,
              size: bodySize,
            },
            paragraph: { spacing: { line: 300 } },
          },
          {
            id: "CodeBlock",
            name: "Code Block",
            basedOn: "Normal",
            run: { font: "Cascadia Mono", size: 18 },
            paragraph: {
              shading: { type: ShadingType.CLEAR, color: "auto", fill: "F8FAF9" },
              border: {
                left: { color: "DCE4E1", space: 4, style: BorderStyle.SINGLE, size: 6 },
              },
              spacing: { before: 0, after: 0 },
            },
          },
          {
            id: "CodeCaption",
            name: "Code Caption",
            basedOn: "Normal",
            run: { font: "Cascadia Mono", size: 18, color: "66716D" },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: docxPageSize,
              margin: {
                top: Math.round(margins.top * 56.7),
                bottom: Math.round(margins.bottom * 56.7),
                left: Math.round(margins.left * 56.7),
                right: Math.round(margins.right * 56.7),
              },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return new Uint8Array(await blob.arrayBuffer());
  }

  async function exportDocx() {
    const defaultFile = `${outputBaseName()}.docx`;
    let selectedPath = "";

    try {
      if (window.__TAURI_INTERNALS__) {
        const { save } = await import("@tauri-apps/plugin-dialog");
        selectedPath = await save({
          title: "导出 DOCX",
          defaultPath: defaultFile,
          filters: [{ name: "Word Document", extensions: ["docx"] }],
        });
        if (!selectedPath) {
          showToast("已取消 DOCX 导出");
          return;
        }
      }

      setExportProgress({
        title: "正在导出 DOCX",
        message: "正在解析 Markdown 结构...",
        current: 0,
        total: 3,
        unit: "步",
      });
      showToast("正在生成 DOCX...");
      await waitForPaint();

      setExportProgress({
        title: "正在导出 DOCX",
        message: "正在生成 Word 可编辑内容...",
        current: 1,
        total: 3,
        unit: "步",
      });
      await waitForPaint();
      const bytes = await buildDocxBytes();

      setExportProgress({
        title: "正在导出 DOCX",
        message: "正在写入 DOCX 文件...",
        current: 2,
        total: 3,
        unit: "步",
      });
      await waitForPaint();

      if (window.__TAURI_INTERNALS__) {
        await saveBytes(selectedPath, bytes);
      } else {
        downloadBytes(defaultFile, bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      }

      setExportProgress({
        title: "正在导出 DOCX",
        message: "DOCX 文件已生成",
        current: 3,
        total: 3,
        unit: "步",
      });
      await waitForPaint();
      showToast("DOCX 已导出");
    } catch (error) {
      console.error(error);
      showToast("DOCX 导出失败，请检查 Markdown 内容");
    } finally {
      setExportProgress(null);
    }
  }

  return (
    <main className="app-shell">
      <input ref={inputRef} className="hidden-input" type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={onFileChange} />
      <section className="command-bar">
        <div className="open-menu-wrap">
          <button className="open-button" onClick={openMarkdownFile}>
            <FolderOpen size={20} />
            打开
          </button>
          <button className="open-menu-toggle" onClick={() => setShowOpenMenu((value) => !value)} title="最近打开">
            <ChevronDown size={16} />
          </button>
          {showOpenMenu && (
            <div className="open-menu">
              <strong>最近打开</strong>
              {recentFiles.length ? (
                recentFiles.map((item) => (
                  <button key={item} onClick={() => openRecentFile(item)} title={item}>
                    <span>{basename(item)}</span>
                    <small>{isAbsolutePath(item) ? dirname(item) : "网页模式记录"}</small>
                  </button>
                ))
              ) : (
                <div className="open-menu-empty">暂无最近文件</div>
              )}
            </div>
          )}
        </div>
        <nav className="breadcrumb" aria-label="当前文件路径">
          {currentPath.map((part, index) => (
            <span key={`${part}-${index}`} className={index === currentPath.length - 1 ? "current" : ""}>
              {part}
            </span>
          ))}
        </nav>
        <div className="actions">
          <button className="secondary" onClick={saveStyleConfig}>
            <Save size={18} />
            保存样式
          </button>
          <button className="export pdf" onClick={exportPdf} disabled={!!exportProgress}>
            <FileDown size={18} />
            导出 PDF
          </button>
          <button className="export docx" onClick={exportDocx} disabled={!!exportProgress}>
            <FileText size={18} />
            导出 DOCX
          </button>
          <div className="more-menu-wrap">
            <IconButton label="更多" onClick={() => setShowMoreMenu((value) => !value)}>
              <MoreVertical size={19} />
            </IconButton>
            {showMoreMenu && (
              <div className="more-menu">
                <button onClick={() => { setSourceTab("outline"); setShowMoreMenu(false); }}>查看大纲</button>
                <button onClick={() => { setCurrentPage(1); setShowMoreMenu(false); }}>回到第一页</button>
                <button onClick={() => { resetStyleConfig(); setShowMoreMenu(false); }}>重置样式</button>
                <button onClick={() => { setShowAbout(true); setShowMoreMenu(false); }}>关于 MarkDoc Studio</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className={`workspace ${readingView ? "reading-view" : ""}`}>
        {!readingView && (
          <SourcePaneReal
            content={content}
            setContent={setContent}
            selectedTab={sourceTab}
            setSelectedTab={setSourceTab}
            outlineItems={outlineItems}
            onJumpPage={setCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            editorRef={sourceEditorRef}
            onEditorScroll={handleEditorScroll}
          />
        )}
        <DocumentPreview
          content={content}
          zoom={zoom}
          setZoom={setZoom}
          margins={margins}
          togglesState={togglesState}
          headingScale={headingScale}
          paperRef={paperRef}
          baseDir={baseDir}
          missingImages={missingImages}
          styleConfig={styleConfig}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onPreviewMetrics={handlePreviewMetrics}
          syncScrollEnabled={syncScrollEnabled}
          setSyncScrollEnabled={setSyncScrollEnabled}
          readingView={readingView}
          setReadingView={setReadingView}
          previewStageRef={previewStageRef}
          onPreviewScroll={handlePreviewScroll}
        />
        <StylePanel
          margins={margins}
          setMargins={setMargins}
          headingScale={headingScale}
          setHeadingScale={setHeadingScale}
          togglesState={togglesState}
          setTogglesState={setTogglesState}
          styleConfig={styleConfig}
          setStyleConfig={updateStyleConfig}
          resetStyleConfig={resetStyleConfig}
        />
      </div>

      <footer className="status-bar">
        <div>
          <span className="dot" />
          离线模式
        </div>
        <div>
          <Image size={16} />
          图片检查：
          {imageCheckState.status === "checking"
            ? "检查中"
            : imageCheckState.status === "error"
              ? "不可用"
              : imageCheckState.missing
                ? `缺失 ${imageCheckState.missing} / ${imageCheckState.total} 张`
                : `通过（${imageCheckState.total} 张）`}
        </div>
        <div>最近文件：{recentFiles.length} 个</div>
        <div>渲染耗时：{renderMs} ms</div>
        <div className="status-right">
          <span>共 {pageCount} 页</span>
          <span>
            <Check size={16} />
            {hasUnsavedStyle ? "样式未保存" : "已保存"}
          </span>
        </div>
      </footer>

      <div className="floating-zoom">
        <button onClick={() => setZoom((value) => Math.max(80, value - 10))}>
          <ZoomOut size={16} />
        </button>
        <span>{zoom}%</span>
        <button onClick={() => setZoom((value) => Math.min(120, value + 10))}>
          <ZoomIn size={16} />
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
      {exportProgress && (
        <div className="export-progress" role="status" aria-live="polite">
          <div className="export-progress-card">
            <div className="export-progress-title">{exportProgress.title}</div>
            <div className="export-progress-message">{exportProgress.message}</div>
            <div className="export-progress-track">
              <span style={{ width: `${Math.round((exportProgress.current / Math.max(1, exportProgress.total)) * 100)}%` }} />
            </div>
            <div className="export-progress-meta">
              <span>{exportProgress.current} / {exportProgress.total} {exportProgress.unit || "页"}</span>
              <span>{Math.round((exportProgress.current / Math.max(1, exportProgress.total)) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </main>
  );
}

