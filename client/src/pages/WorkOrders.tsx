import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, Clock, AlertCircle, CircleDashed, CircleDot } from 'lucide-react';
import { insertWorkOrderSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WorkOrderPriority, WorkOrderSource, WorkOrderStatus, type WorkOrder, type Property } from '@shared/schema';

// Define interfaces for type safety
interface PropertyListItem extends Property {}
interface WorkOrderListItem extends WorkOrder {
  propertyName?: string; // Additional field that might be populated from the API
}

// Extend the insert schema with additional validations for the form
const createWorkOrderSchema = insertWorkOrderSchema.extend({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
});

type FormValues = z.infer<typeof createWorkOrderSchema>;

// Helper to format dates for display
const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    // Check if valid date
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'dd MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid date';
  }
};

// Helper to convert a date to a valid HTML date input value (YYYY-MM-DD)
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    // Check if valid date
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error, date);
    return '';
  }
};

// Helper function to get badge styling for different statuses
const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">New</Badge>;
    case "assigned":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Assigned</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">In Progress</Badge>;
    case "on_hold":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">On Hold</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Completed</Badge>;
    case "closed":
      return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">Closed</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function to get badge styling for different priorities
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "emergency":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Emergency</Badge>;
    case "high":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

// Helper function to get icon for status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "new":
      return <CircleDashed className="mr-1 h-4 w-4" />;
    case "assigned":
      return <CircleDot className="mr-1 h-4 w-4" />;
    case "in_progress":
      return <Clock className="mr-1 h-4 w-4" />;
    case "completed":
      return <CheckCircle2 className="mr-1 h-4 w-4" />;
    default:
      return <AlertCircle className="mr-1 h-4 w-4" />;
  }
};

// Work order creation form component
const CreateWorkOrderForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get properties for property selection dropdown
  const { data: properties = [] } = useQuery<PropertyListItem[]>({
    queryKey: ['/api/properties'],
    throwOnError: false
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: "medium",
      status: "new",
      source: "staff_report",
    }
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return apiRequest('/api/work-orders', {
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: "Work Order Created",
        description: "The work order has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create work order",
        description: error.message || "An error occurred while creating the work order.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    createWorkOrderMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter work order title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter detailed description of the work needed" 
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property: PropertyListItem) => (
                      <SelectItem 
                        key={property.id} 
                        value={property.id.toString()}
                      >
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sensor_alert">Sensor Alert</SelectItem>
                    <SelectItem value="tenant_report">Tenant Report</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="scheduled_maintenance">Scheduled Maintenance</SelectItem>
                    <SelectItem value="staff_report">Staff Report</SelectItem>
                    <SelectItem value="external_system">External System</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="estimatedCompletionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Completion Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      {...field}
                      value={formatDateForInput(field.value)}
                      onChange={(e) => {
                        // Handle empty string or invalid date
                        if (!e.target.value) {
                          field.onChange(null);
                          return;
                        }
                        
                        try {
                          // Create a date object from the input value
                          const date = new Date(e.target.value);
                          // Check if the date is valid before setting it
                          if (!isNaN(date.getTime())) {
                            field.onChange(date);
                          }
                        } catch (error) {
                          console.error('Error parsing date:', error);
                          // If there's an error, don't update the field
                        }
                      }}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter>
          <Button
            type="submit"
            disabled={createWorkOrderMutation.isPending}
          >
            {createWorkOrderMutation.isPending ? "Creating..." : "Create Work Order"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Main Work Orders page component
const WorkOrders = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: workOrders = [], isLoading, error } = useQuery<WorkOrderListItem[]>({
    queryKey: ['/api/work-orders'],
    throwOnError: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <CardTitle>Loading Work Orders</CardTitle>
            <CardDescription>Please wait while we fetch the work orders...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load work orders. Please try again.",
      variant: "destructive"
    });
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Work Order</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new work order for a property.
              </DialogDescription>
            </DialogHeader>
            <CreateWorkOrderForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
          <CardDescription>Manage and track all maintenance and repair work orders across your properties.</CardDescription>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No work orders found. Create your first work order to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((workOrder: WorkOrderListItem) => (
                    <TableRow key={workOrder.id}>
                      <TableCell className="font-medium">#{workOrder.id}</TableCell>
                      <TableCell>{workOrder.title}</TableCell>
                      <TableCell>{workOrder.propertyName || `Property ID: ${workOrder.propertyId}`}</TableCell>
                      <TableCell>{getPriorityBadge(workOrder.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(workOrder.status)}
                          {getStatusBadge(workOrder.status)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(workOrder.createdAt)}</TableCell>
                      <TableCell>{formatDate(workOrder.estimatedCompletionDate)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/work-orders/${workOrder.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrders;