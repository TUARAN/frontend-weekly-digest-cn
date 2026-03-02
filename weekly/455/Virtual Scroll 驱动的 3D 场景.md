原文：Virtual Scroll-Driven 3D Scenes  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## Virtual Scroll 驱动的 3D 场景

[Canvas](https://frontendmasters.com/blog/tag/canvas/) [JavaScript](https://frontendmasters.com/blog/tag/javascript/) [Scrolling](https://frontendmasters.com/blog/tag/scrolling/)    

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/z2y6meBT_400x400.jpg?fit=96%2C96&#038;ssl=1)

Gunnar Bachelor  
发表于 2026 年 2 月 23 日

尽管线上 3D 体验的关注度不断上升，但在传统基于 DOM 的动画标准与新兴的 3D canvas 方案之间，仍然存在真实的摩擦。传统的滚动事件会把动画直接绑定到 DOM 的滚动位置上。这会在处理 3D 场景时限制创作控制力。虚拟滚动通过直接用滚动输入数据来控制动画，打破了这种依赖关系。

在本文中，我将探讨传统基于 DOM 的滚动方案的局限性，演示虚拟滚动如何实现更可控的滚动驱动交互，并展示如何以负责任的方式实现它。

下面是最终示例：

（原文此处为 CodePen 演示，若无法显示请访问原文查看。）

## **传统方案的问题**

[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) 提供了一种优雅的方式来检测元素何时进入视口。当页面中分散着许多 DOM 元素时，它的效果非常好。你可以观察每个元素，并在它们进入视口时触发动画。

但在 3D 场景的语境下，这套方法就行不通了。你的 canvas 通常会作为单个元素填满整个视口。Intersection Observer 没有什么可追踪的对象：整个场景都在 canvas 内部。一个常见的权宜之计是额外添加一些 DOM 元素，仅用于触发 canvas 动画。然而，引入 DOM 元素只是为了向 canvas 内部的状态变化“发信号”，会把两套运行在不同抽象层级的渲染系统耦合在一起。随着场景复杂度上升，这种间接层会越来越难以推理、调试和维护。

Intersection Observer 也不擅长处理连续动画。它只会在特定阈值点触发回调，而不是提供逐帧的位置数据。要构建顺滑的 3D 过渡，你需要在每一次渲染 tick 上都拿到可插值的数值。基于回调的方式并不能提供实现流畅运动所需的连续数据流。

[GSAP 的 ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) 是一个更好的解决方案。它能对滚动关联的时间线提供精确控制，包括 scrubbing、pinning，以及编排好的序列。然而，它仍然和 CSS 的[滚动驱动动画](https://frontendmasters.com/blog/what-you-need-to-know-about-modern-css-spring-2024-edition/#scroll-driven-animations)一样，默认把原生页面滚动当作底层驱动。当一个场景完全存在于 canvas 内部时，这就意味着你得“伪造”滚动高度，并把 3D 运动适配到一个围绕文档布局设计的系统中。在这种情况下，滚动架构不是在支持场景结构，反而会与之对抗。

虚拟滚动通过捕获滚动输入，并利用这些数据直接构建自定义的滚动交互，从而解决了这些问题。页面并不会以传统意义上的方式滚动。滚轮或触摸事件会更新一个目标值，而你的动画循环会朝这个目标值进行插值，并在此过程中触发你想要的任何场景交互。

这种方式解锁了很多传统方法很难、甚至无法实现的创意可能性。你可以用滚动数据驱动任何属性：用户滚动时改变材质形态；在特定位置触发粒子效果；协调多个相机或对象层级；让前景与背景元素使用不同的阻尼值来实现视差效果。滚动值会变成一条完全由你掌控的时间线：物理规则、时序以及整体 3D 体验，都由你决定。

难点在于要“负责任地”实现它。当你阻止默认滚动行为时，你就需要承担起提供用户对滚动所期待的一切能力的责任，包括进度指示、键盘导航、屏幕阅读器的上下文，以及对动效偏好（motion preferences）的尊重。好消息是，这些要求都有明确的定义，实现起来也相对直接。

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/Screenshot-2026-02-23-at-11.11.32-AM.png?resize=1024%2C578&#038;ssl=1)

#### 延伸阅读

想更深入了解 3D 滚动技巧，可以查看 Vercel 的 Matias Gonzalez 的课程：[**Award-Winning Marketing Websites**](https://frontendmasters.com/courses/winning-websites/?utm_source=boost&utm_medium=blog&utm_campaign=boost)，其中提供了更为详尽的指南。

## **虚拟滚动基础**

下面的示例展示了虚拟滚动的工作方式。虚拟滚动的核心思想，是将用户输入与浏览器的原生滚动位置分离开来。

第一步是拦截滚轮输入，并阻止默认滚动行为：

```javascript
let scrollTarget = 0;
let scrollCurrent = 0;
const maxScroll = 88;

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  scrollTarget += e.deltaY * 0.01;
  scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));
}, { passive: false });Code language: JavaScript (javascript)
```

在这里，`scrollTarget` 表示由用户输入推导出的“期望滚动位置”。必须设置 `{ passive: false }`，这样 `preventDefault()` 才能取消原生滚动。

0.01 这个乘数用于把滚轮的 delta 值缩放为场景单位。一次典型的鼠标滚轮滚动通常会产生大约 100 像素的 deltaY。乘以 0.01 会把它转换为每次滚动 1 个场景单位。这样就把像素级的测量值转换成更符合 3D 场景尺度的数值。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#use-clamping-to-prevent-overscroll)**使用钳制（Clamping）防止过度滚动（Overscroll）**

如果没有边界，滚动目标值会无限增长。对数值进行钳制可以确保滚动始终保持在一个定义好的范围内。

```
`scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));`Code language: JavaScript (javascript)
```

这一行强制设定了一个硬性的下限和上限。`Math.min(maxScroll, scrollTarget)` 会把值限制（封顶）在允许的最大滚动位置。然后 `Math.max(0, …)` 再确保它永远不会低于 0。把这两个操作嵌套在一起后，滚动目标值就被限制在一个固定、可预测的区间内。

最大滚动值应该从你的场景内容长度推导出来。这个场景由一条由多个圆环（torus）组成的隧道构成，圆环之间以固定间隔排列。

```js
const objects = &#91;];
const totalSections = 12;
const sectionHeight = 8;

for (let section = 0; section < totalSections; section++) {
  const y = -section * sectionHeight;
  const torusGeo = new THREE.TorusGeometry(6, 0.3, 16, 32);
  const torusMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL((section / totalSections), 0.8, 0.5),
    metalness: 0.7,
    roughness: 0.2
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.y = y;
  torus.rotation.x = Math.PI / 2;
  scene.add(torus);
  objects.push({ mesh: torus, baseY: y, section: section });
}

const maxScroll = (totalSections - 1) * sectionHeight; // 88Code language: JavaScript (javascript)
```

在 12 个区段（section）之间以 8 个单位的间距排列的情况下，滚动范围只由区段之间的距离决定。第一个区段从位置 0 开始。之后的每个区段都会偏移 8 个单位。因为第一个区段不需要偏移，所以在 12 个区段之间一共有 11 个间隔。

因此最大滚动距离是 11 × 8 = 88。区段索引也反映了这种布局：section 0 位于 0，section 1 位于 8，而最后一个区段 section 11 位于 88。把滚动目标值钳制到 88，可以确保相机能够到达最后一个区段，但不会继续移动到后面那片空白空间里。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#connecting-scroll-to-the-scene)**把滚动与场景关联起来**

一旦捕获到滚动输入，就可以把数据映射到场景变换上。滚动值可以通过相机移动、物体旋转或其他可用属性来驱动场景变化。

在这个示例中，滚动值用于更新相机的位置。

```js
function animate() {
  requestAnimationFrame(animate);
  scrollCurrent += (scrollTarget - scrollCurrent) * damping;
  camera.position.y = -scrollCurrent;
  renderer.render(scene, camera);
}
animate();Code language: JavaScript (javascript)
```

相机的 Y 坐标等于滚动值的相反数。向前滚动会增加 `scrollCurrent`，从而让相机沿着负 Y 轴向下移动。这符合一种常见约定：处在负 Y 值位置的物体会显示在原点下方。

```js
objects.forEach((obj) => {
  // Scale based on distance from camera
  const distanceFromCamera = Math.abs(obj.mesh.position.y - camera.position.y);
  const scale = Math.max(0.5, 1 - (distanceFromCamera / 15));
  obj.mesh.scale.setScalar(scale);
});Code language: JavaScript (javascript)
```

每个圆环也会根据它到相机的距离进行缩放。位于相机位置的物体保持原始大小。距离相机 15 个单位的物体会缩小到一半，从而制造出景深（深度感）的错觉。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#use-damping-to-create-natural-motion)**使用阻尼（Damping）创建更自然的运动**

这个示例中下一个相关要点是阻尼（damping）。阻尼用于平滑当前值与目标值之间的过渡。这里，当前值表示用于放置相机的、已渲染的滚动位置；目标值表示从用户输入中得到的期望滚动位置。

在每一帧中，当前值都会朝目标值移动“剩余距离”的固定比例。这会产生指数缓动：运动开始时更快，随着当前值逐渐接近目标值而减速。

```
`scrollCurrent += (scrollTarget - scrollCurrent) * damping;`Code language: JavaScript (javascript)
```

较低的阻尼值会让当前值更慢地接近目标值，从而产生更沉重、更滞后的运动。较高的阻尼值会更激进地缩小差距，让响应感觉更紧致、更跟手。

## [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#accessibility-features)**无障碍（Accessibility）特性**

当开发者覆盖原生滚动行为却没有补上用户所期待的功能时，虚拟滚动就会被冠以带贬义的标签：“scroll-jacking”（滚动劫持）。你无法判断某个东西是可以滚动的。你看不到自己的滚动进度。键盘导航会失效。屏幕阅读器得不到任何上下文信息。对于任何没有完全按照开发者设想方式交互的人来说，这种体验都会显得“坏掉了”。

但其实不必如此。无障碍需求可以通过大多数开发者已经熟悉的标准 DOM API 和事件处理器来实现。而这点并不算高的实现成本，换来的却是你对滚动行为的完全创作控制权。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#respect-motion-preferences)**尊重动效偏好（Motion Preferences）**

一些用户因为前庭障碍或对运动敏感，在操作系统中启用了“减少动态效果”的偏好设置。当检测到 prefers-reduced-motion 时，你应该把 damping 设置为 1，以实现瞬时过渡：

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const effectiveDamping = prefersReducedMotion ? 1 : 0.08;

scrollCurrent += (scrollTarget - scrollCurrent) * effectiveDamping;
```

这会尊重用户的偏好，而不需要他们为了避免动画而彻底退出你的交互体验。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#show-progress)**显示进度**

虚拟滚动里最常见的错误，是把进度反馈也一并去掉，却没有提供替代方案。原生滚动会提供滚动条，而你的虚拟滚动实现也需要提供一个等价的反馈机制。

一个简单的进度指示器可以用很少的标记来实现：

```xml
<div class="scroll-progress">
  <div class="scroll-progress-fill"></div>
</div>
```

把它样式化，让它显示在视口侧边：

```css
.scroll-progress {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 200px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.scroll-progress-fill {
  width: 100%;
  height: 0%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  transition: height 0.1s ease;
}
```

在你的动画循环里更新填充高度：

```javascript
const progress = (scrollCurrent / maxScroll) * 100;
document.querySelector('.scroll-progress-fill').style.height = `${progress}%`;
```

这能让用户获得与原生滚动条相同的空间感知能力：他们可以一眼看出还剩多少内容。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#keyboard-navigation)**键盘导航**

使用键盘导航的用户会期待方向键能在内容中移动。当你阻止默认滚动行为时，除非你显式处理键盘输入，否则就会打破这种预期：

```javascript
window.addEventListener('keydown', (e) => {
  const scrollSpeed = sectionHeight;
  const fastScrollSpeed = sectionHeight * 3;
 
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    scrollTarget = Math.min(maxScroll, scrollTarget + scrollSpeed);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    scrollTarget = Math.max(0, scrollTarget - scrollSpeed);
  } else if (e.key === 'PageDown') {
    e.preventDefault();
    scrollTarget = Math.min(maxScroll, scrollTarget + fastScrollSpeed);
  } else if (e.key === 'PageUp') {
    e.preventDefault();
    scrollTarget = Math.max(0, scrollTarget - fastScrollSpeed);
  } else if (e.key === 'Home') {
    e.preventDefault();
    scrollTarget = 0;
  } else if (e.key === 'End') {
    e.preventDefault();
    scrollTarget = maxScroll;
  }
});
```

这个处理器会响应标准的导航按键：方向键每次移动一个区段；Page Up 和 Page Down 移动得更快；Home 和 End 则跳到开头或结尾。

该实现使用了同一个 `scrollTarget` 变量——滚轮事件也是修改它。这意味着键盘导航会获得与鼠标滚动相同的阻尼运动效果，使得不同输入方式下的体验保持一致。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#screen-reader-context)**屏幕阅读器上下文**

依赖屏幕阅读器的用户需要理解他们正在与什么交互。一个没有上下文信息的 canvas 元素，通常只会被读作“图像”，不会说明它是可交互的，也不会说明交互会产生什么效果。

添加 ARIA 标签可以提供这些上下文：

```javascript
renderer.domElement.setAttribute('role', 'img');
renderer.domElement.setAttribute('aria-label',
  'Interactive 3D tunnel visualization. Use arrow keys to navigate through 12 sections.');
```

这会告诉屏幕阅读器用户他们看到的是什么，以及如何与之交互。

你还可以用一个 live region 在用户导航时播报位置变化：

```xml
<div id="scroll-status" class="sr-only" aria-live="polite" aria-atomic="true">
  Viewing section 1 of 12
</div>
```

在这个例子中，`sr-only` 类会在视觉上隐藏该元素，但仍让屏幕阅读器能够读取它。当区段发生变化时更新这个元素：

```javascript
let lastAnnouncedSection = 1;

function updateScreenReaderStatus() {
  const currentSection = Math.round(scrollCurrent / sectionHeight) + 1;
  if (currentSection !== lastAnnouncedSection) {
    document.getElementById('scroll-status').textContent =
      `Viewing section ${currentSection} of ${totalSections}`;
    lastAnnouncedSection = currentSection;
  }
}
```

在你的动画循环里调用这个函数。这样当用户在场景中导航时，屏幕阅读器就会播报这些位置更新。

### [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#mobile-touch-support)**移动端触控支持**

虚拟滚动可以扩展到触控设备：把触摸移动转换为对滚动目标值的更新。实现方式是跟踪初始触摸位置，并在每次 `touchmove` 事件中计算移动增量（delta）：

```javascript
let lastTouchY = 0;

window.addEventListener('touchstart', (e) => {
  lastTouchY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touchY = e.touches[0].clientY;
  const deltaY = lastTouchY - touchY;
  scrollTarget += deltaY * 0.05;
  scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));
  lastTouchY = touchY;
}, { passive: false });
```

这里的 `deltaY` 表示用户手指的垂直移动距离。把它乘以一个较小的系数可以让滚动增量更平滑，并避免跳动过于剧烈。同样的机制也能扩展到更高级的交互：你可以调整灵敏度、反转滚动方向，甚至为“快速滑动（flick）”手势加入惯性效果。
```

