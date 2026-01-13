import cloudinary from 'cloudinary';
import { config } from '../config/env';

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: config.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET
};

// Only configure if we have the required credentials
if (cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret) {
  cloudinary.v2.config(cloudinaryConfig);
  console.log('✅ Cloudinary configured successfully:', { 
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key ? `${cloudinaryConfig.api_key.substring(0, 4)}...` : 'missing',
    has_api_secret: !!cloudinaryConfig.api_secret
  });
  
  // Check for upload preset
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!uploadPreset) {
    console.warn('⚠️  CLOUDINARY_UPLOAD_PRESET is not configured.');
    console.warn('💡 For more reliable uploads (without clock sync issues), configure an unsigned upload preset:');
    console.warn('   1. Go to Cloudinary Dashboard > Settings > Upload');
    console.warn('   2. Create an "Unsigned" upload preset');
    console.warn('   3. Set CLOUDINARY_UPLOAD_PRESET in your .env file');
    console.warn('   Without this, uploads will use signed mode which requires system clock sync.');
  } else {
    console.log('✅ Cloudinary upload preset configured:', uploadPreset);
  }
} else {
  console.error('❌ Cloudinary not fully configured. Missing:', {
    cloud_name: !cloudinaryConfig.cloud_name,
    api_key: !cloudinaryConfig.api_key,
    api_secret: !cloudinaryConfig.api_secret,
    env_vars: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'missing',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing'
    }
  });
}

/**
 * Upload a file to Cloudinary
 * @param filePath - Path to the file to upload
 * @param folder - Folder in Cloudinary to store the file
 * @returns Promise with url and public_id
 */
export const uploadToCloudinary = async (filePath: string, folder: string): Promise<{ url: string; public_id: string }> => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder,
      resource_type: 'auto' // Automatically detect file type
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param public_id - Public ID of the file to delete
 * @returns Promise<void>
 */
export const deleteFromCloudinary = async (public_id: string): Promise<void> => {
  try {
    await cloudinary.v2.uploader.destroy(public_id);
  } catch (error: any) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};
