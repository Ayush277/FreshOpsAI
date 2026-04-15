import { useState } from 'react';
import { uploadApi } from '../services/api';

export const useUploadItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const uploadItem = async ({ itemName, category, imageFile }) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      const formData = new FormData();
      formData.append('itemName', itemName);
      formData.append('category', category);
      formData.append('image', imageFile);

      const response = await uploadApi.createItem(formData);
      setResult(response.data);
      setSuccessMessage('Upload completed successfully. Detection and expiry insights are ready.');
      return response.data;
    } catch (requestError) {
      setError(requestError.message);
      setSuccessMessage('');
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  const resetUploadState = () => {
    setError('');
    setSuccessMessage('');
    setResult(null);
  };

  return {
    uploadItem,
    resetUploadState,
    loading,
    error,
    result,
    successMessage,
  };
};
