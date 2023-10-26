import { toString } from './common'

export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isBoolean = (val: any): val is boolean => typeof val === 'boolean'
export const isNumber = (val: any): val is number => typeof val === 'number'
export const isFunction = <T extends Function> (val: any): val is T => typeof val === 'function'
export const isPrimitive = (val: any): val is string | number | boolean | symbol => {
  return (
    isString(val)
    || isNumber(val)
    || isBoolean(val)
    || typeof val === 'symbol'
  )
}
export const isObject = (val: any): val is object => toString(val) === '[object Object]'
export const isUndefined = (val: any): val is undefined => toString(val) === '[object Undefined]'
export const isNull = (val: any): val is null => toString(val) === '[object Null]'
export const isRegExp = (val: any): val is RegExp => toString(val) === '[object RegExp]'
export const isDate = (val: any): val is Date => toString(val) === '[object Date]'
export function isPromiseLike(val: any): val is PromiseLike<any> {
  return val && typeof val.then === 'function'
}

// @ts-ignore
export const isWindow = (val: any): boolean => typeof window !== 'undefined' && toString(val) === '[object Window]'
// @ts-ignore
export const isBrowser = typeof window !== 'undefined'
