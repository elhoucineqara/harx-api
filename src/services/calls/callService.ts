import Call, { ICall } from '../../models/Call';
import dbConnect from '../../lib/dbConnect';
import { TwilioService } from '../integrations/TwilioService';
import OpenAI from 'openai';

const twilioService = new TwilioService(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class CallService {
  async getAllCalls(query: any = {}) {
    await dbConnect();
    return Call.find(query).populate('agent').populate('lead').sort({ createdAt: -1 }).lean();
  }

  async getCallById(id: string) {
    await dbConnect();
    return Call.findById(id).populate('agent').populate('lead').lean();
  }

  async createCall(data: Partial<ICall>) {
    await dbConnect();
    const call = new Call(data);
    return await call.save();
  }

  async updateCall(id: string, data: Partial<ICall>) {
    await dbConnect();
    return Call.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('agent').populate('lead').lean();
  }

  async initiateCall(agentId: string, phoneNumber: string) {
    try {
      await dbConnect();
      
      const call = await Call.create({
        agent: agentId,
        phone_number: phoneNumber,
        direction: 'outbound',
        status: 'active'
      });

      return call;
    } catch (error: any) {
      throw new Error(`Failed to initiate call: ${error.message}`);
    }
  }

  async endCall(id: string, duration: number) {
    await dbConnect();
    return Call.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        duration: duration || 0,
        updatedAt: new Date()
      },
      { new: true }
    ).lean();
  }

  async addNote(id: string, note: string) {
    await dbConnect();
    return Call.findByIdAndUpdate(
      id,
      { notes: note },
      { new: true }
    ).lean();
  }

  async updateQualityScore(id: string, score: number) {
    await dbConnect();
    return Call.findByIdAndUpdate(
      id,
      { quality_score: score },
      { new: true }
    ).lean();
  }

  async generateToken(userId: string) {
    return twilioService.generateToken(userId);
  }

  async storeCall(data: any) {
    await dbConnect();
    // Assuming data contains fields matching ICall or mapped accordingly
    // For 'store-call' endpoint which seemed to save end-of-call data
    
    // Check if call exists by SID if provided
    if (data.CallSid) {
        let call = await Call.findOne({ sid: data.CallSid });
        if (call) {
            // Update existing
            return Call.findByIdAndUpdate(call._id, data, { new: true }).lean();
        }
    }
    
    return Call.create(data);
  }

  async processAIAssist(transcription: string, context: any[]) {
    try {
      const messages = [
        {
          role: "system" as const,
          content: `You are a helpful sales assistant monitoring a live call. 
          Analyze the transcription segment provided and offer real-time suggestions, alerts, or info to the agent.
          
          Your response must be in Markdown format.
          
          Categories:
          - Suggestion: Advice on what to say or ask next.
          - Alert: Warning about sentiment or compliance.
          - Info: Relevant facts or data retrieval.
          - Action: Specific tasks to perform.
          
          Priorities: high, medium, low.
          `
        },
        ...context.map(c => ({ role: c.role, content: c.content })),
        { role: "user" as const, content: transcription }
      ];

      const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4o",
      });

      return {
        suggestion: completion.choices[0].message.content
      };
    } catch (error: any) {
      console.error("AI Assist Error:", error);
      throw new Error("Failed to process AI assistance");
    }
  }
}

export const callService = new CallService();
