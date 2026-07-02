"use strict";
/**
 * 自定义缩进组件 - 支持 Word 的所有缩进属性
 *
 * 支持的 w:ind 属性：
 *   - w:left / w:right          左缩进 / 右缩进（twips）
 *   - w:firstLine / w:hanging   首行缩进 / 悬挂缩进（twips）
 *   - w:firstLineChars          首行缩进（字符数，200 = 2 字符）
 *   - w:hangingChars            悬挂缩进（字符数）
 *   - w:leftChars / w:rightChars 左/右缩进（字符数）
 */

const { XmlComponent } = require("docx");

/**
 * 构造一个 w:ind 元素，支持所有缩进属性
 * @param {Object} attrs - 形如 { "w:firstLineChars": "200", "w:left": "0" }
 */
class IndentComponent extends XmlComponent {
  constructor(attrs) {
    super("w:ind");
    this.root.push({ _attr: attrs });
  }
}

module.exports = { IndentComponent };
