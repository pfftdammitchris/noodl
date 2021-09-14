/// <reference types="react" />
import * as t from './types.js';
export declare const initialState: {
    ready: boolean;
    activePanel: string;
    highlightedPanel: string;
    spinner: string | false;
    text: string[];
};
declare function Application({ cli }: {
    cli: t.App.Context['cli'];
}): JSX.Element;
export default Application;
