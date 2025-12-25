
import React, { useState } from 'react';
import { Leaf, Mail, Lock, User, ArrowRight, ShieldCheck, Sprout, Ghost, UserCircle, Briefcase } from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface AuthProps {
  onAuthComplete: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('farmer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleGuestAccess = () => {
    const guestUser: UserType = {
      id: 'guest-' + Math.random().toString(36).substr(2, 5),
      name: 'Guest User',
      email: 'guest@agriquest.local',
      role: 'farmer',
      privacy: 'private',
      isGuest: true,
      notificationPrefs: {
        agriUpdates: true,
        cropAlerts: true,
        events: true
      }
    };
    onAuthComplete(guestUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const mockUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        name: isLogin ? (formData.email.split('@')[0]) : formData.name,
        email: formData.email,
        role: role,
        privacy: 'public',
        notificationPrefs: {
          agriUpdates: true,
          cropAlerts: true,
          events: true
        }
      };
      setLoading(false);
      onAuthComplete(mockUser);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <div className="relative z-10 flex items-center gap-3">
          <Leaf className="w-10 h-10 text-emerald-400" />
          <h1 className="text-3xl font-bold font-outfit text-white tracking-tight">AgriQuest</h1>
        </div>

        <div className="relative z-10">
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 mb-8 max-w-xl shadow-2xl">
            <h2 className="text-5xl font-extrabold text-white font-outfit leading-tight mb-6">
              Agricultural Intelligence Exchange.
            </h2>
            <p className="text-emerald-100/80 text-xl font-medium leading-relaxed">
              Where sustainable production meets strategic procurement. Verified by AI.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 text-emerald-500/80 text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          Military Grade Security
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <h3 className="text-4xl font-black text-slate-900 font-outfit mb-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-slate-500 font-medium">
              Join the neural farm network today
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-10">
            <button 
              onClick={() => setRole('farmer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'farmer' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}
            >
              <UserCircle className="w-4 h-4" /> Farmer
            </button>
            <button 
              onClick={() => setRole('buyer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'buyer' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}
            >
              <Briefcase className="w-4 h-4" /> Buyer / Reseller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" required placeholder="Name"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" required placeholder="farmer@green.com"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <> {isLogin ? 'Sign In' : 'Register'} <ArrowRight className="w-5 h-5" /> </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <button 
              onClick={handleGuestAccess}
              className="w-full bg-white text-slate-600 py-4 rounded-2xl font-bold border-2 border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Ghost className="w-5 h-5" /> Skip for now
            </button>
            <p className="text-center text-slate-500 text-sm font-medium">
              {isLogin ? "New here?" : "Already a member?"}{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 font-bold hover:underline">
                {isLogin ? 'Create account' : 'Log in instead'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
