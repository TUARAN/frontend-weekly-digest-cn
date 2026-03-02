原文：Practical guide to the <img> element: from the basics to LCP  
翻译：TUARAN  
欢迎关注 {{前端周刊}}，每周更新国外论坛的前端热门文章，紧跟时事，掌握前端技术动态。

## `<img>` 元素实用指南：从基础到 LCP

#  `<img>` 元素实用指南：从基础到 LCP  
发布：2026 年 2 月 22 日  

本文聚焦于 Web 性能（Web Performance）最佳实践。优化图片性能并不能替代无障碍（accessibility）：例如 `alt` 这类属性至关重要，但不在本指南的讨论范围内。

`<img>` 元素看起来很简单，但“将就用”和“用得好”之间差别很大。在我的性能审计中，这是我发现提升空间最大的元素之一：图片没有启用懒加载、没有声明 `width` 和 `height`、LCP 的优先级设置不正确……这些错误会让 Core Web Vitals 扣分，更重要的是，会让用户体验变差。

本文将涵盖最重要的属性和技巧，从响应式图片到 Largest Contentful Paint（最大内容绘制，LCP）优化。

## 目录

打开目录

- [使用 `srcset` 与 `sizes` 实现响应式图片](https://joanleon.dev/en/guia-practica-elemento-img/#responsive-images-with-srcset-and-sizes)

- [使用 `<picture>` 支持现代格式](https://joanleon.dev/en/guia-practica-elemento-img/#modern-formats-with-picture)

- [性能相关属性：`loading`、`decoding` 与 `fetchpriority`](https://joanleon.dev/en/guia-practica-elemento-img/#performance-attributes-loading-decoding-and-fetchpriority)

- [适用于 LCP 的最佳组合](https://joanleon.dev/en/guia-practica-elemento-img/#the-optimal-combination-for-lcp)

- [图片 CDN：务实的解决方案](https://joanleon.dev/en/guia-practica-elemento-img/#image-cdns-the-pragmatic-solution)

- [结论](https://joanleon.dev/en/guia-practica-elemento-img/#conclusion)

## 使用 `srcset` 与 `sizes` 实现响应式图片

`srcset` 属性允许你声明同一张图片的多个版本，这样浏览器就可以根据上下文（屏幕像素密度、视口大小）选择最合适的版本。

<!-- ❌ 一张图走天下 -->
<img src="hero.jpg" alt="Hero image" />

<!-- ✅ 针对不同密度和尺寸提供多个版本 -->
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  width="800"
  height="600"
  alt="Hero image"
/>

`sizes` 属性会告诉浏览器：在每个断点下，图片在布局中会占据多少空间。没有 `sizes` 时，浏览器会假设为 `100vw`，从而可能下载比实际需要更大的图片。

## 使用 `<picture>` 支持现代格式

AVIF 或 WebP 等现代格式相比 JPEG 或 PNG 拥有显著更好的压缩率。`<picture>` 元素允许你声明多个来源：浏览器会加载它支持的第一个来源。

JPEG XL 同样承诺带来明显的压缩提升，但浏览器支持非常有限：Chrome 在 2022 年移除了它，而在 Firefox 和 Safari 中也仅以实验性方式提供。就目前而言，AVIF + WebP 是最稳妥的组合。

<!-- ❌ 只有 JPEG，没有备选 -->
<img src="photo.jpg" alt="Photo" />

<!-- ✅ 优先 AVIF，WebP 作为回退，JPEG 作为基础兜底 -->
<picture>
  <source type="image/avif" srcset="photo.avif" />
  <source type="image/webp" srcset="photo.webp" />
  <img src="photo.jpg" width="800" height="600" alt="Photo" />
</picture>

顺序很重要：浏览器会从上到下尝试，并使用它能渲染的第一种格式。AVIF 的压缩效果最好，但支持度不如 WebP。JPEG 仍然是通用的最终兜底方案。

### 结合响应式与现代格式

这两种技术可以组合使用，从格式和尺寸两方面都做到“给对图片”：

<picture>
  <source
    type="image/avif"
    srcset="photo-400.avif 400w, photo-800.avif 800w, photo-1600.avif 1600w"
    sizes="(max-width: 600px) 100vw, 50vw"
  />
  <source
    type="image/webp"
    srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1600.webp 1600w"
    sizes="(max-width: 600px) 100vw, 50vw"
  />
  <img
    src="photo-800.jpg"
    srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
    sizes="(max-width: 600px) 100vw, 50vw"
    width="800"
    height="600"
    alt="Photo"
  />
</picture>

没错，代码会更多。但像 Cloudinary 这样的图片 CDN 可以自动处理这些：它会通过请求头 `Accept` 检测最优格式，无需你手动写出这些变体。

## 性能相关属性：`loading`、`decoding` 与 `fetchpriority`

这三个属性对性能指标影响最大，也是我最常见到被错误配置的部分。

### `loading`

用于控制浏览器何时下载图片。

<!-- ❌ 一次性加载所有图片，包括视口之外的 -->
<img src="photo.jpg" alt="Photo" />

<!-- ✅ 延后加载视口之外的图片 -->
<img src="photo.jpg" alt="Photo" loading="lazy" />

对任何不在首屏视口内可见的图片来说，`loading="lazy"` 都是安全的。对于可见的图片——尤其是 LCP 图片——应使用 `loading="eager"`（或干脆省略该属性，因为默认就是 eager）。

### `width` 和 `height`

在 HTML 中声明尺寸可以让浏览器在图片下载前就预留空间，从而避免加载时发生布局位移（layout shifts），这类位移会导致 CLS 受到惩罚。

<!-- ❌ 没有尺寸：图片加载时布局发生位移 -->
<img src="photo.jpg" alt="Photo" />

<!-- ✅ 声明尺寸：从一开始就预留空间 -->
<img src="photo.jpg" alt="Photo" width="800" height="600" />

它们不需要与最终显示尺寸完全一致（这由 CSS 来处理）。关键在于宽高比必须正确，这样浏览器才能准确计算出应预留的空间。

### `decoding`

告诉浏览器是否可以异步解码图片，从而避免阻塞主线程。

<!-- For non-critical images: does not block rendering -->
<img src="photo.jpg" alt="Photo" decoding="async" />

<!-- For the LCP image: forces synchronous decoding -->
<img src="hero.jpg" alt="Hero" decoding="sync" />

对于次要图片来说，`decoding="async"` 是一个不错的默认选择。对于 LCP 图片，`decoding="sync"` 可以确保图片一旦下载完成，就会尽快显示出来。

### `fetchpriority`

用于在浏览器的优先级系统中调整资源的下载优先级。

<!-- ❌ The browser may not prioritise it correctly -->
<img src="hero.jpg" alt="Hero" />

<!-- ✅ Explicitly signals it is critical -->
<img src="hero.jpg" alt="Hero" fetchpriority="high" />

<!-- For non-critical images that might download earlier than needed -->
<img src="banner.jpg" alt="Banner" fetchpriority="low" />

当 LCP 图片位于轮播组件中，或在 HTML 里出现得比较靠后，而浏览器又无法自行将其识别为高优先级资源时，`fetchpriority="high"` 会特别有用。

## LCP 的最佳组合

对于决定 LCP 的那张图片，有两个关键环节：下载与渲染。

`fetchpriority="high"` 会提升下载优先级，但前提是解析器已经在 HTML 中找到了该图片。如果图片在文档中出现得很晚——比如在某个组件内部、轮播中，或是作为 CSS 背景图——浏览器可能会发现得太晚。

在 `head` 中添加一个 `<link rel="preload">` 可以解决这个问题：它会在解析器抵达图片之前就启动下载。

<!-- In the <head>: start the download as early as possible -->
<link rel="preload" as="image" href="hero.jpg" fetchpriority="high" />

<!-- In the <body>: with the correct rendering attributes -->
<img
  src="hero.jpg"
  alt="Hero"
  width="1200"
  height="600"
  loading="eager"
  decoding="sync"
  fetchpriority="high"
/>

如果你使用带现代格式的 `srcset`，preload 标签也支持 `imagesrcset` 和 `imagesizes`，这样浏览器就能准确预加载它最终会使用的资源：

<link
  rel="preload"
  as="image"
  imagesrcset="hero-400.avif 400w, hero-800.avif 800w, hero-1600.avif 1600w"
  imagesizes="(max-width: 600px) 100vw, 800px"
  fetchpriority="high"
/>

并且当它与 `<picture>`、现代格式，以及带 `sizes` 的 `srcset` 结合使用时，图片在各个层面都能得到很好的优化与服务。

## 图片 CDN：务实的解决方案

手动维护所有这些格式与尺寸变体的成本很高。像 Cloudinary、Imgix 或 Cloudflare Images 这类图片 CDN 可以自动完成繁重工作：它们会通过 `Accept` 请求头为每个浏览器检测最优格式，按需生成所需尺寸，并从距离最近的节点分发优化后的图片。

以 Cloudinary 为例，你只需要在 URL 中声明参数即可：

<img
  src="https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/photo.jpg"
  width="800"
  height="600"
  alt="Photo"
  loading="lazy"
  decoding="async"
/>

`f_auto` 会根据浏览器选择 AVIF、WebP 或 JPEG。`q_auto` 会自动调整质量。整个过程都不需要你管理多份文件。

## 结论

`<img>` 元素的潜力远比我们平时利用的要多。通过 `srcset` 和 `sizes`，我们可以提供合适的尺寸；通过 `<picture>` 和现代格式，我们可以减小文件体积；通过 `width` 和 `height`，我们可以避免布局偏移；通过 `loading`、`decoding` 和 `fetchpriority`，我们可以控制图片何时以及如何加载。而对于 LCP 图片，添加一个 `<link rel="preload">` 往往就是 LCP 变绿还是变红的关键差异。

如果你想更深入了解这些属性，并查看更多示例，我在 [image-element](https://github.com/nucliweb/image-element) 仓库里整理了最佳实践。

要审计任意页面上图片的状态，你可以使用 WebPerf Snippets 中的 [Image Element Audit](https://webperf-snippets.nucliweb.net/Media/Image-Element-Audit) 代码片段：直接在 DevTools 控制台运行，它会展示页面上每个 `<img>` 的属性分析。

      
 images      
 webperf      
 core-web-vitals      
 html          返回顶部   在以下平台分享本文：   
      
      
      
     通过 WhatsApp 分享本文  
    
    
   在 Facebook 分享本文  
      
      
     在 X 分享本文  
        
        
       通过 Telegram 分享本文  
      
      
      
      
     在 Pinterest 分享本文  
      
      
      
     通过邮件分享本文         [      上一篇文章：基于不同加载方式的 Web 端 SVG：性能对比  ](https://joanleon.dev/posts/en/svg-optimization) [  下一篇文章：Yield to Main：setTimeout vs queueMicrotask vs scheduler.postTask      ](https://joanleon.dev/posts/en/yield-to-main-optimize-inp)