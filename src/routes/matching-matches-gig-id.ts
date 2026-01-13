import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import Gig from '@/models/Gig';
import { MatchingEngine } from '@/lib/matching/engine';
import { IUser } from '@/models/User';
import { ITimezone } from '@/models/Timezone';
import { Types } from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id: gigId } = await params;

  try {
    const { weights } = req.body;

    const gig = await Gig.findById(gigId)
      .populate('skills.professional.skill')
      .populate('skills.technical.skill')
      .populate('skills.soft.skill')
      .populate('skills.languages.language')
      .populate('industries')
      .populate('activities')
      .populate('destination_zone')
      .populate('availability.time_zone');

    if (!gig) {
      return res.json({ success: false, message: 'Gig not found' }, { status: 404 });
    }

    const agents = await Agent.find({ status: 'active' }) // Only active agents
      .populate('userId', 'email personalInfo')
      .populate('personalInfo.country')
      .populate('personalInfo.languages.language')
      .populate('skills.soft.skill')
      .populate('skills.professional.skill')
      .populate('skills.technical.skill')
      .populate('professionalSummary.industries')
      .populate('professionalSummary.activities')
      .populate('availability.timeZone');

    const matches = agents.map((agent) => {
      const { totalMatchingScore, details } = MatchingEngine.calculateScore(agent, gig, weights);
      
      // Type guard to check if userId is populated
      const user = agent.userId instanceof Types.ObjectId ? null : agent.userId as IUser;
      
      // Type guard to check if country is populated
      const country = agent.personalInfo?.country instanceof Types.ObjectId 
        ? null 
        : agent.personalInfo?.country as ITimezone;
      
      return {
        agentId: agent._id,
        gigId: gig._id,
        totalMatchingScore,
        agentInfo: {
            name: (user as any)?.personalInfo?.name || user?.email || 'Unknown',
            email: user?.email,
            location: agent.personalInfo?.city || country?.countryName,
            languages: agent.personalInfo?.languages?.map((l: any) => ({
                language: l.language?.name,
                proficiency: l.proficiency
            })),
            skills: agent.skills,
            experience: agent.experience
        },
        skillsMatch: { score: details.skills, details: {} }, // Populate details if needed by frontend
        industryMatch: { score: details.industry, details: {} },
        languageMatch: { score: details.languages, details: {} },
        availabilityMatch: { score: details.availability, details: {} },
        // ... map other details
      };
    });

    // Sort by score descending
    matches.sort((a, b) => b.totalMatchingScore - a.totalMatchingScore);

    // Format response as expected by frontend MatchResponse
    const response = {
        totalMatches: matches.length,
        perfectMatches: matches.filter(m => m.totalMatchingScore >= 95).length,
        partialMatches: matches.filter(m => m.totalMatchingScore >= 70 && m.totalMatchingScore < 95).length,
        noMatches: matches.filter(m => m.totalMatchingScore < 50).length,
        preferedmatches: matches.slice(0, 5), // Top 5
        matches: matches
    };

    return res.json(response);

  } catch (error: any) {
    console.error('Error calculating matches:', error);
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}


