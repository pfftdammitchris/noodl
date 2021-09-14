/// <reference types="react" />
import { App } from './types';
declare const useCtx: () => App.Context, Provider: import("react").Provider<App.Context | undefined>;
export { Provider };
export default useCtx;
