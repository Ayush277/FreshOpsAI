import { format } from 'date-fns';

const renderStatusLabel = (status) => status.replace('-', ' ');

export const AlertsList = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-empty-state">
        <h3>No active alerts</h3>
        <p>All items are currently fresh. We will surface high-priority risks here.</p>
      </div>
    );
  }

  return (
    <div className="alerts-grid">
      {alerts.map((alert, index) => {
        const alertKey = alert.id || `${alert.itemName || 'item'}-${index}`;
        const status = alert.status || 'expiring-soon';
        const expiryDate = alert.expiryDate
          ? format(new Date(alert.expiryDate), 'MMM dd, yyyy')
          : 'N/A';

        return (
          <article key={alertKey} className={`alert-card alert-card-${status}`}>
            <div className="alert-card-head">
              <span className={`alert-status-pill alert-status-pill-${status}`}>
                {renderStatusLabel(status)}
              </span>
              <span className="alert-severity">{alert.severity || 'high'} priority</span>
            </div>

            <h3>{alert.itemName || 'Unknown Item'}</h3>

            <p className="alert-message">
              {alert.message || 'Requires attention'}
            </p>

            <div className="alert-meta-grid">
              <div>
                <span>Category</span>
                <strong>{alert.category || 'General'}</strong>
              </div>
              <div>
                <span>Expiry Date</span>
                <strong>{expiryDate}</strong>
              </div>
              <div>
                <span>Days Remaining</span>
                <strong>{typeof alert.daysRemaining === 'number' ? alert.daysRemaining : 'N/A'}</strong>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
