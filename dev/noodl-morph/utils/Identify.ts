import * as mapUtil from './map'
import * as scalarUtil from './scalar'
import * as seqUtil from './seq'
import * as d from '../../../src/utils/doc'

const Identify = (function () {
	const o = {
		action: {
			any: d.composeMapFns(mapUtil.isActionLike),
			builtIn: d.composeMapFns(mapUtil.isBuiltInAction),
			evalObject: d.composeMapFns(mapUtil.isEvalObjectAction),
			pageJump: d.composeMapFns(mapUtil.isPageJumpAction),
			popUp: d.composeMapFns(mapUtil.isPopUpAction),
			popUpDismiss: d.composeMapFns(mapUtil.isPopUpDismissAction),
			refresh: d.composeMapFns(mapUtil.isRefreshAction),
			saveObject: d.composeMapFns(mapUtil.isSaveObjectAction),
			updateObject: d.composeMapFns(mapUtil.isUpdateObjectAction),
		},
		actionChain: seqUtil.isActionChain,
		component: {
			any(v: unknown) {
				return (
					d.isYAMLMap(v) &&
					[mapUtil.isComponent, mapUtil.isComponentLike].some((fn) => fn(v))
				)
			},
			button: d.composeMapFns(mapUtil.isButtonComponent),
			divider: d.composeMapFns(mapUtil.isDividerComponent),
			footer: d.composeMapFns(mapUtil.isFooterComponent),
			header: d.composeMapFns(mapUtil.isHeaderComponent),
			image: d.composeMapFns(mapUtil.isImageComponent),
			label: d.composeMapFns(mapUtil.isLabelComponent),
			list: d.composeMapFns(mapUtil.isListComponent),
			listItem: d.composeMapFns(mapUtil.isListComponent),
			plugin: d.composeMapFns(mapUtil.isPluginComponent),
			pluginHead: d.composeMapFns(mapUtil.isPluginHeadComponent),
			pluginBodyTail: d.composeMapFns(mapUtil.isPluginBodyTailComponent),
			popUp: d.composeMapFns(mapUtil.isPopUpComponent),
			register: d.composeMapFns(mapUtil.isRegisterComponent),
			select: d.composeMapFns(mapUtil.isSelectComponent),
			scrollView: d.composeMapFns(mapUtil.isScrollViewComponent),
			textField: d.composeMapFns(mapUtil.isTextFieldComponent),
			textView: d.composeMapFns(mapUtil.isTextViewComponent),
			video: d.composeMapFns(mapUtil.isVideoComponent),
			view: d.composeMapFns(mapUtil.isViewComponent),
		},
		boolean: d.composeScalarFns(scalarUtil.isBoolean),
		booleanTrue: d.composeScalarFns(scalarUtil.isBooleanTrue),
		booleanFalse: d.composeScalarFns(scalarUtil.isBooleanFalse),
		continue: d.composeScalarFns(scalarUtil.isContinue),
		reference: d.composeScalarFns(scalarUtil.isReference),
		evalReference: d.composeScalarFns(scalarUtil.isEvalReference),
		localReference: d.composeScalarFns(scalarUtil.isLocalReference),
		applyReference: d.composeScalarFns(scalarUtil.isApplyReference),
		rootReference: d.composeScalarFns(scalarUtil.isRootReference),
		traverseReference: d.composeScalarFns(scalarUtil.isTraverseReference),
		emit: d.composeMapFns(mapUtil.isEmitObject),
		goto: d.composeMapFns(mapUtil.isGotoObject),
		if: d.composeMapFns(mapUtil.isIfObject),
		init: d.composeMapFns(mapUtil.isInitObject),
		toast: d.composeMapFns(mapUtil.isToastObject),
	}

	return o
})()

export default Identify
