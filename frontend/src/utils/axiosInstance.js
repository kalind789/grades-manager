import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // make sure this is set to your backend URL!
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Add this if your backend supports credentials (safe to include)
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;