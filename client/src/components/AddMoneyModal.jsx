import { useState } from 'react';

const SOURCES = ['Grandma', 'Grandpa', 'Birthday', 'Holiday', 'Allowance', 'Chores', 'Tooth Fairy', 'Other'];

export default function AddMoneyModal({ childName, onSubmit, onClose }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('Other');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount),
      description,
      source,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Money for {childName}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              min="0.01"
            />
          </div>

          <div className="form-group">
            <label>From</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Birthday money from Grandma"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Add Money
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
