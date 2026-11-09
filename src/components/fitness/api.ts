export class ApiError extends Error {
  constructor(message: string, public status: number, public extra?: Record<string, unknown>) {
    super(message);
  }
}

/** fetch JSON con manejo uniforme de errores: lanza ApiError con el mensaje del servidor. */
export async function api<T>(url: string, init?: Omit<RequestInit, 'body'> & { body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Sin conexión. Revisa tu red e inténtalo de nuevo.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error || 'Ha ocurrido un error', res.status, data);
  return data as T;
}

export const errorMsg = (e: unknown) => (e instanceof Error ? e.message : 'Ha ocurrido un error');

/** Identificador de idempotencia para iniciar sesiones (un reintento reutiliza la misma clave). */
export function nuevaClave(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
