import { defaultInstance } from "./axios.js";

export const makeRequest = async (method, url, params = null) => {
  try {
    const token = process.env.TOKEN;
    const response = await defaultInstance({
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      url: url,
      data: params,
    });
    if (response) {
      return response;
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
