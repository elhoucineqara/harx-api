import { SpeechClient } from '@google-cloud/speech';
import path from 'path';

// Path to your JSON key file
const keyFilePath = path.join(__dirname, "../config/speechToTextServiceAccount.json");

// Create Google Speech client with authentication
const client = new SpeechClient({ keyFilename: keyFilePath });

export const transcribeLongAudio = async (languageCode: string, fileUri: string) => {
    try {
        const config = {
            encoding: "LINEAR16" as const, // Ensure the correct encoding for the uploaded file OGG_OPUS 
            languageCode: languageCode,
            sampleRateHertz: 48000,
            enableAutomaticPunctuation: true, // Improve readability with punctuation
        };

        const audio = {
            uri: fileUri, // Google Cloud Storage URI (gs://bucket-name/file.flac)
        };

        const request = { config, audio };

        console.log("Starting long audio transcription...");

        // Long-running operation for large audio files
        const [operation] = await client.longRunningRecognize(request);

        console.log("Waiting for transcription to complete...");
        const [response] = await operation.promise(); // Wait for the operation to complete

        if (!response.results) {
             console.log("No transcription results.");
             return "";
        }

        // Extract and join transcriptions
        const transcription = response.results
            .map(result => result.alternatives?.[0]?.transcript || '')
            .join("\n");

        console.log(`Transcription completed: \n${transcription}`);
        return transcription;
    } catch (error) {
        console.error("Error transcribing long audio:", error);
        throw new Error("Long audio transcription failed");
    }
};

const speechToTextService = {
    transcribeLongAudio
};

export default speechToTextService;