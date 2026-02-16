export default function TransactionList({ transactions }) {
  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      Math.abs(amount)
    );
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#x1F4B0;</div>
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <ul className="txn-list">
      {transactions.map((txn) => (
        <li key={txn.id} className="txn-item">
          <div className="txn-left">
            <div className="txn-desc">{txn.description}</div>
            <div className="txn-meta">
              {txn.source} &middot; from {txn.added_by_name} &middot; {formatDate(txn.created_at)}
            </div>
          </div>
          <div className={`txn-amount ${txn.amount >= 0 ? 'positive' : 'negative'}`}>
            {txn.amount >= 0 ? '+' : '-'}{formatMoney(txn.amount)}
          </div>
        </li>
      ))}
    </ul>
  );
}
