import { Draft } from 'immer'
import {
  noodlActionTypes,
  noodlComponentTypes,
  noodlContentTypes,
  eventTypes,
} from './constants'

export interface NOODLPage {
  [pageName: string]: NOODLPageObject
}

export interface NOODLPageObject {
  components: NOODLComponent[]
  lastTop?: string
  listData?: { [key: string]: any }
  final?: string // ex: "..save"
  init?: string | string[] // ex: ["..formData.edge.get", "..formData.w9.get"]
  module: string
  pageNumber?: string
  [key: string]: any
}

export type NOODLActionChainActionType = typeof noodlActionTypes[number]
export type NOODLActionTriggerType = typeof eventTypes[number]
export type NOODLComponentType = typeof noodlComponentTypes[number] | 'br'
export type NOODLContentType = typeof noodlContentTypes[number]

export interface NOODLComponent {
  type?: NOODLComponentType
  style?: NOODLStyle
  children?: NOODLComponent[]
  controls?: boolean
  dataKey?: string
  contentType?: NOODLContentType
  inputType?: string // our custom key
  itemObject?: any
  isEditable?: boolean // specific to textView components atm
  iteratorVar?: string
  listObject?: '' | any[]
  maxPresent?: string // ex: "6" (Currently used in components with type: list)
  onClick?: NOODLChainActionObject[]
  onHover?: NOODLChainActionObject[]
  options?: string[]
  path?: string
  pathSelected?: string
  poster?: string
  placeholder?: string
  resource?: string
  required?: 'true' | 'false' | boolean
  selected?: string
  src?: string // our custom key
  text?: string
  textSelectd?: string
  textBoard?: NOODLTextBoard
  'text=func'?: any
  viewTag?: string
  videoFormat?: string
}

/* -------------------------------------------------------
    ---- ACTIONS
  -------------------------------------------------------- */

export type NOODLGotoAction =
  | NOODLChainActionGotoURL
  | NOODLChainActionGotoObject

export type NOODLChainActionGotoURL = string

export interface NOODLChainActionGotoObject {
  destination?: string
  [key: string]: any
}

export interface NOODLChainActionObjectBase {
  actionType: NOODLActionChainActionType
}

export type NOODLChainActionObject =
  | NOODLChainActionBuiltInObject
  | NOODLChainActionEvalObject
  | NOODLChainActionPageJumpObject
  | NOODLChainActionPopupBaseObject
  | NOODLChainActionPopupDismissObject
  | NOODLChainActionRefreshObject
  | NOODLChainActionSaveObjectObject
  | NOODLChainActionUpdateObject

export interface NOODLChainActionBuiltInObject
  extends NOODLChainActionObjectBase {
  actionType: 'builtIn'
  funcName: string
}

export interface NOODLChainActionEvalObject extends NOODLChainActionObjectBase {
  actionType: 'evalObject'
  object?: any
  [key: string]: any
}

export interface NOODLChainActionPageJumpObject
  extends NOODLChainActionObjectBase {
  actionType: 'pageJump'
  destination: string
}

export interface NOODLChainActionRefreshObject
  extends NOODLChainActionObjectBase {
  actionType: 'refresh'
}

export interface NOODLChainActionSaveObjectObject
  extends NOODLChainActionObjectBase {
  actionType: 'saveObject'
  object: [string, (...args: any[]) => any] | ((...args: any[]) => any)
}

export type NOODLChainActionUpdateObject<T = any> =
  | {
      actionType: 'updateObject'
      object: T
    }
  | {
      actionType: 'updateObject'
      dataKey: string
      dataObject: string
    }

export interface NOODLChainActionPopupBaseObject
  extends NOODLChainActionObjectBase {
  actionType: 'popUp'
  popUpView: string
}

export interface NOODLChainActionPopupDismissObject
  extends NOODLChainActionObjectBase {
  actionType: 'popUpDismiss'
  popUpView: string
}

/* -------------------------------------------------------
  ---- STYLING
-------------------------------------------------------- */

