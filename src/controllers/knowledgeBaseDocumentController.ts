import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import Document from '../models/Document';
import Company from '../models/Company';
import dbConnect from '../lib/dbConnect';
import { extractTextFromFile, calculateDocumentMetrics } from '../services/documentProcessingService';
import { chunkDocument } from '../utils/textProcessing';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService';
import mongoose from 'mongoose';

// Upload a new document
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, description, tags, uploadedBy, userId } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Processing uploaded file: ${req.file.originalname}`);

    // Validate companyId
    const company = await Company.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const companyId = company._id;

    // Upload file to Cloudinary
    const filePath = req.file.path;
    const { url: fileUrl, public_id: cloudinaryPublicId } = await uploadToCloudinary(filePath, 'documents');

    // Extract text from the file
    const fileType = req.file.mimetype;
    const extractedText = await extractTextFromFile(filePath, fileType);

    // Chunk the document
    const chunks = chunkDocument(extractedText);

    // Calculate document metrics
    const metrics = calculateDocumentMetrics(extractedText);

    // Create document record
    const document = new Document({
      name: name || req.file.originalname,
      description: description || '',
      fileUrl,
      cloudinaryPublicId,
      fileType,
      content: extractedText,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      uploadedBy,
      companyId,
      chunks: chunks.map((chunk, index) => ({
        content: chunk,
        index
      })),
      metadata: {
        ...metrics,
        createdAt: new Date(),
        modifiedAt: new Date()
      }
    });

    await document.save();

    // Delete local file after upload
    await fs.unlink(filePath);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        name: document.name,
        description: document.description,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        tags: document.tags,
        uploadedAt: document.uploadedAt,
        isProcessed: document.isProcessed,
        metadata: document.metadata
      }
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    // Clean up local file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
};

// Get all documents
export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { userId } = req.query;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Find the company associated with the userId
    const company = await Company.findOne({ userId: new mongoose.Types.ObjectId(userId as string) });

    if (!company) {
      return res.status(404).json({ error: 'No company found for this user' });
    }

    const companyId = company._id;

    const documents = await Document.find({ companyId }).select('-content -chunks');
    res.status(200).json({ documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
  }
};

// Get document by ID
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json({ document });
  } catch (error: any) {
    console.error(`Error fetching document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch document', details: error.message });
  }
};

// Delete document
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(document.cloudinaryPublicId);

    await Document.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete document', details: error.message });
  }
};

// Update document
export const updateDocument = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { name, description, tags } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (name) document.name = name;
    if (description) document.description = description;
    if (tags) document.tags = tags.split(',').map((tag: string) => tag.trim());

    await document.save();

    res.status(200).json({
      message: 'Document updated successfully',
      document: {
        id: document._id,
        name: document.name,
        description: document.description,
        tags: document.tags
      }
    });
  } catch (error: any) {
    console.error(`Error updating document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update document', details: error.message });
  }
};

