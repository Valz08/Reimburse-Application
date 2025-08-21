// src/hooks/useIdleLogout.js

import { useEffect } from 'react';
import { clearToken } from '../utils/auth';

const useIdleLogout = (timeout = 15 * 60 * 1000) => {
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        clearToken();
        alert('Auto logout karena tidak aktif.');
        window.location.href = '/login-user';
      }, timeout);
    };

    ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
      window.addEventListener(evt, resetTimer);
    });

    resetTimer();

    return () => {
      ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
        window.removeEventListener(evt, resetTimer);
      });
      clearTimeout(timer);
    };
  }, [timeout]);
};

export default useIdleLogout;
