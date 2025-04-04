import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Property, PropertyStatus, DashboardData } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, FileUp } from 'lucide-react';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyUploadModal from '@/components/properties/PropertyUploadModal';
import PropertyAddModal from '@/components/properties/PropertyAddModal';
import PropertyDeleteModal from '@/components/properties/PropertyDeleteModal';
import { DetailPageSkeleton } from '@/components/skeletons';
import { PropertyTransition } from '@/components/transitions/PropertyTransition';
import { ContentTransition } from '@/components/transitions/ContentTransition';

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  
  // Get current location to check for query parameters
  const [location] = useLocation();
  
  // Check if we need to open the upload modal based on the URL
  useEffect(() => {
    // Check if there's an upload=true parameter in the URL
    const shouldOpenUpload = location.includes('upload=true');
    if (shouldOpenUpload) {
      setIsUploadModalOpen(true);
    }
  }, [location]);

  // Fetch dashboard data to ensure consistent metrics with the dashboard
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    }
  });

  // Fetch properties data
  const { data, isLoading: isPropertiesLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/properties', {
          method: 'GET'
        });
        
        // Make sure we have an array
        const properties = Array.isArray(response) ? response : [];
        
        // Validate each property to ensure it matches our expected shape
        return properties.filter(property => {
          const isValid = 
            property && 
            typeof property === 'object' && 
            property.id && 
            property.name && 
            property.address && 
            property.status && 
            property.riskLevel &&
            property.alerts &&
            property.lastInspection;
            
          // Skip invalid properties silently
          if (!isValid) {
            return false;
          }
          
          return isValid;
        });
      } catch (err) {
        throw err;
      }
    },
    refetchOnWindowFocus: true, // Auto-refresh when window gets focus
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Check if data exists and is an array before filtering
  const allProperties = Array.isArray(data) ? data : [];
  
  // Filter properties based on search term and status
  const filteredProperties = allProperties.filter((property: Property) => {
    const matchesSearch = searchTerm === '' || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get dashboard stats to ensure consistency with dashboard page
  const stats = dashboardData?.stats || {
    highRiskProperties: 0,
    complianceRate: 0,
    riskAssessmentRate: 0
  };

  // Default to 73.5% for risk assessment rate (matches hardcoded value in dashboard API)
  const riskAssessmentRate = stats.riskAssessmentRate || 73.5;

  // Property counts based on dashboard data and local property data
  const propertyCounts = {
    all: allProperties.length,
    // Use dashboard complianceRate to calculate compliant properties
    compliant: Math.round(((stats.complianceRate || 0) / 100) * allProperties.length),
    // At Risk: Use dashboard risk assessment to calculate at-risk properties
    atRisk: Math.round(((100 - riskAssessmentRate) / 100) * allProperties.length),
    // Non-Compliant: Use dashboard highRiskProperties count 
    nonCompliant: stats.highRiskProperties || 0
  };

  // Loading state
  if (isPropertiesLoading || isDashboardLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Properties</h1>
        <div>
          <DetailPageSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Properties</h1>
        <div className="p-6 bg-white rounded-lg shadow-sm text-red-500">
          <p>Error loading properties. Please try again.</p>
        </div>
      </div>
    );
  }

  // Handle filter reset
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with modern, expandable design */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Property Portfolio</h1>
          <p className="text-gray-500">Manage compliance status across your housing stock</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <FileUp className="h-4 w-4 mr-2" />
            Import Properties &amp; Sensors
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Property
          </button>
        </div>
      </div>
      
      {/* Upload Modal */}
      <PropertyUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      
      {/* Add Property Modal */}
      <PropertyAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {/* Delete Property Modal */}
      <PropertyDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPropertyToDelete(null);
        }}
        property={propertyToDelete}
      />
      
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* All Properties Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => setStatusFilter('all')}
          className={`group overflow-hidden rounded-xl shadow-sm transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'ring-2 ring-gray-400 border border-gray-400 bg-white' 
              : 'bg-white border border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-gray-100 p-3">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Properties</dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">{propertyCounts.all}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 group-hover:bg-gray-100 transition-colors">
            <div className="text-sm">
              <span className="font-medium text-gray-700">
                View all properties <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Compliant Properties Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => setStatusFilter('compliant')}
          className={`group overflow-hidden rounded-xl shadow-sm transition-all cursor-pointer ${
            statusFilter === 'compliant' 
              ? 'ring-2 ring-emerald-500 border border-emerald-500 bg-white' 
              : 'bg-white border border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-emerald-100 p-3">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Compliant</dt>
                  <dd>
                    <div className="text-2xl font-bold text-emerald-700">{propertyCounts.compliant}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 px-5 py-3 group-hover:bg-emerald-100 transition-colors">
            <div className="text-sm">
              <span className="font-medium text-emerald-700">
                {Math.round((propertyCounts.compliant / propertyCounts.all) * 100) || 0}% of total properties
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* At Risk Properties Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => setStatusFilter('at-risk')}
          className={`group overflow-hidden rounded-xl shadow-sm transition-all cursor-pointer ${
            statusFilter === 'at-risk' 
              ? 'ring-2 ring-amber-500 border border-amber-500 bg-white' 
              : 'bg-white border border-gray-200 hover:border-amber-300'
          }`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-amber-100 p-3">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">At Risk</dt>
                  <dd>
                    <div className="text-2xl font-bold text-amber-600">{propertyCounts.atRisk}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 px-5 py-3 group-hover:bg-amber-100 transition-colors">
            <div className="text-sm">
              <span className="font-medium text-amber-700">
                {Math.round((propertyCounts.atRisk / propertyCounts.all) * 100) || 0}% of total properties
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Non-Compliant Properties Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => setStatusFilter('non-compliant')}
          className={`group overflow-hidden rounded-xl shadow-sm transition-all cursor-pointer ${
            statusFilter === 'non-compliant' 
              ? 'ring-2 ring-red-500 border border-red-500 bg-white' 
              : 'bg-white border border-gray-200 hover:border-red-300'
          }`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-red-100 p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Non-Compliant</dt>
                  <dd>
                    <div className="text-2xl font-bold text-red-700">{propertyCounts.nonCompliant}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-red-50 px-5 py-3 group-hover:bg-red-100 transition-colors">
            <div className="text-sm">
              <span className="font-medium text-red-700">
                {Math.round((propertyCounts.nonCompliant / propertyCounts.all) * 100) || 0}% of total properties
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-8 gap-4 mb-4">
          {/* Search */}
          <div className="sm:col-span-5">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Properties</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by name, address or description..."
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status filter */}
          <div className="sm:col-span-3">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Compliance Status</label>
            <select
              id="status"
              className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="compliant">Compliant</option>
              <option value="at-risk">At Risk</option>
              <option value="non-compliant">Non-Compliant</option>
            </select>
          </div>
        </div>
        
        {/* Filter info and reset */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'property' : 'properties'} found
            {(searchTerm || statusFilter !== 'all') && (
              <span className="ml-1">matching your filters</span>
            )}
          </div>
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Properties grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="sync">
            {filteredProperties.map((property: Property, index) => (
              <ContentTransition 
                key={property.id}
                delay={index * 0.05} // Staggered delay based on index
                direction="up"
                duration={0.3}
                className="card-grid-item"
              >
                <PropertyCard 
                  property={property} 
                  onDeleteClick={(property) => {
                    setPropertyToDelete(property);
                    setIsDeleteModalOpen(true);
                  }}
                />
              </ContentTransition>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {(searchTerm || statusFilter !== 'all')
              ? "No properties match your current filter criteria."
              : "There are no properties in the system at this time."}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;
