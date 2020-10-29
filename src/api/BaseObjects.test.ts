import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { expect } from 'chai'
import BaseObjects from './BaseObjects'

let base: BaseObjects

const axiosMock = new MockAdapter(axios)

beforeEach(() => {
	base = new BaseObjects({
		env: 'test',
		endpoint: 'https://public.aitmed.com/config/meet2d.yml',
	})
})

afterEach(() => {
	axiosMock.reset()
})

describe('BaseObjects', () => {
	describe('init', () => {
		it('should set the root config', async () => {
			axiosMock.onGet(/public\.aitmed\.com\/config\//i).reply(
				200,
				`
        web:
          cadlVersion:
            stable: 0.1
            test: 0.1
        cadlBaseUrl: https://s3.us-east-2.amazonaws.com/public.aitmed.com/cadl/aitmedmeeting2Dev_\${cadlVersion}/
        cadlMain: cadlEndpoint.yml
        `,
			)
			axiosMock.onGet(/cadlEndpoint\.yml/i).reply(
				200,
				`
          baseUrl: \${cadlBaseUrl}
          assetsUrl: \${cadlBaseUrl}assets/
          languageSuffix:
            zh_CN : _cn
          fileSuffix: .yml
          startPage: SignIn
          preload:
            - BasePage  
            - BaseCSS
            - BaseDataModel
          page:
            - Welcome         # page1   /
            - SignIn           # page3  page45 /
        `,
			)
			await base.init()
			expect(base.rootConfig).to.exist
			expect(base.appConfig).to.exist
			expect(base.version).to.equal(0.1)
			expect(base.appBaseUrl).to.exist
			expect(base.appEndpoint).to.exist
			expect(base.baseUrl).to.exist
			expect(base.endpoint).to.exist
			expect(base.env).to.exist
		})
	})
})
