import React from 'react';
import { Building, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PropertyGroup } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyGroupSelector from './PropertyGroupSelector';

interface PropertyGroupInfoProps {
  propertyId: number | string;
  groupId?: number | null;
}

const PropertyGroupInfo: React.FC<PropertyGroupInfoProps> = ({ propertyId, groupId }) => {
  // Fetch group details if a groupId is provided
  const { data: group, isLoading } = useQuery({
    queryKey: ['/api/property-groups', groupId],
    queryFn: async () => {
      const response = await fetch(`/api/property-groups/${groupId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property group');
      }
      return response.json() as Promise<PropertyGroup>;
    },
    enabled: !!groupId,
    refetchOnWindowFocus: true, // Auto-refresh when window gets focus
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  if (!groupId) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <Building className="h-5 w-5 mr-2 text-muted-foreground" />
            Property Group
          </CardTitle>
          <CardDescription>
            Manage group assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This property is not assigned to any group.
          </p>
          <PropertyGroupSelector 
            propertyId={propertyId} 
            currentGroupId={null}
            buttonVariant="default"
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <Building className="h-5 w-5 mr-2 text-muted-foreground" />
            Property Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Building className="h-5 w-5 mr-2 text-muted-foreground" />
          Property Group
        </CardTitle>
        <CardDescription>
          Group details and management
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {group ? (
          <>
            <h3 className="font-semibold">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
            )}
            <div className="mt-2">
              <Link 
                href={`/property-groups/${group.id}`}
                className="text-sm text-primary flex items-center hover:underline"
              >
                View Group Details
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Group details not available</p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <PropertyGroupSelector 
          propertyId={propertyId} 
          currentGroupId={groupId}
          buttonVariant="outline"
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
};

export default PropertyGroupInfo;