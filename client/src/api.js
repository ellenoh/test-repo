const BASE = '/api';

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register: (body) =>
    request('/auth/register', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getProfile: (token) =>
    request('/profile', { headers: headers(token) }),

  updateProfile: (token, body) =>
    request('/profile', { method: 'PUT', headers: headers(token), body: JSON.stringify(body) }),

  getFamily: (token) =>
    request('/family', { headers: headers(token) }),

  generateLinkCode: (token) =>
    request('/link/generate', { method: 'POST', headers: headers(token) }),

  joinFamily: (token, code) =>
    request('/link/join', { method: 'POST', headers: headers(token), body: JSON.stringify({ code }) }),

  addTransaction: (token, body) =>
    request('/transactions', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),

  getTransactions: (token, childId) =>
    request(`/transactions/${childId}`, { headers: headers(token) }),
};
