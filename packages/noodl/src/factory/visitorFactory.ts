import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import yaml from 'yaml'
import curry from 'lodash/curry.js'

export type Store<K extends string = string> = Record<K, any>

function createVisitorFactory<RK extends string = string>(
  store: Store,
  root: Record<RK, any>,
) {
  const visit = function visit(
    ...[key, node, path]: Parameters<yaml.visitorFn<any>>
  ) {
    //
  }

  const visitor = function visitor([name, doc]: [
    name: string,
    doc: yaml.Document,
  ]) {
    return visit
  }

  return visitor
}

export default createVisitorFactory
