import { makeRequest } from "./makeRequest";

export const getEvents = async () => await makeRequest("get", `/events`);
export const createEvent = async (event) => await makeRequest("post", `/events`, event);
export const deleteEvent = async (event) => await makeRequest("delete", `/events/${event}`);
export const getEvent = async (event) => await makeRequest("get", `/events/${event}`);
export const getEventUsers = async (event) => await makeRequest("get", `/events/${event}/users`);
export const checkRegister = async (data) => await makeRequest("post", `/check`, data);
export const setRole = async (event, data) => await makeRequest("post", `/events/${event}/role`, data);
export const unregister = async (event) => await makeRequest("delete", `/events/${event}/unregister`);
