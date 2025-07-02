import axios from 'axios';

const API_BASE_URL = 'http://localhost:5201/api'; //backend URL

// Retrieve the token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Create an Axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add an interceptor to include the token in the Authorization header
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth Endpoints
export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

// Admin Endpoints
export const getAdminDashboard = () => {
  return apiClient.get('/admin/dashboard');
};

// Customer Endpoints
export const getAllCustomers = (sortField, sortOrder) => {
  return apiClient.get('/customer/all', {
    params: { sortField, sortOrder },
  });
};

export const getCustomerById = (id) => {
  return apiClient.get(`/customer/${id}`);
};

export const updateCustomer = (id, customerData) => {
  return apiClient.put(`/customer/${id}`, {
    Id: id,
    Name: customerData.name,
    Email: customerData.email,
    PhoneNumber: customerData.phone,
  });
};

export const deleteCustomer = (id) => {
  return apiClient.delete(`/customer/${id}`);
};

export const searchCustomers = (name) => {
  return apiClient.get(`/customer/search?name=${name}`);
};

export const createCustomer = (customerData) => {
  return apiClient.post('/customer', customerData);
};

// Transaction Endpoints
export const addTransaction = (transactionData) => {
  return apiClient.post('/transaction', transactionData);
};

// Fetch a single transaction by ID
export const getTransactionById = async (id) => {
  try {
      const response = await apiClient.get(`/transaction/${id}`);
      return response.data; // Return the transaction data
  } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error; // Re-throw the error for handling in the component
  }
};

export const deleteTransaction = (id) => {
  return apiClient.delete(`/transaction/${id}`);
};

export const getTransactionsByCustomer = (query) => {
  return apiClient.get('/transaction/customer', { params: query });
};

// Fetch all loyalty points
export const getAllLoyaltyPoints = (
  sortField = 'points',
  sortOrder = 'desc',
  statusFilter = null,
  page = 1,
  pageSize = 10
) => {
  return apiClient.get('/transaction/all', {
      params: {
          sortField,
          sortOrder,
          statusFilter,
          page,
          pageSize,
      },
  });
};

