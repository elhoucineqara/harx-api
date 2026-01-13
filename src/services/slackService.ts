import { WebClient } from '@slack/web-api';

const sendSlackMessage = async (channelId: string, text: string, token: string) => {
    try {
        const client = new WebClient(token);
        const result = await client.chat.postMessage({
            channel: channelId,
            text: text
        });
        return result;
    } catch (error) {
        throw new Error(`Failed to send Slack message: ${error.message}`);
    }
};

const verifySlackCredentials = async (token: string) => {
    try {
        const client = new WebClient(token);
        const auth = await client.auth.test();
        return {
            isValid: true,
            teamName: auth.team,
            botUserId: auth.user_id,
            workspaceId: auth.team_id
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

const listChannels = async (token: string) => {
    try {
        const client = new WebClient(token);
        const result = await client.conversations.list({
            types: 'public_channel,private_channel'
        });
        return result.channels;
    } catch (error) {
        throw new Error(`Failed to list Slack channels: ${error.message}`);
    }
};

export default { 
    sendSlackMessage,
    verifySlackCredentials,
    listChannels
 }; 