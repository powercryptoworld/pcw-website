export function normalizeList(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;

  // common shapes
  if (Array.isArray(json.items)) return json.items;
  if (Array.isArray(json.tokens)) return json.tokens;
  if (Array.isArray(json.results)) return json.results;
  if (Array.isArray(json.result)) return json.result;

  // nested data containers
  const data = (json as any).data;
  if (data) {
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.tokens)) return data.tokens;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.result)) return data.result;
  }

  // single object -> wrap as one
  if (typeof json === "object") {
    // if it looks like a token, wrap it
    const maybeAddr = (json as any).address || (json as any).mint;
    const maybeSym = (json as any).symbol;
    const maybeName = (json as any).name;
    if (maybeAddr || maybeSym || maybeName) return [json];
  }

  return [];
}
