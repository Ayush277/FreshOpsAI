export const UploadResult = ({ result }) => {
  if (!result) {
    return (
      <div className="upload-result upload-result-empty">
        <h3>Latest Upload Insight</h3>
        <p>
          No analysis yet. Upload an image to see detected item, expiry prediction, and freshness
          status.
        </p>
      </div>
    );
  }

  const { item, aiDetection, expiryPlan, file } = result;
  const statusClass = `result-status result-status-${item.status}`;

  return (
    <div className="upload-result">
      <h3>Latest Upload Insight</h3>

      <div className="result-grid">
        <div className="result-card">
          <span>Detected Item</span>
          <strong>{item.itemName}</strong>
        </div>
        <div className="result-card">
          <span>Category</span>
          <strong>{item.category}</strong>
        </div>
        <div className="result-card">
          <span>Status</span>
          <strong className={statusClass}>{item.status}</strong>
        </div>
        <div className="result-card">
          <span>Days Remaining</span>
          <strong>{item.daysRemaining}</strong>
        </div>
        <div className="result-card">
          <span>Expiry Date</span>
          <strong>{new Date(item.expiryDate).toLocaleDateString()}</strong>
        </div>
        <div className="result-card">
          <span>AI Confidence</span>
          <strong>
            {aiDetection?.confidence ? `${(aiDetection.confidence * 100).toFixed(1)}%` : 'Fallback used'}
          </strong>
        </div>
      </div>

      <p className="result-subtext">
        File: {file?.originalName || 'n/a'} · Shelf-life rule: {expiryPlan?.shelfLifeDays ?? '-'} days
      </p>
    </div>
  );
};
