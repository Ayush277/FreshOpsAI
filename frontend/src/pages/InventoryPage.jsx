import { InventoryTable } from '../components/inventory/InventoryTable';
import { AppShell } from '../components/layout/AppShell';
import { useInventory } from '../hooks/useInventory';
import '../styles/inventory.css';

export const InventoryPage = () => {
  const { items, loading, error, refreshItems, deleteItem, secondsUntilRefresh, currentTime } = useInventory();

  const handleDelete = async (itemId, itemName) => {
    const confirmed = window.confirm(`Remove ${itemName} from inventory?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteItem(itemId);
    } catch (requestError) {
      window.alert(requestError.message || 'Unable to remove item');
    }
  };

  return (
    <AppShell
      title="Inventory Overview"
      subtitle="Complete list of all detected food items and expiry windows"
      actions={<button onClick={refreshItems}>Refresh List</button>}
    >
      <div className="inventory-stats-intro">
        <div className="stats-intro-content">
          <span className="stats-tag">All Units Collective</span>
          <h3>Inventory Integrity</h3>
          <p>Real-time analytics for perishable items across all storage zones.</p>
          <p className="inventory-timer live-pulse">Live update in {secondsUntilRefresh}s</p>
        </div>
      </div>

      {loading ? <p className="state-banner">Syncing with storage records...</p> : null}
      {error ? <p className="state-banner state-error">{error}</p> : null}

      <InventoryTable items={items} currentTime={currentTime} onDeleteItem={handleDelete} />
    </AppShell>
  );
};
