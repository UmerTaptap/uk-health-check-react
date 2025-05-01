// Property Types
export type PropertyStatus = 'compliant' | 'at-risk' | 'non-compliant';
export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  status: PropertyStatus;
  riskLevel: RiskLevel;
  riskReason: string;
  alerts: {
    high: number;
    medium: number;
    low: number;
  };
  lastInspection: {
    date: string;
    daysAgo: number;
  };
  sensors: number;
  groupId?: number | null;
  groupName?: string;
}

export interface PropertyData {
  _id: string,
  name: string;
  address: string;
  description: string;
  propertyDetails: {
    type: string;
    units: number;
    build: number;
    lastRenovation: number;
    lastInspection: Date;
    propertyManager: string;
  };
  compliance: {
    currentStatus: string;
    riskLevel: RiskLevel;
    riskReason: string;
  };
}

// Alert Types
export type AlertSeverity = 'high' | 'medium' | 'low';
export type AlertType = 'moisture' | 'mould' | 'air-quality' | 'tenant-report';

export interface Alert {
  id: string;
  propertyId: string; // Added propertyId field for navigation
  type: AlertType;
  severity: AlertSeverity;
  location: string;
  detectedAt: string;
  reading?: string;
  deadline: string;
  assignedTo: {
    initials: string;
    name: string;
  };
}

// Sensor Types
export type SensorType = 'moisture' | 'temperature' | 'air-quality';
export type SensorStatus = 'active' | 'inactive';

export interface Sensor {
  id: string;
  type: SensorType;
  location: string;
  status: SensorStatus;
  currentReading: string;
  isWarning: boolean;
  batteryLevel: number;
  lastUpdated: string;
  propertyId: number;
}

// Document Types
export type DocumentType = 'gas_safety' | 'electrical' | 'epc' | 'fire_safety' | 'asbestos' | 'other';
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

export interface Document {
  id: string;
  propertyId: string;
  title: string;
  type: DocumentType;
  fileUrl: string;
  issueDate: string;
  expiryDate?: string;
  status: DocumentStatus;
  uploadedBy: {
    id: string;
    name: string;
  };
  notes?: string;
  createdAt: string;
}

export interface PropertyDetail extends Omit<Property, 'alerts'> {
  propertyType: string;
  units: number;
  yearBuilt: number;
  lastRenovation?: string;
  propertyManager: string;
  sensorTypes?: string[];
  sensorCount?: number;
  sensorLocations?: string[];
  alertCounts?: {
    high: number;
    medium: number;
    low: number;
  };
  compliance: {
    compliantAreas: number;
    atRiskAreas: number;
    nonCompliantAreas: number;
  };
  environmentalData: {
    moisture: any[];
    temperature: any[];
    airQuality?: any[];
  };
  recentActivity: {
    type?: string;
    title?: string;
    description?: string;
    date: string;
    activity?: string;
  }[];
  relatedProperties?: string[];
  sensorsList?: Sensor[];
  inspections?: {
    nextInspection?: {
      date: string;
      daysRemaining: number;
    };
    maintenanceHistory?: {
      date: string;
      type: string;
      description: string;
    }[];
  };
}

// Work Order Types
export type WorkOrderPriority = 'emergency' | 'high' | 'medium' | 'low';
export type WorkOrderStatus = 'new' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'closed' | 'cancelled';
export type WorkOrderSource = 'sensor_alert' | 'tenant_report' | 'inspection' | 'scheduled_maintenance' | 'staff_report' | 'external_system';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  source: WorkOrderSource;
  createdAt: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  cost?: number;
  notes?: string;
}

export interface WorkOrderHistory {
  id: string;
  workOrderId: string;
  timestamp: string;
  comment: string;
  statusChange?: WorkOrderStatus;
  user: {
    id: string;
    name: string;
  };
}

// Settings Types
export interface ThresholdSettings {
  moisture: {
    warning: number;
    critical: number;
  };
  temperature: {
    min: number;
    max: number;
  };
  airQuality: {
    warning: number;
    critical: number;
  };
}

export interface AlertSettings {
  responseTimeHours: {
    high: number;
    medium: number;
    low: number;
  };
  autoAssignment: boolean;
  notificationChannels: string[];
}

export interface SystemSettings {
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  dataRetentionDays: number;
  userSessionTimeoutMinutes: number;
}

export interface Settings {
  thresholds: ThresholdSettings;
  alerts: AlertSettings;
  system: SystemSettings;
}

// Dashboard Types
export interface DashboardStats {
  highRiskProperties: number;
  highRiskChange: number;
  complianceRate: number;
  complianceRateChange: number;
  riskAssessmentRate?: number;
  responseTime: number;
  responseTimeChange: number;
  activeSensors: number;
  activeSensorsChange: number;
}

export interface DashboardData {
  stats: DashboardStats;
  charts?: {
    moistureReadings?: any[];
    temperatureReadings?: any[];
    propertyComplianceData?: any[];
    alertsData?: any[];
    responseTimeData?: any[];
  };
  alerts: Alert[];
  properties: Property[];
  workOrders?: Array<WorkOrder & { assignedToStaff?: string }>;
}

// Report Types
export interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  properties?: string[];
  downloadUrl: string;
}

export interface ReportData {
  reports: Report[];
  insights: {
    title: string;
    description: string;
    trend: 'up' | 'down' | 'neutral';
    value: number;
  }[];
}