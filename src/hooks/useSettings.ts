import { useState, useEffect, useCallback } from 'react';
import { getStoredApiKey, setStoredApiKey, getStoredBaseUrl, setStoredBaseUrl } from '../api/mimoApi';

export function useSettings() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.xiaomimimo.com/v1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStoredApiKey(), getStoredBaseUrl()]).then(([key, url]) => {
      if (key) setApiKey(key);
      if (url) setBaseUrl(url);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const saveApiKey = useCallback(async (key: string) => {
    await setStoredApiKey(key);
    setApiKey(key);
  }, []);

  const saveBaseUrl = useCallback(async (url: string) => {
    await setStoredBaseUrl(url);
    setBaseUrl(url);
  }, []);

  const hasApiKey = apiKey.trim().length > 0;

  return { apiKey, baseUrl, hasApiKey, loading, saveApiKey, saveBaseUrl };
}
