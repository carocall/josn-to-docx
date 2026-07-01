"use strict";
/**
 * DOCX 渲染器 - 将 Block 对象渲染为 Word 文档
 * 对应 Python 版 core/renderer.py
 *
 * 与 Python 版的差异：
 *   - Python 版用 python-docx 的 add_paragraph 即时写入 Document
 *   - JS 版用 docx.js 的声明式 API：先收集 children/sections，
 *     最后用 new Document({ sections, styles, features }) 一次性构建
 *
 * 节分隔处理：
 *   SectionBreakHandler 返回 { _isSectionBreak: true, type } 信号，
 *   renderer 收到信号后切换 section，并把 type 设置到下一个 section 的 properties。
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer } = require("docx");
const { StyleEngine } = require("./styles");
const { ContentParser } = require("./parser");
const {
  TextHandler,
  HeadingHandler,
  ImageHandler,
  TableHandler,
  TocHandler,
  PageBreakHandler,
  SectionBreakHandler,
  CodeHandler,
  FormulaHandler,
} = require("./blocks");

class DocxRenderer {
  constructor(stylePath) {
    this.styleEngine = new StyleEngine(stylePath);
    this.baseDir = ".";
    /** @type {import("docx").FileChild[]} */
    this._currentChildren = [];
    /** @type {import("docx").ISectionOptions[]} */
    this._sections = [];
    /** @type {string|undefined} 下一个 section 的 type（由 section-break 设置） */
    this._pendingSectionType = undefined;
    this.handlers = [];
  }

  /** 设置处理器链 */
  _setupHandlers(baseDir) {
    this.baseDir = baseDir || ".";
    this.handlers = [
      new TocHandler(this.styleEngine, this.baseDir),
      new HeadingHandler(this.styleEngine, this.baseDir),
      new TextHandler(this.styleEngine, this.baseDir),
      new CodeHandler(this.styleEngine, this.baseDir),
      new ImageHandler(this.styleEngine, this.baseDir),
      new TableHandler(this.styleEngine, this.baseDir),
      new PageBreakHandler(this.styleEngine, this.baseDir),
      new SectionBreakHandler(this.styleEngine, this.baseDir),
      new FormulaHandler(this.styleEngine, this.baseDir),
    ];
  }

  /** 渲染单个 block，把结果推入 currentChildren 或触发 section 切换 */
  _renderBlock(block) {
    const handler = this.handlers.find((h) => h.canHandle(block));
    if (!handler) {
      console.warn(`警告: 未找到处理 '${block.type}' 类型的处理器`);
      return;
    }

    const result = handler.handle(block);
    if (result == null) return;

    // 节分隔信号
    if (result._isSectionBreak) {
      this._closeCurrentSection();
      this._pendingSectionType = result.type;
      return;
    }

    // 数组（如 TableHandler 返回 [table, afterPara]）
    if (Array.isArray(result)) {
      for (const item of result) {
        if (item != null) this._currentChildren.push(item);
      }
      return;
    }

    // 单个 FileChild
    this._currentChildren.push(result);
  }

  /** 关闭当前 section，推入 _sections */
  _closeCurrentSection() {
    /** @type {import("docx").ISectionOptions} */
    const section = { children: this._currentChildren };
    if (this._pendingSectionType) {
      section.properties = { type: this._pendingSectionType };
      this._pendingSectionType = undefined;
    }
    this._sections.push(section);
    this._currentChildren = [];
  }

  /** 渲染所有 blocks 到 docx Buffer */
  async render(blocks, outputPath) {
    for (const block of blocks) {
      this._renderBlock(block);
    }
    // 关闭最后一个 section
    this._closeCurrentSection();

    // 构建 Document
    const doc = new Document({
      sections: this._sections,
      styles: {
        paragraphStyles: this.styleEngine.toDocxStyles(),
      },
      features: {
        // 打开文档时提示更新域（TOC）
        updateFields: true,
      },
    });

    const buffer = await Packer.toBuffer(doc);
    if (outputPath) {
      fs.writeFileSync(outputPath, buffer);
    }
    return buffer;
  }

  /** 从 JSON 文件渲染 Word 文档（便捷方法） */
  async renderFile(jsonPath, outputPath) {
    const parser = new ContentParser(jsonPath);
    const blocks = parser.parse();
    this._setupHandlers(parser.getBaseDir());

    const outPath =
      outputPath ||
      jsonPath.replace(/\.json$/i, ".docx");

    await this.render(blocks, outPath);
    return outPath;
  }
}

module.exports = { DocxRenderer };
