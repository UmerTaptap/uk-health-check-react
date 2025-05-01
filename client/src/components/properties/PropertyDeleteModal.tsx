import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Property, PropertyData } from '@/lib/types';

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface PropertyDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyData | null;
}

const PropertyDeleteModal = ({ isOpen, onClose, property }: PropertyDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // No property selected or modal closed - nothing to render
  if (!isOpen || !property) return null;

  const handleDelete = async () => {
    if (!property) return;
    
    try {
      setIsDeleting(true);
      
      const response = await apiRequest(`/api/properties/${property._id}`, {
        method: 'DELETE'
      });
      
      // Close modal
      onClose();
      
      // Show success message
      toast({
        title: 'Property deleted',
        description: `${property.name} has been successfully deleted.`,
        variant: 'default'
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the property. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Property
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-md border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Warning: This action cannot be undone</p>
              <p className="mt-1">
                Deleting this property will permanently remove it from the system, 
                along with all associated sensors, alerts, and compliance data.
              </p>
            </div>
          </div>
          
          <div className="p-3 border rounded-md">
            <p className="text-sm font-medium text-gray-500">Property Details</p>
            <h3 className="font-semibold text-gray-900">{property.name}</h3>
            <p className="text-sm text-gray-600">{property.address}</p>
            <div className="mt-1 text-xs text-gray-500">
              <p>Risk Level: <span className="font-medium">{property.compliance.riskLevel}</span></p>
              <p>Status: <span className="font-medium">{property.compliance.currentStatus}</span></p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Property
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDeleteModal;