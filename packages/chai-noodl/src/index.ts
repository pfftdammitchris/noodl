///<reference path='./global.d.ts' />
import Chai from 'chai'
import { identify } from 'noodl-types'
import { actionTypes, componentTypes } from 'noodl-utils'

const ChaiNoodlDom = function (chai: Chai.ChaiStatic, utils: typeof chai.util) {
	const Assertion = chai.Assertion

	utils.addProperty(Assertion.prototype, 'action', function () {
		this.assert(
			identify.action.any(this._obj),
			'expected #{this} to be an action object',
			'expected #{this} to not be an action object',
			'abc',
		)
	})

	actionTypes.forEach((action) => {
		utils.addProperty(Assertion.prototype, `${action}Action`, function () {
			this.assert(
				identify.action[action](this._obj),
				`expected #{this} to be a ${action} action #{exp}`,
				`expected #{this} to not be a ${action} action`,
				'abc',
			)
		})
	})

	componentTypes.forEach((component) => {
		utils.addProperty(
			Assertion.prototype,
			`${component}Component`,
			function () {
				this.assert(
					identify.component[component](this._obj),
					`expected #{this} to be a ${component} component`,
					`expected #{this} to not be a ${component} component`,
					'',
				)
			},
		)
	})

	utils.addProperty(Assertion.prototype, 'emitObject', function () {
		this.assert(
			identify.emit(this._obj),
			`expected #{this} to be an emit object`,
			`expected #{this} to not be an emit object`,
			'',
		)
	})

	utils.addProperty(Assertion.prototype, 'gotoObject', function () {
		this.assert(
			identify.gotoObject(this._obj),
			`expected #{this} to be a goto object`,
			`expected #{this} to not be a goto object`,
			'',
		)
	})

	utils.addProperty(Assertion.prototype, 'styleObject', function () {
		this.assert(
			identify.style.any(this._obj),
			`expected #{this} to be a style object`,
			`expected #{this} to not be a style object`,
			'',
		)
	})

	utils.addProperty(Assertion.prototype, 'borderStyleObject', function () {
		this.assert(
			identify.style.border(this._obj),
			`expected #{this} to be a border style object`,
			`expected #{this} to not be a border style object`,
			'',
		)
	})
}

export default ChaiNoodlDom
