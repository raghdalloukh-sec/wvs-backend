import { ScanModule, ScanModuleResult } from '../types';

// Origine bidon utilisée pour tester si le site accepte n'importe quelle origine
const TEST_ORIGIN = 'https://wvs-cors-probe.invalid';

export const corsModule: ScanModule = {
  name: 'CORS',

  async run(targetUrl: string): Promise<ScanModuleResult> {
    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { Origin: TEST_ORIGIN },
      });

      const acao = response.headers.get('access-control-allow-origin');
      const acac = response.headers.get('access-control-allow-credentials');

      if (!acao) {
        return {
          moduleName: 'CORS',
          status: 'PASS',
          details: "Aucune en-tête CORS renvoyée pour une origine externe : le site n'autorise pas les requêtes cross-origin par défaut.",
          score: 100,
        };
      }

      const reflectsAnyOrigin = acao === TEST_ORIGIN;
      const isWildcard = acao === '*';
      const allowsCredentials = acac === 'true';

      if ((reflectsAnyOrigin || isWildcard) && allowsCredentials) {
        return {
          moduleName: 'CORS',
          status: 'FAIL',
          details: `Configuration critique : le site autorise n'importe quelle origine (${acao}) ET les identifiants via Access-Control-Allow-Credentials. Un site malveillant peut lire des données authentifiées de l'utilisateur.`,
          score: 0,
        };
      }

      if (reflectsAnyOrigin) {
        return {
          moduleName: 'CORS',
          status: 'WARNING',
          details: `Le site reflète dynamiquement n'importe quelle origine dans Access-Control-Allow-Origin (testé avec ${TEST_ORIGIN}), sans identifiants. Risque modéré selon les données exposées.`,
          score: 50,
        };
      }

      if (isWildcard) {
        return {
          moduleName: 'CORS',
          status: 'WARNING',
          details: "Access-Control-Allow-Origin est réglé sur '*' (accessible à tous les sites), sans identifiants. Acceptable pour une API publique, à vérifier selon le contexte.",
          score: 70,
        };
      }

      return {
        moduleName: 'CORS',
        status: 'PASS',
        details: `Politique CORS restrictive : origine autorisée explicite (${acao}), différente de l'origine de test.`,
        score: 100,
      };
    } catch (err) {
      return {
        moduleName: 'CORS',
        status: 'FAIL',
        details: `Impossible de vérifier la politique CORS: ${(err as Error).message}`,
        score: 0,
      };
    }
  },
};
