const execa = require('execa')

const shell = execa(
	'noodl',
	['--config', 'meet4d', '--generate', 'app', '--local'],
	{
		shell: true,
		stdio: 'inherit',
	},
)
