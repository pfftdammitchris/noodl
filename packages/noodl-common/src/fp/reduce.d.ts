import yaml from 'yaml';
declare function reduce<V extends yaml.YAMLSeq | any[], Acc = any>(value: V, fn: (acc: Acc, v: V) => Acc, initialValue: Acc): Acc;
export default reduce;
