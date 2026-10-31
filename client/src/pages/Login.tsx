import { useState } from 'react';
import { Flame, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import GlassCard from '../components/ui/GlassCard';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('admin@fireberg.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.auth.login(email, password);
      localStorage.setItem('token', response.token);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('admin@fireberg.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-primary)] p-4 relative overflow-hidden transition-colors duration-200">
      {/* Subtle background radar ring */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-[rgba(245,118,10,0.12)] pointer-events-none" />
      <div className="absolute w-[900px] h-[900px] rounded-full border border-[var(--border-hairline)] pointer-events-none" />

      <GlassCard className="w-full max-w-[420px] p-8 relative z-10 shadow-glass-lg" elevated>
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(245,118,10,0.18)] border border-[rgba(245,118,10,0.35)] text-[#F5760A] flex items-center justify-center mb-4 shadow-glass-sm">
            <Flame size={30} className="fill-[#F5760A]" />
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">FireBerg</h1>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[rgba(245,118,10,0.18)] text-[#F5760A] border border-[rgba(245,118,10,0.3)]">
              CMD-01
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-1.5 uppercase tracking-wider font-semibold">
            Disaster Early Warning & Response Grid
          </p>

          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[10px] text-[var(--text-secondary)]">
            <ShieldCheck size={12} className="text-[#22C55E]" />
            <span>ENCRYPTED COMMAND TERMINAL · WGS84</span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[rgba(239,68,68,0.14)] border border-[rgba(239,68,68,0.35)] text-[#EF4444] text-xs font-medium flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider text-[11px]">
              Operator Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
              placeholder="admin@fireberg.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                Access Key / Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#F5760A] hover:bg-[#E06800] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Authenticating Operator...' : 'Authorize Terminal Access'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo credentials helper */}
        <div className="mt-6 pt-4 border-t border-[var(--border-hairline)] text-center">
          <button
            type="button"
            onClick={handleUseDemo}
            className="text-[11px] text-[var(--text-secondary)] hover:text-[#F5760A] transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <Sparkles size={12} className="text-[#F5760A]" />
            <span>Default Operator: <strong className="text-[var(--text-primary)]">admin@fireberg.com</strong> / <strong className="text-[var(--text-primary)]">admin123</strong></span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
