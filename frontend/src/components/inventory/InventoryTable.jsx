import { format } from 'date-fns';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const formatCountdown = (expiryDateValue, currentTime) => {
  if (!expiryDateValue) {
    return { text: 'N/A', expired: false, urgent: false };
  }

  const expiryTime = new Date(expiryDateValue).getTime();
  const difference = expiryTime - currentTime;
  const expired = difference <= 0;
  const absoluteDifference = Math.abs(difference);

  const days = Math.floor(absoluteDifference / DAY_MS);
  const hours = Math.floor((absoluteDifference % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((absoluteDifference % HOUR_MS) / MINUTE_MS);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return {
    text: expired ? `Expired ${parts.join(' ')} ago` : `${parts.join(' ')} left`,
    expired,
    urgent: !expired && difference <= 2 * DAY_MS,
  };
};

export const InventoryTable = ({ items, currentTime, onDeleteItem }) => {
  if (!items || items.length === 0) {
    return (
      <div className="inventory-empty-state">
        <div className="empty-icon">📂</div>
        <h3>No inventory found</h3>
        <p>Start by uploading a perishable image to generate detection and expiry metadata.</p>
      </div>
    );
  }

  return (
    <div className="inventory-table-container">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Expiry Date</th>
            <th>Days Left</th>
            <th>Captured</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const rowKey = item.id || item._id || `${item.itemName || 'item'}-${index}`;
            const itemStatus = item.status || 'fresh';
            const createdTimeSource = item.createdAt || item.detectedAt;
            const expiryDateText = item.expiryDate
              ? format(new Date(item.expiryDate), 'MMM dd, yyyy')
              : 'N/A';
            const createdTimeText = createdTimeSource
              ? format(new Date(createdTimeSource), 'HH:mm - MM/dd')
              : 'N/A';
            const itemId = item.id || item._id;
            const countdown = formatCountdown(item.expiryDate, currentTime);
            const rowStatus = countdown.expired ? 'expired' : itemStatus;

            return (
              <tr key={rowKey} className={countdown.expired ? 'inventory-row-expired' : ''}>
                <td>
                  <div className="item-cell">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.itemName} className="item-thumbnail" />
                    )}
                    <span className="item-name">{item.itemName}</span>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
                <td>
                  <span className={`status-badge status-${rowStatus}`}>
                    {rowStatus.replace('-', ' ')}
                  </span>
                </td>
                <td className="date-cell">{expiryDateText}</td>
                <td>
                  <span className={`days-badge ${countdown.expired ? 'expired' : countdown.urgent ? 'urgent' : ''}`}>
                    {countdown.text}
                  </span>
                </td>
                <td className="date-cell">{createdTimeText}</td>
                <td>
                  <button
                    type="button"
                    className="delete-item-button"
                    onClick={() => onDeleteItem?.(itemId, item.itemName)}
                    disabled={!onDeleteItem || !itemId}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
