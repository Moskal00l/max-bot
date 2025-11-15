import { defaultInstance } from "./axios";

export const makeRequest = async (method, url, params = null) => {
  try {
    const token = window.WebApp.initData;
    // const token = "ip=178.167.12.155&chat=%7B%22id%22%3A72642226%2C%22type%22%3A%22DIALOG%22%7D&hash=05097d8a1152b3949ab1ec7081e3cf4350d3c9fc3c57a61d5ca062f68895008a&auth_date=1762615448&query_id=004c54e4-1055-429f-b0b3-4ad6701b029f&user=%7B%22id%22%3A6782108%2C%22first_name%22%3A%22%D0%90%D0%BD%D0%B4%D1%80%D0%B5%D0%B9%22%2C%22last_name%22%3A%22%22%2C%22username%22%3Anull%2C%22language_code%22%3A%22ru%22%2C%22photo_url%22%3A%22https%3A%2F%2Fi.oneme.ru%2Fi%3Fr%3DBTGBPUwtwgYUeoFhO7rESmr8zwrhZ_p4jWvgWajP77Kf1Ww-NEnPNE9ZhChY4Nz6h6Q%22%7D";
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
