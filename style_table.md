# JSON to DOCX 书写规范

本项目将内容文件从 XML 改为 JSON 格式，样式文件保持 JSON 不变。

**重要：严格模式 - 所有样式必须显式指定**

- 不再提供任何默认样式
- 所有 Block 的 `style` 字段必须显式指定
- 引用的样式必须在 `style.json` 中定义
- 样式不存在或未指定时，转换会报错终止

---

## 内容文件结构（JSON）

内容文件采用扁平化的 Block + Run 架构：

```json
{
  "blocks": [
    {"type": "toc", "levels": [1, 2, 3], "style_level_one": "目录一级", ...},
    {"type": "heading", "level": 1, "style": "标题1", "runs": [...]},
    {"type": "text", "style": "正文", "runs": [...]},
    {"type": "image", "style": "图片", "src": "..."},
    {"type": "table", "style": "表格", "rows": 3, "cols": 3, "cells": [...], "header_style": "表头", "body_style": "表内文字", ...},
    {"type": "code", "language": "python", "style": "代码块", "content": "..."},
    {"type": "page-break", "break_type": "page"},
    {"type": "section-break", "break_type": "nextPage"}
  ]
}
```

---

## Block 类型

支持9种 Block 类型：

| 类型 | 说明 | 职责 |
|------|------|------|
| `heading` | 结构化标题 | 定义文档结构（level + style） |
| `toc` | 目录 | 收集 heading 结构生成目录 |
| `text` | 文本段落 | 普通段落内容 |
| `code` | 代码块 | 预格式化代码（等宽字体+背景色+保留换行） |
| `formula` | 公式 | LaTeX 公式渲染为 Word 原生数学公式（OMML） |
| `image` | 图片 | 插入图片 |
| `table` | 表格 | 插入表格 |
| `page-break` | 行内断点 | 分页符 / 分栏符 / 行内换行 |
| `section-break` | 节分隔 | 创建新节（下一页 / 连续 / 偶数页 / 奇数页） |

---

## heading 类型

### 基本结构

```json
{
  "type": "heading",
  "level": 1,
  "style": "标题1",
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

### 严格模式说明

- `style` 字段**必须显式指定**，不再提供默认映射
- 指定的样式必须在 `style.json` 中存在
- `level` 用于设置 Word 的 `outlineLevel`，与样式名称无关
- 如果样式中定义了 `outline_level`，将使用样式中的值，忽略 block 的 `level` 字段

### 示例

```json
{
  "type": "heading",
  "level": 1,
  "style": "标题1",
  "runs": [{"text": "1 绪论"}]
}

