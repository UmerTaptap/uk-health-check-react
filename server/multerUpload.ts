import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import xlsx from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';
import {
  Property, InsertProperty, Sensor, InsertSensor
} from '@shared/schema';

// Define types from schema for use in this file
type RiskLevel = 'none' | 'low' | 'medium' | 'high';
type PropertyStatus = 'compliant' | 'non-compliant' | 'pending-review';
type SensorStatus = 'active' | 'inactive' | 'maintenance' | 'error';
type SensorType = 'temperature' | 'moisture' | 'air-quality';

// Configure multer storage
const memoryStorage = multer.memoryStorage();

// Set up file size limits and allowed extensions
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  
  if (allowedExtensions.includes(fileExtension)) {
    return callback(null, true);
  }
  
  callback(new Error('Only CSV and Excel files are allowed'));
};

// Set up the multer upload middleware
export const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: fileFilter
}).single('file');

// Type definitions for property and sensor data from spreadsheets
type PropertyDataRow = {
  name: string;
  description: string;
  address: string;
  status: string;
  riskLevel: string;
  riskReason: string;
  propertyType: string;
  units: number | string;
  yearBuilt: number | string;
  lastRenovation: string;
  propertyManager: string;
  sensorCount?: number | string;
  sensorLocations?: string;
  sensorTypes?: string;
  [key: string]: any; // For other potential fields
};

/**
 * Process Excel file buffer into property data rows
 */
function processExcelFile(buffer: Buffer): PropertyDataRow[] {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Invalid Excel file format');
  }
}

/**
 * Process CSV file buffer into property data rows
 */
