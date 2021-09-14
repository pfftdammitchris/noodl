import { action, component } from 'noodl-types';
import { isMap, isSeq } from 'yaml';
/* -------------------------------------------------------
    ---- ACTIONS
-------------------------------------------------------- */
export function isActionLike(node) {
    return node.has('actionType');
}
export function isBuiltInAction(node) {
    return hasActionTypeEqualTo(node, action.BUILTIN);
}
export function isEvalObjectAction(node) {
    return hasActionTypeEqualTo(node, action.EVALOBJECT);
}
export function isPageJumpAction(node) {
    return hasActionTypeEqualTo(node, action.PAGEJUMP);
}
export function isPopUpAction(node) {
    return hasActionTypeEqualTo(node, action.POPUP);
}
export function isPopUpDismissAction(node) {
    return hasActionTypeEqualTo(node, action.POPUPDISMISS);
}
export function isRefreshAction(node) {
    return hasActionTypeEqualTo(node, action.REFRESH);
}
export function isSaveObjectAction(node) {
    return hasActionTypeEqualTo(node, action.SAVEOBJECT);
}
export function isUpdateObjectAction(node) {
    return hasActionTypeEqualTo(node, action.UPDATEOBJECT);
}
/* -------------------------------------------------------
    ---- COMPONENTS
-------------------------------------------------------- */
export function isComponentLike(node) {
    if (!node.has('type'))
        return false;
    if (isMap(node.get('style')))
        return true;
    if (isSeq(node.get('children')))
        return true;
    return false;
}
export const isComponent = (function () {
    const componentTypes = Object.values(component);
    return (node) => {
        const type = node.get('type');
        return typeof type === 'string'
            ? componentTypes.includes(type)
            : false;
    };
})();
export function isButtonComponent(node) {
    return hasComponentTypeEqualTo(node, component.BUTTON);
}
export function isDividerComponent(node) {
    return hasComponentTypeEqualTo(node, component.DIVIDER);
}
export function isFooterComponent(node) {
    return hasComponentTypeEqualTo(node, component.FOOTER);
}
export function isHeaderComponent(node) {
    return hasComponentTypeEqualTo(node, component.HEADER);
}
export function isImageComponent(node) {
    return hasComponentTypeEqualTo(node, component.IMAGE);
}
export function isLabelComponent(node) {
    return hasComponentTypeEqualTo(node, component.LABEL);
}
export function isListComponent(node) {
    return hasComponentTypeEqualTo(node, component.LIST);
}
export function isListItemComponent(node) {
    return hasComponentTypeEqualTo(node, component.LISTITEM);
}
export function isPluginComponent(node) {
    return hasComponentTypeEqualTo(node, component.PLUGIN);
}
export function isPluginHeadComponent(node) {
    return hasComponentTypeEqualTo(node, component.PLUGINHEAD);
}
export function isPluginBodyTailComponent(node) {
    return hasComponentTypeEqualTo(node, component.PLUGINBODYTAIL);
}
export function isPopUpComponent(node) {
    return hasComponentTypeEqualTo(node, component.POPUP);
}
export function isRegisterComponent(node) {
    return hasComponentTypeEqualTo(node, component.REGISTER);
}
export function isSelectComponent(node) {
    return hasComponentTypeEqualTo(node, component.SELECT);
}
export function isScrollViewComponent(node) {
    return hasComponentTypeEqualTo(node, component.SCROLLVIEW);
}
export function isTextFieldComponent(node) {
    return hasComponentTypeEqualTo(node, component.TEXTFIELD);
}
export function isTextViewComponent(node) {
    return hasComponentTypeEqualTo(node, component.TEXTVIEW);
}
export function isVideoComponent(node) {
    return hasComponentTypeEqualTo(node, component.VIDEO);
}
export function isViewComponent(node) {
    return hasComponentTypeEqualTo(node, component.VIEW);
}
/* -------------------------------------------------------
    ---- OTHER
-------------------------------------------------------- */
export function hasActionTypeEqualTo(node, value) {
    return node.get('actionType') === value;
}
export function hasComponentTypeEqualTo(node, value) {
    return node.get('type') === value;
}
export function isEmitObject(node) {
    return node.has('emit');
}
export function isGotoObject(node) {
    return node.has('goto');
}
export function isIfObject(node) {
    return node.has('if');
}
export function isInitObject(node) {
    return node.has('init');
}
export function isToastObject(node) {
    return node.has('toast');
}
//# sourceMappingURL=map.js.map