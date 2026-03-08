import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.get('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/getall'),
};

export const taskAPI = {
  createTask: (data) => api.post('/tasks', data),
  getAllTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const chatAPI = {
  accessChat: (userId) => api.post('/chat', { userId }),
  fetchChats: () => api.get('/chat/fetchchat'),
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),           // ← NEW
  createGroupChat: (name, userIds) =>
    api.post('/chat/group', { name, users: JSON.stringify(userIds) }),  // ← FIXED
  renameGroup: (chatId, chatName) => api.put('/chat/rename', { chatId, chatName }),
  addToGroup: (chatId, userId) => api.put('/chat/groupadd', { chatId, userId }),
  removeFromGroup: (chatId, userId) => api.put('/chat/groupremove', { chatId, userId }),
  sendMessage: ({ chatId, content }) => api.post('/messages', { chatId, content }),
  getMessages: (chatId) => api.get(`/messages/${chatId}`),
  searchUsers: (search) => api.get(`/chat/search?search=${search}`),
};

export const codingAPI = {
  getLeetCodePOTD: () => api.get('/coding/leetcode-potd'),
  getCodeforcesPOTD: () => api.get('/coding/codeforces-potd'),
};

export const contestAPI = {
  getCodeforcesContests: () => api.get('/contests/codeforces'),
  getLeetCodeContests: () => api.get('/contests/leetcode'),
  getCodeChefContests: () => api.get('/contests/codechef'),
};

export default api;