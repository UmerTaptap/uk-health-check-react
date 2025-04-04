import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, ArrowLeft, CalendarIcon, CheckCircle2, Clock, Wrench, 
  FileText, MessageSquare, History, CircleDashed, CircleDot
} from 'lucide-react';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { type WorkOrder, type WorkOrderHistory as WorkOrderHistoryType } from '@shared/schema';

// Define interfaces for type safety
interface WorkOrderDetail extends WorkOrder {
  propertyName?: string; // Additional field that might be populated from the API
  completionDate?: Date | string | null; // Alias for actualCompletionDate in some parts of the UI
  
  // Additional fields that are used in the UI but might not be in the database schema
  assignedStaffId?: number | null; // Staff ID of assigned person (may differ from assignedTo user ID)
  dueDate?: Date | string | null; // Due date separate from estimatedCompletionDate
  scheduledDate?: Date | string | null; // Date when work is scheduled to be performed
}
interface WorkOrderHistoryItem extends WorkOrderHistoryType {}

// Helper to format dates for display
const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    // Check if valid date
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'dd MMM yyyy, HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid date';
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
    case 'emergency':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Emergency</Badge>;
    case 'high':
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
    case 'low':
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

// Schema for updating work order status
const updateStatusSchema = z.object({
  status: z.string({
    required_error: "Please select a status",
  }),
  comment: z.string().min(2, {
    message: "Comment must be at least 2 characters",
  }),
});

type UpdateStatusValues = z.infer<typeof updateStatusSchema>;

