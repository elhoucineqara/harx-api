import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument
} from '../controllers/knowledgeBaseDocumentController';
import { analyzeDocument } from '../controllers/RagController';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/html'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, TXT, MD, and HTML files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload a new document
router.post('/upload', upload.single('file'), uploadDocument);

// Get all documents
router.get('/', getAllDocuments);

// Analyze a document (MUST be before /:id route to avoid route conflicts)
router.get('/:id/analyze', analyzeDocument);

// Get a single document by ID
router.get('/:id', getDocumentById);

// Delete a document
router.delete('/:id', deleteDocument);

// Update document metadata
router.put('/:id', updateDocument);

export default router;

