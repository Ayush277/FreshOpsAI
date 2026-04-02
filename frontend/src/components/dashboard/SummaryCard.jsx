export const SummaryCard = ({ label, value, tone }) => {
  return (
    <article className={`summary-card summary-${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
};
