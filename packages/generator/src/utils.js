"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortInterfaceProperties = exports.sortAlphabetically = exports.setPropertyPosition = exports.setArbitrary = exports.isArbitrary = exports.createMetadataObject = exports.createIsExtending = void 0;
const u = require("@jsmanifest/utils");
const ts = require("ts-morph");
function createIsExtending(value) {
    function isExtending(interf) {
        return interf.getExtends().some((e) => e.getText().includes(value));
    }
    return isExtending;
}
exports.createIsExtending = createIsExtending;
function createMetadataObject() {
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
}
exports.createMetadataObject = createMetadataObject;
function isArbitrary(interf) {
    return interf
        .getMembers()
        .some((type) => type.getText().replace(';', '') === '[key: string]: any');
}
exports.isArbitrary = isArbitrary;
function setArbitrary(interf) {
    interf
        .addMember({
        name: '[key: string]',
        type: 'any',
        kind: ts.StructureKind.PropertySignature,
    })
        .formatText({
        semicolons: ts.ts.SemicolonPreference.Remove,
    });
    return interf;
}
exports.setArbitrary = setArbitrary;
function setPropertyPosition(getFn, n, index) {
    const members = u.isArr(n) ? n : n.getMembers();
    for (const member of members) {
        if (getFn(member)) {
            member.setOrder(index === 'last' ? members.length - 1 : index);
            break;
        }
    }
    if (u.isArr(n))
        return members;
    return n;
}
exports.setPropertyPosition = setPropertyPosition;
function sortAlphabetically(getComparerValue, items) {
    return items.sort((a, b) => {
        const val1 = getComparerValue(a);
        const val2 = getComparerValue(b);
        if (val1 < val2)
            return -1;
        if (val1 === val2)
            return 0;
        return 1;
    });
}
exports.sortAlphabetically = sortAlphabetically;
function sortInterfaceProperties(interf) {
    const properties = sortAlphabetically((node) => node.getName(), interf.getProperties());
    const numNodes = properties.length;
    for (let index = 0; index < numNodes; index++) {
        properties[index].setOrder(index);
    }
}
exports.sortInterfaceProperties = sortInterfaceProperties;
//# sourceMappingURL=utils.js.map