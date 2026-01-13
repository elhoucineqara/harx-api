import { config } from '../config/env';
import axios from 'axios';

class AddressService {
  axiosInstance: any;
  constructor() {
    if (!config.telnyxApiKey) {
      throw new Error('TELNYX_API_KEY is not defined');
    }
    
    this.axiosInstance = axios.create({
      baseURL: 'https://api.telnyx.com/v2',
      headers: {
        'Authorization': `Bearer ${config.telnyxApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async createBusinessAddress({
    businessName,
    streetAddress,
    locality,
    postalCode,
    countryCode,
    extendedAddress = null,
    administrativeArea = null,
    customerReference = null
  }) {
    try {
      console.log('📍 Creating Telnyx business address:', {
        businessName,
        streetAddress,
        locality,
        postalCode,
        countryCode
      });

      const addressData: any = {
        business_name: businessName,
        street_address: streetAddress,
        locality,
        postal_code: postalCode,
        country_code: countryCode.toUpperCase()
      };

      // Ajouter les champs optionnels s'ils sont fournis
      if (extendedAddress) {
        addressData.extended_address = extendedAddress;
      }
      
      // Pour la France, l'administrative_area doit être le nom du département ou de la région
      // Ne pas envoyer si c'est un code invalide (comme "BCVVB")
      if (administrativeArea) {
        // Valider que ce n'est pas un code suspect (trop court ou en majuscules seulement)
        // Pour la France, on accepte si c'est un nom de département/région valide
        if (countryCode.toUpperCase() === 'FR') {
          // Si c'est un code de 5 caractères en majuscules, c'est probablement invalide
          // On ne l'envoie pas pour éviter les erreurs Telnyx
          if (administrativeArea.length <= 5 && administrativeArea === administrativeArea.toUpperCase() && !administrativeArea.includes(' ')) {
            console.log('⚠️ Skipping administrative_area for France (looks like invalid code):', administrativeArea);
          } else {
            addressData.administrative_area = administrativeArea;
          }
        } else {
          addressData.administrative_area = administrativeArea;
        }
      }

      // Ajouter customer_reference seulement s'il est fourni
      if (customerReference) {
        addressData.customer_reference = customerReference;
      }

      console.log('📤 Sending address data to Telnyx:', JSON.stringify(addressData, null, 2));
      
      const response = await this.axiosInstance.post('/addresses', addressData);
      
      console.log('✅ Telnyx address created:', response.data.data);
      
      return {
        id: response.data.data.id,
        businessName: response.data.data.business_name,
        streetAddress: response.data.data.street_address,
        extendedAddress: response.data.data.extended_address,
        locality: response.data.data.locality,
        administrativeArea: response.data.data.administrative_area,
        postalCode: response.data.data.postal_code,
        countryCode: response.data.data.country_code,
        customerReference: response.data.data.customer_reference,
        recordType: response.data.data.record_type,
        createdAt: response.data.data.created_at
      };
    } catch (error: any) {
      console.error('❌ Error creating Telnyx address:', error.response?.data || error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        errors: error.response?.data?.errors,
        data: error.response?.data
      });
      throw error;
    }
  }

  async retrieveAddress(addressId) {
    try {
      console.log(`📍 Retrieving Telnyx address: ${addressId}`);
      
      const response = await this.axiosInstance.get(`/addresses/${addressId}`);
      
      console.log('✅ Address retrieved:', response.data.data);
      
      return {
        id: response.data.data.id,
        businessName: response.data.data.business_name,
        streetAddress: response.data.data.street_address,
        extendedAddress: response.data.data.extended_address,
        locality: response.data.data.locality,
        administrativeArea: response.data.data.administrative_area,
        postalCode: response.data.data.postal_code,
        countryCode: response.data.data.country_code,
        customerReference: response.data.data.customer_reference,
        recordType: response.data.data.record_type,
        createdAt: response.data.data.created_at
      };
    } catch (error) {
      console.error(`❌ Error retrieving address ${addressId}:`, error.response?.data || error);
      throw error;
    }
  }
}

export const addressService = new AddressService();