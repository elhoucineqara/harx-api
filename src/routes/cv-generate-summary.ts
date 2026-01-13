import { Request, Response } from 'express';
import { NextResponse } from 'next/server';
import { cvService } from '@/services/cvService';

export async function POST(req: Request) {
  try {
    const { profileData } = req.body;
    const result = await cvService.generateSummary(profileData);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in generate-summary:', error);
    return res.json({ error: error.message }, { status: 500 });
  }
}

