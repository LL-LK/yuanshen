# 提瓦特数学图鉴

一个无需构建步骤的静态高中数学知识站点，包含五个知识章节、首页导航、30 天闯关练习和数学实验室。

## 数学实验室（lab.html）

六个纯 vanilla JS + Canvas/SVG 实现的互动装置（设计思路参考 Mathigon 的逐步注释模式、manim 的最小变化原则与 PhET 的多表征联动，全部代码为原创，无外部依赖）：

1. **公式炼金台** —— 公式变形分步可视化：每一步只高亮变化的项并旁注所用法则，支持回退、自动演示，内置配方法/完全平方/平方差/等差求和四张配方
2. **尘歌壶砌筑术** —— 配方法的面积模型：把 x²+bx 砌成缺角正方形，直观看见「补 (b/2)²」的由来
3. **风之翼滑翔轨迹** —— y=ax²+bx+c 三滑块实时联动图像，判别式 Δ 染色、顶点/对称轴/零点同步标注
4. **占星台** —— 单位圆可拖动星点扫出正弦/余弦波（旋转投影的多表征）
5. **祈愿概率透视** —— 大数定律模拟器：硬币/骰子/祈愿出金三种事件，频率折线收敛到理论概率虚线
6. **元素战技·切线斩** —— 割线 Q→P 极限逼近切线，实时对比平均变化率与 f′(x)，可叠加导函数轨迹

## 本地运行

在项目根目录启动任意静态 HTTP 服务（直接双击 HTML 也能查看，但 HTTP 服务更接近部署环境）：

```powershell
python -m http.server 8780
```

然后打开 <http://127.0.0.1:8780/index.html>。

## 验证

静态检查不依赖浏览器：

```powershell
node tests/static_checks.mjs
```

完整回归需要 Python Playwright。首次使用时安装依赖和 Chromium：

```powershell
python -m pip install playwright
python -m playwright install chromium
python tests/site_regression.py
```

回归覆盖所有页面、离线资源、390/900/1024/1440px 响应式断点、无 JavaScript 降级、减少动态效果、Geometry 目录、首页键盘可访问性，以及挑战页存档/错题/成就/升级状态。

## 资源说明

Tailwind、Lucide 和角色占位图已放在 `assets/` 下，页面核心布局不依赖 Google Fonts；部分角色装饰立绘仍会尝试访问 `genshin.jmp.blue`，请求失败时会自动隐藏，不影响正文和练习功能。
