import { 
  Alert, 
  AlertSeverity, 
  AlertType, 
  DashboardData, 
  Document,
  DocumentStatus,
  DocumentType,
  Property, 
  PropertyDetail, 
  PropertyStatus, 
  RiskLevel, 
  Sensor,
  SensorStatus,
  SensorType
} from './types';

// Mock data for Moisture Readings
export const moistureReadings = [
  { month: 'Jan', avg: 55, threshold: 70 },
  { month: 'Feb', avg: 58, threshold: 70 },
  { month: 'Mar', avg: 62, threshold: 70 },
  { month: 'Apr', avg: 67, threshold: 70 },
  { month: 'May', avg: 72, threshold: 70 },
  { month: 'Jun', avg: 75, threshold: 70 },
  { month: 'Jul', avg: 71, threshold: 70 },
  { month: 'Aug', avg: 68, threshold: 70 },
  { month: 'Sep', avg: 65, threshold: 70 },
];

// Mock data for Temperature Readings
export const temperatureReadings = [
  { month: 'Jan', avg: 18.2, threshold: 18 },
  { month: 'Feb', avg: 18.5, threshold: 18 },
  { month: 'Mar', avg: 19.1, threshold: 18 },
  { month: 'Apr', avg: 19.8, threshold: 18 },
  { month: 'May', avg: 20.5, threshold: 18 },
  { month: 'Jun', avg: 21.2, threshold: 18 },
  { month: 'Jul', avg: 22.1, threshold: 18 },
  { month: 'Aug', avg: 21.5, threshold: 18 },
  { month: 'Sep', avg: 20.2, threshold: 18 },
];

// Mock data for Alert Distribution
export const alertsData = [
  { name: 'High Priority', value: 14, color: '#FF6384' },
  { name: 'Medium Priority', value: 27, color: '#FFCE56' },
  { name: 'Low Priority', value: 41, color: '#36A2EB' },
  { name: 'Resolved', value: 162, color: '#4BC0C0' },
];

// Mock data for Property Compliance Distribution
export const propertyComplianceData = [
  { name: 'Fully Compliant', value: 823, color: '#10B981' },
  { name: 'Minor Issues', value: 142, color: '#F59E0B' },
  { name: 'Major Issues', value: 35, color: '#EF4444' },
];

// Mock data for Response Time by Severity
export const responseTimeData = [
  { severity: 'Critical', avgTime: 7, target: 24 },
  { severity: 'High', avgTime: 38, target: 72 },
  { severity: 'Medium', avgTime: 94, target: 120 },
  { severity: 'Low', avgTime: 156, target: 168 },
];

// Mock alerts data
export const alerts: Alert[] = [
  {
    id: 'alert-001',
    propertyId: 'prop-001', // 42 Maple Street
    type: 'moisture',
    severity: 'high',
    location: '42 Maple Street, Flat 3B',
    detectedAt: '4 hours ago',
    reading: '85% (15% above threshold)',
    deadline: '20 hours remaining',
    assignedTo: {
      initials: 'TJ',
      name: 'Tom Johnson'
    }
  },
  {
    id: 'alert-002',
    propertyId: 'prop-002', // 17 Oak Lane
    type: 'air-quality',
    severity: 'medium',
    location: '17 Oak Lane, Flat 5A',
    detectedAt: '1 day ago',
    reading: '1400ppm (400ppm above threshold)',
    deadline: '2 days remaining',
    assignedTo: {
      initials: 'SL',
      name: 'Sarah Lee'
    }
  },
  {
    id: 'alert-003',
    propertyId: 'prop-003', // 8 Birch Road
    type: 'mould',
    severity: 'high',
    location: '8 Birch Road, Flat 12',
    detectedAt: '8 hours ago',
    reading: 'Class 2 (visible growth)',
    deadline: '16 hours remaining',
    assignedTo: {
      initials: 'RB',
      name: 'Rachel Brown'
    }
  },
  {
    id: 'alert-004',
    propertyId: 'prop-004', // 103 Cedar Close
    type: 'tenant-report',
    severity: 'low',
    location: '103 Cedar Close, Flat 7D',
    detectedAt: '2 days ago',
    reading: 'Normal (under investigation)',
    deadline: '5 days remaining',
    assignedTo: {
      initials: 'MK',
      name: 'Mark Khan'
    }
  }
];

