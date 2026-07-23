import { prisma } from '../../config/prisma';
import { runScan } from '../scanEngine/engine';
import { scanModules } from '../scanEngine/registry';
import { AppError } from '../../middlewares/errorHandler';

export async function createScan(userId: string, targetUrl: string) {
  const scan = await prisma.scan.create({
    data: {
      targetUrl,
      status: 'RUNNING',
      userId,
    },
  });

  try {
    const { globalScore, results } = await runScan(targetUrl, scanModules);

    const updatedScan = await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: 'COMPLETED',
        globalScore,
        finishedAt: new Date(),
        results: {
          create: results.map((r) => ({
            moduleName: r.moduleName,
            status: r.status,
            details: r.details,
            score: r.score,
          })),
        },
      },
      include: { results: true },
    });

    return updatedScan;
  } catch (err) {
    await prisma.scan.update({
      where: { id: scan.id },
      data: { status: 'FAILED', finishedAt: new Date() },
    });
    throw new AppError(500, 'Le scan a échoué');
  }
}

export async function listScans(userId: string) {
  return prisma.scan.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: { results: true },
  });
}

export async function getScanById(userId: string, scanId: string) {
  const scan = await prisma.scan.findFirst({
    where: { id: scanId, userId },
    include: { results: true },
  });
  if (!scan) throw new AppError(404, 'Scan introuvable');
  return scan;
}

export async function getStats(userId: string) {
  const scans = await prisma.scan.findMany({
    where: { userId, status: 'COMPLETED' },
    include: { results: true },
  });

  const totalScans = scans.length;
  const averageScore = totalScans === 0
    ? 0
    : Math.round(scans.reduce((sum, s) => sum + (s.globalScore ?? 0), 0) / totalScans);

  const moduleFailCounts: Record<string, number> = {};
  for (const scan of scans) {
    for (const result of scan.results) {
      if (result.status === 'FAIL') {
        moduleFailCounts[result.moduleName] = (moduleFailCounts[result.moduleName] ?? 0) + 1;
      }
    }
  }

  const mostFailedModule = Object.entries(moduleFailCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { totalScans, averageScore, moduleFailCounts, mostFailedModule };
}