export interface NOODLStyle {
  align?: NOODLStyleAlign
  axis?: 'horizontal' | 'vertical'
  activeColor?: string // ex: ".colorTheme.highLightColor"
  border?: NOODLStyleBorderObject
  color?: string
  colorDefault?: string
  colorSelected?: string
  fontSize?: string
  fontFamily?: string
  fontStyle?: 'bold' | string
  height?: string
  isHidden?: boolean
  isHideCondition?: string // ex: "isPatient"
  left?: string
  required?: string | boolean
  outline?: string
  onHover?: string // ex: "surroundborder"
  textAlign?: NOODLStyleTextAlign
  textColor?: string
  top?: string
  width?: string
  shadow?: string // ex: "false"
  [styleKey: string]: any
}

export interface NOODLStyleBorderObject {
  style?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | 1 | 2 | 3 | 4 | 5 | 6 | 7
  width?: string | number
  color?: string | number
  line?: string // ex: "solid"
}

export type NOODLStyleTextAlign =
  | 'left'
  | 'center'
  | 'right'
  | NOODLStyleAlign
  | NOODLStyleTextAlignObject

export interface NOODLStyleTextAlignObject {
  x?: 'left' | 'center' | 'right'
  y?: 'left' | 'center' | 'right'
}

export type NOODLStyleAlign = 'centerX' | 'centerY'

export type NOODLTextBoard = (
  | NOODLTextBoardTextObject
  | NOODLTextBoardBreakLine
)[]

export type NOODLTextBoardBreakLine = 'br'

export interface NOODLTextBoardTextObject {
  text?: string
  color?: string
}

/* -------------------------------------------------------
---- LIB TYPES
-------------------------------------------------------- */

export interface IComponent<T extends ProxiedComponent = any> {
  action: any
  id: string | undefined
  keys: string[]
  length: number
  parentId?: string
  raw: T
  resolved: boolean
  status: 'drafting' | 'idle'
  stylesTouched: string[]
  stylesUntouched: string[]
  style: NOODLStyle
  touched: string[]
  type: NOODLComponentType | undefined
  untouched: string[]
  assign(
    key: string | { [key: string]: any },
    value?: { [key: string]: any },
  ): this
  assignStyles(styles: Partial<NOODLStyle>): this
  child(index?: number): IComponent | null
  children(): IComponent[] | undefined
  createChild(props: Partial<NOODLComponent | ProxiedComponent>): IComponent
  done(options?: { mergeUntouched?: boolean }): NOODLComponentProps
  draft(): this
  get<K extends keyof ProxiedComponent>(
    key: K,
    styleKey?: keyof NOODLStyle,
  ): ProxiedComponent[K]
  get<K extends keyof ProxiedComponent>(
    key: K[],
    styleKey?: keyof NOODLStyle,
  ): Record<K, ProxiedComponent[K]>
  getCurrentStyles(): NOODLStyle | undefined
  getStyle<K extends keyof NOODLStyle>(styleKey: K): NOODLStyle[K]
  has(key: string, styleKey?: keyof NOODLStyle): boolean
  hasParent(): boolean
  hasStyle<K extends keyof NOODLStyle>(styleKey: K): boolean
  isHandled(key: string): boolean
  isTouched(key: string): boolean
  isStyleTouched(styleKey: string): boolean
  isStyleHandled(key: string): boolean
  merge(key: string | { [key: string]: any }, value?: any): this
  parent(): IComponent | null
  remove(key: string, styleKey?: keyof NOODLStyle): this
  removeChild(child?: IComponent | number): this
  removeStyle<K extends keyof NOODLStyle>(styleKey: K): this
  set(key: string, value?: any, styleChanges?: any): this
  setId(id: string): this
  setParent(parent: IComponent | null): this
  setStyle<K extends keyof NOODLStyle>(styleKey: K, value: any): this
  snapshot(): (ProxiedComponent | NOODLComponentProps) & {
    _touched: string[]
    _untouched: string[]
    _touchedStyles: string[]
    _untouchedStyles: string[]
    _handled: string[]
    _unhandled: string[]
    noodlType: NOODLComponentType | undefined
  }
  toJS(): ProxiedComponent
  toString(): string
  touch(key: string): this
  touchStyle(styleKey: string): this
}

