const { google } = require("googleapis");
const GmailIntegration = require('../../models/gmailIntegration');

// ✅ Function to Create OAuth2 Client
const createOAuthClient = async (userId) => {
    const integration = await GmailIntegration.findOne({ userId });
    if (!integration) throw new Error("Gmail integration not found.");

    const oAuth2Client = new google.auth.OAuth2(
        integration.clientId,
        integration.clientSecret,
        "https://developers.google.com/oauthplayground"
    );
    oAuth2Client.setCredentials({ refresh_token: integration.refreshToken });
    return oAuth2Client;
};

// ✅ Setup Gmail Integration
const setupGmail = async (userId, clientId, clientSecret, refreshToken) => {
    let integration = await GmailIntegration.findOne({ userId });

    if (!integration) {
        integration = new GmailIntegration({ userId, clientId, clientSecret, refreshToken, status: "connected" });
    } else {
        integration.clientId = clientId;
        integration.clientSecret = clientSecret;
        integration.refreshToken = refreshToken;
        integration.status = "connected";
    }

    await integration.save();
    return integration;
};

// ✅ Reconnect Gmail (Refresh Token)
const reconnectGmail = async (userId) => {
    const integration = await GmailIntegration.findOne({ userId });

    if (!integration) throw new Error("Gmail integration not found.");

    const oAuth2Client = await createOAuthClient(userId);

    try {
        // Refresh token to verify connection
        await oAuth2Client.getAccessToken();
        integration.status = "connected";
        await integration.save();
        return integration;
    } catch (error) {
        throw new Error("Failed to reconnect Gmail: " + error.message);
    }
};

// ✅ Fetch Emails
const fetchEmails = async (userId) => {
    const auth = await createOAuthClient(userId);
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10, // Fetch the latest 10 emails
    });

    if (!response.data.messages) return [];

    // Fetch details of each email
    const emails = await Promise.all(
        response.data.messages.map(async (message) => {
            const emailData = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
            });

            const headers = emailData.data.payload.headers;
            const subject = headers.find((header) => header.name === "Subject")?.value || "No Subject";
            const from = headers.find((header) => header.name === "From")?.value || "Unknown Sender";

            return {
                messageId: message.id,
                from,
                subject,
                snippet: emailData.data.snippet,
            };
        })
    );

    return emails;
};

// ✅ Read Email
const readEmail = async (userId, messageId) => {
    const auth = await createOAuthClient(userId);
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
    });

    const headers = response.data.payload.headers;
    const subject = headers.find((header) => header.name === "Subject")?.value || "No Subject";
    const from = headers.find((header) => header.name === "From")?.value || "Unknown Sender";
    const body = response.data.snippet;

    return {
        messageId,
        from,
        subject,
        body,
    };
};

// ✅ Reply to Email
const replyToEmail = async (userId, messageId, replyText) => {
    const auth = await createOAuthClient(userId);
    const gmail = google.gmail({ version: "v1", auth });

    // Fetch original email
    const originalEmail = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
    });

    const headers = originalEmail.data.payload.headers;
    const from = headers.find((header) => header.name === "From")?.value;
    const subject = headers.find((header) => header.name === "Subject")?.value;

    const rawMessage = Buffer.from(
        `To: ${from}\r\n` +
        `Subject: Re: ${subject}\r\n` +
        `Content-Type: text/plain; charset="UTF-8"\r\n` +
        `Content-Transfer-Encoding: 7bit\r\n\r\n` +
        `${replyText}`
    ).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: rawMessage,
        },
    });

    return { success: true, message: "Reply sent successfully" };
};

// ✅ Disconnect Gmail
const disconnectGmail = async (userId) => {
    const integration = await GmailIntegration.findOne({ userId });

    if (!integration) throw new Error("Gmail integration not found.");

    integration.status = "disconnected";
    await integration.save();
    return integration;
};

// ✅ Get Gmail Integration Status
const getGmailStatus = async (userId) => {
    const integration = await GmailIntegration.findOne({ userId });
    if (!integration) throw new Error("Gmail integration not found.");
    return integration.status;
};

export default { 
    setupGmail,
    reconnectGmail,
    fetchEmails,
    readEmail,
    replyToEmail,
    disconnectGmail,
    getGmailStatus
 };
