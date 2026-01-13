import express from 'express';
import { sendWhatsAppMessage } from '../services/whatsappService';
import WhatsAppIntegration from '../models/WhatsAppIntegration';
import SentMessage from '../models/SentMessage';
import ReceivedMessage from '../models/ReceivedMessage'; 
import Client from '../models/Client';

const router = express.Router();
const receivedMessages = []; // ✅ Define the array globally

router.post('/setup', async (req, res) => {
    const { userId, phoneNumber, accessToken, phoneNumberId, businessId } = req.body;
    if (!userId || !phoneNumber || !accessToken || !phoneNumberId || !businessId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, phone number, access token, phone number ID, and business ID are required' 
        });
    }

    try {
        // Mise à jour de l'intégration avec les données fournies
        const integration = await WhatsAppIntegration.findOneAndUpdate(
            { userId },
            { phoneNumber, accessToken, phoneNumberId, businessId, status: 'connected' },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'WhatsApp connected successfully!', data: integration });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to setup WhatsApp integration' });
    }
});

// ✅ Disconnect WhatsApp
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID is required' });
    try {
        const integration = await WhatsAppIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );
        if (!integration) return res.status(404).json({ success: false, error: 'Integration not found' });
        res.json({ success: true, message: 'WhatsApp disconnected successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to disconnect WhatsApp' });
    }
});

// ✅ Reconnect WhatsApp
router.post('/reconnect', async (req, res) => {
    const { userId, phoneNumber, accessToken, phoneNumberId, businessId } = req.body;
    if (!userId || !phoneNumber || !accessToken || !phoneNumberId || !businessId) {
        return res.status(400).json({ success: false, error: 'User ID, phone number, and access token are required' });
    }

    try {
        

        const integration = await WhatsAppIntegration.findOne({ userId });
        if (!integration) return res.status(404).json({ success: false, error: 'Integration not found. Please setup again.' });

        Object.assign(integration, { phoneNumber, accessToken, phoneNumberId, businessId, status: 'connected' });
        await integration.save();

        res.json({ success: true, message: 'WhatsApp reconnected successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reconnect WhatsApp' });
    }
});

