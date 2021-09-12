import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import { VisitorCreation } from '../types'
import { is } from '../../utils.js'

export interface ComponentsVisitorContext {
  componentTypes: string[]
  componentObjects: nt.ComponentObject[]
  componentsStats: Record<string, number>
}

const componentsVisitor: VisitorCreation<ComponentsVisitorContext> = (
  aggregator,
  options,
) => {
  const enabledFeatures = {
    componentTypes: !!options?.componentTypes,
    componentObjects: !!options?.componentObjects,
    componentsStats: !!options?.componentsStats,
  } as Record<keyof ComponentsVisitorContext, boolean>

  const context = {} as ComponentsVisitorContext

  for (const [key, value] of u.entries(enabledFeatures)) {
    if (key === 'componentTypes' && value) context.componentTypes = []
    if (key === 'componentObjects' && value) context.componentObjects = []
    if (key === 'componentsStats' && value) context.componentsStats = {}
  }

  return {
    context,
    visit: {
      Map: (
        { node },
        { componentTypes, componentObjects, componentsStats },
      ) => {
        if (is.map.component(node)) {
          const componentType = node.get('type') as string
          const componentObject = node.toJSON() as nt.ComponentObject

          if (enabledFeatures.componentTypes) {
            if (!componentTypes.includes(componentType)) {
              componentTypes.push(componentType)
            }
          }

          if (enabledFeatures.componentsStats) {
            if (!u.isNum(componentsStats[componentType])) {
              componentsStats[componentType] = 0
            }
            componentsStats[componentType]++
          }

          if (enabledFeatures.componentObjects) {
            componentObjects.push(componentObject)
          }
        }
      },
    },
  }
}

export default componentsVisitor
