# vue

## Which dist file to use?
- dist文件夹里面的文件的作用？

### From CDN or without a Bundler
- 放到CDN上使用，或没有构建器（webpack,rollup,fis...）的情况下

- **`vue(.runtime).global(.prod).js`**:
  - For direct use via `<script src="...">` in the browser. Exposes the `Vue` global.
    (在浏览器上直接用`<script src="./vue(.runtime).global(.prod).js">`，会导出了Vue这个全局变量)
  - Note that global builds are not [UMD](https://github.com/umdjs/umd) builds.  They are built as [IIFEs](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) and is only meant for direct use via `<script src="...">`.
  - In-browser template compilation:
	（在浏览器模板编译选项里面：）
- **`vue.global.js`** is the "full" build that includes both the compiler and the runtime so it supports compiling templates on the fly.
		（vue.global.js是完整的build，包含了编译器compiler和运行时runtime部分，所以支持运行时编译模板。
- **`vue.runtime.global.js`** contains only the runtime and requires templates to be pre-compiled during a build step.
	     (vue.runtime.global.js只包含了运行时runtime部分，所以需要js模板提前预编译在构建的时候)
  - Inlines all Vue core internal packages - i.e. it's a single file with no dependencies on other files. This means you **must** import everything from this file and this file only to ensure you are getting the same instance of code.
	(包含了所有Vue的内部核心模块，这是一个独立的文件不依赖任何其他文件，就是说你必须从这个文件导出所有，而且这个文件确保你获得的是同样单例的代码)
  - Contains hard-coded prod/dev branches, and the prod build is pre-minified. Use the `*.prod.js` files for production.
	（包含了硬编码部分的prod/dev分支，并且prod的构建是预先压缩了的，用prod.js是为了生产环境使用的）
- **`vue(.runtime).esm-browser(.prod).js`**:
  - For usage via native ES modules imports (in browser via `<script type="module">`.
	(用来给原生支持ES modules特性的浏览器使用，`<script type="module">`即可使用)
  - Shares the same runtime compilation, dependency inlining and hard-coded prod/dev behavior with the global build.
	(共享同样的运行时编译，依赖内联和硬编码的prod/dev的全局构建中)


### With a Bundler
- **`vue(.runtime).esm-bundler.js`**:
  - For use with bundlers like `webpack`, `rollup` and `parcel`.
	(使用了构建打包器，如`webpack`，`rollup`,`parcel`)
  - Leaves prod/dev branches with `环境占位符` guards (must be replaced by bundler)
	(区分prod/dev用`环境占位符`这个变量)
  - Does not ship minified builds (to be done together with the rest of the code after bundling)
	- Imports dependencies (e.g. `@vue/runtime-core`, `@vue/runtime-compiler`)
	- Imported dependencies are also `esm-bundler` builds and will in turn import their dependencies (e.g. `@vue/runtime-core` imports `@vue/reactivity`)
		(引入这些依赖，)
	- This means you **can** install/import these deps individually without ending up with different instances of these dependencies, but you must make sure they all resolve to the same version.
		(这意味着你可以** *单独安装/导入这些deps，而不用结束这些依赖项的其他实例，但你必须确保它们都解析为相同的版本。  ------- 需要重新翻译)
	- In-browser template compilation:
- **`vue.runtime.esm-bundler.js` (default)** is runtime only, and requires all templates to be pre-compiled. This is the default entry for bundlers (via `module` field in `package.json`) because when using a bundler templates are typically pre-compiled (e.g. in `*.vue` files).
	(`vue.runtime.esm-bundler.js`只有运行时，要求所有模板必须预先编译过，bundlers的默认入口，`package.json`需要是`type:"module"`  ---- 需要重新理解)
- **`vue.esm-bundler.js`**: includes the runtime compiler. Use this if you are using a bundler but still want runtime template compilation (e.g. in-DOM templates or templates via inline JavaScript strings). You will need to configure your bundler to alias `vue` to this file.

#### Bundler Build Feature Flags

Starting with 3.0.0-rc.3, `esm-bundler` builds now exposes global feature flags that can be overwritten at compile time:
(从3.0.0-rc.3开始，`esm-bundler`的构建现在到处的全局特性标志会覆盖编译时)
- `__VUE_OPTIONS_API__` (enable/disable Options API support, default: `true`)
（`__VUE_OPTIONS_API__`, 启用API可选项，默认为`true`)
- `__VUE_PROD_DEVTOOLS__` (enable/disable devtools support in production, default: `false`)
(`__VUE_PROD_DEVTOOLS__`，启用devtools在生产环境，默认为false)

The build will work without configuring these flags, however it is **strongly recommended** to properly configure them in order to get proper tree-shaking in the final bundle. To configure these flags:
	（该构建离开这些设置也可以正常工作，然而我强烈建议正确的配置这些配置，以保证可以获得正确的tree-shaking结果，如何设置：）
- webpack: use [DefinePlugin](https://webpack.js.org/plugins/define-plugin/)
- Rollup: use [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace)
- Vite: configured by default, but can be overwritten using the [`define` option](https://github.com/vitejs/vite/blob/a4133c073e640b17276b2de6e91a6857bdf382e1/src/node/config.ts#L72-L76)
（vite是默认配置的，但是可以被`define`选项覆盖掉）

Note: the replacement value **must be boolean literals** and cannot be strings, otherwise the bundler/minifier will not be able to properly evaluate the conditions.
(你要替换的值必须是布尔值，不能是字符串，要不然bundler/minifier没法正确的计算)
### For Server-Side Rendering
（关于SSR-服务端渲染）
- **`vue.cjs(.prod).js`**:
- For use in Node.js server-side rendering via `require()`.
（在NodeJS的服务端渲染用`require()`)
- If you bundle your app with webpack with `target: 'node'` and properly externalize `vue`, this is the build that will be loaded.
(假如你用webpack打包了你的应用，用了`target: 'node'`的配置，正确的使用`vue`，那这个构建会加载成功)
- The dev/prod files are pre-built, but the appropriate file is automatically required based on `环境占位符`.
(如果dev/prod的文件被预先构建，但是仍然会根据`环境占位符`自动匹配相应的文件)


### 最后的最后， 环境占位符等于process .env .NODE_ENV