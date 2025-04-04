import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckSquare, Square, PlusCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BatchPropertyAssignerProps {
  groupId: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface PropertyWithSelection extends Property {
  selected: boolean;
}

const BatchPropertyAssigner = ({
  groupId,
  trigger,
  onSuccess
}: BatchPropertyAssignerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProperties, setAllProperties] = useState<PropertyWithSelection[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  
  // Fetch all available properties
  const { data: propertiesData, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json() as Promise<Property[]>;
    },
    enabled: open // Only fetch when dialog is open
  });
  
  // Fetch properties already in this group to exclude them
  const { data: groupProperties, isLoading: isLoadingGroupProperties } = useQuery({
    queryKey: [`/api/property-groups/${groupId}/properties`],
    queryFn: async () => {
      const response = await fetch(`/api/property-groups/${groupId}/properties`);
      if (!response.ok) {
        throw new Error('Failed to fetch group properties');
      }
      return response.json() as Promise<Property[]>;
    },
    enabled: open // Only fetch when dialog is open
  });
  
  // Process properties data when it changes
  useEffect(() => {
    if (propertiesData && groupProperties) {
      // Filter out properties already in this group
      const groupPropertyIds = new Set(groupProperties.map(p => p.id));
      
      const availableProperties = propertiesData
        .filter(p => !groupPropertyIds.has(p.id))
        .map(p => ({
          ...p,
          selected: false
        }));
      
      setAllProperties(availableProperties);
      setSelectedCount(0);
    }
  }, [propertiesData, groupProperties]);
  
  // Filter properties based on search term
  const filteredProperties = allProperties.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Toggle property selection
  const togglePropertySelection = (propertyId: number) => {
    setAllProperties(prev => 
      prev.map(p => {
        if (p.id === propertyId) {
          return { ...p, selected: !p.selected };
        }
        return p;
      })
    );
    
    // Update selected count
    const isCurrentlySelected = allProperties.find(p => p.id === propertyId)?.selected;
    setSelectedCount(prev => isCurrentlySelected ? prev - 1 : prev + 1);
  };
  
  // Select/deselect all visible properties
  const toggleAllVisible = () => {
    const allSelected = filteredProperties.every(p => p.selected);
    
    setAllProperties(prev => 
      prev.map(p => {
        if (filteredProperties.some(fp => fp.id === p.id)) {
          return { ...p, selected: !allSelected };
        }
        return p;
      })
    );
    
    // Update selected count
    if (allSelected) {
      setSelectedCount(prev => prev - filteredProperties.filter(p => p.selected).length);
    } else {
      setSelectedCount(prev => prev + filteredProperties.filter(p => !p.selected).length);
    }
  };
  
  // Mutation to assign properties to group
  const assignPropertiesMutation = useMutation({
    mutationFn: async (propertyIds: number[]) => {
      const response = await fetch(`/api/property-groups/${groupId}/properties/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign properties to group');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/property-groups/${groupId}/properties`] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      toast({
        title: "Success",
        description: `${selectedCount} properties assigned to group`,
        variant: "default",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error assigning properties to group:', error);
      toast({
        title: "Error",
        description: "Failed to assign properties to group",
        variant: "destructive",
      });
    },
  });
  
  const handleAssignProperties = () => {
    const selectedPropertyIds = allProperties
      .filter(p => p.selected)
      .map(p => p.id);
    
    if (selectedPropertyIds.length === 0) {
      toast({
        title: "No properties selected",
        description: "Please select at least one property to assign",
        variant: "destructive",
      });
      return;
    }
    
    assignPropertiesMutation.mutate(selectedPropertyIds);
  };
  
  const isLoading = isLoadingProperties || isLoadingGroupProperties;
  const isPending = assignPropertiesMutation.isPending;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Properties
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Properties to Group</DialogTitle>
          <DialogDescription>
            Select properties to add to this group. Properties already in the group are not shown.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative my-4">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading || isPending}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading properties...</span>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm
              ? 'No properties match your search'
              : 'All properties are already assigned to this group'}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2 px-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={toggleAllVisible}
                disabled={isPending}
              >
                {filteredProperties.every(p => p.selected) ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                {selectedCount} selected
              </span>
            </div>
            
            <ScrollArea className="flex-1 border rounded-md">
              <div className="p-2 space-y-1">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-muted",
                      property.selected && "bg-muted"
                    )}
                    onClick={() => togglePropertySelection(property.id)}
                  >
                    {property.selected ? (
                      <CheckSquare className="h-5 w-5 mr-3 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 mr-3 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{property.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {property.address}
                      </div>
                    </div>
                    <div className="ml-3 min-w-[80px] text-right">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          property.status === 'compliant' && "bg-green-100 text-green-800",
                          property.status === 'at_risk' && "bg-yellow-100 text-yellow-800",
                          property.status === 'non-compliant' && "bg-red-100 text-red-800"
                        )}
                      >
                        {property.status === 'compliant' && 'Compliant'}
                        {property.status === 'at_risk' && 'At Risk'}
                        {property.status === 'non-compliant' && 'Non-Compliant'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignProperties}
            disabled={selectedCount === 0 || isPending || isLoading}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selectedCount} Properties
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchPropertyAssigner;