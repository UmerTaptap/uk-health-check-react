import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building, Edit, Trash2, Plus, Loader2, HomeIcon, AlertTriangle } from 'lucide-react';
import { PropertyGroup, Property } from '@shared/schema';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PropertyTransition } from '@/components/transitions/PropertyTransition';
import { ContentTransition } from '@/components/transitions/ContentTransition';
import { SharedLayoutTransition } from '@/components/transitions/SharedLayoutTransition';
import BatchPropertyAssigner from '@/components/property-groups/BatchPropertyAssigner';
import ComplianceStatusBar from '@/components/property-groups/ComplianceStatusBar';

const PropertyGroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
  });

  // Fetch group details
  const { 
    data: group, 
    isLoading: isLoadingGroup,
    refetch: refetchGroup 
  } = useQuery<PropertyGroup>({
    queryKey: [`/api/property-groups/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/property-groups/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property group');
      }
      return response.json();
    },
    refetchOnWindowFocus: true, // Auto-refresh when window gets focus
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Fetch properties in this group
  const { 
    data: properties = [], 
    isLoading: isLoadingProperties,
    refetch: refetchProperties
  } = useQuery<Property[]>({
    queryKey: [`/api/property-groups/${id}/properties`],
    queryFn: async () => {
      const response = await fetch(`/api/property-groups/${id}/properties`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
    enabled: !!id,
    refetchOnWindowFocus: true, // Auto-refresh when window gets focus
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Set edit form data when group data is loaded
  React.useEffect(() => {
    if (group) {
      setEditFormData({
        name: group.name,
        description: group.description || '',
      });
    }
  }, [group]);

  // Handle edit group submission
  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/property-groups/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update property group');
      }
      
      toast({
        title: "Success",
        description: "Property group updated successfully",
        variant: "default",
      });
      
      setEditDialogOpen(false);
      refetchGroup();
    } catch (error) {
      console.error('Error updating property group:', error);
      toast({
        title: "Error",
        description: "Failed to update property group",
        variant: "destructive",
      });
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    try {
      const response = await fetch(`/api/property-groups/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete property group');
      }
      
      toast({
        title: "Success",
        description: "Property group deleted successfully",
        variant: "default",
      });
      
      // Navigate back to property groups page
      window.location.href = '/property-groups';
    } catch (error) {
      console.error('Error deleting property group:', error);
      toast({
        title: "Error",
        description: "Failed to delete property group",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
    }
  };

  // Handle batch property assignment success
  const handleBatchAssignmentSuccess = () => {
    refetchProperties();
  };

  // Get status badge for a property
  const getStatusBadge = (status: string) => {
    const getBgColor = () => {
      switch (status) {
        case 'non-compliant':
          return 'bg-red-100 text-red-800';
        case 'at_risk':
          return 'bg-amber-100 text-amber-800';
        case 'compliant':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBgColor()}`}>
        {status === 'non-compliant' ? 'Non-Compliant' : 
         status === 'at_risk' ? 'At Risk' : 
         status === 'compliant' ? 'Compliant' : status}
      </span>
    );
  };

  // Loading state
  if (isLoadingGroup) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (!group) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/property-groups" className="text-primary flex items-center gap-1 mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Property Groups
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Property Group Not Found</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-red-600 text-xl">Error loading property group details</div>
            <p className="mt-2">The property group you're looking for could not be found or there was an error loading it.</p>
            <Link href="/property-groups" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
              Return to Property Groups
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <PropertyTransition>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/property-groups" className="text-primary flex items-center gap-1 mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Property Groups
            </Link>
            
            <div className="flex justify-between items-center">
              <div>
                <ContentTransition delay={0.1} direction="right">
                  <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <Building className="h-6 w-6 mr-2 text-primary" />
                    {group.name}
                  </h1>
                </ContentTransition>
                <ContentTransition delay={0.2} direction="right">
                  <p className="text-gray-500 mt-1">
                    {group.description || 'No description provided'}
                  </p>
                </ContentTransition>
              </div>
              
              <div className="flex gap-2">
                <ContentTransition delay={0.3} direction="left">
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleEditGroup}>
                        <DialogHeader>
                          <DialogTitle>Edit Property Group</DialogTitle>
                          <DialogDescription>
                            Update the details for this property group.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input
                              id="name"
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              required
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                              id="description"
                              value={editFormData.description}
                              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              className="resize-none"
                              rows={4}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </ContentTransition>
                
                <ContentTransition delay={0.4} direction="left">
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Property Group</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this property group? This action cannot be undone.
                          {properties.length > 0 && (
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-amber-800 font-medium">Warning</p>
                                <p className="text-amber-700">
                                  This group contains {properties.length} {properties.length === 1 ? 'property' : 'properties'}. 
                                  Deleting this group will remove the group assignment for these properties, but will not delete the properties themselves.
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteGroup}>
                          Delete Group
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </ContentTransition>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="properties" className="space-y-4">
            <TabsList>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Properties in Group</h2>
                <BatchPropertyAssigner 
                  groupId={parseInt(id)} 
                  onSuccess={handleBatchAssignmentSuccess}
                />
              </div>
              
              {properties.length > 0 && (
                <Card className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <h3 className="font-medium text-lg mb-1">Compliance Summary</h3>
                        <p className="text-sm text-muted-foreground">
                          Overall compliance status for {properties.length} {properties.length === 1 ? 'property' : 'properties'} in this group
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          Last updated: {new Date().toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <ComplianceStatusBar properties={properties} />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {isLoadingProperties ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading properties...</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <HomeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No properties in this group</h3>
                  <p className="text-muted-foreground mb-4">
                    Add properties to this group to manage them together.
                  </p>
                  <BatchPropertyAssigner 
                    groupId={parseInt(id)} 
                    onSuccess={handleBatchAssignmentSuccess}
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Properties
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <SharedLayoutTransition key={property.id} id={`property-card-${property.id}`} withScale duration={0.5}>
                      <Card className="overflow-hidden h-full">
                        <div className="h-2" style={{ 
                          backgroundColor: property.riskLevel === 'high' ? 'var(--brand-rust)' : 
                                        property.riskLevel === 'medium' ? 'var(--brand-gold)' :
                                        'var(--brand-green)'
                        }} />
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-lg">{property.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
                              {getStatusBadge(property.status)}
                            </div>
                          </div>
                          
                          {property.description && (
                            <p className="text-sm text-muted-foreground mb-4">{property.description}</p>
                          )}
                          
                          <div className="flex justify-end mt-4">
                            <Link 
                              href={`/properties/${property.id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              View Property Details
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </SharedLayoutTransition>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Group Settings</h3>
                  <p className="text-muted-foreground mb-4">
                    Manage settings for this property group. Additional configuration options will be available in future updates.
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <h4 className="font-medium mb-2">Group Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-500">Group Name</div>
                          <div className="font-medium">{group.name}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-500">Creation Date</div>
                          <div className="font-medium">
                            {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Not available'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={() => setEditDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Group
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PropertyTransition>
  );
};

export default PropertyGroupDetail;