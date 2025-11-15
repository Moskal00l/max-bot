import axios from "axios";

export const defaultInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

defaultInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
