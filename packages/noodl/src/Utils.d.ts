import { Node, Scalar, YAMLMap, YAMLSeq } from 'yaml';
import NoodlRoot from './Root';
import NoodlPage from './Page';
import * as commonUtils from './utils/index';
import * as T from './types';
declare class NoodlUtils implements T.InternalComposerBaseArgs {
    #private;
    constructor({ pages, root }: T.InternalComposerBaseArgs);
    get pages(): T.Pages;
    get root(): NoodlRoot<"yml", "list">;
    get common(): Pick<typeof commonUtils, "endsWith" | "startsWith" | "getScalarValue" | "isBoolean" | "isBooleanTrue" | "isBooleanFalse" | "isContinue" | "isNumber" | "isString" | "isReference" | "isLocalReference" | "isRootReference" | "isEvalReference" | "isTraverseReference" | "getPreparedKeyForDereference" | "isApplyReference" | "isActionLike" | "isBuiltInAction" | "isEvalObjectAction" | "isPageJumpAction" | "isPopUpAction" | "isPopUpDismissAction" | "isRefreshAction" | "isSaveObjectAction" | "isUpdateObjectAction" | "isComponentLike" | "isButtonComponent" | "isDividerComponent" | "isFooterComponent" | "isHeaderComponent" | "isImageComponent" | "isLabelComponent" | "isListComponent" | "isListItemComponent" | "isPluginComponent" | "isPluginHeadComponent" | "isPluginBodyTailComponent" | "isPopUpComponent" | "isRegisterComponent" | "isSelectComponent" | "isScrollViewComponent" | "isTextFieldComponent" | "isTextViewComponent" | "isVideoComponent" | "isViewComponent" | "hasActionTypeEqualTo" | "hasComponentTypeEqualTo" | "isEmitObject" | "isGotoObject" | "isIfObject" | "isInitObject" | "isToastObject" | "isComponent" | "isActionChain">;
    get Identify(): {
        action: {
            any: (n: T.YAMLNode) => any;
            builtIn: (n: T.YAMLNode) => any;
            evalObject: (n: T.YAMLNode) => any;
            pageJump: (n: T.YAMLNode) => any;
            popUp: (n: T.YAMLNode) => any;
            popUpDismiss: (n: T.YAMLNode) => any;
            refresh: (n: T.YAMLNode) => any;
            saveObject: (n: T.YAMLNode) => any;
            updateObject: (n: T.YAMLNode) => any;
        };
        actionChain: typeof commonUtils.isActionChain;
        component: {
            any(v: unknown): boolean;
            button: (n: T.YAMLNode) => any;
            divider: (n: T.YAMLNode) => any;
            footer: (n: T.YAMLNode) => any;
            header: (n: T.YAMLNode) => any;
            image: (n: T.YAMLNode) => any;
            label: (n: T.YAMLNode) => any;
            list: (n: T.YAMLNode) => any;
            listItem: (n: T.YAMLNode) => any;
            plugin: (n: T.YAMLNode) => any;
            pluginHead: (n: T.YAMLNode) => any;
            pluginBodyTail: (n: T.YAMLNode) => any;
            popUp: (n: T.YAMLNode) => any;
            register: (n: T.YAMLNode) => any;
            select: (n: T.YAMLNode) => any;
            scrollView: (n: T.YAMLNode) => any;
            textField: (n: T.YAMLNode) => any;
            textView: (n: T.YAMLNode) => any;
            video: (n: T.YAMLNode) => any;
            view: (n: T.YAMLNode) => any;
        };
        boolean: (n: T.YAMLNode) => any;
        booleanTrue: (n: T.YAMLNode) => any;
        booleanFalse: (n: T.YAMLNode) => any;
        continue: (n: T.YAMLNode) => any;
        reference: (n: T.YAMLNode) => any;
        evalReference: (n: T.YAMLNode) => any;
        localReference: (n: T.YAMLNode) => any;
        rootReference: (n: T.YAMLNode) => any;
        traverseReference: (n: T.YAMLNode) => any;
        emit: (n: T.YAMLNode) => any;
        goto: (n: T.YAMLNode) => any;
        if: (n: T.YAMLNode) => any;
        init: (n: T.YAMLNode) => any;
        toast: (n: T.YAMLNode) => any;
    };
    canUseGetIn(node: any): node is YAMLMap | YAMLSeq | NoodlPage | NoodlRoot;
    findPage(node: Node): null | NoodlPage;
    getValueFromRoot(node: string | Scalar): any;
    isRootReference(node: string | Scalar): boolean;
}
export default NoodlUtils;
