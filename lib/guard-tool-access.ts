/** Tools are free and anonymous — access is always allowed. */
export function guardToolAccess(
  _status?: unknown,
  _session?: unknown,
  _pathname?: string | null,
  _fallbackPath?: string,
  _router?: { push: (url: string) => void } | null,
): boolean {
  return true;
}
