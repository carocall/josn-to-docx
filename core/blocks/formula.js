"use strict";
/**
 * 公式块处理器（新增）
 * 参考 mdtodocx/lib/docx-generator.js 中 latexToMath 的实现逻辑，
 * 将 LaTeX 公式渲染为 Word 原生 Math 组件（OMML）。
 *
 * 流程：
 *   1. katex.renderToString(latex, { displayMode, output: "mathml" })
 *      -> 得到 MathML 字符串
 *   2. mathmlToDocxChildren(mathml) -> 得到 docx Math children 数组
 *   3. new Math({ children }) -> 包装为 oMath 块
 *   4. 放入居中段落（display 模式）或行内段落（inline 模式）
 *
 * 配置字段：
 *   - latex:   LaTeX 源码（必填）
 *   - display: true=块级公式（居中，默认）；false=行内公式
 *   - style:   段落样式名（必填，严格模式）
 */

const katex = require("katex");
const { Paragraph, TextRun, Math: DocxMath, AlignmentType } = require("docx");
const { BlockHandler } = require("./base");
const { mathmlToDocxChildren } = require("../utils/mathml-to-docx");
const { StyleNotFoundError } = require("../styles");

class FormulaHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "formula";
  }

  handle(block) {
    if (!block.style) {
      throw new StyleNotFoundError("formula: 未指定样式名称");
    }
    this.styleEngine.requireStyle(block.style, "formula");

    const styleId = this.styleEngine.getStyleId(block.style);
    const latex = block.latex || "";
    const displayMode = block.display !== false;

    /** @type {import("docx").ParagraphChild[]} */
    const children = [];

    try {
      const mathml = katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: "mathml",
      });
      const mathChildren = mathmlToDocxChildren(mathml);
      if (mathChildren && mathChildren.length > 0) {
        children.push(new DocxMath({ children: mathChildren }));
      } else {
        // 解析为空，回退为占位文本
        children.push(
          new TextRun({ text: `[公式: ${latex}]`, italics: true, color: "888888" })
        );
      }
    } catch (e) {
      // 渲染失败，写入错误提示
      children.push(
        new TextRun({ text: `[公式错误: ${latex}]`, italics: true, color: "FF0000" })
      );
    }

    /** @type {import("docx").IParagraphOptions} */
    const paraOpts = {
      style: styleId,
      children,
    };

    // display 模式：居中对齐；inline 模式：保持样式默认对齐
    if (displayMode) {
      paraOpts.alignment = AlignmentType.CENTER;
      // 与 mdtodocx 保持一致的段前段后间距
      paraOpts.spacing = { before: 200, after: 200 };
    }

    return new Paragraph(paraOpts);
  }
}

module.exports = { FormulaHandler };
