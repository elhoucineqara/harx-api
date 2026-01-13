import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import { vertexService } from '@/services/ai/vertexService';

export const post = async (req: Request, res: Response) => {
  // Skip execution during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return res.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fileUri, textToCompare } = req.body;
    const result = await vertexService.evaluateRepLanguage(fileUri, textToCompare);
    return res.json(result);
  } catch (error: any) {
    return res.json({ error: error.message }, { status: 500 });
  }
}


