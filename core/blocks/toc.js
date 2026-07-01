"use strict";
/**
 * 目录块处理器 - 插入 TOC 域（严格模式）
 * 对应 Python 版 core/blocks/toc.py
 *
 * 使用 docx.js 的 TableOfContents 组件，对应 Word 域代码：
 *   TOC \o "<levelRange>" \h \z \u \t "<s1>,<s2>,<s3>"
 *
 * 说明：
 *   - \o "<levelRange>"：按 outlineLevel 取标题（headingStyleRange）
 *   - \t "<s1>,<s2>,<s3>"：按样式名取标题，逗号分隔（stylesWithLevels）
 *   - \h：超链接
 *   - \z：隐藏页码（Web 视图）
 *   - \u：应用段落 outlineLevel
 */

const { Paragraph, TextRun, TableOfContents } = require("docx");
const { BlockHandler } = require("./base");
const { StyleNotFoundError } = require("../styles");

class TocHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "toc";
  }

  handle(block) {
    const styleLevelOne = block.style_level_one || "TOC1";
    const styleLevelTwo = block.style_level_two || "TOC2";
    const styleLevelThree = block.style_level_three || "TOC3";

    this.styleEngine.requireStyle(styleLevelOne, "toc level 1");
    this.styleEngine.requireStyle(styleLevelTwo, "toc level 2");
    this.styleEngine.requireStyle(styleLevelThree, "toc level 3");

    const levels = Array.isArray(block.levels) && block.levels.length > 0
      ? block.levels
      : [1, 2, 3];
    const levelRange =
      levels.length >= 2
        ? `${Math.min(...levels)}-${Math.max(...levels)}`
        : String(levels[0]);

    // 把样式名转换为 styleId，确保与 Word 中实际样式 ID 一致
    const s1 = this.styleEngine.getStyleId(styleLevelOne);
    const s2 = this.styleEngine.getStyleId(styleLevelTwo);
    const s3 = this.styleEngine.getStyleId(styleLevelThree);

    const toc = new TableOfContents("目录", {
      hyperlink: true,
      headingStyleRange: levelRange,
      stylesWithLevels: [
        { styleName: s1, level: 1 },
        { styleName: s2, level: 2 },
        { styleName: s3, level: 3 },
      ],
      useAppliedParagraphOutlineLevel: true,
    });

    // 提示文字（用户在 Word 中更新域后会替换）
    const hint = new Paragraph({
      children: [new TextRun("点击更新域来更新目录")],
    });

    return [toc, hint];
  }
}

module.exports = { TocHandler };
