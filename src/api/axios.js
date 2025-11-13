import axios from "axios";

export const defaultInstance = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: "https://d5d91accnt6pb0c1makn.zj2i1qoy.apigw.yandexcloud.net/bot"
});

defaultInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