## [](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#conclusion)**结论**

在打好基础之后，可实现的交互范围会变得非常广阔。想象一个产品展示：每滚动一小段，就通过材质过渡揭示一个不同的功能特性。或者一个建筑漫游：滚动位置同时控制相机路径、光照条件以及材质细节等级。又或者一个数据可视化：滚动会更新图表的几何形状。

滚动值让你能以传统滚动事件很难甚至无法做到的方式，精确控制时序与编排。你不再局限于在离散的关键点触发动画；你可以对场景中的每个属性进行连续的、逐帧的控制。物理效果、缓动曲线，以及元素之间的协同关系，都变得可编程。

这种控制能力对叙事驱动的体验尤为重要。随着用户在内容中推进，你可以精心编排视觉元素如何出现、如何变形、如何相互作用。滚动成为一条时间线，每一帧都由你掌控，从而在基于 Web 的 3D 体验中实现电影级的精度。

虚拟滚动是一种有效方案，用来弥合基于 DOM 的 Web 标准与基于 canvas 的 3D 体验之间的鸿沟。在加入恰当的无障碍功能后，它能在不牺牲可用性的前提下提供创作控制力。

这种技术比传统的滚动处理需要更多的前期搭建工作。但这份前期投入会在创作灵活性上带来回报：你将获得对“滚动数据如何驱动场景”的完全控制，同时仍能满足让 Web 对所有人可访问的可用性预期。

