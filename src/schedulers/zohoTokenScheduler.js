const cron = require('node-cron');
const axios = require('axios');
const ZohoConfig = require('../models/ZohoConfig');
const { config } = require('../config/env');

/**
 * Scheduler pour rafraîchir automatiquement les tokens Zoho
 * S'exécute toutes les 30 minutes pour vérifier et rafraîchir les tokens expirés
 */
const startZohoTokenScheduler = () => {
  // Tâche qui s'exécute toutes les 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('🔄 [Zoho Token Scheduler] Vérification des tokens Zoho...');
      
      const configs = await ZohoConfig.find({});
      
      for (const zohoConfig of configs) {
        try {
          // Vérifier si le token expire dans les 5 prochaines minutes
          const now = new Date();
          const expiresAt = new Date(zohoConfig.tokenExpiresAt);
          const timeUntilExpiry = expiresAt - now;
          const fiveMinutes = 5 * 60 * 1000;
          
          if (timeUntilExpiry <= fiveMinutes) {
            console.log(`🔄 [Zoho Token Scheduler] Rafraîchissement du token pour l'utilisateur ${zohoConfig.userId}`);
            
            // Rafraîchir le token
            const response = await axios.post(
              `https://accounts.zoho.eu/oauth/v2/token`,
              null,
              {
                params: {
                  refresh_token: zohoConfig.refreshToken,
                  client_id: config.ZOHO_CLIENT_ID,
                  client_secret: config.ZOHO_CLIENT_SECRET,
                  grant_type: 'refresh_token'
                }
              }
            );
            
            if (response.data && response.data.access_token) {
              zohoConfig.accessToken = response.data.access_token;
              zohoConfig.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in * 1000));
              await zohoConfig.save();
              
              console.log(`✅ [Zoho Token Scheduler] Token rafraîchi avec succès pour l'utilisateur ${zohoConfig.userId}`);
            }
          }
        } catch (error) {
          console.error(`❌ [Zoho Token Scheduler] Erreur lors du rafraîchissement du token pour l'utilisateur ${zohoConfig.userId}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ [Zoho Token Scheduler] Erreur générale:', error.message);
    }
  });
  
  console.log('✅ [Zoho Token Scheduler] Scheduler démarré - Vérification toutes les 30 minutes');
};

module.exports = { startZohoTokenScheduler };