// Mock properties data
export const properties: Property[] = [
  {
    id: 'prop-001',
    name: '42 Maple Street',
    description: '12-unit building',
    address: '42 Maple Street, Manchester, M12 4DP',
    status: 'non-compliant',
    riskLevel: 'high',
    riskReason: 'Moisture & Mould Issues',
    alerts: {
      high: 4,
      medium: 2,
      low: 0
    },
    lastInspection: {
      date: 'Nov 22, 2023',
      daysAgo: 21
    },
    sensors: 24
  },
  {
    id: 'prop-002',
    name: '17 Oak Lane',
    description: '8-unit building',
    address: '17 Oak Lane, Manchester, M14 5RT',
    status: 'at-risk',
    riskLevel: 'medium',
    riskReason: 'Air Quality Issues',
    alerts: {
      high: 1,
      medium: 3,
      low: 0
    },
    lastInspection: {
      date: 'Dec 5, 2023',
      daysAgo: 8
    },
    sensors: 16
  },
  {
    id: 'prop-003',
    name: '8 Birch Road',
    description: '24-unit building',
    address: '8 Birch Road, Manchester, M1 3LP',
    status: 'non-compliant',
    riskLevel: 'high',
    riskReason: 'Mould & Air Quality Issues',
    alerts: {
      high: 3,
      medium: 1,
      low: 0
    },
    lastInspection: {
      date: 'Nov 29, 2023',
      daysAgo: 14
    },
    sensors: 48
  },
  {
    id: 'prop-004',
    name: '103 Cedar Close',
    description: '16-unit building',
    address: '103 Cedar Close, Manchester, M20 2JG',
    status: 'at-risk',
    riskLevel: 'medium',
    riskReason: 'Humidity Concerns',
    alerts: {
      high: 0,
      medium: 2,
      low: 1
    },
    lastInspection: {
      date: 'Dec 10, 2023',
      daysAgo: 3
    },
    sensors: 32
  },
  {
    id: 'prop-005',
    name: '27 Elm Avenue',
    description: '6-unit building',
    address: '27 Elm Avenue, Manchester, M4 1WE',
    status: 'compliant',
    riskLevel: 'low',
    riskReason: 'Minor Maintenance Issues',
    alerts: {
      high: 0,
      medium: 0,
      low: 1
    },
    lastInspection: {
      date: 'Dec 1, 2023',
      daysAgo: 12
    },
    sensors: 12
  },
  {
    id: 'prop-006',
    name: '56 Willow Court',
    description: '18-unit building',
    address: '56 Willow Court, Manchester, M15 6PL',
    status: 'compliant',
    riskLevel: 'none',
    riskReason: 'No Issues Detected',
    alerts: {
      high: 0,
      medium: 0,
      low: 0
    },
    lastInspection: {
      date: 'Dec 7, 2023',
      daysAgo: 6
    },
    sensors: 36
  }
];

// Mock sensors data
export const sensors: Sensor[] = [
  {
    id: 'sens-001',
    type: 'moisture',
    location: 'Flat 3B - Bathroom',
    status: 'active',
    currentReading: '85% RH',
    isWarning: true,
    batteryLevel: 72,
    lastUpdated: '10 minutes ago'
  },
  {
    id: 'sens-002',
    type: 'temperature',
    location: 'Flat 3B - Living Room',
    status: 'active',
    currentReading: '21.5°C',
    isWarning: false,
    batteryLevel: 65,
    lastUpdated: '15 minutes ago'
  },
  {
    id: 'sens-003',
    type: 'air-quality',
    location: 'Flat 3B - Kitchen',
    status: 'active',
    currentReading: '950 ppm CO2',
    isWarning: false,
    batteryLevel: 88,
    lastUpdated: '5 minutes ago'
  },
  {
    id: 'sens-004',
    type: 'moisture',
    location: 'Flat 4A - Bathroom',
    status: 'active',
    currentReading: '65% RH',
    isWarning: false,
    batteryLevel: 45,
    lastUpdated: '30 minutes ago'
  },
  {
    id: 'sens-005',
    type: 'temperature',
    location: 'Flat 4A - Bedroom',
    status: 'inactive',
    currentReading: 'N/A',
    isWarning: false,
    batteryLevel: 5,
    lastUpdated: '2 days ago'
  }
];

