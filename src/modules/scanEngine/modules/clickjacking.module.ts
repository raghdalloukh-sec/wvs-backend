import { ScanModule, ScanModuleResult } from '../types';

export const clickjackingModule: ScanModule = {
  name: 'CLICKJACKING',

  async run(targetUrl: string): Promise<ScanModuleResult> {
    try {
      const response = await fetch(targetUrl, { method: 'GET' });

      const xfo = response.headers.get('x-frame-options');
      const csp = response.headers.get('content-security-policy');
      const hasFrameAncestors = csp?.toLowerCase().includes('frame-ancestors') ?? false;

      if (hasFrameAncestors) {
        return {
          moduleName: 'CLICKJACKING',
          status: 'PASS',
          details: "Protection via la directive CSP 'frame-ancestors', qui contrôle qui peut intégrer le site dans une iframe.",
          score: 100,
        };
      }

      if (xfo) {
        const normalized = xfo.toUpperCase();
        if (normalized === 'DENY' || normalized === 'SAMEORIGIN') {
          return {
            moduleName: 'CLICKJACKING',
            status: 'PASS',
            details: `Protection via X-Frame-Options: ${xfo}.`,
            score: 100,
          };
        }
        return {
          moduleName: 'CLICKJACKING',
          status: 'WARNING',
          details: `X-Frame-Options présent mais avec une valeur non standard: ${xfo}.`,
          score: 50,
        };
      }

      return {
        moduleName: 'CLICKJACKING',
        status: 'FAIL',
        details: 'Aucune protection contre le clickjacking détectée (ni X-Frame-Options, ni CSP frame-ancestors). Le site peut être intégré dans une iframe malveillante.',
        score: 0,
      };
    } catch (err) {
      return {
        moduleName: 'CLICKJACKING',
        status: 'FAIL',
        details: `Impossible de vérifier la protection clickjacking: ${(err as Error).message}`,
        score: 0,
      };
    }
  },
};
