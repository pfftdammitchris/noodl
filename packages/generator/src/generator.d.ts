/// <reference types="react" />
import * as ts from 'ts-morph';
import yaml from 'yaml';
import ActionTypings from './ActionTypings';
declare const generator: {
    load(_docs: yaml.Document[]): any;
    createFile(filepath: string): {
        sourceFile: ts.SourceFile;
        actionTypings(): ActionTypings;
        componentTypings(): void;
    };
};
export default generator;
