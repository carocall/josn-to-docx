"use strict";
/**
 * 块处理器统一出口
 * 对应 Python 版 core/blocks/__init__.py
 */

const { BlockHandler } = require("./base");
const { TextHandler } = require("./text");
const { HeadingHandler } = require("./heading");
const { ImageHandler } = require("./image");
const { TableHandler } = require("./table");
const { TocHandler } = require("./toc");
const { PageBreakHandler } = require("./page_break");
const { SectionBreakHandler } = require("./section_break");
const { CodeHandler } = require("./code");
const { FormulaHandler } = require("./formula");

module.exports = {
  BlockHandler,
  TextHandler,
  HeadingHandler,
  ImageHandler,
  TableHandler,
  TocHandler,
  PageBreakHandler,
  SectionBreakHandler,
  CodeHandler,
  FormulaHandler,
};
