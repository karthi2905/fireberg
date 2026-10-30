import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export interface ZoneTelemetry {
  temperature?: number | null;
  humidity?: number | null;
  windSpeed?: number | null;
  tempThreshold?: number | null;
  humidityThreshold?: number | null;
  windThreshold?: number | null;
}

/**
 * Rule-based risk scoring and severity classification
 * Section 4.1.2: Compares current values of a zone with its thresholds and assigns a severity category.
 */
export function calculateRiskLevel(telemetry: ZoneTelemetry): SeverityLevel {
  const temp = telemetry.temperature ?? 25;
  const humidity = telemetry.humidity ?? 40;
  const wind = telemetry.windSpeed ?? 15;

  const tempThreshold = telemetry.tempThreshold ?? 35.0;
  const humidityThreshold = telemetry.humidityThreshold ?? 20.0;
  const windThreshold = telemetry.windThreshold ?? 25.0;

  const tempExceeded = temp >= tempThreshold;
  const humidityExceeded = humidity <= humidityThreshold;
  const windExceeded = wind >= windThreshold;

  // Extreme conditions: very high heat or triple threshold crossing
  if (temp >= tempThreshold + 5 || (tempExceeded && humidityExceeded && windExceeded)) {
    return 'critical';
  }

  // Double threshold crossing or severe single threshold
  if ((tempExceeded && humidityExceeded) || (tempExceeded && windExceeded) || temp >= tempThreshold || humidity <= 15) {
    return 'high';
  }

  // Moderate elevated risk
  if (temp >= 28 || humidity <= 35 || wind >= 18) {
    return 'medium';
  }

  return 'low';
}

/**
 * Scan all active zones against their configured risk thresholds
 * and generate alerts for high/critical risks that are not yet active.
 */
export async function evaluateAndGenerateAlerts() {
  const zones = await prisma.zone.findMany({
    where: { isActive: true },
  });

  const generatedAlerts = [];

  for (const zone of zones) {
    const computedSeverity = calculateRiskLevel({
      temperature: zone.temperature,
      humidity: zone.humidity,
      windSpeed: zone.windSpeed,
      tempThreshold: zone.tempThreshold,
      humidityThreshold: zone.humidityThreshold,
      windThreshold: zone.windThreshold,
    });

    // Update zone risk level if it changed
    if (zone.riskLevel !== computedSeverity) {
      await prisma.zone.update({
        where: { id: zone.id },
        data: { riskLevel: computedSeverity },
      });
    }

    // Only generate alerts for high or critical hazards
    if (computedSeverity === 'high' || computedSeverity === 'critical') {
      // Check if an unresolved alert already exists for this zone
      const existingAlert = await prisma.alert.findFirst({
        where: {
          zoneId: zone.id,
          resolved: false,
        },
      });

      if (!existingAlert) {
        const newAlert = await prisma.alert.create({
          data: {
            zoneId: zone.id,
            severity: computedSeverity,
            temperature: zone.temperature,
            humidity: zone.humidity,
            windSpeed: zone.windSpeed,
            acknowledged: false,
            resolved: false,
            status: 'active',
          },
          include: {
            zone: true,
          },
        });
        generatedAlerts.push(newAlert);
      }
    }
  }

  return generatedAlerts;
}

/**
 * Sort alerts in memory by severity (Critical > High > Medium > Low), then by createdAt desc
 */
export function sortAlertsBySeverity<T extends { severity: string; createdAt: Date | string }>(alerts: T[]): T[] {
  return [...alerts].sort((a, b) => {
    const weightA = SEVERITY_WEIGHT[a.severity] || 0;
    const weightB = SEVERITY_WEIGHT[b.severity] || 0;
    if (weightB !== weightA) {
      return weightB - weightA; // higher severity first
    }
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA; // newest first
  });
}
