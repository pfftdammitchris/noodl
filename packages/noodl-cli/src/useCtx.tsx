import type { App } from './types'
import { createCtx } from './utils/reactHelpers.js'

const [useCtx, Provider] = createCtx<App.Context>()

export { Provider }

export default useCtx
