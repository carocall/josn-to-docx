"use strict";
/**
 * 节分隔块处理器 - 支持 nextPage / continuous / evenPage / oddPage
 * 对应 Python 版 core/blocks/section_break.py
 *
 * 实现：
 *   与 Python 版（add_section 在文档末尾追加段落 + sectPr）不同，
 *   JS 版采用声明式：返回 { _isSectionBreak: true, type } 信号，
 *   由 renderer 切换到新的 section 并设置 properties.type。
 */

const { SectionType } = require("docx");
const { BlockHandler } = require("./base");

const SECTION_BREAK_MAP = {
  nextPage: SectionType.NEXT_PAGE,
  continuous: SectionType.CONTINUOUS,
  evenPage: SectionType.EVEN_PAGE,
  oddPage: SectionType.ODD_PAGE,
};

class SectionBreakHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "section-break";
  }

  handle(block) {
    const breakType = block.break_type || "nextPage";

    if (!SECTION_BREAK_MAP.hasOwnProperty(breakType)) {
      throw new Error(
        `section-break: 无效的 break_type '${breakType}'，可选值: ${Object.keys(
          SECTION_BREAK_MAP
        )
          .sort()
          .join(", ")}`
      );
    }

    return {
      _isSectionBreak: true,
      type: SECTION_BREAK_MAP[breakType],
    };
  }
}

module.exports = { SectionBreakHandler };
