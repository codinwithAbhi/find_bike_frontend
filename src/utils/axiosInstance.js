// src/utils/axiosInstance.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://find-bike-backend.onrender.com/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors for requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Example: Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add interceptors for responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred!';
    toast.error(message); // Display error toast globally
    return Promise.reject(error);
  }
);

// Generic HTTP methods
const api = {
  get: async (url, params = {}) => {
    try {
      const response = await axiosInstance.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  post: async (url, data = {}, isMultipart = false) => {
    try {
      const headers = isMultipart
        ? { 'Content-Type': 'multipart/form-data' }
        : {}; // Don't override if JSON

      const response = await axiosInstance.post(url, data, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  put: async (url, data = {}) => {
    try {
      const response = await axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (url) => {
    try {
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
