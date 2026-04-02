export const UploadResult = ({ result }) => {
  if (!result) {
    return null;
  }

  const { item, aiDetection, expiryPlan, file } = result;

  return (
    <div className="upload-result">
      <h3>Latest Upload Insight</h3>

      <div className="result-grid">
        <div>
          <span>Detected Item</span>
          <strong>{item.itemName}</strong>
        </div>
        <div>
          <span>Category</span>
          <strong>{item.category}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{item.status}</strong>
        </div>
        <div>
          <span>Days Remaining</span>
          <strong>{item.daysRemaining}</strong>
        </div>
        <div>
          <span>Expiry Date</span>
          <strong>{new Date(item.expiryDate).toLocaleDateString()}</strong>
        </div>
        <div>
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
