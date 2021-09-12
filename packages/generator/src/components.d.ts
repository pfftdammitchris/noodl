import yaml from 'yaml';
import * as ts from 'ts-morph';
declare const getCommponentsSourceFile: (program: ts.Project, filepath: string) => {
    readonly metadata: {
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
    readonly sourceFile: ts.SourceFile;
    getUncommonPropsInterface: () => ts.InterfaceDeclaration;
    getBaseObjectInterface: () => ts.InterfaceDeclaration;
    addComponent(node: yaml.YAMLMap): symbol | undefined;
};
export default getCommponentsSourceFile;
