import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/header/Header';
import Footer from '../components/shop/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to log in: ' + (err.message || 'Check your internet connection'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-amber-300/40">
              <LogIn className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back! 👋</h1>
            <p className="text-xs font-semibold text-slate-500">Sign in to your Grocery Hub account</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-extrabold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-700 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-700 pl-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-300/40 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Logging in...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-extrabold text-amber-600 hover:text-amber-700 underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
