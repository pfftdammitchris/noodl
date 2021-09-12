declare class AbortExecuteError extends Error {
    name: string;
    constructor(message: string);
}
export default AbortExecuteError;
