import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
const statusTypes = ['reported', 'in-progress', 'contained', 'resolved'] as const;

// California fire zones (realistic coordinates)
const fireZones = [
  { name: 'Mendocino National Forest', lat: 39.5, lng: -122.8 },
  { name: 'Shasta-Trinity National Forest', lat: 40.8, lng: -122.5 },
  { name: 'Lassen National Forest', lat: 40.2, lng: -121.3 },
  { name: 'Plumas National Forest', lat: 39.8, lng: -120.8 },
  { name: 'Tahoe National Forest', lat: 39.3, lng: -120.6 },
  { name: 'Eldorado National Forest', lat: 38.7, lng: -120.3 },
  { name: 'Stanislaus National Forest', lat: 38.0, lng: -119.8 },
  { name: 'Sierra National Forest', lat: 37.3, lng: -119.2 },
  { name: 'Sequoia National Forest', lat: 36.5, lng: -118.8 },
  { name: 'Inyo National Forest', lat: 37.2, lng: -118.5 },
  { name: 'Angeles National Forest', lat: 34.3, lng: -118.0 },
  { name: 'San Bernardino National Forest', lat: 34.2, lng: -116.8 },
  { name: 'Cleveland National Forest', lat: 33.0, lng: -116.5 },
  { name: 'Los Padres National Forest', lat: 34.8, lng: -119.5 },
  { name: 'Klamath National Forest', lat: 41.8, lng: -123.2 },
  { name: 'Six Rivers National Forest', lat: 41.5, lng: -123.8 },
  { name: 'Humboldt-Toiyabe National Forest', lat: 38.5, lng: -117.5 },
  { name: 'Lake Tahoe Basin', lat: 39.0, lng: -120.0 },
  { name: 'Point Reyes National Seashore', lat: 38.0, lng: -122.9 },
  { name: 'Redwood National Park', lat: 41.3, lng: -124.0 },
  { name: 'Yosemite National Forest', lat: 37.8, lng: -119.5 },
  { name: 'Death Valley Region', lat: 36.5, lng: -117.0 },
  { name: 'Joshua Tree Area', lat: 34.0, lng: -116.0 },
  { name: 'Mojave Desert Zone', lat: 35.0, lng: -117.5 },
  { name: 'Santa Cruz Mountains', lat: 37.1, lng: -122.0 },
];

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fireberg.com' },
    update: {},
    create: {
      email: 'admin@fireberg.com',
      password: hashedPassword,
      name: 'Admin User'
    }
  });
  console.log('Created admin user:', admin.email);

  // Create zones
  const zones = [];
  for (const zoneData of fireZones) {
    const riskLevel = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    const temperature = 20 + Math.random() * 25; // 20-45°C
    const humidity = 10 + Math.random() * 40; // 10-50%
    const windSpeed = 5 + Math.random() * 30; // 5-35 km/h

    const zone = await prisma.zone.create({
      data: {
        name: zoneData.name,
        latitude: zoneData.lat + (Math.random() - 0.5) * 0.5,
        longitude: zoneData.lng + (Math.random() - 0.5) * 0.5,
        riskLevel,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed * 10) / 10,
        isActive: true
      }
    });
    zones.push(zone);
  }
  console.log(`Created ${zones.length} zones`);

  // Create alerts for high-risk zones
  let alertCount = 0;
  for (const zone of zones) {
    if (zone.riskLevel === 'high' || zone.riskLevel === 'critical') {
      const alert = await prisma.alert.create({
        data: {
          zoneId: zone.id,
          severity: zone.riskLevel,
          temperature: zone.temperature,
          humidity: zone.humidity,
          windSpeed: zone.windSpeed,
          acknowledged: false
        }
      });
      alertCount++;
    }
  }
  console.log(`Created ${alertCount} alerts`);

  // Create reports
  const reportCount = 10 + Math.floor(Math.random() * 10);
  for (let i = 0; i < reportCount; i++) {
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
    const areaHectares = 1 + Math.random() * 500;
    const estimatedDamage = areaHectares * (1000 + Math.random() * 9000);
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

    await prisma.report.create({
      data: {
        zoneId: zone.id,
        areaHectares: Math.round(areaHectares * 10) / 10,
        estimatedDamage: Math.round(estimatedDamage),
        status,
        reportedBy: 'Field Team',
        createdAt
      }
    });
  }
  console.log(`Created ${reportCount} reports`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
