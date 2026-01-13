import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import ZohoConfig from '../models/ZohoConfig';
import { config } from '../config/env';

/**
 * Middleware pour gérer automatiquement le refresh des tokens Zoho
 * Vérifie si le token est expiré et le rafraîchit automatiquement
 */
export const zohoTokenMiddleware = async (req: Request & { zohoAccessToken?: string; zohoConfig?: any; userId?: string; gigId?: string }, res: Response, next: NextFunction) => {
  try {
    // Extraire userId de l'Authorization header (format: gigId:userId)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(419).json({
        success: false,
        message: "Token d'autorisation requis"
      });
    }

    const token = authHeader.split(' ')[1];
    const [gigId, userId] = token.split(':');
    if (!userId) {
      return res.status(419).json({
        success: false,
        message: "Format d'autorisation invalide"
      });
    }

    // Récupérer la configuration Zoho de l'utilisateur
    const zohoConfig = await ZohoConfig.findOne({ userId }).sort({ updated_at: -1 });
    
    if (!zohoConfig) {
      return res.status(449).json({
        success: false,
        message: "Configuration Zoho non trouvée"
      });
    }

    // Vérifier si le token est expiré (avec une marge de sécurité de 5 minutes)
    const lastUpdated = zohoConfig.updated_at || zohoConfig.lastUpdated || zohoConfig.updatedAt;
    const expiresIn = zohoConfig.expiresIn || 3600; // Default to 1 hour if not set
    const tokenExpiryTime = new Date(lastUpdated).getTime() + (expiresIn * 1000);
    const currentTime = Date.now();
    const safetyMargin = 5 * 60 * 1000; //5 minutes

    if (currentTime >= (tokenExpiryTime - safetyMargin)) {
      console.log(`Token expiré pour l'utilisateur ${userId}, rafraîchissement en cours...`);
      
      try {
        // Rafraîchir le token
        const response = await axios.post(config.ZOHO_TOKEN_URL || '', null, {
          params: {
            refresh_token: zohoConfig.refreshToken,
            client_id: zohoConfig.clientId,
            client_secret: zohoConfig.clientSecret,
            grant_type: 'refresh_token'
          }
        });

        if (!response.data.access_token) {        
          throw new Error('Token non reçu dans la réponse');
        }

        // Mettre à jour la configuration avec le nouveau token
        await ZohoConfig.findOneAndUpdate(
          { userId },
          {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token || zohoConfig.refreshToken,
            expiresIn: response.data.expires_in,
            updated_at: new Date(),
            lastUpdated: new Date()
          }
        );

        console.log(`Token rafraîchi avec succès pour l'utilisateur ${userId}`);
        
        // Ajouter le nouveau token à la requête
        req.zohoAccessToken = response.data.access_token;
        
      } catch (refreshError: any) {    
        console.error(`Erreur lors du rafraîchissement du token pour l'utilisateur ${userId}:`, refreshError.message);
        
        // Si le refresh token est invalide, supprimer la configuration
        if (refreshError.response?.status === 400 && refreshError.response?.data?.error === 'invalid_grant') {
          await ZohoConfig.deleteMany({ userId });
          return res.status(401).json({
            success: false,
            message: "Refresh token expiré. Veuillez vous reconnecter à Zoho.",
            requiresReconnection: true
          });
        }
        
        return res.status(500).json({
          success: false,
          message: "Erreur lors du rafraîchissement du token"
        });
      }
    } else {
      // Token encore valide
      req.zohoAccessToken = zohoConfig.accessToken;
    }

    // Ajouter les informations Zoho à la requête
    req.zohoConfig = zohoConfig;
    req.userId = userId;
    req.gigId = gigId;

    next();
  } catch (error: any) {
    console.error('Erreur dans zohoTokenMiddleware:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification du token Zoho"
    });
  }
};

/**
 * Middleware pour les routes qui nécessitent une configuration Zoho
 */
export const requireZohoConfig = async (req: Request & { zohoConfig?: any }, res: Response, next: NextFunction) => {
  if (!req.zohoConfig) {
    return res.status(401).json({
      success: false,
      message: "Configuration Zoho requise"
    });
  }
  next();
};

