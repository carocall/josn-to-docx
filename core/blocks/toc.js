"use strict";
/**
 * 目录块处理器 - 插入 TOC 域（严格模式）
 * 对应 Python 版 core/blocks/toc.py
 *
 * 使用 docx.js 手写 Word TOC 域，结构与 Python 原版完全一致：
 *   TOC \o "<levelRange>" \h \z \u \t "<s1>,<s2>,<s3>"
 *
 * 说明：
 *   - \o "<levelRange>"：按 outlineLevel 取标题
 *   - \t "<s1>,<s2>,<s3>"：按样式名取标题
 *   - \h：超链接
 *   - \z：隐藏页码（Web 视图）
 *   - \u：应用段落 outlineLevel
 */

const {
  Paragraph,
  Run,
  XmlComponent,
  XmlAttributeComponent,
  SpaceType,
} = require("docx");
const { BlockHandler } = require("./base");

/**
 * Word 域字符属性
 */
class FldCharAttrs extends XmlAttributeComponent {
  constructor() {
    super(...arguments);
    this.xmlKeys = { type: "w:fldCharType", dirty: "w:dirty" };
  }
}

/**
 * 域开始字符 <w:fldChar w:fldCharType="begin"/>
 */
class Begin extends XmlComponent {
  constructor(dirty = false) {
    super("w:fldChar");
    this.root.push(new FldCharAttrs({ type: "begin", dirty }));
  }
}

/**
 * 域分隔字符 <w:fldChar w:fldCharType="separate"/>
 */
class Separate extends XmlComponent {
  constructor() {
    super("w:fldChar");
    this.root.push(new FldCharAttrs({ type: "separate" }));
  }
}

/**
 * 域结束字符 <w:fldChar w:fldCharType="end"/>
 */
class End extends XmlComponent {
  constructor() {
    super("w:fldChar");
    this.root.push(new FldCharAttrs({ type: "end" }));
  }
}

/**
 * 域指令文本属性 <w:instrText xml:space="preserve">
 */
class InstrTextAttrs extends XmlAttributeComponent {
  constructor() {
    super(...arguments);
    this.xmlKeys = { space: "xml:space" };
  }
}

/**
 * 域指令文本 <w:instrText xml:space="preserve">...</w:instrText>
 */
class InstrText extends XmlComponent {
  constructor(text) {
    super("w:instrText");
    this.root.push(new InstrTextAttrs({ space: SpaceType.PRESERVE }));
    this.root.push(text);
  }
}

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

    // Word TOC \t 开关使用样式的显示名称（与 Python 原版一致）
    const tocCode =
      ` TOC \\o "${levelRange}" \\h \\z \\u ` +
      `\\t "${styleLevelOne},${styleLevelTwo},${styleLevelThree}"`;

    // 与 Python 原版结构一致：一个段落包含 begin / instrText / separate / 提示文字 / end
    const para = new Paragraph({
      children: [
        new Run({
          children: [new Begin(), new InstrText(tocCode), new Separate()],
        }),
        new Run({
          children: ["点击更新域来更新目录"],
        }),
        new Run({
          children: [new End()],
        }),
      ],
    });

    return [para];
  }
}

module.exports = { TocHandler };
