> 原文：[Building an Endless Procedural Snake with Three.js and WebGL](https://tympanus.net/codrops/2026/02/10/building-an-endless-procedural-snake-with-three-js-and-webgl/)
> 翻译：TUARAN
> 欢迎关注 [前端周刊](https://github.com/TUARAN/frontend-weekly-digest-cn)，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

# 用 Three.js 和 WebGL 打造「无限」贪吃蛇场景

想象一条蛇在屏幕上蜿蜒前进，沿着一条有机曲线平滑地追逐鼠标。

真正困难的部分是这条路径本身：鼠标输入有噪声、运动要实时更新、曲线又不能提前完整预计算并长期缓存。

这篇教程给出的解法是一个两段式曲线系统：

- `CurveGenerator`：按行为规则持续生成短的三次 Bézier 片段；
- `EndlessCurve`：把这些片段拼成一条连续、内存有界的路径。

路径稳定之后，再在其上渲染程序化蛇体。

## 1. 引言

作者的灵感来自复古贪吃蛇：把基于网格的离散移动，改造成 3D 空间中的连续运动。看起来只是“把 2D Snake 变 3D”，真正实现时却比预期复杂得多。

本文核心不只是“画一条蛇”，而是把运动、路径管理、渲染解耦成独立层：

- 运动层：决定蛇下一段该往哪走；
- 路径层：维持一条可无限前进但内存受控的连续曲线；
- 渲染层：用 GPU 侧实例化与纹理驱动几何变形。

## 2. 生成曲线（Generating the curve）

每段曲线都从一个问题开始：蛇“现在”该朝哪个方向移动？

方向不是一次拍板，而是多个小的 steering impulse 混合后的结果。每次更新遵循同一流程：

1. 先得到目标方向（desired direction）；
2. 再限制方向变化速度（turn-rate limiting）；
3. 最后把方向转换为一段短 Bézier 曲线。

### 2.1 转向方向（Steering the direction）

运动模型借鉴 Craig Reynolds 的 Steering Behaviors。这里不是多代理仿真，而是把蛇当成一个实体，把多种“力”合成一个方向向量。

主要包含：`seek`、`orbit`、`coil`、`wander`、`turn-rate limiting`。

**Seek**：离目标较远时，拉回目标方向，并留一个缓冲区，避免靠近轨道区时频繁切换。

```ts
if (dist > orbitRadius * 1.5) {
	desiredDir = targetDir
}
```

**Orbit**：靠近目标后，不再直冲，而是在地面平面上取与目标方向垂直的切向方向（绕圈）。

```ts
const tangent = new Vector3(-targetDir.z, 0, targetDir.x)
const radiusError = dist - orbitRadius
const radialStrength = radiusError * 0.1
desiredDir = coilTangent.clone().addScaledVector(targetDir, radialStrength).normalize()
```

**Coil**：在 orbit 基础上加入垂直分量，让轨迹上下起伏。高度用正弦，方向跟随其导数，避免突兀。

```ts
const coilY = coilAmplitude * coilFrequency * Math.cos(coilFrequency * orbitAngle) * coilActivation
const coilTangent = new Vector3(tangent.x, coilY, tangent.z)
desiredDir = coilTangent.clone().addScaledVector(targetDir, radialStrength).normalize()
```

**Wander**：加入轻微随机扰动，避免轨迹过于机械。两个独立噪声样本分别在水平与垂直方向微调，且以低权重混入。

```ts
const wander = wanderForce(lastDir, noise2D, noiseTime, wanderStrength, tiltStrength)
const wanderDelta = wander.clone().sub(lastDir)
desiredDir.add(wanderDelta.multiplyScalar(wanderWeight))
```

**Turn-rate limiting**：无论上面合力如何，单段转向角都不能超过 `maxTurnRate`，这是平滑与防自折叠的关键。

```ts
function limitTurnRate(current: Vector3, desired: Vector3, maxRate: number): Vector3 {
	const angle = current.angleTo(desired)
	if (angle <= maxRate) return desired.clone()
	if (angle < 0.001) return current.clone()

	const axis = new Vector3().crossVectors(current, desired)
	axis.normalize()

	return current.clone().applyAxisAngle(axis, maxRate)
}

const newDir = limitTurnRate(lastDir, desiredDir, maxTurnRate)
```

### 2.2 从方向到曲线（From direction to curve）

有了新方向后，每次更新生成一段短的三次 Bézier。

端点就是“沿新方向推进 `length`”。

```ts
const endPoint = lastPoint.clone().add(newDir.clone().multiplyScalar(length))
```

控制点决定弯曲程度。方向变化越大，手柄距离越长；较直行时更短。

```ts
const turnAngle = lastDir.angleTo(newDir)
const turnFactor = Math.min(1, turnAngle / (Math.PI / 2))
const controlDist = length * (0.33 + 0.34 * turnFactor)

const cp1 = lastPoint.clone().add(lastDir.clone().multiplyScalar(controlDist))
const cp2 = endPoint.clone().sub(newDir.clone().multiplyScalar(controlDist))

const curve = new CubicBezierCurve3(lastPoint, cp1, cp2, endPoint)
```

其中 `cp1` 跟随旧方向、`cp2` 跟随新方向，可保持 `G1` 连续（段与段在连接处切线方向一致）。

## 3. 无限曲线（Infinite curve）

单段平滑解决了局部问题，但蛇体是持续运动的。`EndlessCurve` 把多段曲线当成一条连续路径，同时保证“前方够用、后方可回收”。

### 3.1 滑动窗口（The sliding window）

蛇体可以看成沿着一条越来越长路径移动的窗口：每帧前进一点。

```ts
this.distance += delta * this.config.speed
this.curve.configureStartEnd(this.distance, this.config.length)
```

`configureStartEnd()` 负责记账：

- 向前补足长度；
- 删除尾部之后的旧曲线；
- 维护可见区间的局部参数空间。

```ts
configureStartEnd(position: number, length: number): void {
	this.fillLength(position + length)
	this.removeCurvesBefore(position)

	const localPos = this.localDistance(position)
	const totalLen = this.getLengthSafe()

	this.uStart = totalLen > 0 ? localPos / totalLen : 0
	this.uLength = totalLen > 0 ? length / totalLen : 1
}
```

旧段被删除时，全局距离计数仍持续增长；`distanceOffset` 用来桥接“全局坐标”与“局部保留段”，使上层逻辑无需关心清理细节。

对外再映射到局部 `[0, 1]`：`u=0` 是尾部，`u=1` 是头部。

```ts
getPointAtLocal(u: number): Vector3 {
	return this.getPointAt(this.uStart + this.uLength * u)
}
```

### 3.2 提取法线（Extracting normal）

沿曲线放置几何体时，需要稳定的 TBN 参考系。切线 `T` 通常好算，法线 `N` 如果处理不当会产生可见扭转。

常见做法是把固定 world-up 投影到切线垂直平面：

$$N = \text{normalize}(up - T \cdot \text{dot}(up, T))$$

路径大体水平时可行；当 `T` 接近 `up` 时投影会退化，参考系变得不稳定。

### 3.3 并行传输帧（Parallel Transport Frames）

教程采用并行传输：不是每点独立求法线，而是把上一点法线按“上一切线到新切线”的旋转带过去。这样可得到最小扭转（minimum twist）。

```ts
private parallelTransport(
	prevNormal: Vector3,
	prevTangent: Vector3,
	newTangent: Vector3
): Vector3 {
	const dot = prevTangent.dot(newTangent)

	if (dot > 0.9999) return prevNormal.clone()

	const axis = new Vector3().crossVectors(prevTangent, newTangent).normalize()
	const angle = Math.acos(Math.max(-1, Math.min(1, dot)))

	const rotated = prevNormal.clone().applyAxisAngle(axis, angle)

	rotated.sub(newTangent.clone().multiplyScalar(rotated.dot(newTangent)))
	return rotated.normalize()
}
```

### 3.4 帧缓存与维护（Frame caching / maintenance）

并行传输是串行依赖。为支持高效随机访问，系统会在每段 Bézier 上按固定采样预计算并缓存 frame。

任意参数请求时，从邻近样本线性插值即可（样本足够密时成本更低、效果足够稳定）：

```ts
return cache.normals[low]
	.clone()
	.lerp(cache.normals[high], t)
	.normalize()
```

旧曲线移除时，对应缓存同步删除并重算剩余参数范围。活动段数量较小，这部分成本可忽略。

## 4. 生成蛇体（Generating the snake）

曲线只是“脊柱”，蛇不是线。需要把它变成有厚度、有头尾变化、有表面细节、能正确吃光的三维体。

### 4.1 构建鳞片（Building the scales）

本教程采用实例化几何：每个实例是简单 `OctahedronGeometry`，压扁并轻微重叠后形成类似鳞片的铺面。定位和变形主要在顶点着色器完成，CPU 只负责采样曲线并上传数据。

### 4.2 构建数据纹理（Building data textures）

用两张 `DataTexture` 把脊柱信息传给 GPU：

- 法线纹理：RGB 存法线，按 `value * 0.5 + 0.5` 编码进 `[0,1]`；着色器再 `value * 2.0 - 1.0` 解码回 `[-1,1]`。
- 位置纹理：RGB 存每个采样点的世界坐标 `XYZ`。

每帧更新：

```ts
for (let i = 0; i < texturePoints; i++) {
	const u = i / (texturePoints - 1)
	const basis = this.curve.getBasisAtLocal(u)

	const idx = i * 4
	posData[idx] = basis.position.x
	posData[idx + 1] = basis.position.y
	posData[idx + 2] = basis.position.z
	posData[idx + 3] = 1.0

	normData[idx] = basis.normal.x * 0.5 + 0.5
	normData[idx + 1] = basis.normal.y * 0.5 + 0.5
	normData[idx + 2] = basis.normal.z * 0.5 + 0.5
	normData[idx + 3] = 1.0
}
```

### 4.3 真实感（Realism）

教程强调“最终观感来自许多小细节叠加”：

- **半径分布**：尾部逐步变细、躯干最厚、颈部收窄、头部再鼓起；
- **椭圆截面**：蛇体通常“宽大于高”，不是正圆截面；
- **腹部偏移**：轻微下腹鼓起，补足腹面体感；
- **沿脊柱轻微扭转**：打破过于整齐的栅格感；
- **法线微扰**：加入细尺度粗糙变化，避免高光过于“塑料感”；
- **腹部提亮**：保持斑纹可见的同时提高腹侧亮度。

例如：

```glsl
float radiusNormal   = scale * u_radiusN;
float radiusBinormal = scale * u_radiusB;
```

```glsl
ringOffset += spineNormal * combinedThickness * u_zOffset;
```

```glsl
float twistedTheta = theta + spineU * u_twistAmount;
```

光照上还包含：rim lighting、阴影压缩（避免阴面死黑）、各向异性高光（模拟鳞片方向性反射）。

## 5. 下一步（What’s next）

作者给出几个可继续深化的方向：

- **腹面约束运动**：限制蛇始终以腹侧贴地前进，减少不自然翻滚；
- **更严格的盘绕行为**：让绕目标的 coil 更紧、更可控；
- **更解剖学化的头部**：独立头部网格（下颌、眼位等），但继续沿同一曲线驱动；
- **环境交互**：把障碍、地形、表面反馈接入 steering；
- **替代体型**：沿用同一曲线系统，换成触手、绳索、藤蔓、抽象拖尾。

## 6. 总结（Conclusion）

这个项目验证了一件事：连续运动可以从简单规则中涌现，不必依赖预定义整条路径，也不需要每帧重建重几何。

通过“增量生成曲线 + 滑动窗口管理 + GPU 主导渲染”，蛇体既流畅又可控，且性能稳定。

更重要的是其架构模式：运动、连续性、渲染彼此解耦。这个模式不只适用于蛇，也适用于任何需要“实时、连续、响应式”路径运动的系统。

### 本文实现了什么

- 实时曲线系统：从噪声输入生成平滑连续路径；
- 内存有界的无限路径：由链式 Bézier 段组成；
- 基于并行传输的稳定无扭转方向场；
- 使用实例化几何与数据纹理的 GPU 渲染管线；
- 具备鳞片结构、解剖学轮廓与物理动机光照的程序化蛇体。