// Mock property detail
export const propertyDetail: PropertyDetail = {
  id: 'prop-001',
  name: '42 Maple Street',
  description: '12-unit building',
  address: '42 Maple Street, Manchester, M12 4DP',
  status: 'non-compliant',
  riskLevel: 'high',
  riskReason: 'Moisture & Mould Issues',
  alertCounts: {
    high: 4,
    medium: 2,
    low: 0
  },
  lastInspection: {
    date: 'Nov 22, 2023',
    daysAgo: 21
  },
  sensors: 24,
  propertyType: 'Residential Apartment Building',
  units: 12,
  yearBuilt: 1985,
  lastRenovation: '2010',
  propertyManager: 'John Smith',
  compliance: {
    compliantAreas: 7,
    atRiskAreas: 3,
    nonCompliantAreas: 2
  },
  environmentalData: {
    moisture: moistureReadings,
    temperature: temperatureReadings
  },
  recentActivity: [
    {
      type: 'alert',
      title: 'High Moisture Alert Detected',
      description: 'Moisture levels exceeded 85% in Flat 3B Bathroom',
      date: '4 hours ago'
    },
    {
      type: 'inspection',
      title: 'Routine Inspection Completed',
      description: 'All units inspected, 3 issues identified for follow-up',
      date: '3 days ago'
    },
    {
      type: 'maintenance',
      title: 'Ventilation System Serviced',
      description: 'Common area ventilation systems cleaned and serviced',
      date: '1 week ago'
    }
  ],
  sensorsList: sensors,
  inspections: {
    nextInspection: {
      date: 'Dec 22, 2023',
      daysRemaining: 9
    },
    maintenanceHistory: [
      {
        date: 'November 22, 2023',
        type: 'Full Property Inspection',
        description: 'Annual inspection of all units. Identified moisture issues in units 3B and 5C.'
      },
      {
        date: 'October 15, 2023',
        type: 'Ventilation System Service',
        description: 'Cleaned and serviced all ventilation systems throughout the building.'
      },
      {
        date: 'September 3, 2023',
        type: 'Mould Remediation',
        description: 'Remediated mould growth in unit 3B bathroom. Replaced affected drywall and treated the area.'
      }
    ]
  }
};

// Mock dashboard data
export const dashboardData: DashboardData = {
  stats: {
    highRiskProperties: 2, // Adjusted to show actual high risk properties count out of 6 total
    highRiskChange: 0,
    complianceRate: 67, // 4 out of 6 properties are compliant (67%)
    complianceRateChange: 2,
    responseTime: 6,
    responseTimeChange: -4,
    activeSensors: 168,
    activeSensorsChange: 12
  },
  charts: {
    moistureReadings: moistureReadings,
    propertyComplianceData: propertyComplianceData,
    alertsData: alertsData,
    responseTimeData: responseTimeData
  },
  alerts: alerts,
  properties: properties.slice(0, 4)
};

// Mock settings data
export const settingsData = {
  compliance: {
    moisture: {
      warning: 70,
      critical: 80
    },
    temperature: {
      minimum: 18,
      maximum: 27
    },
    airQuality: {
      co2: {
        warning: 1000,
        critical: 1500
      }
    },
    inspectionFrequency: {
      standard: 90,
      atRisk: 30
    }
  },
  alerts: {
    responseDeadlines: {
      high: 24,
      medium: 72,
      low: 168
    },
    notifications: {
      email: true,
      sms: true,
      system: true
    },
    autoAssign: true
  },
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@housing.org',
      role: 'Housing Manager',
      active: true,
      initials: 'JD',
      lastLogin: 'Today, 09:45'
    },
    {
      id: 2,
      name: 'Sarah Lee',
      email: 'sarah.lee@housing.org',
      role: 'Maintenance Supervisor',
      active: true,
      initials: 'SL',
      lastLogin: 'Yesterday, 16:20'
    },
    {
      id: 3,
      name: 'Tom Johnson',
      email: 'tom.johnson@housing.org',
      role: 'Inspector',
      active: true,
      initials: 'TJ',
      lastLogin: 'Today, 11:15'
    },
    {
      id: 4,
      name: 'Rachel Brown',
      email: 'rachel.brown@housing.org',
      role: 'Property Manager',
      active: false,
      initials: 'RB',
      lastLogin: '1 month ago'
    }
  ],
  integrations: [
    {
      name: 'Property Management System',
      description: 'Integration with main property database',
      enabled: true,
      apiUrl: 'https://api.propertysystem.com/v1',
    },
    {
      name: 'Work Order System',
      description: 'Create and track maintenance work orders',
      enabled: true,
      apiUrl: 'https://workorders.maintenance.com/api',
    },
    {
      name: 'Tenant Portal',
      description: 'Connect with tenant reporting system',
      enabled: false,
      apiUrl: 'https://tenants.portal.com/api/v2',
    }
  ]
};

