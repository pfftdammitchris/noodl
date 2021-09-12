"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("ts-morph");
const ActionTypings_1 = require("./ActionTypings");
const generator = (function () {
    let docs = [];
    let program = new ts.Project({
        compilerOptions: {
            allowJs: true,
            allowSyntheticDefaultImports: true,
            charset: 'utf8',
            declaration: true,
            emitDeclarationOnly: true,
            baseUrl: __dirname,
            module: ts.ModuleKind.ESNext,
            noEmitOnError: false,
            resolveJsonModule: true,
            skipLibCheck: true,
            sourceMap: true,
            target: ts.ScriptTarget.ESNext,
        },
        manipulationSettings: {
            indentationText: ts.IndentationText.TwoSpaces,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            quoteKind: ts.QuoteKind.Single,
            newLineKind: ts.NewLineKind.LineFeed,
            useTrailingCommas: true,
        },
        skipAddingFilesFromTsConfig: true,
        skipLoadingLibFiles: true,
        skipFileDependencyResolution: true,
        // useInMemoryFileSystem: true,
    });
    const source = function createSource(sourceFile) {
        const _o = {
            sourceFile,
            actionTypings() {
                return new ActionTypings_1.default(sourceFile);
            },
            componentTypings() { },
        };
        return _o;
    };
    const o = {
        load(_docs) {
            docs = docs;
            return o;
        },
        createFile(filepath) {
            return source(program.createSourceFile(filepath, undefined, {
                overwrite: true,
            }));
        },
    };
    return o;
})();
exports.default = generator;
//# sourceMappingURL=generator.js.map