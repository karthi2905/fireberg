import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Thermometer,
  Droplets,
  Wind,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Search,
  Radar,
  CheckCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { formatRelativeTime } from '../lib/utils';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import StatusPill from '../components/ui/StatusPill';
import Skeleton from '../components/Skeleton';

interface Alert {
  id: string;
  zoneId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  status?: string;
  createdAt: string;
  zone?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]);

  const loadAlerts = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.alerts.list({
        status: statusFilter,
      });
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleScanAlerts = async () => {
    setIsScanning(true);
    try {
      const res = await api.alerts.generate();
      setNotification(res.message || 'Alert scan complete.');
      setTimeout(() => setNotification(null), 4000);
      await loadAlerts();
    } catch (error) {
      console.error('Failed to run alert scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    setIsProcessing(alertId);
    try {
      const updated = await api.alerts.acknowledge(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, ...updated, acknowledged: true, status: 'acknowledged' } : a))
      );
      setNotification('Alert acknowledged. Status updated to In-Triage.');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    setIsProcessing(alertId);
    try {
      const updated = await api.alerts.resolve(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, ...updated, resolved: true, status: 'resolved' } : a))
      );
      setNotification('Incident marked as Contained & Resolved.');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  // Metrics based on all alerts loaded or calculated
  const activeCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length;
  const highCount = alerts.filter((a) => a.severity === 'high' && !a.resolved).length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesSearch =
      !searchQuery ||
      (alert.zone?.name && alert.zone.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Incidents"
          value={activeCount}
          subValue="Real-time sensor triggers"
          icon={<Bell size={18} className="text-[#F5760A]" />}
          accentColor="#F5760A"
        />

        <StatCard
          label="Critical Severity"
          value={criticalCount}
          subValue="Immediate triage required"
          icon={<ShieldAlert size={18} className="text-[#EF4444]" />}
          accentColor="#EF4444"
          trend={{ text: `${criticalCount} Active`, isPositive: false }}
        />

        <StatCard
          label="High Severity"
          value={highCount}
          subValue="Rapid perimeter expansion"
          icon={<AlertTriangle size={18} className="text-[#FB923C]" />}
          accentColor="#FB923C"
        />

        <StatCard
          label="Resolved / Contained"
          value={resolvedCount}
          subValue="Incident closed & perimeter safe"
          icon={<CheckCircle2 size={18} className="text-[#22C55E]" />}
          accentColor="#22C55E"
          trend={{ text: `${resolvedCount} Resolved`, isPositive: true }}
        />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-[rgba(245,118,10,0.15)] border border-[rgba(245,118,10,0.35)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-between gap-2 shadow-glass-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCheck size={16} className="text-[#22C55E]" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Main Glass Alerts Container */}
      <GlassCard className="p-5" elevated>
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Alert Triage Dispatch
            </h2>
            <button
              onClick={loadAlerts}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-hairline)] transition-colors"
              title="Refresh alerts"
            >
              <RotateCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleScanAlerts}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-[rgba(245,118,10,0.16)] hover:bg-[#F5760A] text-[#F5760A] hover:text-white border border-[rgba(245,118,10,0.3)] text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Scan all zones against risk thresholds and trigger new alerts"
            >
              <Radar size={13} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning Sensors...' : 'Sensor Threshold Sweep'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sector or ID..."
                className="w-full h-8 pl-8 pr-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All Incidents' },
                  { id: 'active', label: 'Active Unacked' },
                  { id: 'acknowledged', label: 'In Triage' },
                  { id: 'resolved', label: 'Resolved' },
                ] as const
              ).map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F5760A] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Severity Pill Filter */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-x-auto">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
                const isActive = severityFilter === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F5760A] text-white shadow-sm font-extrabold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-xl bg-[var(--bg-surface)]" />
            <Skeleton className="h-20 rounded-xl bg-[var(--bg-surface)]" />
            <Skeleton className="h-20 rounded-xl bg-[var(--bg-surface)]" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)]">
            <div className="w-12 h-12 rounded-full bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] text-[#22C55E] flex items-center justify-center mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No Incidents Found</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
              All sensors and monitored sectors match nominal safety parameters for the selected filters.
            </p>
            <button
              onClick={handleScanAlerts}
              className="mt-4 px-4 py-2 rounded-xl bg-[#F5760A] text-white text-xs font-bold hover:bg-[#E06800] transition-colors shadow-sm"
            >
              Trigger Sensor Scan Now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAlerts.map((alert) => {
              const isCrit = alert.severity === 'critical';
              const isAcked = alert.acknowledged;
              const isResolved = alert.resolved;

              return (
                <div
                  key={alert.id}
                  className={`group p-4 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
                    isResolved
                      ? 'bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.2)] opacity-85'
                      : isCrit
                      ? 'bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.25)]'
                      : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)]'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <StatusPill status={alert.severity} pulse={isCrit && !isResolved} />

                      {/* Status Badges */}
                      {isResolved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[rgba(34,197,94,0.18)] text-[#22C55E] border border-[rgba(34,197,94,0.35)] flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          Resolved
                        </span>
                      ) : isAcked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[rgba(245,158,11,0.18)] text-[#F59E0B] border border-[rgba(245,158,11,0.35)] flex items-center gap-1">
                          <Check size={11} />
                          Acknowledged / In Triage
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[rgba(239,68,68,0.18)] text-[#EF4444] border border-[rgba(239,68,68,0.35)] flex items-center gap-1 animate-pulse">
                          <AlertCircle size={11} />
                          New Trigger
                        </span>
                      )}

                      <span className="text-xs font-semibold text-[var(--text-secondary)]">
                        Triggered {formatRelativeTime(alert.createdAt)}
                      </span>
                      {alert.acknowledgedAt && (
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          · Acked {formatRelativeTime(alert.acknowledgedAt)}
                        </span>
                      )}
                      {alert.resolvedAt && (
                        <span className="text-[10px] text-[#22C55E]">
                          · Closed {formatRelativeTime(alert.resolvedAt)}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-hairline)] font-mono ml-auto md:ml-0">
                        ID: #{alert.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {alert.zone?.name || 'Monitored Sector'}
                    </h3>

                    {/* Telemetry Bar */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)] flex-wrap">
                      {alert.temperature !== undefined && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Thermometer size={14} className="text-[#FB923C]" />
                          <span>Temp:</span>
                          <strong className="text-[var(--text-primary)] tabular-nums">
                            {alert.temperature.toFixed(1)}°C
                          </strong>
                        </span>
                      )}
                      {alert.humidity !== undefined && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Droplets size={14} className="text-[#38BDF8]" />
                          <span>Humidity:</span>
                          <strong className="text-[var(--text-primary)] tabular-nums">
                            {alert.humidity.toFixed(0)}%
                          </strong>
                        </span>
                      )}
                      {alert.windSpeed !== undefined && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Wind size={14} className="text-[var(--text-secondary)]" />
                          <span>Wind:</span>
                          <strong className="text-[var(--text-primary)] tabular-nums">
                            {alert.windSpeed.toFixed(1)} km/h
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Acknowledge and Resolve */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isAcked && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={isProcessing === alert.id}
                        className="px-3.5 py-2 rounded-xl bg-[rgba(245,118,10,0.18)] hover:bg-[#F5760A] text-[#F5760A] hover:text-white border border-[rgba(245,118,10,0.35)] text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        <Check size={14} />
                        <span>Acknowledge Triage</span>
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={isProcessing === alert.id}
                        className="px-3.5 py-2 rounded-xl bg-[rgba(34,197,94,0.18)] hover:bg-[#22C55E] text-[#22C55E] hover:text-white border border-[rgba(34,197,94,0.35)] text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        <CheckCircle2 size={14} />
                        <span>Resolve Incident</span>
                      </button>
                    )}

                    {isResolved && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        <span>Containment Complete</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
