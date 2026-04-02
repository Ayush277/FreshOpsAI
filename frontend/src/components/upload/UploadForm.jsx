import { useState } from 'react';

const categoryOptions = ['General', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat'];

export const UploadForm = ({ onSubmit, loading }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('General');
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!imageFile) {
      return;
    }

    await onSubmit({ itemName, category, imageFile });
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label>
        Manual item name (optional when AI is active)
        <input
          type="text"
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder="e.g. Banana"
        />
      </label>

      <label>
        Category
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="file-input-wrapper">
        Upload image
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setImageFile(event.target.files?.[0] || null)}
        />
      </label>

      <button type="submit" disabled={loading || !imageFile}>
        {loading ? 'Uploading...' : 'Upload & Analyze'}
      </button>
    </form>
  );
};
