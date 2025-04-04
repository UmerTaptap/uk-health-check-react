import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

/**
 * This component provides a downloadable template for property and sensor import
 */
export function PropertySensorTemplate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSampleData = () => {
    setIsGenerating(true);

    try {
      // Create CSV content with headers and sample rows
      const csvContent = `name,description,address,status,riskLevel,riskReason,propertyType,units,yearBuilt,lastRenovation,propertyManager,sensorLocations,sensorTypes
"Oak House","Modern apartment building with 24 units","42 Oak Avenue, London, SE15 2TY","compliant","none","","apartment building",24,2018,"2023","John Smith","Kitchen,Bathroom,Living Room","temperature,moisture,air-quality"
"Maple Court","Victorian conversion with 6 flats","12 Maple Street, London, N1 5RT","at-risk","medium","Moisture detected in basement","converted house",6,1890,"2019","Jane Wilson","Basement,Hallway,Bedroom 1","moisture,temperature,temperature"
"Cedar Lodge","Semi-detached property","7 Cedar Road, London, E3 4PL","non-compliant","high","Mould found in multiple rooms","semi-detached",1,1965,"2010","Robert Taylor","Bathroom,Kitchen,Bedroom 2,Living Room","moisture,temperature,moisture,air-quality"`;
      
      // Create a blob from the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'property-sensor-template.csv');
      document.body.appendChild(a);
      
      // Click the link to trigger the download
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      
      toast({
        title: "Template downloaded",
        description: "Sample CSV template has been downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: "Error generating template",
        description: "There was an error generating the template file",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={generateSampleData}
      disabled={isGenerating}
    >
      <Download className="w-4 h-4 mr-2" />
      {isGenerating ? "Generating..." : "Download Template"}
    </Button>
  );
}