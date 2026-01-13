import twilio from 'twilio';

export class TwilioService {
  private client: any;

  constructor(accountSid: string, authToken: string) {
    this.client = twilio(accountSid, authToken);
  }

  async makeCall(to: string, from: string) {
    try {
      const call = await this.client.calls.create({
        to,
        from,
        url: 'http://demo.twilio.com/docs/voice.xml' // Replace with your TwiML URL
      });
      return call;
    } catch (error: any) {
      throw new Error(`Failed to make Twilio call: ${error.message}`);
    }
  }

  async sendSMS(to: string, from: string, body: string) {
    try {
      const message = await this.client.messages.create({
        to,
        from,
        body
      });
      return message;
    } catch (error: any) {
      throw new Error(`Failed to send Twilio SMS: ${error.message}`);
    }
  }

  async validateCredentials() {
    try {
      await this.client.api.accounts(this.client.accountSid).fetch();
      return true;
    } catch (error) {
      return false;
    }
  }

  generateToken(identity: string) {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID || '',
      process.env.TWILIO_API_KEY || '',
      process.env.TWILIO_API_SECRET || '',
      { identity: identity }
    );

    const grant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_APP_SID,
      incomingAllow: true,
    });

    token.addGrant(grant);

    return token.toJwt();
  }
}

// Default export for compatibility
export default new TwilioService(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);
