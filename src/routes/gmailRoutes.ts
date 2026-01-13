import express from 'express';
const router = express.Router();
const GmailIntegration = require('../../models/gmailIntegration');
const { 
    setupGmail, 
    reconnectGmail, 
    disconnectGmail, 
    getGmailStatus, 
    fetchEmails, 
    readEmail, 
    replyToEmail 
} = require('../../services/gmailService');

// ✅ Setup Gmail Integration
router.post("/setup", async (req, res) => {
    const { userId, clientId, clientSecret, refreshToken } = req.body;

    if (!userId || !clientId || !clientSecret || !refreshToken) {
        return res.status(400).json({ success: false, error: "All fields are required" });
    }

    try {
        const integration = await GmailIntegration.findOneAndUpdate(
            { userId },
            { clientId, clientSecret, refreshToken, status: "connected" },
            { new: true, upsert: true }
        );
        res.json({ success: true, message: "Gmail connected successfully!", data: integration });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to setup Gmail integration" });
    }
});

// ✅ Reconnect Gmail
router.post("/reconnect", async (req, res) => {
    const { userId, clientId, clientSecret, refreshToken } = req.body;

    if (!userId || !clientId || !clientSecret || !refreshToken) {
        return res.status(400).json({ success: false, error: "All fields are required" });
    }

    try {
        const integration = await GmailIntegration.findOne({ userId });
        if (!integration) {
            return res.status(404).json({ success: false, error: "Integration not found. Please setup again." });
        }
        
        integration.clientId = clientId;
        integration.clientSecret = clientSecret;
        integration.refreshToken = refreshToken;
        integration.status = "connected";
        await integration.save();

        res.json({ success: true, message: "Gmail reconnected successfully!", status: integration.status });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to reconnect Gmail integration" });
    }
});

// ✅ Disconnect Gmail
router.post("/disconnect", async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    try {
        const integration = await GmailIntegration.findOneAndUpdate(
            { userId },
            { status: "disconnected" },
            { new: true }
        );

        if (!integration) {
            return res.status(404).json({ success: false, error: "Integration not found" });
        }

        res.json({ success: true, message: "Gmail disconnected successfully!", status: integration.status });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to disconnect Gmail integration" });
    }
});

// ✅ Get Gmail Status
router.get("/status", async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    try {
        const integration = await GmailIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: "pending" });
        }
        res.json({ success: true, status: integration.status });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch Gmail integration status" });
    }
});

// ✅ Fetch Emails
router.get("/fetch-emails", async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }

    try {
        const emails = await fetchEmails(userId);
        res.json({ success: true, emails });
    } catch (error) {
        let errorMessage = "Failed to fetch emails";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});
router.get("/read-email/:messageId", async (req, res) => {
    const { userId } = req.query;
    const { messageId } = req.params;

    if (!userId || !messageId) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    try {
        const email = await readEmail(userId, messageId);
        res.json({ success: true, email });
    } catch (error) {
        let errorMessage = "Failed to read email";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});
router.post("/reply-email", async (req, res) => {
    const { userId, messageId, replyText } = req.body;

    if (!userId || !messageId || !replyText) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    try {
        const response = await replyToEmail(userId, messageId, replyText);
        res.json(response);
    } catch (error) {
        let errorMessage = "Failed to reply to email";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

export default router;
