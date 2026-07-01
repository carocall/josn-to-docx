"use strict";
/**
 * 图片块处理器（严格模式）
 * 对应 Python 版 core/blocks/image.py
 *
 * 行为：
 *   - 严格检查 style 必须存在
 *   - 读取 style.alignment（默认 center）、space_before/after 应用到段落
 *   - 读取 style.width_cm（默认 10）作为目标宽度
 *   - 用 image-size 读取图片原始像素尺寸，按 width_cm 等比缩放
 *
 * 关于单位：
 *   docx.js 的 ImageRun.transformation.{width,height} 单位是像素（pixel），
 *   库内部按 9525 EMU/pixel 换算。所以这里用 96 DPI 把 cm 换算为 pixel：
 *   pixels = cm / 2.54 * 96
 */

const fs = require("fs");
const path = require("path");
const { Paragraph, TextRun, ImageRun, AlignmentType } = require("docx");
const { imageSize } = require("image-size");
const { BlockHandler } = require("./base");
const { SpacingHelper } = require("../utils/spacing");
const { StyleNotFoundError } = require("../styles");

const PX_PER_CM = 96 / 2.54; // 96 DPI

const ALIGN_MAP = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
};

class ImageHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "image";
  }

  handle(block) {
    if (!block.style) {
      throw new StyleNotFoundError("image: 未指定样式名称");
    }
    this.styleEngine.requireStyle(block.style, "image");
    const style = this.styleEngine.getStyle(block.style);

    /** @type {import("docx").IParagraphOptions} */
    const paraOpts = {
      alignment: ALIGN_MAP[style.alignment] || AlignmentType.CENTER,
      spacing: {
        before: SpacingHelper.toTwips(style.space_before, 0),
        after: SpacingHelper.toTwips(style.space_after, 0),
      },
      children: [],
    };

    if (!block.src) {
      paraOpts.children.push(new TextRun("[图片路径为空]"));
      return new Paragraph(paraOpts);
    }

    // 解析图片路径：相对路径基于 content.json 所在目录
    const imgPath = path.isAbsolute(block.src)
      ? block.src
      : path.resolve(this.baseDir, block.src);

    try {
      const buf = fs.readFileSync(imgPath);
      const dim = imageSize(buf);
      const origW = dim.width || 1;
      const origH = dim.height || 1;

      const widthCm = style.width_cm != null ? style.width_cm : 10;
      const targetWidthPx = Math.round(widthCm * PX_PER_CM);
      const targetHeightPx = Math.round(
        (origH / origW) * targetWidthPx
      );

      paraOpts.children.push(
        new ImageRun({
          data: buf,
          transformation: { width: targetWidthPx, height: targetHeightPx },
        })
      );
    } catch (e) {
      paraOpts.children.push(
        new TextRun(`[图片加载失败: ${block.src}]`)
      );
    }

    return new Paragraph(paraOpts);
  }
}

module.exports = { ImageHandler };
