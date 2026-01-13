// @ts-nocheck
import { OAuth2Client, GoogleAuth } from 'google-auth-library';
import { VertexAI } from '@google-cloud/vertexai';
import axios from 'axios';
import * as path from "path";
import { generatePrompt } from './ai/prompts/contactCenterAssessment';
import { generateLanguagePrompt } from './ai/prompts/languageAssessment';
import { cleanAndFormatResponse, parseJsonResponseContactCenter } from "./ai/utils/formatVertexResponse";
import { Storage } from '@google-cloud/storage';
import express from "express";
const router = express.Router();

// Retreive OAUTH2.0 credentials and Google Cloud variables form .env
const clientId = process.env.QAUTH2_CLIENT_ID;
const clientSecret = process.env.QAUTH2_CLIENT_SECRET;
const scope = process.env.QAUTH2_SCOPE;
const redirectUrl = process.env.REDIRECTION_URL;
const projectID = process.env.QAUTH2_PROJECT_ID;
const location = process.env.LOCATION;


// Construct the absolute path to the service account JSON file
const vertexServicekeyPath = process.env.VERTEX_SERVICE_KEY_PATH;

// Authenticate to Google cloud using the vertex service account
const auth = new GoogleAuth({
  keyFilename: vertexServicekeyPath,
  scopes: [scope],
});

// Create an instance of VertexAI class
const vertex_ai = new VertexAI({ project: projectID, location: location, googleAuthOptions: auth });

// Create an instance of GenerativeModel class
const generativeVisionModel = vertex_ai.getGenerativeModel({
  model: 'gemini-1.5-flash-002',
});

// Construct the absolute path to the service account JSON file
const storageServicekeyPath = path.join(__dirname, "../../config/cloud-storage-service-account.json");

export const authenticate = async () => {
  try {
    const open = (await import('open')).default;
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      response_type: "code",
      scope: scope,
    });

    console.log("Authorization URL:", authorizeUrl);

    // Step 2: Open the URL automatically
    open(authorizeUrl, { wait: false });

    // Step 3: Return a promise that resolves when the OAuth2 callback is triggered
    return new Promise((resolve, reject) => {
      tokenPromiseResolve = resolve;
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
  }
};

export const summarizeAudio = async (accessToken: string, fileUri: string, prompt: string) => {
  try {
    const vertexAiEndpoint = process.env.VERTEX_AI_ENDPOINT;
    // Étape 2 : Préparer le corps de la requête pour Vertex AI
    const vertexBody = {
      contents: {
        role: 'USER',
        parts: [
          {
            fileData: {
              mimeType: 'audio/flac',
              fileUri: fileUri, // URI du fichier audio
            },
          },
          {
            text: prompt, // Le texte de la demande
          },
        ],
      },
    };

    // Étape 3 : Appeler l'API Vertex AI
    const vertexResponse = await axios.post(vertexAiEndpoint, vertexBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Ajoute le token OAuth2
        'Content-Type': 'application/json',
      },
    });

    console.log('Vertex AI Response:', vertexResponse.data);

    // Étape 4 : Retourner les données analysées
    return vertexResponse.data;
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    throw new Error('Failed to summarize audio');
  }
};

// Evaluate Rep Language Level
export const evaluateRepLanguage = async (fileUri: string, textToCompare: string) => {
  try {
    const request = {
      contents: [{
        role: 'user', parts: [
          {
            "file_data": {
              "mime_type": "audio/opus", // we can change the mime_type after
              "file_uri": fileUri
            }
          },
          {
            "text": generateLanguagePrompt(textToCompare)
          }
        ]
      }],
    };
    const streamingResp = await generativeVisionModel.generateContentStream(request);
    for await (const item of streamingResp.stream) {
      console.log('stream chunk: ', JSON.stringify(item));
    }
    const aggregatedResponse = await streamingResp.response;
    console.log("aggregatedResponse.candidates[0].content :", aggregatedResponse);
    const parsedData = cleanAndFormatResponse(aggregatedResponse);
    console.log("Vertex AI Response text returned :", parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    throw new Error('Failed to analyze Rep language Level');
  }
};

// Evaluate Rep Contact Center Skills Level
export const evaluateRepCCSkills = async (fileUri: string, scenarioData: any) => {
  try {
    const request = {
      contents: [{
        role: 'user', parts: [
          {
            "file_data": {
              "mime_type": "audio/opus", // we can change the mime_type after
              "file_uri": fileUri
            }
          },
          {
            "text": generatePrompt(scenarioData)
          }
        ]
      }],
    };
    const streamingResp = await generativeVisionModel.generateContentStream(request);
    for await (const item of streamingResp.stream) {
      console.log('stream chunk: ', JSON.stringify(item));
    }
    const aggregatedResponse = await streamingResp.response;
    console.log("aggregatedResponse.candidates[0].content :", aggregatedResponse);
    const contactCenterAnalysis = aggregatedResponse.candidates[0].content.parts[0].text
    const parsedData = parseJsonResponseContactCenter(contactCenterAnalysis);
    console.log("Vertex AI Response text returned :", parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    throw new Error('Failed to analyze Rep language Level');
  }
};

export const audioUpload = async (filePath: string, destinationName: string) => {
  const storage = new Storage();
  const bucketName = "harx-audios-test";

  try {
    const options = {
      destination: destinationName, // Specify only the file name in the bucket
    };

    // Upload the file to the specified bucket
    await storage.bucket(bucketName).upload(filePath, options);
    console.log(`${filePath} uploaded to ${bucketName} as ${destinationName}`);

    // Return a success message or metadata
    return {
      message: `${filePath} successfully uploaded to ${bucketName} as ${destinationName}`,
      bucketName,
      fileUri: `gs://${bucketName}/${destinationName}`, // gs:// format
    };
  } catch (error) {
    console.error(`Failed to upload ${filePath} to ${bucketName}:`, error.message);
    throw new Error('File upload failed. Please check the file path and bucket permissions.');
  }
};

export const audioUpload2 = async (fileBuffer: Buffer, destinationName: string) => {
  const storage = new Storage({
    projectId: projectID,
    keyFilename: storageServicekeyPath,
  });
  const bucketName = "harx-audios-test";

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(destinationName);

    // Create a write stream to upload the file from the buffer
    const stream = file.createWriteStream({
      resumable: false,
      /*  metadata: {
         contentType: "audio/flac", // Force correct MIME type
       }, */
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error(`Failed to upload to ${bucketName}:`, error.message);
        reject(new Error('File upload failed. Please check the file buffer and bucket permissions.'));
      });

      stream.on('finish', () => {
        console.log(`${destinationName} uploaded to ${bucketName}`);
        //await file.setMetadata({ contentType: "audio/flac"});
        // Resolve with the gs:// URI
        resolve({
          message: `${destinationName} successfully uploaded to ${bucketName}`,
          bucketName,
          fileUri: `gs://${bucketName}/${destinationName}`, // gs:// format
        });
      });

      // Write the buffer and end the stream
      stream.end(fileBuffer);
    });
  } catch (error) {
    console.error(`Failed to upload to ${bucketName}:`, error.message);
    throw new Error('File upload failed. Please check the file buffer and bucket permissions.');
  }
};

export default {
  authenticate,
  summarizeAudio,
  evaluateRepLanguage,
  evaluateRepCCSkills,
  audioUpload,
  audioUpload2
};
