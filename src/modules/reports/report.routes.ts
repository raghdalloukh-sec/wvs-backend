import { Router } from 'express';
import { authGuard } from '../../middlewares/authGuard';
import { getReportHandler } from './report.controller';

const router = Router();

router.use(authGuard);
router.get('/:scanId', getReportHandler);

export default router;
