export interface Options {
    dir?: string;
}
declare function useConfigLoader({ dir: dirProp }?: Options): {
    rootConfig: {
        remote: boolean | null;
        loading: boolean;
        loaded: boolean;
    };
    appConfig: {
        loading: boolean;
        loaded: boolean;
    };
};
export default useConfigLoader;
