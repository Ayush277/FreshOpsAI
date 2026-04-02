import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';

export const useDashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return {
    summary,
    loading,
    error,
    refreshSummary,
  };
};
