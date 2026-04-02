import { AppShell } from '../components/layout/AppShell';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

export const DashboardPage = () => {
  const { summary, loading, error, refreshSummary } = useDashboardSummary();

  const cards = [
    { label: 'Total Items', value: summary?.totalItems ?? 0, tone: 'neutral' },
    { label: 'Fresh Items', value: summary?.freshItems ?? 0, tone: 'fresh' },
    { label: 'Expiring Soon', value: summary?.expiringSoonItems ?? 0, tone: 'warning' },
    { label: 'Expired', value: summary?.expiredItems ?? 0, tone: 'danger' },
    { label: 'Waste %', value: `${summary?.wastePercentage ?? 0}%`, tone: 'accent' },
  ];

  return (
    <AppShell
      title="Operations Dashboard"
      subtitle="Live inventory health and waste-performance snapshot"
      actions={<button onClick={refreshSummary}>Refresh</button>}
    >
      {loading ? <p className="state-banner">Loading summary...</p> : null}
      {error ? <p className="state-banner state-error">{error}</p> : null}

      <div className="summary-grid">
        {cards.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </div>

      <section className="insight-panel">
        <h3>Decision Support</h3>
        <p>
          Track expiring inventory in real time, reduce avoidable spoilage, and prioritize replenishment using AI-assisted shelf-life signals.
        </p>
      </section>
    </AppShell>
  );
};
