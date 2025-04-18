// models/HealthDataCache.ts
import mongoose from 'mongoose';

export interface HealthData {
  locationCode: string;
  locationName: string;
  indicators: any[]; // Use proper TypeScript interface for indicators
  createdAt: Date;
}

const HealthDataCacheSchema = new mongoose.Schema<HealthData>({
  locationCode: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  indicators: { type: [], required: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' } // Auto-delete after 30 days
});

export default mongoose.model<HealthData>('HealthDataCache', HealthDataCacheSchema);