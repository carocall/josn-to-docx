"use strict";
/**
 * 标题块处理器 - 自动设置 outlineLevel（严格模式）
 * 对应 Python 版 core/blocks/heading.py
 *
 * 行为：
 *   - 严格检查 style 必须存在
 *   - 若样式未定义 outline_level，则在段落上显式设置（level - 1, 0-based）
 *   - 若 block.id 存在，用 Bookmark 包裹 runs 用于内部跳转
 */

const { Paragraph, Bookmark } = require("docx");
const { BlockHandler } = require("./base");
const { buildTextRuns } = require("./runs");
const { StyleNotFoundError } = require("../styles");

class HeadingHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "heading";
  }

  handle(block) {
    const level = Math.max(1, Math.min(block.level || 1, 4));

    if (!block.style) {
      throw new StyleNotFoundError(`heading (level=${level}): 未指定 style`);
    }
    this.styleEngine.requireStyle(block.style, `heading (level=${level})`);

    const styleProps = this.styleEngine.getStyle(block.style);
    const runs = buildTextRuns(block.runs);

    // 组装段落 children：若提供 id，则用 Bookmark 包裹 runs
    /** @type {import("docx").ParagraphChild[]} */
    const children = block.id
      ? [new Bookmark({ id: String(block.id), children: runs })]
      : runs;

    /** @type {import("docx").IParagraphOptions} */
    const paraOpts = {
      style: this.styleEngine.getStyleId(block.style),
      children,
    };

    // 若样式未定义 outline_level，回退到 block.level（0-based）
    if (styleProps.outline_level == null) {
      paraOpts.outlineLevel = level - 1;
    }

    return new Paragraph(paraOpts);
  }
}

module.exports = { HeadingHandler };
