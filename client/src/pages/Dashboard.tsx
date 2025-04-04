import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Alert, Property, PropertyStatus, RiskLevel, WorkOrder } from '@/lib/types';
import GaugeChart from '@/components/dashboard/GaugeChart';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton } from '@/components/skeletons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Check, Download, PlusCircle } from "lucide-react";

// Simple Stats Card Component
const StatCard = ({ title, value, description, color }: { 
  title: string;
  value: string | number;
  description: string;
  color: string;
}) => {
  return (
    <div className={`bg-white border-l-4 ${color} rounded-lg shadow-sm p-5`}>
      <h3 className="text-lg font-semibold text-gray-800">{value}</h3>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
};

// Simple Property Row Component
const PropertyRow = ({ property }: { property: Property }) => {
  const [, navigate] = useLocation();
  
  // Function to get status badge styling
  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'compliant':
        return { bg: 'rgba(10, 145, 85, 0.15)', text: 'var(--brand-green)' };
      case 'at-risk':
        return { bg: 'rgba(237, 176, 21, 0.15)', text: 'var(--brand-gold)' };
      case 'non-compliant':
        return { bg: 'rgba(163, 67, 15, 0.15)', text: 'var(--brand-rust)' };
      default:
        return { bg: 'rgba(66, 42, 29, 0.15)', text: 'var(--brand-dark-brown)' };
    }
  };

  // Function to get risk level text
  const getRiskText = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
      case 'none':
        return 'No Risk';
      default:
        return 'Unknown';
    }
  };

  const handleRowClick = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleRowClick}>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">
          <Link href={`/properties/${property.id}`} className="hover:underline">{property.name}</Link>
        </div>
        <div className="text-sm text-gray-500">{property.address}</div>
      </td>
      <td className="px-4 py-3">
        <span 
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full`}
          style={{ 
            backgroundColor: getStatusBadge(property.status).bg,
            color: getStatusBadge(property.status).text
          }}>
          {property.status === 'compliant' ? 'Compliant' : 
           property.status === 'at-risk' ? 'At Risk' : 'Non-Compliant'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          {getRiskText(property.riskLevel)}
        </div>
        {property.riskLevel !== 'none' && (
          <div className="text-xs text-gray-500 truncate max-w-[200px]">
            {property.riskReason}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {property.alerts.high > 0 && (
            <span className="px-1.5 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: 'rgba(163, 67, 15, 0.15)', 
                    color: 'var(--brand-rust)' 
                  }}>
              {property.alerts.high.toFixed(1)} High
            </span>
          )}
          {property.alerts.medium > 0 && (
            <span className="px-1.5 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: 'rgba(237, 176, 21, 0.15)', 
                    color: 'var(--brand-gold)' 
                  }}>
              {property.alerts.medium.toFixed(1)} Med
            </span>
          )}
          {property.alerts.low > 0 && (
            <span className="px-1.5 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: 'rgba(10, 145, 85, 0.15)', 
                    color: 'var(--brand-green)' 
                  }}>
              {property.alerts.low.toFixed(1)} Low
            </span>
          )}
          {property.alerts.high === 0 && property.alerts.medium === 0 && property.alerts.low === 0 && (
            <span className="px-1.5 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: 'rgba(11, 74, 46, 0.15)', 
                    color: 'var(--brand-dark-green)' 
                  }}>
              None
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {property.lastInspection.date}
        <div className="text-xs">
          {property.lastInspection.daysAgo.toFixed(1)} days ago
        </div>
      </td>
      <td className="px-4 py-3">
        <Link href={`/properties/${property.id}`} className="text-sm font-medium" style={{ color: 'var(--brand-green)', transition: 'color 0.2s ease' }}>
          View
        </Link>
      </td>
    </tr>
  );
};

// Simple Dashboard Page
const Dashboard = () => {
  // State for dialogs
  const [generateReportOpen, setGenerateReportOpen] = useState(false);
  const [scheduleInspectionOpen, setScheduleInspectionOpen] = useState(false);
  const [reportType, setReportType] = useState('compliance');
  const [reportTimeRange, setReportTimeRange] = useState('month');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [inspectionDate, setInspectionDate] = useState<string>('');
  const [inspectionNotes, setInspectionNotes] = useState<string>('');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Handlers for buttons
  const handleGenerateReport = () => {
    setGenerateReportOpen(true);
  };

  const handleScheduleInspection = () => {
    setScheduleInspectionOpen(true);
  };

  const handleGenerateReportConfirm = () => {
    toast({
      title: "Report Generated",
      description: `Your ${reportType} report has been generated.`,
      duration: 3000,
    });
    
    // Close the dialog
    setGenerateReportOpen(false);
    
    // Redirect to the reports page
    setTimeout(() => {
      navigate('/reports');
    }, 500);
  };

  const handleScheduleInspectionConfirm = () => {
    if (!selectedPropertyId || !inspectionDate) {
      toast({
        title: "Missing Information",
        description: "Please select a property and date for the inspection.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    toast({
      title: "Inspection Scheduled",
      description: `Inspection scheduled for ${inspectionDate}.`,
      duration: 3000,
    });
    
    // Close the dialog
    setScheduleInspectionOpen(false);
  };

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="p-6 bg-white rounded-lg shadow-sm text-red-500">
          <p>Error loading dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  // Format data for easy access
  const stats = data?.stats || {
    highRiskProperties: 0,
    complianceRate: 0,
    avgResponseTime: 0,
    responseTime: 0,
    activeSensors: 0,
    complianceRateChange: 0
  };
  
  const properties = Array.isArray(data?.properties) ? data.properties : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
  const workOrders = Array.isArray(data?.workOrders) ? data.workOrders : [];

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header with CTA */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Compliance Dashboard</h1>
            <p className="text-gray-500">Real-time monitoring of health and safety compliance</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <button 
              onClick={handleGenerateReport}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Report
            </button>
            <button 
              onClick={handleScheduleInspection}
              className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Schedule Inspection
            </button>
          </div>
        </div>

        {/* Gauge Charts Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Key Performance Indicators</h2>
            </div>
            <div className="mt-2 sm:mt-0">
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Year to date</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <GaugeChart
                  value={stats.complianceRate}
                  max={100}
                  label="Compliance Rate"
                  color="var(--brand-green)"
                  size="medium"
                  suffix="%"
                  description="Properties compliant with housing standards"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.075 }}
                className="flex flex-col items-center"
              >
                <GaugeChart
                  value={stats.highRiskProperties}
                  max={6}
                  label="At-Risk Properties"
                  color="var(--brand-rust)"
                  size="medium"
                  suffix=""
                  description="High risk and non-compliant properties"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex flex-col items-center"
              >
                <GaugeChart
                  value={stats.riskAssessmentRate || 0}
                  max={100}
                  label="Risk Assessment"
                  color="threshold"
                  size="medium"
                  suffix="%"
                  description="Units with acceptable risk levels (not medium/high risk)"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.225 }}
                className="flex flex-col items-center"
              >
                <GaugeChart
                  value={stats.responseTime || stats.avgResponseTime}
                  max={24}
                  label="Response Time"
                  color="var(--brand-gold)"
                  size="medium"
                  suffix="hrs"
                  description="Average time to respond to high-priority issues"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <GaugeChart
                  value={stats.activeSensors}
                  max={100}
                  label="Active Sensors"
                  color="var(--brand-dark-green)"
                  size="medium"
                  suffix="%"
                  description="Percentage of sensors with 'active' status"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <div className="flex space-x-4">
              <Link href="/alerts" className="text-sm font-medium" style={{ color: 'var(--brand-green)', transition: 'color 0.2s ease' }}>
                View all alerts
              </Link>
              <Link href="/work-orders" className="text-sm font-medium" style={{ color: 'var(--brand-green)', transition: 'color 0.2s ease' }}>
                View all work orders
              </Link>
            </div>
          </div>
          
          {(alerts.length > 0 || workOrders.length > 0) ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`px-4 py-2 text-sm font-medium border-b-2 focus:outline-none ${
                    true ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Activity
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity/Priority</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location/Property</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Work Orders */}
                  {workOrders.slice(0, 3).map((workOrder: WorkOrder & { assignedToStaff?: string }) => (
                    <tr key={`wo-${workOrder.id}`} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 mr-2">
                            Work Order
                          </span>
                          <span className="text-sm text-gray-900">{workOrder.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full`}
                          style={{
                            backgroundColor: workOrder.priority === 'emergency' ? 'rgba(220, 38, 38, 0.15)' : 
                                          workOrder.priority === 'high' ? 'rgba(163, 67, 15, 0.15)' : 
                                          workOrder.priority === 'medium' ? 'rgba(237, 176, 21, 0.15)' : 
                                          'rgba(10, 145, 85, 0.15)',
                            color: workOrder.priority === 'emergency' ? '#dc2626' :
                                  workOrder.priority === 'high' ? 'var(--brand-rust)' : 
                                  workOrder.priority === 'medium' ? 'var(--brand-gold)' : 
                                  'var(--brand-green)'
                          }}>
                          {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/properties/${workOrder.propertyId}`} className="hover:underline">
                          {workOrder.propertyName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{workOrder.createdAt}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {workOrder.assignedToStaff?.substring(0, 2) || '??'}
                          </div>
                          <div className="ml-2 text-sm text-gray-900">{workOrder.assignedToStaff || 'Unassigned'}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Alerts */}
                  {alerts.slice(0, Math.max(0, 5 - workOrders.length)).map((alert: Alert) => (
                    <tr key={`alert-${alert.id}`} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/properties/${alert.propertyId}`)}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 mr-2">
                            Alert
                          </span>
                          <span className="text-sm text-gray-900">{alert.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full`}
                          style={{
                            backgroundColor: alert.severity === 'high' ? 'rgba(163, 67, 15, 0.15)' : 
                                            alert.severity === 'medium' ? 'rgba(237, 176, 21, 0.15)' : 
                                            'rgba(10, 145, 85, 0.15)',
                            color: alert.severity === 'high' ? 'var(--brand-rust)' : 
                                  alert.severity === 'medium' ? 'var(--brand-gold)' : 
                                  'var(--brand-green)'
                          }}>
                          {alert.severity === 'high' ? 'High' : 
                           alert.severity === 'medium' ? 'Medium' : 'Low'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/properties/${alert.propertyId}`} className="hover:underline">
                          {alert.location}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.detectedAt}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {alert.assignedTo.initials}
                          </div>
                          <div className="ml-2 text-sm text-gray-900">{alert.assignedTo.name}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>

        {/* Properties Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Properties Requiring Attention</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Showing all non-compliant and medium/high risk</span>
              <Link href="/properties" className="text-sm font-medium" style={{ color: 'var(--brand-green)', transition: 'color 0.2s ease' }}>
                View all properties
              </Link>
            </div>
          </div>
          
          {properties.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Inspection</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property: Property) => (
                    <PropertyRow key={property.id} property={property} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p>No properties found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={generateReportOpen} onOpenChange={setGenerateReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Create a new compliance report based on current data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportType" className="text-right">
                Report Type
              </Label>
              <Select
                value={reportType}
                onValueChange={setReportType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance Overview</SelectItem>
                  <SelectItem value="alerts">Alerts Summary</SelectItem>
                  <SelectItem value="response">Response Times</SelectItem>
                  <SelectItem value="moisture">Moisture Levels</SelectItem>
                  <SelectItem value="inspections">Inspection Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeRange" className="text-right">
                Time Period
              </Label>
              <Select
                value={reportTimeRange}
                onValueChange={setReportTimeRange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last 90 Days</SelectItem>
                  <SelectItem value="year">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateReportOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateReportConfirm}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Inspection Dialog */}
      <Dialog open={scheduleInspectionOpen} onOpenChange={setScheduleInspectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Inspection</DialogTitle>
            <DialogDescription>
              Schedule a new property inspection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="property" className="text-right">
                Property
              </Label>
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property: Property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="col-span-3"
                placeholder="Add inspection details or requirements"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleInspectionOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleInspectionConfirm}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;