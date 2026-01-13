import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
import * as path from 'path';
import axios from 'axios';
import { promises as fs } from 'fs';
import { extractTextFromFile } from '../services/documentProcessingService';
import Document from '../models/Document';
import CallRecording from '../models/CallRecording';

dotenv.config();

// Ensure credentials path is absolute
// Try multiple possible env var names for compatibility
const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                       process.env. GOOGLE_CREDENTIALS_PATH;
// Only resolve if it's a valid path (not a placeholder like "path/to/file.json")
let credentialsPath = '';
if (credentialsEnv && 
    credentialsEnv.trim() !== '' && 
    !credentialsEnv.includes('path/to') && 
    !credentialsEnv.includes('placeholder') &&
    credentialsEnv.endsWith('.json')) { // Must be a JSON file
  try {
    const resolvedPath = path.resolve(credentialsEnv);
    // Check if the resolved path is actually a file (not a directory)
    const fs = require('fs');
    const stats = fs.statSync(resolvedPath);
    if (stats.isFile()) {
      credentialsPath = resolvedPath;
    } else {
      logger.warn('Credentials path is a directory, not a file:', resolvedPath);
      credentialsPath = '';
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.warn('Credentials file not found, will use default authentication:', {
        path: credentialsEnv,
        resolvedPath: path.resolve(credentialsEnv)
      });
    } else {
      logger.warn('Invalid credentials path, will use default authentication:', {
        path: credentialsEnv,
        error: error.message
      });
    }
    credentialsPath = '';
  }
} else if (credentialsEnv && credentialsEnv.trim() !== '') {
  logger.warn('Credentials path does not look like a valid JSON file path:', credentialsEnv);
  credentialsPath = '';
}

// Vertex AI Configuration
export const VERTEX_CONFIG = {
  project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION,
  modelName: process.env.VERTEX_AI_MODEL,
  credentials: credentialsPath
};

// RAG Configuration
export const RAG_CONFIG = {
  chunkSize: 512,  // Size of text chunks for processing
  chunkOverlap: 100,  // Overlap between chunks to maintain context
  maxEmbeddingRequestsPerMin: 900,
  maxParsingRequestsPerMin: 120
};

class VertexAIService {
  vertexAI: VertexAI | null = null;
  generativeModel: any = null;

  initialize() {
    try {
      if (!VERTEX_CONFIG.project) {
        throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
      }

      logger.info('Initializing Vertex AI with config:', {
        project: VERTEX_CONFIG.project,
        location: VERTEX_CONFIG.location,
        model: VERTEX_CONFIG.modelName,
        hasCredentials: !!VERTEX_CONFIG.credentials && VERTEX_CONFIG.credentials.trim() !== ''
      });

      // Initialize Vertex AI
      // Only pass credentials if they are valid
      const vertexAIConfig: any = {
        project: VERTEX_CONFIG.project,
        location: VERTEX_CONFIG.location
      };
      
      // Only add credentials if they are provided and valid
      if (VERTEX_CONFIG.credentials && VERTEX_CONFIG.credentials.trim() !== '') {
        vertexAIConfig.credentials = VERTEX_CONFIG.credentials;
      }
      
      this.vertexAI = new VertexAI(vertexAIConfig);

      // Initialize the generative model
      this.generativeModel = this.vertexAI.preview.getGenerativeModel({
        model: VERTEX_CONFIG.modelName
      });

      logger.info('Vertex AI Service initialized successfully');
      return true;
    } catch (error: any) {
      logger.error('Failed to initialize Vertex AI Service:', {
        error: error.message,
        stack: error.stack,
        config: VERTEX_CONFIG
      });
      throw error;
    }
  }

  async fetchDocumentContent(url: string): Promise<string | null> {
    try {
      // Create a temporary directory for downloads if it doesn't exist
      const tempDir = path.join(__dirname, '../../temp');
      await fs.mkdir(tempDir, { recursive: true });

      // Download the file
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'arraybuffer'
      });

