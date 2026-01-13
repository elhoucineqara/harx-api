import { Request, Response } from 'express';
import Gig from '../models/Gig';
import Country from '../models/Country';
import mongoose from 'mongoose';
import { BulkDataProcessor, BulkProcessingOptions } from '../services/BulkDataProcessor';

export class BulkController {
  /**
   * Traitement en bulk de gigs avec validation améliorée
   */
  static async processBulkGigs(req: Request, res: Response) {
    try {
      const { data } = req.body;

      if (!Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: 'Data must be an array',
          validation: {
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            errors: ['Data must be an array']
          }
        });
      }

      console.log(`🚀 Démarrage du traitement bulk de ${data.length} gigs...`);

      const options: BulkProcessingOptions = {
        chunkSize: 25, // Taille réduite pour éviter les timeouts
        maxRetries: 3,
        validateFunction: (item: any) => {
          // Validation personnalisée plus stricte
          const errors: string[] = [];

          if (!item) {
            errors.push('Item is null or undefined');
            return { isValid: false, errors };
          }

          // Validation des champs requis
          if (!item.title || typeof item.title !== 'string' || item.title.trim().length === 0) {
            errors.push('Title is required and must be a non-empty string');
          }

          if (!item.description || typeof item.description !== 'string' || item.description.trim().length === 0) {
            errors.push('Description is required and must be a non-empty string');
          }

          // Validation des ObjectIds avec vérification d'existence
          if (item.userId && !mongoose.Types.ObjectId.isValid(item.userId)) {
            errors.push('userId must be a valid MongoDB ObjectId');
          }

          if (item.companyId && !mongoose.Types.ObjectId.isValid(item.companyId)) {
            errors.push('companyId must be a valid MongoDB ObjectId');
          }

          if (item.destination_zone && !mongoose.Types.ObjectId.isValid(item.destination_zone)) {
            errors.push('destination_zone must be a valid MongoDB ObjectId');
          }

          // Validation des tableaux
          if (item.activities) {
            if (!Array.isArray(item.activities)) {
              errors.push('activities must be an array');
            } else {
              // Vérifier que tous les éléments sont des ObjectIds valides
              const invalidActivities = item.activities.filter((id: any) => !mongoose.Types.ObjectId.isValid(id));
              if (invalidActivities.length > 0) {
                errors.push(`${invalidActivities.length} invalid activity ObjectIds found`);
              }
            }
          }

          if (item.industries) {
            if (!Array.isArray(item.industries)) {
              errors.push('industries must be an array');
            } else {
              const invalidIndustries = item.industries.filter((id: any) => !mongoose.Types.ObjectId.isValid(id));
              if (invalidIndustries.length > 0) {
                errors.push(`${invalidIndustries.length} invalid industry ObjectIds found`);
              }
            }
          }

          // Validation du statut
          if (item.status && !['to_activate', 'active', 'inactive', 'archived'].includes(item.status)) {
            errors.push('status must be one of: to_activate, active, inactive, archived');
          }

          return {
            isValid: errors.length === 0,
            errors
          };
        },
        processFunction: async (chunk: any[]) => {
          // Traitement par chunk avec gestion d'erreurs
          try {
            const result = await Gig.insertMany(chunk, { 
              ordered: false, // Continue même si certains échouent
              rawResult: true 
            });
            console.log(`✅ Chunk traité: ${result.insertedCount} gigs insérés`);
            return result;
          } catch (error: any) {
            if (error.name === 'BulkWriteError') {
              console.log(`⚠️  Chunk partiellement traité: ${error.result.insertedCount} réussis, ${error.writeErrors.length} erreurs`);
              // Ne pas lancer d'erreur pour les erreurs partielles
              return error.result;
            }
            throw error;
          }
        }
      };

      const result = await BulkDataProcessor.processBulkData(data, options);

      // Calculer les statistiques finales
      const totalInDatabase = await Gig.countDocuments();

      const response = {
        success: true,
        validation: result.validation,
        processing: result.processing,
        statistics: {
          totalInDatabase,
          successRate: result.validation.totalRows > 0 
            ? Math.round((result.processing.processed / result.validation.totalRows) * 100) 
            : 0
        },
        message: `Bulk processing completed: ${result.processing.processed}/${result.validation.totalRows} rows processed successfully`
      };

      // Déterminer le code de statut approprié
      const statusCode = result.processing.chunks.failed > 0 ? 207 : 200; // 207 Multi-Status si des échecs

