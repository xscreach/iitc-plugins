export function sleep(timeout: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(() => resolve(), timeout));
}

export function copy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}
