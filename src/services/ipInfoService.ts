import axios from 'axios';
import Timezone from '../models/Timezone';
import dbConnect from '../lib/dbConnect';

const IP_API_URL = 'http://ip-api.com/json/';

class IpInfoService {
  async getIPInfo(ip: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = process.env.IP_INFO_TOKEN;
      
      if (!token) {
        return {
          success: false,
          error: 'IP_INFO_TOKEN not configured'
        };
      }

      const url = `https://ipinfo.io/${ip}?token=${token}`;
      const response = await axios.get(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching IP info from ipinfo.io:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to fetch IP information'
      };
    }
  }

  isConfigured(): boolean {
    return !!process.env.IP_INFO_TOKEN;
  }

  extractLocationInfo(data: any) {
    if (!data) return null;
    
    return {
      ip: data.ip,
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country || 'Unknown',
      location: data.loc || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.org || 'Unknown',
      postal: data.postal || 'Unknown'
    };
  }
  async getLocationInfo(ipAddress: string) {
    try {
      await dbConnect();
      
      // En développement ou si IP locale
      if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
        return {
          region: 'Local',
          city: 'Localhost',
          isp: 'Local Development',
          timezone: 'UTC',
          countryCode: 'US' // Default fallback
        };
      }

      const response = await axios.get(`${IP_API_URL}${ipAddress}`);
      
      if (response.data.status === 'fail') {
        console.warn(`Failed to get location info for IP ${ipAddress}:`, response.data.message);
        return null;
      }

      return {
        region: response.data.regionName,
        city: response.data.city,
        isp: response.data.isp,
        postal: response.data.zip,
        coordinates: `${response.data.lat},${response.data.lon}`,
        timezone: response.data.timezone,
        countryCode: response.data.countryCode
      };
    } catch (error) {
      console.error('Error fetching IP info:', error);
      return null;
    }
  }
}

export default new IpInfoService();



