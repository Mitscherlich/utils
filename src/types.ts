export type Awaitable<T> = T | PromiseLike<T>

export type Nullable<T> = T | null | undefined

export type Fn<T = void> = () => T

export type Constructor<T = void> = new (...args: any[]) => T
