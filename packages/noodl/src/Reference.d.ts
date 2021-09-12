import yaml from 'yaml';
declare class Reference {
    #private;
    readonly type = "REFERENCE";
    constructor(arg: string | yaml.Scalar<string>);
    isRoot(): boolean;
    isLocal(): boolean;
    get node(): yaml.Scalar<string>;
    set node(node: yaml.Scalar<string>);
    get path(): string;
    get paths(): string[];
    get value(): null;
    set value(value: null);
    prev(): Reference | null;
    next(): Reference | null;
    toJSON(): {
        isRoot: boolean;
        isLocal: boolean;
        path: string;
        paths: string[];
        value: null;
    };
    toString(): string;
}
export default Reference;
