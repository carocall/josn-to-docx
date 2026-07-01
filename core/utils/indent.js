"use strict";
/**
 * 自定义缩进组件 - 支持 w:firstLineChars 属性
 *
 * 背景：
 *   docx.js 的 Indent 类只支持 w:firstLine / w:left / w:hanging 等标准属性，
 *   不支持 w:firstLineChars（按字符数缩进）。Python 原版通过 OxmlElement
 *   直接写 XML 实现了 firstLineChars，这里用自定义 XmlComponent 模拟。
 *
 *   <w:ind w:firstLineChars="200" w:left="0"/>
 *   Word 会按字符宽度动态计算缩进量（200 = 2 个字符），与字号/字体联动。
 */

const { XmlComponent } = require("docx");

/**
 * 构造一个 w:ind 元素，支持 firstLineChars 等任意属性
 * @param {Object} attrs - 形如 { "w:firstLineChars": "200", "w:left": "0" }
 */
class FirstLineCharsIndent extends XmlComponent {
  constructor(attrs) {
    super("w:ind");
    this.root.push({ _attr: attrs });
  }
}

module.exports = { FirstLineCharsIndent };
