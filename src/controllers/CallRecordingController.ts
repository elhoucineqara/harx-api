import { Request, Response, NextFunction } from 'express';
import CallRecording from '../models/CallRecording';
import Company from '../models/Company';
import dbConnect from '../lib/dbConnect';
import { promises as fs } from 'fs';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService';
import mongoose from 'mongoose';
import { getAudioSummaryService, getAudioTranscriptionService, getCallScoringService } from '../services/callAnalysisService';

// Upload a new call recording
export const uploadCallRecording = async (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.file?.path;

  try {
    await dbConnect();

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { contactId, date, duration, summary, sentiment, tags, aiInsights, repId, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate companyId
    const company = await Company.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Upload to Cloudinary
    const { url: recordingUrl, public_id: cloudinaryPublicId } = await uploadToCloudinary(filePath, 'call-recordings');

    // Create call recording record
    const callRecording = new CallRecording({
      contactId: contactId || 'Unknown',
      date: date ? new Date(date) : new Date(),
      duration: duration ? parseInt(duration) : 0,
      recordingUrl,
      cloudinaryPublicId,
      summary: summary || '',
      sentiment: sentiment || 'neutral',
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      aiInsights: aiInsights ? aiInsights.split(',').map((insight: string) => insight.trim()) : [],
      repId: repId || 'current-user',
      companyId: company._id,
      processingOptions: {
        transcription: true,
        sentiment: true,
        insights: true
      },
      audioState: {
        isPlaying: false,
        currentTime: 0,
        duration: duration ? parseInt(duration) : 0,
        audioInstance: null,
        showPlayer: false,
        showTranscript: false
      },
      analysis: {
        transcription: {
          segments: [],
          status: 'pending',
          lastUpdated: null,
          error: null
        },
        status: 'pending'
      }
    });

    await callRecording.save();

    res.status(201).json({
      message: 'Call recording uploaded successfully',
      callRecording: {
        id: callRecording._id,
        contactId: callRecording.contactId,
        date: callRecording.date,
        duration: callRecording.duration,
        recordingUrl: callRecording.recordingUrl,
        summary: callRecording.summary,
        sentiment: callRecording.sentiment,
        tags: callRecording.tags,
        aiInsights: callRecording.aiInsights,
        repId: callRecording.repId,
        companyId: callRecording.companyId
      }
    });
    } catch (error: any) {
    console.error('Error uploading call recording:', error);
    res.status(500).json({ error: 'Failed to upload call recording', details: error.message });
  } finally {
    // Clean up local file
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting local file after upload attempt:', unlinkError);
      }
    }
  }
};

// Get all call recordings for a user
export const getCallRecordings = async (req: Request, res: Response) => {
    try {
    await dbConnect();
    
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const company = await Company.findOne({ userId: new mongoose.Types.ObjectId(userId as string) });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const callRecordings = await CallRecording.find({ companyId: company._id });
    
    // Map the records to include id instead of _id
    const formattedRecordings = callRecordings.map(recording => ({
      id: recording._id.toString(),
      contactId: recording.contactId,
      date: recording.date,
      duration: recording.duration,
      recordingUrl: recording.recordingUrl,
      summary: recording.summary,
      sentiment: recording.sentiment,
      tags: recording.tags || [],
      aiInsights: recording.aiInsights || [],
      repId: recording.repId,
      companyId: recording.companyId
    }));

    res.status(200).json({ callRecordings: formattedRecordings });
    } catch (error: any) {
    console.error('Error fetching call recordings:', error);
    res.status(500).json({ error: 'Failed to fetch call recordings', details: error.message });
    }
};