// Mock reports data
// Mock documents data
export const documents: Document[] = [
  {
    id: 'doc-001',
    propertyId: 'prop-001',
    title: 'Annual Gas Safety Certificate',
    type: 'gas_safety',
    fileUrl: '/uploads/documents/gas_safety_42_maple_street.pdf',
    issueDate: '2023-11-15',
    expiryDate: '2024-11-15',
    status: 'valid',
    uploadedBy: {
      id: '1',
      name: 'John Doe'
    },
    notes: 'All appliances passed inspection',
    createdAt: '2023-11-15'
  },
  {
    id: 'doc-002',
    propertyId: 'prop-001',
    title: 'Electrical Installation Condition Report',
    type: 'electrical',
    fileUrl: '/uploads/documents/electrical_safety_42_maple_street.pdf',
    issueDate: '2023-10-05',
    expiryDate: '2028-10-05',
    status: 'valid',
    uploadedBy: {
      id: '3',
      name: 'Tom Johnson'
    },
    notes: 'Five-year certification',
    createdAt: '2023-10-05'
  },
  {
    id: 'doc-003',
    propertyId: 'prop-001',
    title: 'Energy Performance Certificate',
    type: 'epc',
    fileUrl: '/uploads/documents/epc_42_maple_street.pdf',
    issueDate: '2022-06-20',
    expiryDate: '2032-06-20',
    status: 'valid',
    uploadedBy: {
      id: '2',
      name: 'Sarah Lee'
    },
    createdAt: '2022-06-20'
  },
  {
    id: 'doc-004',
    propertyId: 'prop-001',
    title: 'Fire Risk Assessment',
    type: 'fire_safety',
    fileUrl: '/uploads/documents/fire_safety_42_maple_street.pdf',
    issueDate: '2023-03-10',
    expiryDate: '2024-03-10',
    status: 'expiring_soon',
    uploadedBy: {
      id: '1',
      name: 'John Doe'
    },
    notes: 'Some minor improvements needed in common areas',
    createdAt: '2023-03-10'
  },
  {
    id: 'doc-005',
    propertyId: 'prop-002',
    title: 'Annual Gas Safety Certificate',
    type: 'gas_safety',
    fileUrl: '/uploads/documents/gas_safety_17_oak_lane.pdf',
    issueDate: '2023-05-18',
    expiryDate: '2024-05-18',
    status: 'valid',
    uploadedBy: {
      id: '3',
      name: 'Tom Johnson'
    },
    createdAt: '2023-05-18'
  },
  {
    id: 'doc-006',
    propertyId: 'prop-003',
    title: 'Asbestos Management Survey',
    type: 'asbestos',
    fileUrl: '/uploads/documents/asbestos_8_birch_road.pdf',
    issueDate: '2022-11-30',
    expiryDate: '2027-11-30',
    status: 'valid',
    uploadedBy: {
      id: '2',
      name: 'Sarah Lee'
    },
    notes: 'No asbestos found in accessible areas',
    createdAt: '2022-11-30'
  }
];

export const reportsData = {
  compliance: {
    title: 'Compliance Overview',
    timeRangeLabel: 'Last 30 Days',
    summaryStats: [
      {
        label: 'Compliance Rate',
        value: '92%',
        change: {
          isPositive: true,
          value: '2%',
          label: 'from previous period'
        }
      },
      {
        label: 'Properties Inspected',
        value: '124',
        change: {
          isPositive: true,
          value: '15',
          label: 'more than target'
        }
      },
      {
        label: 'High Risk Properties',
        value: '2',
        change: {
          isPositive: false,
          value: '0',
          label: 'no change since last month'
        }
      },
      {
        label: 'Issues Resolved',
        value: '87',
        change: {
          isPositive: true,
          value: '12',
          label: 'more than last month'
        }
      }
    ],
    insights: [
      {
        type: 'positive',
        title: 'Compliance Improvement',
        description: 'Overall compliance rate has improved by 2% in the last 30 days.',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        type: 'negative',
        title: 'Rising Moisture Issues',
        description: 'There has been a 15% increase in moisture-related alerts during rainy season.',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      },
      {
        type: 'neutral',
        title: 'Inspection Efficiency',
        description: 'Average inspection time has remained stable at 45 minutes per property.',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      }
    ]
  },
  alerts: {
    title: 'Alerts Summary',
    timeRangeLabel: 'Last 30 Days',
    summaryStats: [
      {
        label: 'Total Alerts',
        value: '243',
        change: {
          isPositive: false,
          value: '18',
          label: 'increase since last month'
        }
      },
      {
        label: 'High Priority',
        value: '42',
        change: {
          isPositive: false,
          value: '7',
          label: 'more than previous period'
        }
      },
      {
        label: 'Avg. Response Time',
        value: '18hrs',
        change: {
          isPositive: true,
          value: '4hrs',
          label: 'faster than target'
        }
      },
      {
        label: 'Resolution Rate',
        value: '94%',
        change: {
          isPositive: true,
          value: '3%',
          label: 'improvement'
        }
      }
    ],
    insights: [
      {
        type: 'positive',
        title: 'Faster Response Times',
        description: 'Response times for high priority alerts have improved by 15% this month.',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        type: 'negative',
        title: 'Increasing Moisture Alerts',
        description: '65% of all new alerts are related to moisture issues, up from 48% last month.',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      },
      {
        type: 'neutral',
        title: 'Alert Distribution',
        description: 'North region properties account for 40% of all alerts, consistent with previous months.',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      }
    ]
  }
};
