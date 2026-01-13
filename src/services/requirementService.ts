import { config } from '../config/env';
import Telnyx from 'telnyx';

class RequirementService {
  private telnyxClient: any;

  constructor() {
    if (!config.TELNYX_API_KEY) {
      console.warn('⚠️ TELNYX_API_KEY not found. Requirement service may not work.');
      return;
    }
    // Use the same instantiation pattern as phoneNumberSearchService
    this.telnyxClient = new Telnyx({ apiKey: config.TELNYX_API_KEY });
    console.log('✅ Requirement service initialized');
  }

  async getCountryRequirements(countryCode: string): Promise<{
    hasRequirements: boolean;
    requirements?: Array<{
      id: string;
      name: string;
      type: string;
      description?: string;
      example?: string;
      acceptance_criteria?: any;
    }>;
  }> {
    if (!this.telnyxClient) {
      throw new Error('Telnyx client not initialized. Please check TELNYX_API_KEY environment variable.');
    }
    try {
      console.log(`🔍 Fetching requirements for ${countryCode}`);
      const response = await this.telnyxClient.requirements.list({
        filter: {
          country_code: countryCode,
          phone_number_type: 'local',
          action: 'ordering'
        }
      });

      // Vérifier si la réponse contient des requirements
      if (!response.data || !response.data.length) {
        console.log('✅ No requirements found for this country');
        return { hasRequirements: false };
      }

      // Extraire les requirements types
      const requirements = response.data[0].requirement_types.map((req: any) => ({
        id: req.id,
        name: req.name,
        type: req.type,
        description: req.description,
        example: req.example,
        acceptance_criteria: req.acceptance_criteria
      }));

      console.log(`✅ Found ${requirements.length} requirements`);
      return {
        hasRequirements: true,
        requirements
      };
    } catch (error: any) {
      console.error('❌ Error fetching requirements:', error);
      
      // Handle specific errors
      if (error.status === 404 || error.code === 'not_found') {
        return { hasRequirements: false };
      }
      
      throw error;
    }
  }
}

export const requirementService = new RequirementService();