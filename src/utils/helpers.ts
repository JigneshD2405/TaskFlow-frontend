import CryptoJS from 'crypto-js';
import { message as staticMessage } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || 'taskboard_secret';

export const encrypt = (value: string): string => {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

export const decrypt = (value: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
};

let messageInstance: MessageInstance | null = null;

export const setMessageInstance = (instance: MessageInstance) => {
  messageInstance = instance;
};

export const showToast = (type: 'success' | 'error' | 'warning' | 'info', content: string) => {
  if (messageInstance) {
    messageInstance[type](content);
  } else {
    staticMessage[type](content);
  }
};

export const generatePaginationParams = (params: Record<string, any>): string => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  return new URLSearchParams(filtered).toString();
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
