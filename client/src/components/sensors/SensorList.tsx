import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Trash2, Battery, AlertTriangle, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Sensor, SensorType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import SensorAddModal from './SensorAddModal';

interface SensorListProps {
  propertyId: string;
}

const SensorList: React.FC<SensorListProps> = ({ propertyId }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sensors for this property
  const { data: sensors = [], isLoading, error } = useQuery({
    queryKey: [`/api/properties/${propertyId}/sensors`],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/properties/${propertyId}/sensors`, {
          method: 'GET'
        });
        
        // Make sure we have an array
        const sensorData = Array.isArray(response) ? response : [];
        return sensorData;
      } catch (err) {
        throw err;
      }
    },
    enabled: !!propertyId
  });

  // Delete sensor mutation
  const deleteSensorMutation = useMutation({
    mutationFn: async (sensorId: number) => {
      return apiRequest(`/api/sensors/${sensorId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      // Invalidate and refetch sensors
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/sensors`] });
      
      toast({
        title: 'Sensor removed',
        description: 'The sensor has been successfully removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove the sensor. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleDeleteSensor = (id: number) => {
    if (window.confirm('Are you sure you want to remove this sensor?')) {
      deleteSensorMutation.mutate(id);
    }
  };

  // Get sensor icon based on type
  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case 'moisture':
        return <div className="p-2 bg-blue-100 rounded-full text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg></div>;
      case 'temperature':
        return <div className="p-2 bg-red-100 rounded-full text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg></div>;
      case 'air-quality':
        return <div className="p-2 bg-green-100 rounded-full text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8"></path><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.789V2"></path></svg></div>;
      default:
        return <div className="p-2 bg-gray-100 rounded-full text-gray-600"><Activity size={16} /></div>;
    }
  };

  // Format sensor type for display
  const formatSensorType = (type: SensorType): string => {
    switch (type) {
      case 'moisture':
        return 'Moisture Sensor';
      case 'temperature':
        return 'Temperature Sensor';
      case 'air-quality':
        return 'Air Quality Sensor';
      default:
        return 'Unknown Sensor';
    }
  };

  // Format battery level
  const getBatteryIcon = (level: number) => {
    if (level < 20) {
      return <div className="flex items-center text-red-500"><Battery size={14} className="mr-1" /> {level}%</div>;
    } else if (level < 50) {
      return <div className="flex items-center text-amber-500"><Battery size={14} className="mr-1" /> {level}%</div>;
    } else {
      return <div className="flex items-center text-green-600"><Battery size={14} className="mr-1" /> {level}%</div>;
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Sensors</h3>
          <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 p-3 rounded-md">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Sensors</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Add Sensor
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sensors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            This property doesn't have any sensors installed yet. Add your first sensor to start monitoring environmental conditions.
          </p>
          <div className="mt-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Sensor
            </button>
          </div>
        </div>
        
        {/* Add Sensor Modal */}
        <SensorAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          propertyId={propertyId}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Sensors</h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add Sensor
        </button>
      </div>

      {sensors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <div 
              key={sensor.id} 
              className={`p-4 border rounded-lg flex ${
                sensor.status === 'inactive' ? 'bg-gray-50 border-gray-200' : 
                sensor.isWarning ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="mr-3">
                {getSensorIcon(sensor.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium">{formatSensorType(sensor.type)}</h4>
                    <p className="text-xs text-gray-500 mb-1">Location: {sensor.location}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteSensor(Number(sensor.id))}
                    className="text-gray-400 hover:text-red-500"
                    title="Remove sensor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      sensor.isWarning ? 'text-amber-600' : 'text-gray-600'
                    }`}>
                      {sensor.currentReading}
                      {sensor.isWarning && (
                        <AlertTriangle size={14} className="ml-1 inline text-amber-500" />
                      )}
                    </span>
                  </div>
                  <div className="text-xs">
                    {getBatteryIcon(sensor.batteryLevel)}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>Updated: {new Date(sensor.lastUpdated).toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    sensor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sensor.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sensors added</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first sensor to this property.
          </p>
          <div className="mt-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Sensor
            </button>
          </div>
        </div>
      )}

      {/* Add Sensor Modal */}
      <SensorAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        propertyId={propertyId}
      />
    </div>
  );
};

export default SensorList;