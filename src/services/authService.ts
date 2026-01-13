import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User';
import Timezone from '../models/Timezone';
import twilio from 'twilio';
import { getClientIp } from '../utils/ipHelper';
import ipInfoService from './ipInfoService';
import dbConnect from '../lib/dbConnect';
import { Request } from 'express';
import { config } from '../config/env';

// Lazy initialization of Twilio client - only if credentials are provided
let twilioClient: ReturnType<typeof twilio> | null = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file.');
    }
    if (!config.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      throw new Error(`Invalid Twilio Account SID. It must start with "AC", but got: ${config.TWILIO_ACCOUNT_SID?.substring(0, 10)}...`);
    }
    twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

class AuthService {
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateToken(userId: string) {
    if (!config.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(
      { userId },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  async findTimezone(locationInfo: any) {
    try {
      if (!locationInfo) return null;
      
      // Handle local development case
      if (locationInfo.timezone === 'UTC' && locationInfo.countryCode === 'US' && locationInfo.region === 'Local') {
        // Fallback to a default timezone or try to find by country only
         await dbConnect();
         // Try to find any US timezone or specific one
         const defaultTimezone = await Timezone.findOne({ countryCode: 'US' });
         if (defaultTimezone) return defaultTimezone._id;
         return null; 
      }

      if (!locationInfo.timezone || !locationInfo.countryCode) {
        return null;
      }

      await dbConnect();
      const timezone = await Timezone.findOne({ 
        countryCode: locationInfo.countryCode,
        zoneName: locationInfo.timezone 
      });
      
      if (!timezone) {
        console.warn(`Timezone not found for country: ${locationInfo.countryCode}, zone: ${locationInfo.timezone}`);
        // Fallback: try finding any timezone for this country
        const fallbackTimezone = await Timezone.findOne({ countryCode: locationInfo.countryCode });
        if (fallbackTimezone) return fallbackTimezone._id;
        
        return null;
      }

      return timezone._id;
    } catch (error) {
      console.error('Error in findTimezone:', error);
      return null;
    }
  }

  async enrichIPInfo(ipAddress: string) {
    try {
      if (!ipAddress) {
        console.warn('No IP address provided');
        return null;
      }

      const locationInfo = await ipInfoService.getLocationInfo(ipAddress);
      
      if (!locationInfo) {
        console.warn('Unable to get location info for IP:', ipAddress);
        return null;
      }

      const timezoneId = await this.findTimezone(locationInfo);

      // We continue even if timezoneId is null, to store other location info
      if (!timezoneId) {
        console.warn('Unable to find timezone for:', locationInfo);
      }

      return {
        region: locationInfo.region || null,
        city: locationInfo.city || null,
        isp: locationInfo.isp || null,
        postal: locationInfo.postal || null,
        coordinates: locationInfo.coordinates || null,
        location: timezoneId // This can be null, which is fine as it's optional in schema (required: false)
      };
    } catch (error) {
      console.error('Error enriching IP info:', error);
      return null;
    }
  }

  async register(userData: any, req: Request) {
    await dbConnect();
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.warn("Email already registered");
      throw new Error('Email already registered');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = new Date();
    verificationExpiry.setMinutes(verificationExpiry.getMinutes() + 10);
    
    const clientIp = getClientIp(req);
    const locationInfo = await this.enrichIPInfo(clientIp);
    
    const result = await User.create({
      ...userData,
      verificationCode: {
        code: verificationCode,
        expiresAt: verificationExpiry
      },
      ipHistory: [{
        ip: clientIp,
        action: 'register',
        ...(locationInfo && { locationInfo: locationInfo })
      }]
    });

    return { verificationCode, result };
  }

  async login(email: string, password: string, req: Request) {
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = new Date();
    verificationExpiry.setMinutes(verificationExpiry.getMinutes() + 10);
    
    const clientIp = getClientIp(req);
    const locationInfo = await this.enrichIPInfo(clientIp);
    
    await User.findByIdAndUpdate(user._id, {
      verificationCode: {
        code: verificationCode,
        expiresAt: verificationExpiry
      },
      firstTime: false,
      $push: {
        ipHistory: {
          ip: clientIp,
          action: 'login',
          ...(locationInfo && { locationInfo: locationInfo })
        }
      }
    });

    return { verificationCode };
  }

  async verifyEmail(email: string, code: string) {
    try {
      await dbConnect();
      const user = await User.findOne({ email });
  
      if (!user) {
        throw new Error('User not found');
      }
  
      if (
        !user.verificationCode ||
        user.verificationCode.code !== code ||
        !user.verificationCode.expiresAt ||
        new Date(user.verificationCode.expiresAt) < new Date()
      ) {
        return { error: true, message: 'invalid or expired code. Please try again.' };
      }
  
      await User.findByIdAndUpdate(user._id, {
        $unset: { verificationCode: 1 }
      });
  
      return { token: this.generateToken(user._id.toString()) };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify email');
    }
  }

  async linkedInAuth(code: string) {
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/linkedin/callback`
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = profileResponse.data;
    await dbConnect();
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        fullName: profile.name,
        email: profile.email,
        isVerified: profile.email_verified,
        linkedInId: profile.sub
      });
    }

    return { token: this.generateToken(user._id.toString()), user };
  }

  async sendOTPWithTwilio(userId: string, phoneNumber: string) {
    try {
      await dbConnect();
      const otp = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(Date.now() + 300000);

      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'verificationCode.otp': otp,
            'verificationCode.otpExpiresAt': expiresAt,
          },
        },
        { upsert: true, new: true }
      );

      const client = getTwilioClient();
      await client.messages.create({
        body: `Your OTP code is: ${otp}`,
        to: phoneNumber,
        from: config.TWILIO_PHONE_NUMBER,
      });  
      return { success: true, message: 'OTP sent successfully' };
      
    } catch (error) {
      console.error('Error in sendOTPWithTwilio:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOTPTwilio(userId: string, enteredOtp: string) {
    try {
      await dbConnect();
      const user = await User.findById(userId);

      if (!user || !user.verificationCode) {
        throw new Error('User not found or OTP not generated');
      }

      const { otp, otpExpiresAt } = user.verificationCode;

      if (!otpExpiresAt || new Date() > new Date(otpExpiresAt)) {
        throw new Error('OTP has expired. Please request a new one.');
      }
      if (String(otp) === String(enteredOtp)) {
        await User.findByIdAndUpdate(
          user._id,
          {
            $unset: {
                'verificationCode.otp': 1,
                'verificationCode.otpExpiresAt': 1
            }
          },
          { new: true }
        );
        return { success: true, message: 'OTP verified successfully' };
      } else {
        return { error: true, message: 'Invalid OTP. Please try again.' };
      }
    } catch (error: any) {
      console.error('Error in verifyOTPTwilio:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  async verifyAccount(userId: string) {
    try {
      await dbConnect();
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        return { success: true, message: 'Account is already verified' };
      }

      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            isVerified: true,
          },
        },
        { new: true }
      );
      return { success: true, message: 'Account verified successfully' };
    } catch (error) {
      console.error('Error in verifyAccount:', error);
      throw new Error('Failed to verify account');
    }
  }
  
  async generateVerificationCodeForRecovery(email: string) {
    await dbConnect();
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error('Email not registered');
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date();
    verificationExpiry.setMinutes(verificationExpiry.getMinutes() + 10);

   const result = await User.findByIdAndUpdate(existingUser._id,
    {
      $set: {
        'verificationCode.code' : verificationCode,
        'verificationCode.expiresAt' :verificationExpiry,
      },
    },
    { upsert: true, new: true });

    return { verificationCode , result};
  }

  async changePassword(email: string, newPassword: string){
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Utilisateur non trouvé.');
    }

    user.password = newPassword; 
    await user.save();

    return { success: true, message: 'Mot de passe changé avec succès.' };
  }

  async linkedinSignIn(code: string){
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/linkedin/signin/callback`;

    const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
      params: {
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { sub, name, email, email_verified } = profileResponse.data;

    await dbConnect();
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        fullName: name,
        email,
        linkedInId: sub,
        isVerified: email_verified,
      });
      await user.save();
    }

    if (!config.JWT_SECRET) {
         throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "7d" });

    return { token, user }; 
  }

