import { ActionObject } from 'noodl-types';
import { ActionChainInstancesLoader } from '../types';
import ActionChain from '../ActionChain';
declare function createActionChain<A extends ActionObject = ActionObject, T extends string = string>(trigger: T, actions: A[], loader?: ActionChainInstancesLoader<A, T>): ActionChain<A, T>;
declare function createActionChain<A extends ActionObject = ActionObject, T extends string = string>(args: {
    actions: A[];
    trigger: T;
    loader?: ActionChainInstancesLoader<A, T>;
}): ActionChain<A, T>;
export default createActionChain;
