import { createCtx } from '../../utils/reactHelpers'
import { GetServerFiles } from './types'

const [useServerFilesCtx, Provider] = createCtx<GetServerFiles.Context>()

export { Provider }

export default useServerFilesCtx
