import api from './axios';

export const deliveryCompanyAPI = {
  getAll: (params) => api.get('/delivery-companies', { params }),
  getById: (id) => api.get(`/delivery-companies/${id}`),
  getActive: () => api.get('/delivery-companies/active'),
  create: (data) => api.post('/delivery-companies', data),
  update: (id, data) => api.put(`/delivery-companies/${id}`, data),
  delete: (id) => api.delete(`/delivery-companies/${id}`),
};

export const wilayaAPI = {
  getAll: (params) => api.get('/wilayas', { params }),
  getById: (id) => api.get(`/wilayas/${id}`),
  create: (data) => api.post('/wilayas', data),
  update: (id, data) => api.put(`/wilayas/${id}`, data),
  delete: (id) => api.delete(`/wilayas/${id}`),
  getCommunes: (wilayaId) => api.get(`/wilayas/${wilayaId}/communes`),
};

export const shippingRateAPI = {
  getAll: (params) => api.get('/shipping-rates', { params }),
  getById: (id) => api.get(`/shipping-rates/${id}`),
  create: (data) => api.post('/shipping-rates', data),
  update: (id, data) => api.put(`/shipping-rates/${id}`, data),
  delete: (id) => api.delete(`/shipping-rates/${id}`),
  bulkImport: (rates) => api.post('/shipping-rates/bulk-import', { rates }),
};

export const publicShippingAPI = {
  getWilayas: () => api.get('/public/wilayas'),
  getCommunes: (wilayaId) => api.get(`/public/wilayas/${wilayaId}/communes`),
  getDeliveryCompanies: () => api.get('/public/delivery-companies'),
  getShippingOptions: (params) => api.get('/public/shipping-options', { params }),
  getShippingQuote: (data) => api.post('/public/shipping-quote', data),
};
