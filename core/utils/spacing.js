"use strict";
/**
 * 间距工具 - 处理段落间距
 * 对应 Python 版 core/utils/spacing.py
 *
 * docx.js 的 spacing 数值单位为 twips（1 磅 = 20 twips）。
 * "line" 单位下 Python 用 Pt(value*12) 表示“行”数（1 行 ≈ 12 磅），
 * 这里换算为等价的 twips。
 */

const TWIPS_PER_PT = 20; // 1 磅 = 20 twips
const PT_PER_LINE = 12; // 1 行 ≈ 12 磅（与 Python 实现保持一致）

const SpacingHelper = {
  /**
   * 把 spacing 配置转换为 docx.js 的 ISpacingProperties 片段
   * @param {"space_before"|"space_after"} attrName
   * @param {{units:"pt"|"line", value:number}|undefined} spacingConfig
   * @returns {{before?:number, after?:number}} 返回包含 before/after 的对象（按 attrName）
   */
  toSpacingFragment(attrName, spacingConfig) {
    const twips = SpacingHelper.toTwips(spacingConfig, 0);
    if (attrName === "space_before") return { before: twips };
    if (attrName === "space_after") return { after: twips };
    return {};
  },

  /** 换算为 twips */
  toTwips(spacingConfig, defaultPt = 0) {
    if (!spacingConfig) return defaultPt * TWIPS_PER_PT;
    const units = spacingConfig.units || "pt";
    const value = spacingConfig.value == null ? defaultPt : spacingConfig.value;
    if (units === "line") {
      return value * PT_PER_LINE * TWIPS_PER_PT;
    }
    return value * TWIPS_PER_PT;
  },
};

module.exports = { SpacingHelper, TWIPS_PER_PT, PT_PER_LINE };