这里是该示例的 [代码](https://codepen.io/Gunnar-Bachelor/pen/MYeRJPm)，方便你直接上手实验。祝你动画创作愉快！

### 学习如何使用 Canvas 和 WebGL

![](https://frontendmasters.com/blog/wp-content/themes/fem-v3/images/course-shoutouts/webgl.png)

对创意编程感兴趣吗？我们有一门由 Vercel 的设计工程师 Matias Gonzales 主讲的[精彩课程：打造屡获大奖的网站](https://frontendmasters.com/courses/winning-websites/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=virtual-scroll-driven-3d-scenes)。你将学习如何用 GSAP 控制 canvas、构建时间线、实现滚动与鼠标触发效果，并且以无障碍的方式完成这些效果。订阅 Frontend Masters 可访问 300+ 门课程，并且[今天立享 20% 折扣！](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=virtual-scroll-driven-3d-scenes)

- 个性化学习
- 行业顶尖专家
- 24 条学习路径
- 直播互动式工作坊

20% 折扣  
[立即开始学习 →](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=virtual-scroll-driven-3d-scenes)

### 发表评论 [取消回复](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#respond)

你的邮箱地址不会被公开。必填项已用 * 标注。

评论 *  

姓名 *  

邮箱 *  

网站  

在此浏览器中保存我的姓名、邮箱和网站信息，以便下次评论时使用。

### 目录

- [传统方案的问题](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#the-problem-with-traditional-approaches)
- [虚拟滚动基础](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#virtual-scrolling-fundamentals)[使用钳制（Clamping）防止过度滚动（Overscroll）](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#use-clamping-to-prevent-overscroll)
- [将滚动与场景连接起来](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#connecting-scroll-to-the-scene)
- [使用阻尼（Damping）营造自然运动](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#use-damping-to-create-natural-motion)
- [无障碍功能](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#accessibility-features)[尊重动效偏好](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#respect-motion-preferences)
- [显示进度](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#show-progress)
- [键盘导航](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#keyboard-navigation)
- [为屏幕阅读器提供上下文](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#screen-reader-context)
- [移动端触控支持](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#mobile-touch-support)
- [结论](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/#conclusion)

### 你知道吗？

我们的课程不仅涵盖前端，还延伸到全栈、DevOps 和 AI。

→ [浏览课程（20% 折扣）](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-deep-card-conundrum)