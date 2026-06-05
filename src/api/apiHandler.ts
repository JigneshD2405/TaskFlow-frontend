import { AxiosRequestConfig } from 'axios';
import { apiClient } from './apiClient';
import Query from './Query';

export const apiHandler = {
  auth: {
    signIn: (payload: any, options?: AxiosRequestConfig) =>
      apiClient.post(Query.signIn, payload, options),
    register: (payload: any, options?: AxiosRequestConfig) =>
      apiClient.post(Query.register, payload, options),
    refreshToken: (options?: AxiosRequestConfig) =>
      apiClient.post(Query.refreshToken, {}, options),
    signOut: (options?: AxiosRequestConfig) =>
      apiClient.post(Query.signOut, {}, options),
    auth: (options?: AxiosRequestConfig) =>
      apiClient.get(Query.auth, options),
  },
};
