import { YAMLMap } from 'yaml';
import { OrArray } from '@jsmanifest/typefest';
export declare type KeyOf<N extends YAMLMap | Record<string, any>> = N extends YAMLMap ? YAMLMap['items'][number]['key'] : keyof N;
export declare type ValueOf<N extends YAMLMap | Record<string, any>> = N extends YAMLMap ? YAMLMap['items'][number]['value'] : N[keyof N];
export interface BaseStructure {
    ext: string;
    filename: string;
    group: StructureGroup;
}
export interface FileStructure extends BaseStructure {
    dir: string;
    filepath: string;
    rootDir: string;
}
export interface LinkStructure extends BaseStructure {
    isRemote: boolean;
    url: string;
}
export declare type StructureGroup = 'config' | 'document' | 'image' | 'page' | 'script' | 'video' | 'unknown';
export declare type LoadType = 'doc' | 'json' | 'yml';
export declare type LoadFilesAs = 'list' | 'map' | 'object';
export interface LoadFilesOptions<LType extends LoadType = 'yml', LFType extends LoadFilesAs = 'list'> {
    as?: LFType;
    includeExt?: boolean;
    preload?: OrArray<string>;
    spread?: OrArray<string>;
    type?: LType;
}
