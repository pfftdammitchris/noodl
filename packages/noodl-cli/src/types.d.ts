import Aggregator from 'noodl-aggregator';
import { Draft } from 'immer';
import { Cli } from './cli.js';
import { initialState as initialAppState } from './App.js';
import useConfiguration from './hooks/useConfiguration.js';
export declare namespace App {
    interface Context extends State {
        aggregator: Aggregator;
        cli: Cli;
        configuration: ReturnType<typeof useConfiguration>;
        exit: (error?: Error | undefined) => void;
        highlight(panelKey: App.PanelKey | ''): void;
        log(text: string): void;
        logError(text: string | Error): void;
        toggleSpinner(type?: false | string): void;
        set(fn: (draft: Draft<App.State>) => void): void;
        setPanel(panelKey: App.PanelKey | '', props?: Record<string, any>): void;
    }
    type PanelKey = string;
    type State = typeof initialAppState;
}
export declare type PanelType = 'main' | 'generate' | 'retrieve' | 'server';
export interface PanelObject<Key extends string = string> {
    key?: Key;
    value: Key;
    label: string;
    [key: string]: any;
}
