// Use relative /api path which Nginx will proxy to the backend container 
// When running locally with Vite dev server against local backend, 
// either vite.config.js proxy handles it, or VITE_API_BASE_URL specifies the local full URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    const message = payload?.message || 'Request failed';
    throw new Error(message);
  }

  return payload;
};

export const dashboardApi = {
  getSummary: () => request('/dashboard/summary'),
};

export const uploadApi = {
  createItem: (formData) =>
    request('/upload', {
      method: 'POST',
      body: formData,
    }),
};

export const inventoryApi = {
  getAll: () => request('/items'),
};

export const alertsApi = {
  getAll: () => request('/alerts'),
};
