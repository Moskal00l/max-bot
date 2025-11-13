import { defaultInstance } from "./axios.js";

export const makeRequest = async (method, url, params = null) => {
  try {
    const token = "f9LHodD0cOK-2pniQ6_78itG5zoo80e8rr9yTH7bORU5bMNtFDneOQSFP1j1mRzlgre5ZyxC7dXGRvs18IoL";
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
