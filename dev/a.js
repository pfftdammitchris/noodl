process.stdout.write('\x1Bc')
const axios = require('axios')
const assert = require('assert')
const curry = require('lodash/curry')
const u = require('@jsmanifest/utils')
const fs = require('fs-extra')
const path = require('path')
const y = require('yaml')

function isActionObject(value) {
  return
}

//
;(async () => {
  try {
    // const resp = await axios.get(
    //   `https://admind.aitmed.io/index.html?SelectOrganization-ScheduleManagement`,
    // )

    // const resp = await axios.get(
    //   `https://admind.aitmed.io/main.1554818e01da40369b9b.js`,
    // )
    const rootObject = await fs.readJson(
      path.join(__dirname, '../generated/admind._root.json'),
    )

    // const rootAsYml = y.stringify(rootObject, {
    //   doubleQuotedAsJSON: true,
    //   logLevel: 'debug',
    // })

    // const rootDoc = y.parseDocument(rootAsYml, { logLevel: 'debug' })

    const SignInYml = await fs.readFile(
      path.join(__dirname, '../generated/admind3/SignIn.yml'),
      'utf8',
    )

    const signInPageObject = y.parse(SignInYml)

    /**
     * @typedef VisitFn
     * @type { (key: string | number, value: any, parent?: null | Record<string, any>) => any }
     */

    const visitorFactory = curry(
      /**
       * @param { VisitFn } cb
       * @param { any } obj
       */
      function visit(cb, obj) {
        if (u.isArr(obj)) {
          obj.forEach((item, index) => {
            cb(index, item, obj)
            visit(cb, item)
          })
        } else if (u.isObj(obj)) {
          u.entries(obj).forEach(([key, value]) => {
            cb(key, value, obj)
            visit(cb, value)
          })
        } else {
          cb(null, obj)
        }
      },
    )

    visitorFactory((key, value, parent) => {
      if (value === undefined) {
        // value is not an array/object
        console.log({ key })
      } else {
        if (u.isArr(value)) {
          //
        } else if (u.isObj(value)) {
          //
        } else {
          //
        }
      }
    }, rootObject)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.log(err)
    // console.error(`[${u.yellow(err.name)}]: ${u.red(err.message)}`, err.stack)
    // throw err
  }
})()

function validatorFactory() {
  return function createValidator(options) {
    return {
      validate() {},
    }
  }
}
