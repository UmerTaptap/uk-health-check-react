import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertType, PropertyDetail, Sensor } from '@/lib/types';
import SensorChart from './SensorChart';
import AlertCard from '../dashboard/AlertCard';
import { DocumentsManager } from '../documents';

type PropertyTabsProps = {
  property: PropertyDetail;
};

const PropertyTabs: React.FC<PropertyTabsProps> = ({ property }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 p-1 bg-gray-100 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow">
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="sensors" 
            className="py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow">
            Environment
          </TabsTrigger>
          <TabsTrigger 
            value="alerts" 
            className="py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow">
            Alerts
          </TabsTrigger>
          <TabsTrigger 
            value="inspections" 
            className="py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow">
            Inspections
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow">
            Documents
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{property.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{property.propertyType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Units</p>
                <p className="font-medium">{property.units}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year Built</p>
                <p className="font-medium">{property.yearBuilt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Renovation</p>
                <p className="font-medium">{property.lastRenovation || 'None'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Property Manager</p>
                <p className="font-medium">{property.propertyManager}</p>
              </div>
            </div>
          </div>
          
          <SensorChart
            title="Compliance Status"
            type="pie"
            data={[
              { name: 'Compliant Areas', value: property.compliance.compliantAreas, color: '#10B981' },
              { name: 'At Risk Areas', value: property.compliance.atRiskAreas, color: '#F59E0B' },
              { name: 'Non-Compliant', value: property.compliance.nonCompliantAreas, color: '#EF4444' }
            ]}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {property.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-4">
                  {activity.type === 'alert' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : activity.type === 'inspection' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="sensors" className="space-y-6">
        <div className="sensors-header flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Environmental Monitoring</h2>
          <div className="sensors-actions flex gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Export Data
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600">
              Add Sensor
            </button>
          </div>
        </div>
        
        <div className="sensor-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SensorChart
            title="Moisture Levels"
            type="line"
            data={property.environmentalData.moisture}
            threshold={70}
          />
          
          <SensorChart
            title="Temperature Readings"
            type="line"
            data={property.environmentalData.temperature}
            dataKey="avg"
            threshold={18}
            thresholdLabel="Minimum Standard"
          />
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Active Sensors</h3>
            <div className="flex space-x-2">
              <select className="text-sm border-gray-300 rounded-md">
                <option>All Locations</option>
                <option>Common Areas</option>
                <option>Residential Units</option>
              </select>
              <select className="text-sm border-gray-300 rounded-md">
                <option>All Types</option>
                <option>Moisture</option>
                <option>Temperature</option>
                <option>Air Quality</option>
              </select>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 sensors-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sensor ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Reading
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Battery
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {property.sensors.map((sensor: Sensor) => (
                    <tr key={sensor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sensor.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sensor.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sensor.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`sensor-status ${sensor.status === 'active' ? 'active' : 'inactive'}`}>
                          {sensor.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`sensor-reading ${sensor.isWarning ? 'warning' : ''}`}>
                          {sensor.currentReading}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="battery-level">
                          <div 
                            className="battery-fill" 
                            style={{ width: `${sensor.batteryLevel}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">{sensor.batteryLevel}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sensor.lastUpdated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="alerts" className="space-y-6">
        <div className="alerts-header flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Property Alerts</h2>
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Export Alerts
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600">
              Report Issue
            </button>
          </div>
        </div>
        
        <div className="alert-filters flex flex-wrap gap-2 mb-4">
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full bg-white text-gray-700 hover:bg-gray-50">
            All Alerts
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full bg-red-100 text-high-risk">
            High Priority
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full bg-amber-100 text-at-risk">
            Medium Priority
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full bg-blue-100 text-primary">
            Low Priority
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full bg-green-100 text-compliant">
            Resolved
          </button>
        </div>
        
        {property.alerts.length > 0 ? (
          <div className="alerts-detailed-list space-y-4">
            {property.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="no-alerts-container">
            <div className="no-alerts">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-compliant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Active Alerts</h3>
              <p className="text-sm text-gray-500">This property has no active alerts or issues at this time.</p>
            </div>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="inspections" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Inspections & Maintenance</h2>
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              View History
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600">
              Schedule Inspection
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="inspection-details">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="details">
              <div className="date">Next Inspection: {property.inspections.nextInspection.date}</div>
              <div className="countdown">{property.inspections.nextInspection.daysRemaining} days remaining</div>
            </div>
            <div className="inspection-actions ml-auto">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Reschedule
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600">
                View Details
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Maintenance History</h3>
            <div className="space-y-4">
              {property.inspections.maintenanceHistory.map((item, index) => (
                <div key={index} className="maintenance-item">
                  <div className="maintenance-date">{item.date}</div>
                  <div className="maintenance-type">{item.type}</div>
                  <div className="maintenance-description">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="documents" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Property Documents</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <DocumentsManager propertyId={parseInt(property.id)} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PropertyTabs;
