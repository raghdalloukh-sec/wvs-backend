import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { getRecommendation } from './recommendations';

export async function generateReport(userId: string, scanId: string) {
  const scan = await prisma.scan.findFirst({
    where: { id: scanId, userId },
    include: { results: true },
  });

  if (!scan) throw new AppError(404, 'Scan introuvable');

  const enrichedResults = scan.results.map((r) => ({
    ...r,
    recommendation: getRecommendation(r.moduleName, r.status),
  }));

  return {
    ...scan,
    results: enrichedResults,
  };
}
