import { useState } from 'react';
import {
  Sun,
  Moon,
  LogOut,
  ShieldAlert,
  Save,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [criticalPush, setCriticalPush] = useState(true);
  const [satellitePolling, setSatellitePolling] = useState(15);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncingFirms, setIsSyncingFirms] = useState(false);
  const [firmsSyncStatus, setFirmsSyncStatus] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSyncFirms = async () => {
    setIsSyncingFirms(true);
    setFirmsSyncStatus(null);
    try {
      const res = await api.zones.syncFirms();
      setFirmsSyncStatus(`Satellite sweep completed: ${res.zonesScanned} zones scanned, ${res.newAlertsTriggered} new alerts.`);
    } catch {
      setFirmsSyncStatus('Satellite sync failed. Check connection.');
    } finally {
      setIsSyncingFirms(false);
      setTimeout(() => setFirmsSyncStatus(null), 5000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Command Center Settings & Telemetry
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure system telemetry, alert rules, satellite feeds, and operator credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-[#F5760A] hover:bg-[#E06800] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          <span>{isSaved ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Grid Settings Sections */}
      <div className="space-y-5">
        {/* Section 1: Satellite & Telemetry Feeds */}
        <GlassCard className="p-5" elevated>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-hairline)]">
            <Globe size={16} className="text-[#F5760A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Satellite & External Data Feeds
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">NASA FIRMS Ingestion</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  MODIS & VIIRS thermal imaging satellite constellations
                </div>
                {firmsSyncStatus && (
                  <div className="text-[11px] text-[#22C55E] mt-1 font-semibold animate-in fade-in">
                    {firmsSyncStatus}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncFirms}
                  disabled={isSyncingFirms}
                  className="px-3 py-1 rounded-xl bg-[rgba(245,118,10,0.18)] hover:bg-[#F5760A] text-[#F5760A] hover:text-white border border-[rgba(245,118,10,0.3)] text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSyncingFirms ? 'Syncing...' : 'Sync Feed Now'}
                </button>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[rgba(34,197,94,0.14)] text-[#22C55E] border border-[rgba(34,197,94,0.3)]">
                  Active Feed
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)]">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">Sensor Polling Interval</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Frequency of ground weather station readings (seconds)
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={satellitePolling}
                  onChange={(e) => setSatellitePolling(parseInt(e.target.value) || 15)}
                  className="w-16 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-2 text-center text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#F5760A]"
                />
                <span className="text-xs text-[var(--text-secondary)]">sec</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Appearance & Mode */}
        <GlassCard className="p-5" elevated>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-hairline)]">
            {theme === 'dark' ? <Moon size={16} className="text-[#F5760A]" /> : <Sun size={16} className="text-[#F5760A]" />}
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Interface Display & Command Theme
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Theme Mode</div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Current mode: <strong className="text-[var(--text-primary)] capitalize">{theme}</strong>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-bold transition-all flex items-center gap-2 border border-[var(--border-hairline)] shadow-sm"
            >
              {theme === 'dark' ? <Sun size={15} className="text-[#F5760A]" /> : <Moon size={15} className="text-[#38BDF8]" />}
              <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>
        </GlassCard>

        {/* Section 3: Alert Rules & Triage Thresholds */}
        <GlassCard className="p-5" elevated>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-hairline)]">
            <ShieldAlert size={16} className="text-[#EF4444]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Alert Sensitivity & Notification Channels
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">Critical Push Escalation</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Immediately trigger siren and banner on level 4 critical flame front
                </div>
              </div>
              <button
                onClick={() => setCriticalPush(!criticalPush)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 border border-[var(--border-hairline)] ${
                  criticalPush ? 'bg-[#F5760A]' : 'bg-[var(--bg-surface-active)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                    criticalPush ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)]">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">Audio Telemetry Chime</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Play acoustic chime when newly detected ignition point is polled
                </div>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 border border-[var(--border-hairline)] ${
                  soundAlerts ? 'bg-[#F5760A]' : 'bg-[var(--bg-surface-active)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                    soundAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Section 4: Operator Clearance & Session */}
        <GlassCard className="p-5" elevated>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-hairline)]">
            <Lock size={16} className="text-[#38BDF8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Operator Authentication & Session
            </h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F5760A] text-[#0C0A09] font-bold text-sm flex items-center justify-center">
                AD
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">Admin Operator</div>
                <div className="text-[11px] text-[var(--text-secondary)] font-mono">admin@fireberg.com · Level 5 Clearance</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-[rgba(239,68,68,0.15)] hover:bg-[#EF4444] text-[#EF4444] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-[rgba(239,68,68,0.3)] shadow-sm"
            >
              <LogOut size={13} />
              <span>Disconnect</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
