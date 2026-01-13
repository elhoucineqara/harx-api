import mongoose from 'mongoose';

export interface BulkProcessingOptions {
  chunkSize: number;
  maxRetries: number;
  validateFunction: (item: any) => { isValid: boolean; errors: string[] };
  processFunction: (chunk: any[]) => Promise<any>;
}

export class BulkDataProcessor {
  /**
   * Process data in bulk with validation options
   */
  static async processBulkData(data: any[], options: BulkProcessingOptions) {
    const { chunkSize, validateFunction, processFunction, maxRetries } = options;
    
    // 1. Validation Phase
    const validationResult = {
      totalRows: data.length,
      validRows: 0,
      invalidRows: 0,
      errors: [] as string[]
    };

    const validItems: any[] = [];
    
    for (const item of data) {
      const validation = validateFunction(item);
      if (validation.isValid) {
        validationResult.validRows++;
        validItems.push(item);
      } else {
        validationResult.invalidRows++;
        validationResult.errors.push(...validation.errors);
      }
    }

    // 2. Processing Phase for Valid Items
    const processingResult = {
      processed: 0,
      chunks: {
        total: Math.ceil(validItems.length / chunkSize),
        success: 0,
        failed: 0
      }
    };

    if (validItems.length > 0) {
      for (let i = 0; i < validItems.length; i += chunkSize) {
        const chunk = validItems.slice(i, i + chunkSize);
        let retries = 0;
        let success = false;

        while (retries <= maxRetries && !success) {
          try {
            const result = await processFunction(chunk);
            // Assuming processFunction returns something meaningful, but here we mainly care it didn't throw irrecoverably
            // Or if it returned partial success, we might want to track that.
            // Based on BulkController, processFunction returns db result or throws.
            // If it returns a BulkWriteResult kind of object, we could parse it, but let's keep it simple for now based on generic usage.
            
            // Check if result has insertedCount to increment processed count accurately?
            // The controller logs insertedCount, so let's try to capture it if consistent.
            let count = chunk.length;
            if (result && typeof result.insertedCount === 'number') {
                count = result.insertedCount;
            }
            
            processingResult.processed += count;
            processingResult.chunks.success++;
            success = true;
          } catch (error) {
            console.error(`Chunk processing failed (attempt ${retries + 1}/${maxRetries + 1})`, error);
            retries++;
            if (retries > maxRetries) {
              processingResult.chunks.failed++;
              // Optionally log error for this chunk
            } else {
                // Wait a bit before retry?
                 await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
          }
        }
      }
    }

    return {
      validation: validationResult,
      processing: processingResult
    };
  }

  /**
   * Default validator for Gigs (can be used if no custom validator provided, or for validateDataset)
   */
  static validateGigData(item: any): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
      if (!item) return { isValid: false, errors: ['Item is null'] };
      
      if (!item.title || typeof item.title !== 'string') errors.push('Title is required (string)');
      
      // Basic checks matching what controller used or expected
      if (item.userId && !mongoose.Types.ObjectId.isValid(item.userId)) {
        errors.push('userId must be valid ObjectId');
      }

      return {
          isValid: errors.length === 0,
          errors
      };
  }

  /**
   * Default validator for Countries
   */
  static validateCountryData(item: any): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
      if (!item) return { isValid: false, errors: ['Item is null'] };

      if (!item.name) errors.push('Name is required');
      if (!item.cca2) errors.push('cca2 code is required');

      return {
          isValid: errors.length === 0,
          errors
      };
  }
}
