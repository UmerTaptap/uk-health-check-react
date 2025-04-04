import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DocumentUploadForm from './DocumentUploadForm';

interface DocumentUploadModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUploadModal({
  propertyId,
  isOpen,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  // We use a string propertyId in the UI but the DocumentUploadForm
  // handles converting it to a number when communicating with the API
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Compliance Document</DialogTitle>
          <DialogDescription>
            Upload certificates and compliance documents for this property. Supported file types: PDF, DOCX, JPG, PNG.
          </DialogDescription>
        </DialogHeader>
        <DocumentUploadForm 
          propertyId={propertyId} 
          onSuccess={onSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
}