// Delete a call recording
export const deleteCallRecording = async (req: Request, res: Response) => {
    try {
    await dbConnect();
    
      const { id } = req.params;
    
    // Find the call recording first
    const callRecording = await CallRecording.findById(id);
    if (!callRecording) {
      return res.status(404).json({ error: 'Call recording not found' });
    }

    // Delete from Cloudinary
    if (callRecording.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(callRecording.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete the record from the database
    await CallRecording.findByIdAndDelete(id);

    res.json({ message: 'Call recording deleted successfully' });
    } catch (error: any) {
    console.error('Error deleting call recording:', error);
    res.status(500).json({ error: 'Failed to delete call recording', details: error.message });
    }
};

// Generate summary for a call recording
export const getAudioSummary = async (req: Request, res: Response) => {
    try {
    await dbConnect();
    
    const { recordingId } = req.params;
    
    const callRecording = await CallRecording.findById(recordingId);
    if (!callRecording) {
      return res.status(404).json({ error: 'Call recording not found' });
    }

    // Check if summary already exists
    if (callRecording.analysis?.summary?.keyIdeas && callRecording.analysis.summary.keyIdeas.length > 0) {
      return res.json({
        summary: {
          keyIdeas: callRecording.analysis.summary.keyIdeas,
          lastUpdated: callRecording.analysis.summary.lastUpdated
        }
      });
    }

    // Generate summary using the service
    const summaryResult = await getAudioSummaryService(callRecording.recordingUrl);

    // Update the call recording with the summary
    if (!callRecording.analysis) {
      callRecording.analysis = {
        status: 'processing',
        transcription: {
          status: 'pending',
          segments: [],
          lastUpdated: null,
          error: null
        }
      };
    }

    callRecording.analysis.summary = {
      keyIdeas: summaryResult.keyIdeas || [],
      lastUpdated: new Date()
    };
    callRecording.analysis.status = 'completed';

    await callRecording.save();

    res.json({
      summary: {
        keyIdeas: callRecording.analysis.summary.keyIdeas,
        lastUpdated: callRecording.analysis.summary.lastUpdated
      }
    });
  } catch (error: any) {
    console.error('Error generating audio summary:', error);
    res.status(500).json({ error: 'Failed to generate audio summary', details: error.message });
  }
};

// Generate transcription for a call recording
export const getAudioTranscription = async (req: Request, res: Response) => {
  let callRecording: any = null;
  try {
    await dbConnect();
    
    const { recordingId } = req.params;
    
    callRecording = await CallRecording.findById(recordingId);
    if (!callRecording) {
      return res.status(404).json({ error: 'Call recording not found' });
      }

    // Check if transcription already exists
    if (callRecording.analysis?.transcription?.segments && callRecording.analysis.transcription.segments.length > 0) {
      return res.json({
        transcription: {
          status: callRecording.analysis.transcription.status,
          segments: callRecording.analysis.transcription.segments,
          lastUpdated: callRecording.analysis.transcription.lastUpdated,
          error: callRecording.analysis.transcription.error
        }
      });
    }

    // Generate transcription using the service
    const transcriptionResult = await getAudioTranscriptionService(callRecording.recordingUrl);

    // Update the call recording with the transcription
    if (!callRecording.analysis) {
      callRecording.analysis = {
        status: 'processing',
        summary: {
          keyIdeas: [],
          lastUpdated: null
        }
      };
    }

    callRecording.analysis.transcription = {
      status: 'completed',
      segments: transcriptionResult.segments || [],
      lastUpdated: new Date(),
      error: null
    };
    callRecording.analysis.status = 'completed';

    await callRecording.save();

    res.json({
      transcription: {
        status: callRecording.analysis.transcription.status,
        segments: callRecording.analysis.transcription.segments,
        lastUpdated: callRecording.analysis.transcription.lastUpdated,
        error: callRecording.analysis.transcription.error
      }
    });
    } catch (error: any) {
    console.error('Error generating audio transcription:', error);
    
    // Update error status in database
    if (callRecording) {
      if (!callRecording.analysis) {
        callRecording.analysis = {
          status: 'failed',
          transcription: {
            status: 'failed',
            segments: [],
            lastUpdated: null,
            error: error.message
          }
        };
      } else {
        callRecording.analysis.transcription = {
          status: 'failed',
          segments: [],
          lastUpdated: new Date(),
          error: error.message
        };
        callRecording.analysis.status = 'failed';
      }
      await callRecording.save();
    }

    res.status(500).json({ error: 'Failed to generate audio transcription', details: error.message });
  }
};

// Generate scoring for a call recording
export const getCallScoring = async (req: Request, res: Response) => {
  let callRecording: any = null;
  try {
    await dbConnect();
    
    const { recordingId } = req.params;
    
    callRecording = await CallRecording.findById(recordingId);
    if (!callRecording) {
      return res.status(404).json({ error: 'Call recording not found' });
    }

    // Check if scoring already exists
    if (callRecording.analysis?.scoring?.result) {
      return res.json({
        scoring: {
          status: callRecording.analysis.scoring.status,
          result: callRecording.analysis.scoring.result,
          lastUpdated: callRecording.analysis.scoring.lastUpdated,
          error: callRecording.analysis.scoring.error
        }
      });
    }

    // Generate scoring using the service
    const scoringResult = await getCallScoringService(callRecording.recordingUrl);

    // Update the call recording with the scoring
    if (!callRecording.analysis) {
      callRecording.analysis = {
        status: 'processing',
        transcription: {
          status: 'pending',
          segments: [],
          lastUpdated: null,
          error: null
        }
      };
    }

    callRecording.analysis.scoring = {
      status: 'completed',
      result: scoringResult.result || {},
      lastUpdated: new Date(),
      error: null
    };
    callRecording.analysis.status = 'completed';

    await callRecording.save();

    res.json({
      scoring: {
        status: callRecording.analysis.scoring.status,
        result: callRecording.analysis.scoring.result,
        lastUpdated: callRecording.analysis.scoring.lastUpdated,
        error: callRecording.analysis.scoring.error
    }
    });
  } catch (error: any) {
    console.error('Error generating call scoring:', error);
    
    // Update error status in database
    if (callRecording) {
      if (!callRecording.analysis) {
        callRecording.analysis = {
          status: 'failed',
          scoring: {
            status: 'failed',
            result: null,
            lastUpdated: null,
            error: error.message
          }
        };
      } else {
        callRecording.analysis.scoring = {
          status: 'failed',
          result: null,
          lastUpdated: new Date(),
          error: error.message
        };
        callRecording.analysis.status = 'failed';
      }
      await callRecording.save();
    }

    res.status(500).json({ error: 'Failed to generate call scoring', details: error.message });
  }
};
