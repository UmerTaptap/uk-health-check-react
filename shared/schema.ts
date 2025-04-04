import { pgTable, text, serial, integer, boolean, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define work order priority and status types for better type checking
export const WorkOrderPriority = {
  EMERGENCY: 'emergency',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export const WorkOrderStatus = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
} as const;

// Define work order source types
export const WorkOrderSource = {
  SENSOR_ALERT: 'sensor_alert',
  TENANT_REPORT: 'tenant_report',
  INSPECTION: 'inspection',
  SCHEDULED_MAINTENANCE: 'scheduled_maintenance',
  STAFF_REPORT: 'staff_report',
  EXTERNAL_SYSTEM: 'external_system'
} as const;

// Define staff role types
export const StaffRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  TECHNICIAN: 'technician',
  INSPECTOR: 'inspector',
  CONTRACTOR: 'contractor',
  OTHER: 'other'
} as const;

// Define employer types
export const EmployerType = {
  INTERNAL: 'internal',
  CONTRACTOR: 'contractor',
  THIRD_PARTY: 'third_party'
} as const;

export type WorkOrderPriority = typeof WorkOrderPriority[keyof typeof WorkOrderPriority];
export type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];
export type WorkOrderSource = typeof WorkOrderSource[keyof typeof WorkOrderSource];
export type StaffRole = typeof StaffRole[keyof typeof StaffRole];
export type EmployerType = typeof EmployerType[keyof typeof EmployerType];

// Base User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Property Groups table
export const propertyGroups = pgTable("property_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  status: text("status").notNull(), // 'compliant', 'at-risk', 'non-compliant'
  riskLevel: text("risk_level").notNull(), // 'high', 'medium', 'low', 'none'
  riskReason: text("risk_reason"),
  propertyType: text("property_type"),
  units: integer("units"),
  yearBuilt: integer("year_built"),
  lastRenovation: text("last_renovation"),
  propertyManager: text("property_manager"),
  groupId: integer("group_id").references(() => propertyGroups.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(), // 'moisture', 'mould', 'air-quality', 'tenant-report'
  severity: text("severity").notNull(), // 'high', 'medium', 'low'
  location: text("location").notNull(),
  reading: text("reading"),
  detectedAt: timestamp("detected_at").defaultNow(),
  deadline: timestamp("deadline"),
  assignedTo: integer("assigned_to").references(() => users.id),
  status: text("status").notNull(), // 'new', 'assigned', 'in-progress', 'resolved', 'closed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sensors table
export const sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(), // 'moisture', 'temperature', 'air-quality'
  location: text("location").notNull(),
  status: text("status").notNull(), // 'active', 'inactive'
  currentReading: text("current_reading"),
  batteryLevel: integer("battery_level"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Inspections table
export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(), // 'routine', 'follow-up', 'complaint'
  date: timestamp("date").notNull(),
  inspector: integer("inspector").references(() => users.id),
  status: text("status").notNull(), // 'scheduled', 'completed', 'cancelled'
  findings: text("findings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Maintenance records table
export const maintenances = pgTable("maintenances", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'compliance', 'alerts', 'system'
  settings: jsonb("settings").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table for compliance certificates
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'gas_safety', 'electrical', 'epc', 'fire_safety', 'asbestos', 'other'
  fileUrl: text("file_url").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  status: text("status").notNull(), // 'valid', 'expiring_soon', 'expired'
  uploadedBy: integer("uploaded_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work orders table
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Using text instead of integer to support both numeric and string IDs (like "prop-001")
  propertyId: text("property_id").notNull(),
  priority: text("priority").notNull(), // values from WorkOrderPriority
  status: text("status").notNull(), // values from WorkOrderStatus
  source: text("source").notNull(), // values from WorkOrderSource
  sourceId: integer("source_id"), // optional reference to an alert/inspection etc that created this
  assignedTo: integer("assigned_to").references(() => users.id),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  createdBy: integer("created_by").references(() => users.id),
  externalSystemRef: text("external_system_ref"), // reference to external work order system (if any)
  cost: integer("cost"), // cost in pennies/cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work order comments/history
export const workOrderHistory = pgTable("work_order_history", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  comment: text("comment").notNull(),
  statusChange: text("status_change"), // if a status change occurred
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff table for tracking employees and contractors
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  jobTitle: text("job_title").notNull(),
  role: text("role").notNull(), // values from StaffRole
  employerType: text("employer_type").notNull(), // values from EmployerType
  employer: text("employer").notNull(), // Company/organization name
  active: boolean("active").default(true),
  specializations: text("specializations").array(), // Array of specializations/skills
  hourlyRate: integer("hourly_rate"), // Rate in pennies/cents
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id), // Link to user account if they have login access
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
});

export const insertPropertyGroupSchema = createInsertSchema(propertyGroups).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});

export const insertPropertySchema = createInsertSchema(properties).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});

export const insertSensorSchema = createInsertSchema(sensors).omit({ 
  id: true,
  lastUpdated: true 
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({ 
  id: true,
  createdAt: true 
});

export const insertMaintenanceSchema = createInsertSchema(maintenances).omit({ 
  id: true,
  createdAt: true 
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ 
  id: true,
  updatedAt: true 
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});

// Custom date parser for handling both Date objects and strings
const dateParser = z.union([
  z.date(),
  z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid date string format" }
  ).transform(val => new Date(val)),
  z.null(),
]);

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Override the date fields with our custom date parser
  estimatedCompletionDate: dateParser.optional(),
  actualCompletionDate: dateParser.optional(),
});

export const insertWorkOrderHistorySchema = createInsertSchema(workOrderHistory).omit({
  id: true,
  createdAt: true
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Work order costs tracking
export const workOrderCosts = pgTable("work_order_costs", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id).notNull(),
  description: text("description").notNull(),
  costType: text("cost_type").notNull(), // 'labor', 'materials', 'equipment', 'other'
  amount: integer("amount").notNull(), // Amount in pennies/cents
  staffId: integer("staff_id").references(() => staff.id), // Optional link to staff member
  date: timestamp("date").notNull(),
  invoiceNumber: text("invoice_number"),
  attachmentUrl: text("attachment_url"), // URL to receipt/invoice
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkOrderCostSchema = createInsertSchema(workOrderCosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  date: dateParser,
});

// Types for inserting
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPropertyGroup = z.infer<typeof insertPropertyGroupSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertSensor = z.infer<typeof insertSensorSchema>;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type InsertWorkOrderHistory = z.infer<typeof insertWorkOrderHistorySchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertWorkOrderCost = z.infer<typeof insertWorkOrderCostSchema>;

// Types for selecting
export type User = typeof users.$inferSelect;
export type PropertyGroup = typeof propertyGroups.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type Sensor = typeof sensors.$inferSelect;
export type Inspection = typeof inspections.$inferSelect;
export type Maintenance = typeof maintenances.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type WorkOrder = typeof workOrders.$inferSelect;
export type WorkOrderHistory = typeof workOrderHistory.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type WorkOrderCost = typeof workOrderCosts.$inferSelect;
