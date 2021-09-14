import { LiteralUnion } from 'type-fest';
import { Cli } from '../cli.js';
export interface Options {
    cli: Cli;
    onInit?(): void;
}
declare function useConfiguration({ cli, onInit }: Options): {
    clear: () => void;
    getAll: () => any;
    getDefaultGenerateDir: () => string;
    getLastUsedConfigKey: () => string | undefined;
    getPathToGenerateDir: () => any;
    getTempDir: () => string | undefined;
    initTimestamp: () => any;
    isFresh: () => boolean;
    refreshLastUpdatedTimestamp: () => any;
    setPathToGenerateDir: (path: LiteralUnion<'default', string>, opts?: {
        onCreated?(path: string): void;
        onError?(opts: {
            error: Error & {
                code: string;
            };
            path: string;
        }): void;
    } | undefined) => any;
};
export default useConfiguration;
