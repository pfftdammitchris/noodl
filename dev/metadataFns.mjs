import yaml from 'yaml'
import startCase from 'lodash/startCase.js'
import capitalize from 'lodash/capitalize.js'
import camelCase from 'lodash/camelCase.js'
import upperFirst from 'lodash/upperFirst.js'
import * as tsm from 'ts-morph'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import * as u from '@jsmanifest/utils'
import { getAbsFilePath } from 'noodl'
import {
  getJsType,
  getMapProperties,
  pascalCase,
  tsm as tsmUtils,
} from './utils.mjs'
import fs from 'fs-extra'
import path from 'path'

const ts = tsm.ts
const factory = ts.factory

const {
  isNode,
  isScalar,
  isPair,
  isMap,
  isSeq,
  Node: YAMLNode,
  Document: YAMLDocument,
  YAMLMap,
  YAMLSeq,
  Pair,
  Scalar,
  visit,
} = yaml

const { getNodeScalarTypeAliasType } = tsmUtils

/**
 * @param { import('noodl-metadata').Store } store
 * @param { Record<string, any> } root
 */
export function extractActions({ tsProject }, root, { onComplete }) {
  const sourceFile = tsProject.createSourceFile(
    getAbsFilePath('data/actions.ts'),
    ``,
    { overwrite: true, scriptKind: tsm.ScriptKind.TS },
  )

  const actionTypes = []
  const actionProperties = {}
  const emitObjects = []
  const gotoObjects = []

  function createPairPropertyMetadata() {
    const properties = {}

    const handleTypeOccurrence = (key, jsType) => {
      const propertyObject = properties[key]

      if (propertyObject) {
        if (u.isNum(propertyObject.typeOccurrences[jsType])) {
          propertyObject.typeOccurrences[jsType]++
        }
      }
    }

    const handleTypeValue = (key, value, metadata) => {
      const propertyObject = properties[key]
      if (propertyObject) {
        propertyObject.values.push({
          key,
          value,
          ...metadata,
        })
      }
    }

    const o = {
      /** @param { import('yaml').Pair } pair */
      add(pair, metadata) {
        const { key: keyNode, value: valueNode } = pair
        const key = String(keyNode)
        const jsType = getJsType(valueNode)

        if (!properties[key]) {
          properties[key] = {
            key,
            type: jsType,
            typeOccurrences: {
              string: 0,
              number: 0,
              object: 0,
              boolean: 0,
              null: 0,
              undefined: 0,
            },
            values: [],
          }
        }

        handleTypeOccurrence(key, jsType)
        handleTypeValue(key, valueNode, metadata)
      },
      get properties() {
        return properties
      },
    }

    return o
  }

  const pairPropertyMetadata = createPairPropertyMetadata()

  onComplete(() => {
    sourceFile.addTypeAlias({
      name: 'ActionType',
      isExported: true,
      type: actionTypes.reduce((acc, str) => {
        acc += `| '${str}' `
        return acc
      }, ''),
    })

    const actionPropertiesInterface = sourceFile.addInterface({
      name: 'ActionProperties',
      isExported: true,
    })

    for (const [key, value] of u.entries(pairPropertyMetadata.properties)) {
      const jsType = getJsType(value)
      actionPropertiesInterface.addProperty(
        factory.createPropertyAssignment(key, 'any'),
      )
      // actionPropertiesInterface
      //   .getProperties()
      //   .push(
      //     factory.createPropertyDeclaration(
      //       undefined,
      //       [factory.createModifier(tsm.SyntaxKind.ColonToken)],
      //       key,
      //       ts.SyntaxKind.QuestionToken,
      //       factory.createLiteralTypeNode(
      //         factory.createStringLiteral(jsType, true),
      //       ),
      //     ),
      //   )
    }
  })

  return (name, doc) => (key, node, path) => {
    if (isPair(node)) {
      if (isScalar(node.key) && u.isStr(node.key.value)) {
        const key = node.key.value

        if (key === 'actionType') {
          const actionType = String(node.value)
          if (!actionTypes.includes(actionType)) actionTypes.push(actionType)
        } else if (key === 'emit') {
          // emitObjects.push(node.value)
        } else if (key === 'goto') {
          // gotoObjects.push(node.value)
        }
      }
    } else if (isMap(node)) {
      node.items.forEach((pair) => {
        const { key: keyNode, value: valueNode } = pair
        if (isScalar(keyNode)) {
          if (u.isStr(keyNode.value)) {
            pairPropertyMetadata.add(pair)
          }
        }
      })
    }
  }
}

/**
 * @param { typeof store } store
 * @param { Record<string, any> } root
 */
export function extractBuiltInFns(store, root) {
  const { tsProject } = store

  store.builtInFns = {
    keys: [],
    total: 0,
    values: [],
  }

  const sourceFile = tsProject.createSourceFile(
    getAbsFilePath('data/builtInFns.ts'),
    `/**
 * TypeScript Typings for =.builtIn funcs generated from the NOODL
*/

`,
    { overwrite: true, scriptKind: tsm.ScriptKind.TS },
  )

  const { keys, values } = store.builtInFns

  return (name, doc) => (key, node, path) => {
    if (isPair(node)) {
      if (isScalar(node.key) && u.isStr(node.key.value)) {
        const key = node.key.value

        if (nt.Identify.evalReference(key)) {
          if (key.startsWith('=.builtIn.')) {
            const rawName = key.replace('=.builtIn.', '') || ''
            const typeName = `BuiltIn${pascalCase(rawName.replace(/\./g, ' '))}`

            if (isScalar(node.value)) {
              // const tsTypeAlias = sourceFile.addTypeAlias({
              //   name: typeName,
              //   isExported: true,
              //   kind: tsm.StructureKind.TypeAlias,
              // })
              // tsTypeAlias.setType(tsm.getNodeScalarTypeAliasType(node.value))
            } else if (isMap(node.value)) {
              let tsInterface = sourceFile.getInterface(typeName)

              if (!tsInterface) {
                const interfaceProps = {
                  name: typeName,
                  isExported: true,
                  kind: tsm.StructureKind.Interface,
                  properties: [],
                }

                node.value.items.forEach((item) => {
                  interfaceProps.properties.push({
                    name: String(item.key),
                    hasQuestionToken: true,
                    type: getNodeScalarTypeAliasType(item.value),
                  })
                })

                tsInterface = sourceFile.addInterface(interfaceProps)
              }

              node.value.items.forEach((item) => {
                const key = String(item.key)
                tsInterface.getProperties().push({
                  name: key,
                  hasQuestionToken: true,
                  type: getNodeScalarTypeAliasType(item.value),
                })
              })
            } else if (isSeq(node.value)) {
              // const tsTypeAlias = sourceFile.addTypeAlias({
              //   name: item.key,
              //   isExported: true,
              //   kind: tsm.StructureKind.Property,
              //   type: tsm.getNodeScalarTypeAliasType(node.value),
              // })
            }
          }
        }
      }
    }
  }
}
