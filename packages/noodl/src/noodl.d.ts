import yaml from 'yaml';
import Page from './Page';
import Root from './Root';
import Utils from './Utils';
import * as T from './types';
declare class Noodl implements T.InternalComposerBaseArgs {
    #private;
    constructor({ root, pages, util, }?: {
        root?: Root;
        pages?: T.Pages;
        util?: Utils;
    });
    get pages(): T.Pages;
    get root(): Root<"yml", "list">;
    get util(): Utils;
    createPage({ name, doc, spread, }: {
        name: string;
        doc: yaml.Document;
        spread?: boolean;
    }): Page | undefined;
    clear(): void;
}
export default Noodl;
