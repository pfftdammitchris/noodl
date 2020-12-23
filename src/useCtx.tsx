import { Context } from './types'
import { createCtx } from './utils/reactHelpers'

const [useCtx, Provider] = createCtx<Context>()

export { Provider }

export default useCtx
