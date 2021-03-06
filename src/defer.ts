export class Defer<T> {
  public readonly promise: Promise<T>

  public resolve!: (value: T | PromiseLike<T>) => void

  public reject!: (reason?: any) => void

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

export const defer = <T>() => {
  return new Defer<T>()
}
