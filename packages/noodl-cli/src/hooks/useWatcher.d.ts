/// <reference types="node" />
import React from 'react';
import fs from 'fs-extra';
import chokidar from 'chokidar';
export interface Hooks {
    onAdd?(args: Parameters<onAddOrChangeFn>[0]): void;
    onAddDir?(args: Parameters<onAddOrChangeFn>[0]): void;
    onChange?(args: Parameters<onAddOrChangeFn>[0]): void;
    onError?(err: Error): void;
    onReady?(watchedFiles: {
        [directory: string]: string[];
    } | undefined, watchCount: number): void;
    onUnlink?(filepath: string): void;
    onUnlinkDir?(filepath: string): void;
}
export interface onAddOrChangeFn {
    (opts: {
        isFile: boolean;
        isFolder: boolean;
        name: string;
        path: string;
        stats?: fs.Stats;
    }): void;
}
export declare type Options = Hooks & {
    watchOptions?: chokidar.WatchOptions;
};
declare function useWatcher({ watchOptions }: Options): {
    tag: string;
    watch: (opts?: (Hooks & {
        watchGlob?: string | undefined;
    }) | undefined) => void;
    watcher: React.MutableRefObject<chokidar.FSWatcher | null>;
    watching: boolean;
    setWatching: React.Dispatch<React.SetStateAction<boolean>>;
};
export default useWatcher;
