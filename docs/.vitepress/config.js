module.exports = {
	title: "四十岁男人的技术新生",// 网站标题
	description: '我的vitepress技術博客.', //网站描述
	base: '/', //  部署时的路径 默认 /  可以使用二级地址 /base/
	// lang: 'en-US', //语言
	repo: 'vuejs/vitepress',
	head: [
		// 改变title的图标
		[
			'link',
			{
				rel: 'icon',
				href: '/img/linktolink.png',//图片放在public文件夹下
			},
		],
	],
	// 主题配置
	themeConfig: {
		//   头部导航
		nav: [
			{ text: '首页', link: '/' },
			{ text: '关于', link: '/about/' },
		],
		sidebar: [
			{
				text: 'Vue3源代码解析', link: '/vue3/', children: [
					{ text: '核心模块及API', link: '/vue3/core' },
					{ text: 'AST-抽象语法树', link: '/vue3/ast' },
					{ text: 'vue的README翻译', link: '/vue3/readme-trans' }
				]
			},
			{
				text: 'Ghost博客',
				link: '/ghost/',
				collapsable: true,
				children: [
					{ text: '2016-03-11', link: '/ghost/2016-03-11' },
					{ text: '2017-02-06', link: '/ghost/2017-02-06' },
					{ text: '2019-06-16', link: '/ghost/2019-06-16' },
					{ text: '2019-06-16-2', link: '/ghost/2019-06-16-2' },
					{ text: '2019-11-10', link: '/ghost/2019-11-10' },
					{ text: '2021-01-11', link: '/ghost/2021-01-11' },
					{ text: '2021-03-11', link: '/ghost/2021-03-11' },
					{ text: '2021-09-19', link: '/ghost/2021-09-19' },
				]
			}

		]
	}
}