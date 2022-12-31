export function sleep(timeout: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(() => resolve(), timeout));
}

export function copy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

export function interpolate(variableText: string, args: { [key: string]: string } = {}): string {
  const names = Object.keys(args);
  const vals = Object.values(args);
  return new Function(...names, `return \`${variableText}\`;`)(...vals);
}
