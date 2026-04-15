import { useEffect, useState } from 'react';
import { alertsApi } from '../services/api';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    count: 0,
    totalItems: 0,
    buckets: {
      'expiring-soon': 0,
      expired: 0,
      fresh: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await alertsApi.getAll();
      const nextAlerts = Array.isArray(response.data) ? response.data : [];
      setAlerts(nextAlerts);
      setSummary({
        count: response?.meta?.count ?? nextAlerts.length,
        totalItems: response?.meta?.totalItems ?? nextAlerts.length,
        buckets: {
          'expiring-soon': response?.meta?.buckets?.['expiring-soon'] ?? 0,
          expired: response?.meta?.buckets?.expired ?? 0,
          fresh: response?.meta?.buckets?.fresh ?? 0,
        },
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    summary,
    loading,
    error,
    refreshAlerts: fetchAlerts,
  };
};
