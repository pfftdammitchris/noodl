import { createCtx } from '../../utils/reactHelpers'
import { ServerFilesContext } from './types'

const [useServerFilesCtx, Provider] = createCtx<ServerFilesContext>()

export { Provider }

export default useServerFilesCtx
