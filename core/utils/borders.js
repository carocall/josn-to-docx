"use strict";
/**
 * 边框工具 - 处理表格边框
 * 对应 Python 版 core/utils/borders.py
 *
 * 策略与 Python 版一致：
 *   1. 先把整表所有边框设为 nil（无）
 *   2. 再根据 border_style 决定每个单元格的边框
 *      - none     : 全无
 *      - grid     : 四边全有
 *      - three_line: 顶/底 + 表头底线（三线表）
 *
 * 三线表线宽（size 单位为 1/8 磅）：
 *   - 顶线 / 底线      : 1.5pt（size = 12）
 *   - 表头底线        : 0.5pt（size = 4）
 */

const { BorderStyle } = require("docx");

// 线宽档位：size 为 1/8 磅
const LINE_15PT = { style: BorderStyle.SINGLE, size: 12, color: "000000" }; // 1.5pt
const LINE_05PT = { style: BorderStyle.SINGLE, size: 4, color: "000000" }; // 0.5pt

// 兼容旧命名：SINGLE 默认即 1.5pt（grid 边框沿用此宽度）
const SINGLE = LINE_15PT;
const NONE = { style: BorderStyle.NONE };

/**
 * 计算指定单元格的四个边框
 * @param {string} borderStyle none|grid|three_line
 * @param {number} rowIndex 当前行索引
 * @param {boolean} isLast 是否最后一行
 * @param {number} totalRows 总行数
 */
function cellBorders(borderStyle, rowIndex, isLast, totalRows) {
  if (borderStyle === "none") {
    return { top: NONE, bottom: NONE, left: NONE, right: NONE };
  }
  if (borderStyle === "grid") {
    return { top: SINGLE, bottom: SINGLE, left: SINGLE, right: SINGLE };
  }
  // three_line（默认）
  //   顶线 / 底线 = 1.5pt，表头底线 = 0.5pt
  const b = { top: NONE, bottom: NONE, left: NONE, right: NONE };
  if (rowIndex === 0) {
    b.top = LINE_15PT; // 顶线 1.5pt
    b.bottom = LINE_05PT; // 表头底线 0.5pt
  }
  if (totalRows >= 2 && isLast) {
    b.bottom = LINE_15PT; // 底线 1.5pt
  }
  return b;
}

/** 表级边框（全部 nil，等价于 Python 的 set_table_no_border） */
function tableNoneBorders() {
  return {
    top: NONE,
    bottom: NONE,
    left: NONE,
    right: NONE,
    insideHorizontal: NONE,
    insideVertical: NONE,
  };
}

module.exports = {
  BorderHelper: { cellBorders, tableNoneBorders },
  SINGLE,
  LINE_15PT,
  LINE_05PT,
  NONE,
};
