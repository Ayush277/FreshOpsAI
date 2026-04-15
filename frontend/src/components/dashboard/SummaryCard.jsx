export const SummaryCard = ({ label, value, tone, trend, size = 'normal', icon = '◈' }) => {
  return (
    <article className={`summary-card summary-${tone} summary-${size}`}>
      <div className="summary-card-header">
        <p className="summary-label">
          <span className="summary-icon">{icon}</span>
          {label}
        </p>
        {trend && <span className="summary-trend">{trend}</span>}
      </div>
      <h3 className="summary-value">{value}</h3>
      <div className="summary-indicator"></div>
    </article>
  );
};
