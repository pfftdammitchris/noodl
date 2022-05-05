import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import { LiteralUnion } from 'type-fest'
import yaml from 'yaml'
import { is } from '../../utils'
import { VisitorCreation } from '../types'

const { isDocument, isScalar, isPair, isMap, isSeq } = yaml

export interface ActionsVisitorContext {
  actionTypes: string[]
  actionObjects: nt.ComponentObject[]
  actionsStats: Record<string, number>
}

const actionsVisitor: VisitorCreation<{
  actionTypes: string[]
  actionObjects: nt.ComponentObject[]
  actionsStats: Record<LiteralUnion<'builtIn', string>, any>
}> = (aggregator, options) => {
  const enabledFeatures = {
    actionTypes: !!options?.actionTypes,
    actionObjects: !!options?.actionObjects,
    actionsStats: !!options?.actionsStats,
  } as Record<keyof ActionsVisitorContext, boolean>

  const context = {} as ActionsVisitorContext

  for (const [key, value] of u.entries(enabledFeatures)) {
    if (key === 'actionTypes' && value) context.actionTypes = []
    if (key === 'actionObjects' && value) context.actionObjects = []
    if (key === 'actionsStats' && value) context.actionsStats = {}
  }

  return {
    context,
    visit: {
      Pair: ({ node }, { actionTypes }) => {
        // if (enabledFeatures.actionTypes) {
        //   if (is.scalar.actionType(node.key) && isScalar(node.value)) {
        //     const actionType = node.value.value as string
        //     if (!actionTypes.includes(actionType)) {
        //       actionTypes.push(actionType)
        //     }
        //   }
        // }
      },
      Map: ({ node }, { actionObjects, actionsStats }) => {
        if (node?.has('actionType')) {
          if (enabledFeatures.actionObjects) {
            actionObjects.push(node.toJSON())
          }

          if (enabledFeatures.actionsStats) {
            const actionType = node.get('actionType') as string
            if (!u.isNum(actionsStats[actionType])) {
              actionsStats[actionType] = 0
            }
            if (actionType === 'builtIn') {
              const funcName = node.get('funcName') as string
              if (!u.isNum(actionsStats.builtIn[funcName])) {
                actionsStats.builtIn[funcName] = 0
              }
              actionsStats.builtIn[funcName]++
              actionsStats.builtIn.total++
            } else {
              actionsStats[actionType]++
            }
          }
        }
      },
    },
  }
}

export default actionsVisitor
