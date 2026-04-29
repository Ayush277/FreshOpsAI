import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';

export const useDashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);

  const refreshSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardApi.getSummary();
      setSummary(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSecondsUntilRefresh((currentSeconds) => {
        if (currentSeconds <= 1) {
          refreshSummary();
          return 30;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [refreshSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary,
    secondsUntilRefresh,
  };
};
