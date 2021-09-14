declare function set<O extends Record<string, any>, K extends keyof O>(obj: O, key: K, value: any): void;
export default set;
