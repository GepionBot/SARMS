const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3700/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      let result;
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        const errorMsg = result?.message || result?.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMsg);
        error.response = { data: result || {}, status: response.status };
        throw error;
      }

      return { data: result };
    } catch (error) {
      if (!error.response) {
        throw new Error('Network error - please check if the server is running');
      }
      throw error;
    }
  }

  get(endpoint) {
    return this.request('GET', endpoint);
  }

  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  async postFormData(endpoint, formData) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method: 'POST',
      headers,
      body: formData,
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || result.error || 'Something went wrong';
      const error = new Error(errorMsg);
      error.response = { data: result, status: response.status };
      throw error;
    }

    return { data: result };
  }

  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

export const api = new ApiService();