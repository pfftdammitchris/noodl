import yaml from 'yaml';
declare function forEach<V extends yaml.YAMLSeq<any> | any[]>(value: V, fn: (value: V extends yaml.YAMLSeq ? V['items'][number] : V extends any[] ? V[number] : undefined, index: number, collection: yaml.YAMLSeq<any> | any[]) => void): void;
export default forEach;
