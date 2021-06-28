export interface InvokeFn<O> {
	<RT = any>(o: O): RT
}

function createInvoke<O>(cb: InvokeFn<O>) {
	const invoke = function invoke(o: O) {
		return cb(o)
	}

	return invoke
}

export default createInvoke
