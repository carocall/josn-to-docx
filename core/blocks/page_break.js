"use strict";
/**
 * 分页块处理器 - 支持 page / column / line 三种类型
 * 对应 Python 版 core/blocks/page_break.py
 *
 * 实现：
 *   - page   -> PageBreak（独立段落）
 *   - column -> ColumnBreak（独立段落）
 *   - line   -> TextRun({ break: 1 })（行内换行）
 */

const { Paragraph, TextRun, PageBreak, ColumnBreak } = require("docx");
const { BlockHandler } = require("./base");

const PAGE_BREAK_TYPES = new Set(["page", "column", "line"]);

class PageBreakHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "page-break";
  }

  handle(block) {
    const breakType = block.break_type || "page";

    if (!PAGE_BREAK_TYPES.has(breakType)) {
      throw new Error(
        `page-break: 无效的 break_type '${breakType}'，可选值: ${Array.from(
          PAGE_BREAK_TYPES
        )
          .sort()
          .join(", ")}`
      );
    }

    let child;
    if (breakType === "page") {
      child = new PageBreak();
    } else if (breakType === "column") {
      child = new ColumnBreak();
    } else {
      // line: 行内换行（w:br 默认 type 为 textWrapping）
      child = new TextRun({ break: 1 });
    }

    return new Paragraph({ children: [child] });
  }
}

module.exports = { PageBreakHandler };
