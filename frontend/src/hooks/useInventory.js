import { useCallback, useEffect, useState } from 'react';
import { inventoryApi } from '../services/api';

export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inventoryApi.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (itemId) => {
    await inventoryApi.deleteById(itemId);
    await fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const clockId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(clockId);
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSecondsUntilRefresh((currentSeconds) => {
        if (currentSeconds <= 1) {
          fetchItems();
          return 60;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refreshItems: fetchItems,
    deleteItem,
    secondsUntilRefresh,
    currentTime,
  };
};
