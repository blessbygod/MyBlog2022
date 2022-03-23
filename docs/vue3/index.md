## 如何快速看源代码，去了解一个技术细节的实现？

### 先写自己关心的技术细节问题
- ssr到客户端生成静态页面，标识是如何设置的
- 客户端如何检查状态不一致的，不一致会造成控制台输出警告信息，且客户端从头重新渲染
- 在Vue，这个技术叫”客户端激活(hydration)`

### 了解源代码的几个思路
- 从测试代码看起
`一个好的框架一般都会有非常完善的测试代码和很高的测试覆盖率，从测试代码看起，相当于反过来看作者的思路，他是怎么验证自己的代码设计是完备的，而且会使用核心的API来测试代码的。`
- 从README.md看起

#### 具体分析hydration.spec.ts
- Vue3是用的jest进行测试的，安装ts-jest进行单文件测试
` 在项目根目录备份jest.config.js， 修改testMatch项为单文件即可`
- `npm run test`, 先从测试输出看：
```
SSR hydration
√ text (16 ms)
√ empty text (6 ms)
√ comment (4 ms)
√ static (4 ms)
√ static (multiple elements) (4 ms)
√ element with text children (9 ms)
√ element with elements children (13 ms)
√ element with ref (3 ms)
√ Fragment (6 ms)
√ Teleport (8 ms)
√ Teleport (multiple + integration) (16 ms)
√ Teleport (disabled) (7 ms)
√ full compiler integration (49 ms)
√ handle click error in ssr mode (5 ms)
√ handle blur error in ssr mode (4 ms)
√ Suspense (5 ms)
√ Suspense (full integration) (53 ms)
√ async component (6 ms)
√ update async wrapper before resolve (5 ms)
√ unmount async wrapper before load (3 ms)
√ unmount async wrapper before load (fragment) (1 ms)
√ elements with camel-case in svg  (2 ms)
√ SVG as a mount container (2 ms)
√ force hydrate input v-model with non-string value bindings (4 ms)
√ force hydrate select option with non-string value bindings (4 ms)
mismatch handling
	√ text node (1 ms)
	√ element text content (4 ms)
	√ not enough children (2 ms)
	√ too many children (1 ms)
	√ complete mismatch (3 ms)
	√ fragment mismatch removal (1 ms)
	√ fragment not enough children (2 ms)
	√ fragment too many children (6 ms)
	√ Teleport target has empty children (2 ms)
Test Suites: 1 passed, 1 total
Tests:       34 passed, 34 total
Snapshots:   10 passed, 10 total
Time:        10.878 s, estimated 14 s
Ran all test suites.

	测试输出里面有个关键行"mismatch handling"，不匹配测试部分，
这里就是构建不匹配测试，看是否符合预期：
	- 预期在控制台打印"Hydration node mismatch"等Warning信息。
```

- 测试代码具体分析
```
一、测试util
在describe单元测试模块SSR hydration前声明了2个util函数
1、mountWithHydration
（用自定义render函数来渲染从参数提供的html字符串，并返回带有虚拟树根节点的subTree的vnode，
和根dom容器对象）
2、triggerEvent
（很简单，触发自定义事件）

二、测试模块
先说match部分，再说mismatch部分。

Match测试Case包括：
1、文本 - text
2、注释 - comment
3、静态（非数据渲染部分） - static
4、DOM元素 - element
5、片段 - Fragment
6、传送门 - Teleport
7、集成编译 - full compiler integration
8、ssr模式下触发事件错误 - handle events error in ssr mode
9、全局和自定义异步组件 - Suspence and async component
10、在不同的生命周期更新和卸载异步Wrapper - async wrapper lifecycle
11、SVG - SVG
12、空数据绑定处理 - input v-model with non-string | select option with non-string


