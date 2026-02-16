import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import AddMoneyModal from '../components/AddMoneyModal';
import TransactionList from '../components/TransactionList';

export default function ParentDashboard() {
  const { token } = useAuth();
  const [children, setChildren] = useState([]);
  const [selected, setSelected] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [linkCode, setLinkCode] = useState('');

  useEffect(() => {
    loadFamily();
  }, []);

  async function loadFamily() {
    const data = await api.getFamily(token);
    setChildren(data.children);
  }

  async function selectChild(child) {
    setSelected(child);
    const data = await api.getTransactions(token, child.id);
    setTransactions(data.transactions);
    setBalance(data.balance);
  }

  async function handleGenerateCode() {
    const data = await api.generateLinkCode(token);
    setLinkCode(data.code);
  }

  async function handleAddMoney(txn) {
    await api.addTransaction(token, { child_id: selected.id, ...txn });
    const data = await api.getTransactions(token, selected.id);
    setTransactions(data.transactions);
    setBalance(data.balance);
    loadFamily();
    setShowAddMoney(false);
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  if (selected) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => setSelected(null)}>
            &larr; Back
          </button>
        </div>

        <div className="balance-card">
          <div className="balance-label">{selected.name}'s Balance</div>
          <div className="balance-amount">{formatMoney(balance)}</div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button className="btn btn-success" onClick={() => setShowAddMoney(true)}>
            + Add Money
          </button>
        </div>

        <div className="card">
          <h2>Transaction History</h2>
          <TransactionList transactions={transactions} />
        </div>

        {showAddMoney && (
          <AddMoneyModal
            childName={selected.name}
            onSubmit={handleAddMoney}
            onClose={() => setShowAddMoney(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your Kids</h1>
        <p>Select a child to view their account or add money</p>
      </div>

      {children.length > 0 ? (
        <div className="children-grid">
          {children.map((child) => (
            <div key={child.id} className="child-card" onClick={() => selectChild(child)}>
              <div className="avatar" style={{ background: child.avatar_color }}>
                {child.name.charAt(0).toUpperCase()}
              </div>
              <div className="child-info">
                <h3>{child.name}</h3>
                <div className="child-balance">{formatMoney(child.balance)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">&#x1F46A;</div>
          <p>No kids linked yet!</p>
          <p>Generate a link code and share it with your child's account.</p>
        </div>
      )}

      <div className="card">
        <h2>Link a Child</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Generate a code and share it with your kid. They'll enter it in their account to link up.
        </p>
        <button className="btn btn-primary" onClick={handleGenerateCode}>
          Generate Link Code
        </button>
        {linkCode && <div className="link-code-display">{linkCode}</div>}
      </div>
    </div>
  );
}
