export function createSymbolFromString(symbolString: string): symbol {
  if (!/^Symbol\(.+\)$/.test(symbolString)) {
    throw new Error('invalid symbol format');
  }
  return Symbol(symbolString.slice(7, -1));
}

export function getMapKeys<K, V>(map: Map<K, V>): K[] {
  const result: K[] = [];
  const iterator = map.keys();
  let curr = iterator.next();
  while (!curr.done) {
    result.push(curr.value);
    curr = iterator.next();
  }
  return result;
}

export function getMapValues<K, V>(map: Map<K, V>): V[] {
  const result: V[] = [];
  const iterator = map.values();
  let curr = iterator.next();
  while (!curr.done) {
    result.push(curr.value);
    curr = iterator.next();
  }
  return result;
}

export function mapToArray<K, V>(map: Map<K, V>): { keys: K[], values: Array<V|undefined> } {
  const keys: K[] = [];
  const values: Array<V|undefined> = [];
  const iterator = map.keys();
  let curr = iterator.next();
  while (!curr.done) {
    keys.push(curr.value);
    values.push(map.get(curr.value));
    curr = iterator.next();
  }
  return { keys, values };
}

export function mapToObject<K, V>(map: Map<K, V>): { [name: string]: V } {
  const obj: { [name: string]: V } = {};
  map.forEach((v, k) => obj['' + k] = v);
  return obj;
}

export function mapValueTransform<K, V, R>(map: Map<K, V>, fn: (value: V, key: K, map: Map<K, V>) => R): Map<K, R> {
  const result: Map<K, R> = new Map();
  map.forEach((v, k, m) => result.set(k, fn(v, k, m)));
  return result;
}

export function mapKeyTransform<K, V, R>(map: Map<K, V>, fn: (value: V, key: K, map: Map<K, V>) => R): Map<R, V> {
  const result: Map<R, V> = new Map();
  map.forEach((v, k, m) => result.set(fn(v, k, m), v));
  return result;
}

export function mapTransform<K, V, R, S>(map: Map<K, V>, fn: (value: V, key: K, map: Map<K, V>) => { key: R, value: S }): Map<R, S> {
  const result: Map<R, S> = new Map();
  let pair: { key: R, value: S };
  map.forEach((v, k, m) => {
    pair = fn(v, k, m);
    result.set(pair.key, pair.value);
  });
  return result;
}

export function resolveNameCollision(name: string): string {
  const match = /(.+)\s\((\d+)\)$/.exec(name);
  if (match) {
    const count = parseInt(match[2], 10);
    return `${ match[1] } (${ count + 1 })`;
  } else {
    return `${ name } (2)`;
  }
}