async function processCsvFile(buffer: Buffer): Promise<PropertyDataRow[]> {
  return new Promise((resolve, reject) => {
    const results: PropertyDataRow[] = [];
    
    // Create a readable stream from the buffer
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/**
 * Format property data from a spreadsheet row
 */
function formatPropertyData(row: PropertyDataRow): InsertProperty | null {
  try {
    // Validate required fields: name and address must be non-empty strings
    const name = row.name ? String(row.name).trim() : '';
    const address = row.address ? String(row.address).trim() : '';
    
    // Strict validation for name - reject if empty or invalid
    if (!name || name === 'undefined' || name === 'null') {
      console.warn('Skipping property import due to missing or invalid name:', row);
      return null;
    }
    
    // Strict validation for address - reject if empty or invalid
    if (!address || address === 'undefined' || address === 'null') {
      console.warn('Skipping property import due to missing or invalid address:', row);
      return null;
    }
    
    // Convert status string to enum with safer defaults
    let status: PropertyStatus = 'compliant';
    if (row.status) {
      const statusLower = row.status.toString().toLowerCase().trim();
      if (statusLower === 'non-compliant' || statusLower === 'noncompliant') {
        status = 'non-compliant';
      } else if (statusLower === 'pending review' || statusLower === 'pending') {
        status = 'pending-review';
      }
    }

    // Convert risk level string to enum with safer defaults
    let riskLevel: RiskLevel = 'none';
    if (row.riskLevel) {
      const riskLower = row.riskLevel.toString().toLowerCase().trim();
      if (riskLower === 'high') {
        riskLevel = 'high';
      } else if (riskLower === 'medium') {
        riskLevel = 'medium';
      } else if (riskLower === 'low') {
        riskLevel = 'low';
      }
    }

    // Set a default risk reason if high or medium risk without reason
    let riskReason = row.riskReason || '';
    if ((riskLevel === 'high' || riskLevel === 'medium') && !riskReason) {
      riskReason = riskLevel === 'high' ? 'High risk property' : 'Medium risk property';
    }

    // Safe conversion of numeric values with fallbacks
    const units = row.units ? (isNaN(Number(row.units)) ? 1 : Number(row.units)) : 1;
    const yearBuilt = row.yearBuilt ? (isNaN(Number(row.yearBuilt)) ? null : Number(row.yearBuilt)) : null;
    
    // Format property data for insertion with validated fields
    const property: InsertProperty = {
      name: name,
      description: row.description ? String(row.description).trim() : '',
      address: address,
      status: status,
      riskLevel: riskLevel,
      riskReason: riskReason,
      propertyType: row.propertyType ? String(row.propertyType).trim() : null,
      units: units,
      yearBuilt: yearBuilt,
      lastRenovation: row.lastRenovation ? String(row.lastRenovation).trim() : null,
      propertyManager: row.propertyManager ? String(row.propertyManager).trim() : null,
      groupId: null
    };

    return property;
  } catch (error) {
    console.error('Error formatting property data:', error);
    return null;
  }
}

/**
 * Create sensors from property row data
 */
function createSensorsFromRow(row: PropertyDataRow, propertyId: number): InsertSensor[] {
  const sensors: InsertSensor[] = [];
  
  // Skip if no sensor types data
  if (!row.sensorTypes) {
    return sensors;
  }
  
  try {
    // Get number of units for this property
    const units = Number(row.units) || 1; // Default to 1 unit if not specified
    
    // Parse sensor types
    // Format expected: "type1, type2, type3"
    const types = row.sensorTypes.split(',').map(type => type.trim()).filter(Boolean);
    if (types.length === 0) {
      return sensors;
    }
    
    // Parse sensor locations if available
    // Format expected: "location1, location2, location3"
    let locations: string[] = [];
    if (row.sensorLocations) {
      locations = row.sensorLocations.split(',').map(loc => loc.trim()).filter(Boolean);
    } else {
      // Default locations based on sensor types if not provided
      locations = types.map(type => {
        if (type.toLowerCase().includes('temp')) return 'Living Room';
        if (type.toLowerCase().includes('humid') || type.toLowerCase().includes('moist')) return 'Bathroom';
        if (type.toLowerCase().includes('air')) return 'Hallway';
        return 'Main Room';
      });
    }
    
    // Ensure we have at least one location
    if (locations.length === 0) {
      locations = ['Main Room'];
    }
    
    // For each unit, create the specified sensors
    for (let unit = 0; unit < units; unit++) {
      const unitLabel = units > 1 ? ` (Unit ${unit + 1})` : '';
      
      for (let i = 0; i < types.length; i++) {
        const typeStr = types[i].toLowerCase();
        let sensorType: SensorType = 'temperature'; // Default
        
        // Map input types to schema types
        if (typeStr.includes('humid') || typeStr.includes('moist')) {
          sensorType = 'moisture';
        } else if (typeStr.includes('air') || typeStr.includes('quality')) {
          sensorType = 'air-quality';
        } else if (typeStr.includes('temp')) {
          sensorType = 'temperature';
        }
        
        // Get corresponding location or use default
        const locationIndex = i < locations.length ? i : i % locations.length;
        const location = locations[locationIndex] + unitLabel;
        
        // Create the sensor
        sensors.push({
          propertyId,
          location,
          type: sensorType,
          status: 'active' as SensorStatus,
          currentReading: sensorType === 'temperature' ? '21.5' : 
                          sensorType === 'moisture' ? '45.0' : '650',
          batteryLevel: 100
        });
      }
    }
    
    console.log(`Created ${sensors.length} sensors for property ID ${propertyId} with ${units} units`);
  } catch (error) {
    console.error('Error creating sensors from row:', error);
  }
  
  return sensors;
}

/**
 * Clear all existing properties and their related sensors
 */
async function clearExistingPropertyData(): Promise<{
  propertiesDeleted: number,
  sensorsDeleted: number,
  errors: string[]
}> {
  const result = {
    propertiesDeleted: 0,
    sensorsDeleted: 0,
    errors: [] as string[]
  };
  
  try {
    // Get all existing properties
    const properties = await storage.getProperties();
    console.log(`Found ${properties.length} properties to delete`);
    
    // Delete all sensors for each property
    for (const property of properties) {
      try {
        const sensors = await storage.getSensorsByProperty(property.id);
        console.log(`Deleting ${sensors.length} sensors for property ${property.name} (ID: ${property.id})`);
        
        for (const sensor of sensors) {
          try {
            await storage.deleteSensor(sensor.id);
            result.sensorsDeleted++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`Failed to delete sensor ${sensor.id}: ${errorMessage}`);
          }
        }
        
        // Delete the property
        await storage.deleteProperty(property.id);
        result.propertiesDeleted++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to delete property ${property.id}: ${errorMessage}`);
      }
    }
    
    console.log(`Deleted ${result.propertiesDeleted} properties and ${result.sensorsDeleted} sensors`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Error clearing property data: ${errorMessage}`);
    return result;
  }
}

/**
 * Handle property and sensor file upload
 */
export async function handlePropertyUpload(req: Request, res: Response) {
  try {
    // Multer has already placed the file buffer in req.file
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded or file buffer is empty'
      });
    }
    
    // Log file details for debugging
    console.log('File received:', {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    const buffer = req.file.buffer;
    console.log('Buffer size:', buffer.length);
    
    let data: PropertyDataRow[] = [];
    
    // Process based on file type
    const fileName = req.file.originalname.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      data = processExcelFile(buffer);
    } else if (fileName.endsWith('.csv')) {
      data = await processCsvFile(buffer);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Please upload CSV or Excel file'
      });
    }
    
    if (!data.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the file'
      });
    }
    
    // Clear existing properties and sensors first if requested
    const shouldClearExisting = req.body.clearExisting === 'true' || req.body.clearExisting === true;
    let clearingResults = {
      propertiesDeleted: 0,
      sensorsDeleted: 0,
      errors: [] as string[]
    };
    
    if (shouldClearExisting) {
      console.log('Clearing existing property and sensor data before import');
      clearingResults = await clearExistingPropertyData();
    }
    
    // Process properties and sensors
    const results = {
      properties: {
        total: data.length,
        inserted: 0,
        failed: 0,
        errors: [] as { row: number; message: string }[]
      },
      sensors: {
        total: 0,
        inserted: 0,
        failed: 0,
        errors: [] as { property: string; message: string }[]
      },
      cleared: shouldClearExisting ? {
        properties: clearingResults.propertiesDeleted,
        sensors: clearingResults.sensorsDeleted,
        errors: clearingResults.errors
      } : null
    };
    
    // Insert each property and its sensors
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Format property data
        const propertyData = formatPropertyData(row);
        if (!propertyData) {
          results.properties.failed++;
          results.properties.errors.push({
            row: i + 2, // +2 to account for header row and 0-indexing
            message: 'Invalid property data'
          });
          continue;
        }
        
        // Insert property
        const insertedProperty = await storage.createProperty(propertyData);
        results.properties.inserted++;
        
        // Create and insert sensors if sensorTypes is provided
        if (row.sensorTypes) {
          const sensors = createSensorsFromRow(row, insertedProperty.id);
          results.sensors.total += sensors.length;
          
          for (const sensor of sensors) {
            try {
              await storage.createSensor(sensor);
              results.sensors.inserted++;
            } catch (error) {
              results.sensors.failed++;
              results.sensors.errors.push({
                property: insertedProperty.name,
                message: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
        }
      } catch (error) {
        results.properties.failed++;
        results.properties.errors.push({
          row: i + 2,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const clearMsg = shouldClearExisting 
      ? `Cleared ${clearingResults.propertiesDeleted} properties and ${clearingResults.sensorsDeleted} sensors. `
      : '';
      
    return res.status(200).json({
      success: true,
      message: `${clearMsg}Processed ${data.length} properties and ${results.sensors.total} sensors`,
      results
    });
    
  } catch (error) {
    console.error('Error handling property upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing file upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Error handling middleware for multer
 */
export function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // A custom error occurred
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // No error occurred, continue
  next();
}