export interface NOODLComponentProps
  extends Omit<NOODLComponent, 'children' | 'options' | 'type'> {
  'data-key'?: string
  'data-listdata'?: any[]
  'data-listid'?: any
  'data-name'?: string
  'data-value'?: string
  'data-ux'?: string
  custom?: boolean
  children?: string | number | NOODLComponentProps | NOODLComponentProps[]
  noodlType: NOODLComponentType
  id: string
  items?: any[]
  options?: SelectOption[]
  type: keyof Omit<HTMLElementTagNameMap, 'object'>
  [key: string]: any
}

export interface Page {
  name: string
  object?: null | NOODLPageObject
}

export interface SelectOption {
  key: string
  label: string
  value: string
}

/* -------------------------------------------------------
  ---- LIB ACTIONS / ACTION CHAIN
-------------------------------------------------------- */

export type ActionChainStatus =
  | null
  | 'in.progress'
  | 'done'
  | 'timed-out'
  | { aborted: boolean | { reasons: string[] } }
  | { error: Error }

export interface ActionChainSnapshot<Actions extends any[]> {
  currentAction: Actions[number]
  original: NOODLChainActionObject[]
  queue: Actions
  status: ActionChainStatus
}

export interface ActionChainCallbackOptions<Actions extends any[]> {
  abort(reason?: string | string[]): Promise<any>
  error?: Error
  event: EventTarget | undefined
  parser?: ResolverOptions['parser']
  snapshot: ActionChainSnapshot<Actions>
}

export interface ActionSnapshot<OriginalAction = any> {
  actionType: string
  hasExecutor: boolean
  id: string
  original: OriginalAction
  status: ActionStatus
  timeout: {
    running: boolean
    remaining: number | null
  }
}

export type ActionStatus =
  | null
  | 'pending'
  | 'resolved'
  | 'aborted'
  | 'error'
  | 'timed-out'

export type ParsedChainActionUpdateObject = NOODLChainActionUpdateObject<
  ((...args: any[]) => Promise<any>)[] | ((...args: any[]) => Promise<any>)
>

/* -------------------------------------------------------
  ---- LIB | LISTENERS
-------------------------------------------------------- */

export interface ActionChainActionCallback<ActionObject = any> {
  (
    action: ActionObject,
    options: ActionChainActionCallbackOptions,
  ): ActionChainActionCallbackReturnType
}

export interface ActionChainActionCallbackOptions<T = any>
  extends ComponentResolverStateGetters {
  abort?(
    reason?: string | string[],
  ): Promise<IteratorYieldResult<any> | IteratorReturnResult<any> | undefined>
  component: T
  context: ResolverConsumerOptions['context']
  dataValues?: Record<string, any>
  event?: Event
  error?: Error
  parser: ResolverConsumerOptions['parser']
  snapshot: ActionChainSnapshot<any[]>
  trigger?: NOODLActionTriggerType
}

export interface BuiltInActions {
  [funcName: string]: <A extends {}>(
    action: A,
    options: ActionChainActionCallbackOptions,
  ) => Promise<any> | any
}

export interface LifeCycleListener<T = any> {
  (component: T, options: ResolverConsumerOptions):
    | Promise<'abort' | undefined | void>
    | 'abort'
    | undefined
    | void
}

export type ActionChainLifeCycleComponentListeners = Record<
  NOODLComponentType,
  LifeCycleListener
> & {
  finally?: LifeCycleListener
}

export type ActionChainActionCallbackReturnType =
  | Promise<'abort' | undefined | void>
  | 'abort'
  | undefined
  | void

export interface ComponentResolverState {
  drafted: {
    [componentId: string]: IComponent
  }
  lists: {
    [listId: string]: any[]
  }
  pending: {
    [childComponentId: string]: any
  }
}

