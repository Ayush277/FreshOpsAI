import { useEffect, useState } from 'react';

const categoryOptions = ['General', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat'];

export const UploadForm = ({ onSubmit, loading }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('General');
  const [imageFile, setImageFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;

    if (!nextFile) {
      setImageFile(null);
      setFileError('');
      return;
    }

    if (!nextFile.type.startsWith('image/')) {
      setImageFile(null);
      setFileError('Please select a valid image file.');
      return;
    }

    setFileError('');
    setImageFile(nextFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!imageFile) {
      setFileError('Please choose an image before uploading.');
      return;
    }

    await onSubmit({ itemName, category, imageFile });
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-form-head">
        <h3>Upload Item</h3>
        <p>Provide image and optional metadata to run expiry intelligence.</p>
      </div>

      <div className="upload-form-grid">
        <label>
          Manual item name
          <input
            type="text"
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            placeholder="e.g. Banana"
          />
          <small>Optional when AI detection is enabled.</small>
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
          <small>Used as contextual hint for rule assignment.</small>
        </label>
      </div>

      <label className="file-input-wrapper">
        <span className="file-input-title">Upload image</span>
        <span className="file-input-subtitle">PNG, JPG, WEBP up to 5MB</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <span className="file-input-cta">Choose File</span>
      </label>

      {fileError ? <p className="upload-inline-error">{fileError}</p> : null}

      {imageFile ? (
        <div className="image-preview-panel">
          <img src={imagePreviewUrl} alt="Selected preview" className="image-preview" />
          <div>
            <p className="preview-name">{imageFile.name}</p>
            <p className="preview-meta">{(imageFile.size / 1024).toFixed(1)} KB · Ready for analysis</p>
          </div>
        </div>
      ) : null}

      <button type="submit" disabled={loading || !imageFile}>
        {loading ? 'Uploading...' : 'Upload & Analyze'}
      </button>
    </form>
  );
};
