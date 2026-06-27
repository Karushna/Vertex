'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Income {
  id: number;
  description: string;
  amount: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [income, setIncome] = useState<Income[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIncome = useCallback(async () => {
    try {
      const data = await apiFetch('/income');
      setIncome(data);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('vertex_token');
    const stored = localStorage.getItem('vertex_user');
    if (!token || !stored) {
      router.replace('/login');
      return;
    }
    setUser(JSON.parse(stored));
    fetchIncome();
  }, [router, fetchIncome]);

  async function handleAddIncome(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const entry = await apiFetch('/income', {
        method: 'POST',
        body: JSON.stringify({ description, amount: parseFloat(amount), date }),
      });
      setIncome((prev) => [entry, ...prev]);
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add income');
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem('vertex_token');
    localStorage.removeItem('vertex_user');
    router.push('/login');
  }

  const total = income.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">Vertex</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-200 mb-4">Add Income</h3>
          <form onSubmit={handleAddIncome} className="space-y-4">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. YouTube ad revenue"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
            >
              {submitting ? 'Adding…' : 'Add income'}
            </button>
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-200">Income</h3>
            {income.length > 0 && (
              <span className="text-sm text-gray-400">
                Total:{' '}
                <span className="text-white font-medium">
                  ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </span>
            )}
          </div>
          {income.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No income recorded yet. Add your first entry above.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {income.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-200">{item.description}</td>
                    <td className="px-6 py-3.5 text-gray-400">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5 text-right text-green-400 font-medium">
                      ${parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
