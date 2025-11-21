import React, { useState } from 'react';
import { configureSupabase } from '../lib/supabaseClient';
import { Database, ArrowRight, AlertCircle } from 'lucide-react';

const SetupPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('http') || !key) {
      setError('Please enter a valid URL and API Key.');
      return;
    }
    configureSupabase(url, key);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <Database size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Connect Database</h1>
          <p className="text-gray-500 mt-2">
            To start the Patricia Clinic Manager, please connect your Supabase database.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Project URL</label>
            <input
              type="url"
              placeholder="https://xyz.supabase.co"
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Anon Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={key}
              onChange={e => setKey(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg transition flex items-center justify-center gap-2"
          >
            Connect & Start <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
            <h4 className="font-bold mb-2">Don't have a database?</h4>
            <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a> and create a project.</li>
                <li>Run the SQL script provided in the chat to create tables.</li>
                <li>Copy the URL and Anon Key from Project Settings &gt; API.</li>
            </ol>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;