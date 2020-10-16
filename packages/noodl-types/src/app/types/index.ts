import { ActionChainActionCallback, NOODLBuiltInObject } from 'noodl-ui'

export * from './commonTypes'
export * from './libExtensionTypes'
export * from './meetingTypes'
export * from './pageTypes'

export type BuiltInFuncName =
  | 'checkField'
  | 'checkUsernamePassword'
  | 'checkVerificationCode'
  | 'enterVerificationCode'
  | 'goBack'
  | 'goto'
  | 'lockApplication'
  | 'logOutOfApplication'
  | 'logout'
  | 'redraw'
  | 'signIn'
  | 'signUp'
  | 'signout'
  | 'toggleCameraOnOff'
  | 'toggleMicrophoneOnOff'
  | 'UploadDocuments'
  | 'UploadFile'
  | 'UploadPhoto'

export type BuiltInActions<
  Obj extends NOODLBuiltInObject = NOODLBuiltInObject
> = Partial<Record<BuiltInFuncName, ActionChainActionCallback<Obj>>>
