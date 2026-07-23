import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import scanRoutes from '../modules/scans/scan.routes';
import reportRoutes from '../modules/reports/report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/scans', scanRoutes);
router.use('/reports', reportRoutes);

export default router;
