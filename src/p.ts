/**
 * Internal marker for filtered items
 */
const VOID = Symbol('p-void')

export interface POptions {
  /**
   * How many promises are resolved at the same time.
   */
  concurrency?: number | undefined
}

export class P<T = any> extends Promise<Awaited<T>[]> {
  private promises = new Set<T | Promise<T>>()

  get promise() {
    let batch
    const items = [...Array.from(this.items), ...Array.from(this.promises)]

    if (this.options?.concurrency) {
      const limit = pLimit(this.options.concurrency)
      batch = Promise.all(items.map(p => limit(() => p)))
    }
    else {
      batch = Promise.all(items)
    }

    return batch.then(l => l.filter((i: any) => i !== VOID))
  }

  constructor(
    public items: Iterable<T> = [],
    public options?: POptions,
  ) {
    super(() => {})
  }

  add(...args: (T | Promise<T>)[]) {
    args.forEach((it) => {
      this.promises.add(it)
    })
  }

  clear() {
    this.promises.clear()
  }

  map<U>(fn: (value: Awaited<T>, index: number) => U): P<Promise<U>> {
    return new P(
      Array.from(this.items)
        .map(async (it, idx) => {
          const v = await it
          if ((v as any) === VOID)
            return VOID as unknown as U
          return fn(v, idx)
        }),
      this.options,
    )
  }

  filter(fn: (value: Awaited<T>, index: number) => boolean | Promise<boolean>): P<Promise<T>> {
    return new P(
      Array.from(this.items)
        .map(async (it, idx) => {
          const v = await it
          const r = await fn(v, idx)
          if (!r)
            return VOID as unknown as T
          return v
        }),
      this.options,
    )
  }

  forEach(fn: (value: Awaited<T>, index: number) => void): Promise<void> {
    return this.map(fn).then()
  }

  reduce<U>(fn: (previousValue: U, currentValue: Awaited<T>, currentIndex: number, array: Awaited<T>[]) => U, initialValue: U): Promise<U> {
    return this.promise.then(array => array.reduce(fn, initialValue))
  }

  then(fn?: () => PromiseLike<any>) {
    const p = this.promise
    return fn ? p.then(fn) : p
  }

  catch(fn?: (err: unknown) => PromiseLike<any>) {
    return this.promise.catch(fn)
  }

  finally(fn?: () => void) {
    return this.promise.finally(fn)
  }
}

/**
 * Utility for managing multiple promises.
 *
 * @category Promise
 * @example
 * ```ts
 * import { p } from '@m9ch/utils'
 *
 * const items = [1, 2, 3, 4, 5]
 *
 * await p(items)
 *  .map(async i => i * 3)          // [3, 6, 9, 12, 15]
 *  .filter(async i => i % 2 === 0) // [6, 12]
 * ```
 */
export function p<T = any>(items?: Iterable<T>, options?: POptions): P<T> {
  return new P(items, options)
}

interface LimitFn {
  <Args extends unknown[], R>(fn: (...args: Args) => R | Promise<R>, ...args: Args): Promise<R>

  readonly activeCount: number
  readonly pendingCount: number

  clearQueue: () => void
}

export function pLimit(concurrency: number): LimitFn {
  if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0))
    throw new TypeError('Expected `concurrency` to be a number from 1 and up')

  const queue: (() => void)[] = []
  let activeCount = 0

  const next = () => {
    activeCount -= 1

    if (queue.length > 0)
      queue.shift()!()
  }

  const run = async <Args extends unknown[], R>(fn: (...args: Args) => R | Promise<R>, resolve: (arg: R | Promise<R>) => void, args: Args) => {
    activeCount += 1

    const result = (async () => fn(...args))()

    resolve(result)

    try {
      await result
    }
    catch {
      // just ignore :)
    }

    next()
  }

  const enqueue = <Args extends unknown[], R>(fn: (...args: Args) => R | Promise<R>, resolve: (arg: R | Promise<R>) => void, args: Args) => {
    queue.push(() => run(fn, resolve, args))

    ;(async () => {
      await Promise.resolve()

      if (activeCount < concurrency && queue.length > 0)
        queue.shift()!()
    })()
  }

  const generator = <Args extends unknown[], R>(fn: (...args: Args) => R | Promise<R>, ...args: Args) => new Promise((resolve) => {
    enqueue(fn, resolve, args)
  })

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount,
    },
    pendingCount: {
      get: () => queue.length,
    },
    cleanQueue: {
      value: () => {
        queue.length = 0
      },
    },
  })

  return generator as LimitFn
}
