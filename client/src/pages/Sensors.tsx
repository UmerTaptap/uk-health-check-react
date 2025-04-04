import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Filter, 
  Search, 
  ArrowUpDown,
  Activity,
  Thermometer,
  Droplet,
  Wind
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Property, Sensor, SensorType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SensorAddModal from '@/components/sensors/SensorAddModal';
import { Skeleton } from '@/components/ui/skeleton';

const formatSensorType = (type: SensorType): string => {
  switch (type) {
    case 'moisture':
      return 'Moisture';
    case 'temperature':
      return 'Temperature';
    case 'air-quality':
      return 'Air Quality';
    default:
      return 'Other';
  }
};

const getSensorTypeIcon = (type: SensorType) => {
  switch (type) {
    case 'moisture':
      return <Droplet className="h-4 w-4" />;
    case 'temperature':
      return <Thermometer className="h-4 w-4" />;
    case 'air-quality':
      return <Wind className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getBatteryStatusColor = (level: number) => {
  if (level <= 20) return 'bg-red-100 text-red-800';
  if (level <= 50) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

const Sensors = () => {
  const [location, navigate] = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sensorTypeFilter, setSensorTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<string>('location');
  
  // Fetch all sensors
  const { data: sensors = [], isLoading: sensorsLoading } = useQuery({
    queryKey: ['/api/sensors'],
    queryFn: async () => {
      const response = await apiRequest('/api/sensors');
      return response || [];
    },
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });
  
  // Fetch all properties for property filter dropdown
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await apiRequest('/api/properties');
      return response || [];
    },
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });
  
  // Filter and sort sensors
  const filteredSensors = sensors.filter((sensor: Sensor) => {
    // Filter by search term (sensor location)
    if (searchTerm && !sensor.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by sensor type
    if (sensorTypeFilter !== 'all' && sensor.type !== sensorTypeFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== 'all' && sensor.status !== statusFilter) {
      return false;
    }
    
    // Filter by property
    if (selectedPropertyId && selectedPropertyId !== 'all' && sensor.propertyId.toString() !== selectedPropertyId) {
      return false;
    }
    
    return true;
  });
  
  // Sort sensors
  const sortedSensors = [...filteredSensors].sort((a: Sensor, b: Sensor) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'location':
        comparison = a.location.localeCompare(b.location);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'battery':
        comparison = a.batteryLevel - b.batteryLevel;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'updated':
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Find property name by property ID
  const getPropertyName = (propertyId: number): string => {
    const property = properties.find((p: Property) => Number(p.id) === propertyId);
    return property ? property.name : 'Unknown Property';
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSensorCount = (type: SensorType | 'all') => {
    if (type === 'all') return sensors.length;
    
    return sensors.filter((sensor: Sensor) => sensor.type === type).length;
  };

  const getWarningCount = () => {
    return sensors.filter((sensor: Sensor) => sensor.isWarning).length;
  };
  
  // Sensor stats
  const getActiveCount = () => {
    return sensors.filter((sensor: Sensor) => sensor.status === 'active').length;
  };
  
  const getInactiveCount = () => {
    return sensors.filter((sensor: Sensor) => sensor.status === 'inactive').length;
  };
  
  const getLowBatteryCount = () => {
    return sensors.filter((sensor: Sensor) => sensor.batteryLevel < 20).length;
  };
  
  // Loading UI
  if (sensorsLoading || propertiesLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          
          <div className="grid gap-6 mb-8 md:grid-cols-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-52 rounded-lg" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sensor Management</h1>
          <p className="text-gray-500">Monitor and manage sensors across all properties</p>
        </div>
        
        {/* Summary Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sensors.length}</div>
              <div className="text-sm text-muted-foreground">
                <span className="text-green-600">{getActiveCount()}</span> active, 
                <span className="text-gray-500 ml-1">{getInactiveCount()}</span> inactive
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <span className="flex items-center">
                  <span className="mr-2 p-1 rounded bg-orange-100">
                    <Thermometer className="h-4 w-4 text-orange-600" />
                  </span>
                  Temperature
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getSensorCount('temperature')}</div>
              <div className="text-sm text-muted-foreground">
                Monitoring real-time temperature data
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <span className="flex items-center">
                  <span className="mr-2 p-1 rounded bg-blue-100">
                    <Droplet className="h-4 w-4 text-blue-600" />
                  </span>
                  Moisture
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getSensorCount('moisture')}</div>
              <div className="text-sm text-muted-foreground">
                Monitoring humidity and moisture levels
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <span className="flex items-center">
                  <span className="mr-2 p-1 rounded bg-green-100">
                    <Wind className="h-4 w-4 text-green-600" />
                  </span>
                  Air Quality
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getSensorCount('air-quality')}</div>
              <div className="text-sm text-muted-foreground">
                Monitoring indoor air quality conditions
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-2">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 flex-grow max-w-4xl">
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-auto">
              <Select 
                value={selectedPropertyId || ''} 
                onValueChange={(value) => setSelectedPropertyId(value || null)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property: Property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Select 
                value={sensorTypeFilter} 
                onValueChange={(value) => setSensorTypeFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="moisture">Moisture</SelectItem>
                  <SelectItem value="air-quality">Air Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Sensor
          </Button>
        </div>
        
        {/* Sensors Grid */}
        {sortedSensors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedSensors.map((sensor: Sensor) => (
              <motion.div 
                key={sensor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
                  sensor.isWarning ? 'border-amber-200' : 
                  sensor.status === 'inactive' ? 'opacity-75' : ''
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base mb-1 flex items-center">
                          <span className={`p-1 rounded mr-2 ${
                            sensor.type === 'temperature' ? 'bg-orange-100' :
                            sensor.type === 'moisture' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {getSensorTypeIcon(sensor.type)}
                          </span>
                          {formatSensorType(sensor.type)} Sensor
                        </CardTitle>
                        <CardDescription>{sensor.location}</CardDescription>
                      </div>
                      <Badge variant={sensor.status === 'active' ? 'outline' : 'secondary'}>
                        {sensor.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Current Reading</div>
                        <div className={`text-lg font-medium ${sensor.isWarning ? 'text-amber-600' : ''}`}>
                          {sensor.currentReading}
                          {sensor.isWarning && " ⚠️"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Battery</div>
                        <Badge variant="outline" className={getBatteryStatusColor(sensor.batteryLevel)}>
                          {sensor.batteryLevel}%
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Link href={`/properties/${sensor.propertyId}`} className="text-blue-600 hover:underline">
                        {getPropertyName(Number(sensor.propertyId))}
                      </Link>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 text-xs text-gray-500">
                    Last updated: {new Date(sensor.lastUpdated).toLocaleString()}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Activity className="h-12 w-12" />
            </div>
            <h3 className="mt-4 text-base font-medium text-gray-900">No sensors found</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {searchTerm || selectedPropertyId || sensorTypeFilter !== 'all' || statusFilter !== 'all'
                ? "No sensors match your current filters. Try adjusting your search criteria."
                : "You haven't added any sensors yet. Start by adding a sensor to a property."}
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Sensor
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Sensor Modal */}
      <SensorAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        propertyId={selectedPropertyId || ''}
      />
      
    </PageTransition>
  );
};

export default Sensors;