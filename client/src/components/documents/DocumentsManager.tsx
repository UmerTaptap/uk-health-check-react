import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentsList from './DocumentsList';
import DocumentUploadForm from './DocumentUploadForm';

type DocumentsManagerProps = {
  propertyId: number;
};

export default function DocumentsManager({ propertyId }: DocumentsManagerProps) {
  const [activeTab, setActiveTab] = useState('list');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleUploadSuccess = () => {
    // Switch back to the documents list after successful upload
    setActiveTab('list');
  };
  
  const handleUploadCancel = () => {
    // Switch back to the documents list if user cancels
    setActiveTab('list');
  };
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="list">Documents</TabsTrigger>
        <TabsTrigger value="upload">Upload Document</TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        <DocumentsList 
          propertyId={propertyId} 
          onUpload={() => setActiveTab('upload')} 
        />
      </TabsContent>
      
      <TabsContent value="upload">
        <DocumentUploadForm 
          propertyId={propertyId} 
          onSuccess={handleUploadSuccess} 
          onCancel={handleUploadCancel} 
        />
      </TabsContent>
    </Tabs>
  );
}