  async sendVerificationEmail(email: string, code: string) {
    // Mode développement: si DISABLE_EMAIL_SENDING est activé, on skip l'envoi d'email
    if (config.DISABLE_EMAIL_SENDING || (config.NODE_ENV === 'development' && !config.BREVO_API_KEY)) {
      console.log('📧 [DEV MODE] Email sending disabled. Verification code:', code);
      console.log('📧 [DEV MODE] For email:', email);
      return { 
        success: true, 
        message: 'Verification code generated (email sending disabled in dev mode)', 
        code: code,
        devMode: true
      };
    }

    // Si BREVO_API_KEY n'est pas défini en production, erreur
    if (!config.BREVO_API_KEY && config.NODE_ENV === 'production') {
      throw new Error('🚨 BREVO_API_KEY is missing in production!');
    }

    // Si pas de BREVO_API_KEY en développement, on utilise le mode dev
    if (!config.BREVO_API_KEY) {
      console.log('📧 [DEV MODE] BREVO_API_KEY not set. Verification code:', code);
      return { 
        success: true, 
        message: 'Verification code generated (email sending disabled - no API key)', 
        code: code,
        devMode: true
      };
    }

    try {
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: {
          name: config.SMTP_SENDER_NAME,
          email: config.BREVO_FROM_EMAIL
        },
        to: [{
          email: email,
          name: email.split('@')[0]
        }],
        subject: 'Email Verification',
        htmlContent: `
          <h1>Email Verification</h1>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      }, {
        headers: {
          'api-key': config.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No response data from Brevo API');
      }

      return { success: true, message: 'Verification email sent successfully', data: response.data };
    } catch (error: any) {
      console.error('Error sending verification email:', error.response?.data || error.message);
      
      // En développement, si Brevo échoue, on retourne le code quand même
      if (config.NODE_ENV === 'development') {
        console.log('📧 [DEV MODE] Brevo failed, but returning code for development:', code);
        console.log('📧 [DEV MODE] Error details:', error.response?.data || error.message);
        return { 
          success: false, 
          message: 'Email sending failed, but code available for development', 
          code: code,
          devMode: true,
          error: error.response?.data?.message || error.message
        };
      }
      
      // Preserve Brevo error details for better error handling
      const brevoError = error.response?.data;
      if (brevoError?.code === 'unauthorized' || brevoError?.message?.includes('unrecognised IP address')) {
        const errorWithDetails = new Error(brevoError.message || 'Brevo IP whitelist error');
        (errorWithDetails as any).code = brevoError.code;
        (errorWithDetails as any).helpUrl = 'https://app.brevo.com/security/authorised_ips';
        throw errorWithDetails;
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to send verification email');
    }
  }

  async checkFirstLogin(userId: string) {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return { isFirstLogin: user.firstTime };
  }

  async changeUserType(userId: string, newType: string) {
    try {
      await dbConnect();
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      user.typeUser = newType;
      await user.save();

      return { success: true, message: `User type changed to ${newType}` };
    } catch (error) {
      console.error('Error changing user type:', error);
      throw new Error('Failed to change user type');
    }
  }

  async checkUserType(userId: string) {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { userType: user.typeUser };
  }
}

export default new AuthService();
