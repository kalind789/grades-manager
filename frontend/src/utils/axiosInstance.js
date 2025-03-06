import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://grades-manager.onrender.com', // Change this to your backend URL
    // baseURL: 'http://127.0.0.1:5000', // Change this to your backend URL
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;