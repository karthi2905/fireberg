import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sortAlertsBySeverity, evaluateAndGenerateAlerts } from '../services/riskService';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/alerts - List alerts sorted by severity (highest priority first)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, severity } = req.query;

    const where: any = {};

    if (status === 'active') {
      where.resolved = false;
      where.acknowledged = false;
    } else if (status === 'acknowledged') {
      where.acknowledged = true;
      where.resolved = false;
    } else if (status === 'resolved') {
      where.resolved = true;
    } else if (status === 'all') {
      // Return everything
    } else {
      // Default: show all unresolved incidents (both new active and acknowledged in-triage)
      where.resolved = false;
    }

    if (severity && severity !== 'all') {
      where.severity = severity;
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        zone: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Sort by severity (critical -> high -> medium -> low), then newest first
    const sortedAlerts = sortAlertsBySeverity(alerts);

    res.json(sortedAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/alerts/summary - Quick statistics for dashboard & alerts view
router.get('/summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [totalActive, criticalCount, highCount, mediumCount, lowCount, resolvedCount] = await Promise.all([
      prisma.alert.count({ where: { resolved: false } }),
      prisma.alert.count({ where: { severity: 'critical', resolved: false } }),
      prisma.alert.count({ where: { severity: 'high', resolved: false } }),
      prisma.alert.count({ where: { severity: 'medium', resolved: false } }),
      prisma.alert.count({ where: { severity: 'low', resolved: false } }),
      prisma.alert.count({ where: { resolved: true } }),
    ]);

    res.json({
      totalActive,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      resolvedCount,
    });
  } catch (error) {
    console.error('Error fetching alert summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/alerts/generate - Scan zones and generate alerts for thresholds crossed
router.post('/generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const generatedAlerts = await evaluateAndGenerateAlerts();
    res.json({
      message: `Alert scan complete. ${generatedAlerts.length} new alert(s) generated.`,
      generated: generatedAlerts,
    });
  } catch (error) {
    console.error('Error generating alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/alerts/:id/acknowledge - Mark alert as acknowledged
router.post('/:id/acknowledge', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        status: 'acknowledged',
      },
      include: {
        zone: true,
      },
    });

    res.json(alert);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/alerts/:id/resolve - Mark alert as resolved
router.post('/:id/resolve', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        resolved: true,
        resolvedAt: new Date(),
        status: 'resolved',
      },
      include: {
        zone: true,
      },
    });

    res.json(alert);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/alerts/:id - Delete an alert
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await prisma.alert.delete({
      where: { id },
    });

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
