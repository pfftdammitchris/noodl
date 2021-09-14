import yaml from 'yaml';
declare function assign<N extends yaml.YAMLMap | Record<string, any>>(value: N, ...rest: (yaml.YAMLMap | Record<string, any>)[]): N;
export default assign;
