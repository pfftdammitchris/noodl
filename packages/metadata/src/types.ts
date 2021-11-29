import type { Project } from 'ts-morph'
import * as mutils from './utils.js'

export interface Store {
  tsProject: Project
}

export type LogLevel = 'debug' | 'error' | 'info' | 'verbose' | 'warn'

export interface Hooks {
  onComplete?: (
    store: Store,
    root: Record<string, any>,
    metadataUtils: typeof mutils,
  ) => void
}

export type Utils = Pick<typeof mutils, 'is' | 'pascalCase'> &
  Pick<typeof mutils, 'tsm'>['tsm'] & {
    onComplete?: (fn: Hooks['onComplete']) => void
  }

export interface PropertyMeta<K extends string, V = any> {
  key: K
  value?: V
  pageNames: string[]
  typeOccurrences: {
    array?: PropertyTypeOccurrence
    boolean?: PropertyTypeOccurrence
    object?: PropertyTypeOccurrence
    number?: PropertyTypeOccurrence
    null?: PropertyTypeOccurrence
    string?: PropertyTypeOccurrence
    undefined?: PropertyTypeOccurrence
  }
}

export interface PropertyTypeOccurrence {
  config: string | null
  pages: {
    [name: string]: {
      occurrences: number
      values?: any[]
    }
  }
  total: number
}
