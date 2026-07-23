import https from 'https';
import http from 'http';
import { URL } from 'url';
import { ScanModule, ScanModuleResult } from '../types';

interface CookieIssue {
  name: string;
  problems: string[];
}

function fetchSetCookieHeaders(targetUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.get(url, (res) => {
      const setCookie = res.headers['set-cookie'] ?? [];
      resolve(setCookie);
      res.resume(); // on vide le flux, le contenu de la page ne nous intéresse pas
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Timeout lors de la récupération des cookies'));
    });
  });
}

function parseCookie(raw: string): { name: string; problems: string[] } {
  const parts = raw.split(';').map((p) => p.trim());
  const name = parts[0].split('=')[0];
  const attributes = parts.slice(1).map((p) => p.toLowerCase());

  const hasSecure = attributes.includes('secure');
  const hasHttpOnly = attributes.includes('httponly');
  const hasSameSite = attributes.some((a) => a.startsWith('samesite'));

  const problems: string[] = [];
  if (!hasSecure) problems.push('Secure manquant');
  if (!hasHttpOnly) problems.push('HttpOnly manquant');
  if (!hasSameSite) problems.push('SameSite manquant');

  return { name, problems };
}

export const cookiesModule: ScanModule = {
  name: 'COOKIES',

  async run(targetUrl: string): Promise<ScanModuleResult> {
    try {
      const rawCookies = await fetchSetCookieHeaders(targetUrl);

      if (rawCookies.length === 0) {
        return {
          moduleName: 'COOKIES',
          status: 'PASS',
          details: "Aucun cookie n'est défini par le site.",
          score: 100,
        };
      }

      const parsed = rawCookies.map(parseCookie);
      const withIssues: CookieIssue[] = parsed.filter((c) => c.problems.length > 0);

      const score = Math.round(((parsed.length - withIssues.length) / parsed.length) * 100);

      let status: ScanModuleResult['status'] = 'PASS';
      if (withIssues.length > 0 && withIssues.length < parsed.length) status = 'WARNING';
      if (withIssues.length === parsed.length) status = 'FAIL';

      const details = withIssues.length === 0
        ? `${parsed.length} cookie(s) correctement configuré(s) (Secure, HttpOnly, SameSite).`
        : withIssues.map((c) => `${c.name}: ${c.problems.join(', ')}`).join(' | ');

      return { moduleName: 'COOKIES', status, details, score };
    } catch (err) {
      return {
        moduleName: 'COOKIES',
        status: 'FAIL',
        details: `Impossible de vérifier les cookies: ${(err as Error).message}`,
        score: 0,
      };
    }
  },
};
