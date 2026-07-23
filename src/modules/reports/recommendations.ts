type ModuleName = 'HTTP_HEADERS' | 'SSL_TLS' | 'COOKIES' | 'CORS' | 'CLICKJACKING';

const RECOMMENDATIONS: Record<ModuleName, { fail: string; warning: string; pass: string }> = {
  HTTP_HEADERS: {
    fail: "Ajoutez les en-têtes de sécurité recommandés (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) dans la configuration du serveur web.",
    warning: "Certains en-têtes de sécurité recommandés sont absents. Complétez-les pour renforcer la protection du site.",
    pass: "Les en-têtes de sécurité HTTP recommandés sont bien configurés.",
  },
  SSL_TLS: {
    fail: "Activez HTTPS avec un certificat valide (ex: Let's Encrypt) et désactivez les versions obsolètes de TLS (1.0/1.1).",
    warning: "Le certificat approche de son expiration ou une version de TLS ancienne est encore acceptée. Planifiez son renouvellement.",
    pass: "Le certificat SSL/TLS est valide et une version moderne du protocole est utilisée.",
  },
  COOKIES: {
    fail: "Ajoutez les attributs Secure, HttpOnly et SameSite à tous les cookies pour empêcher leur vol via des attaques XSS ou leur envoi non désiré.",
    warning: "Certains cookies n'ont pas tous les attributs de sécurité recommandés. Vérifiez chaque cookie individuellement.",
    pass: "Les cookies émis par le site respectent les bonnes pratiques de sécurité.",
  },
  CORS: {
    fail: "Restreignez la politique CORS à une liste précise d'origines de confiance et évitez de combiner l'autorisation de toute origine avec l'envoi d'identifiants.",
    warning: "La politique CORS est trop permissive. Limitez les origines autorisées aux domaines réellement nécessaires.",
    pass: "La politique CORS du site est correctement restreinte.",
  },
  CLICKJACKING: {
    fail: "Ajoutez l'en-tête X-Frame-Options (DENY ou SAMEORIGIN) ou la directive CSP frame-ancestors pour empêcher l'intégration du site dans une iframe malveillante.",
    warning: "La protection contre le clickjacking est partielle. Vérifiez la configuration de X-Frame-Options.",
    pass: "Le site est protégé contre le clickjacking.",
  },
};

export function getRecommendation(moduleName: string, status: 'PASS' | 'WARNING' | 'FAIL'): string {
  const entry = RECOMMENDATIONS[moduleName as ModuleName];
  if (!entry) return 'Aucune recommandation disponible pour ce module.';
  if (status === 'FAIL') return entry.fail;
  if (status === 'WARNING') return entry.warning;
  return entry.pass;
}
