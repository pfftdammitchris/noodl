export interface Options {
    initialValue?: string;
    onValidateStart?(configKey: any): void;
    onValidateEnd?(configKey: any): void;
    onValidated?(configKey: string): void;
    onNotFound?(configKey: string): void;
    onError?(error: Error, configKey: string): void;
}
declare function useConfigInput({ initialValue, onValidateStart, onValidateEnd, onValidated, onError, onNotFound, }: Options): {
    validate: (configKey: string) => Promise<boolean>;
    inputValue: string;
    setInputValue: (value: string) => void;
    config: string;
    isNotFound: boolean;
    valid: boolean;
    validating: boolean;
    lastTried: string;
    lastConfigSubmitted: string;
};
export default useConfigInput;
