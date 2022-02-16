import y from 'yaml'

export type VisitKey<N = unknown> = Parameters<y.visitorFn<N>>[0]
export type VisitNode<N = unknown> = Parameters<y.visitorFn<N>>[1]
export type VisitPath<N = unknown> = Parameters<y.visitorFn<N>>[2]

export interface ApiVisitor<N = unknown> {
  (args: {
    store: Record<string, any>
    page: string
    key: VisitKey<N>
    node: VisitNode<N>
    path: VisitPath<N>
  }): ReturnType<y.visitorFn<N>>
}

export interface ApiVisitorFn<N = unknown> {
  (args: {
    page: string
    key: number | 'key' | 'value'
    node: N
    path: (y.Node | y.Document | y.Pair)[]
  }): void | ApiVisitorMap
}

export interface ApiVisitorMap {
  Scalar?: ApiVisitorFn
  Pair?: ApiVisitorFn
  Map?: ApiVisitorFn
  Seq?: ApiVisitorFn
  Value?: ApiVisitorFn
}

export interface PreWrappedApiVisitor<N = unknown> {
  (args: { key: VisitKey<N>; node: VisitNode<N>; path: VisitPath<N> }): void
}
