declare class PropUnion {
    options: {
        boolean: string;
        object: string;
        function: string;
        number: string;
        null: string;
        string: string;
        undefined: string;
    };
    value: string;
    add(property: string, val: any): void;
    has(key: string): boolean;
}
export default PropUnion;
