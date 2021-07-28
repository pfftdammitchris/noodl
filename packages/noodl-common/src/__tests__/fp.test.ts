import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import path from 'path'
import yaml from 'yaml'
import fs from 'fs-extra'
import assign from '../fp/assign'
import entries from '../fp/entries'
import toString from '../fp/toString'
import * as nc from '..'

describe.only(nc.coolGold('fp'), () => {
	describe(nc.italic(`Array -> YAMLSeq`), () => {
		xit(`should behave like Array.concat`, () => {})
		xit(`should behave like Array.every`, () => {})
		xit(`should behave like Array.fill`, () => {})
		xit(`should behave like Array.filter`, () => {})
		xit(`should behave like Array.find`, () => {})
		xit(`should behave like Array.findIndex`, () => {})
		xit(`should behave like Array.forEach`, () => {})
		xit(`should behave like Array.from`, () => {})
		xit(`should behave like Array.includes`, () => {})
		xit(`should behave like Array.indexOf`, () => {})
		xit(`should behave like Array.isArray`, () => {})
		xit(`should behave like Array.join`, () => {})
		xit(`should behave like Array.lastIndexOf`, () => {})
		xit(`should behave like Array.map`, () => {})
		xit(`should behave like Array.pop`, () => {})
		xit(`should behave like Array.push`, () => {})
		xit(`should behave like Array.reduce`, () => {})
		xit(`should behave like Array.reduceRight`, () => {})
		xit(`should behave like Array.reverse`, () => {})
		xit(`should behave like Array.shift`, () => {})
		xit(`should behave like Array.slice`, () => {})
		xit(`should behave like Array.some`, () => {})
		xit(`should behave like Array.splice`, () => {})
		xit(`should behave like Array.unshift`, () => {})
	})

	describe(nc.italic(`Number -> Scalar`), () => {
		it(`should behave like Number.isFinite`, () => {})
		it(`should behave like Number.isInteger`, () => {})
		it(`should behave like Number.isNaN`, () => {})
		it(`should behave like Number.toFixed`, () => {})
		it(`should behave like Number.toLocaleString`, () => {})
		it(`should behave like Number.toPrecision`, () => {})
		it(`should behave like Number.toString`, () => {})
	})

	describe(nc.italic(`Object -> YAMLMap`), () => {
		xit(`should behave like Object.assign`, () => {})
		xit(`should behave like Object.entries`, () => {})
		xit(`should behave like Object.keys`, () => {})
		xit(`should behave like Object.values`, () => {})
	})

	describe(nc.italic(`String -> Scalar`), () => {
		xit(`should behave like String.charAt`, () => {})
		xit(`should behave like String.charCodeAt`, () => {})
		xit(`should behave like String.concat`, () => {})
		xit(`should behave like String.endsWith`, () => {})
		xit(`should behave like String.fromCharCode`, () => {})
		xit(`should behave like String.includes`, () => {})
		xit(`should behave like String.indexOf`, () => {})
		xit(`should behave like String.lastIndexOf`, () => {})
		xit(`should behave like String.match`, () => {})
		xit(`should behave like String.repeat`, () => {})
		xit(`should behave like String.replace`, () => {})
		xit(`should behave like String.search`, () => {})
		xit(`should behave like String.slice`, () => {})
		xit(`should behave like String.split`, () => {})
		xit(`should behave like String.startsWith`, () => {})
		xit(`should behave like String.substr`, () => {})
		xit(`should behave like String.substring`, () => {})
		xit(`should behave like String.toLocaleLowerCase`, () => {})
		xit(`should behave like String.toLocaleUpperCase`, () => {})
		xit(`should behave like String.toString`, () => {})
		xit(`should behave like String.toUpperCase`, () => {})
		xit(`should behave like String.trim`, () => {})
	})
})
