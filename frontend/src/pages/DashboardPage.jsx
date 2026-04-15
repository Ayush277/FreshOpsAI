import { SummaryCard } from '../components/dashboard/SummaryCard';
import { AppShell } from '../components/layout/AppShell';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

export const DashboardPage = () => {
  const { summary, loading, error, refreshSummary } = useDashboardSummary();

  const cards = [
    { label: 'Total Items', value: summary?.totalItems ?? 0, tone: 'neutral', trend: 'Overview' },
    { label: 'Fresh Items', value: summary?.freshItems ?? 0, tone: 'fresh', trend: 'Healthy' },
    { label: 'Expiring Soon', value: summary?.expiringSoonItems ?? 0, tone: 'warning', trend: 'Attention' },
    { label: 'Expired', value: summary?.expiredItems ?? 0, tone: 'danger', trend: 'Action Required' },
    { label: 'Waste %', value: `${summary?.wastePercentage ?? 0}%`, tone: 'accent', trend: 'Performance' },
  ];

  return (
    <AppShell
      title="Operations Dashboard"
      subtitle="Live inventory health and waste-performance snapshot"
      actions={<button onClick={refreshSummary}>Refresh Data</button>}
    >
      <div className="dashboard-stats-intro">
        <div className="stats-intro-content">
          <span className="stats-tag">Freshness Logic v1.0</span>
          <h3>Inventory Integrity Overview</h3>
          <p>Real-time analytics for perishable items across all storage zones.</p>
        </div>
      </div>

      {loading ? <p className="state-banner">Syncing with storage records...</p> : null}
      {error ? <p className="state-banner state-error">{error}</p> : null}

      <div className="summary-grid">
        {cards.map((card) => (
          <SummaryCard 
            key={card.label} 
            label={card.label} 
            value={card.value} 
            tone={card.tone}
            trend={card.trend}
          />
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
