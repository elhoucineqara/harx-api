import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import axios from 'axios';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
        await dbConnect();
    const searchParams = req.query;
    const query = searchParams.q;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    // Check if API credentials are configured
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
      console.error('Google Search API credentials not configured:', {
        hasApiKey: !!GOOGLE_API_KEY,
        hasSearchEngineId: !!SEARCH_ENGINE_ID,
      });
      return res.status(500).json({
        success: false,
        error: 'Google Search API credentials not configured. Please configure GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in your environment variables.',
        details: 'This feature requires Google Custom Search API credentials to function.'
      });
    }

    // Implement Google Search API call
    try {
      const searchUrl = 'https://www.googleapis.com/customsearch/v1';
      
      const response = await axios.get(searchUrl, {
        params: {
          key: GOOGLE_API_KEY,
          cx: SEARCH_ENGINE_ID,
          q: query,
          num: 10 // Number of results
        }
      });

      const items = response.data.items?.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        pagemap: item.pagemap
      })) || [];

      return res.json({
        success: true,
        items: items,
        searchInformation: response.data.searchInformation
      });
    } catch (apiError: any) {
      console.error('Google Search API error:', apiError.response?.data || apiError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch search results from Google',
        details: apiError.response?.data?.error?.message || apiError.message
      });
    }
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;
