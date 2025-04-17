import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

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

// Add this to your component or a config file
const POLARITY_MAP: Record<number, {worst: 'min' | 'max', best: 'min' | 'max'}> = {
  1: { worst: 'min', best: 'max' }, // Higher is better
  2: { worst: 'max', best: 'min' }, // Lower is better (mortality)
  3: { worst: 'min', best: 'max' }  // Neutral
};


export default function HealthDataExplorer() {
  const [searchText, setSearchText] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const debouncedSearchText = useDebounce(searchText, 300);

  // Search for areas when user types
  useEffect(() => {
    if (debouncedSearchText.trim().length > 2) {
      searchAreas(debouncedSearchText);
    } else {
      setAreas([]);
    }
  }, [debouncedSearchText]);

  const searchAreas = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy/area-search?searchText=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to fetch areas");
      const data = await response.json();
      setAreas(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Couldn't fetch areas. Please try again.",
        variant: "destructive",
      });
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch indicator data when area is selected
  useEffect(() => {
    if (selectedArea) {
      fetchIndicatorData();
    }
  }, [selectedArea]);




  const fetchIndicatorData = async () => {
    if (!selectedArea) return;
    
    setLoading(true);
    console.time('Total fetch time'); // Start performance timer
  
    try {
      // Parallelize API calls
      console.time('API calls');
      const [rawResponse, metadataResponse, statsResponse] = await Promise.all([
        fetch(`/api/proxy/latest-data?areaCode=${selectedArea.Code}&profileId=143`),
        fetch(`/api/proxy/indicator-metadata?groupId=1938133185`),
        fetch(`/api/proxy/indicator-statistics?profileId=143&areaCode=E92000001`)
      ]);
      console.timeEnd('API calls');
  
      // Check for errors
      if (!rawResponse.ok) throw new Error('Raw data failed: ' + rawResponse.status);
      if (!metadataResponse.ok) throw new Error('Metadata failed: ' + metadataResponse.status);
      if (!statsResponse.ok) throw new Error('Stats failed: ' + statsResponse.status);
  
      // Parallelize data parsing
      console.time('Data parsing');
      const [rawData, metadata, stats] = await Promise.all([
        rawResponse.json(),
        metadataResponse.json(),
        statsResponse.json()
      ]);
      console.timeEnd('Data parsing');
  
      console.debug('Data sizes:', {
        rawData: rawData.length,
        metadata: Object.keys(metadata).length,
        stats: Object.values(stats).length
      });
  
      // Transform data
      console.time('Data transformation');
      const transformedData = transformIndicatorData(rawData, metadata, stats);
      console.timeEnd('Data transformation');
  
      // Efficient unique filtering using Set
      console.time('Deduplication');
      const uniqueIndicators = transformedData.filter((indicator, index, self) =>
        index === self.findIndex((t) => t.IID === indicator.IID)
      );
      console.timeEnd('Deduplication');
  
      console.debug('Final indicators:', uniqueIndicators);
      setIndicators(uniqueIndicators);
    } catch (err) {
      console.error('Data fetch error:', err);
      toast({ title: "Error", description: "Couldn't fetch data", variant: "destructive" });
      setIndicators([]);
    } finally {
      console.timeEnd('Total fetch time');
      setLoading(false);
    }
  };
  
  const transformIndicatorData = (rawData: any[], metadata: any, stats: any): Indicator[] => {
    console.time('Transform indicators');
    
    // Create a Map for faster stats lookup
    const statsMap = new Map(
      (Object.values(stats) as any[]).map(stat => [stat.IID, stat.Stats]
    ));
  
    const result = rawData.reduce((acc: Indicator[], item) => {
      try {
        // Get metadata early
        const indicatorMeta = metadata[item.IID.toString()];
        if (!indicatorMeta) return acc;
  
        // Filter for mortality indicators early
        const indicatorName = indicatorMeta.Descriptive?.Name || '';
        if (!indicatorName.toLowerCase().includes('mortality')) return acc;
  
        // Get stats from Map
        const indicatorStats = statsMap.get(item.IID);
  
        // Value processing
        const localValue = parseFloat(item.Data?.[0]?.Val);
        const englandValue = parseFloat(item.Grouping?.[0]?.ComparatorData?.Val);
        
        // Skip invalid data
        if (isNaN(localValue) || isNaN(englandValue)) return acc;
  
        // Polarity handling
        const forcedPolarity = 2; // Force mortality polarity
        const polarityConfig = POLARITY_MAP[forcedPolarity];
        const worstValue = indicatorStats ? 
          (polarityConfig.worst === 'max' ? indicatorStats.Max : indicatorStats.Min) : null;
        const bestValue = indicatorStats ? 
          (polarityConfig.best === 'max' ? indicatorStats.Max : indicatorStats.Min) : null;
  
        // Name processing
        const cleanName = cleanIndicatorName(indicatorMeta.Descriptive.Name);
        const ageGroup = extractAgeGroup(indicatorMeta.Descriptive.Name);
  
        // Significance calculation
        const significance = calculateSignificance(
          item.Significance,
          forcedPolarity,
          localValue,
          englandValue
        );
  
        acc.push({
          IID: item.IID,
          IndicatorName: cleanName,
          AreaValue: formatValue(localValue, indicatorMeta.Unit.Label),
          EnglandValue: formatValue(englandValue, indicatorMeta.Unit.Label),
          TimePeriod: item.Period || "Latest",
          Definition: indicatorMeta.Descriptive.Definition,
          Unit: indicatorMeta.Unit.Label,
          Polarity: "Lower values are better",
          Significance: significance,
          WorstValue: formatValue(worstValue, indicatorMeta.Unit.Label),
          BestValue: formatValue(bestValue, indicatorMeta.Unit.Label),
          Range: indicatorStats ? 
            `${formatValue(indicatorStats.Min, indicatorMeta.Unit.Label)} - ${
            formatValue(indicatorStats.Max, indicatorMeta.Unit.Label)}` : "N/A",
          AgeGroup: ageGroup
        });
      } catch (error) {
        console.warn('Error processing indicator', item.IID, error);
      }
      return acc;
    }, []);
  
    console.timeEnd('Transform indicators');
    return result;
  };
  


  
  // Helper function to format values consistently
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
      .replace(/\s*\([^)]*\)/g, ""); // Remove all parentheses content
  };
  
  const extractAgeGroup = (name: string): string => {
    const ageMatch = name.match(/\((\d+[\s-]+\d+\s+yrs)\)/i);
    return ageMatch ? ageMatch[1] : "";
  };
  
  const calculateSignificance = (
    sigData: any, 
    polarity: number,
    localValue: number,
    englandValue: number
  ): string => {
    if (!sigData) {
      // Fallback comparison when no significance data
      if (polarity === 1) {
        return localValue > englandValue ? "Better than England" : 
               localValue < englandValue ? "Worse than England" : "Similar to England";
      } else {
        return localValue < englandValue ? "Better than England" : 
               localValue > englandValue ? "Worse than England" : "Similar to England";
      }
    }
  
    const sigValues = Object.values(sigData);
    if (sigValues.includes(1)) return "Worse than England";
    if (sigValues.includes(2)) return "Better than England";
    if (sigValues.includes(3)) return "Similar to England";
    
    return "Not significant";
  };



  const getPolarityLabel = (polarityId: number): string => {
    switch(polarityId) {
      case 1: return "Higher values are better";
      case 2: return "Lower values are better";
      case 3: return "No clear better/worse";
      default: return "Higher values are better"; // Default assumption
    }
  };


  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">UK Public Health Dashboard</h1>
        <p className="text-gray-600">Compare health indicators across UK local authorities</p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search for a local authority..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          {selectedArea && (
            <button 
              onClick={() => {
                setSelectedArea(null);
                setIndicators([]);
                setSearchText("");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Area Suggestions */}
        {areas.length > 0 && (
          <div className="mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
            {areas.map((area) => (
              <div
                key={area.Code}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => {
                  setSelectedArea(area);
                  setAreas([]);
                  setSearchText(area.Name);
                }}
              >
                <p className="font-medium text-gray-900">{area.Name}</p>
                <p className="text-sm text-gray-500">{area.Short}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Area */}
      {selectedArea && (
        <div className="mb-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedArea.Name}</h2>
          <p className="text-sm text-gray-600">{selectedArea.Short}</p>
        </div>
      )}

      {/* Health Data */}
      {selectedArea && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Population Health Indicators</h2>
            {indicators.length > 0 && (
              <span className="text-sm text-gray-500">
                Showing {indicators.length} indicators
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
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
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-500">No health data available for this area</p>
            </div>
          )}
        </div>
      )}

      {/* Data Quality Note
      {selectedArea && (
        <div className="mt-6 text-xs text-gray-400">
          <p>Data sourced from Public Health England. Values are age-standardized where applicable.</p>
        </div>
      )} */}
    </div>
  );
  
}