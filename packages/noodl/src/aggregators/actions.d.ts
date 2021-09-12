/// <reference types="react" />
import yaml from 'yaml';
export interface NoodlVisitFn<N extends yaml.Node = yaml.Node> {
    (args: {
        key: Parameters<yaml.visitorFn<N>>[0];
        node: Parameters<yaml.visitorFn<N>>[1];
        path: Parameters<yaml.visitorFn<N>>[2];
    }): ReturnType<yaml.visitorFn<N>>;
}
export declare const visit: <N extends yaml.Node = any>(fn: NoodlVisitFn<N>) => yaml.visitorFn<N>;
export declare const handleActionType: yaml.visitorFn<yaml.Pair<unknown, unknown>>;
declare const aggregateActions: (doc: yaml.Document) => void;
export default aggregateActions;
