import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  MapPin,
  Flame,
  DollarSign,
  Activity,
  Calendar,
  User,
  Search,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react';
import { api } from '../lib/api';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import StatusPill from '../components/ui/StatusPill';
import Skeleton from '../components/Skeleton';
import ReportForm from '../components/ReportForm';

interface Report {
  id: string;
  zoneId: string;
  areaHectares: number;
  estimatedDamage?: number;
  status: 'reported' | 'in-progress' | 'contained' | 'resolved';
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
  zone?: {
    id: string;
    name: string;
  };
}

const statusTypes = ['reported', 'in-progress', 'contained', 'resolved'] as const;

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const loadReports = async () => {
    try {
      const data = await api.reports.list(
        selectedStatus === 'all' ? undefined : selectedStatus
      );
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    setEditingReport(null);
    await loadReports();
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setIsFormOpen(true);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to remove this incident report?')) return;
    try {
      await api.reports.delete(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.zone?.name && r.zone.name.toLowerCase().includes(q)) ||
      (r.reportedBy && r.reportedBy.toLowerCase().includes(q)) ||
      r.status.toLowerCase().includes(q)
    );
  });

  const totalArea = reports.reduce((acc, r) => acc + (r.areaHectares || 0), 0);
  const totalDamage = reports.reduce((acc, r) => acc + (r.estimatedDamage || 0), 0);
  const inProgressCount = reports.filter((r) => r.status === 'in-progress').length;
  const containedCount = reports.filter((r) => r.status === 'contained' || r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Stat Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Incident Reports"
          value={reports.length}
          subValue="Verified field filings"
          icon={<FileText size={18} className="text-[#F5760A]" />}
          accentColor="#F5760A"
        />

        <StatCard
          label="Active Fire Fronts"
          value={inProgressCount}
          subValue="Suppression active"
          icon={<Flame size={18} className="text-[#EF4444]" />}
          accentColor="#EF4444"
          trend={{ text: `${inProgressCount} In Progress`, isPositive: false }}
        />

        <StatCard
          label="Contained / Resolved"
          value={containedCount}
          subValue="Perimeter secure"
          icon={<CheckCircle2 size={18} className="text-[#22C55E]" />}
          accentColor="#22C55E"
        />

        <StatCard
          label="Cumulative Scorch"
          value={`${Math.round(totalArea).toLocaleString()} ha`}
          subValue={`Est. Loss: $${(totalDamage / 1000000).toFixed(1)}M`}
          icon={<DollarSign size={18} className="text-[#FB923C]" />}
        />
      </div>

      {/* Reports Table Panel */}
      <GlassCard className="p-5" elevated>
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--border-hairline)]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills Filter */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-x-auto">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                  selectedStatus === 'all'
                    ? 'bg-[#F5760A] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All
              </button>
              {statusTypes.map((status) => {
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F5760A] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {status === 'in-progress' ? 'In Progress' : status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Search input */}
            <div className="relative flex-1 md:w-60">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sector or crew..."
                className="w-full h-8 pl-8 pr-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
              />
            </div>

            {/* New Report Action */}
            <button
              onClick={() => {
                setEditingReport(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#F5760A] hover:bg-[#E06800] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm flex-shrink-0"
            >
              <Plus size={15} />
              <span>Log Incident</span>
            </button>
          </div>
        </div>

        {/* Frosted Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-hairline)]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 rounded-lg bg-[var(--bg-surface)]" />
              <Skeleton className="h-12 rounded-lg bg-[var(--bg-surface)]" />
              <Skeleton className="h-12 rounded-lg bg-[var(--bg-surface)]" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-secondary)]">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <div className="text-sm font-semibold text-[var(--text-primary)]">No Incident Reports</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                No matching filed reports found for this query filter.
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#F5760A]" />
                      <span>Sector / Zone</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Flame size={13} className="text-[#EF4444]" />
                      <span>Affected Area</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-[#22C55E]" />
                      <span>Est. Damage</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Activity size={13} className="text-[#38BDF8]" />
                      <span>Current Status</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[var(--text-secondary)]" />
                      <span>Reported Date</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-[var(--text-secondary)]" />
                      <span>Filed By</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors group"
                  >
                    <td className="px-4 py-3 font-bold text-[var(--text-primary)]">
                      {report.zone?.name || 'Monitored Sector'}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-[var(--text-primary)]">
                      {report.areaHectares.toFixed(1)} <span className="text-[var(--text-secondary)] font-normal">ha</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)] font-medium">
                      {report.estimatedDamage
                        ? `$${report.estimatedDamage.toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={report.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] tabular-nums">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {report.reportedBy || 'CAL FIRE Unit'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(report)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] transition-all flex items-center gap-1"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] transition-all"
                          title="Delete report"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Modal Form */}
      {isFormOpen && (
        <ReportForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingReport(null);
          }}
          onSubmit={handleFormSubmit}
          editingReport={editingReport}
        />
      )}
    </div>
  );
}
