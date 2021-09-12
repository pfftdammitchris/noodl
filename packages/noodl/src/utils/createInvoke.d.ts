export interface InvokeFn<O> {
    <RT = any>(o: O): RT;
}
declare function createInvoke<O>(cb: InvokeFn<O>): (o: O) => any;
export default createInvoke;
