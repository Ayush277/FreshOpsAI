import { useMemo } from 'react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { SummaryCard } from './SummaryCard';

export const ExecutiveSummary = () => {
  const { summary, loading, error, refreshSummary } = useDashboardSummary();

  const cards = useMemo(
    () => [
      {
        label: 'Total Items',
        value: summary?.totalItems ?? 0,
        tone: 'neutral',
        trend: 'Inventory Base',
        size: 'wide',
        icon: '⬢',
      },
      { label: 'Fresh Items', value: summary?.freshItems ?? 0, tone: 'fresh', trend: 'Healthy', icon: '●' },
      {
        label: 'Expiring Soon',
        value: summary?.expiringSoonItems ?? 0,
        tone: 'warning',
        trend: 'Monitor Closely',
        icon: '◐',
      },
      { label: 'Expired', value: summary?.expiredItems ?? 0, tone: 'danger', trend: 'Action Required', icon: '◉' },
      {
        label: 'Waste Percentage',
        value: `${summary?.wastePercentage ?? 0}%`,
        tone: 'accent',
        trend: 'Performance',
        size: 'tall',
        icon: '◍',
      },
    ],
    [summary]
  );

  const riskShare = (summary?.totalItems ?? 0) > 0
    ? Math.round((((summary?.expiredItems ?? 0) + (summary?.expiringSoonItems ?? 0)) / (summary?.totalItems ?? 0)) * 100)
    : 0;

  return (
    <section className="executive-summary">
      <header className="executive-summary-header">
        <div>
          <span className="stats-tag">Executive Snapshot</span>
          <h3>Inventory Risk and Freshness Performance</h3>
          <p>Decision-grade KPI surface powered by live shelf-life calculations.</p>
        </div>
        <button onClick={refreshSummary}>Refresh Data</button>
      </header>

      {loading ? <p className="state-banner">Loading executive metrics...</p> : null}
      {error ? <p className="state-banner state-error">{error}</p> : null}

      <div className="summary-grid">
        {cards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            tone={card.tone}
            trend={card.trend}
            size={card.size}
            icon={card.icon}
          />
        ))}
      </div>

      <article className="executive-kpi-panel">
        <div>
          <p className="kpi-label">Risk Exposure</p>
          <h4>{riskShare}% of items need intervention</h4>
          <p className="kpi-note">
            Based on combined expired and expiring-soon inventory, this metric indicates immediate
            operational pressure.
          </p>
        </div>
        <div className="kpi-breakdown">
          <div>
            <span>Expired</span>
            <strong>{summary?.expiredItems ?? 0}</strong>
          </div>
          <div>
            <span>Expiring Soon</span>
            <strong>{summary?.expiringSoonItems ?? 0}</strong>
          </div>
          <div>
            <span>Fresh</span>
            <strong>{summary?.freshItems ?? 0}</strong>
          </div>
        </div>
      </article>
    </section>
  );
};