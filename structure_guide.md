# 内容结构规范 (content.json)

内容文件采用扁平化的 Block + Run 架构。

**重要：严格模式 - 所有样式必须显式指定**

- 所有 Block 的 `style` 字段必须显式指定
- 引用的样式必须在 `style.json` 中定义
- 样式不存在或未指定时，转换会报错终止

---

## 基本结构

```json
{
  "blocks": [
    {"type": "toc", "levels": [1, 2, 3], "style_level_one": "TOC 1", ...},
    {"type": "heading", "level": 1, "style": "Heading 1", "runs": [...]},
    {"type": "text", "style": "Normal", "runs": [...]},
    {"type": "image", "style": "Image", "src": "..."},
    {"type": "table", "style": "Normal", "rows": 3, "cols": 3, "cells": [...], "header_style": "Table Header", "body_style": "Table Body", ...},
    {"type": "code", "language": "python", "style": "Code", "content": "..."},
    {"type": "formula", "style": "Formula", "latex": "E = mc^2", "display": true},
    {"type": "page-break", "break_type": "page"},
    {"type": "section-break", "break_type": "nextPage"}
  ]
}
```

---

## Block 类型

支持9种 Block 类型：

| 类型 | 说明 | 必需字段 |
|------|------|----------|
| `heading` | 结构化标题 | `level`, `style`, `runs` |
| `toc` | 目录 | `style_level_one`, `style_level_two`, `style_level_three` |
| `text` | 文本段落 | `style`, `runs` |
| `image` | 图片 | `style`, `src` |
| `table` | 表格 | `style`, `rows`, `cols`, `cells`, `header_style`, `body_style` |
| `code` | 代码块 | `style`, `content` |
| `formula` | 公式 | `style`, `latex` |
| `page-break` | 分页符 | 无 |
| `section-break` | 节分隔 | `break_type` |

---

## heading 类型

### 基本结构

```json
{
  "type": "heading",
  "level": 1,
  "style": "Heading 1",
  "id": "intro",
  "runs": [
    {"text": "绪论"}
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"heading"` |
| `level` | number | 是 | 标题级别：1 / 2 / 3 / 4 |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `id` | string | 否 | 书签ID，用于内部跳转引用 |
| `runs` | array | 否 | Run 数组，支持内联富文本 |

### 说明

- `level` 用于设置 Word 的 `outlineLevel`，与样式名称无关
- 如果样式中定义了 `outline_level`，将使用样式中的值，忽略 block 的 `level` 字段

---

## toc 类型

### 基本结构

```json
{
  "type": "toc",
  "levels": [1, 2, 3],
  "style_level_one": "TOC 1",
  "style_level_two": "TOC 2",
  "style_level_three": "TOC 3"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"toc"` |
| `levels` | array | 否 | 收录哪些级别的标题，默认 `[1, 2, 3]` |
| `style_level_one` | string | **是** | **TOC 1级样式名称，必须在 style.json 中定义** |
| `style_level_two` | string | **是** | **TOC 2级样式名称，必须在 style.json 中定义** |
| `style_level_three` | string | **是** | **TOC 3级样式名称，必须在 style.json 中定义** |

### 说明

- 生成后会在文档中插入 TOC 域，显示提示文字"点击更新域来更新目录"
- 用户需要在 Word 中手动更新域（右键 → 更新域）来生成实际目录内容

---

## text 类型

### 基本结构

```json
{
  "type": "text",
  "style": "Normal",
  "runs": [
    {"text": "普通文字"},
    {"text": "粗体文字", "bold": true},
    {"text": "斜体文字", "italic": true}
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"text"` |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `runs` | array | 否 | Run 数组，每个 Run 是一段带有格式的文字 |

### Run 内联样式

每个 Run 支持以下内联样式：

| 样式 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `text` | string | 文字内容 | `{"text": "Hello"}` |
| `bold` | boolean | 粗体 | `{"text": "粗体", "bold": true}` |
| `italic` | boolean | 斜体 | `{"text": "斜体", "italic": true}` |
| `underline` | boolean | 下划线 | `{"text": "下划线", "underline": true}` |
| `superscript` | boolean | 上标 | `{"text": "上标", "superscript": true}` |
| `subscript` | boolean | 下标 | `{"text": "下标", "subscript": true}` |
| `color` | string | 文字颜色（HEX格式） | `{"text": "红色", "color": "FF0000"}` |
| `highlight` | string | 高亮背景色（HEX格式） | `{"text": "高亮", "highlight": "FFFF00"}` |

---

## code 类型

代码块是独立的 block 类型，使用纯文本 `content` 而非 `runs`。

### 基本结构

```json
{
  "type": "code",
  "language": "python",
  "style": "Code",
  "content": "def hello():\n    print('hello world')"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"code"` |
| `language` | string | 否 | 编程语言标识（预留扩展用） |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `content` | string | 是 | 代码纯文本，使用 `\n` 表示换行 |

### 设计要点

- **content 为纯文本**：不使用 runs，避免转义、缩进、换行、tab 等问题
- **每行独立段落**：content 按换行符拆分，每行渲染为独立段落
- **保留原始格式**：保留空格、缩进、换行
- **样式控制外观**：通过 style.json 中的样式控制等宽字体、背景色、缩进、行距

