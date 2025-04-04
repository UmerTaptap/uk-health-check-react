import { 
  InsertUser, 
  User, 
  InsertPropertyGroup,
  PropertyGroup,
  InsertProperty, 
  Property, 
  InsertAlert, 
  Alert, 
  InsertSensor, 
  Sensor, 
  InsertInspection, 
  Inspection, 
  InsertMaintenance, 
  Maintenance, 
  InsertSettings, 
  Setting,
  InsertDocument,
  Document,
  WorkOrder,
  InsertWorkOrder,
  WorkOrderHistory,
  InsertWorkOrderHistory,
  Staff,
  InsertStaff,
  WorkOrderCost,
  InsertWorkOrderCost,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderSource,
  StaffRole,
  EmployerType
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property Group operations
  getPropertyGroups(): Promise<PropertyGroup[]>;
  getPropertyGroup(id: number): Promise<PropertyGroup | undefined>;
  createPropertyGroup(group: InsertPropertyGroup): Promise<PropertyGroup>;
  updatePropertyGroup(id: number, group: Partial<InsertPropertyGroup>): Promise<PropertyGroup | undefined>;
  getPropertiesByGroup(groupId: number): Promise<Property[]>;
  assignPropertiesToGroup(groupId: number, propertyIds: (number | string)[]): Promise<Property[]>;
  
  // Property operations
  getProperties(): Promise<Property[]>;
  getProperty(id: number | string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number | string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number | string): Promise<boolean>;
  
  // Alert operations
  getAlerts(): Promise<Alert[]>;
  getAlertsByProperty(propertyId: number | string): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  
  // Sensor operations
  getSensors(): Promise<Sensor[]>;
  getSensorsByProperty(propertyId: number | string): Promise<Sensor[]>;
  getSensor(id: number): Promise<Sensor | undefined>;
  createSensor(sensor: InsertSensor): Promise<Sensor>;
  updateSensor(id: number, sensor: Partial<InsertSensor>): Promise<Sensor | undefined>;
  deleteSensor(id: number): Promise<boolean>;
  
  // Inspection operations
  getInspections(): Promise<Inspection[]>;
  getInspectionsByProperty(propertyId: number | string): Promise<Inspection[]>;
  getInspection(id: number): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  
  // Maintenance operations
  getMaintenances(): Promise<Maintenance[]>;
  getMaintenancesByProperty(propertyId: number | string): Promise<Maintenance[]>;
  getMaintenance(id: number): Promise<Maintenance | undefined>;
  createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance>;
  
  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocumentsByProperty(propertyId: number | string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Settings operations
  getSettings(): Promise<Setting[]>;
  getSettingsByCategory(category: string): Promise<Setting | undefined>;
  updateSettings(id: number, settings: Partial<InsertSettings>): Promise<Setting | undefined>;
  
  // Work Order operations
  getWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrdersByProperty(propertyId: number | string): Promise<WorkOrder[]>;
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  
  // Work Order History operations
  getWorkOrderHistory(workOrderId: number): Promise<WorkOrderHistory[]>;
  addWorkOrderHistory(history: InsertWorkOrderHistory): Promise<WorkOrderHistory>;
  
  // Staff operations
  getStaff(): Promise<Staff[]>;
  getStaffById(id: number): Promise<Staff | undefined>;
  getStaffByEmail(email: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  
  // Work Order Cost operations
  getWorkOrderCosts(): Promise<WorkOrderCost[]>;
  getWorkOrderCostsByWorkOrder(workOrderId: number): Promise<WorkOrderCost[]>;
  getWorkOrderCost(id: number): Promise<WorkOrderCost | undefined>;
  createWorkOrderCost(cost: InsertWorkOrderCost): Promise<WorkOrderCost>;
  updateWorkOrderCost(id: number, cost: Partial<InsertWorkOrderCost>): Promise<WorkOrderCost | undefined>;
  deleteWorkOrderCost(id: number): Promise<boolean>;
  
  // System operations
  clearAllData(): Promise<boolean>;
  saveDataToFile(): Promise<boolean>; // Save current data to a file
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private propertyGroups: Map<number, PropertyGroup>;
  private properties: Map<number, Property>;
  private alerts: Map<number, Alert>;
  private sensors: Map<number, Sensor>;
  private inspections: Map<number, Inspection>;
  private maintenances: Map<number, Maintenance>;
  private documents: Map<number, Document>;
  private settingsMap: Map<number, Setting>;
  private workOrders: Map<number, WorkOrder>;
  private workOrderHistories: Map<number, WorkOrderHistory>;
  private staff: Map<number, Staff>;
  private workOrderCosts: Map<number, WorkOrderCost>;
  
  private userCurrentId: number;
  private propertyGroupCurrentId: number;
  private propertyCurrentId: number;
  private alertCurrentId: number;
  private sensorCurrentId: number;
  private inspectionCurrentId: number;
  private maintenanceCurrentId: number;
  private documentCurrentId: number;
  private settingsCurrentId: number;
  private workOrderCurrentId: number;
  private workOrderHistoryCurrentId: number;
  private staffCurrentId: number;
  private workOrderCostCurrentId: number;

  constructor() {
    this.users = new Map();
    this.propertyGroups = new Map();
    this.properties = new Map();
    this.alerts = new Map();
    this.sensors = new Map();
    this.inspections = new Map();
    this.maintenances = new Map();
    this.documents = new Map();
    this.settingsMap = new Map();
    this.workOrders = new Map();
    this.workOrderHistories = new Map();
    this.staff = new Map();
    this.workOrderCosts = new Map();
    
    this.userCurrentId = 1;
    this.propertyGroupCurrentId = 1;
    this.propertyCurrentId = 1;
    this.alertCurrentId = 1;
    this.sensorCurrentId = 1;
    this.inspectionCurrentId = 1;
    this.maintenanceCurrentId = 1;
    this.documentCurrentId = 1;
    this.settingsCurrentId = 1;
    this.workOrderCurrentId = 1;
    this.workOrderHistoryCurrentId = 1;
    this.staffCurrentId = 1;
    this.workOrderCostCurrentId = 1;
    
    // Initialize with some default data
    // Call as a void function to avoid blocking the constructor
    this.initializeData().catch(error => {
      console.error('Error initializing data:', error);
    });
  }

  private async initializeData() {
    // Add a default admin user
    await this.createUser({
      username: 'admin',
      password: 'admin123',
      name: 'John Doe',
      email: 'john.doe@housing.org',
      role: 'Housing Manager',
      active: true
    });
    
    // Add test staff members
    const staff1Id = this.staffCurrentId; // Store the ID before creating
    await this.createStaff({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@housing.org',
      phone: '07700 900123',
      role: StaffRole.TECHNICIAN,
      employerType: EmployerType.INTERNAL,
      employer: 'Manchester Housing Association',
      jobTitle: 'Maintenance Technician',
      active: true,
      specializations: ['plumbing', 'electrical']
    });
    
    const staff2Id = this.staffCurrentId; // Store the ID before creating
    await this.createStaff({
      name: 'Michael Thompson',
      email: 'michael.thompson@housing.org',
      phone: '07700 900456',
      role: StaffRole.INSPECTOR,
      employerType: EmployerType.INTERNAL,
      employer: 'Manchester Housing Association',
      jobTitle: 'Building Inspector',
      active: true,
      specializations: ['mould', 'damp']
    });
    
    // Initialize with mock properties to match client-side data
    await this.initializeMockProperties();
    
    // Initialize sensors for existing properties if none exist
    await this.initializeMockSensors();
    
    // Initialize work orders and costs - Pass the staff IDs
    await this.initializeWorkOrdersAndCosts(staff1Id, staff2Id - 1);
  }
  
  private async initializeWorkOrdersAndCosts(maintenanceStaffId: number, inspectorStaffId: number) {
    try {
      // Create work orders for properties
      const properties = await this.getProperties();
      if (properties.length > 0) {
        // Work order for first property (mould issue)
        const workOrder1 = await this.createWorkOrder({
          title: "Fix mould issue in bathroom",
          description: "Tenant reported black mould on bathroom ceiling and walls",
          propertyId: String(properties[0].id), // Convert to string as schema expects string
          priority: "high", // Direct string value instead of enum
          status: "in_progress", // Direct string value instead of enum
          assignedTo: maintenanceStaffId,
          estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          source: "tenant_report", // Direct string value instead of enum
          notes: "Need to address immediately due to tenant health concerns"
        });
        
        // Add costs to the work order
        await this.createWorkOrderCost({
          workOrderId: workOrder1.id,
          description: "Professional mould treatment chemicals",
          amount: 17550, // Amount in pennies (£175.50)
          date: new Date(),
          costType: "materials",
          invoiceNumber: "INV-2025-0342"
        });
        
        await this.createWorkOrderCost({
          workOrderId: workOrder1.id,
          description: "Specialist labor - 3 hours",
          amount: 22500, // Amount in pennies (£225.00)
          date: new Date(),
          costType: "labor",
          invoiceNumber: null
        });
        
        // Work order for second property (ventilation issue)
        if (properties.length > 1) {
          const workOrder2 = await this.createWorkOrder({
            title: "Install additional ventilation",
            description: "Poor air circulation causing humidity issues",
            propertyId: String(properties[1].id), // Convert to string as schema expects string
            priority: "medium", // Direct string value instead of enum
            status: "assigned", // Direct string value instead of enum
            assignedTo: maintenanceStaffId,
            estimatedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            source: "inspection", // Direct string value instead of enum
            notes: "Schedule with tenant for access"
          });
          
          // Add costs to the work order
          await this.createWorkOrderCost({
            workOrderId: workOrder2.id,
            description: "Ventilation units (2x)",
            amount: 32000, // Amount in pennies (£320.00)
            date: new Date(),
            costType: "equipment",
            invoiceNumber: "BR-6754321"
          });
        }
        
        // Inspection work order
        if (properties.length > 2) {
          const workOrder3 = await this.createWorkOrder({
            title: "Annual compliance inspection",
            description: "Scheduled annual inspection for Awaab's Law compliance",
            propertyId: String(properties[2].id), // Convert to string as schema expects string
            priority: "medium", // Direct string value instead of enum
            status: "new", // Direct string value instead of enum
            assignedTo: inspectorStaffId,
            estimatedCompletionDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
            source: "scheduled_maintenance", // Direct string value instead of enum
            notes: "Contact property manager to arrange access"
          });
          
          // Add costs to the work order
          await this.createWorkOrderCost({
            workOrderId: workOrder3.id,
            description: "Inspection fee",
            amount: 15000, // Amount in pennies (£150.00)
            date: new Date(),
            costType: "service",
            invoiceNumber: null
          });
        }
      }
      
      console.log(`Successfully initialized work orders and costs`);
    } catch (error) {
      console.error('Error initializing work orders and costs:', error);
    }
  }
  
  private async initializeMockSensors() {
    try {
      // Check if we already have sensors
      const existingSensors = await this.getSensors();
      if (existingSensors.length > 0) {
        console.log(`Already have ${existingSensors.length} sensors, skipping sensor initialization`);
        return;
      }
      
      // Get all properties to add sensors to each
      const properties = await this.getProperties();
      
      // Create mock sensors for each property
      for (const property of properties) {
        const propertyId = property.id;
        const units = property.units || 1;
        
        console.log(`Creating sensors for property ${property.name} (ID: ${propertyId}) with ${units} units`);
        
        // For each unit in the property
        for (let unit = 0; unit < units; unit++) {
          const unitLabel = units > 1 ? ` (Unit ${unit + 1})` : '';
          
          // Add temperature sensors
          await this.createSensor({
            propertyId: propertyId,
            type: 'temperature',
            location: `Living Room${unitLabel}`,
            status: 'active',
            currentReading: '21.5',
            batteryLevel: 95
          });
          
          // Add moisture sensors
          await this.createSensor({
            propertyId: propertyId,
            type: 'moisture',
            location: `Bathroom${unitLabel}`,
            status: 'active',
            currentReading: '65.8',
            batteryLevel: 88
          });
          
          // Add air-quality sensor
          await this.createSensor({
            propertyId: propertyId,
            type: 'air-quality',
            location: `Hallway${unitLabel}`,
            status: 'active',
            currentReading: '720',
            batteryLevel: 85
          });
        }
      }
      
      console.log('Successfully initialized mock sensors');
    } catch (error) {
      console.error('Error initializing mock sensors:', error);
    }
  }
  
  private async initializeMockProperties() {
    // For testing purposes, we'll add a few mock properties
    try {
      // Add mock property 1
      await this.createProperty({
        name: "42 Maple Street",
        description: "12-unit building",
        address: "42 Maple Street, Manchester, M12 4DP",
        status: "non-compliant",
        riskLevel: "high",
        riskReason: "Moisture & Mould Issues",
        propertyType: "Residential Apartment Building",
        units: 12,
        yearBuilt: 1985,
        lastRenovation: "2010",
        propertyManager: "John Smith",
        groupId: null
      });

      // Add mock property 2
      await this.createProperty({
        name: "17 Oak Lane",
        description: "8-unit building",
        address: "17 Oak Lane, Manchester, M14 5RT",
        status: "at-risk",
        riskLevel: "medium",
        riskReason: "Air Quality Issues",
        propertyType: "Residential Apartment Building",
        units: 8,
        yearBuilt: 1992, 
        lastRenovation: "2015",
        propertyManager: "Sarah Lee",
        groupId: null
      });
      
      // Add additional properties
      await this.createProperty({
        name: "8 Birch Road",
        description: "24-unit building",
        address: "8 Birch Road, Manchester, M1 3LP",
        status: "non-compliant",
        riskLevel: "high",
        riskReason: "Mould & Air Quality Issues",
        propertyType: "Residential Apartment Building",
        units: 24,
        yearBuilt: 1975,
        lastRenovation: "2005",
        propertyManager: "Rachel Brown",
        groupId: null
      });
      
      await this.createProperty({
        name: "103 Cedar Close",
        description: "16-unit building",
        address: "103 Cedar Close, Manchester, M20 2JG",
        status: "at-risk",
        riskLevel: "medium",
        riskReason: "Humidity Concerns",
        propertyType: "Residential Apartment Building",
        units: 16,
        yearBuilt: 1998,
        lastRenovation: "2018",
        propertyManager: "Mark Khan",
        groupId: null
      });
      
      await this.createProperty({
        name: "27 Elm Avenue",
        description: "6-unit building",
        address: "27 Elm Avenue, Manchester, M4 1WE",
        status: "compliant",
        riskLevel: "low",
        riskReason: "Minor Maintenance Issues",
        propertyType: "Residential Apartment Building",
        units: 6,
        yearBuilt: 2005,
        lastRenovation: "2020",
        propertyManager: "Lisa Chen",
        groupId: null
      });
      
      await this.createProperty({
        name: "56 Willow Court",
        description: "18-unit building", 
        address: "56 Willow Court, Manchester, M15 6PL",
        status: "compliant",
        riskLevel: "none",
        riskReason: "No Issues Detected",
        propertyType: "Residential Apartment Building",
        units: 18, 
        yearBuilt: 2010,
        lastRenovation: "2021",
        propertyManager: "David Singh",
        groupId: null
      });
      
      console.log(`Initialized ${this.properties.size} mock properties`);
      
    } catch (error) {
      console.error('Error creating mock properties:', error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: timestamp,
      active: insertUser.active ?? true
    };
    this.users.set(id, user);
    return user;
  }

  // Property Group operations
  async getPropertyGroups(): Promise<PropertyGroup[]> {
    return Array.from(this.propertyGroups.values());
  }

  async getPropertyGroup(id: number): Promise<PropertyGroup | undefined> {
    return this.propertyGroups.get(id);
  }

  async createPropertyGroup(insertGroup: InsertPropertyGroup): Promise<PropertyGroup> {
    const id = this.propertyGroupCurrentId++;
    const timestamp = new Date();
    const group: PropertyGroup = { 
      ...insertGroup, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp,
      description: insertGroup.description ?? null
    };
    this.propertyGroups.set(id, group);
    return group;
  }

  async updatePropertyGroup(id: number, groupUpdate: Partial<InsertPropertyGroup>): Promise<PropertyGroup | undefined> {
    const group = this.propertyGroups.get(id);
    if (!group) return undefined;
    
    const updatedGroup: PropertyGroup = { 
      ...group, 
      ...groupUpdate, 
      updatedAt: new Date() 
    };
    this.propertyGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  async getPropertiesByGroup(groupId: number): Promise<Property[]> {
    // Get all properties
    const allProperties = Array.from(this.properties.values());
    
    // Debug logging to help diagnose issues
    console.log(`Finding properties with groupId=${groupId}`);
    console.log(`Total properties: ${allProperties.length}`);
    console.log(`Property groupIds: ${allProperties.map(p => `${p.id}:${p.groupId}`).join(', ')}`);
    
    // Filter properties that belong to the specified group
    return allProperties.filter(property => {
      // Sometimes groupId might be stored as a string, so we compare both ways
      return property.groupId === groupId || 
             (typeof property.groupId === 'string' && parseInt(property.groupId) === groupId);
    });
  }
  
  async assignPropertiesToGroup(groupId: number, propertyIds: (number | string)[]): Promise<Property[]> {
    // Verify the group exists
    const group = await this.getPropertyGroup(groupId);
    if (!group) {
      throw new Error(`Property group with ID ${groupId} not found`);
    }
    
    const updatedProperties: Property[] = [];
    
    // Update each property to assign it to the group
    for (const id of propertyIds) {
      // Keep the original ID for property lookup
      const propertyId = id;
      
      // Get the property
      const property = await this.getProperty(propertyId);
      if (!property) {
        console.warn(`Property with ID ${id} not found, skipping...`);
        continue;
      }
      
      // Update the property's groupId
      const updatedProperty = await this.updateProperty(property.id, { groupId });
      if (updatedProperty) {
        updatedProperties.push(updatedProperty);
      }
    }
    
    return updatedProperties;
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number | string): Promise<Property | undefined> {
    console.log(`getProperty: Looking up property with ID ${id}`);
    
    // For string IDs, handle various formats
    if (typeof id === 'string') {
      // Case 1: Direct numeric ID as string (e.g., "1", "2", "3")
      if (/^\d+$/.test(id)) {
        const numericId = parseInt(id);
        const property = this.properties.get(numericId);
        if (property) {
          console.log(`getProperty: Found property with ID ${numericId} in storage`);
          return property;
        }
      }
      
      // Case 2: String IDs like 'prop-001', extract numeric part and find in properties map
      if (id.startsWith('prop-')) {
        // Extract numeric ID from string (e.g., 'prop-001' → 1)
        const match = id.match(/prop-0*(\d+)/);
        if (match && match[1]) {
          const numericId = parseInt(match[1]);
          
          // Try to get property from storage
          const property = this.properties.get(numericId);
          if (property) {
            console.log(`getProperty: Found property with ID ${numericId} in storage`);
            return property;
          }
          
          // No longer generating mock properties for unknown IDs
          console.log(`getProperty: Property with ID ${numericId} not found in storage`);
          // Return undefined instead of a mock property
          // This prevents invalid properties from appearing in the system
        }
        console.log(`getProperty: Property with ID ${id} not found`);
        return undefined;
      }
      
      // If it's a string but not in prop-XXX format, try to convert to number
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        const property = this.properties.get(numericId);
        console.log(`getProperty: Looking up property with numeric ID ${numericId}: ${property ? 'Found' : 'Not found'}`);
        return property;
      }
      
      console.log(`getProperty: Property with ID ${id} not found (not a valid format)`);
      return undefined;
    }
    
    // For numeric IDs, use the map get method directly
    const property = this.properties.get(id);
    console.log(`getProperty: Looking up property with numeric ID ${id}: ${property ? 'Found' : 'Not found'}`);
    return property;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyCurrentId++;
    const timestamp = new Date();
    const property: Property = { 
      ...insertProperty, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp,
      description: insertProperty.description ?? null,
      riskReason: insertProperty.riskReason ?? null,
      propertyType: insertProperty.propertyType ?? null,
      units: insertProperty.units ?? null,
      yearBuilt: insertProperty.yearBuilt ?? null,
      lastRenovation: insertProperty.lastRenovation ?? null,
      propertyManager: insertProperty.propertyManager ?? null,
      groupId: insertProperty.groupId ?? null
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number | string, propertyUpdate: Partial<InsertProperty>): Promise<Property | undefined> {
    // For string IDs, get the property first
    let property: Property | undefined;
    if (typeof id === 'string') {
      property = await this.getProperty(id);
      if (!property) return undefined;
      id = property.id; // Use the numeric ID for updating the map
    } else {
      property = this.properties.get(id);
      if (!property) return undefined;
    }
    
    const updatedProperty: Property = { 
      ...property, 
      ...propertyUpdate, 
      updatedAt: new Date() 
    };
    
    this.properties.set(id as number, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number | string): Promise<boolean> {
    // For string IDs, get the property first
    if (typeof id === 'string') {
      const property = await this.getProperty(id);
      if (!property) return false;
      id = property.id; // Use the numeric ID for deleting from the map
    }
    
    if (!this.properties.has(id as number)) return false;
    
    // Delete the property
    return this.properties.delete(id as number);
  }

  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getAlertsByProperty(propertyId: number | string): Promise<Alert[]> {
    // For string IDs, first try to get the property to get its numeric ID
    if (typeof propertyId === 'string') {
      const property = await this.getProperty(propertyId);
      if (property) {
        return Array.from(this.alerts.values()).filter(
          alert => alert.propertyId === property.id
        );
      } else {
        // If no property found, try to extract numeric ID from string
        if (propertyId.startsWith('prop-')) {
          const match = propertyId.match(/prop-0*(\d+)/);
          if (match && match[1]) {
            const numericId = parseInt(match[1]);
            return Array.from(this.alerts.values()).filter(
              alert => alert.propertyId === numericId
            );
          }
        }
        return []; // No matching property found
      }
    }
    
    // For numeric IDs, use direct comparison
    return Array.from(this.alerts.values()).filter(
      alert => alert.propertyId === propertyId
    );
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertCurrentId++;
    const timestamp = new Date();
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp,
      propertyId: insertAlert.propertyId ?? null,
      reading: insertAlert.reading ?? null,
      detectedAt: insertAlert.detectedAt ?? timestamp,
      deadline: insertAlert.deadline ?? null,
      assignedTo: insertAlert.assignedTo ?? null
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, alertUpdate: Partial<InsertAlert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: Alert = { 
      ...alert, 
      ...alertUpdate, 
      updatedAt: new Date() 
    };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Sensor operations
  async getSensors(): Promise<Sensor[]> {
    return Array.from(this.sensors.values());
  }

  async getSensorsByProperty(propertyId: number | string): Promise<Sensor[]> {
    // For string IDs, first try to get the property to get its numeric ID
    if (typeof propertyId === 'string') {
      const property = await this.getProperty(propertyId);
      if (property) {
        return Array.from(this.sensors.values()).filter(
          sensor => sensor.propertyId === property.id
        );
      } else {
        // If no property found, try to extract numeric ID from string
        if (propertyId.startsWith('prop-')) {
          const match = propertyId.match(/prop-0*(\d+)/);
          if (match && match[1]) {
            const numericId = parseInt(match[1]);
            return Array.from(this.sensors.values()).filter(
              sensor => sensor.propertyId === numericId
            );
          }
        }
        return []; // No matching property found
      }
    }
    
    // For numeric IDs, use direct comparison
    return Array.from(this.sensors.values()).filter(
      sensor => sensor.propertyId === propertyId
    );
  }

  async getSensor(id: number): Promise<Sensor | undefined> {
    return this.sensors.get(id);
  }

  async createSensor(insertSensor: InsertSensor): Promise<Sensor> {
    const id = this.sensorCurrentId++;
    const timestamp = new Date();
    const sensor: Sensor = { 
      ...insertSensor, 
      id, 
      lastUpdated: timestamp,
      propertyId: insertSensor.propertyId ?? null,
      currentReading: insertSensor.currentReading ?? null,
      batteryLevel: insertSensor.batteryLevel ?? null
    };
    this.sensors.set(id, sensor);
    return sensor;
  }

  async updateSensor(id: number, sensorUpdate: Partial<InsertSensor>): Promise<Sensor | undefined> {
    const sensor = this.sensors.get(id);
    if (!sensor) return undefined;
    
    const updatedSensor: Sensor = { 
      ...sensor, 
      ...sensorUpdate, 
      lastUpdated: new Date() 
    };
    this.sensors.set(id, updatedSensor);
    return updatedSensor;
  }
  
  async deleteSensor(id: number): Promise<boolean> {
    if (!this.sensors.has(id)) return false;
    return this.sensors.delete(id);
  }

  // Inspection operations
  async getInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values());
  }

  async getInspectionsByProperty(propertyId: number | string): Promise<Inspection[]> {
    // For string IDs, first try to get the property to get its numeric ID
    if (typeof propertyId === 'string') {
      const property = await this.getProperty(propertyId);
      if (property) {
        return Array.from(this.inspections.values()).filter(
          inspection => inspection.propertyId === property.id
        );
      } else {
        // If no property found, try to extract numeric ID from string
        if (propertyId.startsWith('prop-')) {
          const match = propertyId.match(/prop-0*(\d+)/);
          if (match && match[1]) {
            const numericId = parseInt(match[1]);
            return Array.from(this.inspections.values()).filter(
              inspection => inspection.propertyId === numericId
            );
          }
        }
        return []; // No matching property found
      }
    }
    
    // For numeric IDs, use direct comparison
    return Array.from(this.inspections.values()).filter(
      inspection => inspection.propertyId === propertyId
    );
  }

  async getInspection(id: number): Promise<Inspection | undefined> {
    return this.inspections.get(id);
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const id = this.inspectionCurrentId++;
    const timestamp = new Date();
    const inspection: Inspection = { 
      ...insertInspection, 
      id, 
      createdAt: timestamp,
      propertyId: insertInspection.propertyId ?? null,
      inspector: insertInspection.inspector ?? null,
      findings: insertInspection.findings ?? null
    };
    this.inspections.set(id, inspection);
    return inspection;
  }

  async updateInspection(id: number, inspectionUpdate: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const inspection = this.inspections.get(id);
    if (!inspection) return undefined;
    
    const updatedInspection: Inspection = { 
      ...inspection, 
      ...inspectionUpdate
    };
    this.inspections.set(id, updatedInspection);
    return updatedInspection;
  }

  // Maintenance operations
  async getMaintenances(): Promise<Maintenance[]> {
    return Array.from(this.maintenances.values());
  }

  async getMaintenancesByProperty(propertyId: number | string): Promise<Maintenance[]> {
    // For string IDs, first try to get the property to get its numeric ID
    if (typeof propertyId === 'string') {
      const property = await this.getProperty(propertyId);
      if (property) {
        return Array.from(this.maintenances.values()).filter(
          maintenance => maintenance.propertyId === property.id
        );
      } else {
        // If no property found, try to extract numeric ID from string
        if (propertyId.startsWith('prop-')) {
          const match = propertyId.match(/prop-0*(\d+)/);
          if (match && match[1]) {
            const numericId = parseInt(match[1]);
            return Array.from(this.maintenances.values()).filter(
              maintenance => maintenance.propertyId === numericId
            );
          }
        }
        return []; // No matching property found
      }
    }
    
    // For numeric IDs, use direct comparison
    return Array.from(this.maintenances.values()).filter(
      maintenance => maintenance.propertyId === propertyId
    );
  }

  async getMaintenance(id: number): Promise<Maintenance | undefined> {
    return this.maintenances.get(id);
  }

  async createMaintenance(insertMaintenance: InsertMaintenance): Promise<Maintenance> {
    const id = this.maintenanceCurrentId++;
    const timestamp = new Date();
    const maintenance: Maintenance = { 
      ...insertMaintenance, 
      id, 
      createdAt: timestamp,
      propertyId: insertMaintenance.propertyId ?? null,
      performedBy: insertMaintenance.performedBy ?? null
    };
    this.maintenances.set(id, maintenance);
    return maintenance;
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByProperty(propertyId: number | string): Promise<Document[]> {
    // For string IDs, convert to a numeric ID if possible
    let numericPropertyId: number | null = null;
    let propertyIdStr: string | null = null;
    
    if (typeof propertyId === 'string') {
      if (propertyId.startsWith('prop-')) {
        // It's already in the string format we need for mock data
        propertyIdStr = propertyId;
        
        // Try to extract the numeric part for stored documents
        const match = propertyId.match(/prop-0*(\d+)/);
        if (match && match[1]) {
          numericPropertyId = parseInt(match[1]);
        }
      } else {
        // Try to convert to number
        numericPropertyId = parseInt(propertyId);
        if (isNaN(numericPropertyId)) {
          numericPropertyId = null;
        }
      }
    } else {
      // It's already a number
      numericPropertyId = propertyId;
    }
    
    // Get documents from storage if we have a numeric ID
    let storedDocuments: Document[] = [];
    if (numericPropertyId !== null) {
      storedDocuments = Array.from(this.documents.values()).filter(
        document => document.propertyId === numericPropertyId
      );
    }
    
    // If we have stored documents, return them
    if (storedDocuments.length > 0) {
      return storedDocuments;
    }
    
    // Otherwise, import mock documents from client-side data
    // This is a temporary solution until we have a database with real documents
    try {
      const { documents } = require('../client/src/lib/mockData');
      
      // Find documents matching this property ID
      let mockPropertyId = propertyIdStr;
      if (!mockPropertyId && numericPropertyId !== null) {
        mockPropertyId = `prop-00${numericPropertyId}`;
      }
      
      // If we don't have a valid ID format, return empty array
      if (!mockPropertyId) {
        return [];
      }
      
      const mockDocuments = documents.filter((doc: any) => doc.propertyId === mockPropertyId);
      
      // Convert mock documents to match our Document type
      return mockDocuments.map((doc: any) => ({
        id: parseInt(doc.id.replace('doc-', '')),
        propertyId,
        title: doc.title,
        type: doc.type,
        fileUrl: doc.fileUrl,
        issueDate: new Date(doc.issueDate),
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
        status: doc.status,
        uploadedBy: doc.uploadedBy ? parseInt(doc.uploadedBy.id) : null,
        notes: doc.notes || null,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.createdAt)
      }));
    } catch (error) {
      console.error('Error importing mock document data:', error);
      return [];
    }
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentCurrentId++;
    const timestamp = new Date();
    const document: Document = { 
      ...insertDocument, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp,
      propertyId: insertDocument.propertyId ?? null,
      expiryDate: insertDocument.expiryDate ?? null,
      uploadedBy: insertDocument.uploadedBy ?? null,
      notes: insertDocument.notes ?? null
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument: Document = { 
      ...document, 
      ...documentUpdate, 
      updatedAt: new Date() 
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    if (!this.documents.has(id)) return false;
    return this.documents.delete(id);
  }

  // Settings operations
  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settingsMap.values());
  }

  async getSettingsByCategory(category: string): Promise<Setting | undefined> {
    return Array.from(this.settingsMap.values()).find(
      setting => setting.category === category
    );
  }

  async updateSettings(id: number, settingsUpdate: Partial<InsertSettings>): Promise<Setting | undefined> {
    const setting = this.settingsMap.get(id);
    if (!setting) return undefined;
    
    const updatedSetting: Setting = { 
      ...setting, 
      ...settingsUpdate, 
      updatedAt: new Date() 
    };
    this.settingsMap.set(id, updatedSetting);
    return updatedSetting;
  }

  // Work Order operations
  async getWorkOrders(): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values());
  }

  async getWorkOrdersByProperty(propertyId: string | number): Promise<WorkOrder[]> {
    const propertyIdStr = propertyId.toString();
    return Array.from(this.workOrders.values()).filter(
      workOrder => workOrder.propertyId.toString() === propertyIdStr
    );
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    return this.workOrders.get(id);
  }

  async createWorkOrder(insertWorkOrder: InsertWorkOrder): Promise<WorkOrder> {
    const id = this.workOrderCurrentId++;
    const timestamp = new Date();
    const workOrder: WorkOrder = { 
      ...insertWorkOrder, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp,
      priority: insertWorkOrder.priority,
      status: insertWorkOrder.status || "new", // Direct string value instead of enum
      sourceId: insertWorkOrder.sourceId ?? null,
      assignedTo: insertWorkOrder.assignedTo ?? null,
      estimatedCompletionDate: insertWorkOrder.estimatedCompletionDate ?? null,
      actualCompletionDate: insertWorkOrder.actualCompletionDate ?? null,
      createdBy: insertWorkOrder.createdBy ?? null,
      externalSystemRef: insertWorkOrder.externalSystemRef ?? null,
      cost: insertWorkOrder.cost ?? null,
      notes: insertWorkOrder.notes ?? null
    };
    this.workOrders.set(id, workOrder);

    // Add a history entry for the creation
    if (insertWorkOrder.createdBy) {
      this.addWorkOrderHistory({
        workOrderId: id,
        userId: insertWorkOrder.createdBy,
        comment: "Work order created",
        statusChange: "new" // Direct string value instead of enum
      });
    }

    return workOrder;
  }

  async updateWorkOrder(id: number, workOrderUpdate: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const workOrder = this.workOrders.get(id);
    if (!workOrder) return undefined;
    
    // Check if status has changed
    const statusChanged = workOrderUpdate.status && workOrderUpdate.status !== workOrder.status;
    const oldStatus = workOrder.status;
    
    const updatedWorkOrder: WorkOrder = { 
      ...workOrder, 
      ...workOrderUpdate, 
      updatedAt: new Date() 
    };
    this.workOrders.set(id, updatedWorkOrder);
    
    // Add a history entry for the status change
    if (statusChanged && workOrderUpdate.status) {
      this.addWorkOrderHistory({
        workOrderId: id,
        userId: workOrderUpdate.assignedTo || workOrder.assignedTo || null,
        comment: `Status changed from ${oldStatus} to ${workOrderUpdate.status}`,
        statusChange: workOrderUpdate.status
      });
    }
    
    return updatedWorkOrder;
  }

  // Work Order History operations
  async getWorkOrderHistory(workOrderId: number): Promise<WorkOrderHistory[]> {
    return Array.from(this.workOrderHistories.values())
      .filter(history => history.workOrderId === workOrderId)
      .sort((a, b) => {
        // Handle possible null values
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async addWorkOrderHistory(historyEntry: InsertWorkOrderHistory): Promise<WorkOrderHistory> {
    const id = this.workOrderHistoryCurrentId++;
    const timestamp = new Date();
    const history: WorkOrderHistory = { 
      ...historyEntry, 
      id, 
      createdAt: timestamp,
      userId: historyEntry.userId ?? null,
      statusChange: historyEntry.statusChange ?? null
    };
    this.workOrderHistories.set(id, history);
    return history;
  }

  // Staff operations
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async getStaffById(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByEmail(email: string): Promise<Staff | undefined> {
    return Array.from(this.staff.values()).find(
      (staff) => staff.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.staffCurrentId++;
    const timestamp = new Date();
    
    // Handle array of specializations
    const specializations = insertStaff.specializations || [];
    
    const staff: Staff = { 
      ...insertStaff, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp,
      phone: insertStaff.phone ?? null,
      specializations: specializations,
      hourlyRate: insertStaff.hourlyRate ?? null,
      notes: insertStaff.notes ?? null,
      userId: insertStaff.userId ?? null,
      active: insertStaff.active ?? true
    };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaff(id: number, staffUpdate: Partial<InsertStaff>): Promise<Staff | undefined> {
    const staff = this.staff.get(id);
    if (!staff) return undefined;
    
    const updatedStaff: Staff = { 
      ...staff, 
      ...staffUpdate, 
      updatedAt: new Date() 
    };
    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }

  // Work Order Cost operations
  async getWorkOrderCosts(): Promise<WorkOrderCost[]> {
    return Array.from(this.workOrderCosts.values());
  }

  async getWorkOrderCostsByWorkOrder(workOrderId: number): Promise<WorkOrderCost[]> {
    return Array.from(this.workOrderCosts.values()).filter(
      cost => cost.workOrderId === workOrderId
    );
  }

  async getWorkOrderCost(id: number): Promise<WorkOrderCost | undefined> {
    return this.workOrderCosts.get(id);
  }

  async createWorkOrderCost(insertCost: InsertWorkOrderCost): Promise<WorkOrderCost> {
    const id = this.workOrderCostCurrentId++;
    const timestamp = new Date();
    
    // Ensure date is a Date object and not null
    const date = insertCost.date instanceof Date 
      ? insertCost.date 
      : (typeof insertCost.date === 'string' 
          ? new Date(insertCost.date) 
          : new Date());
    
    const cost: WorkOrderCost = { 
      ...insertCost, 
      id, 
      date, // Ensure date is never null
      createdAt: timestamp, 
      updatedAt: timestamp,
      staffId: insertCost.staffId ?? null,
      invoiceNumber: insertCost.invoiceNumber ?? null,
      attachmentUrl: insertCost.attachmentUrl ?? null,
      notes: insertCost.notes ?? null
    };
    this.workOrderCosts.set(id, cost);
    return cost;
  }

  async updateWorkOrderCost(id: number, costUpdate: Partial<InsertWorkOrderCost>): Promise<WorkOrderCost | undefined> {
    const cost = this.workOrderCosts.get(id);
    if (!cost) return undefined;
    
    // Ensure date is a Date object and not null if it's being updated
    const date = costUpdate.date !== undefined 
      ? (costUpdate.date instanceof Date 
          ? costUpdate.date 
          : (typeof costUpdate.date === 'string' 
              ? new Date(costUpdate.date) 
              : cost.date)) // Keep existing date if null
      : cost.date;
    
    const updatedCost: WorkOrderCost = { 
      ...cost, 
      ...costUpdate, 
      date, // Ensure date is never null
      updatedAt: new Date() 
    };
    this.workOrderCosts.set(id, updatedCost);
    return updatedCost;
  }

  async deleteWorkOrderCost(id: number): Promise<boolean> {
    return this.workOrderCosts.delete(id);
  }

  async clearAllData(): Promise<boolean> {
    try {
      // Clear all Maps
      this.users.clear();
      this.propertyGroups.clear();
      this.properties.clear();
      this.alerts.clear();
      this.sensors.clear();
      this.inspections.clear();
      this.maintenances.clear();
      this.documents.clear();
      this.settingsMap.clear();
      this.workOrders.clear();
      this.workOrderHistories.clear();
      this.staff.clear();
      this.workOrderCosts.clear();
      
      // Reset all IDs
      this.userCurrentId = 1;
      this.propertyGroupCurrentId = 1;
      this.propertyCurrentId = 1;
      this.alertCurrentId = 1;
      this.sensorCurrentId = 1;
      this.inspectionCurrentId = 1;
      this.maintenanceCurrentId = 1;
      this.documentCurrentId = 1;
      this.settingsCurrentId = 1;
      this.workOrderCurrentId = 1;
      this.workOrderHistoryCurrentId = 1;
      this.staffCurrentId = 1;
      this.workOrderCostCurrentId = 1;
      
      console.log('Successfully cleared all data');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
  
  /**
   * Save current storage data to a JSON file
   * This allows persisting the data between server restarts
   */
  async saveDataToFile(): Promise<boolean> {
    try {
      // Convert Map objects to arrays for JSON serialization
      const data = {
        properties: Array.from(this.properties.values()),
        sensors: Array.from(this.sensors.values()),
        alerts: Array.from(this.alerts.values()),
        inspections: Array.from(this.inspections.values()),
        workOrders: Array.from(this.workOrders.values()),
        documents: Array.from(this.documents.values()),
        propertyGroups: Array.from(this.propertyGroups.values()),
        users: Array.from(this.users.values()),
        staff: Array.from(this.staff.values()),
        workOrderCosts: Array.from(this.workOrderCosts.values()),
        workOrderHistories: Array.from(this.workOrderHistories.values()),
        // Also save the current ID counters
        counters: {
          userCurrentId: this.userCurrentId,
          propertyGroupCurrentId: this.propertyGroupCurrentId,
          propertyCurrentId: this.propertyCurrentId,
          alertCurrentId: this.alertCurrentId,
          sensorCurrentId: this.sensorCurrentId,
          inspectionCurrentId: this.inspectionCurrentId,
          maintenanceCurrentId: this.maintenanceCurrentId,
          documentCurrentId: this.documentCurrentId,
          settingsCurrentId: this.settingsCurrentId,
          workOrderCurrentId: this.workOrderCurrentId,
          workOrderHistoryCurrentId: this.workOrderHistoryCurrentId,
          staffCurrentId: this.staffCurrentId,
          workOrderCostCurrentId: this.workOrderCostCurrentId
        }
      };
      
      // Use dynamic import for fs with proper async/await handling
      try {
        const fs = await import('fs/promises');
        await fs.writeFile('./data.json', JSON.stringify(data, null, 2));
        console.log('Data successfully saved to data.json');
        return true;
      } catch (fsError) {
        console.error('Error with file system operation:', fsError);
        return false;
      }
    } catch (error) {
      console.error('Error preparing data for file save:', error);
      return false;
    }
  }
}

export const storage = new MemStorage();