      // Determine file type from URL or Content-Type header
      const fileType = response.headers['content-type'] || 'application/pdf';
      
      // Create a temporary file
      const tempFile = path.join(tempDir, `temp-${Date.now()}.pdf`);
      await fs.writeFile(tempFile, response.data);

      // Extract text from the file
      const extractedText = await extractTextFromFile(tempFile, fileType);

      // Clean up the temporary file
      await fs.unlink(tempFile);

      if (!extractedText) {
        throw new Error('Failed to extract text from document');
      }

      return extractedText;
    } catch (error: any) {
      logger.error(`Failed to fetch and process document from ${url}:`, error);
      return null;
    }
  }

  /**
   * **AMÉLIORÉ : Helper pour récupérer tout le contenu textuel d'une entreprise**
   * @param {string} companyId - L'ID de l'entreprise
   * @returns {Array} - Un tableau de documents et transcriptions
   */
  async _getCorpusContent(companyId: string) {
    try {
      // Récupérer les documents
      const documents = await Document.find({ companyId });
      logger.info(`Found ${documents.length} documents for company ${companyId}`);
      
      const documentContents = documents.map(doc => ({
        id: doc._id.toString(),
        title: doc.name,
        content: doc.content,
        url: doc.fileUrl,
        type: 'document'
      }));

      // **CORRIGÉ : Récupérer TOUS les enregistrements d'appels (pas seulement ceux avec transcription)**
      const allCallRecordings = await CallRecording.find({ companyId });
      logger.info(`Found ${allCallRecordings.length} total call recordings for company ${companyId}`);
      
      const callContents = allCallRecordings.map((call: any) => {
        // Utiliser la transcription si disponible, sinon créer un contenu descriptif
        let content: string;
        if (call.analysis?.transcription?.fullTranscript && 
            call.analysis.transcription.fullTranscript.trim() !== '') {
          content = call.analysis.transcription.fullTranscript;
        } else {
          // Créer un contenu descriptif pour les enregistrements sans transcription
          content = `Call recording with contact ${call.contactId} on ${call.date.toISOString().split('T')[0]}. Duration: ${call.duration} seconds. ${call.summary ? `Summary: ${call.summary}` : ''} ${call.tags && call.tags.length > 0 ? `Tags: ${call.tags.join(', ')}` : ''}`;
        }
        
        return {
          id: call._id.toString(),
          title: `Call with ${call.contactId} on ${call.date.toISOString().split('T')[0]}`,
          content: content,
          url: call.recordingUrl,
          type: 'call_recording',
          hasTranscript: !!(call.analysis?.transcription?.fullTranscript && 
                           call.analysis.transcription.fullTranscript.trim() !== '')
        };
      });

      const totalContent = [...documentContents, ...callContents];
      logger.info(`Total corpus content for company ${companyId}: ${totalContent.length} items (${documentContents.length} documents + ${callContents.length} call recordings)`);
      
      return totalContent;
    } catch (error: any) {
      logger.error(`Error in _getCorpusContent for company ${companyId}:`, error);
      throw error;
    }
  }

  async queryKnowledgeBase(companyId: string, query: string) {
    try {
      if (!this.vertexAI) {
        throw new Error('Vertex AI not initialized');
      }

      if (!this.generativeModel) {
        throw new Error('Generative model not initialized');
      }

      // **MODIFIÉ : Récupère le contenu directement depuis la base de données**
      const corpus = await this._getCorpusContent(companyId);

      if (corpus.length === 0) {
        // Renvoie une réponse claire si la base de connaissances est vide
        return {
          response: {
            candidates: [{
              content: { parts: [{ text: "The knowledge base for this company is empty. Please upload some documents or call recordings first." }] }
            }]
          }
        };
      }

      logger.info(`Querying knowledge base for company ${companyId}:`, { query });

      // Create a context from the stored documents
      const context = corpus
        .filter(doc => doc.content) // Filter out documents without content
        .map(doc => `Document: ${doc.title}\nContent: ${doc.content}\n---\n`)
        .join('\n');

      const prompt = `Using the following documents as context, please answer this question: "${query}"

Context:
${context}

Please provide a comprehensive answer based on the information in these documents.`;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });

      return result.response;
    } catch (error: any) {
      logger.error(`Failed to query knowledge base for company ${companyId}:`, {
        error: error.message,
        stack: error.stack,
        errorName: error.name,
        errorCode: error.code
      });
      
      // Re-throw with more context
      const enhancedError = new Error(`Vertex AI query failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).code = error.code;
      throw enhancedError;
    }
  }

  async checkCorpusStatus(companyId: string) {
    try {
      const documentCount = await Document.countDocuments({ companyId });
      logger.info(`Found ${documentCount} documents for company ${companyId}`);
      
      const allCallCount = await CallRecording.countDocuments({ companyId });
      logger.info(`Found ${allCallCount} total call recordings for company ${companyId}`);
      
      // **CORRIGÉ : Considérer tous les enregistrements comme faisant partie du corpus**
      const totalCount = documentCount + allCallCount;
      logger.info(`Total corpus count for company ${companyId}: ${totalCount} (${documentCount} documents + ${allCallCount} call recordings)`);
      
      return {
        exists: totalCount > 0,
        documentCount: documentCount,
        callRecordingCount: allCallCount, // Tous les enregistrements
        totalCallRecordings: allCallCount,
        totalCount: totalCount
      };
    } catch (error: any) {
      logger.error(`Failed to check corpus status for company ${companyId}:`, error);
      throw error;
    }
  }

  // **NOUVEAU : Obtenir la liste détaillée des documents du corpus**
  async getCorpusDocuments(companyId: string) {
    try {
      // **MODIFIÉ : Récupère le contenu directement depuis la base de données**
      const corpus = await this._getCorpusContent(companyId);

      return corpus.map(doc => ({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        type: doc.type,
        contentPreview: doc.content ? (doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '')) : 'No content',
        contentLength: doc.content?.length || 0,
        wordCount: doc.content ? doc.content.split(/\s+/).length : 0
      }));
    } catch (error: any) {
      logger.error(`Failed to get corpus documents for company ${companyId}:`, error);
      throw error;
    }
  }

  // **NOUVEAU : Obtenir le contenu complet d'un document spécifique**
  async getDocumentContent(companyId: string, documentId: string) {
    try {
      // **MODIFIÉ : Récupère le document directement depuis la base de données**
      let doc = await Document.findOne({ _id: documentId, companyId });
      let call: any;
      if (!doc) {
        call = await CallRecording.findOne({ _id: documentId, companyId });
      }

      if (!doc && !call) {
        throw new Error('Document not found in corpus');
      }
      
      const item = doc || call;
      const isCall = !!call;

      return {
        id: item._id.toString(),
        title: isCall ? `Call with ${item.contactId}` : item.name,
        url: isCall ? item.recordingUrl : item.fileUrl,
        content: isCall ? item.analysis?.transcription?.fullTranscript || '' : item.content,
        contentLength: (isCall ? item.analysis?.transcription?.fullTranscript || '' : item.content).length,
        wordCount: (isCall ? item.analysis?.transcription?.fullTranscript || '' : item.content).split(/\s+/).length
      };
    } catch (error: any) {
      logger.error(`Failed to get document content for company ${companyId}, document ${documentId}:`, error);
      throw error;
    }
  }

  // **NOUVEAU : Obtenir les statistiques du corpus**
  async getCorpusStats(companyId: string) {
    try {
      // **MODIFIÉ : Calcule les statistiques depuis la base de données**
      const corpus = await this._getCorpusContent(companyId);

      const stats: any = {
        totalDocuments: corpus.length,
        totalWords: 0,
        totalCharacters: 0,
        averageWordsPerDocument: 0,
        averageCharactersPerDocument: 0,
        documentTypes: {},
        largestDocument: null,
        smallestDocument: null
      };

      if (corpus.length > 0) {
        corpus.forEach(doc => {
          if (!doc.content) return; // Skip documents without content
          const wordCount = doc.content.split(/\s+/).length;
          const charCount = doc.content.length;
          
          stats.totalWords += wordCount;
          stats.totalCharacters += charCount;

          const fileExtension = doc.url.split('.').pop()?.toLowerCase() || 'unknown';
          stats.documentTypes[fileExtension] = (stats.documentTypes[fileExtension] || 0) + 1;

          if (!stats.largestDocument || wordCount > stats.largestDocument.wordCount) {
            stats.largestDocument = { id: doc.id, title: doc.title, wordCount, charCount };
          }

          if (!stats.smallestDocument || wordCount < stats.smallestDocument.wordCount) {
            stats.smallestDocument = { id: doc.id, title: doc.title, wordCount, charCount };
          }
        });

        stats.averageWordsPerDocument = Math.round(stats.totalWords / corpus.length);
        stats.averageCharactersPerDocument = Math.round(stats.totalCharacters / corpus.length);
      }

      return stats;
    } catch (error: any) {
      logger.error(`Failed to get corpus stats for company ${companyId}:`, error);
      throw error;
    }
  }

  // **NOUVEAU : Rechercher dans le corpus**
  async searchInCorpus(companyId: string, searchTerm: string) {
    try {
      // **MODIFIÉ : Recherche directement dans le contenu de la base de données**
      const corpus = await this._getCorpusContent(companyId);

      const results = corpus
        .filter(doc => doc.content) // Filter out documents without content
        .map(doc => {
          const content = doc.content!.toLowerCase(); // Safe to use ! after filter
          const searchLower = searchTerm.toLowerCase();
          const matches = (content.match(new RegExp(searchLower, 'g')) || []).length;
          
          if (matches > 0) {
            const index = content.indexOf(searchLower);
            const start = Math.max(0, index - 100);
            const end = Math.min(content.length, index + searchTerm.length + 100);
            const snippet = '...' + content.substring(start, end).replace(new RegExp(searchLower, 'gi'), `**${searchTerm}**`) + '...';
            
            return {
              id: doc.id,
              title: doc.title,
              url: doc.url,
              matches,
              snippet,
              relevance: matches * 10 
            };
          }
          return null;
        })
        .filter((result): result is NonNullable<typeof result> => result !== null)
        .sort((a, b) => b.relevance - a.relevance);

      return results;
    } catch (error: any) {
      logger.error(`Failed to search in corpus for company ${companyId}:`, error);
      throw error;
    }
  }

  // Stub methods for RAG corpus creation (to be implemented with Vertex AI RAG API)
  async createRagCorpus(companyId: string) {
    try {
      logger.info(`Creating RAG corpus for company ${companyId} (stub implementation)`);
      // TODO: Implement actual Vertex AI RAG corpus creation
      // For now, return a mock response
      return {
        name: `corpora/${companyId}`,
        displayName: `Corpus for company ${companyId}`,
        description: 'RAG corpus for company knowledge base'
      };
    } catch (error: any) {
      logger.error(`Failed to create RAG corpus for company ${companyId}:`, error);
      throw error;
    }
  }

  async importDocumentsToCorpus(companyId: string, documents: any[]) {
    try {
      logger.info(`Importing ${documents.length} documents to corpus for company ${companyId} (stub implementation)`);
      // TODO: Implement actual Vertex AI RAG document import
      // For now, return a mock response
      return {
        imported_rag_files_count: documents.length,
        failed_rag_files_count: 0
      };
    } catch (error: any) {
      logger.error(`Failed to import documents to corpus for company ${companyId}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const vertexAIService = new VertexAIService();

