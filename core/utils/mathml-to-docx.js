"use strict";
/**
 * MathML 转 docx Math 组件模块
 * 移植自 mdtodocx/lib/mathml-to-docx.js
 * 将 KaTeX 生成的 MathML 转换为 Word 原生数学公式组件（OMML）
 */

const {
  MathRun,
  MathFraction,
  MathRadical,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
  MathSum,
  MathIntegral,
  XmlComponent,
} = require("docx");
const { XMLParser } = require("fast-xml-parser");

/** OMML 矩阵辅助类 */
class MathMatrixElement extends XmlComponent {
  constructor(children) {
    super("m:e");
    for (const child of children) this.root.push(child);
  }
}

class MathMatrixRow extends XmlComponent {
  constructor(cells) {
    super("m:mr");
    for (const cell of cells) this.root.push(new MathMatrixElement(cell));
  }
}

class MathMatrix extends XmlComponent {
  constructor(rows) {
    super("m:m");
    for (const row of rows) this.root.push(new MathMatrixRow(row));
  }
}

/**
 * 将 KaTeX MathML 字符串转换为 docx Math children
 * @param {string} mathml - MathML 字符串
 * @returns {Array} MathComponent 数组
 */
function mathmlToDocxChildren(mathml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "text",
    preserveOrder: true,
    trimValues: false,
  });

  const json = parser.parse(mathml);

  const mathNode = findFirst(json, "math");
  if (!mathNode) return [];

  // 优先使用 <semantics><mrow>...</mrow></semantics> 内容
  const semantics = findFirst(childrenOf(mathNode), "semantics");
  const root = semantics
    ? findFirst(childrenOf(semantics), "mrow") || semantics
    : findFirst(childrenOf(mathNode), "mrow") || mathNode;

  return walkChildren(childrenOf(root));
}

function walkChildren(nodes) {
  let out = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const tag = tagName(n);

    // 处理带有上下限的 N-ary 操作符（如求和、积分）
    if (tag === "munderover" || tag === "munder" || tag === "mover") {
      const kids = childrenOf(n);
      const moNode = findFirst(kids, "mo");
      const opText = moNode ? directText(childrenOf(moNode)) : "";
      const lower = tag !== "mover" ? (kids[1] ? walkNode(kids[1]) : []) : [];
      const upper = tag !== "munder" ? (kids[2] ? walkNode(kids[2]) : []) : [];
      const base = walkChildren(nodes.slice(i + 1));

      if (opText.includes("∑")) {
        out.push(new MathSum({ children: base, subScript: lower, superScript: upper }));
        break;
      }
      if (opText.includes("∫")) {
        out.push(new MathIntegral({ children: base, subScript: lower, superScript: upper }));
        break;
      }
    }

    // KaTeX 经常在操作符周围使用 msubsup
    if (tag === "msubsup") {
      const ks = childrenOf(n);
      const base = ks[0];
      if (tagName(base) === "mo") {
        const op = directText(childrenOf(base));
        const lower = ks[1] ? walkNode(ks[1]) : [];
        const upper = ks[2] ? walkNode(ks[2]) : [];
        const body = walkChildren(nodes.slice(i + 1));
        if (op.includes("∑")) {
          out.push(new MathSum({ children: body, subScript: lower, superScript: upper }));
          break;
        }
        if (op.includes("∫")) {
          out.push(new MathIntegral({ children: body, subScript: lower, superScript: upper }));
          break;
        }
      }
    }

    out = out.concat(walkNode(n));
  }
  return out;
}

function walkNode(node) {
  const tag = tagName(node);
  if (!tag) {
    const t = (node.text || "").toString();
    return t ? [new MathRun(t)] : [];
  }
  const kids = childrenOf(node);

  switch (tag) {
    case "mrow":
      return walkChildren(kids);
    case "mi":
    case "mn":
    case "mo":
      return textFrom(kids);
    case "msup": {
      const [base, sup] = firstN(kids, 2);
      return [new MathSuperScript({ children: walkNode(base), superScript: walkNode(sup) })];
    }
    case "msub": {
      const [base, sub] = firstN(kids, 2);
      return [new MathSubScript({ children: walkNode(base), subScript: walkNode(sub) })];
    }
    case "msubsup": {
      const [base, sub, sup] = firstN(kids, 3);
      return [
        new MathSubSuperScript({
          children: walkNode(base),
          subScript: walkNode(sub),
          superScript: walkNode(sup),
        }),
      ];
    }
    case "mfrac": {
      const [num, den] = firstN(kids, 2);
      return [new MathFraction({ numerator: walkNode(num), denominator: walkNode(den) })];
    }
    case "msqrt": {
      const [body] = firstN(kids, 1);
      return [new MathRadical({ children: walkNode(body) })];
    }
    case "mroot": {
      const [body, degree] = firstN(kids, 2);
      return [new MathRadical({ children: walkNode(body), degree: walkNode(degree) })];
    }
    case "mtable": {
      const rows = kids.filter((k) => tagName(k) === "mtr");
      const rowsCells = rows.map((row) => {
        const cells = childrenOf(row).filter((c) => tagName(c) === "mtd");
        return cells.map((cell) => walkChildren(childrenOf(cell)));
      });
      return [new MathMatrix(rowsCells)];
    }
    case "munderover":
    case "munder":
    case "mover": {
      const m = childrenOf(node);
      const base = m[0] ? walkNode(m[0]) : [];
      const accent = m[1] ? walkNode(m[1]) : [];
      // docx 库无专门的 MathAccent 组件，临时方案：
      // 1. 返回 base（确保基础内容正确显示）
      // 2. accent 作为额外内容追加
      return base.concat(accent);
    }
    default:
      return walkChildren(kids);
  }
}

function tagName(node) {
  // node 格式: { tag: [ children ], ":@": { attrs } } 或 { text: '...' }
  const keys = Object.keys(node).filter((k) => k !== "text" && k !== ":@");
  return keys[0] || null;
}

function childrenOf(node) {
  const tag = tagName(node);
  if (!tag) return [];
  const val = node[tag];
  return Array.isArray(val) ? val : val ? [val] : [];
}

function textFrom(nodes) {
  const texts = nodes.map((n) => (n.text != null ? n.text : "").toString()).join("");
  return texts ? [new MathRun(texts)] : [];
}

function directText(nodes) {
  return nodes.map((n) => (n.text != null ? n.text : "").toString()).join("");
}

function findFirst(nodes, name) {
  for (const n of nodes) {
    if (tagName(n) === name) return n;
    const inner = findFirst(childrenOf(n), name);
    if (inner) return inner;
  }
  return null;
}

function firstN(nodes, n) {
  return nodes.slice(0, n);
}

module.exports = { mathmlToDocxChildren, MathMatrix, MathMatrixRow, MathMatrixElement };
