import axios from 'axios';

const TELEGRAM_API_URL = 'https://api.telegram.org';

export async function sendTelegramMessage(chatId: string, text: string, botToken: string) {
    try {
        const response = await axios.post(
            `${TELEGRAM_API_URL}/bot${botToken}/sendMessage`,
            {
                chat_id: chatId,
                text
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error sending Telegram message:', error.response?.data || error.message);
        throw new Error('Failed to send Telegram message');
    }
}
