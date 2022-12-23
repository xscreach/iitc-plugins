export function sleep(timeout: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(() => resolve(), timeout));
}

export function asnc<T>(runnable: () => T): Promise<T> {
  return new Promise<T>(resolve => {
    setTimeout(() => {
      resolve(runnable());
    }, 0);
  })
}
