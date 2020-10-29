import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { expect } from 'chai'
import BaseObjects from './BaseObjects'
import AppObjects from './AppObjects'

let app: AppObjects

const axiosMock = new MockAdapter(axios)

beforeEach(() => {})

afterEach(() => {
	axiosMock.reset()
})

describe('AppObjects', () => {
	describe('createUrl', () => {
		it('should create the url correctly', async () => {
			const base = new BaseObjects({
				env: 'test',
				endpoint: 'https://public.aitmed.com/config/meet2d.yml',
			})
			axiosMock.onGet(/public\.aitmed\.com\/config\//i).reply(
				200,
				`
        web:
          cadlVersion:
            stable: 0.1
            test: 0.1
        cadlBaseUrl: https://s3.us-east-2.amazonaws.com/public.aitmed.com/cadl/aitmedmeeting2Dev_\${cadlVersion}/
        cadlMain: cadlEndpoint.yml`,
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
			console.log(base.appConfig)
			// const app = new AppObjects(base.appConfig)
			// expect(app.createUrl('SignIn')).to.equal('')
		})
	})

	xdescribe('init', () => {
		it('should fetch the page objects', async () => {
			axiosMock.onGet(/Welcome/i).reply(
				200,
				`
      Welcome:
        pageNumber: "10"
        components:
          - type: view
            style:
              left: "0."
              top: "0"
              width: "1"
              height: "1"
              backgroundColor: "0x69ba94"
      `,
			)
			axiosMock.onGet(/SignIn/i).reply(
				200,
				`
      SignIn:
        pageNumber: "30"
        init:
          - if :
            - =.Global.currentUser.vertex.sk #.builtIn.SignInOk
            - goto: MeetingRoomInvited
            - continue
      `,
			)
			await app.init()
			expect(app.get('Welcome')).to.exist
			expect(app.get('SignIn')).to.exist
		})
	})
})

function getConfig() {
	return {
		baseUrl: '${cadlBaseUrl}',
		assetsUrl: '${cadlBaseUrl}assets/',
		languageSuffix: { zh_CN: '_cn' },
		fileSuffix: '.yml',
		startPage: 'SignIn',
		preload: ['BasePage', 'BaseCSS', 'BaseDataModel'],
		page: ['Welcome', 'SignIn'],
	}
}
