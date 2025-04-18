// controllers/HealthDataController.ts
import { Request, Response } from 'express';
import HealthDataCache from '../models/HealthDataCache';
import { BaseController } from './BaseController';
import axios from 'axios';

export class HealthDataController extends BaseController {
    private readonly BASE_URL = process.env.BASE_URL || 'http://localhost:3000';


    public async getCachedHealthData(req: Request, res: Response): Promise<void> {
        const { areaCode } = req.params;
    
        try {
          const cachedData = await HealthDataCache.findOne({ locationCode: areaCode });
          
          if (cachedData) {
             this.jsonResponse(res, 200, 'Data from cache', {
              area: { 
                Code: cachedData.locationCode, 
                Name: cachedData.locationName 
              },
              indicators: cachedData.indicators
            });
            return;
          }
    
          // Use absolute URLs for server-to-server calls
          const [areaData, rawData, metadata, stats] = await Promise.all([
            this.fetchAreaDetails(areaCode),
            axios.get(`${this.BASE_URL}/api/proxy/latest-data`, {
              params: {
                areaCode: areaCode,
                profileId: 143
              }
            }),
            axios.get(`${this.BASE_URL}/api/proxy/indicator-metadata`, {
              params: {
                groupId: 1938133185
              }
            }),
            axios.get(`${this.BASE_URL}/api/proxy/indicator-statistics`, {
              params: {
                profileId: 143,
                areaCode: 'E92000001'
              }
            })
          ]);
    
          const transformedData = this.transformData(
            rawData.data,
            metadata.data,
            stats.data
          );
    
          // Cache the transformed data
          await new HealthDataCache({
            locationCode: areaCode,
            locationName: areaData.Name,
            indicators: transformedData
          }).save();
    
          this.jsonResponse(res, 200, 'Data from source', {
            area: { Code: areaCode, Name: areaData.Name },
            indicators: transformedData
          });
        } catch (error) {
          this.errorResponse(res, 500, 'Failed to fetch data', error);
        }
      }
    
      private async fetchAreaDetails(areaCode: string) {
        const response = await axios.get(`${this.BASE_URL}/api/proxy/area-search`, {
          params: {
            searchText: areaCode // Match the proxy endpoint parameter name
          }
        });
        
        if (!response.data || response.data.length === 0) {
          throw new Error('Area not found');
        }
        
        return response.data[0];
      }

 


   
  // Helper function to format values consistently
  private formatValue = (value: number, unit: string): string => {
    if (value === undefined || value === null) return "N/A";
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (unit === "%") return `${numValue.toFixed(1)}%`;
    if (unit === "per 1,000") return `${numValue.toFixed(1)} per 1,000`;
    return numValue.toString();
  };


  private cleanIndicatorName = (name: string): string => {
    return name
      .replace(/\s*\(\d+[\s-]+\d+\s+yrs\)/i, "")
      .replace(/\s*\([^)]*\)/g, ""); // Remove all parentheses content
  };
  
  private extractAgeGroup = (name: string): string => {
    const ageMatch = name.match(/\((\d+[\s-]+\d+\s+yrs)\)/i);
    return ageMatch ? ageMatch[1] : "";
  };
  
  private calculateSignificance = (
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


  private POLARITY_MAP: Record<number, {worst: 'min' | 'max', best: 'min' | 'max'}> = {
    1: { worst: 'min', best: 'max' }, // Higher is better
    2: { worst: 'max', best: 'min' }, // Lower is better (mortality)
    3: { worst: 'min', best: 'max' }  // Neutral
  };






  private transformData = (rawData: any[], metadata: any, stats: any): Indicator[] => {
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
        const polarityConfig = this.POLARITY_MAP[forcedPolarity];
        const worstValue = indicatorStats ? 
          (polarityConfig.worst === 'max' ? indicatorStats.Max : indicatorStats.Min) : null;
        const bestValue = indicatorStats ? 
          (polarityConfig.best === 'max' ? indicatorStats.Max : indicatorStats.Min) : null;
  
        // Name processing
        const cleanName = this.cleanIndicatorName(indicatorMeta.Descriptive.Name);
        const ageGroup = this.extractAgeGroup(indicatorMeta.Descriptive.Name);
  
        // Significance calculation
        const significance = this.calculateSignificance(
          item.Significance,
          forcedPolarity,
          localValue,
          englandValue
        );
  
        acc.push({
          IID: item.IID,
          IndicatorName: cleanName,
          AreaValue: this.formatValue(localValue, indicatorMeta.Unit.Label),
          EnglandValue: this.formatValue(englandValue, indicatorMeta.Unit.Label),
          TimePeriod: item.Period || "Latest",
          Definition: indicatorMeta.Descriptive.Definition,
          Unit: indicatorMeta.Unit.Label,
          Polarity: "Lower values are better",
          Significance: significance,
          WorstValue: this.formatValue(worstValue, indicatorMeta.Unit.Label),
          BestValue: this.formatValue(bestValue, indicatorMeta.Unit.Label),
          Range: indicatorStats ? 
            `${this.formatValue(indicatorStats.Min, indicatorMeta.Unit.Label)} - ${
            this.formatValue(indicatorStats.Max, indicatorMeta.Unit.Label)}` : "N/A",
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
}

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