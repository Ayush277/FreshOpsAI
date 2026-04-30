import { ExecutiveSummary } from '../components/dashboard/ExecutiveSummary';
import { AppShell } from '../components/layout/AppShell';

export const DashboardPage = () => {
  return (
    <AppShell
      title="hehehe"
      subtitle=""
    >
      <ExecutiveSummary />

      <section className="insight-panel">
        <h3>Decision Support</h3>
        <p>
          Track expiring inventory in real time, reduce avoidable spoilage, and prioritize replenishment using AI-assisted shelf-life signals.
        </p>
      </section>
    </AppShell>
  );
};
