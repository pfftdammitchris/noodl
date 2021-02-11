import { expect } from 'chai'
import CliConfig from './CliConfig'

let cliConfig: CliConfig

beforeEach(() => {
	cliConfig = new CliConfig()
})

describe(`server`, () => {
	it(`should return the full url`, () => {
		expect(cliConfig.serverUrl).to.eq('http://127.0.0.1:3000')
	})
})
