import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PropertyStatus, RiskLevel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface PropertyAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyAddModal: React.FC<PropertyAddModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('compliant');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('none');
  const [riskReason, setRiskReason] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [units, setUnits] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [lastRenovation, setLastRenovation] = useState('');
  const [propertyManager, setPropertyManager] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setAddress('');
      setDescription('');
      setStatus('compliant');
      setRiskLevel('none');
      setRiskReason('');
      setPropertyType('Residential');
      setUnits('');
      setYearBuilt('');
      setLastRenovation('');
      setPropertyManager('');
      setError(null);
    }
  }, [isOpen]);
  
  // Add property mutation
  const addPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      return apiRequest('/api/properties', {
        method: 'POST',
        data: propertyData
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch properties
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      toast({
        title: 'Property added successfully',
        description: 'The new property has been created.',
      });
      
      // Close modal after successful submission
      onClose();
    },
    onError: (err: any) => {
      console.error('Error adding property:', err);
      setError('Failed to add property. Please check your information and try again.');
      toast({
        title: 'Error',
        description: 'There was an error adding the property. Please try again.',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  // Form validation
  const validateForm = () => {
    if (!name.trim()) {
      setError('Property name is required');
      return false;
    }
    
    if (!address.trim()) {
      setError('Property address is required');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Prepare property data
    const propertyData = {
      name,
      address,
      description: description.trim() || null,
      status,
      riskLevel,
      riskReason: riskReason.trim() || null,
      propertyType: propertyType.trim() || null,
      units: units ? parseInt(units, 10) : null,
      yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : null,
      lastRenovation: lastRenovation.trim() || null,
      propertyManager: propertyManager.trim() || null
    };
    
    addPropertyMutation.mutate(propertyData);
  };
  
  // Warning message for risk levels
  const getRiskMessage = () => {
    if (riskLevel === 'high') {
      return 'High risk properties require immediate attention and corrective action plans.';
    } else if (riskLevel === 'medium') {
      return 'Medium risk properties should be monitored closely and addressed within 30 days.';
    } else if (riskLevel === 'low') {
      return 'Low risk properties should be monitored and addressed during routine maintenance.';
    }
    
    return '';
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add New Property</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Name*
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  placeholder="e.g. Maple Street Apartments"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address*
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  placeholder="e.g. 42 Maple Street, London"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of the property"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          
          {/* Property Details */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isSubmitting}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                  <option value="Apartment Block">Apartment Block</option>
                  <option value="Terraced Housing">Terraced Housing</option>
                  <option value="Semi-Detached">Semi-Detached</option>
                  <option value="Detached">Detached</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Units
                </label>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 24"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 1985"
                  min="1800"
                  max={new Date().getFullYear()}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Renovation
                </label>
                <input
                  type="text"
                  value={lastRenovation}
                  onChange={(e) => setLastRenovation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 2018 or Not renovated"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Manager
                </label>
                <input
                  type="text"
                  value={propertyManager}
                  onChange={(e) => setPropertyManager(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Jane Smith"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          
          {/* Compliance Status */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Compliance Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status*
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={isSubmitting}
                >
                  <option value="compliant">Compliant</option>
                  <option value="at-risk">At Risk</option>
                  <option value="non-compliant">Non-Compliant</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isSubmitting}
                >
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              {riskLevel !== 'none' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Reason
                    {riskLevel === 'high' && <span className="text-red-600">*</span>}
                  </label>
                  <textarea
                    value={riskReason}
                    onChange={(e) => setRiskReason(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      riskLevel === 'high' && !riskReason.trim() 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    rows={2}
                    placeholder="Explain the reason for the risk assessment"
                    required={riskLevel === 'high'}
                    disabled={isSubmitting}
                  />
                </div>
              )}
              
              {riskLevel !== 'none' && (
                <div className="md:col-span-2 p-3 rounded-md" style={{ 
                  backgroundColor: riskLevel === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                  riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
                                  'rgba(59, 130, 246, 0.1)'
                }}>
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5" style={{
                      color: riskLevel === 'high' ? 'rgb(239, 68, 68)' : 
                            riskLevel === 'medium' ? 'rgb(245, 158, 11)' : 
                            'rgb(59, 130, 246)'
                    }} />
                    <span className="text-sm">{getRiskMessage()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Form actions */}
          <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Property
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PropertyAddModal;