{
  "type": "heading",
  "level": 2,
  "style": "我的二级标题",
  "runs": [{"text": "2.1 研究背景"}]
}
```

---

## toc 类型

### 基本结构

```json
{
  "type": "toc",
  "levels": [1, 2, 3],
  "style_level_one": "目录一级",
  "style_level_two": "目录二级",
  "style_level_three": "目录三级"
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

### 严格模式说明

- 三个样式字段**必须显式指定**
- 指定的样式必须在 `style.json` 中存在
- 生成后会在文档中插入 TOC 域，显示提示文字"点击更新域来更新目录"
- 用户需要在 Word 中手动更新域（右键 → 更新域）来生成实际目录内容

### 示例

```json
{
  "type": "toc",
  "levels": [1, 2, 3],
  "style_level_one": "目录一级",
  "style_level_two": "目录二级",
  "style_level_three": "目录三级"
}
```

---

## text 类型

### 基本结构

```json
{
  "type": "text",
  "style": "正文",
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

### 严格模式说明

- `style` 字段**必须显式指定**，不再提供默认回退
- 指定的样式必须在 `style.json` 中存在

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

### 完整示例

```json
{
  "type": "text",
  "style": "正文",
  "runs": [
    {"text": "这是一个"},
    {"text": "粗体", "bold": true},
    {"text": "、"},
    {"text": "斜体", "italic": true},
    {"text": "和"},
    {"text": "红色", "color": "FF0000"},
    {"text": "文字的示例。"}
  ]
}
```

---

## code 类型

代码块是独立的 block 类型，**不是** paragraph 的子类型。它本质是"预格式化文本"，使用纯文本 `content` 而非 `runs`。

### 基本结构

```json
{
  "type": "code",
  "language": "python",
  "style": "代码块",
  "content": "def hello():\n    print('hello world')"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"code"` |
| `language` | string | 否 | 编程语言标识（如 `python`、`java`），预留扩展用 |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `content` | string | 是 | 代码纯文本，使用 `\n` 表示换行 |

### 设计要点

- **content 为纯文本**：不使用 runs，避免转义、缩进、换行、tab 等问题
- **每行独立段落**：content 按换行符拆分，每行渲染为独立段落
- **保留原始格式**：保留空格、缩进、换行
- **样式控制外观**：通过 style.json 中的样式控制等宽字体、背景色、缩进、行距

### 严格模式说明

- `style` 字段**必须显式指定**，必须在 `style.json` 中存在
- `language` 字段为预留字段，当前版本不参与渲染

### 推荐样式配置

```json
{
  "代码块": {
    "font_name": "Consolas",
    "font_name_east_asia": "Consolas",
    "font_size": 10.5,
    "background_color": "F5F5F5",
    "line_spacing": {"units": "pt", "value": 18},
    "left_indent_cm": 0.74,
    "space_before": {"units": "pt", "value": 0},
    "space_after": {"units": "pt", "value": 0}
  }
}
```

### 示例

```json
{
  "type": "code",
  "language": "python",
  "style": "代码块",
  "content": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"
}
```

---

## image 类型

### 基本结构

```json
{
  "type": "image",
  "style": "图片",
  "src": "images/example.png"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定值 `"image"` |
| `style` | string | **是** | **必须在 style.json 中定义的样式名称** |
| `src` | string | 是 | 图片路径（相对或绝对） |

### 严格模式说明

- `style` 字段**必须显式指定**，不再提供默认回退
- 指定的样式必须在 `style.json` 中存在

---

## table 类型

### 基本结构

```json
{
  "type": "table",
  "style": "表格",
  "rows": 3,
  "cols": 3,
  "cells": [
    ["表头1", "表头2", "表头3"],
    ["数据1", "数据2", "数据3"],
    ["数据4", "数据5", "数据6"]
  ],
  "header_style": "表头",
  "body_style": "表内文字",
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

### 严格模式说明

- `style`、`header_style`、`body_style` **必须显式指定**
- 所有样式必须在 `style.json` 中存在

### 边框样式说明

| 样式值 | 说明 |
|--------|------|
| `"none"` | 无边框 |
| `"grid"` | 网格边框（所有边框都显示） |
| `"three_line"` | 三线表（仅显示顶线、底线和表头底线） |

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

| 值 | XML | 说明 |
|----|-----|------|
| `"page"` | `<w:br w:type="page"/>` | **分页符** — 后续内容跳到下一页（默认） |
| `"column"` | `<w:br w:type="column"/>` | **分栏符** — 跳到下一栏（无分栏时等同于 page） |
| `"line"` | `<w:br w:type="textWrapping"/>` | **行内换行** — 仅换行到下一行（Shift+Enter） |

### 说明

- 不指定 `break_type` 时默认为 `"page"`，兼容旧版 JSON 格式
- `"column"` 仅在多栏排版中有意义

### 示例

```json
{"type": "page-break"}
{"type": "page-break", "break_type": "page"}
{"type": "page-break", "break_type": "column"}
{"type": "page-break", "break_type": "line"}
```

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

| 值 | XML | 说明 |
|----|-----|------|
| `"nextPage"` | `<w:type w:val="nextPage"/>` | **下一页** — 新节从下一页开始（默认，最常用） |
| `"continuous"` | `<w:type w:val="continuous"/>` | **连续** — 不分页，新节从当前页继续（用于同页改分栏等） |
| `"evenPage"` | `<w:type w:val="evenPage"/>` | **偶数页** — 新节从下一个偶数页开始（双面打印用） |
| `"oddPage"` | `<w:type w:val="oddPage"/>` | **奇数页** — 新节从下一个奇数页开始（双面打印用） |

### 说明

- 不指定 `break_type` 时默认为 `"nextPage"`，兼容旧版
- 每个节可以有独立的页面设置（页边距、纸张方向、页眉页脚等）

### 示例

```json
{"type": "section-break"}
{"type": "section-break", "break_type": "nextPage"}
{"type": "section-break", "break_type": "continuous"}
{"type": "section-break", "break_type": "evenPage"}
{"type": "section-break", "break_type": "oddPage"}
```

---

## formula 类型

公式块，将 LaTeX 源码渲染为 Word 原生数学公式（OMML），可在 Word 中直接编辑。

### 基本结构

```json
{
  "type": "formula",
  "style": "公式",
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

### 严格模式说明

- `style` 字段**必须显式指定**，必须在 `style.json` 中存在
- `latex` 字段为 LaTeX 源码，使用 KaTeX 渲染为 MathML，再转换为 Word OMML
- `display` 为 `true` 时，公式独占一行并居中；为 `false` 时，公式作为行内元素
- 若 LaTeX 语法错误，文档中会保留占位文本 `[公式错误: ...]`

### 推荐样式配置

```json
{
  "公式": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12,
    "alignment": "center",
    "line_spacing": {"units": "line", "value": 1.5},
    "space_before": {"units": "pt", "value": 6},
    "space_after": {"units": "pt", "value": 6}
  }
}
```

### 示例

```json
{
  "type": "formula",
  "style": "公式",
  "latex": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  "display": true
}
```

---

## 样式文件（style.json）

样式文件定义段落级别的样式，供内容文件引用。

**重要：所有在内容文件中引用的样式必须在此定义**

### 基本结构

```json
{
  "样式名称1": {
    "font_name": "Times New Roman",
    "font_size": 12,
    ...
  }
}
```

### 样式属性

#### font_name
- 功能：指定西文字体名称
- 取值：Times New Roman, Arial, Calibri, Courier New 等

#### font_name_east_asia
- 功能：指定东亚字体名称
- 取值：黑体, 宋体, 楷体, 微软雅黑, 仿宋 等

#### font_size
- 功能：指定字体大小（磅）

字体大小映射：
- 22磅 = 2号字体
- 18磅 = 小2号字体
- 16磅 = 3号字体
- 14磅 = 4号字体
- 12磅 = 小四号字体

#### bold
- 功能：设置字体是否加粗
- 取值：true 或 false

#### alignment
- 功能：设置段落对齐方式
- 取值："left", "center", "right", "justify"

#### space_before / space_after
- 功能：设置段前/段后间距
- 格式：`{"units": "pt"|"line", "value": number}`

#### line_spacing
- 功能：设置行间距
- 格式：`{"units": "pt"|"line", "value": number}`

#### background_color
- 功能：设置段落背景色（常用于代码块）
- 取值：HEX 颜色值，不带 `#` 前缀（如 `"F5F5F5"`）

#### left_indent
- 功能：设置左缩进（文本之前）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "cm", "value": 1.5}` — 左缩进 1.5 厘米
  - `{"units": "chars", "value": 2}` — 左缩进 2 个字符

#### right_indent
- 功能：设置右缩进（文本之后）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "cm", "value": 1}` — 右缩进 1 厘米
  - `{"units": "chars", "value": 2}` — 右缩进 2 个字符

#### first_line_indent
- 功能：设置首行缩进（特殊格式：首行缩进）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "chars", "value": 2}` — 首行缩进 2 个字符
  - `{"units": "cm", "value": 0.74}` — 首行缩进 0.74 厘米

#### hanging_indent
- 功能：设置悬挂缩进（特殊格式：悬挂缩进）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "chars", "value": 2}` — 悬挂缩进 2 个字符
  - `{"units": "cm", "value": 1}` — 悬挂缩进 1 厘米

#### outline_level
- 功能：设置标题的结构层级（让 Word 识别为标题，用于生成目录）
- 取值：0 ~ 4（0 = 一级标题，1 = 二级标题，以此类推）
- 适用范围：heading 类型的样式
- 说明：如果样式中定义了 `outline_level`，heading handler 会使用样式中的值；否则回退到 block 的 `level` 字段

---

## 完整示例

### 内容文件 (document.json)

```json
{
  "blocks": [
    {
      "type": "toc",
      "levels": [1, 2, 3],
      "style_level_one": "目录一级",
      "style_level_two": "目录二级",
      "style_level_three": "目录三级"
    },
    {
      "type": "heading",
      "level": 1,
      "style": "标题1",
      "runs": [{"text": "1 引言"}]
    },
    {
      "type": "text",
      "style": "正文",
      "runs": [
        {"text": "本文研究了"},
        {"text": "重要问题", "bold": true},
        {"text": "的解决方案。"}
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "style": "标题2",
      "runs": [{"text": "1.1 研究背景"}]
    },
    {
      "type": "text",
      "style": "正文",
      "runs": [{"text": "正文内容..."}]
    },
    {
      "type": "table",
      "style": "表格",
      "rows": 2,
      "cols": 2,
      "cells": [
        ["方法", "效果"],
        ["方法A", "优秀"]
      ],
      "header_style": "表头",
      "body_style": "表内文字",
      "border": "three_line"
    },
    {
      "type": "image",
      "style": "图片",
      "src": "images/fig1.png"
    },
    {
      "type": "code",
      "language": "python",
      "style": "代码块",
      "content": "def hello():\n    print('hello world')"
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

### 样式文件 (style.json)

```json
{
  "标题1": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "黑体",
    "font_size": 22,
    "bold": true,
    "outline_level": 0,
    "alignment": "center",
    "line_spacing": {"units": "line", "value": 1.5}
  },
  "标题2": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "黑体",
    "font_size": 16,
    "bold": true,
    "outline_level": 1,
    "line_spacing": {"units": "line", "value": 1.5}
  },
  "正文": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12,
    "first_line_indent": {"units": "chars", "value": 2},
    "left_indent": {"units": "chars", "value": 0},
    "right_indent": {"units": "chars", "value": 0}
  },
  "目录一级": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "黑体",
    "font_size": 14
  },
  "目录二级": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12
  },
  "目录三级": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 11
  },
  "表头": {
    "font_name": "Arial",
    "font_name_east_asia": "宋体",
    "font_size": 11,
    "bold": true,
    "alignment": "center"
  },
  "表内文字": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 11,
    "alignment": "center"
  },
  "图片": {
    "alignment": "center",
    "width_cm": 10
  },
  "代码块": {
    "font_name": "Consolas",
    "font_name_east_asia": "Consolas",
    "font_size": 10.5,
    "background_color": "F5F5F5",
    "line_spacing": {"units": "pt", "value": 18},
    "left_indent": {"units": "cm", "value": 0.74}
  }
}
```

---

## 转换命令

```bash
python -m core.converter <content.json> <style.json> <output.docx>
```

示例：
```bash
python -m core.converter document.json style.json output.docx
```

**注意：三个参数都必须提供。**

---

## 错误处理

严格模式下，以下情况会报错并终止转换：

| 错误类型 | 说明 |
|----------|------|
| 样式文件不存在 | `样式文件不存在: xxx.json` |
| 样式文件为空 | `样式文件为空` |
| 样式未指定 | `heading (level=1): 未指定 style` |
| 样式不存在 | `text: 样式不存在 '正文'` |
| TOC样式不存在 | `toc level 1: 样式不存在 '目录一级'` |
| 代码块样式未指定 | `code: 未指定样式名称` |
| 代码块样式不存在 | `code: 样式不存在 '代码块'` |
| page-break类型无效 | `page-break: 无效的 break_type 'xxx'，可选值: column, line, page` |
| section-break类型无效 | `section-break: 无效的 break_type 'xxx'，可选值: continuous, evenPage, nextPage, oddPage` |