      res.status(statusCode).json(response);

    } catch (error: any) {
      console.error('Error in bulk gig processing:', error);
      res.status(500).json({
        success: false,
        error: 'Bulk processing failed',
        message: error.message,
        validation: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          errors: [error.message]
        }
      });
    }
  }

  /**
   * Traitement en bulk de pays avec validation améliorée
   */
  static async processBulkCountries(req: Request, res: Response) {
    try {
      const { countries } = req.body;

      if (!Array.isArray(countries)) {
        return res.status(400).json({
          success: false,
          error: 'Countries data must be an array',
          validation: {
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            errors: ['Countries data must be an array']
          }
        });
      }

      console.log(`🚀 Démarrage du traitement bulk de ${countries.length} pays...`);

      const options: BulkProcessingOptions = {
        chunkSize: 50, // Plus grand pour les pays car ils sont plus simples
        maxRetries: 3,
        validateFunction: (item: any) => {
          const errors: string[] = [];

          if (!item) {
            errors.push('Item is null or undefined');
            return { isValid: false, errors };
          }

          if (!item.name || !item.name.common || !item.name.official) {
            errors.push('Missing required name fields (common, official)');
          }

          if (!item.cca2 || typeof item.cca2 !== 'string' || item.cca2.length !== 2) {
            errors.push('cca2 must be a 2-character country code');
          }

          return {
            isValid: errors.length === 0,
            errors
          };
        },
        processFunction: async (chunk: any[]) => {
          // Normaliser les données avant insertion
          const normalizedChunk = chunk.map(country => ({
            ...country,
            cca2: country.cca2.toUpperCase()
          }));

          try {
            const result = await Country.insertMany(normalizedChunk, { 
              ordered: false,
              rawResult: true 
            });
            console.log(`✅ Chunk traité: ${result.insertedCount} pays insérés`);
            return result;
          } catch (error: any) {
            if (error.name === 'BulkWriteError') {
              console.log(`⚠️  Chunk partiellement traité: ${error.result.insertedCount} réussis, ${error.writeErrors.length} erreurs`);
              return error.result;
            }
            throw error;
          }
        }
      };

      const result = await BulkDataProcessor.processBulkData(countries, options);

      const totalInDatabase = await Country.countDocuments();

      const response = {
        success: true,
        validation: result.validation,
        processing: result.processing,
        statistics: {
          totalInDatabase,
          successRate: result.validation.totalRows > 0 
            ? Math.round((result.processing.processed / result.validation.totalRows) * 100) 
            : 0
        },
        message: `Bulk processing completed: ${result.processing.processed}/${result.validation.totalRows} countries processed successfully`
      };

      const statusCode = result.processing.chunks.failed > 0 ? 207 : 200;
      res.status(statusCode).json(response);

    } catch (error: any) {
      console.error('Error in bulk country processing:', error);
      res.status(500).json({
        success: false,
        error: 'Bulk processing failed',
        message: error.message,
        validation: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          errors: [error.message]
        }
      });
    }
  }

  /**
   * Obtenir les statistiques de validation pour un dataset
   */
  static async validateDataset(req: Request, res: Response) {
    try {
      const { data, type } = req.body;

      if (!Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: 'Data must be an array'
        });
      }

      let validateFunction;
      switch (type) {
        case 'gigs':
          validateFunction = BulkDataProcessor.validateGigData;
          break;
        case 'countries':
          validateFunction = BulkDataProcessor.validateCountryData;
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Type must be either "gigs" or "countries"'
          });
      }

      console.log(`🔍 Validation de ${data.length} éléments de type ${type}...`);

      const result = {
        totalRows: data.length,
        validRows: 0,
        invalidRows: 0,
        errors: [] as string[],
        samples: {
          valid: [] as any[],
          invalid: [] as any[]
        }
      };

      for (let i = 0; i < data.length; i++) {
        const validation = validateFunction(data[i]);
        if (validation.isValid) {
          result.validRows++;
          if (result.samples.valid.length < 3) {
            result.samples.valid.push({ index: i, data: data[i] });
          }
        } else {
          result.invalidRows++;
          result.errors.push(...validation.errors.map(err => `Row ${i}: ${err}`));
          if (result.samples.invalid.length < 3) {
            result.samples.invalid.push({ index: i, data: data[i], errors: validation.errors });
          }
        }
      }

      res.status(200).json({
        success: true,
        validation: result,
        recommendations: this.getValidationRecommendations(result, type)
      });

    } catch (error: any) {
      console.error('Error validating dataset:', error);
      res.status(500).json({
        success: false,
        error: 'Validation failed',
        message: error.message
      });
    }
  }

  /**
   * Génère des recommandations basées sur les résultats de validation
   */
  private static getValidationRecommendations(result: any, type: string): string[] {
    const recommendations: string[] = [];

    const invalidRate = result.totalRows > 0 ? (result.invalidRows / result.totalRows) * 100 : 0;

    if (invalidRate > 50) {
      recommendations.push('⚠️  Plus de 50% des données sont invalides. Vérifiez la structure de vos données.');
    }

    if (invalidRate > 20) {
      recommendations.push('💡 Considérez utiliser une taille de chunk plus petite (10-15) pour réduire les erreurs.');
    }

    if (result.errors.some((err: string) => err.includes('ObjectId'))) {
      recommendations.push('🔗 Vérifiez que tous les ObjectIds référencent des documents existants dans la base.');
    }

    if (result.errors.some((err: string) => err.includes('required'))) {
      recommendations.push('📝 Assurez-vous que tous les champs requis sont présents et non vides.');
    }

    if (type === 'gigs' && result.errors.some((err: string) => err.includes('status'))) {
      recommendations.push('📊 Vérifiez que le statut est l\'une des valeurs: to_activate, active, inactive, archived');
    }

    return recommendations;
  }
}
