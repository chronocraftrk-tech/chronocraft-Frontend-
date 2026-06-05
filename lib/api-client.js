import { getSession } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getAccessToken() {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    return session?.user?.accessToken || null;
  }
  return null;
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });
  }
  return url.toString();
}

async function buildHeaders(tenantId) {
  const headers = { 'Content-Type': 'application/json' };
  const token = await getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
}

async function request(method, path, body, options = {}) {
  const { params, tenantId, ...rest } = options;
  const res = await fetch(buildUrl(path, params), {
    ...rest,
    method,
    headers: await buildHeaders(tenantId),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const error = new Error(err.message || 'Request failed');
    error.status = res.status;
    error.data = err;
    throw error;
  }
  return res.json();
}

export const apiClient = {
  get: (path, options) => request('GET', path, undefined, options),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  delete: (path, options) => request('DELETE', path, undefined, options),
};

export default apiClient;
