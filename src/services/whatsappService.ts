import axios from 'axios';
import WhatsAppIntegration from '../models/WhatsAppIntegration';

export async function sendWhatsAppMessage(to: string, text: string, phoneNumberId: string, accessToken: string) {
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text }
    };

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
    };

    try {
        const response = await axios.post(url, payload, { headers });

        console.log("✅ Message envoyé avec succès :", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Erreur lors de l'envoi du message :", error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || "Échec de l'envoi du message WhatsApp");
    }
}

export async function getBusinessAndPhoneNumberId(phoneNumber: string, accessToken: string) {
    const url = `https://graph.facebook.com/v22.0/${phoneNumber}?fields=business,id&access_token=${accessToken}`;

    try {
        const response = await axios.get(url);
        if (!response.data.id) throw new Error('Phone number ID not found');

        return {
            businessId: response.data.business?.id || null,
            phoneNumberId: response.data.id
        };
    } catch (error: any) {
        console.error("❌ Erreur lors de la récupération de businessId et phoneNumberId :", error.response?.data || error.message);
        throw new Error("Impossible de récupérer les identifiants WhatsApp");
    }
}

