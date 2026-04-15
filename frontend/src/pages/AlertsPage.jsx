import { AlertsList } from '../components/alerts/AlertsList';
import { AppShell } from '../components/layout/AppShell';
import { useAlerts } from '../hooks/useAlerts';
import '../styles/alerts.css';

export const AlertsPage = () => {
  const { alerts, summary, loading, error, refreshAlerts } = useAlerts();

  return (
    <AppShell
      title="Alerts & Risk Monitor"
      subtitle="Track expiring and expired inventory with operational priority"
      actions={<button onClick={refreshAlerts}>Refresh Alerts</button>}
    >
      <div className="alerts-summary-row">
        <article className="alerts-summary-card alerts-summary-warning">
          <p>Expiring Soon</p>
          <h3>{summary.buckets['expiring-soon']}</h3>
        </article>
        <article className="alerts-summary-card alerts-summary-danger">
          <p>Expired</p>
          <h3>{summary.buckets.expired}</h3>
        </article>
        <article className="alerts-summary-card alerts-summary-neutral">
          <p>Active Alerts</p>
          <h3>{summary.count}</h3>
        </article>
      </div>

      {loading ? <p className="state-banner">Loading alert signals...</p> : null}
      {error ? <p className="state-banner state-error">{error}</p> : null}

      <AlertsList alerts={alerts} />
    </AppShell>
  );
};
