import { createCtx } from '../../utils/reactHelpers'
import { SettingsContext } from './types'

const [useSettingsCtx, Provider] = createCtx<SettingsContext>()

export { Provider }

export default useSettingsCtx
