import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Building, Loader2, Plus, Home, ChevronRight, AlertTriangle } from 'lucide-react';
import { PropertyGroup, Property } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ContentTransition } from '@/components/transitions/ContentTransition';
import { SharedLayoutTransition } from '@/components/transitions/SharedLayoutTransition';
import { Progress } from "@/components/ui/progress";

// Property Group Card Component
interface PropertyGroupCardProps {
  group: PropertyGroup;
}

const PropertyGroupCard = ({ group }: PropertyGroupCardProps) => {
  // Fetch properties for this group
  const { data: groupProperties = [] } = useQuery<Property[]>({
    queryKey: [`/api/property-groups/${group.id}/properties`],
    queryFn: async () => {
      const response = await fetch(`/api/property-groups/${group.id}/properties`);
      if (!response.ok) {
        throw new Error(`Failed to fetch properties for group ${group.id}`);
      }
      return response.json();
    }
  });

  // Calculate compliance statistics
  const totalProperties = groupProperties.length;
  const compliantProperties = groupProperties.filter(p => p.status === 'compliant').length;
  const atRiskProperties = groupProperties.filter(p => p.status === 'at-risk').length;
  const nonCompliantProperties = groupProperties.filter(p => p.status === 'non-compliant').length;
  
  const compliantPercentage = totalProperties ? Math.round((compliantProperties / totalProperties) * 100) : 0;
  const atRiskPercentage = totalProperties ? Math.round((atRiskProperties / totalProperties) * 100) : 0;
  const nonCompliantPercentage = totalProperties ? Math.round((nonCompliantProperties / totalProperties) * 100) : 0;

  // Count properties requiring immediate attention (both non-compliant and at-risk)
  const propertiesRequiringAttention = groupProperties.filter(p => 
    p.status === 'non-compliant' || p.status === 'at-risk'
  ).length;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Building className="h-5 w-5 mr-2 text-primary" />
          {group.name}
        </CardTitle>
        <CardDescription>
          {group.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="flex items-center text-sm">
          <Home className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">
            Properties in this group: {totalProperties}
          </span>
        </div>
        
        {totalProperties > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Compliance Status</span>
                <span>{compliantPercentage}% Compliant</span>
              </div>
              <div className="flex gap-1">
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${compliantPercentage}%` }}></div>
                </div>
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${atRiskPercentage}%` }}></div>
                </div>
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${nonCompliantPercentage}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{compliantProperties} Compliant</span>
                <span>{atRiskProperties} At Risk</span>
                <span>{nonCompliantProperties} Non-Compliant</span>
              </div>
            </div>
            
            {propertiesRequiringAttention > 0 && (
              <div className="flex items-center text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>{propertiesRequiringAttention} {propertiesRequiringAttention === 1 ? 'property' : 'properties'} requiring immediate attention</span>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Link 
          href={`/property-groups/${group.id}`}
          className="inline-flex items-center text-primary hover:underline w-full justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          View Group Details
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
};



const PropertyGroups = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
  });

  // Fetch all property groups
  const { 
    data: groups = [], 
    isLoading: isLoadingGroups,
    refetch: refetchGroups 
  } = useQuery<PropertyGroup[]>({
    queryKey: ['/api/property-groups'],
    queryFn: async () => {
      const response = await fetch('/api/property-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch property groups');
      }
      return response.json();
    }
  });

  // Create new property group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/property-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create property group');
      }
      
      toast({
        title: "Success",
        description: "Property group created successfully",
        variant: "default",
      });
      
      // Reset form and close dialog
      setNewGroup({ name: '', description: '' });
      setDialogOpen(false);
      
      // Refetch groups
      refetchGroups();
    } catch (error) {
      console.error('Error creating property group:', error);
      toast({
        title: "Error",
        description: "Failed to create property group",
        variant: "destructive",
      });
    }
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fetch all properties for overall stats
  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <ContentTransition direction="right">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Property Groups</h2>
            <p className="text-muted-foreground">
              Organize properties into logical groups for easier management
            </p>
          </div>
        </ContentTransition>
        
        <ContentTransition direction="left">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateGroup}>
                <DialogHeader>
                  <DialogTitle>Create New Property Group</DialogTitle>
                  <DialogDescription>
                    Add a new group to organize your properties. Provide a descriptive name and optional details.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter group name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter group description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      className="resize-none"
                      rows={4}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </ContentTransition>
      </div>
      
      {/* Overall compliance stats */}
      <ContentTransition direction="up">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Overall Compliance</CardTitle>
            <CardDescription>
              Compliance status across all properties in the portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calculate overall statistics */}
            {(() => {
              const totalProperties = allProperties.length;
              const compliantProperties = allProperties.filter(p => p.status === 'compliant').length;
              const atRiskProperties = allProperties.filter(p => p.status === 'at-risk').length;
              const nonCompliantProperties = allProperties.filter(p => p.status === 'non-compliant').length;
              
              const compliantPercentage = totalProperties ? Math.round((compliantProperties / totalProperties) * 100) : 0;
              const atRiskPercentage = totalProperties ? Math.round((atRiskProperties / totalProperties) * 100) : 0;
              const nonCompliantPercentage = totalProperties ? Math.round((nonCompliantProperties / totalProperties) * 100) : 0;
              
              // Count properties requiring immediate attention (both non-compliant and at-risk)
              const propertiesRequiringAttention = allProperties.filter(p => 
                p.status === 'non-compliant' || p.status === 'at-risk'
              ).length;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold">{totalProperties}</div>
                      <div className="text-sm text-muted-foreground">Total Properties</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold text-green-600">{compliantProperties}</div>
                      <div className="text-sm text-muted-foreground">Compliant</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold text-amber-600">{atRiskProperties}</div>
                      <div className="text-sm text-muted-foreground">At Risk</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold text-red-600">{nonCompliantProperties}</div>
                      <div className="text-sm text-muted-foreground">Non-Compliant</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Compliance Status</span>
                      <span>{compliantPercentage}% Compliant</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-3 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${compliantPercentage}%` }}></div>
                      </div>
                      <div className="h-3 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${atRiskPercentage}%` }}></div>
                      </div>
                      <div className="h-3 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${nonCompliantPercentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{compliantPercentage}% Compliant</span>
                      <span>{atRiskPercentage}% At Risk</span>
                      <span>{nonCompliantPercentage}% Non-Compliant</span>
                    </div>
                  </div>
                  
                  {propertiesRequiringAttention > 0 && (
                    <div className="mt-4 flex items-center text-amber-600 bg-amber-50 p-2 rounded">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>
                        {propertiesRequiringAttention} {propertiesRequiringAttention === 1 ? 'property' : 'properties'} requiring immediate attention
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </ContentTransition>
      
      <ContentTransition direction="right">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="text-sm text-muted-foreground">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'} total
          </div>
        </div>
      </ContentTransition>
      
      {isLoadingGroups ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading property groups...</span>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          {searchTerm ? (
            <div>
              <h3 className="text-lg font-medium mb-2">No matching groups found</h3>
              <p className="text-muted-foreground">Try adjusting your search term</p>
            </div>
          ) : (
            <div>
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No property groups yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first property group to organize and manage your properties more efficiently.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <SharedLayoutTransition key={group.id} id={`group-card-${group.id}`} withScale duration={0.5}>
              <PropertyGroupCard group={group} />
            </SharedLayoutTransition>
          ))}
        </div>
      )}
    </div>
  );
};



export default PropertyGroups;