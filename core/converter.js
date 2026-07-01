"use strict";
/**
 * JSON to DOCX 转换器 - CLI 入口（严格模式）
 * 对应 Python 版 core/converter.py
 *
 * 用法: node core/converter.js <content.json> <style.json> <output.docx>
 */

const fs = require("fs");
const path = require("path");
const { DocxRenderer } = require("./renderer");
const { StyleNotFoundError } = require("./styles");

function printUsage() {
  console.log("用法: node core/converter.js <json文件路径> <style.json路径> <输出docx路径>");
  console.log("示例: node core/converter.js template/content.json template/style.json template/outputs/output.docx");
}

function validateFile(p, fileType) {
  if (!fs.existsSync(p)) {
    throw new Error(`${fileType} 文件不存在: ${p}`);
  }
  return p;
}

async function main() {
  if (process.argv.length < 5) {
    console.error("错误: 缺少必要参数");
    printUsage();
    process.exit(1);
  }

  const jsonPath = path.resolve(process.argv[2]);
  const stylePath = path.resolve(process.argv[3]);
  const outputPath = path.resolve(process.argv[4]);

  try {
    validateFile(jsonPath, "JSON内容");
    validateFile(stylePath, "样式");

    // 确保输出目录存在
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const renderer = new DocxRenderer(stylePath);
    const resultPath = await renderer.renderFile(jsonPath, outputPath);
    console.log(`文档已生成: ${resultPath}`);
  } catch (e) {
    if (e instanceof StyleNotFoundError) {
      console.error(`样式错误: ${e.message}`);
      process.exit(1);
    }
    console.error(`转换失败: ${e.message || e}`);
    if (process.env.DEBUG) {
      console.error(e.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
