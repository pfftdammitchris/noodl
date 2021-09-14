import { componentTypes } from './_internal/constants';
import isAwaitReference from './utils/isAwaitReference';
import isEvalReference from './utils/isEvalReference';
import isEvalLocalReference from './utils/isEvalLocalReference';
import isEvalRootReference from './utils/isEvalRootReference';
import isLocalReference from './utils/isLocalReference';
import isRootReference from './utils/isRootReference';
import isTildeReference from './utils/isTildeReference';
import isTraverseReference from './utils/isTraverseReference';
import * as i from './_internal/index';
function createIdentifier(pred) {
    return function (fn) {
        return function (v) {
            // @ts-expect-error
            return pred(v) ? fn(v) : undefined;
        };
    };
}
const identifyArr = createIdentifier(i.isArr);
const identifyNum = createIdentifier(i.isNum);
const identifyObj = createIdentifier(i.isObj);
const identifyStr = createIdentifier(i.isStr);
export const Identify = (function () {
    const composeSomes = (...fns) => (arg) => fns.some((fn) => fn(arg));
    const o = {
        rootConfig: identifyObj((v) => ['apiHost', 'apiPort'].every((key) => key in v)),
        appConfig: identifyObj((v) => ['startPage'].every((key) => key in v)),
        action: {
            any: identifyObj((v) => 'actionType' in v),
            builtIn: identifyObj((v) => 'funcName' in v || v.actionType === 'builtIn'),
            evalObject: identifyObj((v) => v.actionType === 'evalObject'),
            openCamera: identifyObj((v) => v.actionType === 'openCamera'),
            openPhotoLibrary: identifyObj((v) => v.actionType === 'openPhotoLibrary'),
            openDocumentManager: identifyObj((v) => v.actionType === 'openDocumentManager'),
            pageJump: identifyObj((v) => v.actionType === 'pageJump'),
            popUp: identifyObj((v) => v.actionType === 'popUp'),
            popUpDismiss: identifyObj((v) => v.actionType === 'popUpDismiss'),
            refresh: identifyObj((v) => v.actionType === 'refresh'),
            removeSignature: identifyObj((v) => v.actionType === 'removeSignature'),
            saveObject: identifyObj((v) => v.actionType === 'saveObject'),
            saveSignature: identifyObj((v) => v.actionType === 'saveSignature'),
            updateObject: identifyObj((v) => v.actionType === 'updateObject'),
        },
        actionChain(v) {
            return (i.isObj(v) && [o.action.any, o.emit, o.goto].some((fn) => v.some(fn)));
        },
        /**
         * Returns true if the value is a NOODL boolean. A value is a NOODL boolean
         * if the value is truthy, true, "true", false, or "false"
         * @param { any } value
         */
        isBoolean(value) {
            return o.isBooleanTrue(value) || o.isBooleanFalse(value);
        },
        isBooleanTrue(value) {
            return value === true || value === 'true';
        },
        isBooleanFalse(value) {
            return value === false || value === 'false';
        },
        component: {
            button: identifyObj((v) => v.type === 'button'),
            canvas: identifyObj((v) => v.type === 'canvas'),
            divider: identifyObj((v) => v.type === 'divider'),
            ecosDoc: identifyObj((v) => v.type === 'ecosDoc'),
            footer: identifyObj((v) => v.type === 'footer'),
            header: identifyObj((v) => v.type === 'header'),
            image: identifyObj((v) => v.type === 'image'),
            label: identifyObj((v) => v.type === 'label'),
            list: identifyObj((v) => v.type === 'list'),
            listLike: identifyObj((v) => ['chatList', 'list'].includes(v.type)),
            listItem: identifyObj((v) => v.type === 'listItem'),
            map: identifyObj((v) => v.type === 'map'),
            page: identifyObj((v) => v.type === 'page'),
            plugin: identifyObj((v) => v.type === 'plugin'),
            pluginHead: identifyObj((v) => v.type === 'pluginHead'),
            pluginBodyTop: identifyObj((v) => v.type === 'pluginBodyTop'),
            pluginBodyTail: identifyObj((v) => v.type === 'pluginBodyTail'),
            popUp: identifyObj((v) => v.type === 'popUp'),
            register: identifyObj((v) => v.type === 'register'),
            select: identifyObj((v) => v.type === 'select'),
            scrollView: identifyObj((v) => v.type === 'scrollView'),
            textField: identifyObj((v) => v.type === 'textField'),
            textView: identifyObj((v) => v.type === 'textView'),
            video: identifyObj((v) => v.type === 'video'),
            view: identifyObj((v) => v.type === 'view'),
        },
        ecosObj: {
            audio(v) { },
            doc: identifyObj((v) => i.hasNameField(v) &&
                (/application\//i.test(v.name?.type || '') ||
                    v.subtype?.mediaType === 1)),
            font(v) { },
            image: identifyObj((v) => i.hasNameField(v) &&
                (/image/i.test(v.name?.type || '') || v.subtype?.mediaType === 4)),
            message(v) { },
            model(v) { },
            multipart(v) { },
            other: identifyObj((v) => i.hasNameField(v) &&
                (!/(application|audio|font|image|multipart|text|video)\//i.test(v.name?.type || '') ||
                    v.subtype?.mediaType === 0)),
            text: identifyObj((v) => i.hasNameField(v) &&
                (/text\//i.test(v.name?.type || '') ||
                    v.subtype?.mediaType === 8 ||
                    v.subtype?.mediaType === 0)),
            video: identifyObj((v) => i.hasNameField(v) &&
                (/video\//i.test(v.name?.type || '') || v.subtype?.mediaType === 9)),
        },
        emit: identifyObj((v) => 'actions' in v),
        goto: identifyObj((v) => 'goto' in v),
        if: identifyObj((v) => 'if' in v),
        mediaType: {
            audio: identifyNum((v) => v == 2),
            doc: identifyNum((v) => v == 1),
            font: identifyNum((v) => v == 3),
            image: identifyNum((v) => v == 4),
            message: identifyNum((v) => v == 5),
            model: identifyNum((v) => v == 6),
            multipart: identifyNum((v) => v == 7),
            other: identifyNum((v) => v == 0),
            text: identifyNum((v) => v == 8),
            video: identifyNum((v) => v == 9),
        },
        rootKey: identifyStr((v) => !!(v && v[0].toUpperCase() === v[0])),
        localKey: identifyStr((v) => !!(v && v[0].toLowerCase() === v[0])),
        reference: identifyStr((v) => {
            if (!i.isStr(v))
                return false;
            if (v === '.yml')
                return false;
            if (v.startsWith('.'))
                return true;
            if (v.startsWith('='))
                return true;
            if (v.startsWith('@'))
                return true;
            if (v.startsWith('~'))
                return true;
            if (/^[_]+\./.test(v))
                return true;
            return false;
        }),
        localReference: isLocalReference,
        awaitReference: isAwaitReference,
        evalReference: isEvalReference,
        evalLocalReference: isEvalLocalReference,
        evalRootReference: isEvalRootReference,
        rootReference: isRootReference,
        tildeReference: isTildeReference,
        traverseReference: isTraverseReference,
        textBoard(v) {
            return i.isArr(v) && v.some(o.textBoardItem);
        },
        textBoardItem(v) {
            if (i.isObj(v))
                return 'br' in v;
            if (i.isStr(v))
                return v === 'br';
            return false;
        },
    };
    const folds = {
        actionChain: identifyArr((v) => i.isArr(v) && v.some(composeSomes(o.action.any, o.emit, o.goto))),
        component: Object.assign({
            any(v) {
                return (i.isObj(v) &&
                    'type' in v &&
                    componentTypes.some((t) => v.type === t));
            },
        }, Object.assign({}, componentTypes.reduce((acc, type) => Object.assign(acc, {
            [type]: (v) => i.isObj(v) && v['type'] === type,
        }), {}))),
        emit: identifyObj((v) => 'emit' in v),
        goto: identifyObj((v) => 'goto' in v),
        if: identifyObj((v) => 'if' in v),
        path: identifyObj((v) => 'path' in v),
        textFunc: identifyObj((v) => 'text=func' in v),
        toast: identifyObj((v) => 'toast' in v),
    };
    return {
        ...o,
        folds,
    };
})();
//# sourceMappingURL=identify.js.map