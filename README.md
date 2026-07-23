# WVS Backend — Web Vulnerability Scanner

## Stack
Node.js + Express + TypeScript + PostgreSQL (Prisma) + JWT/bcrypt

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigne DATABASE_URL et JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

## Structure

```
src/
├── config/            # env, client Prisma
├── middlewares/        # errorHandler, authGuard (JWT)
├── modules/
│   ├── auth/            # register, login (JWT + bcrypt)
│   └── scanEngine/       # orchestrateur + modules de scan
│       ├── types.ts       # interface ScanModule
│       ├── engine.ts       # runScan() : exécute tous les modules en parallèle
│       ├── registry.ts      # liste des modules actifs
│       └── modules/          # un fichier par check (HTTP_HEADERS, SSL_TLS, ...)
├── routes/             # routeur principal
├── app.ts
└── server.ts
```

## État actuel

✅ Schéma PostgreSQL (User, Scan, ScanResult)
✅ Auth : `/api/auth/register`, `/api/auth/login`
✅ Scan Engine core (orchestrateur générique, exécution parallèle, calcul du score)
✅ 1 module d'exemple : HTTP_HEADERS

## Prochaines étapes (dans l'ordre conseillé)

1. Modules de scan restants : SSL_TLS, COOKIES, CORS, CLICKJACKING, EXPOSED_INFO
   (même pattern que `httpHeaders.module.ts`, à ajouter dans `registry.ts`)
2. Module `scans` : endpoint `POST /api/scans` (protégé par authGuard) qui appelle
   `runScan()`, enregistre le résultat en BDD, et `GET /api/scans` pour l'historique
3. Module `reports` : formatage du rapport + recommandations par check
4. Endpoints de statistiques pour le dashboard Angular
