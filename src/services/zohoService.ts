import axios from 'axios';
import ZohoConfig, { IZohoConfig } from '../models/ZohoConfig';
import dbConnect from '../lib/dbConnect';
import { ParsedQs } from 'qs';

const ZOHO_TOKEN_URL = process.env.ZOHO_TOKEN_URL || 'https://accounts.zoho.com/oauth/v2/token';

export class ZohoService {
  getAuthUrl(customConfig?: { clientId: string | ParsedQs | (string | ParsedQs)[]; clientSecret: string | ParsedQs | (string | ParsedQs)[]; redirectUri: string | ParsedQs | (string | ParsedQs)[]; authUrl: string | ParsedQs | (string | ParsedQs)[]; tokenUrl: string | ParsedQs | (string | ParsedQs)[]; apiBaseUrl: string | ParsedQs | (string | ParsedQs)[]; scope: string | ParsedQs | (string | ParsedQs)[]; }) {
    const config = customConfig || {
      clientId: process.env.ZOHO_CLIENT_ID,
      redirectUri: process.env.ZOHO_REDIRECT_URI,
      authUrl: process.env.ZOHO_AUTH_URL || 'https://accounts.zoho.com/oauth/v2/auth',
      scope: process.env.ZOHO_SCOPE || 'ZohoCRM.modules.ALL',
    } as any;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      scope: config.scope,
      redirect_uri: config.redirectUri,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async getAccessToken(code: string | ParsedQs | (string | ParsedQs)[], customConfig?: { clientId: string | ParsedQs | (string | ParsedQs)[]; clientSecret: string | ParsedQs | (string | ParsedQs)[]; redirectUri: string | ParsedQs | (string | ParsedQs)[]; authUrl: string | ParsedQs | (string | ParsedQs)[]; tokenUrl: string | ParsedQs | (string | ParsedQs)[]; apiBaseUrl: string | ParsedQs | (string | ParsedQs)[]; scope: string | ParsedQs | (string | ParsedQs)[]; }) {
    try {
      // Determine configuration: use customConfig if provided, otherwise fallback to environment variables
      const config = customConfig || {
        clientId: process.env.ZOHO_CLIENT_ID,
        clientSecret: process.env.ZOHO_CLIENT_SECRET,
        redirectUri: process.env.ZOHO_REDIRECT_URI,
        authUrl: process.env.ZOHO_AUTH_URL || 'https://accounts.zoho.com/oauth/v2/auth',
        tokenUrl: process.env.ZOHO_TOKEN_URL || 'https://accounts.zoho.com/oauth/v2/token',
        apiBaseUrl: process.env.ZOHO_API_BASE_URL || 'https://www.zohoapis.com/crm/v2.1',
        scope: process.env.ZOHO_SCOPE || 'ZohoCRM.modules.ALL',
      } as any;

      const response = await axios.post(ZOHO_TOKEN_URL, null, {
        params: {
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code',
        },
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from Zoho');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  async refreshToken(refreshToken: string, configOverrides?: { clientId?: string, clientSecret?: string }): Promise<any> {
    try {
      console.log("Refreshing Zoho token...");
      
      const params = {
        refresh_token: refreshToken,
        client_id: configOverrides?.clientId || process.env.ZOHO_CLIENT_ID,
        client_secret: configOverrides?.clientSecret || process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      };

      const response = await axios.post(ZOHO_TOKEN_URL, null, { params });

      if (!response.data.access_token) {
        throw new Error('No access token received from Zoho');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  async refreshConfig(config: IZohoConfig): Promise<any> {
    return this.refreshToken(config.refreshToken, {
        clientId: config.clientId,
        clientSecret: config.clientSecret
    });
  }

  async getValidToken(userId: string): Promise<string> {
    await dbConnect();
    const config = await ZohoConfig.findOne({ userId }).sort({ lastUpdated: -1 });
    
    if (!config) {
      throw new Error('Zoho configuration not found');
    }

    // Check if token is expired (assuming 1 hour expiry generally, but refreshing if older than 50 mins to be safe)
    
    const now = new Date();
    const lastUpdated = new Date(config.lastUpdated);
    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / 60000;

    if (!config.accessToken || diffMinutes > 50) {
        const tokenData = await this.refreshToken(config.refreshToken, {
            clientId: config.clientId,
            clientSecret: config.clientSecret
        });

        config.accessToken = tokenData.access_token;
        config.lastUpdated = new Date();
        if (tokenData.expires_in) {
            config.expiresIn = tokenData.expires_in;
        }
        await config.save();
        return config.accessToken;
    }

    return config.accessToken;
  }

  async executeWithRefresh<T>(userId: string, apiCall: (token: string) => Promise<T>): Promise<T> {
    let token = await this.getValidToken(userId);
    
    try {
      return await apiCall(token);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log("Token expired, refreshing...");
        // Force refresh
        await dbConnect();
        const config = await ZohoConfig.findOne({ userId });
        if (config) {
            const tokenData = await this.refreshToken(config.refreshToken, {
                clientId: config.clientId,
                clientSecret: config.clientSecret
            });
            
            config.accessToken = tokenData.access_token;
            config.lastUpdated = new Date();
            if (tokenData.expires_in) {
                config.expiresIn = tokenData.expires_in;
            }
            await config.save();
            
            token = config.accessToken;
            return await apiCall(token);
        }
      }
      throw error;
    }
  }

  async getSalesIQPortalName(token: string): Promise<string> {
    const response = await axios.get("https://salesiq.zoho.com/api/v2/portals", {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data?.data?.[0]?.screenname) {
      return response.data.data[0].screenname;
    }
    throw new Error("No SalesIQ portal found");
  }

  async getChats(userId: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.get(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.get(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async sendMessage(userId: string, conversationId: string, text: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.post(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations/${conversationId}/messages`,
        { text },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async configure(userId: string, companyId: string, configData: any) {
      await dbConnect();
      
      // Verify token first
      const response = await axios.post(ZOHO_TOKEN_URL, null, {
        params: {
          refresh_token: configData.refreshToken,
          client_id: configData.clientId,
          client_secret: configData.clientSecret,
          grant_type: 'refresh_token'
        }
      });

      if (!response.data.access_token) {
          throw new Error("Invalid Zoho credentials");
      }

      await ZohoConfig.deleteMany({ userId, companyId });

      const newConfig = new ZohoConfig({
          userId,
          companyId,
          clientId: configData.clientId,
          clientSecret: configData.clientSecret,
          refreshToken: configData.refreshToken,
          accessToken: response.data.access_token,
          expiresIn: response.data.expires_in,
          lastUpdated: new Date()
      });

      await newConfig.save();
      return { success: true, accessToken: response.data.access_token };
  }
}

export const zohoService = new ZohoService();
