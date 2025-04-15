import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PlusCircle, Download, FileText, AlertTriangle, ClipboardList, Search } from 'lucide-react';
import { PropertyTransition } from '@/components/transitions/PropertyTransition';
import { SharedLayoutTransition } from '@/components/transitions/SharedLayoutTransition';
import { ContentTransition } from '@/components/transitions/ContentTransition';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';
import { Property, PropertyDetail as PropertyDetailType } from '@/lib/types';
import DocumentList from '@/components/documents/DocumentList';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import SensorList from '@/components/sensors/SensorList';
import PropertyGroupInfo from '@/components/property-groups/PropertyGroupInfo';
import { DetailPageSkeleton } from '@/components/skeletons';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';


const getColorForComparison = (
  localValue: number, 
  englandValue: number, 
  isHigherBetter: boolean
): string => {
  if (localValue > englandValue) {
    return isHigherBetter ? '#10B981' : '#EF4444'; // Green if better, red if worse
  } else if (localValue < englandValue) {
    return isHigherBetter ? '#EF4444' : '#10B981'; // Red if worse, green if better
  }
  return '#6B7280'; // Gray if equal
};


type Area = {
  Code: string;
  Name: string;
  Short: string;
  AreaTypeId: number;
};

type Indicator = {
  IID: number;
  IndicatorName: string;
  AreaValue: string;
  EnglandValue: string;
  TimePeriod: string;
  Definition: string;
  Unit: string;
  Polarity: string;
  Significance: string;
  Count?: string;
  WorstValue?: string;
  BestValue?: string;
  Range?: string;
  AgeGroup?: string;
};

const POLARITY_MAP: Record<number, {worst: 'min' | 'max', best: 'min' | 'max'}> = {
  1: { worst: 'min', best: 'max' },
  2: { worst: 'max', best: 'min' },
  3: { worst: 'min', best: 'max' }
};



const DottedLoadingText = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="animate-pulse">Loading</span>
      <span className="w-4 inline-block text-left">{dots}</span>
    </span>
  );
};

