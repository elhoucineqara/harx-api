import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Document from '../models/Document';
import Company from '../models/Company';
import File from '../models/File';
import multer from 'multer';
import { config } from '../config/env';
import axios from 'axios';
import FormData from 'form-data';

const router = Router();

// Configure multer for file uploads (store in memory for Telnyx upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, JPEG, and PNG files are allowed.'));
    }
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const searchParams = req.query;
    const companyId = searchParams.companyId;

    let query = {};
    if (companyId) {
      query = { companyId };
    }

    const documents = await Document.find(query);

    return res.json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// IMPORTANT: This route must handle file uploads for Telnyx
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    await dbConnect();

    // If file is uploaded, upload to Telnyx
    if (req.file) {
      if (!config.TELNYX_API_KEY) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'TELNYX_API_KEY not configured'
        });
      }

      console.log('📄 Uploading document to Telnyx:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Use axios directly to upload to Telnyx API
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.body.filename || req.file.originalname,
        contentType: req.file.mimetype
      });

      if (req.body.customer_reference) {
        formData.append('customer_reference', req.body.customer_reference);
      }

      // Upload to Telnyx using axios
      const telnyxResponse = await axios.post(
        'https://api.telnyx.com/v2/documents',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${config.TELNYX_API_KEY}`,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('✅ Document uploaded to Telnyx:', telnyxResponse.data.data.id);

      // Return Telnyx document data
      return res.status(201).json({
        id: telnyxResponse.data.data.id,
        filename: telnyxResponse.data.data.filename,
        size: telnyxResponse.data.data.size,
        sha256: telnyxResponse.data.data.sha256,
        status: telnyxResponse.data.data.status,
        content_type: telnyxResponse.data.data.content_type,
        customerReference: telnyxResponse.data.data.customer_reference,
        createdAt: telnyxResponse.data.data.created_at
      });
    }

    // If no file, handle as regular document creation (legacy support)
    const documentData = req.body;

    // Validate company
    if (documentData.userId) {
      const company = await Company.findOne({ userId: documentData.userId });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }
    }

    const document = new Document(documentData);
    await document.save();

    return res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document,
    });
  } catch (error: any) {
    console.error('❌ Error uploading document:', error);
    
    // Handle Telnyx errors
    if (error.status === 400 || error.code === 'validation_error') {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Invalid file format or size'
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to upload document'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  await dbConnect();
  const { id } = req.params;

  try {
    const file = await File.findByIdAndDelete(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    return res.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
