export function computePayloadHash(obj: unknown): string {
  const str = JSON.stringify(obj);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16) + "_" + str.length;
}
