import { AppShell } from '../components/layout/AppShell';
import { UploadForm } from '../components/upload/UploadForm';
import { UploadResult } from '../components/upload/UploadResult';
import { useUploadItem } from '../hooks/useUploadItem';

export const UploadPage = () => {
  const { uploadItem, loading, error, result } = useUploadItem();

  return (
    <AppShell
      title="Upload & Detect"
      subtitle="Upload perishable images and generate expiry intelligence"
    >
      <div className="upload-layout">
        <UploadForm onSubmit={uploadItem} loading={loading} />

        <div className="upload-side-panel">
          {error ? <p className="state-banner state-error">{error}</p> : null}
          <UploadResult result={result} />
        </div>
      </div>
    </AppShell>
  );
};
