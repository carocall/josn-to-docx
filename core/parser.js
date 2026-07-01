"use strict";
/**
 * JSON 解析器 - 解析内容文件为 Block 对象
 * 对应 Python 版 core/parser.py
 */

const fs = require("fs");
const path = require("path");

/** 内容块基类 */
class Block {
  constructor(type, style = "", rawData = {}) {
    this.type = type;
    this.style = style || "";
    this.rawData = rawData || {};
  }
}

/** 文本块 */
class TextBlock extends Block {
  constructor({ style, runs = [], ...raw }) {
    super("text", style, raw);
    this.runs = runs || [];
  }
}

/** 图片块 */
class ImageBlock extends Block {
  constructor({ style, src = "", ...raw }) {
    super("image", style, raw);
    this.src = src || "";
  }
}

/** 表格块 */
class TableBlock extends Block {
  constructor({
    style,
    rows = 0,
    cols = 0,
    cells = [],
    header_style,
    body_style,
    border = "three_line",
    space_after = { units: "pt", value: 12 },
    ...raw
  }) {
    super("table", style, raw);
    this.rows = rows || 0;
    this.cols = cols || 0;
    this.cells = cells || [];
    this.header_style = header_style || "default_style_text";
    this.body_style = body_style || "default_style_text";
    this.border = border || "three_line";
    this.space_after = space_after || { units: "pt", value: 12 };
  }
}

/** 标题块 */
class HeadingBlock extends Block {
  constructor({ level = 1, id, style, runs = [], ...raw }) {
    super("heading", style, raw);
    this.level = level || 1;
    this.id = id || "";
    this.runs = runs || [];
  }
}

/** 目录块 */
class TocBlock extends Block {
  constructor({
    levels = [1, 2, 3],
    style_level_one,
    style_level_two,
    style_level_three,
    ...raw
  }) {
    super("toc", null, raw);
    this.levels = levels || [1, 2, 3];
    this.style_level_one = style_level_one;
    this.style_level_two = style_level_two;
    this.style_level_three = style_level_three;
  }
}

/** 分页块 */
class PageBreakBlock extends Block {
  constructor({ break_type = "page", ...raw }) {
    super("page-break", null, raw);
    this.break_type = break_type || "page";
  }
}

/** 节分隔块 */
class SectionBreakBlock extends Block {
  constructor({ break_type = "nextPage", ...raw }) {
    super("section-break", null, raw);
    this.break_type = break_type || "nextPage";
  }
}

/** 代码块 */
class CodeBlock extends Block {
  constructor({ language = "", style, content = "", ...raw }) {
    super("code", style, raw);
    this.language = language || "";
    this.content = content || "";
  }
}

/** 公式块（新增）—— LaTeX 公式，渲染为 Word 原生 Math 组件 */
class FormulaBlock extends Block {
  constructor({ style, latex = "", display = true, ...raw }) {
    super("formula", style, raw);
    this.latex = latex || "";
    // 块级公式默认 display 模式（居中、放大）；display:false 时按行内样式渲染
    this.display = display !== false;
  }
}

/** 内容解析器，将 JSON 解析为 Block 对象 */
class ContentParser {
  constructor(jsonPath) {
    this.jsonPath = path.resolve(jsonPath);
    this.baseDir = path.dirname(this.jsonPath);
    this.data = this._loadJson();
  }

  _loadJson() {
    return JSON.parse(fs.readFileSync(this.jsonPath, "utf-8"));
  }

  parse() {
    const blocksData = this.data.blocks || [];
    return blocksData.map((b) => this._parseBlock(b));
  }

  _parseBlock(data) {
    const type = data.type || "text";
    const parsers = {
      text: TextBlock,
      heading: HeadingBlock,
      image: ImageBlock,
      table: TableBlock,
      toc: TocBlock,
      "page-break": PageBreakBlock,
      "section-break": SectionBreakBlock,
      code: CodeBlock,
      formula: FormulaBlock,
    };
    const Parser = parsers[type] || TextBlock;
    return new Parser(data);
  }

  getBaseDir() {
    return this.baseDir;
  }
}

module.exports = {
  Block,
  TextBlock,
  ImageBlock,
  TableBlock,
  HeadingBlock,
  TocBlock,
  PageBreakBlock,
  SectionBreakBlock,
  CodeBlock,
  FormulaBlock,
  ContentParser,
};
