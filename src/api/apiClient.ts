import { ROUTES } from '@/constants/routes';
import { actions, store } from '@/redux';
import axios, { AxiosResponse } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API;

export const apiClient = axios.create({ baseURL, withCredentials: true });

apiClient.interceptors.request.use(
  function (config) {
    const state = store.getState() as any;
    const token = state?.auth?.user?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject({
      error,
      message: error?.response?.data?.message || 'Something Went Wrong !!',
    });
  }
);

apiClient.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${baseURL}/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = data?.data?.accessToken;
        if (newToken) {
          store.dispatch(actions.setAccessToken(newToken));
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        store.dispatch(actions.logout());
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.auth.signIn;
        }
      }
    }

    return Promise.reject({
      error,
      message: error?.response?.data?.message || 'Something Went Wrong !!',
    });
  }
);
