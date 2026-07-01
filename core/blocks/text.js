"use strict";
/**
 * 文本块处理器（严格模式）
 * 对应 Python 版 core/blocks/text.py
 */

const { Paragraph } = require("docx");
const { BlockHandler } = require("./base");
const { buildTextRuns } = require("./runs");
const { StyleNotFoundError } = require("../styles");

class TextHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "text";
  }

  handle(block) {
    if (!block.style) {
      throw new StyleNotFoundError("text: 未指定样式名称");
    }
    this.styleEngine.requireStyle(block.style, "text");

    const children = buildTextRuns(block.runs);
    // 没有runs时仍创建空段落（与Python版一致）
    return new Paragraph({
      style: this.styleEngine.getStyleId(block.style),
      children,
    });
  }
}

module.exports = { TextHandler };
