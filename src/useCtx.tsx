import { AppContext } from './types'
import { createCtx } from './utils/reactHelpers'

const [useCtx, Provider] = createCtx<AppContext>()

export { Provider }

export default useCtx
