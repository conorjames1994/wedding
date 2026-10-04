const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  searchGuests: (name) => request('/rsvp/search', { method: 'POST', body: JSON.stringify({ name }) }),
  getHousehold: (id) => request(`/rsvp/household/${id}`),
  submitRsvp: (payload) => request('/rsvp/submit', { method: 'POST', body: JSON.stringify(payload) }),
  getMessages: () => request('/messages'),
  postMessage: (payload) => request('/messages', { method: 'POST', body: JSON.stringify(payload) }),
  getGallery: () => request('/gallery'),
};
