import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // ⬅ take from env
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );
      localStorage.setItem("accessToken", res.data.accessToken);
      api.defaults.headers.Authorization = `Bearer ${res.data.accessToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
