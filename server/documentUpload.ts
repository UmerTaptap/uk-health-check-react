import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import { InsertDocument } from '@shared/schema';

/**
 * Handle document upload for compliance certificates
 */
export async function handleDocumentUpload(req: Request, res: Response) {
  try {
    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files were uploaded.' 
      });
    }

    // Get document metadata from request body
    const {
      propertyId,
      title,
      type,
      issueDate,
      expiryDate,
      status,
      uploadedBy,
      notes
    } = req.body;

    // Validate required fields
    if (!propertyId || !title || !type || !issueDate || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyId, title, type, issueDate, and status are required'
      });
    }

    // Get the uploaded file
    const file = req.files.file as UploadedFile;
    
    // Validate file type (accept pdf, docx, jpg, png)
    const allowedExtensions = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.name).toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Allowed types: PDF, DOCX, JPG, JPEG, PNG'
      });
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Save file
    const filePath = path.join(uploadDir, fileName);
    await file.mv(filePath);
    
    // Create relative file URL for storage
    const fileUrl = `/uploads/documents/${fileName}`;
    
    // Create document record in storage
    const documentData: InsertDocument = {
      propertyId: Number(propertyId),
      title,
      type,
      fileUrl,
      issueDate: new Date(issueDate),
      status,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      uploadedBy: uploadedBy ? Number(uploadedBy) : undefined,
      notes
    };
    
    const document = await storage.createDocument(documentData);
    
    // Return success with document data
    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
}

/**
 * Serve the uploaded document
 */
export function serveDocument(req: Request, res: Response) {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads/documents', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }
  
  // Send file
  res.sendFile(filePath);
}