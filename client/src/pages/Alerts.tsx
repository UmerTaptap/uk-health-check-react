import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertSeverity, AlertType } from '@/lib/types';
import { Link, useLocation } from 'wouter';
import { ArrowUpRight, Home, Wrench } from 'lucide-react';

// Format dates that may be in various formats
const formatDate = (dateStr: string) => {
  // Check if date is already in a readable format (e.g. "2 days ago", "Dec 7, 2023")
  if (dateStr.includes('ago') || 
      dateStr.includes('remaining') || 
      dateStr.match(/[A-Za-z]{3}\s\d{1,2},\s\d{4}/)) {
    return dateStr;
  }
  
  try {
    const date = new Date(dateStr);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateStr; // Return original string if date is invalid
    }
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr; // Return original string on error
  }
};

// Simplest possible Alerts page - basic HTML and Tailwind CSS only
const Alerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');

  // Fetch alerts data
  const { data, isLoading, error } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/alerts', {
          method: 'GET'
        });
        
        // Make sure we have an array of alerts
        const alerts = Array.isArray(response) ? response : [];
        return alerts;
      } catch (err) {
        throw err;
      }
    }
  });

  // Check if data exists and is an array before filtering
  const allAlerts = Array.isArray(data) ? data : [];
  
  // Filter alerts based on criteria
  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
      alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  // Count alerts by severity
  const alertCounts = {
    all: allAlerts.length,
    high: allAlerts.filter(alert => alert.severity === 'high').length,
    medium: allAlerts.filter(alert => alert.severity === 'medium').length,
    low: allAlerts.filter(alert => alert.severity === 'low').length
  };

  // Function to get severity label
  const getSeverityLabel = (severity: AlertSeverity) => {
    switch (severity) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  // Function to get severity badge styling
  const getSeverityBadgeClass = (severity: AlertSeverity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Handle filter reset
  const resetFilters = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setTypeFilter('all');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Alerts</h1>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Alerts</h1>
        <div className="p-6 bg-white rounded-lg shadow-sm text-red-500">
          <p>Error loading alerts. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-500">Track and manage compliance issues across properties</p>
      </div>

      {/* Filter section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by location or type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Severity filter */}
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              id="severity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
            >
              <option value="all">All Severity Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
          
          {/* Type filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
            <select
              id="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AlertType | 'all')}
            >
              <option value="all">All Types</option>
              <option value="moisture">Moisture</option>
              <option value="mould">Mould</option>
              <option value="air-quality">Air Quality</option>
              <option value="tenant-report">Tenant Report</option>
            </select>
          </div>
        </div>
        
        {/* Filter info and reset */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'} found
          </span>
          {(searchTerm || severityFilter !== 'all' || typeFilter !== 'all') && (
            <button 
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* All Alerts */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer ${
            severityFilter === 'all' ? 'bg-gray-50 border-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setSeverityFilter('all')}
        >
          <div className="flex justify-between">
            <div>
              <div className="text-3xl font-semibold">{alertCounts.all}</div>
              <div className="text-gray-500 mt-1">All Alerts</div>
            </div>
          </div>
        </div>
        
        {/* High Risk */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer ${
            severityFilter === 'high' ? 'bg-red-50 border-red-400' : 'bg-white border-gray-200 hover:bg-red-50'
          }`}
          onClick={() => setSeverityFilter('high')}
        >
          <div className="flex justify-between">
            <div>
              <div className="text-3xl font-semibold text-red-700">{alertCounts.high}</div>
              <div className="text-red-700 mt-1">High Risk</div>
            </div>
          </div>
        </div>
        
        {/* Medium Risk */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer ${
            severityFilter === 'medium' ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200 hover:bg-yellow-50'
          }`}
          onClick={() => setSeverityFilter('medium')}
        >
          <div className="flex justify-between">
            <div>
              <div className="text-3xl font-semibold text-yellow-700">{alertCounts.medium}</div>
              <div className="text-yellow-700 mt-1">Medium Risk</div>
            </div>
          </div>
        </div>
        
        {/* Low Risk */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer ${
            severityFilter === 'low' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:bg-blue-50'
          }`}
          onClick={() => setSeverityFilter('low')}
        >
          <div className="flex justify-between">
            <div>
              <div className="text-3xl font-semibold text-blue-700">{alertCounts.low}</div>
              <div className="text-blue-700 mt-1">Low Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert List */}
      {filteredAlerts.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detected</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map(alert => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{alert.type}</div>
                    <div className="text-sm text-gray-500">{alert.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadgeClass(alert.severity)}`}>
                      {getSeverityLabel(alert.severity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {alert.propertyId ? (
                      <Link to={`/properties/${alert.propertyId}`} className="group">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 flex items-center">
                          {alert.location}
                          <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {alert.reading && <div className="text-sm text-gray-500">{alert.reading}</div>}
                      </Link>
                    ) : (
                      <>
                        <div className="text-sm text-gray-900">{alert.location}</div>
                        {alert.reading && <div className="text-sm text-gray-500">{alert.reading}</div>}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(alert.detectedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(alert.deadline)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        {alert.assignedTo.initials}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{alert.assignedTo.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                    {alert.propertyId && (
                      <Link 
                        to={`/properties/${alert.propertyId}`} 
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 hover:text-emerald-600"
                        title="Go to property details"
                      >
                        <Home className="h-3.5 w-3.5 mr-1" />
                        Property
                      </Link>
                    )}
                    <Link 
                      to={`/work-orders?create=true&alertId=${alert.id}${alert.propertyId ? `&propertyId=${alert.propertyId}` : ''}`} 
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 hover:text-emerald-600"
                      title="Create work order for this alert"
                    >
                      <Wrench className="h-3.5 w-3.5 mr-1" />
                      Create Work Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No alerts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {(searchTerm || severityFilter !== 'all' || typeFilter !== 'all')
              ? "No alerts match your current filter criteria."
              : "There are no active alerts in the system at this time."}
          </p>
          {(searchTerm || severityFilter !== 'all' || typeFilter !== 'all') && (
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

export default Alerts;