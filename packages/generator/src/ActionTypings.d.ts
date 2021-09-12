import * as ts from 'ts-morph';
import yaml from 'yaml';
import Typings from './Typings';
declare class ActionTypings extends Typings {
    isExtendingBaseObject: (interf: ts.InterfaceDeclaration) => boolean;
    constructor(sourceFile: ts.SourceFile);
    get propertiesInterface(): ts.InterfaceDeclaration;
    addAction(node: yaml.YAMLMap): symbol | undefined;
    generate(docs: yaml.Document[]): string;
    getActionTypes(): void;
}
export default ActionTypings;
