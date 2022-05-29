import { isDef } from './is'

export const hasOwnProperty = <T>(obj: T, v: PropertyKey) => {
  if (!isDef(obj))
    return false
  return Object.prototype.hasOwnProperty.call(obj, v)
}
