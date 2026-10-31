import { useState, useEffect } from 'react';
import { X, MapPin, Sliders } from 'lucide-react';
import { api } from '../lib/api';

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  tempThreshold?: number;
  humidityThreshold?: number;
  windThreshold?: number;
  isActive: boolean;
}

interface ZoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingZone?: Zone | null;
}

const riskLevels = ['low', 'medium', 'high', 'critical'] as const;

export default function ZoneForm({
  isOpen,
  onClose,
  onSubmit,
  editingZone,
}: ZoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    latitude: string;
    longitude: string;
    riskLevel: typeof riskLevels[number];
    temperature: string;
    humidity: string;
    windSpeed: string;
    tempThreshold: string;
    humidityThreshold: string;
    windThreshold: string;
    isActive: boolean;
  }>({
    name: '',
    latitude: '',
    longitude: '',
    riskLevel: 'low',
    temperature: '',
    humidity: '',
    windSpeed: '',
    tempThreshold: '35.0',
    humidityThreshold: '20.0',
    windThreshold: '25.0',
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (editingZone) {
        setFormData({
          name: editingZone.name,
          latitude: editingZone.latitude.toString(),
          longitude: editingZone.longitude.toString(),
          riskLevel: editingZone.riskLevel,
          temperature: editingZone.temperature?.toString() || '',
          humidity: editingZone.humidity?.toString() || '',
          windSpeed: editingZone.windSpeed?.toString() || '',
          tempThreshold: editingZone.tempThreshold?.toString() || '35.0',
          humidityThreshold: editingZone.humidityThreshold?.toString() || '20.0',
          windThreshold: editingZone.windThreshold?.toString() || '25.0',
          isActive: editingZone.isActive,
        });
      } else {
        setFormData({
          name: '',
          latitude: '',
          longitude: '',
          riskLevel: 'low',
          temperature: '',
          humidity: '',
          windSpeed: '',
          tempThreshold: '35.0',
          humidityThreshold: '20.0',
          windThreshold: '25.0',
          isActive: true,
        });
      }
    }
  }, [isOpen, editingZone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        riskLevel: formData.riskLevel,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        humidity: formData.humidity ? parseFloat(formData.humidity) : undefined,
        windSpeed: formData.windSpeed ? parseFloat(formData.windSpeed) : undefined,
        tempThreshold: formData.tempThreshold ? parseFloat(formData.tempThreshold) : 35.0,
        humidityThreshold: formData.humidityThreshold ? parseFloat(formData.humidityThreshold) : 20.0,
        windThreshold: formData.windThreshold ? parseFloat(formData.windThreshold) : 25.0,
        isActive: formData.isActive,
      };

      if (editingZone) {
        await api.zones.update(editingZone.id, payload);
      } else {
        await api.zones.create(payload);
      }

      onSubmit();
    } catch (error) {
      console.error('Failed to save zone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl glass-panel-elevated p-6 shadow-glass-lg relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto border border-[var(--border-strong)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(245,118,10,0.18)] border border-[rgba(245,118,10,0.35)] text-[#F5760A] flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingZone ? 'Edit Sector & Thresholds' : 'Register Monitored Sector'}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Ground Telemetry Sensor Station & Risk Threshold Tuning
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Sector / Forest Zone Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sierra National Forest - Sector 4"
              className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="37.8651"
                className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Longitude (°W)
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-119.5383"
                className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Assigned Risk Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {riskLevels.map((lvl) => {
                const isSelected = formData.riskLevel === lvl;
                const color =
                  lvl === 'critical'
                    ? '#EF4444'
                    : lvl === 'high'
                    ? '#FB923C'
                    : lvl === 'medium'
                    ? '#F59E0B'
                    : '#22C55E';
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, riskLevel: lvl })}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-2 text-[var(--text-primary)] shadow-sm'
                        : 'bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: color,
                            backgroundColor: `${color}25`,
                          }
                        : undefined
                    }
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px]">{lvl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Telemetry */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Current Environmental Telemetry
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="32.0"
                  className="w-full h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Humidity (%)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                  placeholder="20"
                  className="w-full h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Wind (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.windSpeed}
                  onChange={(e) => setFormData({ ...formData, windSpeed: e.target.value })}
                  placeholder="25.0"
                  className="w-full h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>
            </div>
          </div>

          {/* Section: Configurable Risk Thresholds */}
          <div className="p-3.5 rounded-xl bg-[rgba(245,118,10,0.06)] border border-[rgba(245,118,10,0.2)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5760A] mb-2 uppercase tracking-wider">
              <Sliders size={13} />
              <span>Risk Alert Thresholds (Division Tuning)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Temp Trigger (&ge;°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.tempThreshold}
                  onChange={(e) => setFormData({ ...formData, tempThreshold: e.target.value })}
                  placeholder="35.0"
                  className="w-full h-8 rounded-lg bg-[var(--bg-panel-raised)] border border-[var(--border-hairline)] px-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Humidity Trigger (&le;%)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.humidityThreshold}
                  onChange={(e) => setFormData({ ...formData, humidityThreshold: e.target.value })}
                  placeholder="20"
                  className="w-full h-8 rounded-lg bg-[var(--bg-panel-raised)] border border-[var(--border-hairline)] px-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Wind Trigger (&ge;km/h)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.windThreshold}
                  onChange={(e) => setFormData({ ...formData, windThreshold: e.target.value })}
                  placeholder="25"
                  className="w-full h-8 rounded-lg bg-[var(--bg-panel-raised)] border border-[var(--border-hairline)] px-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#F5760A]"
                />
              </div>
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
              {isSubmitting ? 'Saving...' : editingZone ? 'Update Sector' : 'Register Sector'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
