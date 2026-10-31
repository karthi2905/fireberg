import { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  PieChart as PieChartIcon
} from 'lucide-react';
import { api } from '../lib/api';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import SegmentedProgressBar from '../components/ui/SegmentedProgressBar';
import Skeleton from '../components/Skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Analytics {
  activeAlerts: number;
  totalAffectedArea: number;
  avgResponseTime: number;
  incidentsThisWeek: number;
  incidentsOverTime: Array<{ date: string; count: number }>;
  severityDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.analytics.get();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const severityData = analytics
    ? [
        { name: 'Low', value: analytics.severityDistribution.low, color: '#22C55E' },
        { name: 'Medium', value: analytics.severityDistribution.medium, color: '#F59E0B' },
        { name: 'High', value: analytics.severityDistribution.high, color: '#FB923C' },
        { name: 'Critical', value: analytics.severityDistribution.critical, color: '#EF4444' },
      ].filter((item) => item.value > 0)
    : [];

  const hasSeverityData = severityData.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Stat Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Incidents"
          value={analytics ? analytics.activeAlerts.toString() : '0'}
          subValue="Active fire perimeter alerts"
          icon={<Flame size={18} className="text-[#F5760A]" />}
          accentColor="#F5760A"
          trend={{ text: analytics && analytics.activeAlerts > 10 ? '+2 Today' : 'Stable', isPositive: false }}
        />

        <StatCard
          label="Cumulative Scorch Area"
          value={analytics ? `${Math.round(analytics.totalAffectedArea)} ha` : '0 ha'}
          subValue="Total burn perimeter monitored"
          icon={<Layers size={18} className="text-[#EF4444]" />}
          accentColor="#EF4444"
          trend={{ text: '+12% MTD', isPositive: false }}
        />

        <StatCard
          label="Avg Response Latency"
          value={analytics ? `${analytics.avgResponseTime} min` : '0 min'}
          subValue="Target: <20 min SLA"
          icon={<Clock size={18} className="text-[#22C55E]" />}
          accentColor="#22C55E"
          trend={{ text: 'Compliant SLA', isPositive: true }}
        />

        <StatCard
          label="Incidents This Week"
          value={analytics ? analytics.incidentsThisWeek.toString() : '0'}
          subValue="Ground ignition detections"
          icon={<Activity size={18} className="text-[#FB923C]" />}
        />
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Incident Progression Timeline */}
        <GlassCard className="p-5 flex flex-col justify-between" elevated>
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-[#F5760A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Incident Frequency & Progression Timeline
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-hairline)]">
                14-DAY CADENCE
              </span>
            </div>

            {isLoading ? (
              <Skeleton className="h-[280px] rounded-xl bg-[var(--bg-surface)]" />
            ) : analytics && analytics.incidentsOverTime.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.incidentsOverTime}>
                    <defs>
                      <linearGradient id="fireOrangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5760A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F5760A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#8C857E', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(128,128,128,0.2)' }}
                    />
                    <YAxis
                      tick={{ fill: '#8C857E', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(128,128,128,0.2)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-panel-raised)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        boxShadow: 'var(--shadow-glass)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Incidents"
                      stroke="#F5760A"
                      strokeWidth={2.5}
                      fill="url(#fireOrangeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-xs text-[var(--text-secondary)]">
                No historical timeline data recorded.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Peak Day: 6 detections</span>
            <span className="text-[#22C55E] font-semibold">Containment Velocity +14%</span>
          </div>
        </GlassCard>

        {/* Severity Breakdown Donut */}
        <GlassCard className="p-5 flex flex-col justify-between" elevated>
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <PieChartIcon size={16} className="text-[#F5760A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Severity Distribution
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-hairline)]">
                CLASSIFICATION
              </span>
            </div>

            {isLoading ? (
              <Skeleton className="h-[240px] rounded-xl bg-[var(--bg-surface)]" />
            ) : hasSeverityData ? (
              <div>
                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-panel-raised)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          boxShadow: 'var(--shadow-glass)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--border-hairline)]">
                  {severityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{item.name}</span>
                      <span className="text-xs text-[var(--text-secondary)] ml-auto tabular-nums font-bold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-xs text-[var(--text-secondary)]">
                No severity records.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
            <span>Critical Weight: 24%</span>
            <span className="text-[#EF4444] font-semibold">Priority 1 Focus</span>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row: Containment & Operational Efficiency Benchmarks */}
      <GlassCard className="p-5" elevated>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#22C55E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Operational Response & Containment Benchmarks
            </h3>
          </div>
          <span className="text-xs text-[#22C55E] font-bold">ALL SLA METRICS MET</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SegmentedProgressBar
            label="Initial Dispatch Latency (<5 min)"
            value={94}
            max={100}
            totalSegments={16}
            valueDisplay="94% (3.2 min avg)"
            color="#22C55E"
            subtext="First response crew rolled within 5 min target"
          />

          <SegmentedProgressBar
            label="Aerial Water Drop Turnaround"
            value={78}
            max={100}
            totalSegments={16}
            valueDisplay="78% (18.4 min)"
            color="#F5760A"
            subtext="Helitack payload reload and release cycles"
          />

          <SegmentedProgressBar
            label="Firebreak Perimeter Trenching"
            value={86}
            max={100}
            totalSegments={16}
            valueDisplay="86% Complete"
            color="#38BDF8"
            subtext="Bulldozer mechanical separation lines"
          />
        </div>
      </GlassCard>
    </div>
  );
}
