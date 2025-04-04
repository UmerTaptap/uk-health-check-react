import React from 'react';
import { Alert } from '@/lib/types';
import { motion } from 'framer-motion';

// This component is now a simple wrapper around the direct implementation in Alerts.tsx
type AlertsListProps = {
  alerts: Alert[];
};

const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  // This component is no longer used as we've implemented AlertItem directly in the Alerts.tsx
  // Return null to avoid errors, but this component is essentially deprecated
  return null;
};

export default AlertsList;