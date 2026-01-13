import express from 'express';
import timezoneService from '../services/TimezoneService';
const router = express.Router();

// GET /api/timezones - Toutes les timezones
router.get('/', async (req, res) => {
  try {
    const search = req.query.search as string;
    let timezones;
    
    if (search) {
      timezones = await timezoneService.searchTimezones(search);
    } else {
      timezones = await timezoneService.getAllTimezones();
    }
    
    res.json({
      success: true,
      data: timezones,
      count: timezones.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timezones',
      error: error.message
    });
  }
});

// GET /api/timezones/countries - Liste des pays
router.get('/countries', async (req, res) => {
  try {
    const countries = await timezoneService.getCountriesWithNames();
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching countries',
      error: error.message
    });
  }
});

// GET /api/timezones/country/:countryCode - Timezones par pays
router.get('/country/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const timezones = await timezoneService.getTimezonesByCountry(countryCode);
    res.json({
      success: true,
      data: timezones,
      count: timezones.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timezones for country',
      error: error.message
    });
  }
});

// GET /api/timezones/zone/:zoneName - Timezone spécifique
router.get('/zone/:zoneName(*)', async (req, res) => {
  try {
    const { zoneName } = req.params;
    const timezone = await timezoneService.getTimezoneByZone(zoneName);
    
    if (!timezone) {
      return res.status(404).json({
        success: false,
        message: 'Timezone not found'
      });
    }
    
    res.json({
      success: true,
      data: timezone
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timezone',
      error: error.message
    });
  }
});

export default router; 