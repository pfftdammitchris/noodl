"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
const upperFirst_1 = require("lodash/upperFirst");
const ts = require("ts-morph");
const createMetadataObject = () => {
    let value;
    const o = {
        add(property, val) {
            if (!value)
                value = {};
            value[property] = val;
        },
        has(key) {
            if (value?.[key])
                return true;
            return false;
        },
        get value() {
            return value;
        },
    };
    return o;
};
const getCommponentsSourceFile = function getCommponentsSourceFile(program, filepath) {
    const metadata = {
        properties: new Map(),
    };
    const suffix = {
        ComponentObject: 'ComponentObject',
    };
    const sourceFile = program.createSourceFile(filepath);
    const uncommonPropsInterface = sourceFile.addInterface({
        name: 'uncommonComponentObjectProps',
        isExported: true,
    });
    const baseObjectInterface = sourceFile.addInterface({
        name: 'ComponentObject',
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
                name: 'type',
                type: 'T',
                kind: ts.StructureKind.PropertySignature,
            },
            { name: `[key: string]`, type: 'any' },
        ],
    });
    const referenceType = sourceFile.addTypeAlias({
        name: 'Reference',
        type: 'string',
        isExported: true,
    });
    const getInterfaceName = (s) => `${upperFirst_1.default(s)}${suffix.ComponentObject}`;
    function createIsExtending(value) {
        const isExtending = (interf) => interf.getExtends().some((e) => e.getText().includes(value));
        return isExtending;
    }
    const isExtendingActionObject = createIsExtending('ComponentObject');
    const o = {
        get metadata() {
            return metadata;
        },
        get sourceFile() {
            return sourceFile;
        },
        getUncommonPropsInterface: () => uncommonPropsInterface,
        getBaseObjectInterface: () => baseObjectInterface,
        addComponent(node) {
            if (yaml_1.default.isMap(node)) {
                const type = node.get('type');
                let interf = sourceFile.getInterface(getInterfaceName(type));
                if (!interf) {
                    interf = sourceFile.addInterface({
                        name: getInterfaceName(type),
                    });
                }
                !interf.hasExportKeyword() && interf.setIsExported(true);
                if (!isExtendingActionObject(interf)) {
                    interf.addExtends(`ComponentObject`);
                }
                const members = interf.getMembers();
                if (!members.some((type) => type.getText().replace(';', '') === '[key: string]: any')) {
                    interf
                        .addMember({
                        name: '[key: string]',
                        type: 'any',
                        kind: ts.StructureKind.PropertySignature,
                    })
                        .formatText({ semicolons: ts.ts.SemicolonPreference.Remove });
                }
                for (const pair of node.items) {
                    if (yaml_1.default.isScalar(pair.key)) {
                        const key = pair.key.value;
                        if (key === 'text=func') {
                            //
                        }
                        if (!interf.getProperty(key)) {
                            if (key === 'text=func') {
                                console.log(pair.toJSON());
                            }
                            if (yaml_1.default.isScalar(pair.value)) {
                                const componentType = key === 'type'
                                    ? `'${type}'`
                                    : key === 'object'
                                        ? referenceType.getName()
                                        : 'string';
                                interf.addMember({
                                    name: key === 'text=func' ? `'text=func'` : key,
                                    hasQuestionToken: key !== 'type',
                                    isReadonly: false,
                                    kind: ts.StructureKind.PropertySignature,
                                    type: componentType,
                                });
                            }
                        }
                        if (yaml_1.default.isMap(pair.value)) {
                        }
                        if (!metadata.properties.has(key)) {
                            metadata.properties.set(key, createMetadataObject());
                        }
                        const metadataObject = metadata.properties.get(key);
                        if (yaml_1.default.isMap(pair.value) && !metadataObject.has('object')) {
                            metadataObject.add('object', true);
                        }
                        else if (yaml_1.default.isSeq(pair.value) && !metadataObject.has('array')) {
                            metadataObject.add('array', true);
                        }
                        else if (yaml_1.default.isScalar(pair.value)) {
                            const type = typeof pair.value.value;
                            if (type === 'boolean' && !metadataObject.has('boolean')) {
                                metadataObject.add('boolean', true);
                            }
                            else if (type === 'number' && !metadataObject.has('number')) {
                                metadataObject.add('number', true);
                            }
                            else if (type === 'string' && !metadataObject.has('string')) {
                                metadataObject.add('string', true);
                            }
                            else if (type === 'undefined' &&
                                !metadataObject.has('undefined')) {
                                metadataObject.add('undefined', true);
                            }
                        }
                    }
                }
                return yaml_1.default.visit.SKIP;
            }
        },
    };
    return o;
};
exports.default = getCommponentsSourceFile;
//# sourceMappingURL=components.js.map