```
- 创建小项目来查看这个细节
```
小项目链接：[待补上]
发现hydration需要在客户端代码使用createSSRApp即可，第一眼以为这个API只有在SSR的时候才需要使用，createSSRApp这个API调用render的时候会单独注入hydration的参数。
在使用vue的非生产版本（vue.esm-browser.js），如果ssr渲染和客户端不一致，就可以在浏览器控制台收到warning。
类似这样的：

vue.esm-browser.js:1565 [Vue warn]: Hydration text content mismatch in <div>:
- Client: Current User is: Li Sen
- Server: Current User is: Mon Mar 21 2022 11:48:29 GMT+0800 (中国标准时间)
  at <App>
vue.esm-browser.js:1565 [Vue warn]: Hydration text content mismatch in <div>:

可以非常快速的帮助我们判断是否SSR出错了，而且这里的client和server颠倒了，是因为当前客户端使用了
createSSRApp，所以它认为本身由于真正的服务器下发的首页的内容是Client。


这里遗留2个问题：
1、createSSRApp在客户端使用，可以完全替代createApp运行。
2、完全替代后，如果build会导致一个问题，在生产环境也会进行检测，对性能有损耗。


结论：
1、客户端是一定会重新渲染的，不同的是：
	1）客户端激活(hydration)的功能会自动检查DOM结构是否匹配，在引入vue的非prod版本可以做出警告提示。
	2）另外createSSRApp的版本在客户端引用，不会给根目录添加data-v-app的标签
	  - 这个可能会影响scoped style（在scoped那一章单独分析）
2、单独创建入口文件，仅仅用来测试SSR和客户端的数据不一致情况使用。

```
- 具体分析测试用例的调用API
```
1、测试API的导入：
  createSSRApp,
  h,
  ref,
  nextTick,
  VNode,
  Teleport,
  createStaticVNode,
  Suspense,
  onMounted,
  defineAsyncComponent,
  defineComponent,
  createTextVNode,
  createVNode,
  withDirectives,
  vModelCheckbox、
  这些API都是从@vue/runtime-dom导入的。
  runtime-dom是给vue的运行时环境使用的API。

  注意这里使用的是createSSRApp, 而不是createApp。

  测试用例的部分大家可以自己看，拿Text， comment, static举例：
    测试之前有个
	beforeEach(() => {
		document.body.innerHTML = ''
	})
	用来预处理 - 使当前的文档的Body节点的内容及children为空。
	(PS: jest-environment-jsdom使用了jsdom 16.0来支持dom操作的，和无头浏览器还不一样，仅仅基于nodejs和whatwg的DOM和HTML标准。这里有jsdom和phantomjs的比较wiki
	https://github.com/jsdom/jsdom/wiki/jsdom-vs.-PhantomJS)
    Text:
		step 1：渲染一个文本foo，看预期生成的虚拟节点vnode的属性el是不是当前容器container的第一个子节点firstChild
			(Node和Element的不同, firstElementChild, childNodes, children)
		step 2：看这个容器container属性textContext的值是不是foo
		step 3：修改foo为bar
		step 4：经过一次文本渲染，用await nextTick();
		step 5：看当前容器的内容节点是否符合是bar。
	Comment:
		step 1：渲染<!---->这段文本，同样看vnode.el是不是container的firstchild
		step 2：然后看vnode.el的nodeType是不是等于8
	static:
		会有个vnode.anchor是否是container的firstChild的判断。

  这里再单独说一下Suspense和defineAsyncComponent，这两个API的测试：
  Suspense：全局调用异步组件的容器
  	step 1：构建一个AsyncChild，声明自己是一个异步组件，在async setup()，包含了渲染一个span，且Span注册onClick事件，触发onClick的时候让span的value值加1
  	step 2：用<span>0</span>渲染container，渲染函数用Suspense Wrap AsyncChild。
	step 3：await new Promise(r => setTimeout(r)),
	step 4: 触发span的click事件
	step 5: 查看container.innerHTML是否已经是 <span>1</span>

  Async Component: 异步的组件
  step 1：构建一个组件

```