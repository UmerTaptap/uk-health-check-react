import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, AlertTriangle, Trash, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Define TypeScript interfaces for our settings data structure
interface ComplianceSettings {
  moisture?: {
    warning?: number;
    critical?: number;
  };
  temperature?: {
    minimum?: number;
    maximum?: number;
  };
  airQuality?: {
    co2?: {
      warning?: number;
      critical?: number;
    };
  };
  inspectionFrequency?: {
    standard?: number;
    atRisk?: number;
  };
  highRiskThreshold?: number;
  mediumRiskThreshold?: number;
  inspectionReminderDays?: number;
  certificateExpiryWarningDays?: number;
}

interface AlertSettings {
  responseDeadlines?: {
    high?: number;
    medium?: number;
    low?: number;
  };
  notifications?: {
    email?: boolean;
    sms?: boolean;
    system?: boolean;
  };
  autoAssign?: boolean;
  alertThreshold?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  initials: string;
  lastLogin: string;
}

interface Integration {
  name: string;
  description: string;
  enabled: boolean;
  apiUrl: string;
}

interface Settings {
  compliance?: ComplianceSettings;
  alerts?: AlertSettings;
  users?: User[];
  integrations?: Integration[];
  general?: {
    language?: string;
    theme?: string;
    timezone?: string;
    notifications?: boolean;
  };
  system?: {
    dataBackup?: boolean;
    autoUpdateSoftware?: boolean;
    maintenanceMode?: boolean;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    alertThreshold?: string;
  };
}

