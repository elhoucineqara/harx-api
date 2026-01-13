import twilio from 'twilio';
import TwilioIntegration from '../models/TwilioIntegration';

export const makeCall = async (req: { body: { userId: any; to: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; error: any; }): void; new(): any; }; }; json: (arg0: { success: boolean; callSid: string; }) => void; }) => {
    const { userId, to } = req.body;

    if (!userId || !to) {
        return res.status(400).json({ success: false, error: "User ID and recipient number are required" });
    }

    try {
        // Retrieve Twilio credentials from the database
        const credentials = await TwilioIntegration.findOne({ userId });
        if (!credentials) {
            return res.status(403).json({ success: false, error: "Twilio is not integrated for this user" });
        }

        // Initialize Twilio client
        const client = twilio(credentials.accountSid, credentials.authToken);

        // Make a call
        const call = await client.calls.create({
            url: 'http://demo.twilio.com/docs/voice.xml',
            from: credentials.phoneNumber,
            to
        });

        res.json({ success: true, callSid: call.sid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
