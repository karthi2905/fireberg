import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculateRiskLevel } from '../services/riskService';
import { syncFirmsData } from '../services/firmsService';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      include: {
        alerts: {
          where: { resolved: false },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(zones);
  } catch (error) {
    console.error('Error listing zones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      riskLevel,
      temperature,
      humidity,
      windSpeed,
      tempThreshold = 35.0,
      humidityThreshold = 20.0,
      windThreshold = 25.0,
    } = req.body;

    const computedRisk =
      riskLevel ||
      calculateRiskLevel({
        temperature,
        humidity,
        windSpeed,
        tempThreshold,
        humidityThreshold,
        windThreshold,
      });

    const zone = await prisma.zone.create({
      data: {
        name,
        latitude,
        longitude,
        riskLevel: computedRisk,
        temperature,
        humidity,
        windSpeed,
        tempThreshold,
        humidityThreshold,
        windThreshold,
      },
    });

    // Auto-generate alert if high or critical hazard
    if (computedRisk === 'high' || computedRisk === 'critical') {
      await prisma.alert.create({
        data: {
          zoneId: zone.id,
          severity: computedRisk,
          temperature,
          humidity,
          windSpeed,
          status: 'active',
        },
      });
    }

    res.json(zone);
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      riskLevel,
      temperature,
      humidity,
      windSpeed,
      tempThreshold,
      humidityThreshold,
      windThreshold,
      isActive,
    } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const computedRisk =
      riskLevel ||
      calculateRiskLevel({
        temperature,
        humidity,
        windSpeed,
        tempThreshold,
        humidityThreshold,
        windThreshold,
      });

    const zone = await prisma.zone.update({
      where: { id },
      data: {
        name,
        latitude,
        longitude,
        riskLevel: computedRisk,
        temperature,
        humidity,
        windSpeed,
        tempThreshold,
        humidityThreshold,
        windThreshold,
        isActive,
      },
    });

    // Auto-generate alert if high or critical hazard and no active alert exists
    if (computedRisk === 'high' || computedRisk === 'critical') {
      const existingAlert = await prisma.alert.findFirst({
        where: { zoneId: zone.id, resolved: false },
      });
      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            zoneId: zone.id,
            severity: computedRisk,
            temperature,
            humidity,
            windSpeed,
            status: 'active',
          },
        });
      }
    }

    res.json(zone);
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await prisma.zone.delete({
      where: { id },
    });

    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/zones/sync-firms - Trigger satellite telemetry / NASA FIRMS sweep
router.post('/sync-firms', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { apiKey } = req.body || {};
    const result = await syncFirmsData(apiKey);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error syncing NASA FIRMS telemetry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
