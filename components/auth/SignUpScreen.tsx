
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, AlertCircle } from 'lucide-react';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await signUp(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-xl mx-auto px-6 animate-in slide-in-from-right-10 duration-300">
      <div className="flex items-center h-16 -mx-6 px-4 border-b border-slate-100">
        <button onClick={onNavigateToLogin} className="p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-[900] text-lg ml-2 italic text-[#312E81]">Create account</span>
      </div>

      <div className="pt-8 mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join the Network</h2>
        <p className="text-slate-500 mt-1 text-sm font-medium">Build your professional presence on R.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Jane Foster"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] transition-all font-medium"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Email address</label>
          <input
            type="email"
            placeholder="jane@example.com"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] transition-all font-medium"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Password</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] transition-all font-medium"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100">
            <AlertCircle size={16} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <p className="text-[11px] text-slate-500 text-center px-4 leading-relaxed font-bold uppercase tracking-wider">
          By signing up, you agree to our <span className="text-indigo-600">Privacy Policy</span> and <span className="text-indigo-600">Terms of Service</span>.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#312E81] text-white font-black py-4 rounded-2xl mt-6 hover:bg-indigo-900 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-100"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               <span>Creating...</span>
            </div>
          ) : 'Sign Up'}
        </button>
      </form>

      <div className="flex-1"></div>

      <button 
        onClick={onNavigateToLogin}
        className="mb-10 text-indigo-600 font-black text-center text-sm uppercase tracking-widest"
      >
        Already a member? Sign In
      </button>
    </div>
  );
};

export default SignUpScreen;
