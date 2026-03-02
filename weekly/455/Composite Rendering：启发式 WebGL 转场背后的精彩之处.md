原文：Composite Rendering: The Brilliance Behind Inspiring WebGL Transitions  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## Composite Rendering：启发式 WebGL 转场背后的精彩之处

## Composite Rendering：启发式 WebGL 转场背后的精彩之处

探索 WebGL 中的合成渲染，以及渲染目标（render targets）如何驱动无缝转场与高级场景合成。

作者：[Jeremy Chang](https://tympanus.net/codrops/author/changjeremy/)  
分类：[Articles](https://tympanus.net/codrops/category/articles/)  
日期：2026 年 2 月 23 日

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2026/02/CompositeRendering.webp?x72865)

免费课程推荐：[通过 34 节免费视频课、循序渐进的项目和动手 Demo，用 GSAP 掌握 JavaScript 动画。立即报名 →](https://www.creativecodingclub.com/courses/FreeGSAP3Express?ref=0d0431)

大家好！我是 Jeremy，一名在 [Active Theory](https://activetheory.net/) 工作的创意开发者。Active Theory 是一家创意技术工作室，专注于打造有意义、有影响力的数字体验。

在过去几年里，我越来越关注 WebGL 体验在幕后是如何组织与搭建的，尤其是涉及转场、分层界面以及后期处理效果的时候。把一个 3D 场景直接渲染到屏幕在简单场景里没问题，但随着复杂度提升，它很快就会变得捉襟见肘。

在这篇实战讲解中，我会回顾我之前的一个项目：[Personal Log 2024](https://log-2024.jeremystudio.cc/)。我将通过分析它的实现方式来拆解我的思考过程，并反思哪些地方本可以做得更好。

## 不止是 3D 场景

在加入 Active Theory 之前，我花了很多时间投入个人项目，以提升技能并丰富作品集。现在回头看，有很多事情我真希望自己能更早理解——那些洞见本可以让当时的作品产生实实在在的提升。其中有一个概念尤其突出：WebGL 中的合成渲染（composite rendering）。

在继续之前，需要先说明：这个概念有很多不同的叫法。合成渲染也可能被称作 render-to-texture、FBO compositing 或 multipass rendering（多通道渲染）。

从宏观层面来说，**合成渲染（composite rendering）** 指的是：把场景渲染到一张离屏纹理（off-screen texture）里，而不是直接渲染到屏幕。这个中间步骤让我们能够操控渲染结果的图像，并叠加额外效果。若你觉得这很熟悉，那是因为这正是 Three.js 里后期处理（post-processing）的工作方式：我们不是直接输出场景，而是先把它渲染到一个渲染目标（render target）中，然后通过多次 pass 应用与叠加各种效果。处理后的结果要么通过 composer 再渲染出来；要么（像我们这里一样）把它贴到一个平面几何体（plane geometry）上，并用自定义 shader 进一步增强。

```js
// Set up Scene A
const sceneA = new THREE.Scene();
const cameraA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
);
sceneA.add(cameraA, cube);

// Setup Scene B - For final render: render target&#039;s texture on plane
const sceneB = new THREE.Scene();
const cameraB = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
const plane = new THREE.PlaneGeometry(1, 1);
const shader = new THREE.ShaderMaterial({
    vertexShader: compositeVertex,
    fragmentShader: compositeFragment,
    uniforms: {
        uTexture: new THREE.Uniform(),
    },
});
const planeMesh = new THREE.Mesh(plane, shader);
sceneB.add(cameraB, planeMesh);

// Set up Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
})
renderer.setSize(window.innerWidth, window.innerHeight);

// Set up Render Target
const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

// Render Loop
function startRender() {
    renderer.setRenderTarget(renderTarget);
    shader.uniforms.uTexture.value = renderTarget.texture;
    renderer.render(sceneA, cameraA);
    renderer.setRenderTarget(null);
    renderer.render(sceneB, cameraB);

    window.requestAnimationFrame(startRender);
}

startRender();
```

把这项能力加入你的工具箱，会带来一个全新的创作自由度层级。它能解锁大量可能性：从场景之间的转场，到纹理合成（compositing textures），再到尝试更具表现力的视觉效果。

下面是一些在不同思路中使用合成渲染的例子：

- [Active Theory](https://activetheory.net/) & [Slosh Seltzer](https://sloshseltzer.com/)：在多个区块之间滚动并进行转场。
- [Kenta Toshikura](https://kentatoshikura.com/)：将 3D 场景渲染为项目缩略图。
- [Aircord](https://aircord.co.jp/)：叠加多个场景，在页面之间实现无缝转场。

## 灵光乍现的时刻

我最初接触合成渲染，是通过 [Garden Eight](https://garden-eight.com/) 的一篇文章，它深入解析了 Aircord 网站背后的技术实现。文章对他们如何叠加多个场景、以及如何处理页面转场做了非常深入的讲解；这也成为了我个人的一个“突破点”，塑造了我现在组织场景结构的方式——避免不必要的重复搭建。

在我的项目中，场景结构与 Garden Eight 的方法类似，但层级更少。屏幕上始终存在两个元素：人脸几何体（face geometry）和“UI”。UI 会随页面变化而调整，但人脸几何体在所有视图中保持一致，只是交互形式会不同。

![](https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2026/02/03-800x452.png?x72865)

我没有去复制一份面部模型，而是搭建了一个主场景：里面包含面部几何体，以及一个充当渲染目标（render target）的平面。为了处理响应式，我会根据相机的垂直视场角（vertical field of view）计算渲染目标的尺寸，并按比例应用到 X 和 Y 的缩放上。

```js
const fovY = 
  (this.camera.position.z + this.plane.position.z) *
  this.camera.getFilmHeight() /
  this.camera.getFocalLength();
this.plane.scale.set(fovY * camera.aspect, fovY, 1);
```

渲染目标设置好之后，我就可以调整渲染顺序，让它位于面部几何体之后；把纹理切换为对应的 UI；并应用后期处理——后期处理本质上就像是我这个体验里的路由器。

## 同样的工作，更聪明的方式

虽然上面的方案已经能实现目标，但我们总可以进一步打磨：提升性能、简化结构，并让它更易扩展。

**第一**，与其每次都重新搭建相机、渲染器和场景脚手架，不如用 JavaScript 的 `extends` 特性把这些抽象成可复用的场景组件。这样我们可以把共享的基础只定义一次，然后在其之上持续扩展。

在 demo 里，我引入了一个 `BaseScene` 类，用来封装标准的 **Three.js** 场景初始化，处理诸如场景实例、相机配置以及项目工具等基础内容。在此之上，我又创建了一个 `FXScene`（这个名字毫不掩饰地借用了 Active Theory 的内部工具命名），专门用于需要渲染目标（render target）的场景。

采用这种架构后，我们能消除重复的初始化代码，同时依然可以完整访问所有共享的属性与行为。更重要的是，随着项目规模增长，我们可以给基类补充新能力，比如更多工具函数、共享资源、调试工具等，而所有继承这些基类的场景都会自动受益于这些改进。

下面是一个最小化的 `FXScene` 示例：概念上类似 `BaseScene`，但额外扩展了渲染目标的配置。

```js
import * as THREE from &#039;three&#039;;
import Experience from &#039;../../Experience&#039;; // Singleton setup to run the entire Three.js project

export default class FXScene {
  constructor() {
    this.experience = new Experience();
    this.renderer = this.experience.renderer;

    this.initScene();
    this.initCamera();
    this.initRenderTarget();

    this.sizes = this.experience.sizes;

    this.sizes.on(&#039;resize&#039;, () => {
      this.onResize();
    });
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null;
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 1, 15);
    this.camera.position.set(0, 0, 5);
    this.scene.add(this.camera);
  }

  initRenderTarget() {
    this.rt = new THREE.WebGLRenderTarget(this.sizes.width, this.sizes.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
    });
  }

  onResize() {
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
  }
}
```

**第二**，我们可以通过直接在裁剪空间（clip space）里渲染一个全屏四边形（fullscreen quad）来简化合成（composite）pass。因为它只是用来显示一张纹理，不需要深度测试或 3D 计算，所以也就没必要进行多余的投影计算。实现方式是在顶点着色器里把所有矩阵相关的内容剥离掉——没有它们你会看到一个覆盖整个场景的大矩形。为了确保它始终在所有其他物体的后面，你可以手动控制它的渲染顺序（render order）。

```js
// const fovY = camera.getFilmHeight() / camera.getFocalLength();
// renderTarget.scale.set(fovY * camera.aspect, fovY, 1);
this.plane.renderOrder = -1;

void main() {
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
```

**接下来**，我们可以简化路由结构，去掉那一大坨 if 语句的杂乱。通过创建一个专门的类，用查找表（lookup table）来管理路由变化，我们可以让逻辑更清晰。这个类或函数接收 `from` 和 `to` 两个场景的纹理，然后负责渲染与它们之间的过渡衔接。

```js
// Setup scenes, cameras, and render targets...

constructor() {
  this.currentView = null;
}

function onViewChange(to) {
  let viewMap= {
    scene1: this.sceneOne.rt.texture,
    scene2: this.sceneTwo.rt.texture
  };

  if (!this.currentView) {
    this.currentView = viewMap[&#039;scene1&#039;];
    this.shader.uniforms.uFromTexture.value = this.currentView;
    this.shader.uniforms.uTransition.value = 0;
    return;
  }

  if (this.currentView === viewMap[to]) return;

  this.shader.uniforms.uToTexture.value = viewMap[to];
  this.currentView = viewMap[to];
  gsap.to(this.shader.uniforms.uTransition, {
    value: 1,
    duration: 1,
    onComplete: () => {
        this.shader.uniforms.uFromTexture.value = viewMap[to]
        this.shader.uniforms.uTransition.value = 0
    }
  });
}

void main(){
  vec4 fromTexture = texture2D(uFromTexture, vUv);
  vec4 toTexture = texture2D(uToTexture, vUv);

  vec4 color = mix(toTexture, fromTexture, uTransition);

  gl_FragColor = color;
}
```

用这种方法，我们就能更轻松地维护与扩展项目，按需增长，同时在过渡效果上也能拥有更大的创作自由。YouTube 上的 [Yuri Artiukh](https://youtu.be/03zEIr4M1I4) 提供了很多很好的示例可以参考：

```glsl
mix(toTexture, fromTexture, uTransition);
mix(toTexture, fromTexture, step(uTransition, vUv.y));
mix(toTexture, fromTexture, step(uTransition, 0.5 * ( vUv.y + vUv.x )));
mix(toTexture, fromTexture, smoothstep(uTransition, uTransition + 0.3, ( vUv.x + vUv.y ) / 2.));
```

最后，在原始项目中还存在一个微妙但重要的问题：模糊（blur）函数在不经意间覆盖了最终输出的 alpha 通道。与其深入研究 blur 本身的内部实现，更干净的解决方案是把模糊逻辑直接搬到我们之前构建的合成（composite）着色器里，并在那里面处理所有后期流程。鼠标流体效果也可以放在同一个合成 pass 中完成。

把这些步骤整合到一个合成着色器中，可以减少总的渲染 pass 数量，从而整体提升性能。同时，它也将所有最终阶段的效果处理集中到一处，提高了可读性和可维护性，并减少了出错点——因为我们主要是在纹理上进行操作，这让调试变得更加直接。

```glsl
void main() {
  vec4 fromTexture = texture2D(uFromTexture, vUv);
  vec4 toTexture = texture2D(uToTexture, vUv);

  vec4 color = mix(toTexture, fromTexture, uTransition);

  // Postprocessing for color
  gl_FragColor = color;
}
```

## **回顾过去，继续前行**

首先，真心感谢你愿意一路读到最后。写下这些对我来说是一次收获极大的经历——重新回看一年前做过的工作，并反思自己的成长，这既让我保持谦逊，也给了我很深的启发。我由衷感到感激（也觉得自己很幸运）能够分享我的作品，并与 Active Theory 这样一支细致、才华横溢的团队合作。我很期待，迄今为止所学到的一切会如何塑造我作为创意开发者旅程的下一章节。

致意！