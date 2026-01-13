import express from 'express';
import ipInfoService from '../services/ipInfoService';
import User from '../models/User';
const router = express.Router();

// GET /api/ip/lookup/:ip - Obtenir les infos d'une IP spécifique
router.get('/lookup/:ip', async (req, res) => {
  try {
    const { ip } = req.params;

    // Validation IP basique
    if (!ip || ip.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IP address provided'
      });
    }

    const result = await ipInfoService.getIPInfo(ip);
    
    if (result.success) {
      const locationInfo = ipInfoService.getLocationInfo(result.data);
      
      res.json({
        success: true,
        requestedIP: ip,
        locationInfo: locationInfo
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to get information for IP: ${ip}`,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/ip/status - Vérifier le statut du service
router.get('/status', (req, res) => {
  const isConfigured = ipInfoService.isConfigured();
  
  res.json({
    success: true,
    service: 'IPInfo Service',
    configured: isConfigured,
    token: isConfigured ? 'Present' : 'Missing',
    apiEndpoint: 'https://ipinfo.io/{ip}?token={token}',
    message: isConfigured 
      ? 'Service is ready to use' 
      : 'Service requires IP_INFO_TOKEN environment variable'
  });
});

// GET /api/ip/test - Test avec des IPs d'exemple
router.get('/test', async (req, res) => {
  try {
    // Tester avec l'IP de l'exemple fourni et quelques autres
    const testIPs = [
      '38.165.230.210',  // IP de l'exemple
      '8.8.8.8',         // Google DNS
      '1.1.1.1',         // Cloudflare DNS
    ];

    const results = [];
    
    for (const ip of testIPs) {
      const result = await ipInfoService.getIPInfo(ip);
      results.push({
        ip,
        success: result.success,
        locationInfo: result.success ? ipInfoService.extractLocationInfo(result.data) : null,
        error: result.success ? null : result.error
      });
      
      // Pause courte entre les appels
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({
      success: true,
      message: 'Test completed',
      serviceConfigured: ipInfoService.isConfigured(),
      testResults: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/ip/client - Obtenir les infos de l'IP du client
router.get('/client', async (req, res) => {
  try {
    // Obtenir l'IP du client
    const xForwardedFor = req.headers['x-forwarded-for'];
    const forwardedIP = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
    
    const xRealIp = req.headers['x-real-ip'];
    const realIP = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
    
    const clientIP = forwardedIP?.split(',')[0] || 
                     realIP || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     req.ip;

    // Nettoyer l'IP (enlever les préfixes IPv4-mapped IPv6)
    const cleanIP = typeof clientIP === 'string' ? clientIP.replace(/^::ffff:/, '') : clientIP;

    console.log('Client IP detected:', cleanIP);

    if (!cleanIP || cleanIP.startsWith('127.') || cleanIP.startsWith('192.168.') || cleanIP.startsWith('10.')) {
      return res.json({
        success: false,
        message: 'Cannot geolocate private/local IP addresses',
        detectedIP: cleanIP,
        note: 'This IP appears to be private/local. Try testing with a public IP using /api/ip/lookup/{ip}'
      });
    }

    const result = await ipInfoService.getIPInfo(cleanIP);
    
    if (result.success) {
      const locationInfo = ipInfoService.extractLocationInfo(result.data);
      
      res.json({
        success: true,
        detectedIP: cleanIP,
        locationInfo: locationInfo
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get IP information',
        error: result.error,
        detectedIP: cleanIP
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/ip/user/:userId/latest - Obtenir les infos de la dernière IP d'un utilisateur
router.get('/user/:userId/latest', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validation de l'ID utilisateur
    if (!userId || userId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID provided'
      });
    }

    // Trouver l'utilisateur par ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Vérifier s'il y a un historique IP
    if (!user.ipHistory || user.ipHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No IP history found for this user'
      });
    }

    // Trouver l'IP la plus récente (trié par timestamp descendant)
    const sortedIpHistory = user.ipHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestIpEntry = sortedIpHistory[0];

    // Vérifier que l'IP existe et est valide
    if (!latestIpEntry.ip || typeof latestIpEntry.ip !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid IP found in user history'
      });
    }

    console.log(`Getting location info for latest IP: ${latestIpEntry.ip} for user: ${userId}`);

    // Obtenir les informations de géolocalisation pour cette IP
    const result = await ipInfoService.getIPInfo(latestIpEntry.ip);
    
    if (result.success) {
      const locationInfo = ipInfoService.extractLocationInfo(result.data);
      
      res.json({
        success: true,
        userId: userId,
        latestIpEntry: {
          ip: latestIpEntry.ip,
          timestamp: latestIpEntry.timestamp,
          action: latestIpEntry.action
        },
        locationInfo: locationInfo,
        totalIpEntries: user.ipHistory.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to get location information for IP: ${latestIpEntry.ip}`,
        error: result.error,
        latestIpEntry: {
          ip: latestIpEntry.ip,
          timestamp: latestIpEntry.timestamp,
          action: latestIpEntry.action
        }
      });
    }
  } catch (error) {
    console.error('Error getting user latest IP info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/ip/user/test/create - Créer un utilisateur de test avec historique IP
router.post('/user/test/create', async (req, res) => {
  try {
    // Créer un utilisateur de test temporaire
    const testUser = new User({
      email: `test_${Date.now()}@example.com`,
      fullName: 'Test User for IP History',
      password: 'temporary123',
      phone: '+1234567890',
      isVerified: true,
      ipHistory: [
        {
          ip: '38.165.230.210', // IP Argentine (exemple fourni)
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
          action: 'register'
        },
        {
          ip: '8.8.8.8', // IP Google DNS
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
          action: 'login'
        },
        {
          ip: '1.1.1.1', // IP Cloudflare
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
          action: 'login'
        },
        {
          ip: '185.60.216.35', // IP Française
          timestamp: new Date(), // Maintenant (IP la plus récente)
          action: 'login'
        }
      ]
    });

    const savedUser = await testUser.save();

    res.json({
      success: true,
      message: 'Test user created with IP history',
      testUserId: savedUser._id,
      ipHistoryCount: savedUser.ipHistory.length,
      testEndpoint: `/api/ip/user/${savedUser._id}/latest`,
      note: 'You can now test the latest IP endpoint with this user ID'
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router; 