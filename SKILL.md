---
name: ai-docx-engineer
description: 将自定义JSON内容转换为Word文档，支持通过style.json自定义样式。让AI生成Word文档更加可控。
---

# AI DOCX Engine 转换工具

将自定义JSON内容转换为Word文档，支持通过style.json自定义样式。

**严格模式：所有样式必须显式指定，不存在或未指定时转换会报错终止。**

## 项目结构

```
ai-docx-engineer/
├── SKILL.md              # 本文件 - 项目介绍和使用说明
├── style_table.md        # 详细的书写规范参考
├── package.json          # Node.js 依赖
├── template/             # 项目模板（复制此目录开始新项目）
│   ├── content.json      # 内容文件
│   ├── style.json        # 样式文件
│   ├── images/           # 图片资源
│   └── output.docx       # 输出文件（生成）
└── core/                 # 核心代码目录
    ├── converter.js      # CLI入口
    ├── styles.js         # 样式引擎
    ├── parser.js         # JSON解析器
    ├── renderer.js       # DOCX渲染器
    ├── blocks/           # Block处理器
    │   ├── text.js
    │   ├── heading.js
    │   ├── image.js
    │   ├── table.js
    │   ├── toc.js
    │   ├── page_break.js
    │   ├── section_break.js
    │   ├── code.js
    │   └── formula.js
    └── utils/            # 工具函数
        ├── borders.js
        ├── spacing.js
        ├── indent.js
        └── mathml-to-docx.js
```

## 你的职责
- 根据用户描述，生成或修改对应的JSON内容文件和style.json样式文件，然后转换成Word文档。
- 如果需要从零开始，那么先复制/template目录到项目根目录，然后修改content.json和style.json文件。
- 如果需要修改已有的项目，那么直接修改content.json和style.json文件。
- 如果需要添加新的样式，那么在style.json文件中添加新的样式定义。
- 此外，如果用户要生成较长的文档，比如写学术论文，那么建议把文档内容拆分成多个JSON文件，每个文件对应一个章节（比如摘要，第一章，第二章，第三章，参考文献，结语等）。最后转换的时候再合并。
### 标准项目目录规范
复制 `template/` 目录作为项目起点：
```
my_document/
├── content.json          # 内容文件（必须）
├── style.json            # 样式文件（必须）
├── images/               # 图片资源（可选）
│   ├── fig1.png
│   └── fig2.png
└── outputs/               # 输出文件夹（生成）
└── others/               # 其他资源（可选）
│   └── 系统用例图.xml      # 其他资源，比如一个符合drawio的系统用例图XML文件
```
## 快速开始

### 转换命令

```bash
node core/converter.js <content.json> <style.json> <output.docx>
```
**注意：三个参数都必须提供**
### 示例

```bash
node core/converter.js template/content.json template/style.json template/outputs/output.docx
```
## 内容文件格式 (content.json)

```json
{
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "style": "inner_heading1",
      "runs": [{"text": "目录"}]
    },
    {
      "type": "toc",
      "levels": [1, 2, 3],
      "style_level_one": "inner_toc1",
      "style_level_two": "inner_toc2",
      "style_level_three": "inner_toc3"
    },
    {
      "type": "page-break"
    },
    {
      "type": "heading",
      "level": 1,
      "style": "inner_heading1",
      "runs": [{"text": "第一章 绪论"}]
    },
    {
      "type": "text",
      "style": "inner_body",
      "runs": [
        {"text": "这是"},
        {"text": "粗体", "bold": true},
        {"text": "文字示例。"}
      ]
    },
    {
      "type": "image",
      "style": "inner_image",
      "src": "images/fig1.png"
    },
    {
      "type": "table",
      "style": "inner_body",
      "rows": 3,
      "cols": 2,
      "cells": [
        ["名称", "数值"],
        ["A", "100"],
        ["B", "200"]
      ],
      "header_style": "inner_tableheader",
      "body_style": "inner_tablebody",
      "border": "three_line"
    },
    {
      "type": "formula",
      "style": "inner_formula",
      "latex": "E = mc^2",
      "display": true
    },
    {
      "type": "page-break"
    }
  ]
}
```
## 支持的Block类型

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

## Run内联样式

在 `runs` 数组中，每个run支持：

- `bold`: 粗体
- `italic`: 斜体
- `underline`: 下划线
- `superscript`: 上标
- `subscript`: 下标
- `color`: 文字颜色 (如 "FF0000")
- `highlight`: 高亮背景 (如 "FFFF00")

## 样式文件格式 (style.json)

```json
{
  "inner_heading1": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "黑体",
    "font_size": 22,
    "bold": true,
    "alignment": "center",
    "line_spacing": {"units": "line", "value": 1.5},
    "space_before": {"units": "pt", "value": 6},
    "space_after": {"units": "pt", "value": 12}
  },
  "inner_body": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12,
    "first_line_indent": {"units": "chars", "value": 2}
  },
  "inner_formula": {
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

## 详细规范
具体书写规范参考同目录下 `style_table.md` 文件。
## 完整模板
参见 `template/` 目录：
- `content.json` - 模板内容文件
- `style.json` - 模板样式文件
- `images/` - 模板图片资源