export interface ComponentResolver {
  init(proxiedComponent: ProxiedComponent): this
  finalize(component: IComponent): this
  getState(): ComponentResolverState
  getDraftedNodes(): ComponentResolverState['drafted']
  getDraftedNode<K extends keyof ComponentResolverState['drafted']>(
    component: string | IComponent,
  ): ComponentResolverState['drafted'][K]
  getList<K extends keyof ComponentResolverState['lists']>(
    listId: string,
  ): ComponentResolverState['lists'][K] | undefined
  getListItem<K extends keyof ComponentResolverState['lists']>(
    listId: string | undefined,
    index: number | undefined,
    defaultValue?: any,
  ): ComponentResolverState['lists'][K][number]
  consume<K extends keyof ComponentResolverState['pending']>(
    component: IComponent<any>,
  ): ComponentResolverState['pending'][K] | undefined
  setConsumerData(child: IComponent, data: any): this
  setConsumerData(childId: string, data: any): this
  setConsumerData(child: string | IComponent, data: any): this
  setDraftNode(component: IComponent): this
  setList(listId: string, data: any[]): this
  addLifecycleListener(
    name: string | Function | { [key: string]: any },
    fn?: Function | { [key: string]: any },
  ): this
  removeLifeCycleListener(name: string): this
  hasLifeCycle(name: string | Function): boolean
  getLifeCycle<K extends keyof LifeCycleListeners>(
    name: K,
  ): (Function & { finally?: LifeCycleListener }) | undefined
  createActionChain(
    actions: NOODLChainActionObject[],
    { trigger }: { trigger?: NOODLActionTriggerType },
  ): (event: Event) => Promise<any>
  addResolvers(...resolvers: Resolver[]): this
  removeResolver(resolver: Resolver): this
  callResolvers(
    component: IComponent,
    resolverConsumerOptions: ResolverConsumerOptions,
  ): void
  createSrc(path: string): string
  getAssetsUrl(): string
  getParser(): RootsParser
  getResolverOptions(additionalOptions?: any): ResolverOptions
  getResolverConsumerOptions<T extends {}>(
    opts: { component: IComponent } & T,
  ): ResolverConsumerOptions
  getResolverContext(): ResolverContext
  getRoots(): { [key: string]: any } | null
  getStateGetters(): ComponentResolverStateGetters
  getStateSetters(): ComponentResolverStateSetters
  getFallbackDataValue(component: IComponent, defaultValue?: string): any
  resolve(proxiedComponent: ProxiedComponent): NOODLComponentProps
  setAssetsUrl(assetsUrl: string): this
  setPage(page?: Page): this
  setResolvers(...resolvers: Resolver[]): this
  setRoot(key: string | { [key: string]: any }, value?: any): this
  hasViewport(): boolean
  getViewport(): IViewport | undefined
  setViewport({ width, height }: { width?: number; height?: number }): this
  snapshot(draft: ProxiedDraftComponent): ProxiedComponent
}

export type ComponentResolverStateHelpers = ComponentResolverStateGetters &
  ComponentResolverStateSetters

export type ComponentResolverStateGetters = Pick<
  ComponentResolver,
  | 'consume'
  | 'getList'
  | 'getListItem'
  | 'getState'
  | 'getDraftedNodes'
  | 'getDraftedNode'
>

export type ComponentResolverStateSetters = Pick<
  ComponentResolver,
  'setConsumerData' | 'setDraftNode' | 'setList'
>

export type OnEvalObject = ActionChainActionCallback<NOODLChainActionEvalObject>

export type OnGoto = ActionChainActionCallback<
  NOODLChainActionGotoURL | NOODLChainActionGotoObject
>

export type OnPageJump = ActionChainActionCallback<
  NOODLChainActionPageJumpObject
>

export type OnPopup = ActionChainActionCallback<NOODLChainActionPopupBaseObject>

export type OnPopupDismiss = ActionChainActionCallback<
  NOODLChainActionPopupDismissObject
>

export interface OnSaveObject {
  (
    action: NOODLChainActionSaveObjectObject,
    options: ActionChainActionCallbackOptions,
  ): Promise<any>
}

export interface OnRefresh {
  (
    action: NOODLChainActionRefreshObject,
    options: ActionChainActionCallbackOptions,
  ): Promise<any>
}

export interface OnUpdateObject {
  (
    action: ParsedChainActionUpdateObject,
    options: ActionChainActionCallbackOptions,
  ): Promise<any>
}

