import tls from 'tls';
import { URL } from 'url';
import { ScanModule, ScanModuleResult } from '../types';

const OUTDATED_PROTOCOLS = ['TLSv1', 'TLSv1.1'];
const MODERN_PROTOCOLS = ['TLSv1.2', 'TLSv1.3'];
const CONNECTION_TIMEOUT_MS = 5000;

interface CertInfo {
  protocol: string | null;
  validTo: string;
  daysRemaining: number;
}

function inspectConnection(hostname: string, port: number): Promise<CertInfo> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: CONNECTION_TIMEOUT_MS,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();

        if (!cert || Object.keys(cert).length === 0) {
          socket.end();
          reject(new Error('Aucun certificat reçu du serveur'));
          return;
        }

        const validTo = cert.valid_to;
        const daysRemaining = Math.floor(
          (new Date(validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        socket.end();
        resolve({ protocol, validTo, daysRemaining });
      }
    );

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connexion TLS expirée (timeout)'));
    });

    socket.on('error', (err) => {
      reject(err);
    });
  });
}

export const sslTlsModule: ScanModule = {
  name: 'SSL_TLS',

  async run(targetUrl: string): Promise<ScanModuleResult> {
    const url = new URL(targetUrl);

    if (url.protocol !== 'https:') {
      return {
        moduleName: 'SSL_TLS',
        status: 'FAIL',
        details: "Le site n'utilise pas HTTPS.",
        score: 0,
      };
    }

    const port = url.port ? Number(url.port) : 443;

    try {
      const { protocol, validTo, daysRemaining } = await inspectConnection(url.hostname, port);

      const issues: string[] = [];
      let score = 100;
      let status: ScanModuleResult['status'] = 'PASS';

      if (daysRemaining < 0) {
        issues.push(`Le certificat a expiré le ${validTo}.`);
        score = 0;
        status = 'FAIL';
      } else if (daysRemaining < 15) {
        issues.push(`Le certificat expire bientôt (${daysRemaining} jours restants).`);
        score -= 30;
        status = 'WARNING';
      }

      if (protocol && OUTDATED_PROTOCOLS.includes(protocol)) {
        issues.push(`Version TLS obsolète utilisée: ${protocol}.`);
        score -= 50;
        status = status === 'FAIL' ? 'FAIL' : 'WARNING';
      } else if (!protocol || !MODERN_PROTOCOLS.includes(protocol)) {
        issues.push(`Version TLS non reconnue: ${protocol ?? 'inconnue'}.`);
        score -= 20;
        status = status === 'FAIL' ? 'FAIL' : 'WARNING';
      }

      score = Math.max(0, score);

      const details = issues.length === 0
        ? `Certificat valide (expire dans ${daysRemaining} jours), protocole ${protocol}.`
        : issues.join(' ');

      return { moduleName: 'SSL_TLS', status, details, score };
    } catch (err) {
      return {
        moduleName: 'SSL_TLS',
        status: 'FAIL',
        details: `Impossible d'établir une connexion TLS: ${(err as Error).message}`,
        score: 0,
      };
    }
  },
};