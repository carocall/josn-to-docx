# 样式规范 (style.json)

样式文件定义段落级别的样式，供内容文件引用。

**重要：所有在内容文件中引用的样式必须在此定义**

## 基本结构

```json
{
  "样式名称1": {
    "font_name": "Times New Roman",
    "font_size": 12,
    ...
  }
}
```

## 内置样式覆盖

如果样式名称与 Word 内置样式名称相同（如 `Normal`、`Heading 1`），会**覆盖** Word 原有的样式定义。

```json
{
  "Normal": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12
  },
  "Heading 1": {
    "font_name": "Arial",
    "font_size": 22,
    "bold": true,
    "outline_level": 0
  }
}
```

完整内置样式列表参见 `word_builtin_styles.md`。

---

## 字体属性

### font_name
- 功能：指定西文字体名称
- 取值：Times New Roman, Arial, Calibri, Courier New 等

### font_name_east_asia
- 功能：指定东亚字体名称
- 取值：黑体, 宋体, 楷体, 微软雅黑, 仿宋 等

### font_size
- 功能：指定字体大小（磅）

字体大小映射：
- 22磅 = 2号字体
- 18磅 = 小2号字体
- 16磅 = 3号字体
- 14磅 = 4号字体
- 12磅 = 小四号字体

### bold
- 功能：设置字体是否加粗
- 取值：true 或 false

---

## 段落属性

### alignment
- 功能：设置段落对齐方式
- 取值："left", "center", "right", "justify"

### space_before / space_after
- 功能：设置段前/段后间距
- 格式：`{"units": "pt"|"line", "value": number}`

### line_spacing
- 功能：设置行间距
- 格式：`{"units": "pt"|"line", "value": number}`

### background_color
- 功能：设置段落背景色（常用于代码块）
- 取值：HEX 颜色值，不带 `#` 前缀（如 `"F5F5F5"`）

---

## 缩进属性

### left_indent
- 功能：设置左缩进（文本之前）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "cm", "value": 1.5}` — 左缩进 1.5 厘米
  - `{"units": "chars", "value": 2}` — 左缩进 2 个字符

### right_indent
- 功能：设置右缩进（文本之后）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "cm", "value": 1}` — 右缩进 1 厘米
  - `{"units": "chars", "value": 2}` — 右缩进 2 个字符

### first_line_indent
- 功能：设置首行缩进（特殊格式：首行缩进）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "chars", "value": 2}` — 首行缩进 2 个字符
  - `{"units": "cm", "value": 0.74}` — 首行缩进 0.74 厘米

### hanging_indent
- 功能：设置悬挂缩进（特殊格式：悬挂缩进）
- 格式：`{"units": "cm"|"chars", "value": number}`
- 示例：
  - `{"units": "chars", "value": 2}` — 悬挂缩进 2 个字符
  - `{"units": "cm", "value": 1}` — 悬挂缩进 1 厘米

---

## 标题属性

### outline_level
- 功能：设置标题的结构层级（让 Word 识别为标题，用于生成目录）
- 取值：0 ~ 8（0 = 一级标题，1 = 二级标题，以此类推）
- 适用范围：heading 类型的样式
- 说明：如果样式中定义了 `outline_level`，heading handler 会使用样式中的值；否则回退到 block 的 `level` 字段

---

## 推荐样式配置

### 正文

```json
{
  "Normal": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12,
    "first_line_indent": {"units": "chars", "value": 2}
  }
}
```

### 标题

```json
{
  "Heading 1": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "黑体",
    "font_size": 22,
    "bold": true,
    "outline_level": 0,
    "alignment": "center",
    "line_spacing": {"units": "line", "value": 1.5},
    "space_before": {"units": "pt", "value": 6},
    "space_after": {"units": "pt", "value": 12}
  }
}
```

### 代码块

```json
{
  "Code": {
    "font_name": "Consolas",
    "font_name_east_asia": "Consolas",
    "font_size": 10.5,
    "background_color": "F5F5F5",
    "line_spacing": {"units": "pt", "value": 18},
    "left_indent": {"units": "cm", "value": 0.74}
  }
}
```

### 图片

```json
{
  "Image": {
    "alignment": "center",
    "line_spacing": {"units": "line", "value": 1},
    "space_before": {"units": "pt", "value": 12},
    "space_after": {"units": "pt", "value": 6},
    "first_line_indent": {"units": "chars", "value": 0}
  }
}
```

### 表格

```json
{
  "Table Header": {
    "font_name": "Arial",
    "font_name_east_asia": "宋体",
    "font_size": 11,
    "bold": true,
    "alignment": "center"
  },
  "Table Body": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 11,
    "alignment": "center"
  }
}
```

### 公式

```json
{
  "Formula": {
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

### 目录

```json
{
  "TOC 1": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "黑体",
    "font_size": 14,
    "first_line_indent": {"units": "chars", "value": 2}
  },
  "TOC 2": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12,
    "first_line_indent": {"units": "chars", "value": 2},
    "left_indent": {"units": "chars", "value": 2}
  },
  "TOC 3": {
    "font_name": "Times New Roman",
    "font_name_east_asia": "宋体",
    "font_size": 12,
    "first_line_indent": {"units": "chars", "value": 2},
    "left_indent": {"units": "chars", "value": 4}
  }
}
```
