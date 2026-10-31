import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Thermometer,
  Droplets,
  Wind,
  ShieldAlert,
  Radio,
  Search,
  Grid,
  List,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import StatusPill from '../components/ui/StatusPill';
import Skeleton from '../components/Skeleton';
import ZoneForm from '../components/ZoneForm';

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Zones() {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const data = await api.zones.list();
      setZones(data);
    } catch (error) {
      console.error('Failed to load zones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    setEditingZone(null);
    await loadZones();
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setIsFormOpen(true);
  };

  const handleDelete = async (zoneId: string) => {
    if (!confirm('Are you sure you want to remove this monitored sector?')) return;

    try {
      await api.zones.delete(zoneId);
      setZones(zones.filter((z) => z.id !== zoneId));
    } catch (error) {
      console.error('Failed to delete zone:', error);
    }
  };

  const criticalCount = zones.filter((z) => z.riskLevel === 'critical').length;
  const highCount = zones.filter((z) => z.riskLevel === 'high').length;
  const nominalCount = zones.filter((z) => z.riskLevel === 'low' || z.riskLevel === 'medium').length;

  const filteredZones = zones.filter((z) => {
    const matchesRisk = selectedRisk === 'all' || z.riskLevel === selectedRisk;
    const matchesSearch = !searchQuery || z.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Monitored Sectors"
          value={zones.length}
          subValue="Active ground telemetry"
          icon={<MapPin size={18} className="text-[#F5760A]" />}
          accentColor="#F5760A"
        />

        <StatCard
          label="Critical Hazard Zones"
          value={criticalCount}
          subValue="Active suppression protocol"
          icon={<ShieldAlert size={18} className="text-[#EF4444]" />}
          accentColor="#EF4444"
          trend={{ text: `${criticalCount} Critical`, isPositive: false }}
        />

        <StatCard
          label="Elevated Risk Sectors"
          value={highCount}
          subValue="Pre-ignition hazard warnings"
          icon={<Radio size={18} className="text-[#FB923C]" />}
          accentColor="#FB923C"
        />

        <StatCard
          label="Nominal / Guarded"
          value={nominalCount}
          subValue="Sensors within thresholds"
          icon={<CheckCircle2 size={18} className="text-[#22C55E]" />}
          accentColor="#22C55E"
        />
      </div>

      {/* Main Glass Panel */}
      <GlassCard className="p-5" elevated>
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--border-hairline)]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Risk filter tabs */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-x-auto">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((risk) => {
                const isActive = selectedRisk === risk;
                return (
                  <button
                    key={risk}
                    onClick={() => setSelectedRisk(risk)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F5760A] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {risk}
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
                placeholder="Search sector name..."
                className="w-full h-8 pl-8 pr-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F5760A]"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-[#F5760A] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Grid view"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'table' ? 'bg-[#F5760A] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Table view"
              >
                <List size={14} />
              </button>
            </div>

            {/* Add Zone Action */}
            <button
              onClick={() => {
                setEditingZone(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#F5760A] hover:bg-[#E06800] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm flex-shrink-0"
            >
              <Plus size={15} />
              <span>Register Sector</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-44 rounded-2xl bg-[var(--bg-surface)]" />
            <Skeleton className="h-44 rounded-2xl bg-[var(--bg-surface)]" />
            <Skeleton className="h-44 rounded-2xl bg-[var(--bg-surface)]" />
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-secondary)]">
            <MapPin size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm font-semibold text-[var(--text-primary)]">No Monitored Sectors</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              No zones found matching the selected filter criteria.
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View of Frosted Glass Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{zone.name}</h3>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">
                        {zone.latitude.toFixed(4)}°N, {Math.abs(zone.longitude).toFixed(4)}°W
                      </div>
                    </div>
                    <StatusPill status={zone.riskLevel} pulse={zone.riskLevel === 'critical'} />
                  </div>

                  {/* Sensor telemetry readings */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[var(--bg-panel-raised)] border border-[var(--border-hairline)] text-center my-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Temp</div>
                      <div className="text-xs font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                        {zone.temperature !== undefined ? `${zone.temperature.toFixed(1)}°C` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Humidity</div>
                      <div className="text-xs font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                        {zone.humidity !== undefined ? `${zone.humidity.toFixed(0)}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Wind</div>
                      <div className="text-xs font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                        {zone.windSpeed !== undefined ? `${zone.windSpeed.toFixed(0)} km/h` : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-hairline)] text-xs">
                  <button
                    onClick={() => navigate('/map')}
                    className="text-[11px] font-semibold text-[#F5760A] hover:underline flex items-center gap-1"
                  >
                    <MapPin size={12} />
                    <span>View on Map</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] transition-colors"
                      title="Edit sector"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] transition-colors"
                      title="Delete sector"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-xl border border-[var(--border-hairline)]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#F5760A]" />
                      <span>Sector Name</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    Coordinates
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Radio size={13} className="text-[#FB923C]" />
                      <span>Risk Level</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Thermometer size={13} className="text-[#FB923C]" />
                      <span>Temperature</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Droplets size={13} className="text-[#38BDF8]" />
                      <span>Humidity</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Wind size={13} className="text-[var(--text-secondary)]" />
                      <span>Wind</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[11px] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredZones.map((zone) => (
                  <tr
                    key={zone.id}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-[var(--text-primary)]">{zone.name}</td>
                    <td className="px-4 py-3 font-mono text-[var(--text-secondary)] tabular-nums">
                      {zone.latitude.toFixed(4)}°N, {Math.abs(zone.longitude).toFixed(4)}°W
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={zone.riskLevel} />
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-[var(--text-primary)]">
                      {zone.temperature !== undefined ? `${zone.temperature.toFixed(1)}°C` : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">
                      {zone.humidity !== undefined ? `${zone.humidity.toFixed(0)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">
                      {zone.windSpeed !== undefined ? `${zone.windSpeed.toFixed(0)} km/h` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(zone)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)]"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)]"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Slide-over / Modal Zone Form */}
      {isFormOpen && (
        <ZoneForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingZone(null);
          }}
          onSubmit={handleFormSubmit}
          editingZone={editingZone}
        />
      )}
    </div>
  );
}