// Component for saving data to a file for deployment
const SaveDataSection = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for saving data to file
  const saveDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/save-data', { 
        method: 'POST' 
      });
    },
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: () => {
      setIsSaving(false);
      
      toast({
        title: "Data Saved Successfully",
        description: "Current system data has been saved for deployment.",
        variant: "default",
      });
    },
    onError: (error) => {
      setIsSaving(false);
      console.error("Error saving data:", error);
      
      toast({
        title: "Error Saving Data",
        description: "There was an error saving the system data. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveData = () => {
    saveDataMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Save className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Save data for deployment:</strong> This creates a data.json file that contains all current system data.
              This file will be used when the application is deployed to ensure all your properties, sensors, and other data
              are preserved.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Save System Data</h4>
          <p className="text-sm text-gray-500">
            Save current properties, sensors, alerts, and other data for deployment.
          </p>
        </div>
        <Button 
          variant="default" 
          className="inline-flex items-center bg-primary text-white"
          onClick={handleSaveData}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving Data...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Data for Deployment
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Component for clearing all data from the system
const ClearDataSection = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for clearing all data
  const clearDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/clear-all-data', { 
        method: 'POST' 
      });
    },
    onMutate: () => {
      setIsClearing(true);
    },
    onSuccess: () => {
      setIsConfirmOpen(false);
      setIsClearing(false);
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      toast({
        title: "Data Cleared Successfully",
        description: "All system data has been cleared. You can now upload new data.",
        variant: "default",
      });
      
      // Navigate to the properties page with upload=true parameter
      setTimeout(() => {
        setLocation('/properties?upload=true');
      }, 500);
    },
    onError: (error) => {
      setIsClearing(false);
      console.error("Error clearing data:", error);
      
      toast({
        title: "Error Clearing Data",
        description: "There was an error clearing the system data. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleClearData = () => {
    clearDataMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> Clearing all data will permanently remove all properties, 
              sensors, alerts, and other data from the system. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Clear All System Data</h4>
          <p className="text-sm text-gray-500">
            Remove all properties, sensors, alerts, and other data from the system.
          </p>
        </div>
        <Button 
          variant="destructive" 
          className="inline-flex items-center"
          onClick={() => setIsConfirmOpen(true)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Clear All Data
        </Button>
      </div>
      
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> 
              Confirm Data Deletion
            </DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>ALL</strong> data in the system including:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>All properties and property groups</li>
                <li>All sensors and their historical readings</li>
                <li>All alerts and work orders</li>
                <li>All inspection records and documents</li>
              </ul>
              <div className="bg-red-50 p-3 mt-3 rounded text-red-800 text-sm">
                This action <strong>cannot</strong> be undone. Are you absolutely sure you want to proceed?
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isClearing}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              disabled={isClearing}
              className="inline-flex items-center"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete All Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Settings = () => {
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      return await apiRequest('/api/settings');
    }
  });

  // Show loading state or handle missing data
  if (isLoading || !settings) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-96 bg-white rounded-lg shadow"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure system settings and preferences</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="bg-white shadow rounded-lg">
          <Tabs defaultValue="compliance" className="w-full">
            <TabsList className="grid grid-cols-5 mb-0 rounded-none">
              <TabsTrigger value="compliance">Compliance Thresholds</TabsTrigger>
              <TabsTrigger value="alerts">Alert Configuration</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="maintenance">System Maintenance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compliance" className="p-6">
              <h2 className="text-lg font-medium mb-4">Awaab's Law Compliance Thresholds</h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure the thresholds that determine when a property is considered at risk or non-compliant with Awaab's Law housing standards.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Moisture Levels</h3>
                  <div className="space-y-2">
                    <Label htmlFor="moisture-warning">Warning Threshold (%)</Label>
                    <Input
                      id="moisture-warning"
                      type="number"
                      defaultValue={settings?.compliance?.moisture?.warning || 70}
                    />
                    <p className="text-xs text-gray-500">Properties will be marked as "at risk" above this level</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moisture-critical">Critical Threshold (%)</Label>
                    <Input
                      id="moisture-critical"
                      type="number"
                      defaultValue={settings?.compliance?.moisture?.critical || 85}
                    />
                    <p className="text-xs text-gray-500">Properties will be marked as "non-compliant" above this level</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Temperature Standards</h3>
                  <div className="space-y-2">
                    <Label htmlFor="temp-min">Minimum Temperature (°C)</Label>
                    <Input
                      id="temp-min"
                      type="number"
                      defaultValue={settings?.compliance?.temperature?.minimum || 12}
                    />
                    <p className="text-xs text-gray-500">Properties should maintain temperatures above this level</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temp-max">Maximum Temperature (°C)</Label>
                    <Input
                      id="temp-max"
                      type="number"
                      defaultValue={settings?.compliance?.temperature?.maximum || 28}
                    />
                    <p className="text-xs text-gray-500">Properties should maintain temperatures below this level</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Air Quality</h3>
                  <div className="space-y-2">
                    <Label htmlFor="co2-warning">CO2 Warning Level (ppm)</Label>
                    <Input
                      id="co2-warning"
                      type="number"
                      defaultValue={settings?.compliance?.airQuality?.co2?.warning || 1000}
                    />
                    <p className="text-xs text-gray-500">Alert when CO2 levels exceed this value</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="co2-critical">CO2 Critical Level (ppm)</Label>
                    <Input
                      id="co2-critical"
                      type="number"
                      defaultValue={settings?.compliance?.airQuality?.co2?.critical || 1500}
                    />
                    <p className="text-xs text-gray-500">Critical alert when CO2 levels exceed this value</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Inspection Frequency</h3>
                  <div className="space-y-2">
                    <Label htmlFor="inspection-standard">Standard Properties (days)</Label>
                    <Input
                      id="inspection-standard"
                      type="number"
                      defaultValue={settings?.compliance?.inspectionFrequency?.standard || 90}
                    />
                    <p className="text-xs text-gray-500">How often to inspect compliant properties</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inspection-atrisk">At-Risk Properties (days)</Label>
                    <Input
                      id="inspection-atrisk"
                      type="number"
                      defaultValue={settings?.compliance?.inspectionFrequency?.atRisk || 30}
                    />
                    <p className="text-xs text-gray-500">How often to inspect at-risk properties</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button>Save Compliance Settings</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="p-6">
              <h2 className="text-lg font-medium mb-4">Alert Configuration</h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure how alerts are processed, assigned, and notified to staff members.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Response Deadlines</h3>
                  <div className="space-y-2">
                    <Label htmlFor="high-response">High Priority (hours)</Label>
                    <Input
                      id="high-response"
                      type="number"
                      defaultValue={settings?.alerts?.responseDeadlines?.high || 24}
                    />
                    <p className="text-xs text-gray-500">Maximum response time for high priority alerts</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="medium-response">Medium Priority (hours)</Label>
                    <Input
                      id="medium-response"
                      type="number"
                      defaultValue={settings?.alerts?.responseDeadlines?.medium || 48}
                    />
                    <p className="text-xs text-gray-500">Maximum response time for medium priority alerts</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="low-response">Low Priority (hours)</Label>
                    <Input
                      id="low-response"
                      type="number"
                      defaultValue={settings?.alerts?.responseDeadlines?.low || 72}
                    />
                    <p className="text-xs text-gray-500">Maximum response time for low priority alerts</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Methods</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch id="email-notify" defaultChecked={settings?.alerts?.notifications?.email} />
                    <Label htmlFor="email-notify">Email Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch id="sms-notify" defaultChecked={settings?.alerts?.notifications?.sms} />
                    <Label htmlFor="sms-notify">SMS Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch id="system-notify" defaultChecked={settings?.alerts?.notifications?.system} />
                    <Label htmlFor="system-notify">System Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch id="auto-assign" defaultChecked={settings?.alerts?.autoAssign} />
                    <Label htmlFor="auto-assign">Auto-assign to Available Staff</Label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button>Save Alert Settings</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="p-6">
              <h2 className="text-lg font-medium mb-4">User Management</h2>
              <p className="text-sm text-gray-500 mb-6">
                Manage staff members who have access to the Housing Compliance Dashboard.
              </p>
              
              <div className="mb-4 flex justify-end">
                <Button>Add New User</Button>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {settings?.users?.map((user: User) => (
                    <li key={user.id}>
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="integrations" className="p-6">
              <h2 className="text-lg font-medium mb-4">External Integrations</h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure integrations with third-party systems and services.
              </p>
              
              <div className="space-y-6">
                {settings?.integrations?.map((integration: Integration, index: number) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{integration.name}</h3>
                        <p className="text-gray-500">{integration.description}</p>
                      </div>
                      <Switch id={`integration-${index}`} defaultChecked={integration.enabled} />
                    </div>
                    
                    <div className="mt-4">
                      <Label htmlFor={`api-url-${index}`}>API Endpoint</Label>
                      <Input
                        id={`api-url-${index}`}
                        className="mt-1"
                        defaultValue={integration.apiUrl}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline" size="sm">Test Connection</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance" className="p-6">
              <h2 className="text-lg font-medium mb-4">System Maintenance</h2>
              <p className="text-sm text-gray-500 mb-6">
                Perform system maintenance tasks such as data management and backups.
              </p>
              
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Data Management</h3>
                  <p className="text-gray-500 mb-4">
                    Manage system data including properties, sensors, and other records.
                  </p>
                  
                  <ClearDataSection />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">System Backup</h3>
                  <p className="text-gray-500 mb-4">
                    Create and manage system backups for disaster recovery.
                  </p>
                  
                  <div className="mt-4">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 mr-3">
                      Create Backup
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-transparent hover:bg-blue-50">
                      View Backup History
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Deployment Preparation</h3>
                  <p className="text-gray-500 mb-4">
                    Save current system data for deployment. This creates a data file that will be used when the application is deployed.
                  </p>
                  
                  <SaveDataSection />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;