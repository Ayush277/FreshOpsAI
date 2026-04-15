import { format } from 'date-fns';

export const InventoryTable = ({ items }) => {
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
            const daysRemaining = Number.isFinite(item.daysRemaining)
              ? item.daysRemaining
              : '-';

            return (
            <tr key={rowKey}>
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
                <span className={`status-badge status-${itemStatus}`}>
                  {itemStatus.replace('-', ' ')}
                </span>
              </td>
              <td className="date-cell">
                {expiryDateText}
              </td>
              <td>
                <span className={`days-badge ${typeof daysRemaining === 'number' && daysRemaining <= 2 ? 'urgent' : ''}`}>
                  {typeof daysRemaining === 'number' ? `${daysRemaining} days` : daysRemaining}
                </span>
              </td>
              <td className="date-cell">
                {createdTimeText}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
