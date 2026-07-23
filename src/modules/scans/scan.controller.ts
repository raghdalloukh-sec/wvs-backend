import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authGuard';
import { createScanSchema } from './scan.schema';
import * as scanService from './scan.service';

export async function createScanHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { targetUrl } = createScanSchema.parse(req.body);
    const scan = await scanService.createScan(req.userId!, targetUrl);
    res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
}

export async function listScansHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scans = await scanService.listScans(req.userId!);
    res.status(200).json(scans);
  } catch (err) {
    next(err);
  }
}

export async function getScanHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scan = await scanService.getScanById(req.userId!, req.params.id);
    res.status(200).json(scan);
  } catch (err) {
    next(err);
  }
}

export async function statsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await scanService.getStats(req.userId!);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}
