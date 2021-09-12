import { createCtx } from '../../utils/reactHelpers.js'
import { SettingsContext } from './types.js'

const [useSettingsCtx, Provider] = createCtx<SettingsContext>()

export { Provider }

export default useSettingsCtx
