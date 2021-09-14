const log = console.log;
export const id = {
    ACTION_TYPES: 'actionTypes',
    ACTION_OBJECTS: 'ACTION_OBJECTS',
    BUILTIN_FUNC_NAMES: 'BUILTIN_FUNC_NAMES',
    COMPONENT_KEYS: 'COMPONENT_KEYS',
    COMPONENT_OBJECTS: 'COMPONENT_OBJECTS',
    COMPONENT_TYPES: 'COMPONENT_TYPES',
    EMIT_OBJECTS: 'EMIT_OBJECTS',
    IF_OBJECTS: 'IF_OBJECTS',
    OBJECTS_THAT_CONTAIN_THESE_KEYS: 'OBJECTS_THAT_CONTAIN_THESE_KEYS',
    REFERENCES: 'references',
    RETRIEVE_URLS: 'RETRIEVE_URLS',
    STYLE_BORDER_OBJECTS: 'STYLE_BORDER_OBJECTS',
    STYLE_PROPERTIES: 'STYLE_PROPERTIES',
    // Action object props
    BUILTIN_ACTION_PROPS: 'BUILTIN_ACTION_PROPS',
    EVALOBJECTACTION_PROPS: 'EVALOBJECTACTION_PROPS',
    PAGEJUMP_ACTION_PROPS: 'PAGEJUMP_ACTION_PROPS',
    POPUP_ACTION_PROPS: 'POPUP_ACTION_PROPS',
    POPUPDISMISS_ACTION_PROPS: 'POPUPDISMISS_ACTION_PROPS',
    REFRESH_ACTION_PROPS: 'REFRESH_ACTION_PROPS',
    SAVEOBJECT_ACTION_PROPS: 'SAVEOBJECT_ACTION_PROPS',
    UPDATEOBJECT_ACTION_PROPS: 'UPDATEOBJECT_ACTION_PROPS',
    // Component object props
    BUTTON_COMPONENT_PROPS: 'BUTTON_COMPONENT_PROPS',
    DIVIDER_COMPONENT_PROPS: 'DIVIDER_COMPONENT_PROPS',
    IMAGE_COMPONENT_PROPS: 'IMAGE_COMPONENT_PROPS',
    LABEL_COMPONENT_PROPS: 'LABEL_COMPONENT_PROPS',
    LIST_COMPONENT_PROPS: 'LIST_COMPONENT_PROPS',
    LISTITEM_COMPONENT_PROPS: 'LISTITEM_COMPONENT_PROPS',
    POPUP_COMPONENT_PROPS: 'POPUP_COMPONENT_PROPS',
    SCROLLVIEW_COMPONENT_PROPS: 'SCROLLVIEW_COMPONENT_PROPS',
    SELECT_COMPONENT_PROPS: 'SELECT_COMPONENT_PROPS',
    TEXTFIELD_COMPONENT_PROPS: 'TEXTFIELD_COMPONENT_PROPS',
    TEXTVIEW_COMPONENT_PROPS: 'TEXTVIEW_COMPONENT_PROPS',
    VIEW_COMPONENT_PROPS: 'VIEW_COMPONENT_PROPS',
};
const scripts = {};
scripts[id.ACTION_OBJECTS] = (store) => {
    return {
        key: 'actions',
        label: 'Retrieve all action objects',
        cond: 'map',
        fn({ key, node, path }) {
            if (Utils.identify.action.any(node)) {
                const actionType = node.get('actionType');
                if (!store.actions?.[actionType])
                    store.actions[actionType] = [];
                store.actions[actionType]?.push(node.toJSON());
            }
        },
    };
};
scripts[id.STYLE_BORDER_OBJECTS] = () => ({
    label: 'Retrieve all style border objects',
    fn({ key, node, path }, store) {
        if (Utils.identify.style.border(node)) {
            if (!store.styles.border)
                store.styles.border = [];
            store.styles.border.push(node);
        }
    },
});
scripts[id.COMPONENT_OBJECTS] = () => {
    return {
        label: 'Retrieve all component objects',
        fn({ key, node, path }, store) {
            if (Utils.identify.component.any(node)) {
                const componentType = node.get('type');
                if (!store.components[componentType])
                    store.components[componentType] = [];
                store.components[componentType].push(node.toJSON());
            }
        },
    };
};
scripts[id.EMIT_OBJECTS] = () => {
    return {
        label: 'Retrieve all emit objects',
        fn({ key, node, path }, store) {
            if (Utils.identify.emit(node)) {
                if (!store.emit)
                    store.emit = [];
                store.emit.push(node.get('emit'));
            }
        },
    };
};
scripts[id.IF_OBJECTS] = () => {
    return {
        label: 'Retrieve all "if" objects',
        fn({ key, node, path }, store) {
            if (Utils.identify.if(node)) {
                if (!store.if)
                    store.if = [];
                store.if.push(node.get('if'));
            }
        },
    };
};
scripts[id.OBJECTS_THAT_CONTAIN_THESE_KEYS] = () => {
    return {
        label: `Retrieve all objects that contain the specified keys`,
        fn({ key, node, path }, store) {
            const keys = ['contentType'];
            const numKeys = keys.length;
            if (isYAMLMap(node)) {
                for (let index = 0; index < numKeys; index++) {
                    const key = keys[index] || '';
                    if (node.has(key)) {
                        if (!Array.isArray(store.containedKeys[key])) {
                            store.containedKeys[key] = [];
                        }
                        store.containedKeys[key].push(node.toJSON());
                    }
                }
            }
        },
    };
};
scripts[id.STYLE_PROPERTIES] = () => {
    return {
        label: 'Retrieve all style properties',
        fn({ key, node, path }, store) {
            if (Utils.identify.paths.style.any(node)) {
                if (isYAMLMap(node.value)) {
                    node.value.items.forEach((pair) => {
                        if (pair.key?.value && !Utils.identify.scalar.reference(pair.key)) {
                            if (!store.styleKeys.includes(pair.key.value)) {
                                store.styleKeys.push(pair.key.value);
                            }
                        }
                    });
                }
            }
        },
    };
};
export function createActionPropComboScripts() {
    return [
        'builtIn',
        'evalObject',
        'pageJump',
        'popUp',
        'popUpDismiss',
        'refresh',
        'saveObject',
        'updateObject',
    ].map((actionType) => ({
        id: id[`${actionType.toUpperCase()}_ACTION_PROPS`],
        label: `Retrieve props that may exist on ${actionType} action objects`,
        fn({ key, node, path }, store) {
            if (Utils.identify.action[actionType](node)) {
                ;
                node.items.forEach((pair) => {
                    if (!Utils.identify.scalar.reference(pair.key)) {
                        const actions = store.propCombos.actions;
                        if (!actions[actionType])
                            actions[actionType] = {};
                        if (!actions[actionType][pair.key.value]) {
                            actions[actionType][pair.key.value] = [];
                        }
                        if (!actions[actionType][pair.key.value]?.includes(pair.value.value)) {
                            actions[actionType][pair.key.value]?.push(pair.value.value);
                        }
                    }
                });
            }
        },
    }));
}
export function createComponentPropComboScripts() {
    return [
        'button',
        'divider',
        'image',
        'label',
        'lael',
        'list',
        'listItem',
        'popUp',
        'scrollView',
        'select',
        'textField',
        'textView',
        'view',
        'chatList',
    ].map((type) => ({
        id: id[`${type.toUpperCase()}_ACTION_PROPS`],
        label: `Retrieve props that may exist on ${type} action objects`,
        fn({ key, node, path }) {
            if (Utils.identify.component[type]?.(node)) {
                ;
                node.items.forEach((pair) => {
                    if (!Utils.identify.scalar.reference(pair.key)) {
                        // const components = store.propCombos.components
                        const components = {};
                        if (!components[type])
                            components[type] = {};
                        if (!components[type][pair.key?.value]) {
                            components[type][pair.key.value] = [];
                        }
                        if (!components[type][pair.key?.value]?.includes(pair.value?.value)) {
                            components[type][pair.key.value]?.push(pair.value?.value);
                        }
                    }
                });
            }
        },
    }));
}
export default scripts;
//# sourceMappingURL=scripts.js.map