export declare type SourceOption = string | Record<string, any>;
export declare function occurrences(obj: any, data?: any): any;
export interface GenerateStatsForKeywordsOptions {
    dir: string;
    endpoint: string;
    keywords: string[];
    saveAsFilename: string;
}
declare function getAllKeywordOccurrences({ dir, endpoint, keywords, saveAsFilename, }: GenerateStatsForKeywordsOptions): Promise<{}>;
export default getAllKeywordOccurrences;
