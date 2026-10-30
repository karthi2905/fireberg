import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../lib/api';
import { getSeverityColor } from '../lib/utils';
import Skeleton from '../components/Skeleton';
import StatusPill from '../components/ui/StatusPill';
import {
  Layers,
  Radio,
  FilePlus,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

function MapView({ zones }: { zones: Zone[] }) {
  const map = useMap();

  useEffect(() => {
    if (zones.length > 0) {
      const bounds = L.latLngBounds(
        zones.map((zone) => [zone.latitude, zone.longitude])
      );
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [zones, map]);

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeZone, setActiveZone] = useState<Zone | null>(null);

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

  const createCustomIcon = (riskLevel: string, isSelected: boolean) => {
    const color = getSeverityColor(riskLevel);
    const isCritical = riskLevel === 'critical';
    const isHigh = riskLevel === 'high';
    const baseSize = isCritical ? 16 : isHigh ? 14 : 11;
    const size = isSelected ? baseSize + 6 : baseSize;

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative; width: ${size * 2}px; height: ${size * 2}px; display: flex; align-items: center; justify-content: center;">
          ${
            isCritical || isSelected
              ? `<div style="position: absolute; inset: 0; border-radius: 50%; background-color: ${color}44; animation: marker-pulse 2s infinite ease-out;"></div>`
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
            box-shadow: 0 0 ${isSelected ? '16px' : '10px'} ${color};
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

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-120px)] rounded-2xl glass-panel relative overflow-hidden">
        <Skeleton className="absolute inset-0 bg-[rgba(255,255,255,0.03)]" />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] rounded-2xl glass-panel relative overflow-hidden flex">
      {/* Floating Header Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 max-w-[calc(100%-32px)]">
        {/* Title pill */}
        <div className="px-3.5 py-2 rounded-xl bg-[rgba(16,13,11,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] shadow-glass-sm flex items-center gap-2">
          <Layers size={16} className="text-[#F5760A]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">
            Tactical Map Grid
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[rgba(255,255,255,0.08)] text-[#A8A199] tabular-nums">
            {filteredZones.length}/{zones.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[rgba(16,13,11,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] shadow-glass-sm">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((filter) => {
            const count = filter === 'all' ? zones.length : zones.filter((z) => z.riskLevel === filter).length;
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#F5760A] text-white shadow-sm'
                    : 'text-[#A8A199] hover:text-[#F7F5F2]'
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-[9px] px-1 rounded-full tabular-nums ${
                    isActive ? 'bg-black/30 text-white' : 'bg-[rgba(255,255,255,0.08)] text-[#A8A199]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Left Telemetry */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(16,13,11,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] text-[#A8A199] text-xs">
        <Radio size={14} className="text-[#F5760A] animate-pulse" />
        <span>Live Sensor Telemetry · Coordinates WGS84</span>
      </div>

      {/* Selected Zone Inspector Overlay (Top-Right) */}
      {activeZone && (
        <div className="absolute top-4 right-4 z-[1000] w-80 rounded-2xl glass-panel-elevated p-4 animate-in fade-in slide-in-from-right-4 duration-150">
          <div className="flex items-start justify-between gap-2 pb-2 mb-3 border-b border-[rgba(255,255,255,0.08)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusPill status={activeZone.riskLevel} />
                <span className="text-[10px] text-[#A8A199]">Telemetry Online</span>
              </div>
              <h3 className="text-sm font-bold text-[#F7F5F2]">{activeZone.name}</h3>
            </div>
            <button
              onClick={() => setActiveZone(null)}
              className="p-1 rounded-lg text-[#A8A199] hover:text-[#F7F5F2] hover:bg-[rgba(255,255,255,0.08)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-[11px] text-[#A8A199] mb-3 tabular-nums font-mono">
            {activeZone.latitude.toFixed(4)}°N, {Math.abs(activeZone.longitude).toFixed(4)}°W
          </div>

          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-center mb-3">
            <div>
              <div className="text-[10px] uppercase text-[#A8A199]">Ambient</div>
              <div className="text-sm font-bold text-[#F7F5F2] tabular-nums mt-0.5">
                {activeZone.temperature ? `${activeZone.temperature.toFixed(0)}°C` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#A8A199]">Humidity</div>
              <div className="text-sm font-bold text-[#F7F5F2] tabular-nums mt-0.5">
                {activeZone.humidity ? `${activeZone.humidity.toFixed(0)}%` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#A8A199]">Velocity</div>
              <div className="text-sm font-bold text-[#F7F5F2] tabular-nums mt-0.5">
                {activeZone.windSpeed ? `${activeZone.windSpeed.toFixed(0)}k` : '—'}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/reports')}
            className="w-full py-2 px-3 rounded-xl bg-[#F5760A] hover:bg-[#E06800] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <FilePlus size={14} />
            <span>Generate Incident Report</span>
          </button>
        </div>
      )}

      {/* Leaflet Map with CartoDB Dark Matter */}
      <MapContainer
        center={[37.5, -119.5]}
        zoom={6}
        style={{ height: '100%', width: '100%', background: '#0C0A09' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapView zones={filteredZones} />
        {filteredZones.map((zone) => {
          const isSelected = activeZone?.id === zone.id;
          return (
            <Marker
              key={zone.id}
              position={[zone.latitude, zone.longitude]}
              icon={createCustomIcon(zone.riskLevel, isSelected)}
              eventHandlers={{
                click: () => setActiveZone(zone),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px] bg-[#140F0C] rounded-xl text-[#F7F5F2]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-[#F7F5F2] truncate">{zone.name}</h4>
                    <StatusPill status={zone.riskLevel} />
                  </div>
                  <div className="text-[10px] text-[#A8A199] mb-2 font-mono">
                    {zone.latitude.toFixed(4)}°N, {Math.abs(zone.longitude).toFixed(4)}°W
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#A8A199] pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    <span>Temp: {zone.temperature?.toFixed(0)}°C</span>
                    <span>Wind: {zone.windSpeed?.toFixed(0)} km/h</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
