import * as ts from 'ts-morph';
import * as t from './types';
declare class Typings {
    hooks: Map<any, any>;
    interfaces: Map<string, ts.InterfaceDeclaration>;
    typeAliases: Map<string, ts.TypeAliasDeclaration>;
    metadata: {
        properties: Map<string, {
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
        }>;
    };
    sourceFile: ts.SourceFile;
    constructor(sourceFile: ts.SourceFile);
    formatFile({ onAfterSort, }?: {
        onAfterSort?(args: {
            sourceFile: ts.SourceFile;
            sortedInterfaces: ts.InterfaceDeclaration[];
            sortedTypeAliases: ts.TypeAliasDeclaration[];
        }): void;
    }): void;
    getMetadata(metadataObject: t.MetadataObject | undefined, value: unknown): t.MetadataObject;
    getMetadata(value: unknown): t.MetadataObject;
    toString(opts?: {
        formatOptions?: Parameters<Typings['formatFile']>[0];
    }): string;
}
export default Typings;
