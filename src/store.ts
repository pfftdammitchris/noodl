import ConfigStore from 'configstore'

const store = new ConfigStore('noodl-cli', undefined, {
	globalConfigPath: true,
})

export default store
