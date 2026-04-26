const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
const AUTH_STORAGE_KEY = 'assistant.auth';

export interface ApiErrorPayload {
  message: string;
  status: number;
}

export class ApiError extends Error {
  status: number;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
  }
}

function getAuthToken() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token || null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Erreur API (${response.status})`;

    try {
      // Lire le body une seule fois en texte
      const text = await response.text();
      if (text) {
        try {
          // Essayer de parser en JSON
          const data = JSON.parse(text) as { message?: string; error?: string };
          message = data.message || data.error || message;
        } catch {
          // Si JSON invalide, utiliser le texte brut
          message = text;
        }
      }
    } catch (err) {
      // Fallback si même la lecture du texte échoue
      message = `Erreur API (${response.status})`;
    }

    throw new ApiError({ message, status: response.status });
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function requestBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Erreur API (${response.status})`;
    try {
      const text = await response.text();
      if (text) message = text;
    } catch {
      // Fallback message
    }
    throw new ApiError({ message, status: response.status });
  }

  return response.blob();
}

export function getJson<T>(path: string) {
  return request<T>(path);
}

export function postJson<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function postForm<T>(path: string, body: FormData) {
  return request<T>(path, {
    method: 'POST',
    body,
  });
}

export function putJson<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function patchJson<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteJson<T>(path: string) {
  return request<T>(path, {
    method: 'DELETE',
  });
}

export function getBlob(path: string) {
  return requestBlob(path);
}