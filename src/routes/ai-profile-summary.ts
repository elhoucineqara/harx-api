import { Request, Response } from 'express';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { profileData } = await request.json();

    if (!profileData) {
      return res.json(
        { message: 'Profile data is required' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional CV writer with a knack for creating engaging, memorable summaries. Create a compelling professional summary that follows the REPS framework while maintaining a confident, energetic tone:
          - Role: Current position and career focus (with a touch of personality)
          - Experience: Years and experience and key industries (highlight the journey)
          - Projects: Notable achievements and contributions (make them shine)
          - Skills: Core technical and professional competencies (show expertise with style)
          
          Keep the summary concise, impactful, and achievement-oriented while letting the person's unique value proposition shine through.`
        },
        {
          role: "user",
          content: `Create a fresh, engaging REPS summary based on this profile data: ${JSON.stringify(profileData)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = response.choices[0].message.content;

    return res.json({
      success: true,
      summary
    });

  } catch (error: any) {
    console.error('Summary generation error:', error);
    return res.json(
      { message: 'Failed to generate summary', error: error.message },
      { status: 500 }
    );
  }
}

