export type ModuleStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface ScanModuleResult {
  moduleName: string;
  status: ModuleStatus;
  details: string;
  score: number; // 0-100, contribution de ce module
}

/**
 * Interface commune que chaque module de vérification doit implémenter.
 * Ça permet d'ajouter un nouveau check (ex: SSL, CORS, cookies...)
 * sans toucher à l'orchestrateur.
 */
export interface ScanModule {
  name: string;
  run(targetUrl: string): Promise<ScanModuleResult>;
}
