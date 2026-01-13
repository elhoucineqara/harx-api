import { Request, Response } from 'express';
import { addressService } from '../services/addressService';

export const addressController = {
  async createAddress(req: Request, res: Response) {
    try {
      const {
        businessName,
        streetAddress,
        locality,
        postalCode,
        countryCode,
        extendedAddress,
        administrativeArea,
        customerReference
      } = req.body;

      // Validation des champs requis
      const requiredFields = ['businessName', 'streetAddress', 'locality', 'postalCode', 'countryCode'];
      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validation du code pays
      if (countryCode.length !== 2) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Country code must be a 2-letter ISO code'
        });
      }

      const address = await addressService.createBusinessAddress({
        businessName,
        streetAddress,
        locality,
        postalCode,
        countryCode,
        extendedAddress,
        administrativeArea,
        customerReference
      });

      res.status(201).json(address);
    } catch (error: any) {
      console.error('Error in createAddress:', error);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error response status:', error.response?.status);
      
      // Gestion spécifique des erreurs Telnyx
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        console.log('📋 Telnyx errors array:', JSON.stringify(error.response.data.errors, null, 2));
        
        const errorMessages = error.response.data.errors
          .map((e: any) => {
            // Extraire le message d'erreur de différentes propriétés possibles
            // Ignorer les valeurs qui ressemblent à des champs d'adresse ou des suggestions
            console.log('📝 Error object:', JSON.stringify(e, null, 2));
            
            // Essayer d'extraire le message d'erreur de différentes propriétés
            // Priorité: source (si c'est un message d'erreur), detail, title, message
            let errorMessage = '';
            
            // Si source existe et contient un message d'erreur valide
            if (e.source && typeof e.source === 'object' && e.source.pointer) {
              // source.pointer indique quel champ a l'erreur, mais pas le message
              // On l'utilise seulement pour contexte
            }
            
            // Essayer detail d'abord
            if (e.detail && typeof e.detail === 'string') {
              const detail = e.detail.trim();
              
              // Ignorer si ça ressemble à une concaténation de champs d'adresse
              if (detail.includes('Suggestion') || 
                  detail.split(',').length > 3 || 
                  detail.includes(', ,') ||
                  detail.match(/^[A-Za-z\s-]+,\s*(Suggestion|,)/)) {
                console.log('⚠️ Ignoring detail that looks like concatenated address data:', detail);
              } else {
                // Vérifier si c'est un vrai message d'erreur
                const errorKeywords = ['invalid', 'required', 'missing', 'error', 'must', 'cannot', 'should', 'not found', 'does not'];
                const lowerDetail = detail.toLowerCase();
                const hasErrorKeywords = errorKeywords.some(keyword => lowerDetail.includes(keyword));
                
                if (hasErrorKeywords || detail.length <= 100) {
                  errorMessage = detail;
                } else {
                  console.log('⚠️ Ignoring detail that looks like concatenated data (no error keywords, too long):', detail);
                }
              }
            }
            
            // Si on n'a pas trouvé de message valide dans detail, essayer title
            if (!errorMessage && e.title && typeof e.title === 'string') {
              const title = e.title.trim();
              if (title.length > 0 && title.length < 200) {
                errorMessage = title;
              }
            }
            
            // Si on n'a toujours pas de message, essayer message
            if (!errorMessage && e.message && typeof e.message === 'string') {
              const message = e.message.trim();
              if (message.length > 0 && message.length < 200) {
                errorMessage = message;
              }
            }
            
            console.log('📝 Extracted error message:', errorMessage);
            return errorMessage;
          })
          .filter((msg: any) => msg && typeof msg === 'string' && msg.trim().length > 0);
        
        console.log('📋 Filtered error messages:', errorMessages);
        
        if (!errorMessages || errorMessages.length === 0) {
          // Fallback si aucun message d'erreur valide n'est trouvé
          console.log('⚠️ No valid error messages found, using fallback');
          return res.status(error.response.status || 400).json({
            error: 'Telnyx API Error',
            message: 'Invalid address format. Please check that all address fields are correct and match the selected country.'
          });
        }
        
        const combinedMessage = errorMessages.join('. ');
        console.log('📋 Combined error message:', combinedMessage);
        
        // Améliorer le message d'erreur selon le type d'erreur
        let enhancedMessage = combinedMessage;
        const countryCode = req.body.countryCode?.toUpperCase();
        
        if (combinedMessage.includes('Invalid address')) {
          enhancedMessage += ` The address provided does not match the selected country (${countryCode || 'unknown'}). Please ensure the city, postal code, and administrative area are valid for ${countryCode || 'the selected country'}.`;
        } else if (combinedMessage.includes('locality') || combinedMessage.includes('administrative area')) {
          if (countryCode === 'FR') {
            enhancedMessage += ' For France, please use the official French city name and department/region name (not codes).';
          } else {
            enhancedMessage += ` Please ensure the address is valid for ${countryCode || 'the selected country'}. Use official city names and administrative area names.`;
          }
        }
        
        console.log('📋 Final enhanced message:', enhancedMessage);
        
        return res.status(error.response.status || 400).json({
          error: 'Telnyx API Error',
          message: enhancedMessage
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to create address'
      });
    }
  },

  async getAddress(req: Request, res: Response) {
    try {
      const { addressId } = req.params;

      if (!addressId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Address ID is required'
        });
      }

      const address = await addressService.retrieveAddress(addressId);
      res.json(address);
    } catch (error: any) {
      console.error('Error in getAddress:', error);

      if (error.response?.status === 404) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Address not found'
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to retrieve address'
      });
    }
  }
};