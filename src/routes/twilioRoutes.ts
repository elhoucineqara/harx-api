import express from 'express';
const router = express.Router();
import twilio from 'twilio';
import mongoose from 'mongoose';
import TwilioIntegration from '../models/TwilioIntegration';

// Verify and setup Twilio credentials
router.post('/setup', async (req, res) => {
  console.log("req.body",req.body);
    const { userId, accountSid, authToken, phoneNumber } = req.body;

    if (!userId || !accountSid || !authToken || !phoneNumber) {
        return res.status(400).json({ success: false, error: "All fields are required" });
    }

    try {
        // Verify Twilio credentials
        const client = twilio(accountSid, authToken);
        await client.api.accounts(accountSid).fetch();
        console.log("client",client);
// here await create a twiml app using twilio api
/* const twimlApp = await client.applications.v1.create({
  friendlyName: 'My Twilio App',
  voiceMethod: 'POST',
  voiceUrl: 'https://your-server.com/voice-response',
}); */
/* const application = await client.applications.create({
  friendlyName: "twilio-app",
  voiceMethod: "POST",
  voiceUrl: "https://api-calls.harx.ai/api/calls/twilio-voice",
});
console.log("twimlApp",application); */
// here await create a apikey de type standard
/* const apiKey = await client.apiKeys.v2.create({
  friendlyName: 'My Twilio API Key',
  type: 'standard',
}); */
/* const newApiKey = await client.iam.v1.newApiKey.create({
  accountSid: accountSid,
  friendlyName: "HARX API key",
});
console.log("apiKey",newApiKey); */

        // Save credentials in the database
        //add here the apikey sid and the apikey secret and the twimpl app sid
        const twilioData = await TwilioIntegration.findOneAndUpdate(
            { userId },
            { accountSid, authToken, phoneNumber /* apiKeySid: apiKey.sid, apiKeySecret: apiKey.secret, twimlAppSid: twimlApp.sid */ },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: "Twilio connected successfully!", data: twilioData, status: twilioData.status });
    } catch (error) {
        res.status(401).json({ success: false, error: "Invalid Twilio credentials" });
    }
});
router.post('/disconnect', async (req, res) => {
    const { userId, integrationId } = req.body;

    if (!userId || !integrationId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId format" });
        }
        
        const updatedIntegration = await TwilioIntegration.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(userId) }, // Ensure correct ObjectId conversion
            { status: "disconnected" }, // Update the status
            { new: true } // Return the updated document
        );

        res.json({ success: true, message: "Integration disconnected successfully!" , status: updatedIntegration.status});
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to disconnect integration" });
        console.error(error);
    }
});
const validateTwilioCredentials = async (accountSid: string, authToken: string) => {
    try {
      const client = twilio(accountSid, authToken);
      
      // Fetch the account details directly to validate the credentials
      const account = await client.api.accounts(accountSid).fetch();
  
      // Check if we get a valid account response
      if (account && account.sid) {
        return true;
      }
  
      return false;
    } catch (error) {
      console.error("Twilio credentials validation failed:", error.message);
      return false;
    }
  };
  
  // Endpoint to reconnect Twilio integration
  router.post("/reconnect-twilio", async (req, res) => {
    const { userId, accountSid, authToken } = req.body;
  
    if (!userId || !accountSid || !authToken) {
      return res.status(400).json({ success: false, message: "Missing required fields (userId, accountSid, authToken)" });
    }
  
    try {
      // Step 1: Check if the user had the integration before
      const integration = await TwilioIntegration.findOne({ userId });
  
      if (!integration) {
        return res.status(404).json({ success: false, message: "User did not have Twilio integration before." });
      }
  
      // Step 2: Validate Twilio credentials
      const isValidTwilio = await validateTwilioCredentials(accountSid, authToken);
  
      if (!isValidTwilio) {
        return res.status(400).json({ success: false, message: "Invalid Twilio credentials." });
      }
  
      // Step 3: Update integration status to "connected"
      await TwilioIntegration.updateOne(
        { userId },
        { status: 'connected', lastConnected: new Date() }
      );
  
      // Respond with success message
      res.status(200).json({ success: true, message: "Twilio integration successfully reconnected.", status: "connected" });
    } catch (error) {
      console.error("Error reconnecting Twilio integration:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
router.get("/twilio-status", async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: "Missing userId" });
    }

    try {
        const integration = await TwilioIntegration.findOne({ userId });

        if (!integration) {
          return res.json({ success: true, status: 'pending' });
        }

        res.json({ success: true, status: integration.status });
    } catch (error) {
        console.error("Error fetching Twilio status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get Twilio configuration for a user
router.get('/config/:userId', async (req, res) => {
    const { userId } = req.params;
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    if (!userId || !isValidObjectId(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    try {
        const twilioIntegration = await TwilioIntegration.findOne({ userId });
        
        if (!twilioIntegration) {
            return res.status(404).json({ success: false, error: "Twilio configuration not found for this user" });
        }
        
        // Return the configuration (excluding sensitive data in production)
        const integration = {
            accountSid: twilioIntegration.accountSid,
            authToken: twilioIntegration.authToken, // In production, you might want to exclude this
            phoneNumber: twilioIntegration.phoneNumber,
            status: twilioIntegration.status
        };
        
        res.json({ success: true, integration });
    } catch (error) {
        console.error('Error fetching Twilio configuration:', error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
