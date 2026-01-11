
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-xl mx-auto items-center px-8 pt-24 transition-all duration-500">
      <div className="w-20 h-20 bg-[#312E81] rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100 mb-6 rotate-3">
        <h1 className="text-white text-5xl font-[900] italic -rotate-3">R</h1>
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Welcome back</h2>
      <p className="text-slate-500 text-sm font-medium mb-10">Sign in to your professional network</p>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="relative">
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] transition-all font-medium text-slate-800"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            required
          />
        </div>
        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] transition-all font-medium text-slate-800"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in zoom-in-95">
            <AlertCircle size={16} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#312E81] text-white font-black py-4 rounded-2xl hover:bg-indigo-900 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-100"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               <span>Authenticating...</span>
            </div>
          ) : 'Sign In'}
        </button>
      </form>

      <button className="mt-6 text-indigo-600 font-bold hover:underline text-sm uppercase tracking-widest">
        Forgot password?
      </button>

      <div className="flex-1"></div>

      <div className="w-full pb-10 space-y-6 flex flex-col items-center">
        <div className="flex items-center w-full px-4">
            <div className="flex-1 h-[1px] bg-slate-100"></div>
            <span className="px-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">New to R?</span>
            <div className="flex-1 h-[1px] bg-slate-100"></div>
        </div>
        
        <button
          onClick={onNavigateToSignUp}
          className="w-full border-2 border-slate-100 text-slate-700 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
        >
          Create New Account
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
