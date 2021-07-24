export function logKeys(keys: Iterable<string>) {
  return `[${Array.from(keys).sort().join(', ')}]`;
}
