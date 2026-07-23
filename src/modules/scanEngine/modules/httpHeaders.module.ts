import { ScanModule, ScanModuleResult } from '../types';

const SECURITY_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
];

/**
 * Vérifie la présence des en-têtes de sécurité HTTP recommandés.
 */
export const httpHeadersModule: ScanModule = {
  name: 'HTTP_HEADERS',

  async run(targetUrl: string): Promise<ScanModuleResult> {
    const response = await fetch(targetUrl, { method: 'GET' });
    const headers = response.headers;

    const missing = SECURITY_HEADERS.filter((h) => !headers.has(h));
    const present = SECURITY_HEADERS.length - missing.length;
    const score = Math.round((present / SECURITY_HEADERS.length) * 100);

    let status: ScanModuleResult['status'] = 'PASS';
    if (missing.length > 0 && missing.length < SECURITY_HEADERS.length) status = 'WARNING';
    if (missing.length === SECURITY_HEADERS.length) status = 'FAIL';

    const details = missing.length === 0
      ? 'Tous les en-têtes de sécurité recommandés sont présents.'
      : `En-têtes manquants: ${missing.join(', ')}`;

    return { moduleName: 'HTTP_HEADERS', status, details, score };
  },
};
