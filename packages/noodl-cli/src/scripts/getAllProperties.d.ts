export interface GetAllPropertiesOutput {
    overall: {
        [keyword: string]: number;
    };
    results: {
        [pageName: string]: {
            [property: string]: number;
        };
    };
}
export interface GetAllPropertiesOptions {
    dir: string;
    endpoint: string;
    filename: string;
}
declare function getAllNOODLProperties({ dir, endpoint, filename, }: GetAllPropertiesOptions): Promise<{
    pageCount: number;
}>;
export default getAllNOODLProperties;
