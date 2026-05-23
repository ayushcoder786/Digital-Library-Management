import axios from 'axios';

// All requests go through the FastAPI Gateway
const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor (can add auth tokens later)
API.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

// Response interceptor – unwrap data
API.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/* ── Auth ─────────────────────────────────────────────────── */
export const authAPI = {
  login:    (username, password) => API.post('/api/auth/login', { username, password }),
  register: (data)               => API.post('/api/auth/register', data),
};

/* ── Books ────────────────────────────────────────────────── */
export const bookAPI = {
  getAll:       ()           => API.get('/api/books'),
  getById:      (id)         => API.get(`/api/books/${id}`),
  search:       (keyword)    => API.get(`/api/books/search?keyword=${keyword}`),
  getAvailable: ()           => API.get('/api/books/available'),
  getByCategory:(catId)      => API.get(`/api/books/category/${catId}`),
  create:       (data)       => API.post('/api/books', data),
  update:       (id, data)   => API.put(`/api/books/${id}`, data),
  delete:       (id)         => API.delete(`/api/books/${id}`),
};

/* ── Users ────────────────────────────────────────────────── */
export const userAPI = {
  getAll:  ()         => API.get('/api/users'),
  getById: (id)       => API.get(`/api/users/${id}`),
  create:  (data)     => API.post('/api/users', data),
  update:  (id, data) => API.put(`/api/users/${id}`, data),
  delete:  (id)       => API.delete(`/api/users/${id}`),
};

/* ── Borrows ──────────────────────────────────────────────── */
export const borrowAPI = {
  getAll:     ()         => API.get('/api/borrows'),
  getByUser:  (userId)   => API.get(`/api/borrows/user/${userId}`),
  getOverdue: ()         => API.get('/api/borrows/overdue'),
  borrowBook: (userId, bookId, days = 14) =>
    API.post(`/api/borrows/borrow?userId=${userId}&bookId=${bookId}&borrowDays=${days}`),
  returnBook: (borrowId) => API.put(`/api/borrows/${borrowId}/return`),
};

/* ── Categories ───────────────────────────────────────────── */
export const categoryAPI = {
  getAll:  ()         => API.get('/api/categories'),
  create:  (data)     => API.post('/api/categories', data),
  update:  (id, data) => API.put(`/api/categories/${id}`, data),
  delete:  (id)       => API.delete(`/api/categories/${id}`),
};

export default API;
