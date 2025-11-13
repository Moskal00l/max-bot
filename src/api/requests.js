import { makeRequest } from "./makeRequest.js";

export const getEvent = async (event) => await makeRequest("get", `/events/${event}`);
export const registration = async (event, user) => await makeRequest("post", `/events/${event}`, user);
