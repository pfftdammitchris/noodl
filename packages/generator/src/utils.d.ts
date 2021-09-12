import * as ts from 'ts-morph';
export declare function createIsExtending(value: string): (interf: ts.InterfaceDeclaration) => boolean;
export declare function createMetadataObject(): {
    add(property: string, val: any): void;
    has(key: string): boolean;
    readonly value: {
        array?: boolean | undefined;
        boolean?: boolean | undefined;
        function?: boolean | undefined;
        number?: boolean | undefined;
        null?: boolean | undefined;
        object?: boolean | undefined;
        reference?: boolean | undefined;
        string?: boolean | undefined;
        undefined?: boolean | undefined;
    } | undefined;
};
export declare function isArbitrary(interf: ts.InterfaceDeclaration): boolean;
export declare function setArbitrary(interf: ts.InterfaceDeclaration): ts.InterfaceDeclaration;
export declare function setPropertyPosition(getFn: (val: ts.TypeElementTypes) => boolean, interf: ts.InterfaceDeclaration, index: number | 'last'): ts.InterfaceDeclaration;
export declare function setPropertyPosition(getFn: (val: ts.TypeElementTypes) => boolean, members: ts.TypeElementTypes[], index: number | 'last'): ts.TypeElementTypes[];
export declare function sortAlphabetically<V = any>(getComparerValue: (node: V) => any, items: V[]): V[];
export declare function sortInterfaceProperties(interf: ts.InterfaceDeclaration): void;
