# 无需媒体查询的响应式六边形网格

> 原文：[Responsive Hexagon Grid without Media Queries](https://css-tip.com/hexagon-grid/)
>
> 翻译：[嘿嘿](https://blog.heyfe.org/blog)

这次我们尝试使用现代 CSS 语法来改进[旧版的响应式六边形网格实现](https://css-tip.com/responsive-hexagon-grid/)。通过 `corner-shape` 来轻松创建[六边形形状](https://css-tip.com/hexagon/)，并结合 `sibling-index()` 与数学函数，有条件地为每隔一行的第一个元素设置外边距。

![纯 CSS 实现的响应式六边形网格](./assets/qEM7Du86D9-1180.png)

```css
.container {
  --s: 120px;  /* 尺寸 */
  --g: 10px;   /* 间距 */
  display: flex;
  gap: var(--g);
  flex-wrap: wrap;
  container-type: inline-size; /* 为了能够查询容器宽度 (100cqw) */
}
.container > * {
  width: var(--s);
  /* 创建六边形形状 */
  aspect-ratio: cos(30deg);
  border-radius: 50% / 25%;
  corner-shape: bevel;
  /**/
  margin-bottom: calc(var(--s)/(-4*cos(30deg))); /* 在行与行之间创建重叠 */
  /* 通过计算为每隔一行的首个元素添加左外边距 */
  --_n: round(down,(100cqw + var(--g))/(var(--s) + var(--g)));
  --_m: round(down,(100cqw - (var(--s) - var(--g))/2)/(var(--s) + var(--g)));
  --_c: round(down,1 - mod((sibling-index() - 1 + var(--_m))/(var(--_n) + var(--_m)),1));
  margin-left: calc(var(--_c)*(var(--s) + var(--g))/2);
}
```

目前该方案仅支持 Chrome 浏览器。如果需要更好的兼容性，请参考[我之前的实现方案](https://css-tip.com/responsive-hexagon-grid/)。

这里还有另一种六边形版本：

我们可以扩展这段代码，来适配[更多的形状，例如菱形和八边形](https://css-tip.com/corner-shape/)。

```css
.container {
  --s: 100px;  /* 尺寸 */
  --g: 10px;   /* 间距 */
  display: flex;
  gap: var(--g);
  flex-wrap: wrap;
  container-type: inline-size;
}
.container > * {
  width: var(--s);
  corner-shape: bevel;
  --_n: round(down,(100cqw + var(--g))/(var(--s) + var(--g)));
  --_m: round(down,(100cqw - (var(--s) - var(--g))/2)/(var(--s) + var(--g)));
  --_c: round(down,1 - mod((sibling-index() - 1 + var(--_m))/(var(--_n) + var(--_m)),1));
  margin-left: calc(var(--_c)*(var(--s) + var(--g))/2);
}
.rhombus > *  {
  aspect-ratio: 1;
  border-radius: 50%;
  margin-bottom: calc(var(--s)/-2);
}
.octagon {
  --g: calc(10px + var(--s)/(sqrt(2) + 1));
  gap: 10px var(--g);
}
.octagon > * {
  aspect-ratio: 1;
  border-radius: calc(100%/(2 + sqrt(2)));
  margin-bottom: calc(var(--s)/(-1*(2 + sqrt(2))));
}
```
