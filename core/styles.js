"use strict";
/**
 * 样式引擎 - 严格模式：样式必须存在，否则报错
 * 对应 Python 版 core/styles.py
 *
 * 职责：
 *   1. 加载并校验 style.json
 *   2. 将每个样式定义转换为 docx.js 的 IParagraphStyleOptions
 *   3. 提供 getStyle / requireStyle / hasStyle 查询接口（严格模式）
 *
 * 说明：
 *   - docx.js 的 IIndentAttributesProperties 不支持 firstLineChars，
 *     这里按字号换算为等价的 firstLine（twips）：firstLine = (chars/100) * fontSize * 20
 *   - docx.js 的段落样式 paragraph 配置不支持 shading（背景色），
 *     因此 background_color 不在样式中输出，由 CodeHandler 在段落上直接设置
 */

const fs = require("fs");
const path = require("path");
const { AlignmentType, LineRuleType } = require("docx");
const { SpacingHelper, TWIPS_PER_PT } = require("./utils/spacing");

const TWIPS_PER_CM = 1440 / 2.54; // 1 英寸 = 1440 twips，1 cm = 1440/2.54
const LINE_SINGLE = 240; // docx.js 行距倍数：240 = 单倍

const ALIGN_MAP = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

class StyleNotFoundError extends Error {}

class StyleEngine {
  constructor(userStylePath) {
    this.styles = this._loadStyles(userStylePath);
    this._usedIds = new Set();
    this._idMap = {};
    // 预先生成 styleName -> styleId 的映射，保证稳定且唯一
    Object.keys(this.styles).forEach((name, idx) => {
      this._idMap[name] = this._sanitizeId(name, idx);
    });
  }

  _loadStyles(userStylePath) {
    if (!userStylePath) {
      throw new StyleNotFoundError("未提供样式文件路径");
    }
    const p = path.resolve(userStylePath);
    if (!fs.existsSync(p)) {
      throw new StyleNotFoundError(`样式文件不存在: ${userStylePath}`);
    }
    const styles = JSON.parse(fs.readFileSync(p, "utf-8"));
    if (!styles || Object.keys(styles).length === 0) {
      throw new StyleNotFoundError("样式文件为空");
    }
    return styles;
  }

  /** 把样式名清洗为合法的 docx styleId（仅字母数字下划线） */
  _sanitizeId(name, idx) {
    let id = String(name).replace(/[^A-Za-z0-9_]/g, "_");
    if (!id) id = `style_${idx}`;
    if (/^[0-9]/.test(id)) id = `s_${id}`;
    let unique = id;
    let n = 2;
    while (this._usedIds.has(unique)) {
      unique = `${id}_${n++}`;
    }
    this._usedIds.add(unique);
    return unique;
  }

  /** 获取样式名对应的 docx styleId（供 Paragraph.style 使用） */
  getStyleId(styleName) {
    return this._idMap[styleName] || styleName;
  }

  /** 获取样式定义，不存在则报错 */
  getStyle(styleName) {
    if (!this.styles.hasOwnProperty(styleName)) {
      throw new StyleNotFoundError(`样式不存在: '${styleName}'`);
    }
    return this.styles[styleName];
  }

  /** 要求样式必须存在，否则报错 */
  requireStyle(styleName, context = "") {
    if (!styleName) {
      throw new StyleNotFoundError(`${context}: 样式名称为空`);
    }
    if (!this.styles.hasOwnProperty(styleName)) {
      throw new StyleNotFoundError(`${context}: 样式不存在 '${styleName}'`);
    }
    return styleName;
  }

  hasStyle(styleName) {
    return this.styles.hasOwnProperty(styleName);
  }

  /** 转换为 docx.js 的 paragraphStyles 数组，用于 Document.styles */
  toDocxStyles() {
    return Object.entries(this.styles).map(([name, props]) => {
      const id = this._idMap[name];
      return {
        id,
        name,
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: this._buildRun(props),
        paragraph: this._buildParagraph(props),
      };
    });
  }

  _buildRun(props) {
    const fontName = props.font_name || "Times New Roman";
    const fontNameEastAsia = props.font_name_east_asia || "宋体";
    const fontSize = props.font_size != null ? props.font_size : 12;
    const run = {
      font: { ascii: fontName, hAnsi: fontName, eastAsia: fontNameEastAsia },
      size: Math.round(fontSize * 2), // half-points
      color: "000000", // Python 版默认黑色
    };
    if (props.bold) run.bold = true;
    return run;
  }

  _buildParagraph(props) {
    const paragraph = {};

    // 对齐
    if (props.alignment) {
      paragraph.alignment = ALIGN_MAP[props.alignment] || ALIGN_MAP.LEFT;
    }

    // 段前/段后
    const before = SpacingHelper.toTwips(props.space_before, 0);
    const after = SpacingHelper.toTwips(props.space_after, 0);
    paragraph.spacing = { before, after };

    // 行距
    if (props.line_spacing) {
      const units = props.line_spacing.units || "line";
      const value = props.line_spacing.value != null ? props.line_spacing.value : 1.0;
      if (units === "pt") {
        paragraph.spacing.line = Math.round(value * TWIPS_PER_PT);
        paragraph.spacing.lineRule = LineRuleType.EXACTLY;
      } else {
        paragraph.spacing.line = Math.round(value * LINE_SINGLE);
        paragraph.spacing.lineRule = LineRuleType.AUTO;
      }
    }

    // 缩进（firstLineChars 换算为 firstLine；left_indent_cm 换算为 left）
    const indent = {};
    if (props.firstLineChars) {
      const fs = props.font_size != null ? props.font_size : 12;
      indent.firstLine = Math.round((props.firstLineChars / 100) * fs * TWIPS_PER_PT);
    }
    if (props.left_indent_cm != null) {
      indent.left = Math.round(props.left_indent_cm * TWIPS_PER_CM);
    }
    if (Object.keys(indent).length > 0) {
      paragraph.indent = indent;
    }

    // outline_level（让 Word 识别为标题结构，用于目录生成）
    if (props.outline_level != null) {
      paragraph.outlineLevel = props.outline_level;
    }

    return paragraph;
  }
}

module.exports = { StyleEngine, StyleNotFoundError };
