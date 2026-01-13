import axios from "axios";
import * as speech from '@google-cloud/speech';
import * as path from "path";

const GOOGLE_SPEECH_API = "https://speech.googleapis.com/v1p1beta1/speech:recognize";
const API_KEY = process.env.GOOGLE_API_KEY;

export const transcribeAudio = async (base64Audio: string, language: string) => {
    try {
        const requestBody = {
            config: {
                encoding: "FLAC",  // Change encoding if needed
                enableAutomaticPunctuation: true,
                languageCode: language,  // List of possible languages
                model: "default",
            },
            audio: {
                content: base64Audio,
            },
        };

        const response = await axios.post(`${GOOGLE_SPEECH_API}?key=${API_KEY}`, requestBody, {
            headers: { "Content-Type": "application/json" },
        });

        return response.data;
    } catch (error) {
        console.error("Error transcribing audio:", error.response?.data || error.message);
        throw new Error("Transcription failed");
    }
};

const keyFilePath = path.join(__dirname, "../../config/speechToTextServiceAccount.json");

const client = new speech.SpeechClient({ keyFilename: keyFilePath });

export const transcribeLongAudio = async (languageCode: string, fileUri: string) => {
    try {
        const config = {
            encoding: "OPUS", // Ensure the correct encoding for the uploaded file
            //encoding: "LINEAR16", // Ensure the correct encoding for the uploaded file
            languageCode: languageCode,
            sampleRateHertz : 48000,
            enableAutomaticPunctuation: true, // Improve readability with punctuation
        };

        const audio = {
            uri: fileUri, // Google Cloud Storage URI (gs://bucket-name/file.flac)
        };

        const request = { config, audio };

        console.log("Starting long audio transcription...");

        // Long-running operation for large audio files
        const [operation] = await client.longRunningRecognize(request as any) as any;

        console.log("Waiting for transcription to complete...");
        const [response] = await operation.promise(); // Wait for the operation to complete

        // Extract and join transcriptions
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join("\n");

        console.log(`Transcription completed: \n${transcription}`);
        return transcription;
    } catch (error) {
        console.error("Error transcribing long audio:", error);
        throw new Error("Long audio transcription failed");
    }
};

export default {
    transcribeAudio,
    transcribeLongAudio
};