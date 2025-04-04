import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Download, MoreHorizontal, FileText, Upload, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { queryClient } from '@/lib/queryClient';
import DocumentUploadModal from './DocumentUploadModal';

// Import Document as PropertyDocument to avoid conflict with DOM Document
import type { Document as PropertyDocument, DocumentStatus, DocumentType } from '@/lib/types';

interface DocumentListProps {
  propertyId: string;
}

export default function DocumentList({ propertyId }: DocumentListProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['/api/properties', propertyId, 'documents'],
    queryFn: async () => {
      try {
        // Import apiRequest directly to ensure we're using the right function
        const apiRequest = (await import('@/lib/queryClient')).apiRequest;
        
        const response = await apiRequest(`/api/properties/${propertyId}/documents`, {
          method: 'GET'
        });
        
        return response as PropertyDocument[];
      } catch (error) {
        console.error('Error fetching documents:', error);
        throw new Error('Failed to fetch documents');
      }
    },
    enabled: !!propertyId
  });

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'gas_safety': return 'Gas Safety';
      case 'electrical': return 'Electrical Safety';
      case 'epc': return 'EPC';
      case 'fire_safety': return 'Fire Safety';
      case 'asbestos': return 'Asbestos';
      default: return 'Other';
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-emerald-500">Valid</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-amber-500">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-rose-500">Expired</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleDocumentUpload = () => {
    // Invalidate the documents query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'documents'] });
    setIsUploadModalOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Documents</span>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse">Loading documents...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Documents</span>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8 text-rose-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Error loading documents. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Documents</span>
          <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents?.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>No documents have been uploaded for this property.</p>
            <Button 
              variant="secondary" 
              className="mt-4" 
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Your First Document
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.map((doc: PropertyDocument) => (
                <TableRow key={doc.id.toString()}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>{getDocumentTypeLabel(doc.type)}</TableCell>
                  <TableCell>{format(new Date(doc.issueDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {doc.expiryDate ? format(new Date(doc.expiryDate), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const a = window.document.createElement('a');
                            a.href = doc.fileUrl;
                            a.download = doc.title;
                            window.document.body.appendChild(a);
                            a.click();
                            window.document.body.removeChild(a);
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <DocumentUploadModal
        propertyId={propertyId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleDocumentUpload}
      />
    </Card>
  );
}