---

## image 类型

### 基本结构

```json
{
  "type": "image",
  "style": "Image",
  "src": "images/example.png"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"image"` |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `src` | string | 是 | 图片路径（相对或绝对） |

---

## table 类型

### 基本结构

```json
{
  "type": "table",
  "style": "Normal",
  "rows": 3,
  "cols": 3,
  "cells": [
    ["表头1", "表头2", "表头3"],
    ["数据1", "数据2", "数据3"],
    ["数据4", "数据5", "数据6"]
  ],
  "header_style": "Table Header",
  "body_style": "Table Body",
  "border": "three_line",
  "space_after": {"units": "pt", "value": 12}
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"table"` |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `rows` | number | 是 | 表格行数 |
| `cols` | number | 是 | 表格列数 |
| `cells` | array | 是 | 二维数组，表示单元格内容 |
| `header_style` | string | **是** | **表头行使用的样式名称，必须在 style.json 中定义** |
| `body_style` | string | **是** | **表体行使用的样式名称，必须在 style.json 中定义** |
| `border` | string | 否 | 边框样式：`"none"`、`"grid"`、`"three_line"`，默认 `"three_line"` |
| `space_after` | object | 否 | 表格后间距 |

### 边框样式说明

| 样式值 | 说明 |
|--------|------|
| `"none"` | 无边框 |
| `"grid"` | 网格边框（所有边框都显示） |
| `"three_line"` | 三线表（仅显示顶线、底线和表头底线） |

---

## formula 类型

公式块，将 LaTeX 源码渲染为 Word 原生数学公式（OMML）。

### 基本结构

```json
{
  "type": "formula",
  "style": "Formula",
  "latex": "E = mc^2",
  "display": true
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"formula"` |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `latex` | string | 是 | LaTeX 公式源码 |
| `display` | boolean | 否 | `true`=块级公式（居中，默认）；`false`=行内公式 |

### 说明

- `latex` 字段为 LaTeX 源码，使用 KaTeX 渲染为 MathML，再转换为 Word OMML
- `display` 为 `true` 时，公式独占一行并居中；为 `false` 时，公式作为行内元素
- 若 LaTeX 语法错误，文档中会保留占位文本 `[公式错误: ...]`

---

## page-break 类型

行内断点，通过 `w:br` 元素实现。

### 基本结构

```json
{
  "type": "page-break",
  "break_type": "page"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"page-break"` |
| `break_type` | string | 否 | 断点类型，默认 `"page"` |

### break_type 取值

| 值 | 说明 |
|----|------|
| `"page"` | 分页符 — 后续内容跳到下一页（默认） |
| `"column"` | 分栏符 — 跳到下一栏（无分栏时等同于 page） |
| `"line"` | 行内换行 — 仅换行到下一行（Shift+Enter） |

---

## section-break 类型

节分隔，通过 `w:sectPr` 元素实现，创建新的文档节（Section）。

### 基本结构

```json
{
  "type": "section-break",
  "break_type": "nextPage"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"section-break"` |
| `break_type` | string | 否 | 节分隔类型，默认 `"nextPage"` |

### break_type 取值

| 值 | 说明 |
|----|------|
| `"nextPage"` | 下一页 — 新节从下一页开始（默认，最常用） |
| `"continuous"` | 连续 — 不分页，新节从当前页继续（用于同页改分栏等） |
| `"evenPage"` | 偶数页 — 新节从下一个偶数页开始（双面打印用） |
| `"oddPage"` | 奇数页 — 新节从下一个奇数页开始（双面打印用） |

---

## 完整示例

```json
{
  "blocks": [
    {
      "type": "toc",
      "levels": [1, 2, 3],
      "style_level_one": "TOC 1",
      "style_level_two": "TOC 2",
      "style_level_three": "TOC 3"
    },
    {
      "type": "heading",
      "level": 1,
      "style": "Heading 1",
      "runs": [{"text": "1 引言"}]
    },
    {
      "type": "text",
      "style": "Normal",
      "runs": [
        {"text": "本文研究了"},
        {"text": "重要问题", "bold": true},
        {"text": "的解决方案。"}
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "style": "Heading 2",
      "runs": [{"text": "1.1 研究背景"}]
    },
    {
      "type": "text",
      "style": "Normal",
      "runs": [{"text": "正文内容..."}]
    },
    {
      "type": "table",
      "style": "Normal",
      "rows": 2,
      "cols": 2,
      "cells": [
        ["方法", "效果"],
        ["方法A", "优秀"]
      ],
      "header_style": "Table Header",
      "body_style": "Table Body",
      "border": "three_line"
    },
    {
      "type": "image",
      "style": "Image",
      "src": "images/fig1.png"
    },
    {
      "type": "code",
      "language": "python",
      "style": "Code",
      "content": "def hello():\n    print('hello world')"
    },
    {
      "type": "formula",
      "style": "Formula",
      "latex": "E = mc^2",
      "display": true
    },
    {
      "type": "page-break",
      "break_type": "page"
    },
    {
      "type": "section-break",
      "break_type": "nextPage"
    }
  ]
}
```
