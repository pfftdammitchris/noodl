"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isToastObject = exports.isInitObject = exports.isIfObject = exports.isGotoObject = exports.isEmitObject = exports.hasComponentTypeEqualTo = exports.hasActionTypeEqualTo = exports.isViewComponent = exports.isVideoComponent = exports.isTextViewComponent = exports.isTextFieldComponent = exports.isScrollViewComponent = exports.isSelectComponent = exports.isRegisterComponent = exports.isPopUpComponent = exports.isPluginBodyTailComponent = exports.isPluginHeadComponent = exports.isPluginComponent = exports.isListItemComponent = exports.isListComponent = exports.isLabelComponent = exports.isImageComponent = exports.isHeaderComponent = exports.isFooterComponent = exports.isDividerComponent = exports.isButtonComponent = exports.isComponent = exports.isComponentLike = exports.isUpdateObjectAction = exports.isSaveObjectAction = exports.isRefreshAction = exports.isPopUpDismissAction = exports.isPopUpAction = exports.isPageJumpAction = exports.isEvalObjectAction = exports.isBuiltInAction = exports.isActionLike = void 0;
const noodl_types_1 = require("noodl-types");
const yaml_1 = require("yaml");
/* -------------------------------------------------------
    ---- ACTIONS
-------------------------------------------------------- */
function isActionLike(node) {
    return node.has('actionType');
}
exports.isActionLike = isActionLike;
function isBuiltInAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.BUILTIN);
}
exports.isBuiltInAction = isBuiltInAction;
function isEvalObjectAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.EVALOBJECT);
}
exports.isEvalObjectAction = isEvalObjectAction;
function isPageJumpAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.PAGEJUMP);
}
exports.isPageJumpAction = isPageJumpAction;
function isPopUpAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.POPUP);
}
exports.isPopUpAction = isPopUpAction;
function isPopUpDismissAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.POPUPDISMISS);
}
exports.isPopUpDismissAction = isPopUpDismissAction;
function isRefreshAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.REFRESH);
}
exports.isRefreshAction = isRefreshAction;
function isSaveObjectAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.SAVEOBJECT);
}
exports.isSaveObjectAction = isSaveObjectAction;
function isUpdateObjectAction(node) {
    return hasActionTypeEqualTo(node, noodl_types_1.action.UPDATEOBJECT);
}
exports.isUpdateObjectAction = isUpdateObjectAction;
/* -------------------------------------------------------
    ---- COMPONENTS
-------------------------------------------------------- */
function isComponentLike(node) {
    if (!node.has('type'))
        return false;
    if (yaml_1.isMap(node.get('style')))
        return true;
    if (yaml_1.isSeq(node.get('children')))
        return true;
    return false;
}
exports.isComponentLike = isComponentLike;
exports.isComponent = (function () {
    const componentTypes = Object.values(noodl_types_1.component);
    return (node) => {
        const type = node.get('type');
        return typeof type === 'string'
            ? componentTypes.includes(type)
            : false;
    };
})();
function isButtonComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.BUTTON);
}
exports.isButtonComponent = isButtonComponent;
function isDividerComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.DIVIDER);
}
exports.isDividerComponent = isDividerComponent;
function isFooterComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.FOOTER);
}
exports.isFooterComponent = isFooterComponent;
function isHeaderComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.HEADER);
}
exports.isHeaderComponent = isHeaderComponent;
function isImageComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.IMAGE);
}
exports.isImageComponent = isImageComponent;
function isLabelComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.LABEL);
}
exports.isLabelComponent = isLabelComponent;
function isListComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.LIST);
}
exports.isListComponent = isListComponent;
function isListItemComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.LISTITEM);
}
exports.isListItemComponent = isListItemComponent;
function isPluginComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.PLUGIN);
}
exports.isPluginComponent = isPluginComponent;
function isPluginHeadComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.PLUGINHEAD);
}
exports.isPluginHeadComponent = isPluginHeadComponent;
function isPluginBodyTailComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.PLUGINBODYTAIL);
}
exports.isPluginBodyTailComponent = isPluginBodyTailComponent;
function isPopUpComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.POPUP);
}
exports.isPopUpComponent = isPopUpComponent;
function isRegisterComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.REGISTER);
}
exports.isRegisterComponent = isRegisterComponent;
function isSelectComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.SELECT);
}
exports.isSelectComponent = isSelectComponent;
function isScrollViewComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.SCROLLVIEW);
}
exports.isScrollViewComponent = isScrollViewComponent;
function isTextFieldComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.TEXTFIELD);
}
exports.isTextFieldComponent = isTextFieldComponent;
function isTextViewComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.TEXTVIEW);
}
exports.isTextViewComponent = isTextViewComponent;
function isVideoComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.VIDEO);
}
exports.isVideoComponent = isVideoComponent;
function isViewComponent(node) {
    return hasComponentTypeEqualTo(node, noodl_types_1.component.VIEW);
}
exports.isViewComponent = isViewComponent;
/* -------------------------------------------------------
    ---- OTHER
-------------------------------------------------------- */
function hasActionTypeEqualTo(node, value) {
    return node.get('actionType') === value;
}
exports.hasActionTypeEqualTo = hasActionTypeEqualTo;
function hasComponentTypeEqualTo(node, value) {
    return node.get('type') === value;
}
exports.hasComponentTypeEqualTo = hasComponentTypeEqualTo;
function isEmitObject(node) {
    return node.has('emit');
}
exports.isEmitObject = isEmitObject;
function isGotoObject(node) {
    return node.has('goto');
}
exports.isGotoObject = isGotoObject;
function isIfObject(node) {
    return node.has('if');
}
exports.isIfObject = isIfObject;
function isInitObject(node) {
    return node.has('init');
}
exports.isInitObject = isInitObject;
function isToastObject(node) {
    return node.has('toast');
}
exports.isToastObject = isToastObject;
//# sourceMappingURL=map.js.map