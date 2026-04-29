import { useMemo } from 'react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { SummaryCard } from './SummaryCard';

export const ExecutiveSummary = () => {
  const { summary, loading, error, refreshSummary, secondsUntilRefresh } = useDashboardSummary();

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

  const freshnessBars = [
    { label: 'Fresh', value: summary?.freshItems ?? 0, tone: 'fresh' },
    { label: 'Expiring', value: summary?.expiringSoonItems ?? 0, tone: 'warning' },
    { label: 'Expired', value: summary?.expiredItems ?? 0, tone: 'danger' },
  ];

  const peakValue = Math.max(...freshnessBars.map((bar) => bar.value), 1);

  return (
    <section className="executive-summary">
      <header className="executive-summary-header">
        <div>
          <span className="stats-tag">Executive Snapshot</span>
          <h3>Inventory Risk and Freshness Performance</h3>
          <p>Decision-grade KPI surface powered by live shelf-life calculations.</p>
        </div>
        <div className="live-status-group">
          <span className="live-status live-pulse">Live</span>
          <span className="refresh-countdown">Refresh in {secondsUntilRefresh}s</span>
          <button onClick={refreshSummary}>Refresh Data</button>
        </div>
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

      <section className="live-chart-panel">
        <div className="live-chart-header">
          <div>
            <p className="kpi-label">Live freshness chart</p>
            <h4>Inventory mix by status</h4>
          </div>
          <span className="live-chart-badge live-pulse">Reading live</span>
        </div>

        <div className="freshness-chart">
          {freshnessBars.map((bar) => {
            const width = `${Math.max((bar.value / peakValue) * 100, bar.value > 0 ? 12 : 6)}%`;

            return (
              <div key={bar.label} className={`freshness-chart-row freshness-${bar.tone}`}>
                <div className="freshness-chart-label">{bar.label}</div>
                <div className="freshness-chart-track">
                  <div className="freshness-chart-fill" style={{ width }} />
                </div>
                <div className="freshness-chart-value">{bar.value}</div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};