import axios from 'axios';

// All requests go through the FastAPI Gateway
const API = axios.create({
  baseURL: 'https://digital-library-management-gateway.onrender.com',
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
    const status = error.response?.status;
    let message;
    if (status === 401 || status === 403) {
      message = 'Invalid Credentials. Please check your username and password.';
    } else {
      message = error.response?.data?.detail || error.message || 'An error occurred';
    }
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

/* ── Activity Logs (MongoDB / Node.js) ───────────────────── */
export const logAPI = {
  /** Create a log entry – call this after user actions */
  create:      (data)             => API.post('/api/logs', data),
  /** Admin: get paginated logs */
  getAll:      (page = 1, size = 20) => API.get(`/api/logs?page=${page}&size=${size}`),
  /** Dashboard: recent activity feed */
  getRecent:   (limit = 10)       => API.get(`/api/logs/recent?limit=${limit}`),
  /** Analytics: counts by action */
  getStats:    ()                  => API.get('/api/logs/stats'),
  /** Per-user history */
  getByUser:   (userId, page = 1, size = 20) =>
    API.get(`/api/logs/user/${userId}?page=${page}&size=${size}`),
};

/* ── Semantic / Vector Search (MongoDB / Node.js) ────────── */
export const searchAPI = {
  /** Natural language semantic search */
  semantic:       (query, topK = 5) => API.get(`/api/search?q=${encodeURIComponent(query)}&topK=${topK}`),
  /** Save book description + tags + embedding */
  saveContent:    (data)            => API.post('/api/search/content', data),
  /** List all books with content */
  listContents:   (page = 1, size = 20) => API.get(`/api/search/content?page=${page}&size=${size}`),
  /** Get content for one book */
  getContent:     (bookId)          => API.get(`/api/search/content/${bookId}`),
  /** Remove content when book deleted */
  deleteContent:  (bookId)          => API.delete(`/api/search/content/${bookId}`),
};

export default API;
