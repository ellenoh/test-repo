import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function BalanceChart({ transactions }) {
  // Build running balance over time (oldest first)
  const sorted = [...transactions].reverse();
  let running = 0;
  const data = sorted.map((txn) => {
    running += txn.amount;
    return {
      date: new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: Math.round(running * 100) / 100,
    };
  });

  if (data.length < 2) return null;

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#4f46e5"
            strokeWidth={2.5}
            dot={{ fill: '#4f46e5', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
