import type { Nullable } from './types'

/**
 * Convert value to `Array<T>`
 */
export const toArray = <T>(array?: Nullable<T | T[]>): T[] => {
  array = array || []
  return Array.isArray(array) ? array : [array]
}

/**
 * Unique an array
 */
export const uniq = <T>(array: readonly T[]): T[] => {
  return Array.from(new Set(array))
}

/**
 * Get nth item of Array. Negative for backward
 */
export const at = <T>(array: readonly T[], index: number): T | undefined => {
  const len = array.length
  if (!len)
    return undefined

  if (index < 0)
    index += len

  return array[index]
}

/**
 * Get last item
 */
export const last = <T>(array: readonly T[]): T | undefined => {
  return at(array, array.length - 1)
}

/**
 * Remove an item from Array
 */
export const remove = <T>(array: T[], value: T): boolean => {
  if (!array)
    return false

  const index = array.indexOf(value)
  if (index >= 0) {
    array.splice(index, 1)
    return true
  }

  return false
}
