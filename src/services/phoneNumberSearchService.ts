import { config } from '../config/env';
import twilio from 'twilio';
import Telnyx from 'telnyx';
import PhoneNumber from '../models/PhoneNumber';
import mongoose from 'mongoose';

interface AvailablePhoneNumber {
  phoneNumber: string;
  friendlyName?: string;
  locality?: string;
  region?: string;
  isoCountry?: string;
  capabilities?: {
    voice?: boolean;
    SMS?: boolean;
    MMS?: boolean;
  };
  provider: string;
  countryCode: string;
  monthlyFee?: number;
}

class PhoneNumberSearchService {
  private twilioClient: twilio.Twilio | null = null;
  private telnyxClient: any | null = null;

  constructor() {
    // Initialize Twilio client if credentials are available
    if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
      // Validate Account SID format
      if (!config.TWILIO_ACCOUNT_SID.startsWith('AC')) {
        console.error(`❌ Invalid Twilio Account SID format. It must start with "AC", but got: ${config.TWILIO_ACCOUNT_SID?.substring(0, 10)}...`);
        console.warn('⚠️ Twilio client not initialized due to invalid Account SID format.');
        return;
      }
      
      // Validate credentials are not empty strings
      if (config.TWILIO_ACCOUNT_SID.trim() === '' || config.TWILIO_AUTH_TOKEN.trim() === '') {
        console.error('❌ Twilio credentials are empty strings.');
        console.warn('⚠️ Twilio client not initialized due to empty credentials.');
        return;
      }
      
      // Debug: Log credential info (without exposing full values)
      console.log('🔍 Twilio credentials check:');
      console.log(`  - Account SID present: ${!!config.TWILIO_ACCOUNT_SID}`);
      console.log(`  - Account SID format: ${config.TWILIO_ACCOUNT_SID.substring(0, 2)}...${config.TWILIO_ACCOUNT_SID.substring(config.TWILIO_ACCOUNT_SID.length - 4)} (length: ${config.TWILIO_ACCOUNT_SID.length})`);
      console.log(`  - Auth Token present: ${!!config.TWILIO_AUTH_TOKEN}`);
      console.log(`  - Auth Token length: ${config.TWILIO_AUTH_TOKEN.length}`);
      
      this.twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
      console.log('✅ Twilio client initialized');
    } else {
      console.warn('⚠️ Twilio credentials not found. Twilio search will not work.');
      if (!config.TWILIO_ACCOUNT_SID) {
        console.warn('  - TWILIO_ACCOUNT_SID is missing');
      }
      if (!config.TWILIO_AUTH_TOKEN) {
        console.warn('  - TWILIO_AUTH_TOKEN is missing');
      }
    }

