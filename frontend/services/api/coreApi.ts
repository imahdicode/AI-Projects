const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Fast In-Memory Cache for sub-millisecond tab switching
const memoryCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 3000; // 3-second ultra-fast cache

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE_URL}${endpoint}`;

  if (method === 'GET') {
    const cached = memoryCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  } else {
    memoryCache.clear(); // Clear cache on POST, PUT, DELETE mutations
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  if (method === 'GET') {
    memoryCache.set(url, { timestamp: Date.now(), data });
  }
  return data;
}

export function getAuthHeaders(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem('mediscript_user') || localStorage.getItem('mediscript_user');
    if (!raw) return {};
    const user = JSON.parse(raw);
    const headers: Record<string, string> = {
      'X-Doctor-Id': user.id || '',
      'X-Doctor-Role': user.role || 'DOCTOR',
    };
    if (user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  } catch {
    return {};
  }
}
