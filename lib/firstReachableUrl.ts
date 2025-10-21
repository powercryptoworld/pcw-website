export async function firstReachableUrl(candidates: string[], timeoutMs = 3500): Promise<string | null> {
  for (const url of candidates) {
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), timeoutMs);
      const r = await fetch(url, { method: "GET", signal: ctl.signal, cache: "no-store" });
      clearTimeout(to);
      if (r.ok) return url;
    } catch {}
  }
  return null;
}
