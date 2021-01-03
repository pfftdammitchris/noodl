/// <reference types="chai" />

declare module Chai {
	export interface TypeComparison {
		action: Assertion
		borderStyleObject: Assertion
		component: Assertion
		emitObject: Assertion
		gotoObject: Assertion
		styleObject: Assertion
	}
}
