import isAwaitReference from './utils/isAwaitReference';
import isEvalReference from './utils/isEvalReference';
import isEvalLocalReference from './utils/isEvalLocalReference';
import isEvalRootReference from './utils/isEvalRootReference';
import isLocalReference from './utils/isLocalReference';
import isRootReference from './utils/isRootReference';
import isTildeReference from './utils/isTildeReference';
import isTraverseReference from './utils/isTraverseReference';
import * as t from './index';
export declare const Identify: {
    folds: {
        actionChain: (v: any) => v is (t.EmitObjectFold | t.ActionObject<string> | t.GotoObject<string>)[];
        component: {
            any<O extends Record<string, any>>(v: unknown): v is t.ActionObject<string> & O;
        } & {
            map: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            page: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            image: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            video: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            list: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            popUp: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            button: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            canvas: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            chart: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            chatList: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            ecosDoc: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            divider: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            footer: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            header: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            label: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            listItem: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            plugin: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            pluginHead: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            pluginBodyTail: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            register: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            select: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            scrollView: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            textField: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            textView: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
            view: <K extends "map" | "page" | "image" | "video" | "list" | "popUp" | "button" | "canvas" | "chart" | "chatList" | "ecosDoc" | "divider" | "footer" | "header" | "label" | "listItem" | "plugin" | "pluginHead" | "pluginBodyTail" | "register" | "select" | "scrollView" | "textField" | "textView" | "view">(v: unknown) => v is Omit<t.ActionObject<string>, "type"> & {
                type: K;
            };
        };
        emit: (v: any) => v is t.EmitObjectFold;
        goto: (v: any) => v is {
            goto: t.GotoUrl | t.GotoObject;
        };
        if: (v: any) => v is {
            if: t.IfObject;
        };
        path: (v: any) => v is {
            path: t.Path;
        };
        textFunc: (v: any) => v is {
            path: t.Path;
        };
        toast: (v: any) => v is {
            toast: t.ToastObject;
        };
    };
    rootConfig: (v: any) => v is t.RootConfig;
    appConfig: (v: any) => v is t.AppConfig;
    action: {
        any: (v: any) => v is t.ActionObject<string>;
        builtIn: (v: any) => v is t.BuiltInActionObject;
        evalObject: (v: any) => v is t.EvalActionObject;
        openCamera: (v: any) => v is t.OpenCameraActionObject;
        openPhotoLibrary: (v: any) => v is t.OpenPhotoLibraryActionObject;
        openDocumentManager: (v: any) => v is t.OpenDocumentManagerActionObject;
        pageJump: (v: any) => v is t.PageJumpActionObject;
        popUp: (v: any) => v is t.PopupActionObject;
        popUpDismiss: (v: any) => v is t.PopupDismissActionObject;
        refresh: (v: any) => v is t.RefreshActionObject;
        removeSignature: (v: any) => v is t.RemoveSignatureActionObject;
        saveObject: (v: any) => v is t.SaveActionObject;
        saveSignature: (v: any) => v is t.SaveSignatureActionObject;
        updateObject: (v: any) => v is t.UpdateActionObject;
    };
    actionChain(v: unknown): boolean;
    /**
     * Returns true if the value is a NOODL boolean. A value is a NOODL boolean
     * if the value is truthy, true, "true", false, or "false"
     * @param { any } value
     */
    isBoolean(value: unknown): boolean;
    isBooleanTrue(value: unknown): value is true | "true";
    isBooleanFalse(value: unknown): value is false | "false";
    component: {
        button: (v: any) => v is t.ButtonComponentObject;
        canvas: (v: any) => v is t.CanvasComponentObject;
        divider: (v: any) => v is t.DividerComponentObject;
        ecosDoc: (v: any) => v is t.EcosDocComponentObject;
        footer: (v: any) => v is t.FooterComponentObject;
        header: (v: any) => v is t.HeaderComponentObject;
        image: (v: any) => v is t.ImageComponentObject;
        label: (v: any) => v is t.LabelComponentObject;
        list: (v: any) => v is t.ListComponentObject;
        listLike: (v: any) => v is t.ChatListComponentObject | t.ListComponentObject;
        listItem: (v: any) => v is t.ListItemComponentObject;
        map: (v: any) => v is t.MapComponentObject;
        page: (v: any) => v is t.PageComponentObject;
        plugin: (v: any) => v is t.PluginComponentObject;
        pluginHead: (v: any) => v is t.PluginHeadComponentObject;
        pluginBodyTop: (v: any) => v is t.PluginBodyTopComponentObject;
        pluginBodyTail: (v: any) => v is t.PluginBodyTailComponentObject;
        popUp: (v: any) => v is t.PopUpComponentObject;
        register: (v: any) => v is t.RegisterComponentObject;
        select: (v: any) => v is t.SelectComponentObject;
        scrollView: (v: any) => v is t.ScrollViewComponentObject;
        textField: (v: any) => v is t.TextFieldComponentObject;
        textView: (v: any) => v is t.TextViewComponentObject;
        video: (v: any) => v is t.VideoComponentObject;
        view: (v: any) => v is t.ViewComponentObject;
    };
    ecosObj: {
        audio(v: unknown): void;
        doc: (v: any) => v is t.EcosDocument<t.NameField<"application/json" | "application/pdf">, 1>;
        font(v: unknown): void;
        image: (v: any) => v is t.EcosDocument<t.NameField<"image/png" | "image/jpeg" | "image/svg" | "image/ai" | "image/bmp" | "image/eps" | "image/gif" | "image/jpg" | "image/psd" | "image/tiff" | "image/webp">, 4>;
        message(v: unknown): void;
        model(v: unknown): void;
        multipart(v: unknown): void;
        other: (v: any) => v is t.EcosDocument<t.NameField<any>, 0>;
        text: (v: any) => v is t.EcosDocument<t.NameField<"text/javascript" | "text/html" | "text/css" | "text/plain">, 0 | 8>;
        video: (v: any) => v is t.EcosDocument<t.NameField<"video/mp4" | "video/flv" | "video/ogg" | "video/webm" | "video/avi" | "video/mkv" | "video/mov" | "video/mpg" | "video/wmv">, 9>;
    };
    emit: (v: any) => v is t.EmitObject;
    goto: (v: any) => v is t.GotoObject<string>;
    if: (v: any) => v is t.IfObject<any, any, any>;
    mediaType: {
        audio: (v: any) => v is 2;
        doc: (v: any) => v is 1;
        font: (v: any) => v is 3;
        image: (v: any) => v is 4;
        message: (v: any) => v is 5;
        model: (v: any) => v is 6;
        multipart: (v: any) => v is 7;
        other: (v: any) => v is 0;
        text: (v: any) => v is 8;
        video: (v: any) => v is 9;
    };
    rootKey: (v: any) => v is string;
    localKey: (v: any) => v is string;
    reference: (v: any) => v is `=.${string}` | `.${string}` | `${string}@` | `~/${string}` | `=..${string}` | `..${string}`;
    localReference: typeof isLocalReference;
    awaitReference: typeof isAwaitReference;
    evalReference: typeof isEvalReference;
    evalLocalReference: typeof isEvalLocalReference;
    evalRootReference: typeof isEvalRootReference;
    rootReference: typeof isRootReference;
    tildeReference: typeof isTildeReference;
    traverseReference: typeof isTraverseReference;
    textBoard(v: unknown): v is t.TextBoardObject;
    textBoardItem<O_1 extends "br" | {
        br: any;
    }>(v: O_1): boolean;
};
