import { toast as sonnerToast } from "sonner";

// Re-export toast with custom configuration
export const toast = {
  ...sonnerToast,
  success: (message: string, options = {}) => sonnerToast.success(message, { duration: 3000, ...options }),
  error: (message: string, options = {}) => sonnerToast.error(message, { duration: 3000, ...options }),
  warning: (message: string, options = {}) => sonnerToast.warning(message, { duration: 3000, ...options }),
  info: (message: string, options = {}) => sonnerToast.info(message, { duration: 3000, ...options }),
  loading: (message: string, options = {}) => sonnerToast.loading(message, { duration: Infinity, ...options }),
  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
};
