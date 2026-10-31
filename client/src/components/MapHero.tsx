import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../lib/api';
import { getSeverityColor } from '../lib/utils';
import Skeleton from './Skeleton';
import StatusPill from './ui/StatusPill';
import { ShieldAlert, Radio } from 'lucide-react';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
}

interface MapHeroProps {
  onSelectZone?: (zone: Zone) => void;
  activeZonesCount?: number;
  totalAreaHectares?: number;
  avgResponseTimeMin?: number;
}

function MapView({ zones }: { zones: Zone[] }) {
  const map = useMap();

  useEffect(() => {
    if (zones.length > 0) {
      const bounds = L.latLngBounds(
        zones.map((zone) => [zone.latitude, zone.longitude])
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
    }
  }, [zones, map]);

  return null;
}

export default function MapHero({
  onSelectZone,
  activeZonesCount,
  totalAreaHectares = 42850,
  avgResponseTimeMin = 14,
}: MapHeroProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

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

  const createCustomIcon = (riskLevel: string) => {
    const color = getSeverityColor(riskLevel);
    const isCritical = riskLevel === 'critical';
    const isHigh = riskLevel === 'high';
    const size = isCritical ? 16 : isHigh ? 14 : 11;

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative; width: ${size * 2}px; height: ${size * 2}px; display: flex; align-items: center; justify-content: center;">
          ${
            isCritical
              ? `<div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(239, 68, 68, 0.4); animation: marker-pulse 2s infinite ease-out;"></div>`
              : ''
          }
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 12px ${color};
          "></div>
        </div>
      `,
      iconSize: [size * 2, size * 2],
      iconAnchor: [size, size],
      popupAnchor: [0, -size],
    });
  };

  const filteredZones = zones.filter((z) => {
    if (selectedFilter === 'all') return true;
    return z.riskLevel === selectedFilter;
  });

  const criticalCount = zones.filter((z) => z.riskLevel === 'critical').length;

  if (isLoading) {
    return (
      <div className="w-full relative rounded-2xl overflow-hidden glass-panel h-[480px] lg:h-[560px]">
        <Skeleton className="absolute inset-0 bg-[var(--bg-surface)]" />
      </div>
    );
  }

  return (
    <div className="w-full relative rounded-2xl overflow-hidden glass-panel h-[480px] lg:h-[560px] group">
      {/* 1. Floating Stat Cards (Overlaid Top-Left) */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-2.5 max-w-[calc(100%-32px)] pointer-events-none">
        {/* Card 1: Active Zones */}
        <div className="pointer-events-auto px-3.5 py-2.5 rounded-xl bg-[var(--bg-panel-raised)] backdrop-blur-md border border-[var(--border-hairline)] shadow-glass-sm min-w-[130px]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Active Zones
          </div>
          <div className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums leading-tight mt-0.5">
            {activeZonesCount ?? zones.length}
            <span className="text-[11px] font-medium text-[#22C55E] ml-1.5">● Nominal</span>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1 pt-1 border-t border-[var(--border-hairline)]">
            Coverage: 98.4%
          </div>
        </div>

        {/* Card 2: Monitored Area */}
        <div className="pointer-events-auto px-3.5 py-2.5 rounded-xl bg-[var(--bg-panel-raised)] backdrop-blur-md border border-[var(--border-hairline)] shadow-glass-sm min-w-[140px]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Monitored Area
          </div>
          <div className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums leading-tight mt-0.5">
            {totalAreaHectares.toLocaleString()} <span className="text-xs font-normal text-[var(--text-secondary)]">ha</span>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1 pt-1 border-t border-[var(--border-hairline)]">
            Sensor nodes: {zones.length * 8} active
          </div>
        </div>

        {/* Card 3: Avg Response */}
        <div className="pointer-events-auto px-3.5 py-2.5 rounded-xl bg-[var(--bg-panel-raised)] backdrop-blur-md border border-[var(--border-hairline)] shadow-glass-sm min-w-[130px] hidden sm:block">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Avg. Response
          </div>
          <div className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums leading-tight mt-0.5">
            {avgResponseTimeMin} <span className="text-xs font-normal text-[var(--text-secondary)]">min</span>
          </div>
          <div className="text-[10px] text-[#22C55E] mt-1 pt-1 border-t border-[var(--border-hairline)]">
            SLA Target: &lt;20 min
          </div>
        </div>

        {/* Warning chip if critical zones detected */}
        {criticalCount > 0 && (
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(239,68,68,0.18)] backdrop-blur-md border border-[rgba(239,68,68,0.4)] text-[#EF4444] shadow-glass-sm animate-pulse">
            <ShieldAlert size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {criticalCount} Critical Incident{criticalCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* 2. Top-Right Quick Filter Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-1 p-1 rounded-full bg-[var(--bg-panel-raised)] backdrop-blur-md border border-[var(--border-hairline)] shadow-glass-sm">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                isActive
                  ? 'bg-[#F5760A] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* 3. Bottom-Left Live Telemetry Badge */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-panel-raised)] backdrop-blur-md border border-[var(--border-hairline)] text-[var(--text-secondary)] text-[11px] shadow-glass-sm">
        <Radio size={13} className="text-[#F5760A] animate-pulse" />
        <span>Satellite Feed: Live (NASA FIRMS & Ground Sensors)</span>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[37.8, -120.0]}
        zoom={6}
        style={{ height: '100%', width: '100%', background: 'var(--bg-canvas)' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapView zones={filteredZones} />
        {filteredZones.map((zone) => (
          <Marker
            key={zone.id}
            position={[zone.latitude, zone.longitude]}
            icon={createCustomIcon(zone.riskLevel)}
            eventHandlers={{
              click: () => onSelectZone?.(zone),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-3 min-w-[210px] bg-[var(--bg-panel-raised)] rounded-xl text-[var(--text-primary)]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-[13px] font-bold text-[var(--text-primary)] truncate">{zone.name}</h4>
                  <StatusPill status={zone.riskLevel} />
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mb-3 tabular-nums font-mono">
                  {zone.latitude.toFixed(4)}°N, {Math.abs(zone.longitude).toFixed(4)}°W
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-center">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Temp</div>
                    <div className="text-[12px] font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                      {zone.temperature ? `${zone.temperature.toFixed(0)}°C` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Humid</div>
                    <div className="text-[12px] font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                      {zone.humidity ? `${zone.humidity.toFixed(0)}%` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Wind</div>
                    <div className="text-[12px] font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                      {zone.windSpeed ? `${zone.windSpeed.toFixed(0)}k` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
