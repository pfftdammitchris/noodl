import isString from 'lodash/isString'

export type ValidateName =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'password'
  | 'phone'
  | 'phoneNumber'
  | 'confirmPassword'
  | 'verificationCode'

export interface Validator {
  (...args: any[]): string | void
}

export interface Validate {
  [key: string]: Validator
}

const validate: Validate = {}

function _createMultiple(options: { keys: string[]; validate: Validator }) {
  options.keys.forEach((key) => {
    validate[key] = (...args: any[]) => {
      return options.validate(key, ...args)
    }
  })
}

_createMultiple({
  keys: ['firstName', 'lastName'],
  validate: (key: string, value: string) => {
    if (!value) return 'First name is required'
  },
})

_createMultiple({
  keys: ['phone', 'phoneNumber'],
  validate: (key, value: any) => {
    if (!value) return 'Phone number is required'
  },
})

validate.email = function (email: unknown) {
  if (isString(email)) {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!regex.test(email)) {
      return 'The email is invalid'
    }
  }
}

_createMultiple({
  keys: ['username', 'userName'],
  validate: (key, value: any) => {
    if (isString(value)) {
      if (!value) return 'Username is required'
      if (value.length < 5) return 'The userName is too short'
    }
  },
})

validate.password = function (value: any) {
  if (!value) return 'Password is required'
  if (String(value).length < 6) {
    return 'The password must be a minimum of 6 characters'
  }
  return undefined
}

validate.confirmPassword = function (options) {
  if (typeof options === 'string') {
    console.error(
      'Please pass { password, confirmPassword } instead of a string value when validating confirmPassword fields',
    )
    // Let the validator succeed to prevent the app from crashing, but still warn the dev
    return undefined
  }
  const { password, confirmPassword } = options
  if (password !== confirmPassword) return 'Your passwords do not match'
  return undefined
}

validate.verificationCode = function (value: any) {
  if (!value) return 'Please enter your 6-digit verification code'
  if (value.length < 6) return 'Your 6-digit verification code is too short'
  if (/[a-zA-Z]/.test(value)) return 'Your code should only consist of numbers'
  return undefined
}

export default validate