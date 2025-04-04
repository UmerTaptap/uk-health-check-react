import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, AlertTriangle, CheckCircle, Clock, Download, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';

type Document = {
  id: number;
  propertyId: number | null;
  title: string;
  type: string;
  fileUrl: string;
  status: string;
  issueDate: string;
  expiryDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type DocumentsListProps = {
  propertyId: number;
  onUpload?: () => void;
};

export default function DocumentsList({ propertyId, onUpload }: DocumentsListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: documents, isLoading, error, refetch } = useQuery<Document[]>({
    queryKey: [`/api/properties/${propertyId}/documents`],
  });

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/documents/${documentToDelete}`);
      
      toast({
        title: 'Document deleted',
        description: 'The document has been successfully deleted.',
      });
      
      refetch();
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (id: number) => {
    setDocumentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'gas_safety':
        return <Badge className="bg-orange-500">Gas Safety</Badge>;
      case 'electrical':
        return <Badge className="bg-yellow-500">Electrical</Badge>;
      case 'epc':
        return <Badge className="bg-green-500">EPC</Badge>;
      case 'fire_safety':
        return <Badge className="bg-red-500">Fire Safety</Badge>;
      case 'asbestos':
        return <Badge className="bg-purple-500">Asbestos</Badge>;
      default:
        return <Badge>Other</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Valid</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-amber-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Expired</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle>Property Documents</CardTitle>
            <CardDescription>Manage compliance certificates and property documents</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
                <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-gray-500">Loading documents...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle>Property Documents</CardTitle>
            <CardDescription>Manage compliance certificates and property documents</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-3" />
            <p className="text-red-500 font-medium mb-2">Error loading documents</p>
            <p className="text-gray-500 mb-4">There was a problem loading the documents. Please try again.</p>
            <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle>Property Documents</CardTitle>
            <CardDescription>Manage compliance certificates and property documents</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-4">No documents available for this property</p>
            {onUpload && (
              <Button onClick={onUpload} className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Property Documents</CardTitle>
            <CardDescription>Manage compliance certificates and property documents</CardDescription>
          </div>
          {onUpload && (
            <Button onClick={onUpload} size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base truncate">{doc.title}</CardTitle>
                    <div className="flex justify-between items-center">
                      {getDocumentTypeIcon(doc.type)}
                      {getStatusBadge(doc.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-0">
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <div>Issued: {format(new Date(doc.issueDate), 'dd MMM yyyy')}</div>
                      {doc.expiryDate && (
                        <div>Expires: {format(new Date(doc.expiryDate), 'dd MMM yyyy')}</div>
                      )}
                    </div>
                    {doc.notes && <p className="text-sm mt-2 line-clamp-2">{doc.notes}</p>}
                  </CardContent>
                  <CardFooter className="flex justify-between p-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" /> View
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => confirmDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Document Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDocument}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}