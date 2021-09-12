import yaml from 'yaml';
import Reference from './Reference';
declare class ReferenceBuilder {
    paths: Reference[];
    value: string;
    add(key: yaml.Scalar<any> | Reference | string): void;
    toString(): void;
}
export default ReferenceBuilder;
