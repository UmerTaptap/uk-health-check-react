import React, { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PropertyGroup } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PropertyGroupSelectorProps {
  propertyId: number | string;
  currentGroupId?: number | null;
  onGroupAssigned?: (success: boolean) => void;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const PropertyGroupSelector = ({
  propertyId,
  currentGroupId,
  onGroupAssigned,
  buttonVariant = 'outline',
  className,
}: PropertyGroupSelectorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Fetch all property groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery<PropertyGroup[]>({
    queryKey: ['/api/property-groups'],
    queryFn: async () => {
      const response = await fetch('/api/property-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch property groups');
      }
      return response.json() as Promise<PropertyGroup[]>;
    }
  });

  // Mutation to assign property to a group
  const assignGroupMutation = useMutation({
    mutationFn: async ({ groupId }: { groupId: number | null }) => {
      if (groupId === null) {
        // Remove from group
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ groupId: null }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove property from group');
        }
        
        return response.json();
      } else {
        // Assign to group
        const response = await fetch(`/api/property-groups/${groupId}/properties/${propertyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to assign property to group');
        }
        
        return response.json();
      }
    },
    onSuccess: (data, variables) => {
      // Get the new groupId from the variables passed to the mutation
      const { groupId: newGroupId } = variables;
      
      // Invalidate specific property query
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}`] });
      
      // Invalidate all property groups
      queryClient.invalidateQueries({ queryKey: ['/api/property-groups'] });
      
      // Invalidate all properties list to refresh property cards on Properties page
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      // Invalidate the current (old) property group's properties list if exists
      if (currentGroupId) {
        console.log(`Invalidating old group: ${currentGroupId}`);
        queryClient.invalidateQueries({ queryKey: [`/api/property-groups/${currentGroupId}/properties`] });
      }
      
      // Also invalidate the new property group's properties list
      if (newGroupId !== null) {
        console.log(`Invalidating new group: ${newGroupId}`);
        queryClient.invalidateQueries({ queryKey: [`/api/property-groups/${newGroupId}/properties`] });
      }
      
      toast({
        title: "Success",
        description: "Property group assignment updated",
        variant: "default",
      });
      
      if (onGroupAssigned) {
        onGroupAssigned(true);
      }
      
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error assigning property to group:', error);
      toast({
        title: "Error",
        description: "Failed to update property group assignment",
        variant: "destructive",
      });
      
      if (onGroupAssigned) {
        onGroupAssigned(false);
      }
    },
  });

  const handleSelectGroup = (groupId: number | null) => {
    assignGroupMutation.mutate({ groupId });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', className, {
            'text-muted-foreground': !currentGroupId,
          })}
          disabled={isLoadingGroups || assignGroupMutation.isPending}
        >
          {assignGroupMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          
          {currentGroupId 
            ? groups.find((group: PropertyGroup) => group.id === currentGroupId)?.name || 'Select group...'
            : 'Assign to group...'}
            
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[250px]">
        <Command>
          <CommandInput placeholder="Search groups..." />
          <CommandList>
            <CommandEmpty>No groups found.</CommandEmpty>
            <CommandGroup>
              {groups.map((group: PropertyGroup) => (
                <CommandItem
                  key={group.id}
                  value={group.name}
                  onSelect={() => handleSelectGroup(group.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentGroupId === group.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {group.name}
                </CommandItem>
              ))}
              {currentGroupId && (
                <CommandItem
                  value="remove"
                  className="text-destructive"
                  onSelect={() => handleSelectGroup(null)}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Remove from group
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PropertyGroupSelector;