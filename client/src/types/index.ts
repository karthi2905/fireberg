export interface Zone {
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
  alerts?: Alert[];
}

export interface Alert {
  id: string;
  zoneId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
  zone?: Zone;
}

export interface Report {
  id: string;
  zoneId: string;
  areaHectares: number;
  estimatedDamage?: number;
  status: 'reported' | 'in-progress' | 'contained' | 'resolved';
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
  zone?: Zone;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Analytics {
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
