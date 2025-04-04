import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadResults {
  success: boolean;
  message: string;
  results?: {
    properties: {
      total: number;
      inserted: number;
      failed: number;
      errors: { row: number; message: string }[];
    };
    sensors: {
      total: number;
      inserted: number;
      failed: number;
      errors: { property: string; message: string }[];
    };
    cleared?: {
      properties: number;
      sensors: number;
      errors: string[];
    };
  };
}

const PropertyUploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<UploadResults | null>(null);
  const [clearExistingData, setClearExistingData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload/properties', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    },
    onSuccess: (data: UploadResults) => {
      setResults(data);
      setUploadStatus(data.success ? 'success' : 'error');
      
      if (data.success) {
        // Invalidate properties query to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      }
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setResults({
        success: false,
        message: 'Failed to upload file. Please try again.',
      });
    }
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setResults(null);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadStatus('idle');
      setResults(null);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    setUploadStatus('loading');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clearExisting', clearExistingData.toString());
    
    // Add confirmation for clearing data
    if (clearExistingData) {
      if (!window.confirm(
        'Warning: This will delete ALL existing properties and sensors. This action cannot be undone. Are you sure you want to continue?'
      )) {
        setUploadStatus('idle');
        return;
      }
    }
    
    uploadMutation.mutate(formData);
  };

  // Handle modal close
  const handleClose = () => {
    // Reset state when closing
    if (uploadStatus !== 'loading') {
      setFile(null);
      setUploadStatus('idle');
      setResults(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div 
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">Import Properties &amp; Sensors</h2>
          <button 
            onClick={handleClose}
            disabled={uploadStatus === 'loading'}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {uploadStatus === 'idle' || uploadStatus === 'loading' ? (
            <form onSubmit={handleSubmit}>
              {/* File input area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm font-medium">
                  {file ? (
                    <span className="text-primary">{file.name}</span>
                  ) : (
                    <span>Drag and drop your file here, or <button type="button" className="text-primary hover:underline" onClick={() => fileInputRef.current?.click()}>browse</button></span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Supports CSV, XLS, and XLSX files up to 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
              </div>
              
              {/* Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">File Requirements</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>First row must contain column headers</li>
                  <li>Required property columns: 'name', 'address', 'status', 'riskLevel'</li>
                  <li>Status values: 'compliant', 'at-risk', 'non-compliant'</li>
                  <li>Risk level values: 'high', 'medium', 'low', 'none'</li>
                </ul>
                <h3 className="font-medium mt-3 mb-2">Optional Sensor Data</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Add 'sensorCount', 'sensorLocations', and 'sensorTypes' columns</li>
                  <li>Sensor locations: Comma-separated list of locations (e.g., 'Living Room, Kitchen, Bathroom')</li>
                  <li>Sensor types: Comma-separated list of types ('temperature', 'humidity', 'air-quality')</li>
                </ul>
                <div className="mt-3">
                  <a href="/api/template/property-sensor" download="property-sensor-template.xlsx" className="text-primary hover:underline text-xs flex items-center">
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                    Download template file
                  </a>
                </div>
                
                {/* Add checkbox for clearing existing data */}
                <div className="mt-4 pt-3 border-t">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={clearExistingData}
                      onChange={(e) => setClearExistingData(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm font-medium text-red-600">
                      Replace all existing data (this will delete all current properties and sensors)
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploadStatus === 'loading'}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || uploadStatus === 'loading'}
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                    !file || uploadStatus === 'loading' 
                      ? 'bg-primary/50 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {uploadStatus === 'loading' ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              {uploadStatus === 'success' ? (
                <div>
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">Upload Successful</h3>
                  <p className="mb-4 text-gray-600">{results?.message}</p>
                  
                  {results?.results && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                      {results.results.cleared && (
                        <div className="mb-4 pb-3 border-b">
                          <h4 className="font-medium text-sm mb-3">Cleared Data</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-xs font-medium text-gray-500">Properties Deleted</p>
                              <p className="text-lg font-semibold text-red-600">{results.results.cleared.properties}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-medium text-gray-500">Sensors Deleted</p>
                              <p className="text-lg font-semibold text-red-600">{results.results.cleared.sensors}</p>
                            </div>
                          </div>
                          {results.results.cleared.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-red-600">Deletion Errors:</p>
                              <div className="max-h-20 overflow-y-auto text-xs">
                                {results.results.cleared.errors.map((error, i) => (
                                  <p key={`clear-${i}`} className="text-red-500 text-xs">
                                    {error}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    
                      <h4 className="font-medium text-sm mb-3">Properties</h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500">Total</p>
                          <p className="text-lg font-semibold">{results.results.properties.total}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-green-500">Imported</p>
                          <p className="text-lg font-semibold text-green-600">{results.results.properties.inserted}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-red-500">Failed</p>
                          <p className="text-lg font-semibold text-red-600">{results.results.properties.failed}</p>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-3 border-t pt-3">Sensors</h4>
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500">Total</p>
                          <p className="text-lg font-semibold">{results.results.sensors.total}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-green-500">Imported</p>
                          <p className="text-lg font-semibold text-green-600">{results.results.sensors.inserted}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-red-500">Failed</p>
                          <p className="text-lg font-semibold text-red-600">{results.results.sensors.failed}</p>
                        </div>
                      </div>
                      
                      {(results.results.properties.failed > 0 || results.results.sensors.failed > 0) && (
                        <div className="mt-4 border-t pt-3">
                          <p className="font-medium text-sm mb-2">Error details:</p>
                          <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                            {results.results.properties.errors.map((error, i) => (
                              <p key={`prop-${i}`} className="text-red-600">
                                Row {error.row}: {error.message}
                              </p>
                            ))}
                            {results.results.sensors.errors.map((error, i) => (
                              <p key={`sens-${i}`} className="text-amber-600">
                                Sensor for {error.property}: {error.message}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-red-800 mb-2">Upload Failed</h3>
                  <p className="mb-4 text-gray-600">{results?.message}</p>
                  
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setUploadStatus('idle');
                        setResults(null);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyUploadModal;