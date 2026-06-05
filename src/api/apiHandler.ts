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
  boards: {
    list: (filterString: string = '', options?: AxiosRequestConfig) =>
      apiClient.get(`${Query.boards}?${filterString}`, options),
    get: (id: string, options?: AxiosRequestConfig) =>
      apiClient.get(`${Query.boards}/${id}`, options),
    create: (payload: any, options?: AxiosRequestConfig) =>
      apiClient.post(Query.boards, payload, options),
    update: (id: string, payload: any, options?: AxiosRequestConfig) =>
      apiClient.patch(`${Query.boards}/${id}`, payload, options),
    delete: (id: string, options?: AxiosRequestConfig) =>
      apiClient.delete(`${Query.boards}/${id}`, options),
  },
};
