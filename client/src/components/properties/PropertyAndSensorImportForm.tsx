import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileDown, Check, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PropertySensorTemplate } from './PropertySensorTemplate';

export function PropertyAndSensorImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setUploadSuccess(false);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/octet-stream', // Fallback for some browsers
    ];

    // Check based on file extension if MIME type is not reliable
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExtension = ['xlsx', 'xls', 'csv'].includes(fileExtension || '');
    
    if (!allowedTypes.includes(file.type) && !isAllowedExtension) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Create a new FormData instance
      const formData = new FormData();
      
      // Append the file with the correct field name
      formData.append('file', file, file.name);
      
      // Add a filename as a separate field to ensure it's not lost
      formData.append('filename', file.name);
      
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        formDataSize: formData.getAll('file').length
      });

      const response = await fetch('/api/upload/properties-and-sensors', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with boundary
      });

      let result;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        throw new Error('Server returned an invalid response. Please check file format and try again.');
      }

      if (response.ok) {
        setUploadSuccess(true);
        setUploadResult(result);
        toast({
          title: "Upload successful",
          description: `Processed ${result.results.properties.inserted} properties and ${result.results.sensors.inserted} sensors`,
        });
        
        // Invalidate properties and sensors queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
        queryClient.invalidateQueries({ queryKey: ['/api/sensors'] });
      } else {
        setUploadSuccess(false);
        setUploadError(result.message || 'Upload failed');
        toast({
          title: "Upload failed",
          description: result.message || "There was an error uploading the file",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadSuccess(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Error uploading file. Please try again.';
      setUploadError(errorMessage);
      
      toast({
        title: "Upload error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Template download is now handled by the PropertySensorTemplate component
  const downloadTemplate = () => {
    // This function is no longer used, but kept to avoid refactoring all references
    // The actual template download is handled by PropertySensorTemplate
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Properties with Sensors</CardTitle>
        <CardDescription>
          Upload an Excel file containing property information and their associated sensors.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            uploadSuccess ? 'border-green-400 bg-green-50' : 
            uploadError ? 'border-red-400 bg-red-50' : 
            'border-gray-300 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {uploadSuccess ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Check className="text-green-500 w-12 h-12" />
              </div>
              <h3 className="font-medium text-lg">Upload Successful!</h3>
              <p>
                Imported {uploadResult?.results.properties.inserted} properties and {uploadResult?.results.sensors.inserted} sensors
              </p>
              {(uploadResult?.results.properties.failed > 0 || uploadResult?.results.sensors.failed > 0) && (
                <p className="text-amber-600">
                  Failed: {uploadResult?.results.properties.failed} properties and {uploadResult?.results.sensors.failed} sensors
                </p>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFile(null);
                  setUploadSuccess(false);
                }}
                className="mt-2"
              >
                Upload Another File
              </Button>
            </div>
          ) : uploadError ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                <AlertCircle className="text-red-500 w-12 h-12" />
              </div>
              <h3 className="font-medium text-lg">Upload Failed</h3>
              <p className="text-red-600">{uploadError}</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFile(null);
                  setUploadError(null);
                }}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileDown className="text-blue-500 w-10 h-10" />
              </div>
              <p>Selected file: <span className="font-medium">{file.name}</span></p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB • {file.type}
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFile(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="text-gray-400 w-10 h-10" />
              </div>
              <h3 className="text-lg font-medium">Drag and drop your file here</h3>
              <p className="text-sm text-gray-500">
                or click the button below to browse your files
              </p>
              <div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 relative">
                    Browse Files
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Supported formats: .xlsx, .xls, .csv (max 5MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <PropertySensorTemplate />
        <p className="text-xs text-gray-500">
          Need help? View the <a href="#" className="text-primary hover:underline">Import Guide</a>
        </p>
      </CardFooter>
    </Card>
  );
}