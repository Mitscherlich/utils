export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined'
export const isPrimitive = (val: any): val is string | number | boolean | symbol => {
  return (
    typeof val === 'string'
    || typeof val === 'number'
    || typeof val === 'boolean'
    || typeof val === 'symbol'
  )
}
export const isPromiseLike = (val: any): val is PromiseLike<any> => {
  return val && typeof val.then === 'function'
}
