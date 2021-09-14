import yaml from 'yaml';
declare function get<O extends Record<string, any> | yaml.YAMLMap>(value: O, key: string | yaml.Scalar): unknown;
export default get;