// Update status form component
const UpdateStatusForm = ({ workOrder, onSuccess }: { workOrder: WorkOrderDetail, onSuccess: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<UpdateStatusValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: workOrder.status,
      comment: '',
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: UpdateStatusValues) => {
      // First update the work order status
      await apiRequest(`/api/work-orders/${workOrder.id}`, {
        method: 'PATCH',
        data: { status: data.status }
      });
      
      // Then add a history entry
      return apiRequest(`/api/work-orders/${workOrder.id}/history`, {
        method: 'POST',
        data: {
          comment: data.comment,
          statusChange: data.status,
          // In a real app, we would get user ID from auth context
          userId: 1
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "The work order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrder.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrder.id}/history`] });
      form.reset({ status: form.getValues().status, comment: '' });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message || "An error occurred while updating the status.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: UpdateStatusValues) => {
    // Only update if status changed or comment provided
    if (data.status !== workOrder.status || data.comment.trim() !== '') {
      updateStatusMutation.mutate(data);
    } else {
      toast({
        title: "No changes",
        description: "Please change the status or add a comment before updating.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Status</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add a comment about this status change"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button
            type="submit"
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Add comment form schema
const addCommentSchema = z.object({
  comment: z.string().min(2, {
    message: "Comment must be at least 2 characters",
  }),
});

type AddCommentValues = z.infer<typeof addCommentSchema>;

// Add comment form component
const AddCommentForm = ({ workOrderId, onSuccess }: { workOrderId: number, onSuccess: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<AddCommentValues>({
    resolver: zodResolver(addCommentSchema),
    defaultValues: {
      comment: '',
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: AddCommentValues) => {
      return apiRequest(`/api/work-orders/${workOrderId}/history`, {
        method: 'POST',
        data: {
          comment: data.comment,
          // In a real app, we would get user ID from auth context
          userId: 1
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the work order history.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrderId}/history`] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add comment",
        description: error.message || "An error occurred while adding your comment.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AddCommentValues) => {
    addCommentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Comment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add a comment to this work order"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          disabled={addCommentMutation.isPending}
          className="w-full"
        >
          {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
        </Button>
      </form>
    </Form>
  );
};

// Schema for assigning staff to work order
const assignStaffSchema = z.object({
  staffId: z.number({
    required_error: "Please select a staff member",
  }),
  comment: z.string().min(2, {
    message: "Comment must be at least 2 characters",
  }),
});

type AssignStaffValues = z.infer<typeof assignStaffSchema>;

// Assign staff form component
const AssignStaffForm = ({ workOrderId, onSuccess }: { workOrderId: number, onSuccess: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch staff members
  const { data: staffMembers = [] } = useQuery<any[]>({
    queryKey: ['/api/staff'],
  });
  
  const form = useForm<AssignStaffValues>({
    resolver: zodResolver(assignStaffSchema),
    defaultValues: {
      comment: '',
    }
  });

  const assignStaffMutation = useMutation({
    mutationFn: async (data: AssignStaffValues) => {
      // Update the work order with assigned staff
      await apiRequest(`/api/work-orders/${workOrderId}`, {
        method: 'PATCH',
        data: { assignedStaffId: data.staffId, status: "assigned" }
      });
      
      // Add history entry
      return apiRequest(`/api/work-orders/${workOrderId}/history`, {
        method: 'POST',
        data: {
          comment: data.comment,
          statusChange: "assigned",
          userId: 1 // In a real app, get from auth context
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Staff Assigned",
        description: "The work order has been assigned to staff successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrderId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrderId}/history`] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign staff",
        description: error.message || "An error occurred while assigning staff.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AssignStaffValues) => {
    assignStaffMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="staffId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff Member</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staffMembers.map((staff: any) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name} - {staff.jobTitle}
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
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add a comment about this assignment"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button
            type="submit"
            disabled={assignStaffMutation.isPending}
          >
            {assignStaffMutation.isPending ? "Assigning..." : "Assign Staff"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Schema for scheduling work
const scheduleWorkSchema = z.object({
  scheduledDate: z.date({
    required_error: "Please select a date",
  }),
  comment: z.string().min(2, {
    message: "Comment must be at least 2 characters",
  }),
});

type ScheduleWorkValues = z.infer<typeof scheduleWorkSchema>;

// Schedule work form component
const ScheduleWorkForm = ({ workOrderId, onSuccess }: { workOrderId: number, onSuccess: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const form = useForm<ScheduleWorkValues>({
    resolver: zodResolver(scheduleWorkSchema),
    defaultValues: {
      comment: '',
      scheduledDate: new Date(),
    }
  });

  const scheduleWorkMutation = useMutation({
    mutationFn: async (data: ScheduleWorkValues) => {
      // Update the work order with scheduled date
      return apiRequest(`/api/work-orders/${workOrderId}`, {
        method: 'PATCH',
        data: { 
          scheduledDate: data.scheduledDate.toISOString(),
          comment: data.comment
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Work Scheduled",
        description: "The work order has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrderId}`] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to schedule work",
        description: error.message || "An error occurred while scheduling the work.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ScheduleWorkValues) => {
    scheduleWorkMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="scheduledDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        field.onChange(date);
                        setDate(date);
                      }
                    }}
                    disabled={(date: Date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add notes about this scheduled work"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button
            type="submit"
            disabled={scheduleWorkMutation.isPending}
          >
            {scheduleWorkMutation.isPending ? "Scheduling..." : "Schedule Work"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Schema for recording costs
const recordCostsSchema = z.object({
  amount: z.number({
    required_error: "Please enter an amount",
  }).min(0.01, {
    message: "Amount must be greater than 0",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters",
  }),
  category: z.string({
    required_error: "Please select a category",
  }),
});

type RecordCostsValues = z.infer<typeof recordCostsSchema>;

// Record costs form component
const RecordCostsForm = ({ workOrderId, onSuccess }: { workOrderId: number, onSuccess: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<RecordCostsValues>({
    resolver: zodResolver(recordCostsSchema),
    defaultValues: {
      amount: 0,
      description: '',
      category: 'labour',
    }
  });

  const recordCostsMutation = useMutation({
    mutationFn: async (data: RecordCostsValues) => {
      return apiRequest(`/api/work-orders/${workOrderId}/costs`, {
        method: 'POST',
        data: {
          amount: Math.round(data.amount * 100), // Convert to pennies
          description: data.description,
          costType: data.category, // Map category to costType field
          date: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Costs Recorded",
        description: "The costs have been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrderId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${workOrderId}/costs`] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record costs",
        description: error.message || "An error occurred while recording costs.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: RecordCostsValues) => {
    recordCostsMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (£)</FormLabel>
              <FormControl>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="labour">Labour</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="contractor">Contractor Fees</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Describe the costs"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button
            type="submit"
            disabled={recordCostsMutation.isPending}
          >
            {recordCostsMutation.isPending ? "Recording..." : "Record Costs"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Main WorkOrderDetail component
const WorkOrderDetail = () => {
  const [, params] = useRoute<{ id: string }>('/work-orders/:id');
  const [, setLocation] = useLocation();
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const { toast } = useToast();
  const id = params?.id;
  
  // Fetch work order details
  const { 
    data: workOrder = {} as WorkOrderDetail, 
    isLoading: isLoadingWorkOrder,
    error: workOrderError,
    refetch: refetchWorkOrder
  } = useQuery<WorkOrderDetail>({
    queryKey: [`/api/work-orders/${id}`],
    throwOnError: false,
    enabled: !!id
  });

  // Fetch work order history
  const { 
    data: history = [] as WorkOrderHistoryItem[], 
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery<WorkOrderHistoryItem[]>({
    queryKey: [`/api/work-orders/${id}/history`],
    throwOnError: false,
    enabled: !!id
  });

  // Handle loading state
  if (isLoadingWorkOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <CardTitle>Loading Work Order</CardTitle>
            <CardDescription>Please wait while we fetch the work order details...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (workOrderError || !workOrder) {
    toast({
      title: "Error",
      description: "Failed to load work order details. Please try again.",
      variant: "destructive"
    });
    
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => setLocation('/work-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
        </Button>
        
        <Card className="mt-4">
          <CardHeader className="text-center">
            <CardTitle>Work Order Not Found</CardTitle>
            <CardDescription>The requested work order could not be found or an error occurred.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => refetchWorkOrder()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => setLocation('/work-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
        </Button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main work order details */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Work Order #{workOrder.id}: {workOrder.title}</CardTitle>
                  <div className="flex items-center mt-2 space-x-2">
                    {getPriorityBadge(workOrder.priority)}
                    <div className="flex items-center">
                      {getStatusIcon(workOrder.status)}
                      {getStatusBadge(workOrder.status)}
                    </div>
                  </div>
                </div>
                
                <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Update Status</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Work Order Status</DialogTitle>
                      <DialogDescription>
                        Change the status of this work order and add a comment to explain the change.
                      </DialogDescription>
                    </DialogHeader>
                    <UpdateStatusForm 
                      workOrder={workOrder} 
                      onSuccess={() => setUpdateStatusDialogOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">
                    <FileText className="mr-2 h-4 w-4" /> Details
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="mr-2 h-4 w-4" /> History
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    <MessageSquare className="mr-2 h-4 w-4" /> Comments
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="mt-2">{workOrder.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Property</h3>
                      {workOrder.propertyId ? (
                        <a 
                          href={`/properties/${workOrder.propertyId}`}
                          className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {workOrder.propertyName || `Property ID: ${workOrder.propertyId}`}
                          <ArrowLeft className="ml-1 h-3 w-3 rotate-225" />
                        </a>
                      ) : (
                        <p className="mt-1">N/A</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                      <p className="mt-1">{workOrder.assignedStaffId || 'Not assigned'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                      <p className="mt-1">{formatDate(workOrder.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                      <p className="mt-1">{getPriorityBadge(workOrder.priority)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                      <p className="mt-1">{formatDate(workOrder.dueDate) || 'No due date set'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Scheduled Date</h3>
                      <p className="mt-1">{formatDate(workOrder.scheduledDate) || 'Not scheduled'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Completed Date</h3>
                      <p className="mt-1">{formatDate(workOrder.actualCompletionDate) || 'Not completed'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Source</h3>
                      <p className="mt-1">{workOrder.source}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4 mt-4">
                  {isLoadingHistory ? (
                    <div className="text-center py-4">Loading history...</div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No history available</div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((entry: WorkOrderHistoryItem) => (
                        <div key={entry.id} className="border-b pb-2">
                          <div className="flex justify-between">
                            <p className="font-medium">
                              {entry.statusChange ? (
                                <span>Status changed to <span className="font-bold">{entry.statusChange}</span></span>
                              ) : (
                                <span>Comment added</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(entry.createdAt)}</p>
                          </div>
                          <p className="mt-1">{entry.comment}</p>
                          <p className="mt-1 text-sm text-gray-500">By: User ID {entry.userId}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="comments" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <AddCommentForm 
                      workOrderId={workOrder.id} 
                      onSuccess={() => refetchHistory()} 
                    />
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-3">Comments & Notes</h3>
                      
                      {isLoadingHistory ? (
                        <div className="text-center py-4">Loading comments...</div>
                      ) : history.filter((entry: WorkOrderHistoryItem) => !entry.statusChange).length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No comments available</div>
                      ) : (
                        <div className="space-y-4">
                          {history
                            .filter((entry: WorkOrderHistoryItem) => !entry.statusChange)
                            .map((entry: WorkOrderHistoryItem) => (
                              <div key={entry.id} className="border-b pb-2">
                                <div className="flex justify-between">
                                  <p className="font-medium">Comment</p>
                                  <p className="text-sm text-gray-500">{formatDate(entry.createdAt)}</p>
                                </div>
                                <p className="mt-1">{entry.comment}</p>
                                <p className="mt-1 text-sm text-gray-500">By: User ID {entry.userId}</p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" /> Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-gray-500">{formatDate(workOrder.createdAt)}</p>
                  </div>
                </div>
                
                {workOrder.status !== "new" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <CircleDot className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Assigned</p>
                      <p className="text-sm text-gray-500">
                        {history.find((h: WorkOrderHistoryItem) => h.statusChange === "assigned")
                          ? formatDate(history.find((h: WorkOrderHistoryItem) => h.statusChange === "assigned")?.createdAt)
                          : 'Date unknown'}
                      </p>
                    </div>
                  </div>
                )}
                
                {(workOrder.status === "in_progress" || 
                  workOrder.status === "completed" || 
                  workOrder.status === "closed") && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">In Progress</p>
                      <p className="text-sm text-gray-500">
                        {history.find((h: WorkOrderHistoryItem) => h.statusChange === "in_progress")
                          ? formatDate(history.find((h: WorkOrderHistoryItem) => h.statusChange === "in_progress")?.createdAt)
                          : 'Date unknown'}
                      </p>
                    </div>
                  </div>
                )}
                
                {(workOrder.status === "completed" || 
                  workOrder.status === "closed") && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-sm text-gray-500">
                        {history.find((h: WorkOrderHistoryItem) => h.statusChange === "completed")
                          ? formatDate(history.find((h: WorkOrderHistoryItem) => h.statusChange === "completed")?.createdAt)
                          : formatDate(workOrder.actualCompletionDate) || 'Date unknown'}
                      </p>
                    </div>
                  </div>
                )}
                
                {workOrder.status === "closed" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <CheckCircle2 className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">Closed</p>
                      <p className="text-sm text-gray-500">
                        {history.find((h: WorkOrderHistoryItem) => h.statusChange === "closed")
                          ? formatDate(history.find((h: WorkOrderHistoryItem) => h.statusChange === "closed")?.createdAt)
                          : 'Date unknown'}
                      </p>
                    </div>
                  </div>
                )}
                
                {workOrder.status === "cancelled" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Cancelled</p>
                      <p className="text-sm text-gray-500">
                        {history.find((h: WorkOrderHistoryItem) => h.statusChange === "cancelled")
                          ? formatDate(history.find((h: WorkOrderHistoryItem) => h.statusChange === "cancelled")?.createdAt)
                          : 'Date unknown'}
                      </p>
                    </div>
                  </div>
                )}
                
                {workOrder.status === "on_hold" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <AlertCircle className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">On Hold</p>
                      <p className="text-sm text-gray-500">
                        {history.find((h: WorkOrderHistoryItem) => h.statusChange === "on_hold")
                          ? formatDate(history.find((h: WorkOrderHistoryItem) => h.statusChange === "on_hold")?.createdAt)
                          : 'Date unknown'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5" /> Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Assign to Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Work Order to Staff</DialogTitle>
                    <DialogDescription>
                      Select a staff member to assign this work order to.
                    </DialogDescription>
                  </DialogHeader>
                  <AssignStaffForm workOrderId={workOrder.id} onSuccess={() => refetchWorkOrder()} />
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Schedule Work
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Work</DialogTitle>
                    <DialogDescription>
                      Set a date and time for this work order to be completed.
                    </DialogDescription>
                  </DialogHeader>
                  <ScheduleWorkForm workOrderId={workOrder.id} onSuccess={() => refetchWorkOrder()} />
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Record Costs
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Costs</DialogTitle>
                    <DialogDescription>
                      Add cost information for this work order.
                    </DialogDescription>
                  </DialogHeader>
                  <RecordCostsForm workOrderId={workOrder.id} onSuccess={() => refetchWorkOrder()} />
                </DialogContent>
              </Dialog>
              <Separator />
              <Button className="w-full" variant="destructive">
                Cancel Work Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetail;