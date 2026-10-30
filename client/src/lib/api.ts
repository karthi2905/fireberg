const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3001' : '');

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },
  zones: {
    list: () => apiRequest('/api/zones'),
    create: (data: any) =>
      apiRequest('/api/zones', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/api/zones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/api/zones/${id}`, { method: 'DELETE' }),
    syncFirms: (apiKey?: string) =>
      apiRequest('/api/zones/sync-firms', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      }),
  },
  alerts: {
    list: (params?: { status?: string; severity?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.severity) searchParams.set('severity', params.severity);
      const qs = searchParams.toString();
      return apiRequest(`/api/alerts${qs ? `?${qs}` : ''}`);
    },
    summary: () => apiRequest('/api/alerts/summary'),
    generate: () =>
      apiRequest('/api/alerts/generate', { method: 'POST' }),
    acknowledge: (id: string) =>
      apiRequest(`/api/alerts/${id}/acknowledge`, { method: 'POST' }),
    resolve: (id: string) =>
      apiRequest(`/api/alerts/${id}/resolve`, { method: 'POST' }),
    delete: (id: string) =>
      apiRequest(`/api/alerts/${id}`, { method: 'DELETE' }),
  },
  reports: {
    list: (status?: string) =>
      apiRequest(`/api/reports${status ? `?status=${status}` : ''}`),
    create: (data: any) =>
      apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/api/reports/${id}`, { method: 'DELETE' }),
  },
  analytics: {
    get: () => apiRequest('/api/analytics'),
  },
};
