import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  Map as MapIcon,
  Bell,
  FileText,
  MapPin,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { NavTab } from './ui/NavTab';
import { CircleIconButton } from './ui/CircleIconButton';
import { api } from '../lib/api';

interface TopbarProps {
  onLogout: () => void;
  onThemeToggle?: () => void;
  theme?: 'dark' | 'light';
}

export default function Topbar({ onLogout, onThemeToggle, theme = 'dark' }: TopbarProps) {
  const navigate = useNavigate();
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlertCount = async () => {
    try {
      const data = await api.alerts.list();
      const unacknowledged = data.filter((a: any) => !a.acknowledged);
      setUnreadAlerts(unacknowledged.length);
      setRecentAlerts(unacknowledged.slice(0, 4));
    } catch {
      // silently handle offline/mock
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full px-4 lg:px-6 py-3 bg-[rgba(12,10,9,0.85)] backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(245,118,10,0.18)] border border-[rgba(245,118,10,0.35)] text-[#F5760A]">
            <Flame size={20} className="fill-[#F5760A]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight text-[#F7F5F2]">FireBerg</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[rgba(255,255,255,0.08)] text-[#A8A199] rounded border border-[rgba(255,255,255,0.06)]">
                CMD-01
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#A8A199] font-medium leading-none hidden md:block">
              Disaster Early Warning Grid
            </span>
          </div>
        </div>

        {/* Center: Pill-tab Navigation */}
        <nav className="flex items-center p-1 rounded-full bg-[rgba(24,20,17,0.85)] border border-[rgba(255,255,255,0.08)] shadow-glass-sm overflow-x-auto max-w-full">
          <NavTab to="/" label="Dashboard" icon={<LayoutDashboard size={15} />} />
          <NavTab to="/map" label="Map" icon={<MapIcon size={15} />} />
          <NavTab
            to="/alerts"
            label="Alerts"
            icon={<Bell size={15} />}
            badge={unreadAlerts > 0 ? unreadAlerts : undefined}
          />
          <NavTab to="/reports" label="Reports" icon={<FileText size={15} />} />
          <NavTab to="/zones" label="Zones" icon={<MapPin size={15} />} />
          <NavTab to="/analytics" label="Analytics" icon={<BarChart3 size={15} />} />
        </nav>

        {/* Right: Telemetry status & Circular Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Live System Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.25)] text-[#22C55E]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase">ALL NODES ONLINE</span>
          </div>

          {/* Notifications Button & Dropdown */}
          <div className="relative" ref={alertsRef}>
            <CircleIconButton
              icon={<Bell size={17} />}
              badgeCount={unreadAlerts}
              title="Incident Notifications"
              onClick={() => setIsAlertsDropdownOpen(!isAlertsDropdownOpen)}
              active={isAlertsDropdownOpen}
            />

            {isAlertsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel-elevated p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(255,255,255,0.08)]">
                  <span className="text-xs font-semibold text-[#F7F5F2]">Active Alerts</span>
                  <span className="text-[10px] text-[#A8A199]">{unreadAlerts} pending</span>
                </div>
                {recentAlerts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#A8A199]">
                    No unacknowledged alerts. Grid is nominal.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          setIsAlertsDropdownOpen(false);
                          navigate('/alerts');
                        }}
                        className="p-2 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-[#F7F5F2]">{alert.zone?.name || 'Monitored Zone'}</span>
                          <span
                            className="text-[10px] font-bold uppercase"
                            style={{
                              color:
                                alert.severity === 'critical'
                                  ? '#EF4444'
                                  : alert.severity === 'high'
                                  ? '#FB923C'
                                  : alert.severity === 'medium'
                                  ? '#F59E0B'
                                  : '#22C55E',
                            }}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#A8A199] mt-0.5">
                          {alert.temperature ? `${alert.temperature.toFixed(1)}°C · ` : ''}
                          {alert.windSpeed ? `Wind ${alert.windSpeed.toFixed(0)} km/h` : ''}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setIsAlertsDropdownOpen(false);
                        navigate('/alerts');
                      }}
                      className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-[#F5760A] hover:underline"
                    >
                      View All Alerts →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings Button */}
          <CircleIconButton
            icon={<SettingsIcon size={17} />}
            title="System Settings"
            onClick={() => navigate('/settings')}
          />

          {/* Theme Toggle if available */}
          {onThemeToggle && (
            <CircleIconButton
              icon={theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              title="Toggle Theme"
              onClick={onThemeToggle}
            />
          )}

          {/* User Profile Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full bg-[rgba(30,24,20,0.85)] hover:bg-[rgba(45,36,30,0.95)] border border-[rgba(255,255,255,0.08)] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#F5760A] text-[#0C0A09] font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <ChevronDown size={14} className="text-[#A8A199] mr-1 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel-elevated p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
                  <div className="text-xs font-semibold text-[#F7F5F2]">Admin Operator</div>
                  <div className="text-[10px] text-[#A8A199] truncate">admin@fireberg.com</div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A8A199] hover:text-[#F7F5F2] hover:bg-[rgba(255,255,255,0.06)] rounded-xl transition-colors"
                  >
                    <SettingsIcon size={14} />
                    <span>Control Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] rounded-xl transition-colors mt-0.5 font-medium"
                  >
                    <LogOut size={14} />
                    <span>Disconnect Command</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
