import { ExecutiveSummary } from '../components/dashboard/ExecutiveSummary';
import { AppShell } from '../components/layout/AppShell';

export const DashboardPage = () => {
  return (
    <AppShell
      title="DEVOPS"
      subtitle=""
    >
      <ExecutiveSummary />

      <section className="insight-panel">
        <h3>Support</h3>
        <p>
            inventory in real time, reduce avoidable spoilage, and prioritize replenishment using AI-assisted shelf-life signals.
        </p>
      </section>
    </AppShell>
  );
};
