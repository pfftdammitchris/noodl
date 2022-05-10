import * as u from '@jsmanifest/utils'
import createMetadataExtractor from './validate'
import { Value } from './constants'

export interface PluginObject {
  //
}

const m = createMetadataExtractor()

export const defaultPlugins = {
  required: [],
  action: m.register({
    keys: {
      actionType: {
        nullable: false,
        type: Value.String,
      },
    },
  }),
  component: m.register({
    keys: {
      type: {
        nullable: false,
        type: Value.String,
      },
      children: {
        type: Value.Array,
      },
      style: {
        type: [Value.String, Value.Object],
      },
    },
  }),
}
