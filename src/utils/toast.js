// src/utils/toast.js
import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  pauseOnHover: true,
  closeOnClick: true,
  draggable: true,
};

export const showSuccess = (message, options = {}) =>
  toast.success(message, { ...defaultOptions, ...options });

export const showError = (message, options = {}) =>
  toast.error(message, { ...defaultOptions, ...options });

export const showWarning = (message, options = {}) =>
  toast.warn(message, { ...defaultOptions, ...options });

export const showInfo = (message, options = {}) =>
  toast.info(message, { ...defaultOptions, ...options });

// Optional: API error handler (🔥 very useful)
export const showApiError = (error, fallback = "Something went wrong") => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallback;

  toast.error(message, defaultOptions);
};
