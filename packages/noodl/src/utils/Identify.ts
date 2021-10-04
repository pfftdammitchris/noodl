import flowRight from 'lodash/flowRight'
import { isMap, isScalar } from 'yaml'
import type { Scalar, YAMLMap } from 'yaml'
import type { YAMLNode } from '../types/internalTypes'
import * as mapUtil from './map'
import * as scalarUtil from './scalar'
import * as seqUtil from './seq'

const composeScalarFns =
	<RT = any>(...fns: ((n: Scalar) => RT)[]) =>
	(n: YAMLNode) =>
		isScalar(n) && flowRight(...fns)(n)

const composeMapFns =
	<RT = any>(...fns: ((n: YAMLMap) => RT)[]) =>
	(n: YAMLNode) =>
		isMap(n) && flowRight(...fns)(n)

const Identify = (function () {
	const o = {
		action: {
			any: composeMapFns(mapUtil.isActionLike),
			builtIn: composeMapFns(mapUtil.isBuiltInAction),
			evalObject: composeMapFns(mapUtil.isEvalObjectAction),
			pageJump: composeMapFns(mapUtil.isPageJumpAction),
			popUp: composeMapFns(mapUtil.isPopUpAction),
			popUpDismiss: composeMapFns(mapUtil.isPopUpDismissAction),
			refresh: composeMapFns(mapUtil.isRefreshAction),
			saveObject: composeMapFns(mapUtil.isSaveObjectAction),
			updateObject: composeMapFns(mapUtil.isUpdateObjectAction),
		},
		actionChain: seqUtil.isActionChain,
		component: {
			any(v: unknown) {
				return (
					isMap(v) &&
					[mapUtil.isComponent, mapUtil.isComponentLike].some((fn) => fn(v))
				)
			},
			button: composeMapFns(mapUtil.isButtonComponent),
			divider: composeMapFns(mapUtil.isDividerComponent),
			footer: composeMapFns(mapUtil.isFooterComponent),
			header: composeMapFns(mapUtil.isHeaderComponent),
			image: composeMapFns(mapUtil.isImageComponent),
			label: composeMapFns(mapUtil.isLabelComponent),
			list: composeMapFns(mapUtil.isListComponent),
			listItem: composeMapFns(mapUtil.isListComponent),
			plugin: composeMapFns(mapUtil.isPluginComponent),
			pluginHead: composeMapFns(mapUtil.isPluginHeadComponent),
			pluginBodyTail: composeMapFns(mapUtil.isPluginBodyTailComponent),
			popUp: composeMapFns(mapUtil.isPopUpComponent),
			register: composeMapFns(mapUtil.isRegisterComponent),
			select: composeMapFns(mapUtil.isSelectComponent),
			scrollView: composeMapFns(mapUtil.isScrollViewComponent),
			textField: composeMapFns(mapUtil.isTextFieldComponent),
			textView: composeMapFns(mapUtil.isTextViewComponent),
			video: composeMapFns(mapUtil.isVideoComponent),
			view: composeMapFns(mapUtil.isViewComponent),
		},
		boolean: composeScalarFns(scalarUtil.isBoolean),
		booleanTrue: composeScalarFns(scalarUtil.isBooleanTrue),
		booleanFalse: composeScalarFns(scalarUtil.isBooleanFalse),
		continue: composeScalarFns(scalarUtil.isContinue),
		reference: composeScalarFns(scalarUtil.isReference),
		evalReference: composeScalarFns(scalarUtil.isEvalReference),
		localReference: composeScalarFns(scalarUtil.isLocalReference),
		// applyReference: composeScalarFns(scalarUtil.isApplyReference),
		rootReference: composeScalarFns(scalarUtil.isRootReference),
		traverseReference: composeScalarFns(scalarUtil.isTraverseReference),
		emit: composeMapFns(mapUtil.isEmitObject),
		goto: composeMapFns(mapUtil.isGotoObject),
		if: composeMapFns(mapUtil.isIfObject),
		init: composeMapFns(mapUtil.isInitObject),
		toast: composeMapFns(mapUtil.isToastObject),
	}

	return o
})()

export default Identify
