"use strict";
/**
 * Run 公共助手 - 将 runs 数组转换为 docx TextRun[]
 * 对应 Python 版 TextHandler/HeadingHandler 的 _add_run 方法
 *
 * runs 项支持的内联样式：
 *   text, bold, italic, underline, superscript, subscript, color, highlight
 */

const { TextRun, ShadingType } = require("docx");

/** 规范化颜色字符串：去除前导 #，转大写 */
function normalizeColor(color) {
  if (!color) return "";
  let c = String(color).trim();
  if (c.startsWith("#")) c = c.slice(1);
  return c.toUpperCase();
}

/**
 * 把单个 run 数据项转换为 docx TextRun
 * @param {{text?:string, bold?:boolean, italic?:boolean, underline?:boolean,
 *          superscript?:boolean, subscript?:boolean,
 *          color?:string, highlight?:string}} runData
 * @returns {TextRun|null}
 */
function buildTextRun(runData) {
  const text = runData && runData.text != null ? String(runData.text) : "";
  // 即便 text 为空也保留 run（保证空段落的占位行为与 Python 版一致）
  const opts = { text };

  if (runData.bold) opts.bold = true;
  if (runData.italic) opts.italic = true;
  if (runData.underline) opts.underline = true;
  if (runData.superscript) opts.superScript = true;
  if (runData.subscript) opts.subScript = true;

  const color = normalizeColor(runData.color);
  if (color) opts.color = color;

  const highlight = normalizeColor(runData.highlight);
  if (highlight) {
    // docx.js TextRun 没有直接的 highlight 属性，用 shading 模拟背景色
    opts.shading = { type: ShadingType.CLEAR, fill: highlight, color: "auto" };
  }

  return new TextRun(opts);
}

/**
 * 把 runs 数组转换为 TextRun[]
 * @param {Array} runs
 * @returns {TextRun[]}
 */
function buildTextRuns(runs) {
  if (!Array.isArray(runs) || runs.length === 0) return [];
  return runs.map(buildTextRun).filter(Boolean);
}

module.exports = { buildTextRun, buildTextRuns, normalizeColor };
