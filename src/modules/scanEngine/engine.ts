import { ScanModule, ScanModuleResult } from './types';

export interface EngineReport {
  globalScore: number;
  results: ScanModuleResult[];
}

/**
 * Exécute tous les modules de scan en parallèle.
 * Utilise allSettled pour qu'un module qui plante (timeout réseau, etc.)
 * ne fasse pas échouer tout le scan.
 */
export async function runScan(
  targetUrl: string,
  modules: ScanModule[]
): Promise<EngineReport> {
  const outcomes = await Promise.allSettled(
    modules.map((mod) => mod.run(targetUrl))
  );

  const results: ScanModuleResult[] = outcomes.map((outcome, i) => {
    if (outcome.status === 'fulfilled') {
      return outcome.value;
    }
    // Le module a levé une exception (ex: site injoignable) -> on le trace en FAIL
    return {
      moduleName: modules[i].name,
      status: 'FAIL' as const,
      details: `Erreur lors de l'exécution du module: ${outcome.reason}`,
      score: 0,
    };
  });

  const globalScore = computeGlobalScore(results);

  return { globalScore, results };
}

function computeGlobalScore(results: ScanModuleResult[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round(total / results.length);
}
