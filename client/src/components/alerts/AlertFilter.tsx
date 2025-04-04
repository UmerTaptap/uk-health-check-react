import React from 'react';
import { AlertCircle, AlertTriangle, Info, Filter } from 'lucide-react';
import { AlertSeverity } from '@/lib/types';
import { motion } from 'framer-motion';

// This component is replaced by the PremiumCard component in Alerts.tsx
// We keep this file for compatibility, but it's not used anymore

type AlertFilterProps = {
  selected: AlertSeverity | 'all';
  onChange: (severity: AlertSeverity | 'all') => void;
  count?: {
    all: number;
    high: number;
    medium: number;
    low: number;
  };
};

const AlertFilter: React.FC<AlertFilterProps> = ({ selected, onChange, count = { all: 0, high: 0, medium: 0, low: 0 } }) => {
  // This component is no longer used as it was replaced by the PremiumCard grid in Alerts.tsx
  return null;
};

export default AlertFilter;
