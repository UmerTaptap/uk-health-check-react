import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { Property, PropertyStatus, RiskLevel } from '@/lib/types';
import { storage } from './storage';
import { InsertProperty } from '@shared/schema';
import { UploadedFile } from 'express-fileupload';

// Type for spreadsheet data row
type PropertySpreadsheetRow = {
  name: string;
  description: string;
  address: string;
  status: string;
  riskLevel: string;
  riskReason: string;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  lastInspectionDate: string;
  lastInspectionDaysAgo: number;
  sensors: number;
  propertyType?: string;
  units?: number;
  yearBuilt?: number;
  lastRenovation?: string;
  propertyManager?: string;
  [key: string]: any; // For other potential fields
};

// Validate and format a property from spreadsheet data
function formatPropertyData(row: PropertySpreadsheetRow): InsertProperty | null {
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
      const statusLower = String(row.status).toLowerCase().trim();
      if (statusLower === 'non-compliant' || statusLower === 'noncompliant') {
        status = 'non-compliant';
      } else if (statusLower === 'pending-review' || statusLower === 'pending review' || statusLower === 'pending') {
        status = 'pending-review';
      }
    }

    // Normalize risk level with safer defaults
    let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    if (row.riskLevel) {
      const riskLower = String(row.riskLevel).toLowerCase().trim();
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
    const units = row.units !== undefined ? (isNaN(Number(row.units)) ? 1 : Number(row.units)) : 1;
    const yearBuilt = row.yearBuilt !== undefined ? (isNaN(Number(row.yearBuilt)) ? null : Number(row.yearBuilt)) : null;
    
    // Create the property object according to the InsertProperty schema
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
    
    // Store additional data in the row for processing alerts, inspection data, etc.
    // These will be handled separately since they're not part of InsertProperty
    row._processedAlerts = {
      high: Number(row.highAlerts) || 0,
      medium: Number(row.mediumAlerts) || 0,
      low: Number(row.lowAlerts) || 0
    };
    
    row._processedInspection = {
      date: row.lastInspectionDate || new Date().toISOString().split('T')[0],
      daysAgo: Number(row.lastInspectionDaysAgo) || 0
    };
    
    row._sensorCount = Number(row.sensors) || 0;

    return property;
  } catch (error) {
    console.error('Error formatting property data:', error);
    return null;
  }
}

// Process Excel file
function processExcelFile(buffer: Buffer): PropertySpreadsheetRow[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const data = XLSX.utils.sheet_to_json<PropertySpreadsheetRow>(worksheet, { 
      raw: false,
      defval: '',
    });
    
    return data;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return [];
  }
}

// Process CSV file
async function processCsvFile(buffer: Buffer): Promise<PropertySpreadsheetRow[]> {
  return new Promise((resolve) => {
    const results: PropertySpreadsheetRow[] = [];
    
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

// Handle file upload for properties
export async function handlePropertyUpload(req: Request, res: Response) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file was uploaded' 
      });
    }

    const file = req.files.file as UploadedFile;
    const buffer = file.data;
    let data: PropertySpreadsheetRow[] = [];

    // Process based on file type
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      data = processExcelFile(buffer);
    } else if (file.name.endsWith('.csv')) {
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

    // Process data
    const propertiesFormatted: InsertProperty[] = [];
    const errors: { row: number; message: string }[] = [];

    data.forEach((row, index) => {
      const property = formatPropertyData(row);
      if (property) {
        propertiesFormatted.push(property);
      } else {
        errors.push({ row: index + 2, message: 'Invalid property data' });
      }
    });

    // Insert properties (in a real app with DB, we'd do this in a transaction)
    const insertedProperties: any[] = []; // Using any here as the storage method handles the type conversion
    const insertErrors: { property: InsertProperty; message: string }[] = [];

    for (const property of propertiesFormatted) {
      try {
        const inserted = await storage.createProperty(property);
        insertedProperties.push(inserted);
      } catch (error) {
        insertErrors.push({ 
          property, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${data.length} properties from file`,
      results: {
        total: data.length,
        inserted: insertedProperties.length,
        failed: errors.length + insertErrors.length,
        validationErrors: errors,
        insertErrors
      }
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing file upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}