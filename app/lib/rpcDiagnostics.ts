/** Minimal Postgrest/Supabase error shape for server actions. */
export type RpcErrorLike = {
  message?: string
  code?: string
  details?: string
  hint?: string
}

/**
 * Format an RPC failure for UI display. Preserves Postgres `[function_name]` prefixes.
 */
export function formatRpcError(fn: string, error: RpcErrorLike | null | undefined): string {
  const msg = error?.message?.trim()
  if (msg) {
    if (msg.startsWith('[')) return msg
    return `[${fn}] ${msg}`
  }
  const code = error?.code
  if (code) return `[${fn}] Request failed (${code})`
  return `[${fn}] Request failed`
}

/**
 * Log RPC failure with grep-friendly prefix for server logs.
 */
export function logRpcFailure(
  fn: string,
  error: RpcErrorLike | null | undefined,
  context?: Record<string, unknown>
): void {
  const message = formatRpcError(fn, error)
  if (context && Object.keys(context).length > 0) {
    console.error(message, context)
  } else {
    console.error(message)
  }
}
