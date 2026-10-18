import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, formData) => api.post(`/products/${id}/images`, formData),
  updateImage: (id, imageId, data) => api.put(`/products/${id}/images/${imageId}`, data),
  deleteImage: (id, imageId) => api.delete(`/products/${id}/images/${imageId}`),
  getRelated: (id) => api.get(`/products/${id}/related`),
  setRelated: (id, relatedIds) => api.put(`/products/${id}/related`, { relatedIds }),
};

export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getTree: () => api.get('/categories/tree'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const brandAPI = {
  getAll: (params) => api.get('/brands', { params }),
  getById: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  validateCoupon: (data) => api.post('/orders/validate-coupon', data),
};

export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getLowStock: (params) => api.get('/inventory/low-stock', { params }),
  adjust: (data) => api.post('/inventory/adjust', data),
  transfer: (data) => api.post('/inventory/transfer', data),
  delete: (id) => api.delete(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
};

export const warehouseAPI = {
  getAll: () => api.get('/warehouses'),
};

export const couponAPI = {
  getAll: (params) => api.get('/coupons', { params }),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenueChart: (days) => api.get('/dashboard/revenue-chart', { params: { days } }),
  getOrderStatusDistribution: () => api.get('/dashboard/order-status-distribution'),
  getCloudinaryStats: () => api.get('/dashboard/cloudinary-stats'),
};

export const checkoutAPI = {
  guestCheckout: (data) => api.post('/checkout/guest', data),
};
