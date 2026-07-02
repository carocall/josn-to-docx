# Word 内置样式列表

在 `style.json` 中使用内置样式名称会**覆盖** Word 原有的样式定义。

## 使用说明

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

**注意**：内置样式名称区分大小写，必须使用英文名称。

---

## 正文类

| 样式名称 | 说明 |
|----------|------|
| `Normal` | 默认正文样式 |
| `Body Text` | 正文文本 |
| `Body Text 2` | 正文文本 2 |
| `Body Text 3` | 正文文本 3 |
| `Body Text Indent` | 缩进正文 |
| `Body Text First Indent` | 首行缩进正文 |

## 标题类

| 样式名称 | 说明 |
|----------|------|
| `Heading 1` ~ `Heading 9` | 1-9 级标题 |
| `Title` | 文档标题 |
| `Subtitle` | 副标题 |

## 列表类

| 样式名称 | 说明 |
|----------|------|
| `List Bullet` | 项目符号列表 |
| `List Number` | 编号列表 |
| `List Paragraph` | 列表段落 |
| `List Continue` | 列表续行 |

## 引用与强调

| 样式名称 | 说明 |
|----------|------|
| `Quote` | 引用 |
| `Intense Quote` | 强烈引用 |
| `Block Quotation` | 块引用 |
| `Emphasis` | 强调 |
| `Intense Emphasis` | 强烈强调 |
| `Subtle Emphasis` | 微妙强调 |
| `Strong` | 加粗强调 |

## 目录类

| 样式名称 | 说明 |
|----------|------|
| `TOC 1` ~ `TOC 9` | 目录 1-9 级 |

## 表格类

| 样式名称 | 说明 |
|----------|------|
| `Table Grid` | 表格网格 |
| `Table Light Shading` | 浅底纹表格 |
| `Table Medium Shading` | 中底纹表格 |
| `Table Dark List` | 深色列表表格 |
| `Table Colorful Grid` | 彩色网格表格 |

## 其他常用

| 样式名称 | 说明 |
|----------|------|
| `Hyperlink` | 超链接 |
| `Followed Hyperlink` | 已访问超链接 |
| `Book Title` | 书名 |
| `Caption` | 图表题注 |
| `Header` | 页眉 |
| `Footer` | 页脚 |
| `Page Number` | 页码 |
| `Footnote Text` | 脚注文本 |
| `Endnote Text` | 尾注文本 |
| `Index 1` ~ `Index 9` | 索引 1-9 级 |