// Let's create a simple tabs component for now - we can expand this later
const PropertyOverview = ({ property }: { property: Property }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-medium mb-4">Property Overview</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Property Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Type</div>
            <div className="text-sm font-medium">Residential</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Units</div>
            <div className="text-sm font-medium">35</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Year Built</div>
            <div className="text-sm font-medium">2005</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Renovation</div>
            <div className="text-sm font-medium">2018</div>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Risk Information</h4>
        <div className="p-4 rounded-md" style={{ 
          backgroundColor: property.riskLevel === 'high' ? 'rgba(163, 67, 15, 0.1)' : 
                           property.riskLevel === 'medium' ? 'rgba(237, 176, 21, 0.1)' :
                           'rgba(10, 145, 85, 0.1)' 
        }}>
          <div className="text-sm font-medium mb-1" style={{
            color: property.riskLevel === 'high' ? 'var(--brand-rust)' : 
                  property.riskLevel === 'medium' ? 'var(--brand-gold)' :
                  'var(--brand-green)'
          }}>
            {property.riskLevel === 'high' ? 'High Risk' : 
             property.riskLevel === 'medium' ? 'Medium Risk' : 
             property.riskLevel === 'low' ? 'Low Risk' : 'No Risk'}
          </div>
          <div className="text-sm">{property.riskReason}</div>
        </div>
      </div>
    </div>
  </div>
);

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [healthDataLoading, setHealthDataLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const { toast } = useToast();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['/api/properties', id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error('Failed to fetch property');
      return response.json();
    }
  });

  // Extract city from address when property loads
  useEffect(() => {
    if (property?.address) {
      const city = extractCityFromAddress(property.address);
      if (city) {
        searchAndSelectArea(city);
      }
    }
  }, [property]);

  const extractCityFromAddress = (address: string): string | null => {
    // Regex to extract the city from addresses like "8 Birch Road, Manchester, M1 3LP, 7 Oak Lane, Manchester, M14 5RT"
    const match = address.match(/,\s*([^,]+)(?=\s*,\s*[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}$)/);
    const city = match ? match[1].trim() : null;
    
    console.log(`Cityyyyy: ${city}`); // Log the extracted city for validation
    return city;
  };



  const searchAndSelectArea = async (city: string) => {
    setHealthDataLoading(true);
    try {
      const response = await fetch(`/api/proxy/area-search?searchText=${encodeURIComponent(city)}`);
      if (!response.ok) throw new Error("Failed to fetch areas");
      const areas: Area[] = await response.json();
      
      const exactMatch = areas.find(area => 
        area.Name.toLowerCase() === city.toLowerCase() || 
        area.Short.toLowerCase() === city.toLowerCase()
      );
      
      if (exactMatch) {
        await fetchIndicatorData(exactMatch); // Wait for data to load
        setSelectedArea(exactMatch);
      } else if (areas.length > 0) {
        await fetchIndicatorData(areas[0]); // Wait for data to load
        setSelectedArea(areas[0]);
      } else {
        setHealthDataLoading(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Couldn't fetch health data for this area",
        variant: "destructive",
      });
      setHealthDataLoading(false);
    }
  };
  
  const fetchIndicatorData = async (area: Area) => {
    try {
      const [rawData, metadata, stats] = await Promise.all([
        fetch(`/api/proxy/latest-data?areaCode=${area.Code}&profileId=143`).then(res => res.json()),
        fetch(`/api/proxy/indicator-metadata?groupId=1938133185`).then(res => res.json()),
        fetch(`/api/proxy/indicator-statistics?profileId=143&areaCode=E92000001`).then(res => res.json())
      ]);
  
      const transformedData = transformIndicatorData(rawData, metadata, stats);
      const uniqueIndicators = transformedData.filter(
        (indicator, index, self) => 
          index === self.findIndex((i) => i.IID === indicator.IID)
      );
      
      setIndicators(uniqueIndicators);
    } catch (err) {
      toast({
        title: "Error",
        description: "Couldn't fetch health indicators",
        variant: "destructive",
      });
      setIndicators([]);
    } finally {
      setHealthDataLoading(false);
    }
  };


  const transformIndicatorData = (rawData: any[], metadata: any, stats: any): Indicator[] => {
    return rawData.map(item => {
      const indicatorMeta = metadata[item.IID.toString()];
      if (!indicatorMeta) return null;

      const polarity = indicatorMeta.Descriptive?.PolarityId || item.PolarityId || 1;
      const polarityConfig = POLARITY_MAP[polarity] || POLARITY_MAP[1];

      const indicatorStats = Object.values(stats).find((stat: any) => stat.IID === item.IID) as any;
      
      const localValue = parseFloat(item.Data?.[0]?.Val);
      const englandValue = parseFloat(item.Grouping?.[0]?.ComparatorData?.Val);
      
      let worstValue, bestValue;
      if (indicatorStats?.Stats) {
        worstValue = polarityConfig.worst === 'max' 
          ? indicatorStats.Stats.Max 
          : indicatorStats.Stats.Min;
        bestValue = polarityConfig.best === 'max' 
          ? indicatorStats.Stats.Max 
          : indicatorStats.Stats.Min;
      }

      const cleanName = cleanIndicatorName(indicatorMeta.Descriptive.Name);
      const ageGroup = extractAgeGroup(indicatorMeta.Descriptive.Name);

      const significance = localValue > englandValue 
        ? (polarity === 1 ? "Better than England" : "Worse than England")
        : localValue < englandValue 
          ? (polarity === 1 ? "Worse than England" : "Better than England")
          : "Similar to England";

      return {
        IID: item.IID,
        IndicatorName: cleanName,
        AreaValue: formatValue(localValue, indicatorMeta.Unit.Label),
        EnglandValue: formatValue(englandValue, indicatorMeta.Unit.Label),
        TimePeriod: item.Period || "Latest",
        Definition: indicatorMeta.Descriptive.Definition,
        Unit: indicatorMeta.Unit.Label,
        Polarity: getPolarityLabel(polarity),
        Significance: significance,
        WorstValue: formatValue(worstValue, indicatorMeta.Unit.Label),
        BestValue: formatValue(bestValue, indicatorMeta.Unit.Label),
        Range: indicatorStats?.Stats ? 
          `${formatValue(indicatorStats.Stats.Min, indicatorMeta.Unit.Label)} - ${formatValue(indicatorStats.Stats.Max, indicatorMeta.Unit.Label)}` : "N/A",
        AgeGroup: ageGroup
      };
    }).filter(Boolean) as Indicator[];
  };

  const formatValue = (value: number, unit: string): string => {
    if (value === undefined || value === null) return "N/A";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (unit === "%") return `${numValue.toFixed(1)}%`;
    if (unit === "per 1,000") return `${numValue.toFixed(1)} per 1,000`;
    return numValue.toString();
  };

  const cleanIndicatorName = (name: string): string => {
    return name
      .replace(/\s*\(\d+[\s-]+\d+\s+yrs\)/i, "")
      .replace(/\s*\([^)]*\)/g, "");
  };
  
  const extractAgeGroup = (name: string): string => {
    const ageMatch = name.match(/\((\d+[\s-]+\d+\s+yrs)\)/i);
    return ageMatch ? ageMatch[1] : "";
  };

  const getPolarityLabel = (polarityId: number): string => {
    switch(polarityId) {
      case 1: return "Higher values are better";
      case 2: return "Lower values are better";
      case 3: return "No clear better/worse";
      default: return "Higher values are better";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'non-compliant':
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-high-risk">Non-Compliant</span>;
      case 'at-risk':
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-at-risk">At Risk</span>;
      case 'compliant':
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-compliant">Compliant</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !property) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-high-risk text-xl">Error loading property details</div>
        <p className="mt-2">The property you're looking for could not be found or there was an error loading it.</p>
        <Link href="/properties" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600">
          Return to Properties
        </Link>
      </div>
    );
  }

  return (
    <PropertyTransition propertyId={id}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/properties" className="text-primary flex items-center gap-1 mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Properties
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                  {property.name}
                  {getStatusBadge(property.status)}
                </h1>
                <p className="text-gray-500">
                  {property.address}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-5 w-5 mr-2" />
                  Export Report
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
                        style={{ backgroundColor: 'var(--brand-green)' }}>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Schedule Inspection
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap gap-3">
            <Link 
              to={`/alerts?propertyId=${id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-amber-600 transition-colors shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Alerts
            </Link>
            <Link 
              to={`/work-orders?propertyId=${id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Work Orders
            </Link>
            <Link 
              to={`/work-orders?create=true&propertyId=${id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Work Order
            </Link>
          </div>
          






          {/* Health Data Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Local Health Indicators</h2>
                      {healthDataLoading ? (
                        <span className="text-sm text-gray-500">
                          <DottedLoadingText />
                        </span>
                      ) : selectedArea ? (
                        <span className="text-sm text-gray-500">
                          {selectedArea.Name}
                        </span>
                      ) : null}
                    </div>
                    
                    {healthDataLoading ? (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
                        <DottedLoadingText />
                        <p className="text-sm">Gathering health data for this area</p>
                      </div>
                    ) : indicators.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Local Value</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">England</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comparison</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {indicators.map((indicator) => {
                              // Calculate position for the indicator (simple example - you might want more sophisticated logic)
                              const localValue = parseFloat(indicator.AreaValue.replace(/[^\d.-]/g, ''));
                              const englandValue = parseFloat(indicator.EnglandValue.replace(/[^\d.-]/g, ''));
                              const worstValue = parseFloat(indicator.WorstValue?.replace(/[^\d.-]/g, '') || '0');
                              const bestValue = parseFloat(indicator.BestValue?.replace(/[^\d.-]/g, '') || '100');
                              
                              // Calculate position between worst and best (0-100%)
                              const range = bestValue - worstValue;
                              const localPosition = range !== 0 ? ((localValue - worstValue) / range) * 100 : 50;
                              const englandPosition = range !== 0 ? ((englandValue - worstValue) / range) * 100 : 50;
                              
                              return (
                                <tr key={indicator.IID} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 whitespace-normal max-w-xs">
                                    <div className="font-medium text-gray-900">{indicator.IndicatorName}</div>
                                    {indicator.AgeGroup && (
                                      <div className="text-xs text-gray-500 mt-1">{indicator.AgeGroup}</div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                                    {indicator.TimePeriod}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`font-medium ${
                                      indicator.Significance === "Worse than England" ? "text-red-600" :
                                      indicator.Significance === "Better than England" ? "text-emerald-600" : "text-gray-700"
                                    }`}>
                                      {indicator.AreaValue} <span className="text-xs text-gray-400">{indicator.Unit}</span>
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                                    {indicator.EnglandValue} <span className="text-xs text-gray-400">{indicator.Unit}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                                    <div className="flex flex-col">
                                      <span className="text-xs text-red-500">Worst: {indicator.WorstValue}</span>
                                      <span className="text-xs text-emerald-500">Best: {indicator.BestValue}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      indicator.Significance === "Worse than England" ? "bg-red-100 text-red-800" :
                                      indicator.Significance === "Better than England" ? "bg-emerald-100 text-emerald-800" :
                                      "bg-gray-100 text-gray-800"
                                    }`}>
                                      {indicator.Significance}
                                    </span>
                                  </td>




                                  <td className="px-4 py-3">
                                    <div className="mt-2">
                                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Low</span>
                                        <span>High</span>
                                      </div>
                                      <div className="relative h-4 w-full rounded-full overflow-hidden bg-gray-100">
                                        <div 
                                          className="absolute inset-0"
                                          style={{
                                            background: `linear-gradient(90deg, 
                                              rgba(16, 185, 129, 0.7) 0%, 
                                              rgba(245, 158, 11, 0.7) 50%, 
                                              rgba(239, 68, 68, 0.7) 100%)`
                                          }}
                                        />
                                        {/* England Marker */}
                                        <div 
                                          className="absolute top-0 h-4 w-1 bg-blue-500 rounded-full z-10"
                                          style={{
                                            left: `${englandPosition}%`,
                                            transform: 'translateX(-50%)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                          }}
                                        >
                                          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium">
                                            England
                                          </div>
                                        </div>
                                        
                                        {/* Local Marker */}
                                        <div 
                                          className="absolute top-0 h-4 w-1.5 bg-gray-900 rounded-full z-20"
                                          style={{
                                            left: `${localPosition}%`,
                                            transform: 'translateX(-50%)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                          }}
                                        >
                                          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-900 font-medium">
                                            Local
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Value Labels */}
                                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span className="text-blue-600">England: {indicator.EnglandValue}</span>
                                        <span className="text-gray-900">Local: {indicator.AreaValue}</span>
                                      </div>
                                    </div>
                                  </td>



                                
                                







                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : selectedArea ? (
                      <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-500">No health data available for this area</p>
                      </div>
                    ) : (
                      <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-500">Could not determine local area for this property</p>
                      </div>
                    )}
          </div>
















        <div className="bg-white rounded-lg shadow-sm p-6">
            <SensorList propertyId={id} />
        </div>
            
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DocumentList propertyId={id} />
        </div>




        </main>
      </div>
    </PropertyTransition>
  );
};

export default PropertyDetail;

