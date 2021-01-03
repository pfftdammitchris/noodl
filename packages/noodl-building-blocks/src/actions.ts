import * as T from 'noodl-types'

export const createAction = <C extends T.ActionObject = any>(
	actionType: string,
	opts?: Partial<C>,
) => (actionProps?: Partial<C>): C =>
	base(actionType, { ...opts, ...actionProps })

export function base<C extends T.ActionObject = T.ActionObject>(
	actionType: string,
	opts?: Partial<T.ActionObject>,
): C {
	return { actionType, ...opts } as C
}

export const builtIn = createAction<T.BuiltInActionObject>('builtIn')

export const evalObject = createAction<T.EvalActionObject>('evalObject')

export const pageJump = createAction<T.PageJumpActionObject>('pageJump')

export const popUp = createAction<T.PopupActionObject>('popUp')

export const popUpDismiss = createAction<T.PopupDismissActionObject>(
	'popUpDismiss',
)

export const refresh = createAction<T.RefreshActionObject>('refresh')

export const saveObject = createAction<T.SaveActionObject>('saveObject')

export const updateObject = createAction<T.UpdateActionObject>('updateObject')
