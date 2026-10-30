import { useState, useEffect } from 'react';
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

export default function Settings() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [criticalPush, setCriticalPush] = useState(true);
  const [satellitePolling, setSatellitePolling] = useState(15);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncingFirms, setIsSyncingFirms] = useState(false);
  const [firmsSyncStatus, setFirmsSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
    } catch (err) {
      setFirmsSyncStatus('Satellite sync failed. Check connection.');
    } finally {
      setIsSyncingFirms(false);
      setTimeout(() => setFirmsSyncStatus(null), 5000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-lg font-bold text-[#F7F5F2] uppercase tracking-wider">
            Command Center Settings & Telemetry
          </h2>
          <p className="text-xs text-[#A8A199] mt-0.5">
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
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
            <Globe size={16} className="text-[#F5760A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">
              Satellite & External Data Feeds
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F7F5F2]">NASA FIRMS Ingestion</div>
                <div className="text-[11px] text-[#A8A199] mt-0.5">
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

            <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <div>
                <div className="text-xs font-bold text-[#F7F5F2]">Sensor Polling Interval</div>
                <div className="text-[11px] text-[#A8A199] mt-0.5">
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
                  className="w-16 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] px-2 text-center text-xs text-[#F7F5F2] font-mono focus:outline-none focus:border-[#F5760A]"
                />
                <span className="text-xs text-[#A8A199]">sec</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Appearance & Mode */}
        <GlassCard className="p-5" elevated>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
            {theme === 'dark' ? <Moon size={16} className="text-[#F5760A]" /> : <Sun size={16} className="text-[#F5760A]" />}
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">
              Interface Display & Command Theme
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#F7F5F2]">Theme Mode</div>
              <div className="text-[11px] text-[#A8A199] mt-0.5">
                Current mode: <strong className="text-[#F7F5F2] capitalize">{theme}</strong> (Command center dark recommended)
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[#F7F5F2] text-xs font-bold transition-all flex items-center gap-2 border border-[rgba(255,255,255,0.1)]"
            >
              {theme === 'dark' ? <Sun size={14} className="text-[#F5760A]" /> : <Moon size={14} className="text-[#38BDF8]" />}
              <span>Toggle to {theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </GlassCard>

        {/* Section 3: Alert Rules & Triage Thresholds */}
        <GlassCard className="p-5" elevated>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
            <ShieldAlert size={16} className="text-[#EF4444]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">
              Alert Sensitivity & Notification Channels
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F7F5F2]">Critical Push Escalation</div>
                <div className="text-[11px] text-[#A8A199] mt-0.5">
                  Immediately trigger siren and banner on level 4 critical flame front
                </div>
              </div>
              <button
                onClick={() => setCriticalPush(!criticalPush)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                  criticalPush ? 'bg-[#F5760A]' : 'bg-[rgba(255,255,255,0.1)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    criticalPush ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <div>
                <div className="text-xs font-bold text-[#F7F5F2]">Audio Telemetry Chime</div>
                <div className="text-[11px] text-[#A8A199] mt-0.5">
                  Play acoustic chime when newly detected ignition point is polled
                </div>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                  soundAlerts ? 'bg-[#F5760A]' : 'bg-[rgba(255,255,255,0.1)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    soundAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Section 4: Operator Clearance & Session */}
        <GlassCard className="p-5" elevated>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
            <Lock size={16} className="text-[#38BDF8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">
              Operator Authentication & Session
            </h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F5760A] text-[#0C0A09] font-bold text-sm flex items-center justify-center">
                AD
              </div>
              <div>
                <div className="text-xs font-bold text-[#F7F5F2]">Admin Operator</div>
                <div className="text-[11px] text-[#A8A199] font-mono">admin@fireberg.com · Level 5 Clearance</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-[rgba(239,68,68,0.15)] hover:bg-[#EF4444] text-[#EF4444] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-[rgba(239,68,68,0.3)]"
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
