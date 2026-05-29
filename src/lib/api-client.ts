import axios from 'axios';

const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized response and error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn('⚠️ Central API Client: Network or connection error:', error.message);
    } else {
      console.warn(
        `⚠️ Central API Client: Response error [${error.response.status}]:`,
        error.response.data?.error || error.response.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
