import { AUTH_TOKEN } from "@/constants/id";
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN);

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const data = error.response.data;
      let message = "Something went wrong";

      if (Array.isArray(data?.message)) {
        message = data.message.join(", ");
      } else if (typeof data?.message === "string") {
        message = data.message;
      }

      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error("Server not recheable"));
    }

    return Promise.reject(new Error("Unexpected error occured"));
  },
);
