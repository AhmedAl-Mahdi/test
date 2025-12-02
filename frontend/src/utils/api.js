/**
 * API utility functions for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get the stored auth token
 */
export function getAuthToken() {
  return localStorage.getItem('access_token');
}

/**
 * Set the auth token in localStorage
 */
export function setAuthToken(token) {
  localStorage.setItem('access_token', token);
}

/**
 * Remove the auth token from localStorage
 */
export function removeAuthToken() {
  localStorage.removeItem('access_token');
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
}

/**
 * Auth API methods
 */
export const authAPI = {
  async login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(email, password) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },
};

/**
 * Symptoms API methods
 */
export const symptomsAPI = {
  async analyze(symptoms) {
    return apiRequest('/symptoms/analyze', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    });
  },

  async getHistory() {
    return apiRequest('/symptoms/history');
  },
};

/**
 * Chat API methods
 */
export const chatAPI = {
  async sendMessage(messages, conversationId = null) {
    return apiRequest('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ messages, conversation_id: conversationId }),
    });
  },

  async getHistory() {
    return apiRequest('/chat/history');
  },
};

/**
 * Imaging API methods
 */
export const imagingAPI = {
  async analyzePneumonia(file, isDemo = false, demoType = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_demo', isDemo);
    if (demoType) formData.append('demo_type', demoType);

    const response = await fetch(`${API_BASE_URL}/imaging/analyze/pneumonia`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    return response.json();
  },

  async analyzeBreastCancer(file, isDemo = false, demoType = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_demo', isDemo);
    if (demoType) formData.append('demo_type', demoType);

    const response = await fetch(`${API_BASE_URL}/imaging/analyze/breast-cancer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    return response.json();
  },

  async analyzeKidneyCancer(file, isDemo = false, demoType = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_demo', isDemo);
    if (demoType) formData.append('demo_type', demoType);

    const response = await fetch(`${API_BASE_URL}/imaging/analyze/kidney-cancer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    return response.json();
  },

  async analyzeBrainCancer(file, isDemo = false, demoType = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_demo', isDemo);
    if (demoType) formData.append('demo_type', demoType);

    const response = await fetch(`${API_BASE_URL}/imaging/analyze/brain-cancer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    return response.json();
  },
};

/**
 * Notifications API methods
 */
export const notificationsAPI = {
  async getAll() {
    return apiRequest('/notifications/');
  },

  async markAsRead(notificationId) {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  async markAllAsRead() {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    });
  },
};
