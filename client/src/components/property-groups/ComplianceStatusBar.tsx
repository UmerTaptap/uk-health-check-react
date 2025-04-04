import React from 'react';
import { Property } from '@shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ComplianceStatusBarProps {
  properties: Property[];
  className?: string;
}

const ComplianceStatusBar: React.FC<ComplianceStatusBarProps> = ({ properties, className }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className={cn("text-center text-sm text-muted-foreground", className)}>
        No properties to analyze
      </div>
    );
  }
  
  // Count properties by status
  const counts = {
    compliant: properties.filter(p => p.status === 'compliant').length,
    atRisk: properties.filter(p => p.status === 'at-risk').length,
    nonCompliant: properties.filter(p => p.status === 'non-compliant').length,
  };
  
  // Calculate percentages
  const total = properties.length;
  const percentages = {
    compliant: Math.round((counts.compliant / total) * 100),
    atRisk: Math.round((counts.atRisk / total) * 100),
    nonCompliant: Math.round((counts.nonCompliant / total) * 100),
  };
  
  // Ensure percentages add up to 100% exactly by adjusting the largest value if needed
  const sum = percentages.compliant + percentages.atRisk + percentages.nonCompliant;
  if (sum !== 100 && sum !== 0) {
    const diff = 100 - sum;
    
    if (counts.compliant >= counts.atRisk && counts.compliant >= counts.nonCompliant) {
      percentages.compliant += diff;
    } else if (counts.atRisk >= counts.compliant && counts.atRisk >= counts.nonCompliant) {
      percentages.atRisk += diff;
    } else {
      percentages.nonCompliant += diff;
    }
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex rounded-full overflow-hidden h-3">
        {/* Non-compliant segment (red) */}
        {percentages.nonCompliant > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="bg-red-600 h-full transition-all"
                  style={{ width: `${percentages.nonCompliant}%` }}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs font-medium">Non-Compliant: {percentages.nonCompliant}% ({counts.nonCompliant} properties)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* At-risk segment (amber) */}
        {percentages.atRisk > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${percentages.atRisk}%` }}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs font-medium">At Risk: {percentages.atRisk}% ({counts.atRisk} properties)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Compliant segment (green) */}
        {percentages.compliant > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="bg-emerald-600 h-full transition-all"
                  style={{ width: `${percentages.compliant}%` }}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs font-medium">Compliant: {percentages.compliant}% ({counts.compliant} properties)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-red-600 rounded-full"></span>
          <span>Non-Compliant ({counts.nonCompliant})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span>
          <span>At Risk ({counts.atRisk})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-emerald-600 rounded-full"></span>
          <span>Compliant ({counts.compliant})</span>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatusBar;