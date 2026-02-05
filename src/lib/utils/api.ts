export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG === 'true';

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

function getErrorMessage(payload: any, status: number): string {
  return (
    payload?.error ||
    payload?.message ||
    `Request failed with status ${status}`
  );
}

export async function apiFetch<T = any>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  const requestInit: RequestInit = { ...init };

  if (!requestInit.credentials) {
    requestInit.credentials = 'include';
  }

  try {
    const response = await fetch(input, requestInit);
    const text = await response.text();
    let payload: any = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = { error: text };
      }
    }

    const isSuccess = response.ok && (payload?.success ?? true);

    if (!isSuccess) {
      const message = getErrorMessage(payload, response.status);

      console.error('API error:', {
        url: typeof input === 'string' ? input : input.toString(),
        status: response.status,
        payload,
      });

      if (DEBUG_MODE && typeof window !== 'undefined') {
        window.alert(message);
      }

      const err = new Error(message) as ApiError;
      err.status = response.status;
      err.data = payload;
      throw err;
    }

    return payload as T;
  } catch (error) {
    console.error('Network/API error:', error);

    if (DEBUG_MODE && typeof window !== 'undefined') {
      const message = error instanceof Error ? error.message : 'Network error';
      window.alert(message);
    }

    throw error;
  }
}
