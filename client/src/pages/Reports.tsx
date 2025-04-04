import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Download, Filter, Calendar, BarChart2, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, 
  ReferenceLine, ComposedChart
} from 'recharts';
import { moistureReadings, temperatureReadings, alertsData, responseTimeData } from '@/lib/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define report data interface for type safety
interface ReportData {
  title: string;
  timeRangeLabel: string;
  summaryStats: Array<{
    label: string;
    value: string | number;
    change?: {
      isPositive: boolean;
      value: string | number;
      label: string;
    }
  }>;
  insights: Array<{
    title: string;
    description: string;
    type: 'positive' | 'neutral' | 'negative';
    iconBg?: string;
    iconColor?: string;
  }>;
}

const Reports = () => {
  const [reportType, setReportType] = useState('compliance');
  const [timeRange, setTimeRange] = useState('month');
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');
  const [newReportType, setNewReportType] = useState('compliance');
  const [newReportTimeRange, setNewReportTimeRange] = useState('month');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  // Create default report data for fallback
  const getDefaultReportData = (): ReportData => ({
    title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
    timeRangeLabel: `Last ${timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : timeRange === 'quarter' ? '90 days' : '12 months'}`,
    summaryStats: [],
    insights: []
  });

  const { data, isLoading, error } = useQuery<ReportData>({
    queryKey: [`/api/reports/${reportType}?timeRange=${timeRange}`],
    queryFn: async () => {
      try {
        // Use any for intermediate type to avoid TypeScript errors
        const responseData: any = await apiRequest(`/api/reports/${reportType}?timeRange=${timeRange}`, {
          method: 'GET'
        });
        
        // Validate that we have data with the right shape
        if (responseData && typeof responseData === 'object') {
          return {
            title: typeof responseData.title === 'string' ? responseData.title : 
              getDefaultReportData().title,
            timeRangeLabel: typeof responseData.timeRangeLabel === 'string' ? responseData.timeRangeLabel : 
              getDefaultReportData().timeRangeLabel,
            summaryStats: Array.isArray(responseData.summaryStats) ? responseData.summaryStats : [],
            insights: Array.isArray(responseData.insights) ? responseData.insights : []
          };
        }
        
        // If response doesn't have expected shape, return default data
        return getDefaultReportData();
      } catch (err) {
        console.error("Error fetching reports:", err);
        return getDefaultReportData();
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-96 bg-white rounded-lg shadow mb-8"></div>
            <div className="h-64 bg-white rounded-lg shadow"></div>
          </div>
        </main>
      </div>
    );
  }

  // Handle error or if data is not properly formed
  if (error || !data || !data.title) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-medium mb-4">Report Data Unavailable</h2>
            <p className="text-gray-500">The report data could not be loaded at this time. Please try again later or select a different report type.</p>
            
            <div className="mt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="compliance">Compliance Overview</option>
                        <option value="alerts">Alerts Summary</option>
                        <option value="response">Response Times</option>
                        <option value="moisture">Moisture Levels</option>
                        <option value="inspections">Inspection Status</option>
                      </select>
                    </div>
                    
                    <div className="relative">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                      >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last 90 Days</option>
                        <option value="year">Last 12 Months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Ensure data has all required properties with proper typing
  const defaultTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
  const defaultTimeLabel = `Last ${timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : timeRange === 'quarter' ? '90 days' : '12 months'}`;
  
  const reportData: ReportData = {
    title: data?.title || defaultTitle,
    timeRangeLabel: data?.timeRangeLabel || defaultTimeLabel,
    summaryStats: Array.isArray(data?.summaryStats) ? data.summaryStats : [],
    insights: Array.isArray(data?.insights) ? data.insights : []
  };
  
  // Handle export report
  const handleExport = () => {
    setExportDialogOpen(true);
  };
  
  const handleExportConfirm = () => {
    // Simulate export functionality
    console.log(`Exporting ${reportType} report in ${exportFormat} format...`);
    
    // In a real application, we would call an API endpoint here
    // that would generate the report in the selected format
    setTimeout(() => {
      alert(`Your report has been exported in ${exportFormat.toUpperCase()} format!`);
      setExportDialogOpen(false);
    }, 1000);
  };
  
  // Handle create report
  const handleCreateReport = () => {
    setNewReportName('');
    setNewReportDescription('');
    setNewReportType(reportType);
    setNewReportTimeRange(timeRange);
    setCreateReportOpen(true);
  };
  
  const handleCreateReportConfirm = () => {
    // Validate inputs
    if (!newReportName.trim()) {
      alert('Please enter a report name');
      return;
    }
    
    // Simulate creating a report
    console.log('Creating new report:', {
      name: newReportName,
      description: newReportDescription,
      type: newReportType,
      timeRange: newReportTimeRange
    });
    
    // In a real application, we would call an API endpoint here
    // that would create the report
    setTimeout(() => {
      alert(`Your report "${newReportName}" has been created!`);
      setCreateReportOpen(false);
    }, 1000);
  };

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <div className="flex space-x-4">
              <button 
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
              <button 
                onClick={handleCreateReport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Report
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="compliance">Compliance Overview</option>
                      <option value="alerts">Alerts Summary</option>
                      <option value="response">Response Times</option>
                      <option value="moisture">Moisture Levels</option>
                      <option value="inspections">Inspection Status</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="quarter">Last 90 Days</option>
                      <option value="year">Last 12 Months</option>
                    </select>
                  </div>
                  
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Filter className="h-5 w-5 mr-2" />
                    Advanced Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">{reportData.title}</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {reportData.timeRangeLabel}
              </div>
            </div>
            
            <div className="h-[400px] bg-white border border-gray-200 rounded-lg p-4">
              {reportType === 'compliance' && (
                <div className="h-full">
                  <h3 className="text-lg font-medium mb-2">Compliance Status by Property Category</h3>
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { category: 'Residential Flats', compliant: 823, minor: 142, major: 35 },
                          { category: 'Semi-detached Houses', compliant: 412, minor: 78, major: 12 },
                          { category: 'Terraced Houses', compliant: 356, minor: 65, major: 18 },
                          { category: 'Maisonettes', compliant: 215, minor: 42, major: 9 },
                          { category: 'Shared Accomodation', compliant: 178, minor: 54, major: 22 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" height={60} tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="compliant" name="Fully Compliant" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="minor" name="Minor Issues" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="major" name="Major Issues" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {reportType === 'moisture' && (
                <div className="h-full">
                  <h3 className="text-lg font-medium mb-2">Average Moisture Levels by Month</h3>
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={moistureReadings}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine y={70} label="Threshold" stroke="#ff7300" strokeDasharray="3 3" />
                        <Line 
                          type="monotone" 
                          dataKey="avg" 
                          name="Avg. Moisture (%)" 
                          stroke="#0A9155" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {reportType === 'alerts' && (
                <div className="h-full">
                  <h3 className="text-lg font-medium mb-2">Alert Distribution by Priority</h3>
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={alertsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={140}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {alertsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} alerts`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {reportType === 'response' && (
                <div className="h-full">
                  <h3 className="text-lg font-medium mb-2">Response Times vs Targets by Severity</h3>
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={responseTimeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="severity" tick={{ fontSize: 13 }} />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgTime" name="Actual Response Time (hrs)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" name="Target Response Time (hrs)" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {reportType === 'inspections' && (
                <div className="h-full">
                  <h3 className="text-lg font-medium mb-2">Inspection Completion Status</h3>
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={[
                          { month: 'Jan', completed: 42, target: 45, rate: 93 },
                          { month: 'Feb', completed: 38, target: 45, rate: 84 },
                          { month: 'Mar', completed: 47, target: 45, rate: 104 },
                          { month: 'Apr', completed: 43, target: 45, rate: 96 },
                          { month: 'May', completed: 40, target: 45, rate: 89 },
                          { month: 'Jun', completed: 42, target: 45, rate: 93 },
                          { month: 'Jul', completed: 48, target: 45, rate: 107 },
                          { month: 'Aug', completed: 50, target: 45, rate: 111 },
                          { month: 'Sep', completed: 46, target: 45, rate: 102 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 120]} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="completed" name="Inspections Completed" fill="#0A9155" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="target" name="Monthly Target" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="rate" name="Completion Rate (%)" stroke="#F59E0B" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
            
            {reportData.summaryStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                {reportData.summaryStats.map((stat, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    {stat.change && (
                      <div className={`text-xs ${stat.change.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                        {stat.change.isPositive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        )}
                        {stat.change.value} {stat.change.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">No summary statistics available for this report type.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Key Insights</h2>
            {reportData.insights.length > 0 ? (
              <div className="space-y-4">
                {reportData.insights.map((insight, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className={`h-8 w-8 rounded-full ${insight.iconBg || 'bg-gray-100'} ${insight.iconColor || 'text-gray-600'} flex items-center justify-center mr-3`}>
                      {insight.type === 'positive' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : insight.type === 'neutral' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm text-gray-500">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">No insights available for this report type.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Export Report Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
            <DialogDescription>
              Choose a format to export the current report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exportFormat" className="text-right">
                Format
              </Label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="png">PNG Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleExportConfirm}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Report Dialog */}
      <Dialog open={createReportOpen} onOpenChange={setCreateReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new custom report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportName" className="text-right">
                Report Name
              </Label>
              <Input
                id="reportName"
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
                className="col-span-3"
                placeholder="Enter report name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="reportDescription"
                value={newReportDescription}
                onChange={(e) => setNewReportDescription(e.target.value)}
                className="col-span-3"
                placeholder="Describe the purpose of this report"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportType" className="text-right">
                Report Type
              </Label>
              <Select
                value={newReportType}
                onValueChange={setNewReportType}
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
                Time Range
              </Label>
              <Select
                value={newReportTimeRange}
                onValueChange={setNewReportTimeRange}
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
            <Button variant="outline" onClick={() => setCreateReportOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateReportConfirm}>Create Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Reports;
