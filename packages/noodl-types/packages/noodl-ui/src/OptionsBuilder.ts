import _ from 'lodash'
import {
  Page,
  IResolver,
  ConsumerOptions,
  ResolverContext,
  ResolverOptions,
} from './types'
import Viewport from './Viewport'

class ResolverOptionsBuilder {
  assetsUrl: string = ''
  page: Page = {
    name: '',
    object: null,
  }
  parser: ResolverOptions['parser']
  resolvers: IResolver[] = []
  roots: { [key: string]: any } | null = null
  showDataKey: boolean // defaults to true
  viewport: Viewport | null = null

  constructor({
    showDataKey,
    viewport,
  }: { showDataKey?: boolean; viewport?: Viewport } = {}) {
    this.showDataKey = typeof showDataKey === 'boolean' ? showDataKey : true
    if (viewport) this.viewport = viewport
  }

  build<T = { [key: string]: any }>({
    type = 'default',
    include,
  }: { type?: 'default' | 'consumer' | 'context'; include?: T } = {}):
    | ResolverOptions
    | Pick<ConsumerOptions, 'context' | 'parser' | 'showDataKey'>
    | ResolverContext {
    const common = {
      assetsUrl: this.assetsUrl || '',
      page: this.page || { name: '', object: null },
      roots: this.roots || {},
      viewport: this.viewport || null,
    }

    switch (type) {
      // Custom callbacks/resolvers receive this instead as their options
      case 'consumer':
        return {
          context: common as ResolverContext,
          parser: this.parser,
          showDataKey: this.showDataKey,
          ...include,
        }
      case 'context':
        return common as ResolverContext
      case 'default':
      default:
        return {
          context: common as ResolverContext,
          resolvers: this.resolvers || [],
          ...include,
        } as ResolverOptions
    }
  }

  setAssetsUrl(assetsUrl: string) {
    this.assetsUrl = assetsUrl
    return this
  }

  setPage(page?: Page) {
    if (page && page !== this.page) this.page = page
    return this
  }

  setPageName(pageName: string) {
    this.page['name'] = pageName
    return this
  }

  setPageObject(pageObject: Page['object']) {
    this.page['object'] = pageObject
    return this
  }

  setParser(parser: ResolverOptions['parser']) {
    this.parser = parser
    return this
  }

  setResolvers(...resolvers: IResolver[]) {
    if (_.isArray(resolvers[0])) {
      resolvers = resolvers[0]
    }
    this.resolvers = resolvers
    return this
  }

  setRoots(roots: { [key: string]: any }) {
    this.roots = roots
    return this
  }

  setViewport(viewport: Viewport) {
    this.viewport = viewport
    return this
  }

  setViewportWidth(value: number) {
    if (this.viewport) {
      this.viewport.width = value
    }
    return this
  }

  setViewportHeight(value: number) {
    if (this.viewport) {
      this.viewport.height = value
    }
    return this
  }

  addResolvers(...resolvers: IResolver[]) {
    // Ensure the array is in the right format based on what shape they provided
    if (_.isArray(resolvers[0])) {
      resolvers = resolvers[0]
    }
    _.forEach(resolvers, (r) => {
      if (!this.resolvers.includes(r)) {
        this.resolvers.push(r)
      }
    })
    return this
  }

  removeResolver(resolver: IResolver) {
    if (this.resolvers.includes(resolver)) {
      const filterer = (r: IResolver) => r !== resolver
      this.resolvers = _.filter(this.resolvers, filterer)
    }
    return this
  }

  removeResolvers(resolvers: IResolver | IResolver[]) {
    if (_.isArray(resolvers)) {
      _.forEach(resolvers, this.removeResolver)
    } else {
      this.removeResolver(resolvers)
    }
    return this
  }
}

export default ResolverOptionsBuilder
