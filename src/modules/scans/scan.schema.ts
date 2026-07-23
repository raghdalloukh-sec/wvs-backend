import { z } from 'zod';

export const createScanSchema = z.object({
  targetUrl: z.string().url('URL invalide (ex: https://example.com)'),
});

export type CreateScanInput = z.infer<typeof createScanSchema>;
