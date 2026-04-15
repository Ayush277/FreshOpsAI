export const SummaryCard = ({ label, value, tone, trend }) => {
  return (
    <article className={`summary-card summary-${tone}`}>
      <div className="summary-card-header">
        <p className="summary-label">{label}</p>
        {trend && <span className="summary-trend">{trend}</span>}
      </div>
      <h3 className="summary-value">{value}</h3>
      <div className="summary-indicator"></div>
    </article>
  );
};
