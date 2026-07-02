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
├── SKILL.md                  # 本文件 - 项目介绍和使用说明
├── structure_guide.md        # content.json 内容结构规范
├── style_guide.md            # style.json 样式规范
├── word_builtin_styles.md    # Word 内置样式列表
├── package.json              # Node.js 依赖
├── template/                 # 项目模板（复制此目录开始新项目）
│   ├── content.json          # 内容文件
│   ├── style.json            # 样式文件
│   ├── images/               # 图片资源
│   └── output.docx           # 输出文件（生成）
└── core/                     # 核心代码目录
    ├── converter.js          # CLI入口
    ├── styles.js             # 样式引擎
    ├── parser.js             # JSON解析器
    ├── renderer.js           # DOCX渲染器
    ├── blocks/               # Block处理器
    │   ├── text.js
    │   ├── heading.js
    │   ├── image.js
    │   ├── table.js
    │   ├── toc.js
    │   ├── page_break.js
    │   ├── section_break.js
    │   ├── code.js
    │   └── formula.js
    └── utils/                # 工具函数
        ├── borders.js
        ├── spacing.js
        ├── indent.js
        └── mathml-to-docx.js
```

---

## 你的职责

- 根据用户描述，生成或修改对应的 `content.json` 和 `style.json` 文件，然后转换成 Word 文档。
- 如果需要从零开始，先复制 `template/` 目录到项目根目录，然后修改 `content.json` 和 `style.json` 文件。
- 如果需要修改已有的项目，直接修改 `content.json` 和 `style.json` 文件。
- 如果需要添加新的样式，在 `style.json` 文件中添加新的样式定义。
- 如果用户要生成较长的文档（如学术论文），建议把文档内容拆分成多个 JSON 文件，每个文件对应一个章节。最后转换时再按顺序合并。

### 标准项目目录规范

复制 `template/` 目录作为项目起点：

```
my_document/
├── content.json          # 内容文件（必须）
├── style.json            # 样式文件（必须）
├── images/               # 图片资源（可选）
│   ├── fig1.png
│   └── fig2.png
├── outputs/              # 输出文件夹（生成）
└── others/               # 其他资源（可选）
    └── 系统用例图.xml
```

---

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

---

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

---

## Run内联样式

在 `runs` 数组中，每个 run 支持：

| 样式 | 类型 | 说明 |
|------|------|------|
| `bold` | boolean | 粗体 |
| `italic` | boolean | 斜体 |
| `underline` | boolean | 下划线 |
| `superscript` | boolean | 上标 |
| `subscript` | boolean | 下标 |
| `color` | string | 文字颜色（如 "FF0000"） |
| `highlight` | string | 高亮背景（如 "FFFF00"） |

---

## 详细规范

| 文档 | 说明 |
|------|------|
| `structure_guide.md` | content.json 内容结构规范（所有 Block 类型的字段说明） |
| `style_guide.md` | style.json 样式规范（所有样式属性的完整参考） |
| `word_builtin_styles.md` | Word 内置样式列表（可使用这些名称覆盖内置样式） |

## 完整模板

参见 `template/` 目录：
- `content.json` - 模板内容文件
- `style.json` - 模板样式文件
- `images/` - 模板图片资源
