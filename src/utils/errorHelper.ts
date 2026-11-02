export const extractErrorMessage = (err: any, fallbackMessage: string): string => {
  if (err?.response?.data) {
    const data = err.response.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (data.errors && typeof data.errors === 'object') {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return typeof data.errors[0] === 'string' ? data.errors[0] : JSON.stringify(data.errors[0]);
      }
      const keys = Object.keys(data.errors);
      if (keys.length > 0) {
        const first = data.errors[keys[0]];
        if (Array.isArray(first) && first.length > 0) {
          return String(first[0]);
        }
        if (typeof first === 'string') {
          return first;
        }
      }
    }

    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  }

  if (err?.message && typeof err.message === 'string') {
    if (err.message.includes('Network Error')) {
      return 'تعذر الاتصال بالسيرفر. يرجى التحقق من اتصال الإنترنت.';
    }
    if (err.message.includes('timeout')) {
      return 'انتهت مهلة الاتصال بالخادم. يرجى إعادة المحاولة.';
    }
  }

  return fallbackMessage;
};