// ✅ Send WhatsApp Message (Supports Text & Templates)
router.post('/send', async (req, res) => {
    const { userId, to, text } = req.body;
    if (!userId || !to || !text) {
        return res.status(400).json({ success: false, error: 'User ID, recipient, and text are required' });
    }
    try {
        const integration = await WhatsAppIntegration.findOne({ userId, status: 'connected' });
        if (!integration) return res.status(400).json({ success: false, error: 'WhatsApp is not connected for this user' });

        const { phoneNumberId, accessToken } = integration;
        const response = await sendWhatsAppMessage(to, text, phoneNumberId, accessToken);

        // ✅ Enregistrement du message envoyé
        await SentMessage.create({ userId, text, to, timestamp: new Date() });

        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Get WhatsApp Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID is required' });
    try {
        const integration = await WhatsAppIntegration.findOne({ userId });
        res.json({ success: true, status: integration ? integration.status : 'pending' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch status' });
    }
});

// ✅ Webhook Verification (Required by Meta)
router.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'd4f89b3c1e2a4d5fb6e7c8a9d0f1e2b3'; // Change this to your actual token
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    res.status(403).send('Forbidden');
});

// ✅ Webhook to Receive Messages & Updates
/*router.post('/webhook', async (req, res) => {
    console.log('📩 Received Webhook:', JSON.stringify(req.body, null, 2));
    if (!req.body.entry) return res.sendStatus(400);

    try {
        for (const event of req.body.entry) {
            const phoneNumberId = event.id; // ✅ ID du numéro WhatsApp Business

            // 🔍 Trouver l'utilisateur associé à ce phoneNumberId
            let integration = await WhatsAppIntegration.findOne({ phoneNumberId });
            if (!integration) {
                console.log(`⚠️ Aucun utilisateur trouvé pour phoneNumberId: ${phoneNumberId}`);
                // ✅ Create a new client if not found
                integration = new Client({
                    phoneNumberId,
                    status: 'connected'
                });
                await integration.save();
                console.log(`✅ Nouveau client créé pour phoneNumberId: ${phoneNumberId}`);
            }

            const userId = integration.userId; // ✅ Maintenant userId est défini

            for (const change of event.changes || []) {
                if (change.value?.messages) {
                    for (const message of change.value.messages) {
                        const text = message?.text?.body;
                        const timestamp = message?.timestamp;
                        const from = message?.from;

                        if (text && timestamp && from) {
                            // ✅ Enregistrer le message reçu dans la base de données
                            await ReceivedMessage.create({
                                userId,
                                from,
                                text,
                                timestamp: new Date(timestamp * 1000),
                            });

                            console.log(`📩 Message reçu de ${from}: "${text}" à ${new Date(timestamp * 1000)}`);

                            // 🔥 Envoyer le message en temps réel via WebSocket
                            if (clients[userId]) {
                                clients[userId].emit("newMessage", { from, text, timestamp });
                            } else {
                                console.log(`⚠️ Aucun client WebSocket trouvé pour userId: ${userId}`);
                            }
                        }
                    }
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Erreur Webhook:', error);
        res.sendStatus(500);
    }
});*/

router.post('/webhook', async (req, res) => {
    console.log('📩 Received Webhook:', JSON.stringify(req.body, null, 2));
    if (!req.body.entry) return res.sendStatus(400);

    try {
        for (const event of req.body.entry) {
            const businessId = event.id;
            let integration = await WhatsAppIntegration.findOne({ businessId });
            if (!integration) {
                console.log(`⚠️ No user found for businessId: ${businessId}`);
                continue;
            }

            const userId = integration.userId;
            for (const change of event.changes || []) {
                if (change.value?.messages) {
                    for (const message of change.value.messages) {
                        const text = message?.text?.body;
                        const timestamp = message?.timestamp;
                        let from = message?.from;

                        if (text && timestamp && from) {
                            // Ensure the phone number starts with "+"
                            from = from.startsWith("+") ? from : `+${from}`;

                            // ✅ Save received message to database
                            await ReceivedMessage.create({
                                userId,
                                from,
                                text,
                                timestamp: new Date(timestamp * 1000),
                            });
                            console.log(`📩 Message received from ${from}: "${text}" at ${new Date(timestamp * 1000)}`);
                        }
                    }
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.sendStatus(500);
    }
});


// ✅ Endpoint for fetching received messages with timestamps
router.get('/messages', async (req, res) => {
    const { contact } = req.query;
    if (!contact) return res.status(400).json({ success: false, error: 'Contact is required' });

    try {
        const messages = await ReceivedMessage.find({ from: contact }).sort({ timestamp: 1 }).lean();
        res.json(messages); // ✅ Ensure the response is an array
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});


// ✅ New Endpoint to Fetch Sent Messages
router.get('/messages/sent', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    try {
        const sentMessages = await SentMessage.find({ userId }).sort({ timestamp: 1 }).lean();
        res.json({ success: true, messages: sentMessages });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch sent messages' });
    }
});

// Fonction pour normaliser les numéros de téléphone
const normalizePhoneNumber = (number) => {
    return number.startsWith('+') ? number : `+${number}`;
};

router.get('/conversations', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const sentMessages = await SentMessage.find({ userId }).lean();
        const receivedMessages = await ReceivedMessage.find({ userId }).lean();

        const conversations = {};

        // Normalisation et regroupement des messages envoyés
        sentMessages.forEach(msg => {
            const contact = normalizePhoneNumber(msg.to);
            if (!conversations[contact]) conversations[contact] = [];
            conversations[contact].push({ ...msg, type: 'sent' });
        });

        // Normalisation et regroupement des messages reçus
        receivedMessages.forEach(msg => {
            const contact = normalizePhoneNumber(msg.from);
            if (!conversations[contact]) conversations[contact] = [];
            conversations[contact].push({ ...msg, type: 'received' });
        });

        // Convertir en tableau et trier les messages
        const formattedConversations = Object.keys(conversations).map(contact => ({
            contact,
            messages: conversations[contact].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        }));

        res.json({ success: true, conversations: formattedConversations });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
});


router.get('/conversation', async (req, res) => {
    const { userId, contact: rawContact } = req.query;

    if (!userId || !rawContact) {
        return res.status(400).json({ success: false, error: 'User ID and contact are required' });
    }

    // Clean the contact to remove any potential spaces
    const contactStr = typeof rawContact === 'string' ? rawContact : String(rawContact);
    const contact = '+' + contactStr.trim();

    try {
        // Fetch sent messages (sent by the user to the contact)
        const sentMessages = await SentMessage.find({ userId, to: contact }).lean();
        // Mark messages as fromMe
        const sentMessagesWithFlag = sentMessages.map(msg => ({ ...msg, fromMe: true }));

        // Fetch received messages (received by the user from the contact)
        const receivedMessages = await ReceivedMessage.find({ userId, from: contact }).lean();
        // Mark messages as fromContact
        const receivedMessagesWithFlag = receivedMessages.map(msg => ({ ...msg, fromMe: false }));

        // Combine sent and received messages and sort by timestamp
        const conversation = [...sentMessagesWithFlag, ...receivedMessagesWithFlag].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        res.json({ success: true, conversation });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
    }
});



export default router;
