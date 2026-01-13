import { Request, Response } from 'express';
import { NextResponse } from 'next/server';
import { cvService } from '@/services/cvService';

export async function POST(req: Request) {
  try {
    const { contentToProcess } = req.body;
    const result = await cvService.extractBasicInfo(contentToProcess);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in extract-basic-info:', error);
    return res.json({ error: error.message }, { status: 500 });
  }
}

