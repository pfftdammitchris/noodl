"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flowRight_1 = require("lodash/flowRight");
const yaml_1 = require("yaml");
const mapUtil = require("./map");
const scalarUtil = require("./scalar");
const seqUtil = require("./seq");
const composeScalarFns = (...fns) => (n) => yaml_1.isScalar(n) && flowRight_1.default(...fns)(n);
const composeMapFns = (...fns) => (n) => yaml_1.isMap(n) && flowRight_1.default(...fns)(n);
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
            any(v) {
                return (yaml_1.isMap(v) &&
                    [mapUtil.isComponent, mapUtil.isComponentLike].some((fn) => fn(v)));
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
    };
    return o;
})();
exports.default = Identify;
//# sourceMappingURL=Identify.js.map