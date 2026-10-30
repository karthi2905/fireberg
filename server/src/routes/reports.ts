import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    const reports = await prisma.report.findMany({
      where,
      include: {
        zone: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { zoneId, areaHectares, estimatedDamage, status, reportedBy } = req.body;
    
    const report = await prisma.report.create({
      data: {
        zoneId,
        areaHectares,
        estimatedDamage,
        status,
        reportedBy
      },
      include: {
        zone: true
      }
    });
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { areaHectares, estimatedDamage, status } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    const report = await prisma.report.update({
      where: { id },
      data: {
        areaHectares,
        estimatedDamage,
        status
      },
      include: {
        zone: true
      }
    });
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await prisma.report.delete({
      where: { id },
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
