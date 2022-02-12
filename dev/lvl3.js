process.stdout.write('\x1Bc')
require('jsdom-global')('', {
  resources: 'usable',
  runScripts: 'dangerously',
  url: `https://127.0.0.1:3001`,
  pretendToBeVisual: true,
  beforeParse: (win) => {
    win.addEventListener = () => {}
    win.removeEventListener = () => {}
    localStorage = win.localStorage
  },
})
const { rxReq } = require('@aitmed/ecos-lvl2-sdk')
const { CADL, Account, store } = require('@aitmed/cadl')
const axios = require('axios')
const nock = require('nock')
const u = require('@jsmanifest/utils')

process.env.NODE_ENV = 'development'

const sdk = new CADL({
  configUrl: `https://public.aitmed.com/config/admind3.yml`,
  cadlVersion: 'test',
})

const ecos = {
  ...store.level2SDK.edgeServices,
  ...store.level2SDK.documentServices,
  ...store.level2SDK.vertexServices,
}

const utils = {
  ...store.level2SDK.Account,
  ...store.level2SDK.utilServices,
  ...store.level2SDK.commonServices,
}

const b = sdk.root.builtIn

const { decryptAES, skCheck } = b.eccNaCl

;(async () => {
  try {
    await sdk.init()
    await sdk.initPage('SignIn')
    // console.dir(sdk.root.Global, { depth: Infinity })
    const countryCode = '+1'
    const phoneNumber = `${countryCode} 8882320918`
    const password = '888666'

    const status = await Account.getStatus()
    const vcode = await Account.requestVerificationCode(phoneNumber)

    const {
      data: { edge },
    } = await Account.loginByVerificationCode(phoneNumber, vcode)

    const {
      deat: { user_id: userId, pk, esk },
    } = edge

    console.log({
      userId,
      pk,
      esk,
      vcode,
    })

    const sk = await decryptAES({ key: password, message: esk })
    const isValid = skCheck({ pk, sk })

    localStorage.setItem('sk', sk)
    localStorage.setItem('esk', esk)
    localStorage.setItem('user_id', userId)

    const vertexResp = await store.level2SDK.vertexServices.retrieveVertex({
      idList: [userId],
      options: {},
    })

    const vertex = vertexResp.data.vertex[0]
    const nameField = vertex.name

    async function retrieveMedicalRecords() {
      return store.level2SDK.documentServices.retrieveDocument({
        //
      })
    }

    /**
     * @param { object } args
     * @param { string } [args.id]
     * @param { string } [args.xfname]
     * @param { string } [args.sCondition]
     * @param { string } [args.maxcount]
     * @param { string } [args.obfname]
     * @param { number } [args._nonce]
     * @returns { Promise<any> }
     *
     * @example
     * ```js
     * const options = {
     *   id: '.Global.formData.patientHistoryInfo.id',
     *   xfname: 'eid',
     *   sCondition: 'type in (1025,1537,1793,2305,2049,84480,87040,92161,94721,107521,110081,112641,\
        115201,117761,120321,138241,143361,145921)',
          maxcount: '500',
          obfname: 'mtime',
          _nonce: '=.Global._nonce',
     * }

      createMedicalRecordDocument(options).then(console.log).catch(console.error)
     * ```
     */
    async function createMedicalRecordDocument(args) {
      return store.level2SDK.documentServices.createDocument({
        ...args,
      })
    }

    console.dir(nameField, { depth: Infinity })

    // console.dir(sdk.root.Global.formData.medicalRecords, { depth: Infinity })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    throw err
  }
})()
