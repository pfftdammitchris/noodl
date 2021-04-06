import { App } from './types'
import { createCtx } from './utils/reactHelpers'

const [useCtx, Provider] = createCtx<App.Context>()

export { Provider }

export default useCtx
