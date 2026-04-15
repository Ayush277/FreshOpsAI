import { Link, useLocation } from 'react-router-dom';

const navigationLinks = [
  { label: 'Overview', path: '/', icon: '⬢' },
  { label: 'Detection', path: '/upload', icon: '◉' },
  { label: 'Inventory', path: '/inventory', icon: '▤' },
  { label: 'Alerts', path: '/alerts', icon: '⚠' },
];

export const AppShell = ({ title, subtitle, actions, children }) => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span className="brand-badge">FreshOps AI</span>
          <h1>Perishable Intelligence</h1>
          <p>Operational visibility for every shelf-life decision.</p>
          <span className="brand-live">LIVE TELEMETRY</span>
        </div>

        <nav className="app-nav">
          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="app-content">
        <header className="page-header">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </header>

        <section className="page-body">{children}</section>
      </main>
    </div>
  );
};
