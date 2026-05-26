import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../components/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        username,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        toast.success('Access Granted');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unauthorized Access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-brand-white shadow-2xl  rounded-sm overflow-hidden border border-gray-100">

        <div className="p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl text-brand-primary tracking-tight uppercase">
              ADMIN LOGIN
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs text-brand-primary uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200  rounded-sm focus:ring-0 focus:border-brand-primary outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin ID"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-brand-primary uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200  rounded-sm focus:ring-0 focus:border-brand-primary outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-brand-primary text-brand-white cursor-pointer rounded-sm shadow-lg transition-all duration-300 hover:brightness-125 active:scale-[0.98] tracking-widest
                ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;