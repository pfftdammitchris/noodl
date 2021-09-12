import yaml from 'yaml';
import Noodl from '../Noodl';
import Dereferencer from '../Dereferencer';
import Transformer from '../Transformer';
import Visitor from '../Visitor';
export declare const globalPathToUserVertex = ".Global.currentUser.vertex";
export declare const pathToUserVertex: string[];
export declare const noodl: Noodl;
export declare const dereferencer: Dereferencer;
export declare const transformer: Transformer;
export declare const visitor: Visitor;
export declare function createDocWithJsObject(obj: {
    [key: string]: any;
}): yaml.Document.Parsed;
