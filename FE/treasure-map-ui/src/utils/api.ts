import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api", // adjust this based on your BE
  timeout: 10000,
  // withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // example: attach token here
    // const token = localStorage.getItem("accessToken");
    // if (token) {
    //   config.headers["Authorization"] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - maybe redirect to login or refresh token.");
    }
    return Promise.reject(error);
  }
);

export default api;
