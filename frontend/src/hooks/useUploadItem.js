import { useState } from 'react';
import { uploadApi } from '../services/api';

export const useUploadItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const uploadItem = async ({ itemName, category, imageFile }) => {
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('itemName', itemName);
      formData.append('category', category);
      formData.append('image', imageFile);

      const response = await uploadApi.createItem(formData);
      setResult(response.data);
      return response.data;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  const resetUploadState = () => {
    setError('');
    setResult(null);
  };

  return {
    uploadItem,
    resetUploadState,
    loading,
    error,
    result,
  };
};
