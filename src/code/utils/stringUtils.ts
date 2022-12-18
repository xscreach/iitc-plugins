export function interpolate(variableText: string, args: {[key: string]: string} = {}) {
  const names = Object.keys(args);
  const vals = Object.values(args);
  return new Function(...names, `return \`${variableText}\`;`)(...vals);
}
