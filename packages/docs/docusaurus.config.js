/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
	title: 'noodl-cli-docs',
	tagline: 'Documentation',
	url: 'https://github.com/pfftdammitchris/noodl-cli-docs/',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'aitmed', // Usually your GitHub org/user name.
	projectName: 'noodl-cli-docs', // Usually your repo name.
	themeConfig: {
		navbar: {
			title: 'noodl-cli-docs',
			logo: {
				alt: 'Logo',
				src: 'img/logo.png',
			},
			items: [
				{
					position: 'left',
					label: 'Usage',
				},
				{
					href: 'https://www.aitmed.com',
					label: 'Website',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Usage',
					items: [
						{
							label: 'Usage',
							to: '/docs/usage',
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} noodl-cli documentation`,
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					// Please change this to your repo.
					editUrl: 'https://github.com/pfftdammitchris/noodl-cli-docs/',
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			},
		],
	],
}
