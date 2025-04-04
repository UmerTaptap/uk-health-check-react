import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import * as fs from 'fs';
import { storage } from './storage';
import { InsertProperty, InsertSensor } from '@shared/schema';
import { UploadedFile } from 'express-fileupload';

// Type for spreadsheet data row with property and sensor data
type PropertyWithSensorRow = {
  // Property fields
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
  // Sensor fields
  sensorCount: number | string;
  sensorLocations: string;
  sensorTypes: string;
  // Other fields that might be in the spreadsheet
  [key: string]: any;
};

// Process Excel file with property and sensor data
function processExcelFile(buffer: Buffer): PropertyWithSensorRow[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const data = XLSX.utils.sheet_to_json<PropertyWithSensorRow>(worksheet, { 
      raw: false,
      defval: '',
    });
    
    return data;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return [];
  }
}

// Process CSV file with property and sensor data
async function processCsvFile(buffer: Buffer): Promise<PropertyWithSensorRow[]> {
  return new Promise((resolve) => {
    const results: PropertyWithSensorRow[] = [];
    
    // Create a readable stream from buffer
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error processing CSV file:', error);
        resolve([]);
      });
  });
}

// Validate and format property data from the spreadsheet
function formatPropertyData(row: PropertyWithSensorRow): InsertProperty | null {
  try {
    // Validate and clean required fields: name and address must be non-empty strings
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

    // Normalize status with safer defaults
    let status: 'compliant' | 'non-compliant' | 'pending-review' = 'compliant';
    if (row.status) {
      const statusLower = row.status.toString().toLowerCase().trim();
      if (statusLower === 'non-compliant' || statusLower === 'noncompliant') {
        status = 'non-compliant';
      } else if (statusLower === 'pending-review' || statusLower === 'pending review' || statusLower === 'pending') {
        status = 'pending-review';
      }
    }

    // Normalize risk level with safer defaults
    let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
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

// Create sensor objects from spreadsheet data
function createSensorsFromRow(row: PropertyWithSensorRow, propertyId: number): InsertSensor[] {
  const sensors: InsertSensor[] = [];
  
  // Skip if no sensor data
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
        let sensorType: 'temperature' | 'moisture' | 'air-quality' = 'temperature'; // Default
        
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
          status: 'active',
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

// Handle property and sensor upload from Excel/CSV
export async function handlePropertyAndSensorUpload(req: Request, res: Response) {
  try {
    // Check if files exist in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file was uploaded' 
      });
    }

    // Log for debugging
    console.log('Files received:', Object.keys(req.files));
    console.log('Request body:', req.body);
    
    // Handle different ways the file might be attached in the form
    let uploadedFile: UploadedFile;
    
    if (req.files.file) {
      // Standard way: file field is named "file"
      uploadedFile = Array.isArray(req.files.file) 
        ? req.files.file[0] 
        : req.files.file;
    } else {
      // Try to get the first file from any field
      const firstFileKey = Object.keys(req.files)[0];
      if (firstFileKey) {
        const firstFile = req.files[firstFileKey];
        uploadedFile = Array.isArray(firstFile) ? firstFile[0] : firstFile;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Missing file upload'
        });
      }
    }
    
    // Validate file
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file upload'
      });
    }
    
    // Log file details for debugging
    console.log('File received:', {
      name: uploadedFile.name,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      md5: uploadedFile.md5 || 'none',
      // Add filename from form if present
      customFilename: req.body.filename || 'none'
    });

    // Get file data from buffer (we're using memory buffers now)
    let buffer: Buffer;
    if (uploadedFile.data) {
      buffer = uploadedFile.data;
      console.log('Using file data from memory buffer, size:', buffer.length);
    } else {
      return res.status(400).json({
        success: false,
        message: 'No file data available in upload'
      });
    }
    
    let data: PropertyWithSensorRow[] = [];

    // Determine file type from name or use provided filename as fallback
    const fileName = uploadedFile.name || req.body.filename || '';
    
    // Process based on file type
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
      }
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

        // Create and insert sensors
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
      } catch (error) {
        results.properties.failed++;
        results.properties.errors.push({ 
          row: i + 2,
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${data.length} properties and ${results.sensors.total} sensors`,
      results
    });
  } catch (error) {
    console.error('Error handling property and sensor upload:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing file upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}