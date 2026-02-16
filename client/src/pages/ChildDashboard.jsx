import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import TransactionList from '../components/TransactionList';
import BalanceChart from '../components/BalanceChart';

export default function ChildDashboard() {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [parents, setParents] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [txnData, familyData] = await Promise.all([
      api.getTransactions(token, user.id),
      api.getFamily(token),
    ]);
    setTransactions(txnData.transactions);
    setBalance(txnData.balance);
    setParents(familyData.parents);
  }

  async function handleJoin(e) {
    e.preventDefault();
    setJoinMsg('');
    setJoinError('');
    try {
      const data = await api.joinFamily(token, joinCode.trim().toUpperCase());
      setJoinMsg(`Linked to ${data.parent.name}!`);
      setJoinCode('');
      loadData();
    } catch (err) {
      setJoinError(err.message);
    }
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <div className="page">
      <div className="balance-card">
        <div className="balance-label">My Balance</div>
        <div className="balance-amount">{formatMoney(balance)}</div>
        <div className="balance-name">{user.name}'s Account</div>
      </div>

      {transactions.length > 0 && (
        <div className="card">
          <h2>Balance Over Time</h2>
          <BalanceChart transactions={transactions} />
        </div>
      )}

      <div className="card">
        <h2>Transaction History</h2>
        <TransactionList transactions={transactions} />
      </div>

      {parents.length === 0 && (
        <div className="card">
          <h2>Join a Family</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Ask your parent for a link code and enter it below.
          </p>
          {joinError && <div className="error-msg">{joinError}</div>}
          {joinMsg && <div className="success-msg">{joinMsg}</div>}
          <form onSubmit={handleJoin} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter link code"
              style={{
                flex: 1,
                padding: '0.6rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15rem',
              }}
              required
            />
            <button type="submit" className="btn btn-primary">
              Join
            </button>
          </form>
        </div>
      )}

      {parents.length > 0 && (
        <div className="card">
          <h2>My Family</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {parents.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="avatar" style={{ background: p.avatar_color }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
