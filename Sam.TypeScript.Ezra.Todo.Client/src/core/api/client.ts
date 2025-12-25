// Tools for contacting the backend. In another world we might replace this with grpc or graphql (apollo)

export const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let token: string | null = localStorage.getItem('authToken');

export const setToken = (newToken: string | null) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('authToken', newToken);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getToken = () => token;

const getHeaders = () => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper with auth header injection and error handling
export const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // We'll need to handle logout differently or pass a logout callback
    // For now, let's keep it consistent with the current implementation but avoid circular dependency
    localStorage.removeItem('authToken');
    window.location.reload();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let errorData: { errors?: Record<string, string[]>; title?: string; message?: string } = {};
    try {
      errorData = await res.json();
    } catch {
      throw new Error(`Request failed with status ${res.status}`);
    }
    const message = errorData.errors
      ? Object.values(errorData.errors).flat().join(' ')
      : errorData.title || errorData.message || 'Request failed';
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return JSON.parse(text) as T;
  }

  return text as unknown as T;
};