    // Initialize Telnyx client if API key is available
    if (config.TELNYX_API_KEY) {
      // Telnyx must be instantiated with 'new' and an options object
      this.telnyxClient = new Telnyx({ apiKey: config.TELNYX_API_KEY });
      console.log('✅ Telnyx client initialized');
    } else {
      console.warn('⚠️ Telnyx API key not found. Telnyx search will not work.');
    }
  }

  async searchTwilioNumbers(countryCode: string, limit: number = 10): Promise<AvailablePhoneNumber[]> {
    if (!this.twilioClient) {
      const missingVars = [];
      if (!config.TWILIO_ACCOUNT_SID) missingVars.push('TWILIO_ACCOUNT_SID');
      if (!config.TWILIO_AUTH_TOKEN) missingVars.push('TWILIO_AUTH_TOKEN');
      
      throw new Error(
        `Twilio client not initialized. Missing environment variables: ${missingVars.join(', ')}. ` +
        `Please check your .env file or environment configuration.`
      );
    }

    try {
      console.log(`🔍 Searching Twilio numbers for country: ${countryCode}`);
      
      // Directly attempt to search numbers - Twilio API will return auth error if credentials are invalid
      // Note: voice: true is used in v25_comporchestrator_back, but TypeScript types may not support it
      // We'll try without it first, and if needed, we can add it with type assertion
      const searchOptions: any = {
        limit,
        excludeAllAddressRequired: true
      };
      
      // Try to add voice option if supported (matching v25_comporchestrator_back implementation)
      // This may cause TypeScript errors but works at runtime
      try {
        searchOptions.voice = true;
      } catch (e) {
        // Ignore if not supported
      }

      const numbers = await this.twilioClient.availablePhoneNumbers(countryCode)
        .local
        .list(searchOptions);

      console.log(`✅ Found ${numbers.length} Twilio numbers`);

      return numbers.map(number => ({
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        locality: number.locality,
        region: number.region,
        isoCountry: number.isoCountry,
        capabilities: {
          voice: number.capabilities.voice,
          // Match v25_comporchestrator_back format - use uppercase for consistency
          SMS: number.capabilities.sms ?? (number.capabilities as any).SMS ?? false,
          MMS: number.capabilities.mms ?? (number.capabilities as any).MMS ?? false
        },
        provider: 'twilio',
        countryCode: number.isoCountry || countryCode
      }));
    } catch (error: any) {
      console.error('❌ Error searching Twilio numbers:', error);
      
      // Provide more helpful error messages
      if (error.status === 401 || error.code === 20003) {
        throw new Error(
          `Twilio authentication failed (401). Please verify your credentials are correct and not expired. ` +
          `Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file.`
        );
      }
      
      throw new Error(`Failed to search Twilio numbers: ${error.message}`);
    }
  }

  async searchTelnyxNumbers(countryCode: string, limit: number = 10): Promise<AvailablePhoneNumber[]> {
    if (!this.telnyxClient) {
      throw new Error('Telnyx client not initialized. Please check TELNYX_API_KEY environment variable.');
    }

    try {
      console.log(`🔍 Searching Telnyx numbers for country: ${countryCode}`);
      
      // Telnyx API for searching available phone numbers
      const response = await this.telnyxClient.availablePhoneNumbers.list({
        filter: {
          country_code: countryCode,
          phone_number_type: 'local'
        },
        page: {
          size: limit
        }
      });

      console.log(`✅ Found ${response.data?.length || 0} Telnyx numbers`);

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((number: any) => ({
        phoneNumber: number.phone_number,
        friendlyName: number.phone_number,
        locality: number.region_information?.region_name,
        region: number.region_information?.region_name,
        isoCountry: number.country_code,
        capabilities: {
          voice: number.features?.voice_enabled || false,
          SMS: number.features?.sms_enabled || false,
          MMS: number.features?.mms_enabled || false
        },
        provider: 'telnyx',
        countryCode: number.country_code || countryCode,
        monthlyFee: number.cost_information?.monthly_cost || undefined
      }));
    } catch (error: any) {
      console.error('❌ Error searching Telnyx numbers:', error);
      throw new Error(`Failed to search Telnyx numbers: ${error.message}`);
    }
  }

  async purchaseNumber(
    phoneNumber: string,
    provider: 'telnyx' | 'twilio',
    gigId: string,
    requirementGroupId: string | undefined,
    companyId: string
  ) {
    if (!gigId || !companyId) {
      throw new Error('gigId and companyId are required to purchase a number');
    }

    if (provider === 'telnyx' && !requirementGroupId) {
      throw new Error('requirementGroupId is required for Telnyx numbers');
    }

    try {
      if (provider === 'telnyx') {
        return await this.purchaseTelnyxNumber(phoneNumber, gigId, requirementGroupId!, companyId);
      } else if (provider === 'twilio') {
        return await this.purchaseTwilioNumber(phoneNumber, gigId, companyId);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error: any) {
      console.error('❌ Error purchasing number:', error);
      
      // Handle specific Telnyx errors
      if (error.raw) {
        switch (error.raw.code) {
          case 'number_already_registered':
            throw new Error('This number already exists in your account');
          case 'insufficient_funds':
            throw new Error('Insufficient balance to purchase this number');
          case 'number_not_available':
            throw new Error('This number is no longer available');
          default:
            throw new Error(error.raw.message || 'Failed to purchase number');
        }
      }
      
      throw error;
    }
  }

  async purchaseTelnyxNumber(
    phoneNumber: string,
    gigId: string,
    requirementGroupId: string,
    companyId: string
  ) {
    if (!this.telnyxClient) {
      throw new Error('Telnyx client not initialized. Please check TELNYX_API_KEY environment variable.');
    }

    try {
      console.log(`🛒 Purchasing Telnyx number: ${phoneNumber} for gig: ${gigId}`);
      
      // 1. Créer la commande avec le requirement group
      const orderData = {
        phone_numbers: [
          {
            phone_number: phoneNumber,
            requirement_group_id: requirementGroupId
          }
        ]
      };

      // 2. Envoyer la commande à Telnyx
      const response = await this.telnyxClient.numberOrders.create(orderData);
      console.log('📝 Telnyx response:', response.data);

      if (!response.data) {
        throw new Error('Invalid response from Telnyx');
      }

      // 3. Vérifier si le numéro existe déjà dans la base de données
      let existingPhoneNumber = await PhoneNumber.findOne({ phoneNumber });
      
      if (existingPhoneNumber) {
        console.log('⚠️ Phone number already exists in database:', existingPhoneNumber._id);
        
        // Mettre à jour le numéro existant avec les nouvelles informations
        existingPhoneNumber.gigId = new mongoose.Types.ObjectId(gigId);
        existingPhoneNumber.companyId = new mongoose.Types.ObjectId(companyId);
        existingPhoneNumber.status = response.data.status || existingPhoneNumber.status || 'pending';
        existingPhoneNumber.orderId = response.data.id || existingPhoneNumber.orderId;
        existingPhoneNumber.telnyxId = response.data.phone_numbers?.[0]?.id || existingPhoneNumber.telnyxId;
        existingPhoneNumber.provider = 'telnyx';
        
        await existingPhoneNumber.save();
        console.log('✅ Existing phone number updated:', existingPhoneNumber._id);
        
        return {
          phoneNumber: existingPhoneNumber.phoneNumber,
          status: existingPhoneNumber.status,
          features: existingPhoneNumber.features,
          provider: existingPhoneNumber.provider,
          orderId: existingPhoneNumber.orderId,
          gigId: existingPhoneNumber.gigId,
          companyId: existingPhoneNumber.companyId,
          telnyxId: existingPhoneNumber.telnyxId,
          _id: existingPhoneNumber._id
        };
      }

      // 4. Sauvegarder en DB avec le statut Telnyx
      const phoneNumberData = {
        phoneNumber: phoneNumber,
        provider: 'telnyx' as const,
        status: response.data.status || 'pending',
        gigId: new mongoose.Types.ObjectId(gigId),
        companyId: new mongoose.Types.ObjectId(companyId),
        orderId: response.data.id,
        telnyxId: response.data.phone_numbers?.[0]?.id,
        features: {
          voice: false,
          sms: false,
          mms: false
        }
      };

      const newPhoneNumber = new PhoneNumber(phoneNumberData);
      await newPhoneNumber.save();

      console.log('✅ Telnyx number purchased and saved:', newPhoneNumber._id);
      
      // 4. Retourner les données formatées
      return {
        phoneNumber: newPhoneNumber.phoneNumber,
        status: newPhoneNumber.status,
        features: newPhoneNumber.features,
        provider: newPhoneNumber.provider,
        orderId: newPhoneNumber.orderId,
        gigId: newPhoneNumber.gigId,
        companyId: newPhoneNumber.companyId
      };
    } catch (error: any) {
      console.error('❌ Error purchasing Telnyx number:', error);
      
      // Handle duplicate key error gracefully
      if (error.code === 11000 || error.message?.includes('duplicate key')) {
        console.log('⚠️ Duplicate key error, attempting to find existing number');
        const existingNumber = await PhoneNumber.findOne({ phoneNumber });
        if (existingNumber) {
          // Update existing number
          existingNumber.gigId = new mongoose.Types.ObjectId(gigId);
          existingNumber.companyId = new mongoose.Types.ObjectId(companyId);
          existingNumber.status = existingNumber.status || 'pending';
          existingNumber.provider = 'telnyx';
          await existingNumber.save();
          
          return {
            phoneNumber: existingNumber.phoneNumber,
            status: existingNumber.status,
            features: existingNumber.features,
            provider: existingNumber.provider,
            orderId: existingNumber.orderId,
            gigId: existingNumber.gigId,
            companyId: existingNumber.companyId,
            telnyxId: existingNumber.telnyxId,
            _id: existingNumber._id
          };
        }
      }
      
      throw error;
    }
  }

  async purchaseTwilioNumber(
    phoneNumber: string,
    gigId: string,
    companyId: string
  ) {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
    }

    try {
      console.log(`🛒 Purchasing Twilio number: ${phoneNumber} for gig: ${gigId}`);
      
      // Purchase number through Twilio
      const purchasedNumber = await this.twilioClient.incomingPhoneNumbers.create({
        phoneNumber: phoneNumber,
        friendlyName: `Gig ${gigId}: ${phoneNumber}`
      });

      console.log('📝 Twilio purchase response:', purchasedNumber);

      // Vérifier si le numéro existe déjà dans la base de données
      let existingPhoneNumber = await PhoneNumber.findOne({ phoneNumber: purchasedNumber.phoneNumber });
      
      if (existingPhoneNumber) {
        console.log('⚠️ Phone number already exists in database:', existingPhoneNumber._id);
        
        // Mettre à jour le numéro existant avec les nouvelles informations
        existingPhoneNumber.gigId = new mongoose.Types.ObjectId(gigId);
        existingPhoneNumber.companyId = new mongoose.Types.ObjectId(companyId);
        existingPhoneNumber.status = 'active';
        existingPhoneNumber.twilioId = purchasedNumber.sid || existingPhoneNumber.twilioId;
        existingPhoneNumber.provider = 'twilio';
        existingPhoneNumber.features = {
          voice: purchasedNumber.capabilities?.voice || false,
          sms: purchasedNumber.capabilities?.sms || false,
          mms: purchasedNumber.capabilities?.mms || false
        };
        
        await existingPhoneNumber.save();
        console.log('✅ Existing phone number updated:', existingPhoneNumber._id);
        
        return {
          phoneNumber: existingPhoneNumber.phoneNumber,
          status: existingPhoneNumber.status,
          features: existingPhoneNumber.features,
          provider: existingPhoneNumber.provider,
          gigId: existingPhoneNumber.gigId,
          companyId: existingPhoneNumber.companyId,
          twilioId: existingPhoneNumber.twilioId,
          _id: existingPhoneNumber._id
        };
      }

      // Create document with the necessary fields for Twilio
      const phoneNumberData = {
        phoneNumber: purchasedNumber.phoneNumber,
        twilioId: purchasedNumber.sid,
        provider: 'twilio' as const,
        status: 'active',
        gigId: new mongoose.Types.ObjectId(gigId),
        companyId: new mongoose.Types.ObjectId(companyId),
        features: {
          voice: purchasedNumber.capabilities?.voice || false,
          sms: purchasedNumber.capabilities?.sms || false,
          mms: purchasedNumber.capabilities?.mms || false
        }
      };

      // Save to database
      const newPhoneNumber = new PhoneNumber(phoneNumberData);
      await newPhoneNumber.save();
      
      console.log('✅ Twilio number purchased and saved:', newPhoneNumber._id);
      
      return {
        phoneNumber: newPhoneNumber.phoneNumber,
        status: newPhoneNumber.status,
        features: newPhoneNumber.features,
        provider: newPhoneNumber.provider,
        twilioId: newPhoneNumber.twilioId,
        gigId: newPhoneNumber.gigId,
        companyId: newPhoneNumber.companyId
      };
    } catch (error: any) {
      console.error('❌ Error purchasing Twilio number:', error);
      
      // Handle duplicate key error gracefully
      if (error.code === 11000 || error.message?.includes('duplicate key')) {
        console.log('⚠️ Duplicate key error, attempting to find existing number');
        const existingNumber = await PhoneNumber.findOne({ phoneNumber });
        if (existingNumber) {
          // Update existing number
          existingNumber.gigId = new mongoose.Types.ObjectId(gigId);
          existingNumber.companyId = new mongoose.Types.ObjectId(companyId);
          existingNumber.status = 'active';
          existingNumber.provider = 'twilio';
          await existingNumber.save();
          
          return {
            phoneNumber: existingNumber.phoneNumber,
            status: existingNumber.status,
            features: existingNumber.features,
            provider: existingNumber.provider,
            gigId: existingNumber.gigId,
            companyId: existingNumber.companyId,
            twilioId: existingNumber.twilioId,
            _id: existingNumber._id
          };
        }
      }
      
      // Handle specific Twilio errors
      if (error.status === 401 || error.code === 20003) {
        throw new Error('Twilio authentication failed. Please verify your credentials.');
      }
      
      if (error.code === 21211) {
        throw new Error('This phone number is not available for purchase');
      }
      
      if (error.code === 21217) {
        throw new Error('This phone number is already in use');
      }
      
      throw new Error(`Failed to purchase Twilio number: ${error.message}`);
    }
  }
}

export const phoneNumberSearchService = new PhoneNumberSearchService();

