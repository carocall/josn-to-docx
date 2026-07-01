"use strict";
/**
 * Block 处理器基类
 * 对应 Python 版 core/blocks/base.py
 *
 * 与 Python 版的差异：
 *   - Python 版通过 self.doc.add_paragraph 直接写入 Document
 *   - JS 版改用声明式：handle 返回 FileChild（或 FileChild[]），
 *     由 renderer 统一收集到 sections.children 中
 */

class BlockHandler {
  /**
   * @param {import("../styles").StyleEngine} styleEngine
   * @param {string} baseDir - content.json 所在目录，用于解析相对路径
   */
  constructor(styleEngine, baseDir) {
    this.styleEngine = styleEngine;
    this.baseDir = baseDir || ".";
  }

  /** 判断是否处理该 block，子类必须实现 */
  canHandle(block) {
    throw new Error("canHandle 未实现");
  }

  /**
   * 处理 block，返回：
   *   - FileChild / FileChild[]：普通块，由 renderer 推入当前 section
   *   - { _isSectionBreak: true, type }：节分隔信号，renderer 会切换 section
   * 子类必须实现
   */
  handle(block) {
    throw new Error("handle 未实现");
  }
}

module.exports = { BlockHandler };
