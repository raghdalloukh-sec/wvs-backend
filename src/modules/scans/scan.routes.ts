import { Router } from 'express';
import { authGuard } from '../../middlewares/authGuard';
import {
  createScanHandler,
  listScansHandler,
  getScanHandler,
  statsHandler,
} from './scan.controller';

const router = Router();

router.use(authGuard); // toutes les routes /scans nécessitent d'être connecté

router.post('/', createScanHandler);
router.get('/stats', statsHandler); // doit être défini AVANT /:id, sinon "stats" serait pris comme un id
router.get('/', listScansHandler);
router.get('/:id', getScanHandler);

export default router;
