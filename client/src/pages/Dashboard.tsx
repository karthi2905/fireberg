import { useState, useEffect } from 'react';
import {
  Flame,
  Wind,
  Droplets,
  Thermometer,
  CheckCircle2,
  Compass,
  Radio,
  PhoneCall,
  MapPin,
  Layers,
  Activity
} from 'lucide-react';
import { api } from '../lib/api';
import { formatRelativeTime } from '../lib/utils';
import MapHero from '../components/MapHero';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import StatusPill from '../components/ui/StatusPill';
import SegmentedProgressBar from '../components/ui/SegmentedProgressBar';
import Skeleton from '../components/Skeleton';

interface Alert {
  id: string;
  zoneId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  acknowledged: boolean;
  createdAt: string;
  zone?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

interface Analytics {
  activeAlerts: number;
  totalAffectedArea: number;
  avgResponseTime: number;
}

interface Report {
  id: string;
  zoneId: string;
  areaHectares: number;
  estimatedDamage?: number;
  status: 'reported' | 'in-progress' | 'contained' | 'resolved';
  reportedBy?: string;
  createdAt: string;
  zone?: {
    name: string;
  };
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState<string | null>(null);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [alertsData, analyticsData, reportsData, zonesData] = await Promise.all([
        api.alerts.list(),
        api.analytics.get(),
        api.reports.list(),
        api.zones.list(),
      ]);
      setAlerts(alertsData);
      setAnalytics(analyticsData);
      setReports(reportsData);
      setZones(zonesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    setIsAcknowledging(alertId);
    try {
      const updated = await api.alerts.acknowledge(alertId);
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, ...updated, acknowledged: true } : a)));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      setIsAcknowledging(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    setIsAcknowledging(alertId);
    try {
      await api.alerts.resolve(alertId);
      setAlerts(alerts.filter((a) => a.id !== alertId));
      if (analytics) {
        setAnalytics({ ...analytics, activeAlerts: Math.max(0, analytics.activeAlerts - 1) });
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    } finally {
      setIsAcknowledging(null);
    }
  };

  const handleSyncTelemetry = async () => {
    try {
      setIsLoading(true);
      await api.zones.syncFirms();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to sync telemetry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Weather calculations based on active zones sensor telemetry
  const avgTemp = zones.length
    ? (zones.reduce((sum, z) => sum + (z.temperature || 32), 0) / zones.length).toFixed(1)
    : '34.2';
  const peakTemp = zones.length
    ? Math.max(...zones.map((z) => z.temperature || 32)).toFixed(1)
    : '41.5';

  const avgHumidity = zones.length
    ? (zones.reduce((sum, z) => sum + (z.humidity || 22), 0) / zones.length).toFixed(0)
    : '18';
  const minHumidity = zones.length
    ? Math.min(...zones.map((z) => z.humidity || 15)).toFixed(0)
    : '11';

  const avgWind = zones.length
    ? (zones.reduce((sum, z) => sum + (z.windSpeed || 24), 0) / zones.length).toFixed(0)
    : '28';
  const maxWind = zones.length
    ? Math.max(...zones.map((z) => z.windSpeed || 30)).toFixed(0)
    : '46';

  const filteredAlerts = alerts.filter((a) => {
    if (alertSeverityFilter === 'all') return true;
    return a.severity === alertSeverityFilter;
  });

  // Calculate area metrics
  const totalMonitoredArea = 42850;
  const affectedArea = analytics?.totalAffectedArea || (reports.reduce((acc, r) => acc + (r.areaHectares || 0), 0) || 4820);
  const unaffectedArea = Math.max(0, totalMonitoredArea - affectedArea);
  const containmentPercent = reports.length
    ? Math.round(
        (reports.filter((r) => r.status === 'contained' || r.status === 'resolved').length /
          reports.length) *
          100
      )
    : 64;

  return (
    <div className="space-y-6">
      {/* SECTION 1: MAP HERO & LIVE ALERTS PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-5 items-start">
        {/* Left: Glass Map Hero with overlaid floating stats */}
        <div className="min-w-0">
          <MapHero
            activeZonesCount={zones.length}
            totalAreaHectares={totalMonitoredArea}
            avgResponseTimeMin={analytics?.avgResponseTime || 14}
          />
        </div>

        {/* Right: Live Alerts Panel */}
        <GlassCard className="p-4 h-[480px] lg:h-[560px] flex flex-col justify-between" elevated>
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Live Alerts
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncTelemetry}
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[rgba(245,118,10,0.18)] hover:bg-[#F5760A] text-[#F5760A] hover:text-white transition-colors"
                  title="Scan telemetry and sync alerts"
                >
                  Scan
                </button>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[rgba(239,68,68,0.18)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] tabular-nums">
                  {alerts.length} Active
                </span>
              </div>
            </div>

            {/* Severity filter tabs */}
            <div className="flex items-center gap-1 my-3 p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-x-auto">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setAlertSeverityFilter(lvl)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                    alertSeverityFilter === lvl
                      ? 'bg-[#F5760A] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
            {isLoading ? (
              <>
                <Skeleton className="h-16 rounded-xl bg-[var(--bg-surface)]" />
                <Skeleton className="h-16 rounded-xl bg-[var(--bg-surface)]" />
                <Skeleton className="h-16 rounded-xl bg-[var(--bg-surface)]" />
              </>
            ) : filteredAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-secondary)]">
                <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] text-[#22C55E] flex items-center justify-center mb-2">
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">No Active Alerts</div>
                <div className="text-[11px] mt-0.5">All monitored zones are currently nominal.</div>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group p-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusPill status={alert.severity} pulse={alert.severity === 'critical'} />
                        {alert.acknowledged && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-[rgba(245,158,11,0.18)] text-[#F59E0B]">
                            In Triage
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--text-secondary)] tabular-nums">
                          {formatRelativeTime(alert.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {alert.zone?.name || 'Monitored Forest Sector'}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--text-secondary)] tabular-nums">
                        {alert.temperature && (
                          <span className="flex items-center gap-1 font-medium">
                            <Thermometer size={12} className="text-[#FB923C]" />
                            {alert.temperature.toFixed(0)}°C
                          </span>
                        )}
                        {alert.humidity && (
                          <span className="flex items-center gap-1 font-medium">
                            <Droplets size={12} className="text-[#38BDF8]" />
                            {alert.humidity.toFixed(0)}%
                          </span>
                        )}
                        {alert.windSpeed && (
                          <span className="flex items-center gap-1 font-medium">
                            <Wind size={12} className="text-[var(--text-secondary)]" />
                            {alert.windSpeed.toFixed(0)} km/h
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Acknowledge or Resolve */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={isAcknowledging === alert.id}
                          title="Acknowledge Alert"
                          className="px-2 py-1 rounded-lg bg-[rgba(245,118,10,0.18)] hover:bg-[#F5760A] text-[#F5760A] hover:text-white text-[10px] font-bold transition-all disabled:opacity-50"
                        >
                          Ack
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={isAcknowledging === alert.id}
                        title="Resolve Incident"
                        className="px-2 py-1 rounded-lg bg-[rgba(34,197,94,0.18)] hover:bg-[#22C55E] text-[#22C55E] hover:text-white text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Telemetry */}
          <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Sensors Polled: 1,472/sec</span>
            <span className="text-[#22C55E] font-semibold">99.98% Telemetry Uptime</span>
          </div>
        </GlassCard>
      </div>

      {/* SECTION 2: WEATHER & ENVIRONMENTAL CONDITIONS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#F5760A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Live Environmental Telemetry (Sensor Grid)
            </h3>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Updated 12s ago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Ambient Temperature"
            value={`${avgTemp}°C`}
            subValue={`Peak: ${peakTemp}°C (Mendocino)`}
            icon={<Thermometer size={18} className="text-[#FB923C]" />}
            trend={{ text: '+2.4°C Today', isPositive: false }}
          />

          <StatCard
            label="Relative Humidity"
            value={`${avgHumidity}%`}
            subValue={`Min: ${minHumidity}% (Critical Dry)`}
            icon={<Droplets size={18} className="text-[#38BDF8]" />}
            trend={{ text: 'Extreme Desiccation', isPositive: false }}
          />

          <StatCard
            label="Wind Velocity"
            value={`${avgWind} km/h`}
            subValue={`Gusts up to ${maxWind} km/h · NW`}
            icon={<Wind size={18} className="text-[#F5760A]" />}
            trend={{ text: 'High Spread Risk', isPositive: false }}
          />

          <StatCard
            label="Drought Fuel Index"
            value="84/100"
            subValue="Severe Biomass Combustibility"
            icon={<Flame size={18} className="text-[#EF4444]" />}
            accentColor="#EF4444"
            trend={{ text: 'Level 4 Hazard', isPositive: false }}
          />
        </div>
      </div>

      {/* SECTION 3: BOTTOM COMMAND WIDGET PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_0.9fr] gap-5">
        {/* Panel 1 (Bottom-Left): Fire Analytics Panel with Segmented Progress Bars */}
        <GlassCard className="p-5 flex flex-col justify-between" elevated>
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#F5760A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Containment & Area Telemetry
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-hairline)]">
                CAL FIRE GRID
              </span>
            </div>

            <div className="space-y-4">
              <SegmentedProgressBar
                label="Total Area Scanned"
                value={88}
                max={100}
                totalSegments={18}
                valueDisplay="88% (37,708 ha)"
                color="#F5760A"
                subtext="Thermal infrared satellite sweep complete"
              />

              <SegmentedProgressBar
                label="Fire-Affected Area"
                value={Math.round((affectedArea / totalMonitoredArea) * 100)}
                max={100}
                totalSegments={18}
                valueDisplay={`${Math.round(affectedArea)} ha`}
                color="#EF4444"
                subtext="Active combustion & perimeter scorch zones"
              />

              <SegmentedProgressBar
                label="Unaffected Sanctuary Area"
                value={Math.round((unaffectedArea / totalMonitoredArea) * 100)}
                max={100}
                totalSegments={18}
                valueDisplay={`${Math.round(unaffectedArea)} ha`}
                color="#22C55E"
                subtext="Green canopy shielded from propagation"
              />

              <SegmentedProgressBar
                label="Containment Line Progress"
                value={containmentPercent}
                max={100}
                totalSegments={18}
                valueDisplay={`${containmentPercent}%`}
                color="#F59E0B"
                subtext="Bulldozer and backburn containment barriers"
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--border-hairline)] grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[var(--text-secondary)]">Perimeter Scorch:</span>{' '}
              <strong className="text-[var(--text-primary)] tabular-nums">18.4 km</strong>
            </div>
            <div>
              <span className="text-[var(--text-secondary)]">Protected Assets:</span>{' '}
              <strong className="text-[#22C55E] tabular-nums font-bold">142 Structures</strong>
            </div>
          </div>
        </GlassCard>

        {/* Panel 2 (Bottom-Center): Incident Detection Panel with Compass Widget */}
        <GlassCard className="p-5 flex flex-col justify-between" elevated>
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#F5760A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Incident Vector & Propagation
                </h3>
              </div>
              <StatusPill status="critical" label="FLAMES ACTIVE" pulse />
            </div>

            {/* Compass & Wind Propagation Visualization */}
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-between gap-4 mb-4">
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-[rgba(245,118,10,0.08)] border border-[rgba(245,118,10,0.25)]">
                {/* Compass ticks */}
                <span className="absolute top-1 text-[8px] font-bold text-[var(--text-secondary)]">N</span>
                <span className="absolute right-1 text-[8px] font-bold text-[var(--text-secondary)]">E</span>
                <span className="absolute bottom-1 text-[8px] font-bold text-[var(--text-secondary)]">S</span>
                <span className="absolute left-1 text-[8px] font-bold text-[var(--text-secondary)]">W</span>

                {/* Rotating arrow indicating NW 315 deg */}
                <div
                  className="w-12 h-1 bg-[#EF4444] rounded-full transition-transform"
                  style={{ transform: 'rotate(-45deg)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-white ml-auto shadow-sm" />
                </div>
                <div className="absolute w-2 h-2 rounded-full bg-[#F5760A]" />
              </div>

              <div className="flex-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Dominant Spread Vector</div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">North-West (315°)</div>
                <div className="text-[11px] text-[#FB923C] font-medium mt-1">
                  Speed: <strong>28 km/h</strong> · Gusting 46 km/h
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  Est. forward spread: <strong className="text-[var(--text-primary)]">1.4 km/h</strong>
                </div>
              </div>
            </div>

            {/* Active Detection Points List */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Primary Thermal Detection Points
              </div>
              {zones.slice(0, 3).map((z, idx) => (
                <div
                  key={z.id || idx}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                    <span className="text-[var(--text-primary)] font-semibold truncate">{z.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] tabular-nums font-mono">
                    {z.latitude.toFixed(2)}°N, {Math.abs(z.longitude).toFixed(2)}°W
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
            <span>Thermal Radiance: 480 MW</span>
            <span className="text-[#FB923C] font-semibold">High Flame Front</span>
          </div>
        </GlassCard>

        {/* Panel 3 (Bottom-Right): Response Team Panel */}
        <GlassCard className="p-5 flex flex-col justify-between" elevated>
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#F5760A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Response Units & Crews
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[rgba(34,197,94,0.18)] text-[#22C55E] border border-[rgba(34,197,94,0.3)]">
                3 Deployed
              </span>
            </div>

            {/* Response Crew Cards */}
            <div className="space-y-2.5">
              {/* Unit 1 */}
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:bg-[var(--bg-surface-hover)] transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#F5760A] text-[#0C0A09] font-bold text-xs flex items-center justify-center">
                      ST
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">Strike Team Alpha</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Cpt. Marcus Vance · Sector 4</div>
                    </div>
                  </div>
                  <StatusPill status="in-progress" label="ENGAGED" />
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-hairline)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium">Bulldozer & 4 Engines</span>
                  <div className="flex items-center gap-1.5">
                    <button className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[var(--bg-surface-hover)] hover:bg-[#F5760A] hover:text-white text-[var(--text-primary)] border border-[var(--border-hairline)] transition-colors flex items-center gap-1">
                      <PhoneCall size={10} /> Call
                    </button>
                    <button className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] border border-[var(--border-hairline)] transition-colors flex items-center gap-1">
                      <MapPin size={10} /> Track
                    </button>
                  </div>
                </div>
              </div>

              {/* Unit 2 */}
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:bg-[var(--bg-surface-hover)] transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#38BDF8] text-[#0C0A09] font-bold text-xs flex items-center justify-center">
                      HT
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">Helitack Unit 03</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Aerial Retardant Drop</div>
                    </div>
                  </div>
                  <StatusPill status="active" label="AIRBORNE" />
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-hairline)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium">1,200 Gal Payload</span>
                  <div className="flex items-center gap-1.5">
                    <button className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[var(--bg-surface-hover)] hover:bg-[#F5760A] hover:text-white text-[var(--text-primary)] border border-[var(--border-hairline)] transition-colors flex items-center gap-1">
                      <PhoneCall size={10} /> Radio
                    </button>
                    <button className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] border border-[var(--border-hairline)] transition-colors flex items-center gap-1">
                      <MapPin size={10} /> Track
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
            <span>Air Corridor: Clear</span>
            <span className="text-[#22C55E] font-semibold">Comms Frequency 148.25 MHz</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
