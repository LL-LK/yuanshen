# 外部来源与开源致谢（SOURCES）

本站坚持「无构建、零外部运行时依赖、可离线」的原则。所有外部来源按**使用方式**分为四类，许可证状况逐条核实过（核实日期 2026-08-24）。

## 一、直接使用的开源代码（已本地化打包进 `assets/vendor/`）

| 项目 | 版本 | 许可证 | 用途 | 本地路径 |
|------|------|--------|------|----------|
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) Play CDN v4.3.1 | 4.3.1 | MIT | 原子化 CSS 运行时（内容页） | `assets/vendor/tailwind-browser-4.3.1.js` |
| Tailwind CSS Play CDN v3 | 3.x | MIT | 挑战页历史样式体系 | `assets/vendor/tailwind-v3.js` |
| [Lucide Icons](https://github.com/lucide-icons/lucide) | 1.8.0 | ISC | 全站图标 | `assets/vendor/lucide-1.8.0.min.js` |
| [KaTeX](https://github.com/KaTeX/KaTeX) | 0.16.11 | MIT | 数学实验室公式排版（含 20 个 woff2 字体） | `assets/vendor/katex/` |

> 以上均为 MIT/ISC 宽松许可，允许任意使用与修改；本地化是为了摆脱 CDN 硬依赖、保证离线可用。

## 二、借鉴设计理念（未复制代码，本站全部交互代码为原创 vanilla JS）

| 来源 | 许可证 | 借鉴的理念 | 落地在哪 |
|------|--------|-----------|----------|
| [Mathigon](https://mathigon.org) textbooks（课程源码 © Mathigon，仅借鉴创意） | 保留所有权利 | 「每行等式旁注操作法则」的逐步注释模式；先几何直觉后代数程序的面积模型顺序 | 实验一·公式炼金台；实验二·砌筑术 |
| [manim / 3Blue1Brown](https://github.com/3b1b/manim) | MIT（视觉语言） | TransformMatchingTex 的「变换而非替换」：不变项留原位、变化项高亮飞入；旧步骤淡化保留成推导史 | 公式炼金台的 `.chg` 高亮与 `.dim` 历史 |
| [PhET Interactive Simulations](https://phet.colorado.edu)（模拟本体 GPL-3.0，**未复制任何代码**，仅借鉴公开的设计原则） | GPL-3.0 / 框架 MIT | 多表征联动（单位圆↔波形图）；隐性脚手架（单画布+少滑块）；操作 <100ms 即时反馈 | 实验四·占星台；全部滑块装置 |
| [Seeing Theory](https://seeing-theory.brown.edu)（布朗大学） | Apache-2.0（作者请求勿商用） | 频率收敛双通道呈现（实验折线 vs 理论虚线） | 实验五·祈愿概率透视 |
| [setosa.io](http://setosa.io) 勾股可视化等 explorable 范例 | 各自开放 | 「把抽象概念面积化/几何化」的表达思路 | 实验二·砌筑术 |

## 三、调研评估过但未采用的优秀项目（记录备查）

| 项目 | Star | 许可证 | 未采用原因 |
|------|------|--------|-----------|
| [function-plot](https://github.com/mauriciopoppe/function-plot) | ~1.1k | MIT | 依赖 D3（~250KB），本站自绘 Canvas 更轻；其「区间算术防锯齿」「鼠标跟随导数」思路已在切线斩中手工实现简化版 |
| [JSXGraph](https://github.com/jsxgraph/jsxgraph) | ~1.4k | LGPL-3.0 或 MIT | 库体积 ~1MB，高中场景自绘 SVG/Canvas 已足够 |
| [Desmos API](https://www.desmos.com/api) | — | 专有服务 | 需申请 key 且强依赖外部服务，违背离线原则 |
| [MathBox](https://github.com/unconed/mathbox) | ~1.5k | MIT | WebGL 3D 对目标内容过重 |
| [Polypad](https://polypad.amplify.com)（Mathigon→Amplify） | — | 闭源免费产品 | 仅作教具创意参考（分数条/函数机等品类清单） |
| [Mafs](https://github.com/mafsorg/mafs) | ~3.4k | MIT | React 组件库，与无构建静态站冲突 |
| [awesome-interactive-math](https://github.com/ubavic/awesome-interactive-math) | ~306 | CC0 | 创意清单来源（本轮多个装置创意的索引入口） |

## 四、素材来源

| 素材 | 来源 | 说明 |
|------|------|------|
| 角色 icon/splash 立绘（风/岩/雷/水/草老角色） | [genshin.jmp.blue](https://genshin.jmp.blue) | 免费社区图源；请求失败时自动隐藏并降级为元素徽章占位 |
| 新角色本地占位卡（9 张 PNG） | 本站生成 | `assets/chars/*.png`：元素色渐变 + 元素单字 + 角色名 + 金色描边（300×400），因 jmp.blue 未收录 5.0+ 角色而本地化 |
| favicon | 本站绘制 | `assets/favicon.svg`：原神神之眼风格六边形徽记 |

## 五、许可证合规结论

- **可以照搬代码**（已照搬）：KaTeX、Tailwind、Lucide（均 MIT/ISC）。
- **只可借鉴创意**（已借鉴且注明）：Mathigon textbooks、Polypad、PhET 模拟（GPL 传染性，坚决不搬代码）、Desmos。
- **本站原创部分**：六个数学实验装置的全部 JS/Canvas/SVG 代码、公式炼金台的分步数据格式、角色占位卡生成样式。

如发现本页遗漏或标注有误，欢迎提 Issue 指正。
