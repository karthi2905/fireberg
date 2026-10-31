import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { api } from '../lib/api';
import Skeleton from './Skeleton';

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Report {
  id: string;
  zoneId: string;
  areaHectares: number;
  estimatedDamage?: number;
  status: 'reported' | 'in-progress' | 'contained' | 'resolved';
  reportedBy?: string;
}

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingReport?: Report | null;
}

const statusTypes = ['reported', 'in-progress', 'contained', 'resolved'] as const;

export default function ReportForm({
  isOpen,
  onClose,
  onSubmit,
  editingReport,
}: ReportFormProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    zoneId: string;
    areaHectares: string;
    estimatedDamage: string;
    status: typeof statusTypes[number];
    reportedBy: string;
  }>({
    zoneId: '',
    areaHectares: '',
    estimatedDamage: '',
    status: 'reported',
    reportedBy: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadZones();
      if (editingReport) {
        setFormData({
          zoneId: editingReport.zoneId,
          areaHectares: editingReport.areaHectares.toString(),
          estimatedDamage: editingReport.estimatedDamage?.toString() || '',
          status: editingReport.status,
          reportedBy: editingReport.reportedBy || '',
        });
      } else {
        setFormData({
          zoneId: '',
          areaHectares: '',
          estimatedDamage: '',
          status: 'reported',
          reportedBy: '',
        });
      }
    }
  }, [isOpen, editingReport]);

  const loadZones = async () => {
    try {
      const data = await api.zones.list();
      setZones(data);
      if (data.length > 0 && !editingReport) {
        setFormData((prev) => ({ ...prev, zoneId: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to load zones:', error);
    } finally {
      setIsLoadingZones(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        zoneId: formData.zoneId,
        areaHectares: parseFloat(formData.areaHectares),
        estimatedDamage: formData.estimatedDamage ? parseFloat(formData.estimatedDamage) : undefined,
        status: formData.status,
        reportedBy: formData.reportedBy || undefined,
      };

      if (editingReport) {
        await api.reports.update(editingReport.id, payload);
      } else {
        await api.reports.create(payload);
      }

      onSubmit();
    } catch (error) {
      console.error('Failed to save report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl glass-panel-elevated p-6 shadow-glass-lg relative animate-in zoom-in-95 duration-150 border border-[var(--border-strong)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(245,118,10,0.18)] border border-[rgba(245,118,10,0.35)] text-[#F5760A] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingReport ? 'Edit Incident Report' : 'Log New Incident Report'}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Disaster Response Grid Field Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        {isLoadingZones ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 rounded-xl bg-[var(--bg-surface)]" />
            <Skeleton className="h-10 rounded-xl bg-[var(--bg-surface)]" />
            <Skeleton className="h-10 rounded-xl bg-[var(--bg-surface)]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Monitored Sector / Zone
              </label>
              <select
                value={formData.zoneId}
                onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F5760A]"
                required
              >
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id} className="bg-[var(--bg-canvas)] text-[var(--text-primary)]">
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Affected Area (Hectares)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.areaHectares}
                  onChange={(e) => setFormData({ ...formData, areaHectares: e.target.value })}
                  placeholder="e.g. 142.5"
                  className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Estimated Loss / Damage ($)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.estimatedDamage}
                  onChange={(e) => setFormData({ ...formData, estimatedDamage: e.target.value })}
                  placeholder="e.g. 250000"
                  className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Containment Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as typeof statusTypes[number],
                    })
                  }
                  className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F5760A]"
                  required
                >
                  {statusTypes.map((status) => (
                    <option key={status} value={status} className="bg-[var(--bg-canvas)] text-[var(--text-primary)]">
                      {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Filed By (Dispatcher / Unit)
                </label>
                <input
                  type="text"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  placeholder="e.g. Strike Team Alpha"
                  className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#F5760A] hover:bg-[#E06800] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingReport ? 'Update Report' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
