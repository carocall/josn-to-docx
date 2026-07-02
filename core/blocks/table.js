"use strict";
/**
 * 表格块处理器（严格模式）
 * 对应 Python 版 core/blocks/table.py
 *
 * 行为：
 *   - 严格检查 header_style / body_style 必须存在
 *   - 表头行使用 header_style，其余行使用 body_style
 *   - 单元格段落清除 firstLine/hanging 缩进（与 Python 版一致）
 *   - 表级 borders 设为 nil，再按 row/cell 应用 cellBorders
 *   - 支持 col_widths 配置列宽（单位 twips）
 *   - 表格后间距通过 tblPr spacing 设置（不再使用空段落）
 */

const {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} = require("docx");
const { BlockHandler } = require("./base");
const { BorderHelper } = require("../utils/borders");
const { SpacingHelper } = require("../utils/spacing");
const { StyleNotFoundError } = require("../styles");

class TableHandler extends BlockHandler {
  canHandle(block) {
    return block.type === "table";
  }

  handle(block) {
    if (!block.rows || !block.cols || block.rows <= 0 || block.cols <= 0) {
      return null;
    }

    // 校验样式
    if (!block.header_style) {
      throw new StyleNotFoundError("table: 未指定 header_style");
    }
    if (!block.body_style) {
      throw new StyleNotFoundError("table: 未指定 body_style");
    }
    this.styleEngine.requireStyle(block.header_style, "table header");
    this.styleEngine.requireStyle(block.body_style, "table body");

    const borderStyle = block.border || "three_line";
    const totalRows = block.rows;
    /** @type {TableRow[]} */
    const rows = [];

    for (let i = 0; i < Math.min(totalRows, block.cells.length); i++) {
      const rowCells = block.cells[i] || [];
      const isLast = i === totalRows - 1;
      const cellStyleName = i === 0 ? block.header_style : block.body_style;
      const cellStyleId = this.styleEngine.getStyleId(cellStyleName);
      const borders = BorderHelper.cellBorders(
        borderStyle,
        i,
        isLast,
        totalRows
      );

      /** @type {TableCell[]} */
      const cells = [];
      for (let j = 0; j < block.cols; j++) {
        const text = rowCells[j] != null ? String(rowCells[j]) : "";
        const cellOpts = {
          borders,
          children: [
            new Paragraph({
              style: cellStyleId,
              // 清除缩进（避免 firstLineChars 应用到表格）
              indent: { firstLine: 0, hanging: 0, left: 0 },
              children: [new TextRun({ text })],
            }),
          ],
        };

        // 设置列宽（单位 twips）
        if (block.col_widths && block.col_widths[j] != null) {
          cellOpts.width = { size: block.col_widths[j], type: WidthType.DXA };
        }

        cells.push(new TableCell(cellOpts));
      }
      rows.push(new TableRow({ children: cells }));
    }

    const tableOpts = {
      rows,
      // 表级边框全部 nil，由单元格边框控制
      borders: BorderHelper.tableNoneBorders(),
      width: { size: 100, type: WidthType.PERCENTAGE },
    };

    // 通过 tblPr spacing 设置表格后间距（而非空段落）
    if (block.space_after) {
      tableOpts.spacing = {
        after: SpacingHelper.toTwips(block.space_after, 0),
      };
    }

    return new Table(tableOpts);
  }
}

module.exports = { TableHandler };