// Listed in order of invocation
export interface LifeCycleListeners {
  onAction?: {
    builtIn?: {
      [funcName: string]: ActionChainActionCallback<
        NOODLChainActionBuiltInObject
      >
    }
    evalObject?: ActionChainActionCallback<NOODLChainActionEvalObject>
    goto?: ActionChainActionCallback<
      NOODLChainActionGotoURL | NOODLChainActionGotoObject
    >
    pageJump?: ActionChainActionCallback<NOODLChainActionPageJumpObject>
    popUp?: ActionChainActionCallback<NOODLChainActionPopupBaseObject>
    popUpDismiss?: ActionChainActionCallback<NOODLChainActionPopupDismissObject>
    saveObject?: (
      action: NOODLChainActionSaveObjectObject,
      options: ActionChainActionCallbackOptions,
    ) => Promise<any>
    refresh?(
      action: NOODLChainActionRefreshObject,
      options: ActionChainActionCallbackOptions,
    ): Promise<any>
    updateObject?: (
      action: ParsedChainActionUpdateObject,
      options: ActionChainActionCallbackOptions,
    ) => Promise<any>
  }
  onBeforeResolve?: LifeCycleListener | ActionChainLifeCycleComponentListeners
  onBeforeResolveStyles?:
    | ActionChainLifeCycleComponentListeners
    | LifeCycleListener
  onChainStart?: <Actions extends any[]>(
    actions: Actions,
    options: ActionChainCallbackOptions<Actions>,
  ) => ActionChainActionCallbackReturnType
  onChainAborted?: <Action = any>(
    action: Action,
    options: ActionChainCallbackOptions<Action[]>,
  ) => ActionChainActionCallbackReturnType
  onOverrideDataValue?: (key: string) => void
  onBuiltinMissing?: <Action = any>(
    action: Action,
    options: ActionChainCallbackOptions<Action[]>,
  ) => void
  onChainEnd?: <Actions extends any[]>(
    actions: Actions,
    options: ActionChainCallbackOptions<Actions>,
  ) => Promise<any>
  onChainError?: <Action = any>(
    error: Error,
    action: Action,
    options: ActionChainCallbackOptions<Action[]>,
  ) => Promise<any>
  onAfterResolve?: ActionChainLifeCycleComponentListeners | LifeCycleListener
}

export type ProxiedDraftComponent = Draft<ProxiedComponent>

export interface ProxiedComponent extends Omit<NOODLComponent, 'children'> {
  blueprint?: any
  custom?: boolean
  id?: string
  itemObject?: any
  items?: any[]
  listId?: string
  listItem?: any
  listItemIndex?: number
  listObject?: '' | any[]
  noodlType?: NOODLComponentType
  parentId?: string
  style?: NOODLStyle
  children?:
    | string
    | number
    | NOODLComponent
    | NOODLComponent[]
    | NOODLComponentProps
    | NOODLComponentProps[]
}

export interface ResolveComponent<T = any> {
  (component: ProxiedComponent, options: ResolverOptions): T
}

export type Resolver<T = any> = ((
  component: T,
  resolverConsumerOptions: ResolverConsumerOptions,
) => void) & {
  getChildren?: Function
}

export interface ResolverOptions
  extends LifeCycleListeners,
    ComponentResolverStateHelpers {
  context: ResolverContext
  parser: RootsParser
  resolvers: Resolver[]
  resolveComponent: ResolveComponent
}

export interface ResolverConsumerOptions<T = any>
  extends ComponentResolverStateHelpers {
  context: ResolverContext
  component: T
  createActionChain: ComponentResolver['createActionChain']
  createSrc: ComponentResolver['createSrc']
  getFallbackDataValue: ComponentResolver['getFallbackDataValue']
  parser: ResolverOptions['parser']
  resolveComponent: ResolveComponent
  showDataKey: boolean
}

export interface ResolverContext {
  assetsUrl: string
  page: { name: string; object: null | NOODLPageObject }
  roots: Record<string, any>
  viewport: IViewport | undefined
}

export interface RootsParser<Root extends {} = any> {
  get<K extends keyof Root>(key: string): Root[K] | any
  getLocalKey(): string
  getByDataKey(dataKey: string, fallbackValue?: any): any
  mergeReference<T = any>(refKey: keyof T, originalObj: T): any
  nameField: {
    getKeys(key: string): string[]
  }
  parse(value: any): any
  parseDataKey(dataKey: string): string | undefined
  setLocalKey(key: string): this
}

export interface ViewportListener {
  (viewport: ViewportOptions): Promise<any> | any
}

export interface IViewport {
  width: number | undefined
  height: number | undefined
  isValid(): boolean
  onResize: ViewportListener | undefined
}

export interface ViewportOptions {
  width: number
  height: number
}