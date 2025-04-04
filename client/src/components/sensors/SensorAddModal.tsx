import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { SensorType, SensorStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface SensorAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

const SensorAddModal: React.FC<SensorAddModalProps> = ({ isOpen, onClose, propertyId }) => {
  const [type, setType] = useState<SensorType>('moisture');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<SensorStatus>('active');
  const [currentReading, setCurrentReading] = useState('');
  const [batteryLevel, setBatteryLevel] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setType('moisture');
      setLocation('');
      setStatus('active');
      setCurrentReading('');
      setBatteryLevel('100');
      setError(null);
    }
  }, [isOpen]);
  
  // Add sensor mutation
  const addSensorMutation = useMutation({
    mutationFn: async (sensorData: any) => {
      return apiRequest('POST', '/api/sensors', sensorData);
    },
    onSuccess: () => {
      // Invalidate queries to refetch sensors
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/sensors`] });
      
      toast({
        title: 'Sensor added successfully',
        description: 'The new sensor has been installed.',
      });
      
      // Close modal after successful submission
      onClose();
    },
    onError: (err: any) => {
      console.error('Error adding sensor:', err);
      setError('Failed to add sensor. Please check your information and try again.');
      
      toast({
        title: 'Error',
        description: 'There was an error adding the sensor. Please try again.',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  // Form validation
  const validateForm = () => {
    if (!location.trim()) {
      setError('Sensor location is required');
      return false;
    }
    
    if (batteryLevel && (parseInt(batteryLevel) < 0 || parseInt(batteryLevel) > 100)) {
      setError('Battery level must be between 0 and 100');
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
    
    // Generate initial reading based on sensor type if none provided
    let reading = currentReading;
    if (!reading) {
      switch(type) {
        case 'moisture':
          reading = '45% RH';
          break;
        case 'temperature':
          reading = '21°C';
          break;
        case 'air-quality':
          reading = 'Good (AQI 32)';
          break;
      }
    }
    
    // Prepare sensor data
    const sensorData = {
      propertyId: Number(propertyId),
      type,
      location: location.trim(),
      status,
      currentReading: reading,
      batteryLevel: batteryLevel ? parseInt(batteryLevel) : 100
    };
    
    addSensorMutation.mutate(sensorData);
  };
  
  // Get default placeholder based on sensor type
  const getReadingPlaceholder = (): string => {
    switch(type) {
      case 'moisture':
        return 'e.g. 45% RH';
      case 'temperature':
        return 'e.g. 21°C';
      case 'air-quality':
        return 'e.g. Good (AQI 32)';
      default:
        return '';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add New Sensor</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensor Type*
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SensorType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            >
              <option value="moisture">Moisture Sensor</option>
              <option value="temperature">Temperature Sensor</option>
              <option value="air-quality">Air Quality Sensor</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location*
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. Living Room, Bathroom, Kitchen"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SensorStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Reading (Optional)
              </label>
              <input
                type="text"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={getReadingPlaceholder()}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use default reading
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Battery Level (%)
              </label>
              <input
                type="number"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                max="100"
                disabled={isSubmitting}
              />
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
          <div className="flex justify-end space-x-3 border-t pt-4 mt-4">
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
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Sensor
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SensorAddModal;