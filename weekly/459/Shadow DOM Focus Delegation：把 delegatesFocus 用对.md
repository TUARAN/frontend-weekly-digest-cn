原文：Shadow DOM Focus Delegation: Getting delegatesFocus Right  
链接：https://frontendmasters.com/blog/shadow-dom-focus-delegation-getting-delegatesfocus-right/  
创作：TUARAN

# Shadow DOM Focus Delegation：把 delegatesFocus 用对

`delegatesFocus` 是很典型的一类平台细节：平时不怎么被讨论，一旦做错，组件体验就会显得很别扭。焦点流转这种事情，用户未必会明确说出来，但他们会立刻感受到“怎么这个控件不顺手”“为什么键盘导航怪怪的”。

Shadow DOM 想要真正适合生产级组件，不只是样式隔离做得漂亮，还得把焦点、可访问性、交互预期这些边角问题处理对。否则所谓“封装”最后只是把问题藏起来，而不是解决掉。

这篇文章最有价值的地方，在于它把一个很容易被忽略的小属性，放回了组件质量这个更大的语境里。现代前端里，很多质量差异正是由这些细节积累出来的。

