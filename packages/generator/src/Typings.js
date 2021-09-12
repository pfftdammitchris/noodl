"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("ts-morph");
const prettier_1 = require("prettier");
const yaml_1 = require("yaml");
const utils_1 = require("./utils");
class Typings {
    constructor(sourceFile) {
        this.hooks = new Map();
        this.metadata = {
            properties: new Map(),
        };
        this.sourceFile = sourceFile;
        this.interfaces = new Map();
        this.typeAliases = new Map();
    }
    formatFile({ onAfterSort, } = {}) {
        const sortedInterfaces = utils_1.sortAlphabetically((node) => node.getName(), this.sourceFile.getInterfaces());
        const sortedTypeAliases = utils_1.sortAlphabetically((node) => node.getName(), this.sourceFile.getTypeAliases());
        const numInterfaces = sortedInterfaces.length;
        for (let index = 0; index < numInterfaces; index++) {
            const interf = sortedInterfaces[index];
            interf.setOrder(index);
            utils_1.sortInterfaceProperties(interf);
        }
        onAfterSort?.({
            sourceFile: this.sourceFile,
            sortedInterfaces,
            sortedTypeAliases,
        });
        this.sourceFile.formatText({
            baseIndentSize: 2,
            convertTabsToSpaces: true,
            ensureNewLineAtEndOfFile: true,
            indentMultiLineObjectLiteralBeginningOnBlankLine: true,
            indentSize: 2,
            insertSpaceAfterCommaDelimiter: true,
            insertSpaceAfterConstructor: true,
            insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
            insertSpaceAfterKeywordsInControlFlowStatements: true,
            insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: true,
            insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: true,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            insertSpaceAfterTypeAssertion: true,
            insertSpaceBeforeFunctionParenthesis: false,
            insertSpaceBeforeTypeAnnotation: false,
            semicolons: ts.ts.SemicolonPreference.Remove,
            tabSize: 2,
            trimTrailingWhitespace: true,
        });
    }
    getMetadata(metadataObject, value) {
        let metadata;
        if (value === undefined) {
            value = metadataObject;
            metadata = utils_1.createMetadataObject();
        }
        else {
            metadata = metadataObject;
        }
        if (yaml_1.default.isMap(value) && !metadata.has('object')) {
            metadata.add('object', true);
        }
        else if (yaml_1.default.isSeq(value) && !metadata.has('array')) {
            metadata.add('array', true);
        }
        else if (yaml_1.default.isScalar(value)) {
            const type = typeof value.value;
            if (type === 'boolean' && !metadata.has('boolean')) {
                metadata.add('boolean', true);
            }
            else if (type === 'number' && !metadata.has('number')) {
                metadata.add('number', true);
            }
            else if (type === 'string' && !metadata.has('string')) {
                metadata.add('string', true);
            }
            else if (type === 'undefined' && !metadata.has('undefined')) {
                metadata.add('undefined', true);
            }
        }
        return metadata;
    }
    toString(opts) {
        this.formatFile(opts?.formatOptions);
        return prettier_1.default.format(this.sourceFile.getText(), {
            arrowParens: 'always',
            endOfLine: 'lf',
            printWidth: 80,
            semi: false,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: 'all',
            parser: 'typescript',
        });
    }
}
exports.default = Typings;
//# sourceMappingURL=Typings.js.map