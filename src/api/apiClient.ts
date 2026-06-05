import { ROUTES } from "@/constants/routes";
import { socketMeta } from "@/hooks/useSocket";
import { actions, store } from "@/redux";
import axios, { AxiosResponse } from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API;

export const apiClient = axios.create({ baseURL, withCredentials: true });

let refreshPromise: Promise<string | null> | null = null;

function redirectToSignIn() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === ROUTES.auth.signIn) return;
  window.location.replace(ROUTES.auth.signIn);
}

apiClient.interceptors.request.use(
  function (config) {
    const state = store.getState() as any;
    const token = state?.auth?.user?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (socketMeta.id) {
      config.headers["X-Socket-Id"] = socketMeta.id;
    }
    return config;
  },
  function (error) {
    return Promise.reject({
      error,
      message: error?.response?.data?.message || "Something Went Wrong !!",
    });
  },
);

apiClient.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/refresh-token`, {}, { withCredentials: true })
          .then(({ data }) => data?.data?.accessToken ?? null)
          .catch(() => null)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        store.dispatch(actions.setAccessToken(newToken));
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      store.dispatch(actions.logout());
      redirectToSignIn();

      return Promise.reject({
        error,
        message: "Session expired. Please sign in again.",
      });
    }

    return Promise.reject({
      error,
      message: error?.response?.data?.message || "Something Went Wrong !!",
    });
  },
);
