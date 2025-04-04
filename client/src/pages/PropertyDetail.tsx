import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PlusCircle, Download, FileText, AlertTriangle, ClipboardList } from 'lucide-react';
import { PropertyTransition } from '@/components/transitions/PropertyTransition';
import { SharedLayoutTransition } from '@/components/transitions/SharedLayoutTransition';
import { ContentTransition } from '@/components/transitions/ContentTransition';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';
import { Property, PropertyDetail as PropertyDetailType } from '@/lib/types';
import DocumentList from '@/components/documents/DocumentList';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import SensorList from '@/components/sensors/SensorList';
import PropertyGroupInfo from '@/components/property-groups/PropertyGroupInfo';
import { DetailPageSkeleton } from '@/components/skeletons';

// Let's create a simple tabs component for now - we can expand this later
const PropertyOverview = ({ property }: { property: Property }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium mb-4">Property Overview</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Property Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Type</div>
            <div className="text-sm font-medium">Residential</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Units</div>
            <div className="text-sm font-medium">35</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Year Built</div>
            <div className="text-sm font-medium">2005</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Renovation</div>
            <div className="text-sm font-medium">2018</div>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Risk Information</h4>
        <div className="p-4 rounded-md" style={{ 
          backgroundColor: property.riskLevel === 'high' ? 'rgba(163, 67, 15, 0.1)' : 
                           property.riskLevel === 'medium' ? 'rgba(237, 176, 21, 0.1)' :
                           'rgba(10, 145, 85, 0.1)' 
        }}>
          <div className="text-sm font-medium mb-1" style={{
            color: property.riskLevel === 'high' ? 'var(--brand-rust)' : 
                  property.riskLevel === 'medium' ? 'var(--brand-gold)' :
                  'var(--brand-green)'
          }}>
            {property.riskLevel === 'high' ? 'High Risk' : 
             property.riskLevel === 'medium' ? 'Medium Risk' : 
             property.riskLevel === 'low' ? 'Low Risk' : 'No Risk'}
          </div>
          <div className="text-sm">{property.riskReason}</div>
        </div>
      </div>
    </div>
  </div>
);

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();

  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['/api/properties', id],
    queryFn: async () => {
      console.log(`Attempting to fetch property with ID: ${id}`);
      
      try {
        // Use direct fetch API for more control over the request
        const response = await fetch(`/api/properties/${id}`);
        
        if (!response.ok) {
          // Log detailed error information for debugging
          const errorText = await response.text();
          console.error(`API Error (${response.status}) fetching property ${id}:`, errorText);
          
          // Check for specific error cases
          if (response.status === 404) {
            // Create a special error for 404 that we can identify later
            const notFoundError = new Error(`Property with ID ${id} not found`);
            notFoundError.name = 'NotFoundError';
            throw notFoundError;
          }
          
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Validate essential property data
        if (!data || !data.id) {
          console.error("Invalid property data received:", data);
          throw new Error("Received invalid property data from the server");
        }
        
        console.log(`Successfully loaded property: ${data.name} (ID: ${data.id})`);
        return data;
      } catch (error) {
        console.error(`Error fetching property with ID ${id}:`, error);
        throw error;
      }
    },
    refetchOnWindowFocus: true, // Auto-refresh when window gets focus
    staleTime: 30000, // Consider data stale after 30 seconds
    // Only retry if it's not a 404 error
    retry: (failureCount, error) => {
      // Don't retry for NotFoundError (404)
      if (error instanceof Error && error.name === 'NotFoundError') {
        return false;
      }
      // For all other errors, retry up to 3 times
      return failureCount < 3;
    },
    refetchInterval: false // Don't automatically refetch at interval
  });
  
  // Get documents for this property
  const { data: documents = [] } = useQuery({
    queryKey: [`/api/properties/${id}/documents`],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/properties/${id}/documents`, {
          method: 'GET'
        });
        return response;
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw new Error('Failed to fetch documents');
      }
    },
    // Only fetch documents if we have a valid property ID and no error fetching the property
    enabled: !!id && !error,
    refetchOnWindowFocus: true, // Auto-refresh when window gets focus
    staleTime: 10000, // Consider data stale after 10 seconds
    // Don't retry for 404 errors
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  if (isLoading) {
    return (
      <PropertyTransition>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white shadow-sm">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <DetailPageSkeleton />
          </main>
        </div>
      </PropertyTransition>
    );
  }

  if (error || !property) {
    return (
      <PropertyTransition>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white shadow-sm">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/properties" className="text-primary flex items-center gap-1 mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Properties
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">Property Not Found</h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-high-risk text-xl">Error loading property details</div>
              <p className="mt-2">The property you're looking for could not be found or there was an error loading it.</p>
              <Link href="/properties" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600">
                Return to Properties
              </Link>
            </div>
          </main>
        </div>
      </PropertyTransition>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'non-compliant':
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-high-risk">Non-Compliant</span>;
      case 'at-risk':
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-at-risk">At Risk</span>;
      case 'compliant':
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-compliant">Compliant</span>;
      default:
        return null;
    }
  };

  return (
    <PropertyTransition propertyId={id}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/properties" className="text-primary flex items-center gap-1 mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Properties
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <ContentTransition delay={0.1} direction="right">
                  <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                    {property.name}
                    {getStatusBadge(property.status)}
                  </h1>
                </ContentTransition>
                <ContentTransition delay={0.2} direction="right">
                  <p className="text-gray-500">
                    {property.address}
                  </p>
                </ContentTransition>
              </div>
              <div className="flex gap-2">
                <ContentTransition delay={0.3} direction="left">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="h-5 w-5 mr-2" />
                    Export Report
                  </button>
                </ContentTransition>
                <ContentTransition delay={0.4} direction="left">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
                          style={{ backgroundColor: 'var(--brand-green)' }}>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Schedule Inspection
                  </button>
                </ContentTransition>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Quick Links */}
          <ContentTransition delay={0.3} direction="right">
            <div className="mb-6 flex flex-wrap gap-3">
              <Link 
                to={`/alerts?propertyId=${id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-amber-600 transition-colors shadow-sm"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Alerts
              </Link>
              <Link 
                to={`/work-orders?propertyId=${id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Work Orders
              </Link>
              <Link 
                to={`/work-orders?create=true&propertyId=${id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Work Order
              </Link>
            </div>
          </ContentTransition>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <SharedLayoutTransition id={`property-overview-${id}`} withScale duration={0.5}>
                  <div className="bg-white rounded-lg shadow-sm">
                    <PropertyOverview property={property} />
                  </div>
                </SharedLayoutTransition>
              </div>
              <div className="md:col-span-1">
                <ContentTransition delay={0.5} direction="left">
                  <PropertyGroupInfo propertyId={id} groupId={property.groupId} />
                </ContentTransition>
              </div>
            </div>
            
            <ContentTransition delay={0.6} direction="up">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <SensorList propertyId={id} />
              </div>
            </ContentTransition>
            
            <ContentTransition delay={0.7} direction="up">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <DocumentList propertyId={id} />
              </div>
            </ContentTransition>
          </div>
        </main>
      </div>
    </PropertyTransition>
  );
};

export default PropertyDetail;
