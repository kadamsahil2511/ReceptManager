import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for image processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here later
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Receipt APIs
export const receiptsApi = {
  // Process and save a new receipt
  processReceipt: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return api.post('/receipts/process-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all receipts
  getAll: (params = {}) => api.get('/receipts', { params }),

  // Get single receipt
  getById: (id) => api.get(`/receipts/${id}`),

  // Update receipt
  update: (id, data) => api.put(`/receipts/${id}`, data),

  // Delete receipt
  delete: (id) => api.delete(`/receipts/${id}`),

  // Get dashboard stats
  getDashboard: () => api.get('/receipts/dashboard'),

  // Get expiring warranties
  getExpiringWarranties: (days = 30) => 
    api.get('/receipts/expiring-warranties', { params: { days } }),
};

// Chat APIs
export const chatApi = {
  // Send message to AI
  sendMessage: (message, receiptId = null, conversationHistory = []) =>
    api.post('/chat', { message, receiptId, conversationHistory }),

  // Quick actions
  quickAction: (action) => api.post('/chat/quick-action', { action }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
