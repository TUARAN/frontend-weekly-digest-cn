原文：From Flat to Spatial: Creating a 3D Product Grid with React Three Fiber
翻译：TUARAN
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## 从平面到空间：用 React Three Fiber 构建 3D 产品网格

一篇实用的实战讲解：使用 React Three Fiber 和 GLSL 构建一个弯曲的 3D 商品网格，涵盖着色器、动画与性能。

作者：[Matt Greenberg](https://tympanus.net/codrops/author/mattgreenberg/)  
分类：[Tutorials](https://tympanus.net/codrops/category/tutorials/)  
日期：2026 年 2 月 24 日

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2026/02/SneakerGrid.webp?x72865)

[Demo](https://shoe-finder-wine.vercel.app/)

[Code](https://github.com/MatthewGreenberg/shoe-finder)

免费课程推荐：[通过 34 节免费视频课、循序渐进的项目以及可上手的演示，用 GSAP 精通 JavaScript 动画。立即报名 →](https://www.creativecodingclub.com/courses/FreeGSAP3Express?ref=0d0431)

商品网格就像电商里的“白盒画廊”——默认中性，设计上尽量不冒犯任何人。奇怪的是，真正能推动产品销售的线下体验一直都知道：环境本身就是销售的一部分。光线会替你做决定。陈列传达价值。空间本身也有立场。

而网页版通常会把这些全部放弃。

我想看看要怎样才能缩小这道差距——不是为了新奇噱头，而是一次真正的尝试：让浏览商品的感觉更像“身处某个地方”。这篇文章会带你走完我构建它的过程：用 React Three Fiber 做一个弯曲的 3D 商品网格，配上地形图式的 GLSL 背景、全息风格的选中态，以及带弹簧阻尼的相机控制架构。过程中也会提到一些值得借鉴的模式——包括着色器架构、动画如何做到可打断，以及如何划分 React state 和可变 refs 的边界。

## 技术栈（The Stack）

这个项目使用的技术栈是 **Next.js**、**React Three Fiber**、**Tailwind** 和 **Motion**。两个自定义着色器用 GLSL 编写，并通过 glslify 的 webpack 流水线作为 ES 模块导入。

这里值得单独强调一下 glslify 的配置，因为它是让着色器开发变得“现代化”的关键基础设施。在 `next.config.mjs` 里用两个 loader 串起来，就可以在 GLSL 内部写 `#pragma glslify: snoise = require(&#039;glsl-noise/simplex/2d&#039;)`，并把编译后的结果作为字符串导入。

## 架构（Architecture）

整个系统分为四层；搞清楚每一层的起止边界，是保持项目整洁的关键：

┌─────────────────────────────────────────────────┐
│  DOM Layer (Framer Motion)                      │
│  Control bar, filters, minimap, overlays        │
├─────────────────────────────────────────────────┤
│  Scene Layer (React Three Fiber)                │
│  Canvas, camera rig, lighting                   │
├─────────────────────────────────────────────────┤
│  Tile Layer (per-card useFrame loops)           │
│  Position, scale, opacity, shader uniforms      │
├─────────────────────────────────────────────────┤
│  Shader Layer (raw GLSL)                        │
│  Topography background, holographic card sheen  │
└─────────────────────────────────────────────────┘

**数据流（Data flow）。** 鞋子数据是一个 JSON 数组。每个集合（Nike、New Balance、Budget）都会映射到一个独立数组。筛选（filters）是在某个集合内部缩小范围；切换集合（collection switches）则是直接替换整个数组。

**交互循环（Interaction loop）。** 画布上的指针事件会更新一个可变的 `rigState` 对象。相机控制架构（camera rig）每帧读取它，并以阻尼方式向目标值收敛。每个 tile 也读取同一个 `rigState` 来判断自己是否被选中，然后调整自己的位置、缩放以及着色器的 uniforms。

**影响一切的决策**，是哪些东西放进 React state、哪些东西用可变 refs 来保存。我是吃过亏才学到的：任何以 60fps 变化的东西——相机位置、tile 的动画进度、着色器 uniforms——都不能放在 React state 里。调和（reconciliation）的开销会把你拖垮。这些值应该放在普通的可变对象里，让 `useFrame` 回调直接读取。React state 只留给离散的用户行为：当前激活的是哪个集合、设置了哪些筛选条件、选中了哪个 tile。

## 网格系统（The Grid）

第一个问题是布局。我需要把一份平铺的鞋子列表，排列成 3D 空间中居中的网格，并且要足够灵活，以支持筛选（会改变项目数量）和集合切换（会把一切都换掉）。

### Configuration

所有网格参数都放在一个可变的单例里——不是 React state，也不是 context，只是一个普通对象：

```js
const CONFIG = {
  gridCols: 8,
  itemSize: 2.5,
  gap: 0.4,
  zoomIn: 12,
  zoomOut: 31,
  curvatureStrength: 0.06,
  dampFactor: 0.2,
  tiltFactor: 0.08,
  cullDistance: 14,
};
```

开发期间，我把每一个值都接进了 [Leva](https://github.com/pmndrs/leva) 的调试控制面板。拖动一个“curvature（曲率）”滑块，看着网格的“碗”形实时加深，对于调出理想手感非常有价值——这是用写死的常量加上不断刷新页面的方式根本做不到的。

### Positioning

Tile 的位置通过简单的“按列优先（column-major）”数学计算得到，并以原点为中心：

```js
const spacing = CONFIG.itemSize + CONFIG.gap;
const col = filteredIdx % CONFIG.gridCols;
const row = Math.floor(filteredIdx / CONFIG.gridCols);
const x = col * spacing - gridWidth / 2 + spacing / 2;
const y = -(row * spacing) + gridHeight / 2 - spacing / 2;
```

X 轴从左到右。Y 轴从上到下。Z 轴则完全留给深度效果——曲率、聚焦以及过渡动画。让 Z 保持“空闲”，事实证明是我早期做过的更好决策之一：这意味着我可以把多个深度效果用叠加的方式组合起来，而不会互相打架。

## 卡片系统（The Cards）

每只鞋都是一个 `ShoeTile` —— 一个 `<group>`，里面包含用于命中测试的平面、带有我们自定义 Shader 材质的图片网格、文字标签以及关闭按钮。

### 纹理（Textures）

我会在模块级别预加载所有纹理，确保在任何组件挂载之前就完成。这一点没有商量余地——否则在切换集合时，会出现明显的“跳出/突现”（pop-in）：纹理会一张张上传到 GPU，导致画面逐个补齐。

```js
shoes.forEach((shoe) => {
  useTexture.preload(shoe.image_url);
});
```

每个 tile 都会基于已加载的纹理计算符合宽高比的尺寸，因此图片永远不会被拉伸变形。

### 动画循环（The Animation Loop）

这是整个项目的核心。每个 tile 都运行自己的 `useFrame` 回调——一个每帧都会执行的函数，用来管理一组动画值，这些值组合起来构成最终的渲染状态。

我一开始试过 GSAP，后来放弃了。问题在于“可中断性”。如果用户在筛选过渡进行到一半时点击某只鞋，那么所有动画都需要平滑地改道。基于时间线（timeline）的系统会和这种需求对着干——你会花更多时间处理取消与清理，而不是写动画逻辑。CSS 动画从来就不是选项；它们无法深入到 WebGL 的 uniform。

最终我选择了非常棒的 [maath](https://github.com/pmndrs/maath) 里的 `easing.damp()`——一个与帧率无关的指数阻尼函数。你设置一个目标值，当前值就会追过去；你在动画中途改目标，它就会立刻改道继续追。无需清理，无需取消。

```js
const focusZ = useRef(0);
const curveZ = useRef(0);
const transitionZ = useRef(0);
const animatedPos = useRef({ x, y });
const filterOpacity = useRef(1);
const filterScale = useRef(1);
```

最终位置由这些相互独立的通道叠加而成：

```js
ref.current.position.set(
  x,
  y + transitionY.current,
  curveZ.current + focusZ.current + transitionZ.current
);
```

三个 Z 向的贡献是加法叠加的：曲率把远处的 tile 推得更远，聚焦效果把选中的卡片向前“弹出”，过渡偏移负责处理进入/退出。它们各自以不同速度阻尼收敛。由于只是简单相加，因此永远不会相互冲突。

## 自定义 Shaders（Custom Shaders）

我使用 drei 的 `shaderMaterial()` 辅助方法写了两个自定义 GLSL 材质。它会给你一个声明式的 JSX 接口（`<holoCardMaterial />`），背后则由原生 GLSL 驱动。

我选择“按材质写 Shader”，而不是做后期处理（post-processing），原因很明确：我的效果是交互驱动、并且是按卡片（per-card）生效的。全息光泽只会出现在被选中的卡片上；如果用后期 bloom pass，就得处理屏幕上的每个像素，只为了影响一张卡。把效果放在材质里意味着对另外 59 张卡完全没有额外开销。

### 地形背景（Topography Background）

背景是一个带动画的等高线场——一张“活的”地形图，为场景提供技术感、类似 CAD 的空间深度，但又不会与鞋子的图像争抢注意力。

#### 等高线如何工作（How the Isolines Work）

片元着色器会采样 2D simplex noise（通过 glslify 引入），并让它随时间缓慢漂移：

```glsl
#pragma glslify: snoise = require('glsl-noise/simplex/2d')
float n = snoise(noiseUv * uScale + uTime * 0.05);
```

等高线来自一种经典的 isoline 提取技巧：把噪声乘以一个频率，取小数部分来生成重复的条带，然后用一对 `smoothstep` 在条带边界处雕刻出细线：

```glsl
float lines = fract(n * 5.0);
float pattern = smoothstep(0.5 - uLineThickness, 0.5, lines)
              - smoothstep(0.5, 0.5 + uLineThickness, lines);
```

这两个 `smoothstep` 会在 0.5 处制造一个很窄的峰值——也就是每个条带“回卷”（wrap around）的边界位置。`uLineThickness`（默认 0.03）控制线宽；`5.0` 的倍数控制每个噪声 octave 中出现多少圈同心环。我花了不少时间调这些参数——太粗会像加载中的转圈 spinner，太细则在低 DPI 屏幕上几乎看不见。

#### 遮罩与颗粒（Masking and Grain）

一个圆形 mask 让边缘柔和渐隐，胶片颗粒（film grain）则用来防止色带（banding）：

```glsl
float grain = (fract(sin(dot(vUv * 2.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.15;
vec3 finalColor = uColor + grain;
gl_FragColor = vec4(finalColor, pattern * opacity * mask * uOpacity);
```

整体放在 Z = -15 的平面上，并设置 `depthWrite={false}` 和 `renderOrder={-1}`，确保它永远不会遮挡卡片。当用户缩放进入某只鞋时，`uOpacity` 会淡出到 0.25——背景后退但不会消失。

### 全息卡片材质（Holographic Card Material）

当卡片被选中时，这个材质会添加一道扫过的全息光泽（holographic sheen）。这是我写得最开心的 Shader，因为整个效果完全由一个 uniform 驱动：`uActive`。

#### 顶点“呼吸”（Vertex Breathing）

顶点着色器会对选中的卡片施加轻微的正弦缩放振荡：

```glsl
float breath = sin(uTime * 2.0) * 0.015 * uActive;
float scale = 1.0 + breath;
gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * scale, 1.0);
```

当 `uActive` 为 0 时，呼吸量会被乘到 0——未选中的卡片不会做任何额外工作。

#### 光泽扫过（The Sheen Sweep）

片元着色器里的光泽效果算是个“意外之喜”。我最初想要的是静态的全息渐变，但把光泽位置直接映射到 `uActive` 后，就免费得到了这种扫过动画——当 uniform 从 0 动到 1 时，这条光带会自然地滑过整张卡片：

```glsl
float diagonal = (vUv.x * 0.8) + vUv.y;
float sheenPos = uActive * 2.5;
float sheenWidth = 0.5;
float dist = abs(diagonal - sheenPos);
float intensity = 1.0 - smoothstep(0.0, sheenWidth, dist);
intensity = pow(intensity, 3.0);
```

X 轴上的 `0.8` 倍数是“倾斜”（tilt）因子。在标准的 $x + y$ 设定里，渐变会以完美的 45° 角移动。通过让 X 轴的权重略小于 Y 轴，我们把扫光线旋转得更接近竖直方向，这更符合“卡片拿在光源下”的直觉。

`pow(intensity, 3.0)` 则是我们的“聚焦”（focus）控制。没有它时，光泽会变成一大片宽而浑的泛光。把强度提升到一个幂次，会把较低的值压向 0，只保留峰值，从而让衰减更锐利：从柔和的光晕变成更集中的高光（specular）条纹。

末尾的淡出可以防止光泽停住不走：

```glsl
float sheenFade = 1.0 - smoothstep(0.7, 1.0, uActive);
vec3 sheenColor = vec3(0.85, 0.92, 1.0) * intensity * 0.9 * sheenFade;
vec3 finalColor = baseColor + sheenColor * texColor.a;
```

这种偏冷的蓝白色高光采用“叠加”的方式，并通过纹理的 alpha 进行遮罩，以确保效果始终限制在鞋子的轮廓之内。

#### 非对称时序（Asymmetric Timing）

有一个小细节却带来了很大的差异：我在做选中与取消选中时，用不同的阻尼速度来动画 `uActive`：

```js
const activeDamp = isActive ? 0.6 : 0.15;
easing.damp(imageRef.current.material, "uActive", isActive ? 1 : 0, activeDamp, delta);
```

慢慢进入（0.6s），快速退出（0.15s）。你可以细细品味“显现”的过程，但永远不需要等待“收起”。这种不对称非常微妙，用户不会有意识地察觉到它；但一旦去掉，整个交互就会显得拖沓。

## 相机 Rig（The Camera Rig）

我从零开始写了一个自定义相机 rig，而不是使用 drei 的 `OrbitControls`。OrbitControls 提供的是围绕中心点旋转的相机轨道——而我需要的是一个 2D 平移相机：带有边界限制的拖拽、橡皮筋式边缘回弹，以及基于速度的倾斜效果。OrbitControls 里的每一条约束都会和我的需求“对着干”。

### 工作原理（How It Works）

这个 rig 是一个可变的单例状态，在相机组件与每一个 tile 之间共享：

```js
const rigState = {
  target: new THREE.Vector3(0, 2, 0),
  current: new THREE.Vector3(0, 2, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  zoom: CONFIG.zoomOut,
  isDragging: false,
  activeId: null,
};
```

指针事件会更新 `target`。每一帧里，`current` 会以阻尼方式向 `target` 靠拢。相机读取的是 `current`。这种“间接层”正是让一切感觉顺滑的原因——用户输入从来不会被直接应用到相机上。

### 拖拽与边界（Drag and Bounds）

我用一个距离阈值来区分点击与拖拽（桌面端 5px，触屏 15px）。拖拽灵敏度会随相机距离缩放，从而让平移在任何缩放级别下都保持一致的手感。

当拖过网格边缘时，会触发橡皮筋式阻力——你可以继续超拖 25%，之后才会被硬性夹住。松手后，相机会回弹到边界内。这和 iOS 的滚动回弹是同一种模式：它能在不“硬停”的情况下传达“你到边缘了”。

### 选中（Selection）

点击某个 tile 会同时触发平移与缩放。被选中的卡片会缩放到 1.5 倍，并在 Z 轴上向前弹出 2 个单位。其它所有卡片会缩小到 0.5 倍，并淡出到 15% 的不透明度——一种非常戏剧化的聚光灯效果。

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2026/02/selection-spotlight-800x439.png?x72865)

## 筛选与集合切换（Filtering and Collection Switching）

这个应用支持两类过渡动画。有意思的是，它们需要完全不同的策略来实现。

### 原地筛选（In-Place Filtering）

当你在同一个集合内筛选（比如从 “All” 到 “Jordan”）时，我不会卸载再重新挂载这些 tile。那会导致纹理重新上传，而这意味着掉帧。相反，我让匹配的条目平滑地重新排布以填满更密的网格；不匹配的条目则在原地淡出并缩小：

```js
easing.damp(animatedPos.current, "x", basePos.x, 0.2, delta);
easing.damp(animatedPos.current, "y", basePos.y, 0.2, delta);
const targetFilterOpacity = matchesFilter ? 1 : 0;
const targetFilterScale = matchesFilter ? 1 : 0.5;
easing.damp(filterOpacity, "current", targetFilterOpacity, 0.06, delta);
```

被隐藏的 tile 仍然保持挂载，但不可见——当不透明度低于 0.01 时，将 `visible = false`。这意味着筛选变化可以做到瞬时响应：没有额外的 GPU 工作，只有 uniform 的变化与位置的重新计算。

### 集合切换（Collection Switching）

切换集合是更重的操作——鞋子数据完全不同。我用“图层堆栈”的方式解决：旧网格与新网格会短暂共存，各自作为独立组件渲染，并拥有唯一的 React key。

```js
const handleCollectionSwitch = (index) => {
  setGridLayers((prev) => {
    const exitingLayers = prev.map((layer) =>
      layer.mode === "enter"
        ? { ...layer, mode: "exit", startTime: now }
        : layer
    );
    const newLayer = {
      id: `grid-${index}-${now}`,
      items: collectionsData[index],
      mode: "enter",
      startTime: now,
    };
    return [...exitingLayers, newLayer];
  });
  setTimeout(() => {
    setGridLayers((prev) => prev.filter((l) => l.mode === "enter"));
  }, CONFIG.cleanupTimeout);
};
```

旧网格会朝相机飞来（Z +20），而新网格会从后方进入（Z -50）。每个 tile 都会获得一个随机的错峰延迟。这样读起来更像“爆散”而不是“平移”——这是刻意为之。单纯的交叉淡入淡出会显得很平。Z 轴上的运动带来真实的空间感，而随机错峰则避免了同步运动带来的机械感。

进入的新 tile 还会根据它们在网格中的位置，在 Y 轴上做“散开”：上方的条目从更高的位置开始，下方的条目从更低的位置开始——营造一种“从四面八方汇聚”的感觉。

## 打磨（Polish）

### Dynamic Island（灵动岛）

底部控制栏借鉴了 Apple 的 Dynamic Island 模式：一个单一的玻璃拟态容器，在不同状态之间形变切换。我用的是 Framer Motion 的 `layout` 属性，因为它能处理 CSS 做不到的一件事——在完全不同的 DOM 结构之间进行动画过渡。

### 迷你地图（MiniMap）

一个 2D 的 `<canvas>` 覆盖层会运行自己独立的 `requestAnimationFrame` 循环，不依赖 R3F。每双鞋用一个点表示，被选中的鞋会发出金色光晕，而一个白色矩形表示当前可见视口。选中时，迷你地图会围绕激活的点平滑缩放到 2.5 倍。

### 性能（Performance）

有三种技术让我们保持在 60fps：

**分片挂载（Time-sliced mounting）。** 一次性挂载 60 张带纹理的卡片会造成 GPU 峰值。我改为每帧挂载 5 张，把工作分摊到约 200ms 内。快到让人无感，又慢到足以避免卡顿。我在这里没法用 InstancedMesh——因为每张卡片都有独一无二的纹理、独一无二的标签，以及独一无二的 shader 状态。实例化需要共享材质。
```

**三级剔除（Three-level culling）。** 每个 tile 都会做三层检查：是否已经完全退出？（直接跳过整个 `useFrame` 回调。）是否超出了视距？（把它隐藏。）它的透明度是否接近 0？（`visible = false`。）这些检查是叠加生效的——一旦某个 tile 在切换集合时已经退出，它就会跳过所有逐帧工作，而不只是跳过渲染。

**一切皆可变（Mutable everything）。** 相机位置、tile 的动画引用、着色器 uniforms ——都在 `useFrame` 里直接做可变更新，从不触碰 React state。唯一会触发重新渲染的时刻，是一些离散的用户操作：选择某个 tile、改变筛选条件、切换集合。

## 结语（Conclusion）

如果要把整个项目浓缩成一句话，那就是：难点不在 3D。难点在于让 3D 消失。没人应该看着这个就觉得“哦，一个 WebGL demo。”他们只该觉得：逛鞋子这件事，比平时稍微有趣了一点。

让我达到这个效果的那些模式——用指数阻尼替代 tween、用逐材质（per-material）着色器替代后期处理、对所有会动的东西都用可变 ref 而不是 React state——并不是什么特别稀奇的技巧。当你不再把 React Three Fiber 当作 demo 框架，而是把它当作生产级框架来对待时，这些选择会很自然地“长出来”。我在这个项目上花的大部分时间并不是在写着色器，而是在调阻尼常量、干掉不必要的重新渲染，并确保在动画进行到一半时改了筛选条件，不会把别的东西弄坏。

如果你在做类似的东西，直接抄这个架构：React 负责结构，GLSL 负责像素，一层很薄的可变状态把两者在 60fps 下桥接起来。其他一切，都是品味问题。