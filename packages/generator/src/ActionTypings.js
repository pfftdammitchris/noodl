"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("ts-morph");
const yaml_1 = require("yaml");
const upperFirst_1 = require("lodash/upperFirst");
const utils_1 = require("./utils");
const Typings_1 = require("./Typings");
const util = require("./utils");
const suffix = {
    actionObject: 'ActionObject',
};
class ActionTypings extends Typings_1.default {
    constructor(sourceFile) {
        super(sourceFile);
        this.isExtendingBaseObject = utils_1.createIsExtending(suffix.actionObject);
        const anyActionObject = sourceFile.addTypeAlias({
            name: 'AnyActionObject',
            isExported: true,
            type: '""',
        });
        const baseActionObjectInterface = sourceFile.addInterface({
            name: `ActionObject`,
            isExported: true,
            typeParameters: [
                {
                    kind: ts.StructureKind.TypeParameter,
                    name: 'T',
                    constraint: 'string',
                    default: 'string',
                },
            ],
            properties: [
                {
                    name: 'actionType',
                    type: 'T',
                    kind: ts.StructureKind.PropertySignature,
                },
                { name: `[key: string]`, type: 'any' },
            ],
        });
        const uncommonPropsInterface = sourceFile.addInterface({
            name: `Uncommon${suffix.actionObject}Props`,
            isExported: true,
        });
        this.typeAliases.set(anyActionObject.getName(), anyActionObject);
        this.interfaces.set(baseActionObjectInterface.getName(), baseActionObjectInterface);
        this.interfaces.set(uncommonPropsInterface.getName(), uncommonPropsInterface);
    }
    get propertiesInterface() {
        return this.sourceFile.getInterface(`Uncommon${suffix.actionObject}Props`);
    }
    addAction(node) {
        if (yaml_1.default.isMap(node)) {
            const actionType = node.get('actionType');
            const interfaceName = `${upperFirst_1.default(actionType || '')}${suffix.actionObject}`;
            const interf = this.sourceFile.getInterface(interfaceName) ||
                this.sourceFile.addInterface({ name: interfaceName });
            !interf.hasExportKeyword() && interf.setIsExported(true);
            !util.isArbitrary(interf) && util.setArbitrary(interf);
            !this.isExtendingBaseObject(interf) && interf.addExtends(`ActionObject`);
            for (const pair of node.items) {
                if (yaml_1.default.isScalar(pair.key)) {
                    const key = pair.key.value;
                    const options = {
                        name: key,
                        hasQuestionToken: key !== 'actionType',
                        isReadonly: false,
                        kind: ts.StructureKind.PropertySignature,
                        type: key === 'actionType'
                            ? `'${actionType}'`
                            : key === 'object'
                                ? `Record<string, any>`
                                : 'string',
                    };
                    !interf.getProperty(key) && interf.addMember(options);
                    this.metadata.properties.set(key, this.metadata.properties.has(key)
                        ? this.getMetadata(this.metadata.properties.get(key), pair.value)
                        : this.getMetadata(pair.value));
                    if (key !== 'actionType' &&
                        !this.propertiesInterface.getProperty(key)) {
                        this.propertiesInterface.addMember(options);
                    }
                }
            }
            util.setPropertyPosition((val) => val.getText().replace(';', '') === '[key: string]: any', interf.getMembers(), 'last');
            return yaml_1.default.visit.SKIP;
        }
    }
    generate(docs) {
        for (const doc of docs) {
            yaml_1.default.visit(doc, {
                Map: (key, node, path) => {
                    if (node.has('actionType')) {
                        return this.addAction(node);
                    }
                },
            });
        }
        return this.toString({
            formatOptions: {
                onAfterSort({ sortedInterfaces, sortedTypeAliases }) {
                    const anyActionObjectTypeAlias = sortedTypeAliases.find((typeDec) => typeDec.getName() === 'AnyActionObject');
                    if (anyActionObjectTypeAlias) {
                        const actionObjectInterface = sortedInterfaces.find((interf) => interf.getName() === 'ActionObject');
                        if (actionObjectInterface) {
                            // Places 'AnyActionObject' right after 'ActionObject
                            const actionObjInterfIndex = actionObjectInterface.getChildIndex();
                            const anyActionObjTypeAliasIndex = actionObjInterfIndex + 1;
                            anyActionObjectTypeAlias.setOrder(anyActionObjTypeAliasIndex);
                        }
                        else {
                            anyActionObjectTypeAlias.setOrder(0);
                        }
                    }
                },
            },
        });
    }
    getActionTypes() { }
}
exports.default = ActionTypings;
//# sourceMappingURL=ActionTypings.js.map