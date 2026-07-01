"use strict";
/**
 * 代码块处理器（严格模式）
 * 对应 Python 版 core/blocks/code.py
 *
 * 行为：
 *   - 严格检查 style 必须存在
 *   - content 按行拆分，每行渲染为独立段落（保留原始缩进和空格）
 *   - 应用样式（等宽字体、行距、段间距由 style 控制）
 *   - 段落清除 firstLine 缩进（代码块不需要首行缩进）
 *   - 段落直接设置 shading（背景色），因 docx.js paragraph 样式不支持 shading
 *   - 段落左缩进按 left_indent_cm 换算
 */

const { Paragraph, TextRun, ShadingType } = require("docx");
const { BlockHandler } = require("./base");
const { StyleNotFoundError } = require("../styles");

const TWIPS_PER_CM = 1440 / 2.54;

class CodeHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "code";
  }

  handle(block) {
    if (!block.style) {
      throw new StyleNotFoundError("code: 未指定样式名称");
    }
    this.styleEngine.requireStyle(block.style, "code");

    const styleProps = this.styleEngine.getStyle(block.style);
    const styleId = this.styleEngine.getStyleId(block.style);

    const bgColor = (styleProps.background_color || "").replace(/^#/, "");
    const leftIndentCm =
      styleProps.left_indent_cm != null ? styleProps.left_indent_cm : 0;

    // 按行拆分；空 content 视为单行空串
    const content = block.content || "";
    const lines = content.split("\n");
    if (lines.length === 0) lines.push("");

    /** @type {Paragraph[]} */
    const paragraphs = [];

    for (const line of lines) {
      /** @type {import("docx").IParagraphOptions} */
      const opts = {
        style: styleId,
        // 清除首行缩进（代码块不需要）
        indent: { firstLine: 0, hanging: 0 },
        children: [],
      };

      // 左缩进
      if (leftIndentCm > 0) {
        opts.indent.left = Math.round(leftIndentCm * TWIPS_PER_CM);
      }

      // 段落背景色（直接 shading，不通过样式）
      if (bgColor) {
        opts.shading = {
          type: ShadingType.CLEAR,
          fill: bgColor,
          color: "auto",
        };
      }

      // 文本 run：保留原始空格（docx.js 默认 preserve）
      opts.children.push(new TextRun({ text: line }));

      paragraphs.push(new Paragraph(opts));
    }

    return paragraphs;
  }
}

module.exports = { CodeHandler };
