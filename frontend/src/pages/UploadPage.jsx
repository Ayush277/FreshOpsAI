import { AppShell } from '../components/layout/AppShell';
import { UploadForm } from '../components/upload/UploadForm';
import { UploadResult } from '../components/upload/UploadResult';
import { useUploadItem } from '../hooks/useUploadItem';

export const UploadPage = () => {
  const { uploadItem, loading, error, result, successMessage } = useUploadItem();

  return (
    <AppShell
      title="Upload & Detect"
      subtitle="Upload perishable images and generate expiry intelligence"
    >
      <div className="upload-intro-card">
        <div>
          <p className="upload-intro-eyebrow">Smart Intake</p>
          <h3>Drop an item image and get instant shelf-life signals</h3>
          <p>
            FreshOps AI detects likely item labels, predicts expiry windows, and classifies risk
            status for operational decision-making.
          </p>
        </div>
        <div className="upload-intro-stats">
          <div>
            <span>Detection</span>
            <strong>AI + Fallback</strong>
          </div>
          <div>
            <span>Output</span>
            <strong>Expiry + Status</strong>
          </div>
        </div>
      </div>

      <div className="upload-layout">
        <UploadForm onSubmit={uploadItem} loading={loading} />

        <div className="upload-side-panel">
          {loading ? <p className="state-banner">Analyzing image and generating expiry prediction...</p> : null}
          {successMessage ? <p className="state-banner state-success">{successMessage}</p> : null}
          {error ? <p className="state-banner state-error">{error}</p> : null}
          <UploadResult result={result} />
        </div>
      </div>
    </AppShell>
  );
};
