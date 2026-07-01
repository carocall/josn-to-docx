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
 */

const { BorderStyle } = require("docx");

const SINGLE = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
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
  const b = { top: NONE, bottom: NONE, left: NONE, right: NONE };
  if (rowIndex === 0) {
    b.top = SINGLE;
    b.bottom = SINGLE;
  }
  if (totalRows >= 2 && isLast) {
    b.bottom = SINGLE;
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

module.exports = { BorderHelper: { cellBorders, tableNoneBorders }, SINGLE, NONE };
