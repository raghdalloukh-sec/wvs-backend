import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authGuard';
import * as reportService from './report.service';

export async function getReportHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const report = await reportService.generateReport(req.userId!, req.params.scanId);
    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
}
